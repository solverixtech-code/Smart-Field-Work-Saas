import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(input: { mobile: string; otp: string }): Promise<void> {
    const providerUrl = this.configService.get<string>('SMS_PROVIDER_URL');
    const username = this.configService.get<string>('SMS_USERNAME');
    const apiKey = this.configService.get<string>('SMS_API_KEY');
    const sender = this.configService.get<string>('SMS_SENDER');

    if (!providerUrl || !username || !apiKey || !sender) {
      this.logger.warn(
        'SMS not configured; OTP delivery unavailable',
      );
      return;
    }

    const route = this.configService.get<string>('SMS_ROUTE') ?? 'ServiceImplicit';
    const url = new URL(providerUrl);
    url.searchParams.set('username', username);
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('apirequest', 'Text');
    url.searchParams.set('route', route);
    url.searchParams.set('sender', sender);
    url.searchParams.set('mobile', this.normalizeProviderMobile(input.mobile));
    url.searchParams.set(
      'message',
      `Your VisibloAI verification code is ${input.otp}. Valid for 5 minutes.`,
    );

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SMS provider returned HTTP ${response.status}`);
      }
      this.logger.log(`OTP SMS sent to ${this.maskMobile(input.mobile)}`);
    } catch (error) {
      this.logger.warn(
        'OTP SMS delivery failed',
      );
    }
  }

  private maskMobile(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return '****';
    return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
  }

  private normalizeProviderMobile(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits.slice(2);
    }
    return digits;
  }
}
