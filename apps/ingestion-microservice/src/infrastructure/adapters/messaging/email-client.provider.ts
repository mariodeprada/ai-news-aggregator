import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { getEmailConfig } from '../../config/email.config';

@Injectable()
export class EmailClientProvider {
  private transporter: Transporter | null = null;

  getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const config = getEmailConfig();
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth:
        config.smtpUser || config.smtpPass
          ? {
              user: config.smtpUser,
              pass: config.smtpPass,
            }
          : undefined,
    });

    return this.transporter;
  }
}
