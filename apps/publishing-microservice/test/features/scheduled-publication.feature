Feature: Scheduled publication
  As a content publishing platform
  I want due CMS configurations to be processed on a schedule
  So that approved summarized articles are published automatically

  Background:
    Given the publishing system is configured with valid CMS credentials
    And the system is scheduled to run the publication process every hour

  Scenario: Processing every due CMS in a single cycle
    Given there are multiple CMS configurations due for publication
    And there is an article with status "APPROVED"
    And the article is marked as summarized
    When the scheduled publication process runs
    Then each due CMS should be processed
    And each CMS last published timestamp should be updated

  Scenario: Skipping the cycle when no CMS is due
    Given there are no CMS configurations due for publication
    When the scheduled publication process runs
    Then no article should be published

  Scenario: Continuing with the remaining CMS when one CMS fails
    Given there are multiple CMS configurations due for publication
    And one of the CMS configurations fails during publication
    And there is an article with status "APPROVED"
    And the article is marked as summarized
    When the scheduled publication process runs
    Then the failure should be recorded for that CMS
    And the remaining due CMS configurations should still be processed
