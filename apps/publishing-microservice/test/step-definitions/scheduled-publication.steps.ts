import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { CustomWorld } from '../support/custom-world';

Before(function (this: CustomWorld) {
  this.reset();
});

Given(
  'the system is scheduled to run the publication process every hour',
  function () {},
);

Given(
  'there are multiple CMS configurations due for publication',
  async function (this: CustomWorld) {
    const firstCms = this.createCms('cms-1', new Date('2024-01-01T00:00:00Z'));
    const secondCms = this.createCms('cms-2', new Date('2024-01-01T00:00:00Z'));
    this.dueCms = [firstCms, secondCms];
    for (const cms of this.dueCms) {
      await this.cmsRepository.save(cms);
    }
  },
);

Given(
  'there are no CMS configurations due for publication',
  async function (this: CustomWorld) {
    const cms = this.createCms('cms-1', new Date('2099-01-01T00:00:00Z'));
    this.dueCms = [cms];
    await this.cmsRepository.save(cms);
  },
);

Given(
  'one of the CMS configurations fails during publication',
  async function (this: CustomWorld) {
    const failingCms =
      this.dueCms[0] ?? this.createCms('cms-1', new Date('2024-01-01T00:00:00Z'));
    if (this.dueCms.length === 0) {
      this.dueCms = [failingCms];
      await this.cmsRepository.save(failingCms);
    }
    this.cmsPublisher.setErrorForCms(failingCms.id, new Error('CMS failure'));
  },
);

When(
  'the scheduled publication process runs',
  async function (this: CustomWorld) {
    this.publicationError = null;

    try {
      this.processResult =
        await this.processScheduledPublicationUseCase.execute();
    } catch (error) {
      this.publicationError = error as Error;
    }
  },
);

Then(
  'each due CMS should be processed',
  function (this: CustomWorld) {
    assert.deepEqual(this.processResult?.success, ['cms-1', 'cms-2']);
  },
);

Then(
  'each CMS last published timestamp should be updated',
  async function (this: CustomWorld) {
    const cms1 = await this.cmsRepository.findById('cms-1');
    const cms2 = await this.cmsRepository.findById('cms-2');
    assert.ok(
      (cms1?.lastPublishedAt?.getTime() ?? 0) >
      new Date('2024-01-01T00:00:00Z').getTime(),
    );
    assert.ok(
      (cms2?.lastPublishedAt?.getTime() ?? 0) >
      new Date('2024-01-01T00:00:00Z').getTime(),
    );
  },
);

Then(
  'no article should be published',
  function (this: CustomWorld) {
    assert.deepEqual(this.cmsPublisher.getPublishedArticles(), []);
  },
);

Then(
  'the failure should be recorded for that CMS',
  function (this: CustomWorld) {
    assert.equal(this.processResult?.errors.length, 1);
    assert.equal(this.processResult?.errors[0]?.cmsId, 'cms-1');
  },
);

Then(
  'the remaining due CMS configurations should still be processed',
  function (this: CustomWorld) {
    assert.ok(this.processResult?.success.includes('cms-2'));
    assert.deepEqual(this.cmsPublisher.getPublishedArticles(), [
      { articleId: 'article-1', cmsId: 'cms-2' },
    ]);
  },
);
