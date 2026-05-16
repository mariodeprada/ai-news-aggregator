import { CmsPort } from '../ports/cms.port';
import { InMemoryCmsPublisher } from './mocks/in-memory-cms-publisher';

describe('CmsPort', () => {
  let cmsPort: CmsPort;

  beforeEach(() => {
    cmsPort = new InMemoryCmsPublisher();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(cmsPort).toBeDefined();
    });
  });

  describe('publishArticle', () => {
    it('should be defined', () => {
      expect(cmsPort.publishArticle).toBeDefined();
    });
  });
});
