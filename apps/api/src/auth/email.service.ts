import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT') ?? 587,
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendOtp(input: { to: string; otp: string }): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') ?? 'noreply@visibloai.com';

    if (!this.transporter) {
      this.logger.warn(
        'SMTP not configured; OTP delivery unavailable',
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"VisibloAI" <${from}>`,
        to: input.to,
        subject: 'Your Verification Code — VisibloAI',
        html: `
          <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #0B2E6B; margin-bottom: 8px;">Verify Your Identity</h2>
            <p style="color: #555; margin-bottom: 24px;">Use the following code to complete your login:</p>
            <div style="background: #E6F3FF; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0B2E6B;">${input.otp}</span>
            </div>
            <p style="color: #888; font-size: 13px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 12px;">VisibloAI — Field Sales CRM</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.warn(
        'OTP email delivery failed',
      );
    }
  }

  async sendPasswordResetLink(input: {
    to: string;
    resetUrl: string;
  }): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') ?? 'noreply@visibloai.com';

    if (!this.transporter) {
      this.logger.warn(
        'SMTP not configured; password-reset delivery unavailable',
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"VisibloAI" <${from}>`,
        to: input.to,
        subject: 'Reset Your Password — VisibloAI',
        html: `
          <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #0B2E6B; margin-bottom: 8px;">Reset Your Password</h2>
            <p style="color: #555; margin-bottom: 24px;">Click the button below to reset your password. This link expires in 30 minutes.</p>
            <a href="${input.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #123A8F, #00C2A8); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
            <p style="color: #888; font-size: 13px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 12px;">VisibloAI — Field Sales CRM</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.warn(
        'Password-reset email delivery failed',
      );
    }
  }

}
