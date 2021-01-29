// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
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

jest.mock("../../core/fetchMetrics", () => {
  return {
    default: jest.fn(() =>
      Promise.resolve({
        file_1: "content_1",
        file_2: "content_2",
        supervision_location_restricted_access_emails: [
          {
            restricted_user_email: "thirteen@state.gov",
            allowed_level_1_supervision_location_ids: "13",
          },
          {
            restricted_user_email: "one@state.gov",
            allowed_level_1_supervision_location_ids: "1",
          },
        ],
      })
    ),
  };
});
const { default: fetchMetrics } = require("../../core/fetchMetrics");
const {
  newRevocations,
  newRevocationFile,
  communityGoals,
  communityExplore,
  facilitiesGoals,
  facilitiesExplore,
  programmingExplore,
  refreshCache,
  restrictedAccess,
  responder,
} = require("../api");

const { clearMemoryCache } = require("../../core/cacheManager");

describe("API GET tests", () => {
  const stateCode = "test_id";

  beforeAll(() => {
    // Reduce noise in the test
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  function fakeRequest(routeHandler, req = { params: { stateCode } }) {
    return new Promise((resolve) => {
      const send = resolve;
      const status = jest.fn().mockImplementation(() => {
        return { send };
      });
      const res = { send, status };
      routeHandler(req, res);
    });
  }

  async function requestAndExpectFetchMetricsCalled(
    controllerFn,
    numCalls,
    request
  ) {
    await fakeRequest(controllerFn, request);
    expect(fetchMetrics.mock.calls.length).toBe(numCalls);
    fetchMetrics.mockClear();
  }

  describe("API fetching and caching for GET requests", () => {
    const metricControllers = [
      [newRevocations],
      [newRevocationFile],
      [communityGoals],
      [communityExplore],
      [facilitiesGoals],
      [facilitiesExplore],
      [programmingExplore],
    ];

    afterEach(async () => {
      await clearMemoryCache();
      fetchMetrics.mockClear();
      jest.resetModules();
    });

    metricControllers.forEach(() => {});
    test.each(metricControllers)(
      "%p fetches metrics only if data is not cached in store",
      async (controllerFn, done) => {
        // TODO: Set this expectation back to 1 when we remove the "original" cache keys
        await requestAndExpectFetchMetricsCalled(controllerFn, 1);
        await requestAndExpectFetchMetricsCalled(controllerFn, 0);

        await clearMemoryCache();

        await requestAndExpectFetchMetricsCalled(controllerFn, 1);
        await requestAndExpectFetchMetricsCalled(controllerFn, 0);

        done();
      }
    );

    it("newRevocations - calls fetchMetrics with the correct args", async () => {
      await fakeRequest(newRevocations);
      expect(fetchMetrics).toHaveBeenCalledWith(
        stateCode,
        "newRevocation",
        null,
        false
      );
    });

    it("newRevocationFile - calls fetchMetrics with the correct args", async () => {
      const file = "test_file";
      await fakeRequest(newRevocationFile, { params: { stateCode, file } });

      expect(fetchMetrics).toHaveBeenCalledWith(
        stateCode,
        "newRevocation",
        file,
        false
      );
    });

    it("refreshCache - calls fetchMetrics with the correct args", async () => {
      await fakeRequest(refreshCache);

      expect(fetchMetrics).toHaveBeenCalledWith(
        stateCode,
        "newRevocation",
        null,
        false
      );
    });
  });

  describe("API fetching and caching for POST requests", () => {
    const userEmail = "thirteen@state.gov";
    const userDistrict = "13";
    let postRequest = { params: { stateCode }, body: { userEmail } };
    const file = "supervision_location_restricted_access_emails";

    afterEach(async () => {
      await clearMemoryCache();
      fetchMetrics.mockClear();
      jest.resetModules();
    });

    it("restrictedAccess fetches file only if data is not cached in store", async () => {
      await requestAndExpectFetchMetricsCalled(
        restrictedAccess,
        1,
        postRequest
      );

      await requestAndExpectFetchMetricsCalled(
        restrictedAccess,
        0,
        postRequest
      );

      await clearMemoryCache();

      await requestAndExpectFetchMetricsCalled(
        restrictedAccess,
        1,
        postRequest
      );
      await requestAndExpectFetchMetricsCalled(
        restrictedAccess,
        0,
        postRequest
      );
    });

    it("restrictedAccess correctly responds to subsequent requests from different users from cached file ", async () => {
      let result = await fakeRequest(restrictedAccess, postRequest);
      expect(result[file].restricted_user_email).toEqual(userEmail);
      expect(result[file].allowed_level_1_supervision_location_ids).toEqual(
        userDistrict
      );
      expect(fetchMetrics.mock.calls.length).toBe(1);
      fetchMetrics.mockClear();

      const newUserEmail = "one@state.gov";
      const newUserDistrict = "1";
      postRequest = {
        params: { stateCode },
        body: { userEmail: newUserEmail },
      };

      result = await fakeRequest(restrictedAccess, postRequest);
      expect(result[file].restricted_user_email).toEqual(newUserEmail);
      expect(result[file].allowed_level_1_supervision_location_ids).toEqual(
        newUserDistrict
      );
      expect(fetchMetrics.mock.calls.length).toBe(0);
      fetchMetrics.mockClear();
    });

    it("restrictedAccess - calls fetchMetrics with the correct args", async () => {
      await fakeRequest(restrictedAccess, postRequest);
      expect(fetchMetrics).toHaveBeenCalledWith(
        stateCode,
        "newRevocation",
        file,
        false
      );
    });
  });

  describe("responder test", () => {
    const send = jest.fn();
    const status = jest.fn().mockImplementation(() => {
      return { send };
    });
    const res = { send, status };

    it("should send error status code 500 when no status is on error", () => {
      const error = "some error";
      const callback = responder(res);
      callback(error, null);

      expect(status).toHaveBeenCalledWith(500);
    });

    it("should send the error's status code when the status is on the error", () => {
      const error = { status: 400, errors: ["some error"] };
      const callback = responder(res);
      callback(error, null);

      expect(status).toHaveBeenCalledWith(error.status);
    });

    it("should send the error's status code when the error has a code property", () => {
      const error = { code: 404, error: "File not found" };
      const callback = responder(res);
      callback(error, null);

      expect(status).toHaveBeenCalledWith(error.code);
    });

    it("should send data", () => {
      const data = "some data";
      const callback = responder(res);
      callback(null, data);

      expect(send).toHaveBeenCalledWith(data);
    });
  });
});
