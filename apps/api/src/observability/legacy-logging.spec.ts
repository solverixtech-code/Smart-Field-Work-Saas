import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../auth/email.service';
import { SmsService } from '../auth/sms.service';
import { SafeNestLogger } from './safe-nest-logger';

describe('Legacy producer secret suppression', () => {
  afterEach(() => jest.restoreAllMocks());
  it('does not print OTPs or reset links when providers are disabled', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const email = new EmailService(new ConfigService({}));
    await email.sendOtp({ to: 'recipient@test.invalid', otp: '654321' });
    await email.sendPasswordResetLink({ to: 'recipient@test.invalid', resetUrl: 'https://test.invalid/reset?token=secret-marker' });
    await new SmsService(new ConfigService({})).sendOtp({ mobile: '9999999999', otp: '654321' });
    const logs = JSON.stringify(warn.mock.calls);
    expect(warn).toHaveBeenCalledTimes(3);
    expect(logs).not.toContain('654321'); expect(logs).not.toContain('secret-marker'); expect(logs).not.toContain('recipient@test.invalid');
  });
  it('does not serialize driver error input, while keeping internal source frames', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    new SafeNestLogger().error('passwordHash: secret-marker', 'Error: passwordHash: secret-marker\n    at execute (/srv/api/service.ts:12:3)');
    const output = String(write.mock.calls[0][0]);
    expect(output).not.toContain('secret-marker'); expect(output).toContain('APPLICATION_ERROR'); expect(output).toContain('service.ts:12:3');
  });
});
