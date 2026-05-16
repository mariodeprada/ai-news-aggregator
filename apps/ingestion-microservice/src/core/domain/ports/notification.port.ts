export interface ArticleNotificationData {
  articleId: string;
  title: string;
  articleUrl: string;
  mainImageUrl: string;
  originalAuthor: string;
}

export abstract class NotificationPort {
  abstract sendBatchNotification(
    articles: ArticleNotificationData[],
  ): Promise<void>;
}
