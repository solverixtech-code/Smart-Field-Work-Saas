import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma.service';
import { PlanPublicationPolicyService } from './plan-publication-policy.service';
import { PlanQueryService } from './plan-query.service';
import { PlatformPlansService } from './platform-plans.service';
import { classifyPlanTransactionError } from './plan-transaction-error';

function rawFailure(code: string) {
  return new Prisma.PrismaClientKnownRequestError('Raw query failed', {
    code: 'P2010',
    clientVersion: Prisma.prismaVersion.client,
    meta: {
      code,
      message:
        code === '40001'
          ? 'could not serialize access due to concurrent update'
          : 'database rejected transaction',
    },
  });
}

describe('Plan transaction error classification', () => {
  it.each(['40001', '40P01'])(
    'recognizes raw SQLSTATE %s independently of message wording',
    (code) => {
      expect(classifyPlanTransactionError(rawFailure(code))).toBe('RETRYABLE');
    },
  );
  it.each([
    null,
    undefined,
    '40001',
    { code: 'P2010', meta: null },
    { code: 'P2010', meta: { code: 40001 } },
    { code: 'P2010', meta: { code: '23514' } },
  ])('does not retry unrelated/malformed errors: %p', (error) => {
    expect(classifyPlanTransactionError(error)).toBe('OTHER');
  });
  it.each(['serialization', 'deadlock', 'write conflict'])(
    'preserves the existing %s fallback',
    (message) => {
      expect(classifyPlanTransactionError(new Error(message))).toBe(
        'RETRYABLE',
      );
    },
  );
});

describe('PlatformPlansService bounded transaction retry contract', () => {
  let module: TestingModule;
  let service: PlatformPlansService;
  const transaction = jest.fn<Promise<unknown>, [unknown, unknown]>();
  // The transaction callback/business DTOs are covered by the unchanged E2E suite.
  const committedResult = Object.freeze({ id: 'committed-version-id' });
  const commands = [
    {
      name: 'allocate draft',
      run: () => service.createNextDraft('plan-id'),
      conflict: "Draft version allocation conflict for plan 'plan-id'",
    },
    {
      name: 'update draft',
      run: () => service.updateDraft('plan-id', 'version-id', {}),
      conflict: "Update conflict for plan 'plan-id'",
    },
    {
      name: 'publish',
      run: () => service.publishPlanVersion('plan-id', 'version-id'),
      conflict: "Publication conflict for plan 'plan-id'",
    },
  ];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PlatformPlansService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: transaction,
            planVersion: {
              findUnique: jest
                .fn()
                .mockResolvedValue({
                  plan: { currentPublishedVersionId: null },
                }),
            },
          },
        },
        { provide: PlanPublicationPolicyService, useValue: {} },
        {
          provide: PlanQueryService,
          useValue: {
            formatVersion: jest.fn().mockReturnValue(committedResult),
          },
        },
      ],
    }).compile();
    service = module.get(PlatformPlansService);
  });
  beforeEach(() => {
    transaction.mockReset();
    transaction.mockResolvedValue(committedResult);
  });
  afterAll(async () => {
    await module.close();
  });

  describe.each(commands)('$name', ({ run, conflict }) => {
    it.each(['40001', '40P01'])(
      'retries the complete transaction for P2010/%s and preserves its result',
      async (code) => {
        transaction
          .mockRejectedValueOnce(rawFailure(code))
          .mockRejectedValueOnce(rawFailure(code));
        await expect(run()).resolves.toBe(committedResult);
        expect(transaction).toHaveBeenCalledTimes(3);
        for (const [, options] of transaction.mock.calls)
          expect(options).toEqual({ isolationLevel: 'Serializable' });
      },
    );
    it.each(['40001', '40P01'])(
      'returns the existing safe 409 after three P2010/%s attempts',
      async (code) => {
        transaction.mockRejectedValue(rawFailure(code));
        await expect(run()).rejects.toMatchObject({
          message: conflict,
          status: 409,
        });
        expect(transaction).toHaveBeenCalledTimes(3);
      },
    );
    it('preserves P2034 retry behavior', async () => {
      transaction.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Conflict', {
          code: 'P2034',
          clientVersion: Prisma.prismaVersion.client,
        }),
      );
      await expect(run()).resolves.toBe(committedResult);
      expect(transaction).toHaveBeenCalledTimes(2);
    });
    it('preserves immediate unique-conflict handling', async () => {
      transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Duplicate', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client,
        }),
      );
      await expect(run()).rejects.toBeInstanceOf(ConflictException);
      expect(transaction).toHaveBeenCalledTimes(1);
    });
    it.each([rawFailure('23514'), new NotFoundException('Missing version')])(
      'propagates non-retryable errors unchanged',
      async (error) => {
        transaction.mockRejectedValue(error);
        await expect(run()).rejects.toBe(error);
        expect(transaction).toHaveBeenCalledTimes(1);
      },
    );
  });
  it('preserves the draft-allocation-specific conflict response without retrying', async () => {
    transaction.mockRejectedValue(
      new ConflictException('Plan already has an active DRAFT'),
    );
    await expect(service.createNextDraft('plan-id')).rejects.toMatchObject({
      message: commands[0].conflict,
      status: 409,
    });
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
