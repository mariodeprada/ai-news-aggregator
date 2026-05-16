export class CmsPublicationException extends Error {
  constructor(message = 'Failed to publish article to CMS') {
    super(message);
    this.name = 'CmsPublicationException';
  }
}
