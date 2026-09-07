import { readFileSync } from 'fs';
import { resolve } from 'path';
import ts from 'typescript';
import { MODULE_REGISTRY } from '../modules/feature-registry';
import { INDUSTRY_CANDIDATES } from './industry-candidates';
import { industryCandidatesSchema } from './industry-import.service';
import {
  createIndustry,
  industryMappings,
  industrySnapshot,
  publishIndustry,
} from './industry-contract';
import { payloadHash } from '../subscriptions/subscription-contract';

describe('Industry contracts and reviewed candidate provenance', () => {
  const snapshot = {
    schemaVersion: 1,
    terminology: {},
    masterDefaults: [],
    recommendedModuleCodes: ['core_crm'],
  };
  it('accepts only the explicitly supported snapshot schema and rejects invented keys', () => {
    expect(industrySnapshot.parse(snapshot)).toEqual(snapshot);
    for (const input of [
      { ...snapshot, schemaVersion: 2 },
      { ...snapshot, terminology: { lead: 'Invented' } },
      { ...snapshot, masterDefaults: [{ code: 'invented' }] },
      { ...snapshot, grants: ['payroll'] },
      { ...snapshot, recommendedModuleCodes: ['core_crm', 'core_crm'] },
    ])
      expect(industrySnapshot.safeParse(input).success).toBe(false);
  });
  it('normalizes stable Industry identity and requires explicit publication approval', () => {
    expect(
      createIndustry.parse({
        code: ' pharma ',
        name: 'Name',
        category: 'Category',
        description: 'Description',
      }).code,
    ).toBe('PHARMA');
    expect(
      publishIndustry.safeParse({ expectedRevision: 1, reason: 'Publish' })
        .success,
    ).toBe(false);
    expect(
      publishIndustry.safeParse({
        expectedRevision: 1,
        reason: 'Publish',
        approvalReference: ' ',
      }).success,
    ).toBe(false);
  });
  it('reviews 25 candidates and 69 registered recommendations without silently dropping fields', () => {
    const rows = industryCandidatesSchema.parse(INDUSTRY_CANDIDATES);
    expect(rows).toHaveLength(25);
    expect(rows.flatMap((r) => r.defaultModules)).toHaveLength(69);
    const registered = new Set(MODULE_REGISTRY.map((m) => m.code));
    expect(
      rows.every((r) => r.defaultModules.every((code) => registered.has(code))),
    ).toBe(true);
    const source = ts.createSourceFile(
      'fixtures.ts',
      readFileSync(
        resolve(
          __dirname,
          '../../../../web/src/features/platform/tenants/fixtures/platform.fixtures.ts',
        ),
        'utf8',
      ),
      ts.ScriptTarget.Latest,
      true,
    );
    let initializer: ts.Expression | undefined;
    source.forEachChild((node) => {
      if (ts.isVariableStatement(node))
        for (const declaration of node.declarationList.declarations) {
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.name.text === 'PLATFORM_INDUSTRIES'
          )
            initializer = declaration.initializer;
        }
    });
    if (!initializer || !ts.isArrayLiteralExpression(initializer))
      throw new Error('Industry fixture literal is missing');
    const literal = (node: ts.Node): unknown => {
      if (ts.isStringLiteral(node)) return node.text;
      if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
      if (ts.isObjectLiteralExpression(node))
        return Object.fromEntries(
          node.properties.map((property) => {
            if (
              !ts.isPropertyAssignment(property) ||
              !ts.isIdentifier(property.name)
            )
              throw new Error('Unreviewed fixture shape');
            return [property.name.text, literal(property.initializer)];
          }),
        );
      throw new Error('Unreviewed fixture value');
    };
    expect(industryCandidatesSchema.parse(literal(initializer))).toEqual(rows);
  });
  it('normalizes only known obsolete aliases and rejects duplicate or unreviewed fixture fields', () => {
    const row = INDUSTRY_CANDIDATES[0];
    expect(
      industryCandidatesSchema.parse([
        { ...row, defaultModules: ['attendance_plus', 'payroll_engine'] },
      ])[0].defaultModules,
    ).toEqual(['attendance', 'payroll']);
    expect(
      industryCandidatesSchema.safeParse([
        { ...row, defaultModules: ['attendance_plus', 'attendance'] },
      ]).success,
    ).toBe(false);
    expect(industryCandidatesSchema.safeParse([row, row]).success).toBe(false);
    expect(
      industryCandidatesSchema.safeParse([{ ...row, terminology: {} }]).success,
    ).toBe(false);
  });
  it('hashes mapping order canonically and rejects duplicate Tenant IDs', () => {
    const first = {
      tenantId: '9a62a5a9-becd-4bba-9996-cd271eabcde1',
      industryTemplateVersionId: '9a62a5a9-becd-4bba-9996-cd271eabcde2',
      reason: 'Reviewed migration',
    };
    const second = {
      ...first,
      tenantId: '9a62a5a9-becd-4bba-9996-cd271eabcde3',
    };
    expect(payloadHash(industryMappings.parse([first, second]))).toBe(
      payloadHash(industryMappings.parse([second, first])),
    );
    expect(industryMappings.safeParse([first, first]).success).toBe(false);
  });
});
