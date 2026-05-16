import { Injectable } from '@nestjs/common';
import { Cms } from '../../domain/entities/cms';
import { CmsRepositoryPort } from '../../domain/ports/cms-repository.port';

@Injectable()
export class GetCmsToPublishUseCase {
  constructor(private readonly cmsRepository: CmsRepositoryPort) {}

  async execute(now: Date = new Date()): Promise<Cms[]> {
    return this.cmsRepository.findDueCms(now);
  }
}
