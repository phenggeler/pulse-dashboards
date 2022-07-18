// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2022 Recidiviz, Inc.
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

import { computed, configure, when } from "mobx";
import { IDisposer, keepAlive } from "mobx-utils";

import {
  trackReferralFormViewed,
  trackSetOpportunityStatus,
  trackSurfacedInList,
} from "../../analytics";
import {
  CompliantReportingEligibleRecord,
  subscribeToClientUpdates,
  updateCompliantReportingCompleted,
  updateCompliantReportingDenial,
} from "../../firestore";
import { RootStore } from "../../RootStore";
import { eligibleClient, mockOfficer } from "../__fixtures__";
import { Client } from "../Client";
import { OTHER_KEY, PracticesStore } from "../PracticesStore";
import { dateToTimestamp } from "../utils";

let testObserver: IDisposer;

jest.mock("../../analytics");
jest.mock("../../firestore");

const mockSubscribeToClientUpdates = subscribeToClientUpdates as jest.MockedFunction<
  typeof subscribeToClientUpdates
>;
const mockUpdateCompliantReportingDenial = updateCompliantReportingDenial as jest.MockedFunction<
  typeof updateCompliantReportingDenial
>;
const mockUpdateCompliantReportingCompleted = updateCompliantReportingCompleted as jest.MockedFunction<
  typeof updateCompliantReportingCompleted
>;

let client: Client;
let rootStore: RootStore;

beforeEach(() => {
  // this lets us spy on mobx computed getters
  configure({ safeDescriptors: false });
  rootStore = new RootStore();
  client = new Client(eligibleClient, rootStore);
});

afterEach(() => {
  configure({ safeDescriptors: true });
  jest.resetAllMocks();

  // clean up any Mobx observers to avoid leaks
  if (testObserver) {
    testObserver();
  }
});

test("fetch client updates on demand", async () => {
  mockSubscribeToClientUpdates.mockImplementation((clientId, handler) => {
    expect(clientId).toBe(client.id);
    handler({});
    return jest.fn();
  });

  // simulate a client profile page observing updates
  testObserver = keepAlive(computed(() => [client.updates]));

  expect(mockSubscribeToClientUpdates).toHaveBeenCalled();

  await when(() => client.updates !== undefined);
});

test("set compliant reporting ineligible", async () => {
  rootStore.practicesStore.user = mockOfficer;

  const reasons = ["test1", "test2"];
  await client.setCompliantReportingDenialReasons(reasons);

  expect(mockUpdateCompliantReportingDenial).toHaveBeenCalledWith(
    mockOfficer.info.email,
    client.id,
    { reasons },
    { otherReason: true }
  );

  expect(mockUpdateCompliantReportingCompleted).toHaveBeenCalledWith(
    mockOfficer.info.email,
    client.id,
    true
  );
  expect(trackSetOpportunityStatus).toHaveBeenCalledWith({
    clientId: client.pseudonymizedId,
    status: "DENIED",
    opportunityType: "compliantReporting",
    deniedReasons: reasons,
  });
});

test("ineligible for other reason", () => {
  rootStore.practicesStore.user = mockOfficer;

  const reasons = ["test1", OTHER_KEY];
  client.setCompliantReportingDenialReasons(reasons);

  expect(mockUpdateCompliantReportingDenial).toHaveBeenCalledWith(
    mockOfficer.info.email,
    client.id,
    { reasons },
    undefined
  );

  const newReasons = reasons.slice(0, 1);

  client.setCompliantReportingDenialReasons(newReasons);

  expect(mockUpdateCompliantReportingDenial).toHaveBeenCalledWith(
    mockOfficer.info.email,
    client.id,
    { reasons: newReasons },
    // this will delete the related field if reasons do not include "other"
    { otherReason: true }
  );
});

test("set compliant reporting other reason", () => {
  rootStore.practicesStore.user = mockOfficer;

  const otherReason = "some other reason";
  client.setCompliantReportingDenialOtherReason(otherReason);

  expect(mockUpdateCompliantReportingDenial).toHaveBeenCalledWith(
    mockOfficer.info.email,
    client.id,
    { otherReason }
  );
});

test("clear denial reasons", async () => {
  rootStore.practicesStore.user = mockOfficer;

  const reasons = ["test1", OTHER_KEY];
  await client.setCompliantReportingDenialReasons(reasons);

  await client.setCompliantReportingDenialReasons([]);

  expect(trackSetOpportunityStatus).toHaveBeenCalledTimes(2);
  expect(trackSetOpportunityStatus).toHaveBeenLastCalledWith({
    clientId: client.pseudonymizedId,
    status: "IN_PROGRESS",
    opportunityType: "compliantReporting",
  });
});

test("print client reporting form", () => {
  rootStore.practicesStore.user = mockOfficer;

  expect(client.formIsPrinting).toBe(false);

  client.printCompliantReportingReferralForm();

  expect(client.formIsPrinting).toBe(true);
});

test("mark client as completed when printing form", () => {
  rootStore.practicesStore.user = mockOfficer;

  client.printCompliantReportingReferralForm();

  expect(mockUpdateCompliantReportingCompleted).toHaveBeenCalledWith(
    mockOfficer.info.email,
    client.id
  );
  expect(trackSetOpportunityStatus).toHaveBeenCalledWith({
    clientId: client.pseudonymizedId,
    status: "COMPLETED",
    opportunityType: "compliantReporting",
  });
});

test("don't record a completion if user is ineligible", async () => {
  rootStore.practicesStore.user = mockOfficer;

  mockSubscribeToClientUpdates.mockImplementation((clientId, handleResults) => {
    handleResults({
      compliantReporting: {
        denial: {
          reasons: ["test"],
          updated: { by: "test", date: dateToTimestamp("2022-02-01") },
        },
      },
    });
    return jest.fn();
  });

  // ensure the update data has been hydrated
  await when(() => client.updates !== undefined);

  client.printCompliantReportingReferralForm();

  expect(mockUpdateCompliantReportingCompleted).not.toHaveBeenCalled();
  expect(trackSetOpportunityStatus).not.toHaveBeenCalled();
});

test("compliant reporting review status", async () => {
  let sendUpdate: any;

  mockSubscribeToClientUpdates.mockImplementation((clientId, handleResults) => {
    // get a reference to the sync function so we can call it repeatedly
    sendUpdate = handleResults;
    return jest.fn();
  });

  keepAlive(computed(() => [client.reviewStatusMessages]));

  sendUpdate(undefined);
  expect(client.reviewStatusMessages.compliantReporting).toBe("Needs referral");

  sendUpdate({
    someOtherKey: {},
  });
  expect(client.reviewStatusMessages.compliantReporting).toBe("Needs referral");

  sendUpdate({
    compliantReporting: {
      denial: {
        reasons: ["test"],
        updated: { by: "test", date: dateToTimestamp("2022-02-01") },
      },
    },
  });
  expect(client.reviewStatusMessages.compliantReporting).toBe(
    "Currently ineligible"
  );

  sendUpdate({
    // for this case the contents don't matter as long as it exists
    compliantReporting: {},
  });
  expect(client.reviewStatusMessages.compliantReporting).toBe(
    "Referral in progress"
  );

  sendUpdate({
    compliantReporting: {
      completed: {
        by: "test",
        date: {},
      },
    },
  });
  expect(client.reviewStatusMessages.compliantReporting).toBe(
    "Referral form complete"
  );
});

test("form view tracking", async () => {
  mockSubscribeToClientUpdates.mockImplementation((clientId, handler) => {
    expect(clientId).toBe(client.id);
    handler({});
    return jest.fn();
  });

  await client.trackFormViewed("compliantReporting");

  expect(trackReferralFormViewed).toHaveBeenCalledWith({
    clientId: client.pseudonymizedId,
    opportunityType: "compliantReporting",
  });
});

test("form view tracking waits for updates", async () => {
  mockSubscribeToClientUpdates.mockImplementation((clientId, handler) => {
    expect(clientId).toBe(client.id);
    // simulate fetch latency
    setTimeout(() => {
      handler({
        compliantReporting: {
          completed: {
            update: { by: "abc", date: dateToTimestamp("2022-01-01") },
          },
        },
      });
    }, 10);
    return jest.fn();
  });

  await client.trackFormViewed("compliantReporting");

  expect(trackReferralFormViewed).toHaveBeenCalledTimes(1);
  expect(trackReferralFormViewed).toHaveBeenCalledWith({
    clientId: client.pseudonymizedId,
    opportunityType: "compliantReporting",
  });
});

test("list view tracking", async () => {
  mockSubscribeToClientUpdates.mockImplementation((clientId, handler) => {
    expect(clientId).toBe(client.id);
    handler({});
    return jest.fn();
  });

  await client.trackListViewed("compliantReporting");

  expect(trackSurfacedInList).toHaveBeenCalledWith({
    clientId: client.pseudonymizedId,
    opportunityType: "compliantReporting",
  });
});

test("list view tracking waits for updates", async () => {
  mockSubscribeToClientUpdates.mockImplementation((clientId, handler) => {
    expect(clientId).toBe(client.id);
    // simulate fetch latency
    setTimeout(() => {
      handler({
        compliantReporting: {
          completed: {
            update: { by: "abc", date: dateToTimestamp("2022-01-01") },
          },
        },
      });
    }, 10);
    return jest.fn();
  });

  await client.trackListViewed("compliantReporting");

  expect(trackSurfacedInList).toHaveBeenCalledTimes(1);
  expect(trackSurfacedInList).toHaveBeenCalledWith({
    clientId: client.pseudonymizedId,
    opportunityType: "compliantReporting",
  });
});

test("almost eligible criteria are filtered to remove negatives", async () => {
  const spy = jest.spyOn(PracticesStore.prototype, "featureVariants", "get");
  spy.mockReturnValue({ CompliantReportingAlmostEligible: {} });
  rootStore = new RootStore();

  client = new Client(
    {
      ...eligibleClient,
      compliantReportingEligible: {
        ...(eligibleClient.compliantReportingEligible as CompliantReportingEligibleRecord),
        remainingCriteriaNeeded: 1,
        almostEligibleCriteria: {
          passedDrugScreenNeeded: true,
          paymentNeeded: false,
          currentLevelEligibilityDate: undefined,
          recentRejectionCodes: [],
        },
      },
    },
    rootStore
  );

  expect(
    client.opportunitiesAlmostEligible.compliantReporting
      ?.almostEligibleCriteria
  ).toEqual({ passedDrugScreenNeeded: true });
  expect(
    Object.keys(
      client.opportunitiesAlmostEligible.compliantReporting
        ?.almostEligibleCriteria ?? {}
    ).length
  ).toBe(1);
});
