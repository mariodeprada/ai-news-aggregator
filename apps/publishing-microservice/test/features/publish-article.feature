Feature: Publish article
  As a content publishing platform
  I want an approved summarized article to be published to a configured CMS
  So that it becomes available to end users

  Background:
    Given the publishing system is configured with valid CMS credentials

  Scenario: Successfully publishing a summarized approved article
    Given there is an article with status "APPROVED"
    And the article is marked as summarized
    When the article is published to the CMS
    Then the article should be published to the configured CMS
    And the article should be marked as "PUBLISHED"

  Scenario: Skipping articles that are not summarized
    Given there is an article with status "APPROVED"
    And the article is not summarized
    When the article is published to the CMS
    Then the article should not be published

  Scenario: Skipping articles that are not approved
    Given there is an article with status different from "APPROVED"
    And the article is marked as summarized
    When the article is published to the CMS
    Then the article should not be published
