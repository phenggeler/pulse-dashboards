// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2021 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================
import { Given, Then, When } from "@cucumber/cucumber";

import lanternPage from "../pages/lanternPage";
import loginPage from "../pages/loginPage";

Given("I am on the login page", async function () {
  await loginPage.open();
});

Given("I am logged in as a {string} user", async (userLevel) => {
  const { username, password } = browser.config.credentials[userLevel];
  await loginPage.open();
  await loginPage.login(username, password);
});

When("I login as an {string} user", async (userLevel) => {
  const { username, password } = browser.config.credentials[userLevel];
  await loginPage.login(username, password);
});

Then("I should see the Lantern landing page", async () => {
  const layout = await lanternPage.lanternLayout();
  expect(await layout.isExisting()).toEqual(true);
});
