import {
  ArticleNotificationData,
  NotificationPort,
} from '../../ports/notification.port';

export class InMemoryNotificationRepository implements NotificationPort {
  private sentNotifications: ArticleNotificationData[][] = [];

  async sendBatchNotification(
    articles: ArticleNotificationData[],
  ): Promise<void> {
    this.sentNotifications.push(articles);
  }

  getSentNotifications(): ArticleNotificationData[][] {
    return this.sentNotifications;
  }

  getLastNotification(): ArticleNotificationData[] | null {
    if (this.sentNotifications.length === 0) {
      return null;
    }
    return this.sentNotifications[this.sentNotifications.length - 1];
  }

  clear(): void {
    this.sentNotifications = [];
  }
}
