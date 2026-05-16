import { Before, Given, Then, When } from '@cucumber/cucumber';
import { ArticleStatus } from '@ai-news-aggregator/news-article';
import assert from 'node:assert/strict';
import { CustomWorld } from '../support/custom-world';

Before(function (this: CustomWorld) {
  this.reset();
});

Given(
  'the publishing system is configured with valid CMS credentials',
  async function (this: CustomWorld) {
    const cms = this.createCms('cms-1', null);
    this.currentCms = cms;
    await this.cmsRepository.save(cms);
  },
);

Given(
  'there is an article with status {string}',
  async function (this: CustomWorld, status: string) {
    const article = this.createArticle(status as ArticleStatus);
    this.currentArticle = article;
    await this.articleRepository.save(article);
  },
);

Given(
  'there is an article with status different from {string}',
  async function (this: CustomWorld, status: string) {
    const differentStatus =
      status === ArticleStatus.APPROVED
        ? ArticleStatus.REJECTED
        : ArticleStatus.APPROVED;
    const article = this.createArticle(differentStatus, 'Generated summary');
    this.currentArticle = article;
    await this.articleRepository.save(article);
  },
);

Given(
  'the article is marked as summarized',
  async function (this: CustomWorld) {
    if (!this.currentArticle) {
      throw new Error('Current article not found');
    }
    this.currentArticle.summarize('Generated summary');
    await this.articleRepository.update(this.currentArticle);
  },
);

Given(
  'the article is not summarized',
  async function (this: CustomWorld) {
    if (!this.currentArticle) {
      throw new Error('Current article not found');
    }
    const storedArticle = await this.articleRepository.findById(this.currentArticle.id);
    this.currentArticle = storedArticle;
  },
);

When(
  'the article is published to the CMS',
  async function (this: CustomWorld) {
    this.publicationError = null;

    try {
      if (!this.currentArticle || !this.currentCms) {
        throw new Error('Article or CMS not configured');
      }
      await this.publishArticleUseCase.execute(this.currentArticle, this.currentCms);
    } catch (error) {
      this.publicationError = error as Error;
    }
  },
);

Then(
  'the article should be published to the configured CMS',
  function (this: CustomWorld) {
    assert.deepEqual(this.cmsPublisher.getPublishedArticles(), [
      { articleId: 'article-1', cmsId: 'cms-1' },
    ]);
  },
);

Then(
  'the article should be marked as {string}',
  async function (this: CustomWorld, status: string) {
    const article = await this.articleRepository.findById('article-1');
    assert.equal(article?.status, status);
  },
);

Then(
  'the article should not be published',
  function (this: CustomWorld) {
    assert.deepEqual(this.cmsPublisher.getPublishedArticles(), []);
  },
);
