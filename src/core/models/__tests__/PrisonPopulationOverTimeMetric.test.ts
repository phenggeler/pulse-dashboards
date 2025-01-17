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
import { runInAction } from "mobx";

import { callMetricsApi } from "../../../api/metrics/metricsClient";
import RootStore from "../../../RootStore";
import TenantStore from "../../../RootStore/TenantStore";
import UserStore from "../../../RootStore/UserStore";
import CoreStore from "../../CoreStore";
import { FILTER_TYPES } from "../../utils/constants";
import PrisonPopulationOverTimeMetric from "../PrisonPopulationOverTimeMetric";
import { createPrisonPopulationTimeSeries } from "../utils";

const OLD_ENV = process.env;

const mockTenantId = "US_TN";
const mockRootStore = {
  userStore: {} as UserStore,
  tenantStore: { currentTenantId: mockTenantId } as TenantStore,
};
const mockCoreStore: CoreStore = new CoreStore(mockRootStore);
jest.mock("../../../RootStore", () => ({
  getTokenSilently: jest.fn().mockReturnValue("auth token"),
}));
global.fetch = jest.fn().mockResolvedValue({
  blob: () => "blob",
});

jest.mock("../../../api/metrics/metricsClient", () => {
  return {
    callMetricsApi: jest.fn().mockResolvedValue({
      // time series data is sorted by date ascending in the data platform
      prison_population_time_series: [
        {
          gender: "ALL",
          month: "12",
          facility: "ALL",
          age_group: "ALL",
          state_code: "US_TN",
          event_count: 7641,
          year: "2015",
          race: "ALL",
        },
        {
          gender: "ALL",
          month: "1",
          facility: "ALL",
          age_group: undefined,
          state_code: "US_TN",
          person_count: 7641,
          year: "2016",
          race: "ALL",
        },
        {
          gender: "MALE",
          month: "5",
          facility: "MCCX",
          age_group: "ALL",
          state_code: "US_TN",
          person_count: 7641,
          year: "2016",
          race: "ALL",
        },
      ],
    }),
  };
});

describe("PrisonPopulationOverTimeMetric", () => {
  let metric: PrisonPopulationOverTimeMetric;

  beforeEach(() => {
    process.env = Object.assign(process.env, {
      REACT_APP_API_URL: "test-url",
    });
    metric = new PrisonPopulationOverTimeMetric({
      id: "prisonPopulationOverTime",
      tenantId: mockTenantId,
      sourceFilename: "prison_population_time_series",
      rootStore: mockCoreStore,
      dataTransformer: createPrisonPopulationTimeSeries,
      filters: {
        enabledFilters: [
          FILTER_TYPES.GENDER,
          FILTER_TYPES.AGE_GROUP,
          FILTER_TYPES.FACILITY,
        ],
      },
    });

    metric.hydrate();
  });

  afterAll(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    process.env = OLD_ENV;
  });

  it("fetches metrics when initialized", () => {
    expect(callMetricsApi).toHaveBeenCalledWith(
      `${mockTenantId.toLowerCase()}/pathways/prison_population_time_series`,
      RootStore.getTokenSilently
    );
  });

  it("sets isLoading to false", () => {
    expect(metric.isLoading).toEqual(false);
  });

  it("has a transformed records property", () => {
    // ageGroup values default to "Unknown" since that filter is enabled
    // admissionReason values default to "ALL" since that filter is not enabled
    expect(metric.records).toEqual([
      {
        gender: "ALL",
        admissionReason: "ALL",
        month: 12,
        facility: "ALL",
        ageGroup: "ALL",
        count: 7641,
        year: 2015,
        lengthOfStay: "ALL",
        race: "ALL",
      },
      {
        gender: "ALL",
        admissionReason: "ALL",
        month: 1,
        facility: "ALL",
        ageGroup: "Unknown",
        count: 7641,
        year: 2016,
        lengthOfStay: "ALL",
        race: "ALL",
      },
      {
        gender: "MALE",
        admissionReason: "ALL",
        month: 5,
        facility: "MCCX",
        ageGroup: "ALL",
        count: 7641,
        year: 2016,
        lengthOfStay: "ALL",
        race: "ALL",
      },
    ]);
  });

  it("finds most recent month", () => {
    expect(metric.mostRecentDate).toEqual(new Date(2016, 4));
  });

  it("does not throw when accessing the most recent date without loaded data", () => {
    jest.mock("../../../api/metrics/metricsClient", () => {
      return {
        callMetricsApi: jest.fn().mockResolvedValue({
          prison_population_time_series: [],
        }),
      };
    });

    metric = new PrisonPopulationOverTimeMetric({
      id: "prisonPopulationOverTime",
      tenantId: mockTenantId,
      sourceFilename: "prison_population_time_series",
      rootStore: mockCoreStore,
      dataTransformer: createPrisonPopulationTimeSeries,
      filters: {
        enabledFilters: [
          FILTER_TYPES.GENDER,
          FILTER_TYPES.AGE_GROUP,
          FILTER_TYPES.FACILITY,
        ],
      },
    });
    metric.hydrate();

    expect(metric.mostRecentDate).toEqual(new Date(9999, 11, 31));
  });

  describe("dataSeries", () => {
    beforeEach(() => {
      metric = new PrisonPopulationOverTimeMetric({
        id: "prisonPopulationOverTime",
        tenantId: mockTenantId,
        sourceFilename: "prison_population_time_series",
        rootStore: mockCoreStore,
        dataTransformer: createPrisonPopulationTimeSeries,
        filters: {
          enabledFilters: [
            FILTER_TYPES.GENDER,
            FILTER_TYPES.AGE_GROUP,
            FILTER_TYPES.FACILITY,
          ],
        },
      });
      metric.hydrate();
    });

    it("filters by default values", () => {
      expect(metric.dataSeries).toEqual([
        {
          year: 2015,
          month: 12,
          admissionReason: "ALL",
          gender: "ALL",
          count: 7641,
          ageGroup: "ALL",
          avg90day: 7641,
          facility: "ALL",
          lengthOfStay: "ALL",
          race: "ALL",
        },
      ]);
    });

    it("updates when the filters change", () => {
      runInAction(() => {
        if (metric.rootStore) {
          metric.rootStore.filtersStore.setFilters({
            gender: ["MALE"],
            facility: ["MCCX"],
          });
        }

        expect(metric.dataSeries).toEqual([
          {
            gender: "MALE",
            admissionReason: "ALL",
            ageGroup: "ALL",
            avg90day: 7641,
            facility: "MCCX",
            month: 5,
            count: 7641,
            year: 2016,
            lengthOfStay: "ALL",
            race: "ALL",
          },
        ]);
      });
    });
  });
});
