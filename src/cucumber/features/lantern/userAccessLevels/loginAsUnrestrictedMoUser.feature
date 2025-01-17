@skip-session-reload
Feature: Login as a user with access to all districts
    As a MO user that has unrestricted access
    I want to login to the Lantern dashboard
    And see all of the available data

    Background:
        Given I am on the login page
        And I login as an "admin" user

    Scenario: Viewing the District Filter
        Then I should see "ALL" selected in the district filter
        When I select district "04" from the District Filter
        Then I should see "04" selected in the district filter
        And I should see district "04" highlighted on the chart
        And I should only see cases from district "04"
        When I select district "04B" from the District Filter
        Then I should see "2 Items" selected in the district filter
        And I should see district "04,04B" highlighted on the chart
        And I should only see cases from district "04,04B"
