import { Module } from '@nestjs/common';
import { CmsPort } from '../../core/domain/ports/cms.port';
import { WordpressCmsAdapter } from '../adapters/cms/wordpress-cms.adapter';
import { CmsCredentialsProvider } from '../config/cms-credentials.provider';

@Module({
  providers: [
    CmsCredentialsProvider,
    {
      provide: CmsPort,
      useClass: WordpressCmsAdapter,
    },
  ],
  exports: [CmsPort],
})
export class CmsModule {}
