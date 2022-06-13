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
import * as Sentry from "@sentry/react";
import { runInAction } from "mobx";
import tk from "timekeeper";

import {
  callMetricsApi,
  callNewMetricsApi,
} from "../../../api/metrics/metricsClient";
import RootStore from "../../../RootStore";
import CoreStore from "../../CoreStore";
import FiltersStore from "../../CoreStore/FiltersStore";
import { FILTER_TYPES } from "../../utils/constants";
import LibertyPopulationOverTimeMetric from "../LibertyPopulationOverTimeMetric";
import { createLibertyPopulationTimeSeries } from "../utils";

const OLD_ENV = process.env;

const mockTenantId = "US_TN";
const mockCoreStore = { currentTenantId: mockTenantId } as CoreStore;
const filtersStore = new FiltersStore({ rootStore: mockCoreStore });
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
      liberty_to_prison_count_by_month: [
        {
          gender: "ALL",
          month: "12",
          judicial_district: "ALL",
          state_code: "US_TN",
          event_count: 7641,
          year: "2015",
        },
        {
          gender: "ALL",
          month: "1",
          judicial_district: "ALL",
          state_code: "US_TN",
          event_count: 7641,
          year: "2016",
        },
        {
          gender: "MALE",
          month: "5",
          judicial_district: "JUDICIAL_DISTRICT_1",
          state_code: "US_TN",
          event_count: 7641,
          year: "2016",
        },
      ],
    }),
    callNewMetricsApi: jest.fn().mockResolvedValue([
      {
        year: 2015,
        month: 12,
        count: 7641,
      },
    ]),
  };
});

jest.mock("@sentry/react");

describe("LibertyPopulationOverTimeMetric", () => {
  let metric: LibertyPopulationOverTimeMetric;

  beforeEach(() => {
    process.env = Object.assign(process.env, {
      REACT_APP_API_URL: "test-url",
      REACT_APP_DEPLOY_ENV: "dev",
      REACT_APP_NEW_BACKEND_API_URL: "http://localhost:5000",
    });
    mockCoreStore.filtersStore = filtersStore;
    filtersStore.resetFilters();
    metric = new LibertyPopulationOverTimeMetric({
      id: "libertyToPrisonPopulationOverTime",
      tenantId: mockTenantId,
      sourceFilename: "liberty_to_prison_count_by_month",
      rootStore: mockCoreStore,
      dataTransformer: createLibertyPopulationTimeSeries,
      filters: {
        enabledFilters: [FILTER_TYPES.GENDER, FILTER_TYPES.JUDICIAL_DISTRICT],
      },
    });

    metric.hydrate();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  afterAll(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it("fetches metrics when initialized", () => {
    expect(callMetricsApi).toHaveBeenCalledWith(
      `${mockTenantId.toLowerCase()}/pathways/liberty_to_prison_count_by_month`,
      RootStore.getTokenSilently
    );
  });

  it("sets isLoading to false", () => {
    expect(metric.isLoading).toEqual(false);
  });

  it("has a transformed records property", () => {
    // supervisionType values default to "Unknown" since that filter is enabled
    // legalStatus values default to "ALL" since that filter is not enabled
    expect(metric.records).toEqual([
      {
        gender: "ALL",
        month: 12,
        judicialDistrict: "ALL",
        ageGroup: "ALL",
        count: 7641,
        year: 2015,
        race: "ALL",
        priorLengthOfIncarceration: "ALL",
      },
      {
        gender: "ALL",
        month: 1,
        judicialDistrict: "ALL",
        ageGroup: "ALL",
        count: 7641,
        year: 2016,
        race: "ALL",
        priorLengthOfIncarceration: "ALL",
      },
      {
        gender: "MALE",
        month: 5,
        judicialDistrict: "JUDICIAL_DISTRICT_1",
        ageGroup: "ALL",
        count: 7641,
        year: 2016,
        race: "ALL",
        priorLengthOfIncarceration: "ALL",
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
          liberty_to_prison_count_by_month: [],
        }),
      };
    });

    metric = new LibertyPopulationOverTimeMetric({
      id: "prisonPopulationOverTime",
      tenantId: mockTenantId,
      sourceFilename: "liberty_to_prison_count_by_month",
      rootStore: mockCoreStore,
      dataTransformer: createLibertyPopulationTimeSeries,
      filters: {
        enabledFilters: [FILTER_TYPES.GENDER, FILTER_TYPES.JUDICIAL_DISTRICT],
      },
    });
    metric.hydrate();

    expect(metric.mostRecentDate).toEqual(new Date(9999, 11, 31));
  });

  describe("dataSeries", () => {
    beforeEach(() => {
      tk.freeze(new Date("2022-01-15"));
      mockCoreStore.filtersStore = filtersStore;

      metric = new LibertyPopulationOverTimeMetric({
        id: "prisonPopulationOverTime",
        tenantId: mockTenantId,
        sourceFilename: "liberty_to_prison_count_by_month",
        rootStore: mockCoreStore,
        dataTransformer: createLibertyPopulationTimeSeries,
        filters: {
          enabledFilters: [FILTER_TYPES.GENDER, FILTER_TYPES.JUDICIAL_DISTRICT],
        },
      });
      metric.hydrate();
    });
    afterEach(() => {
      tk.reset();
    });

    it("calls the new API and logs diffs", () => {
      expect(callNewMetricsApi).toHaveBeenCalledWith(
        `${mockTenantId}/LibertyToPrisonTransitionsCount?group=year_month&since=2021-07-01`,
        RootStore.getTokenSilently
      );
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("calls the new API and does not log diffs if there are none", () => {
      jest.mock("../../../api/metrics/metricsClient", () => {
        return {
          callNewMetricsApi: jest.fn().mockResolvedValue([
            {
              year: 2015,
              month: 12,
              count: 7641,
            },
            {
              year: 2016,
              month: 1,
              count: 7641,
            },
            {
              year: 2016,
              month: 5,
              count: 7641,
            },
          ]),
        };
      });

      expect(callNewMetricsApi).toHaveBeenCalledWith(
        `${mockTenantId}/LibertyToPrisonTransitionsCount?group=year_month&since=2021-07-01`,
        RootStore.getTokenSilently
      );
      // Sentry will probably get called after metric.dataSeries has returned, so
      // give it a bit of time before we check on it
      setTimeout(
        () => expect(Sentry.captureException).not.toHaveBeenCalled(),
        300
      );
    });

    it("calls the new API with filters", () => {
      runInAction(() => {
        if (metric.rootStore) {
          metric.rootStore.filtersStore.setFilters({
            gender: ["MALE"],
            judicialDistrict: ["JUDICIAL_DISTRICT_1", "JUDICIAL_DISTRICT_2"],
          });
        }
      });

      expect(callNewMetricsApi).toHaveBeenCalledWith(
        encodeURI(
          `${mockTenantId}/LibertyToPrisonTransitionsCount?group=year_month&since=2021-07-01` +
            `&filters[gender]=MALE&filters[judicial_district]=JUDICIAL_DISTRICT_1&filters[judicial_district]=JUDICIAL_DISTRICT_2`
        ),
        RootStore.getTokenSilently
      );
    });

    it("filters by default values", () => {
      expect(metric.dataSeries).toEqual([
        {
          year: 2015,
          month: 12,
          judicialDistrict: "ALL",
          gender: "ALL",
          count: 7641,
          avg90day: 7641,
          race: "ALL",
          ageGroup: "ALL",
          priorLengthOfIncarceration: "ALL",
        },
        {
          gender: "ALL",
          month: 1,
          judicialDistrict: "ALL",
          ageGroup: "ALL",
          count: 7641,
          avg90day: 7641,
          year: 2016,
          race: "ALL",
          priorLengthOfIncarceration: "ALL",
        },
      ]);
    });

    it("updates when the filters change", () => {
      runInAction(() => {
        if (metric.rootStore) {
          metric.rootStore.filtersStore.setFilters({
            gender: ["MALE"],
            judicialDistrict: ["JUDICIAL_DISTRICT_1"],
          });
        }

        expect(metric.dataSeries).toEqual([
          {
            gender: "MALE",
            month: 5,
            count: 7641,
            judicialDistrict: "JUDICIAL_DISTRICT_1",
            avg90day: 7641,
            year: 2016,
            race: "ALL",
            ageGroup: "ALL",
            priorLengthOfIncarceration: "ALL",
          },
        ]);
      });
    });
  });
});
