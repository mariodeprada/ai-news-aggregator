import { Module } from '@nestjs/common';
import { NotificationPort } from '../../core/domain/ports/notification.port';
import { EmailClientProvider } from '../adapters/messaging/email-client.provider';
import { EmailNotificationAdapter } from '../adapters/messaging/email-notification.adapter';
import { ReviewTokenService } from '../adapters/messaging/review-token.service';

@Module({
  providers: [
    EmailClientProvider,
    ReviewTokenService,
    {
      provide: NotificationPort,
      useClass: EmailNotificationAdapter,
    },
  ],
  exports: [NotificationPort, ReviewTokenService],
})
export class MessagingModule {}
