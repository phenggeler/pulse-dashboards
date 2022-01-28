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
import CoreStore from "../../CoreStore";
import FiltersStore from "../../CoreStore/FiltersStore";
import { FILTER_TYPES } from "../../utils/constants";
import PrisonPopulationSnapshotMetric from "../PrisonPopulationSnapshotMetric";
import { createPrisonPopulationSnapshot, formatDateString } from "../utils";

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
      prison_population_snapshot_by_dimension: [
        // ALL row
        {
          legal_status: "ALL",
          gender: "ALL",
          age_group: "ALL",
          facility: "ALL",
          event_count: "30",
          last_updated: "2021-10-27",
          time_period: "months_0_6",
        },
        // Row with missing dimension value which will default to ALL
        {
          legal_status: "ALL",
          gender: undefined,
          age_group: "ALL",
          facility: "ALL",
          event_count: "1",
          last_updated: "2021-10-27",
          time_period: "months_0_6",
        },
        {
          legal_status: "ALL",
          gender: "ALL",
          age_group: undefined,
          facility: "Bedrock",
          event_count: "15",
          last_updated: "2021-10-27",
          time_period: "months_0_6",
        },
        {
          legal_status: "ALL",
          gender: "ALL",
          age_group: undefined,
          facility: "School of Rock",
          person_count: "10",
          last_updated: "2021-10-27",
          time_period: "months_7_12",
        },
        {
          legal_status: "ALL",
          gender: "ALL",
          age_group: undefined,
          facility: "School of Rock",
          person_count: "10",
          last_updated: "2021-10-27",
          total_population: "35",
          time_period: "months_0_6",
        },
        {
          legal_status: "ALL",
          gender: "FEMALE",
          facility: "Bedrock",
          person_count: "5",
          last_updated: "2021-10-27",
          time_period: "months_7_12",
        },
      ],
    }),
  };
});

describe("PrisonPopulationSnapshotMetric", () => {
  let metric: PrisonPopulationSnapshotMetric;

  beforeEach(() => {
    process.env = Object.assign(process.env, {
      REACT_APP_API_URL: "test-url",
    });
    mockCoreStore.filtersStore = filtersStore;
    metric = new PrisonPopulationSnapshotMetric({
      id: "prisonFacilityPopulation",
      tenantId: mockTenantId,
      sourceFilename: "prison_population_snapshot_by_dimension",
      rootStore: mockCoreStore,
      accessor: "facility",
      hasTimePeriodDimension: true,
      dataTransformer: createPrisonPopulationSnapshot,
      filters: {
        enabledFilters: [
          FILTER_TYPES.TIME_PERIOD,
          FILTER_TYPES.GENDER,
          FILTER_TYPES.LEGAL_STATUS,
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
      `${mockTenantId.toLowerCase()}/pathways/prison_population_snapshot_by_dimension`,
      RootStore.getTokenSilently
    );
  });

  it("sets isLoading to false", () => {
    expect(metric.isLoading).toEqual(false);
  });

  it("has a transformed records property", () => {
    expect(metric.records).toEqual([
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "ALL",
        count: 30,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "6",
        lengthOfStay: "ALL",
      },
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "ALL",
        count: 1,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "6",
        lengthOfStay: "ALL",
      },
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "Bedrock",
        count: 15,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "6",
        lengthOfStay: "ALL",
      },
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "School of Rock",
        count: 10,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "12",
        lengthOfStay: "ALL",
      },
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "School of Rock",
        count: 10,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "6",
        lengthOfStay: "ALL",
      },
      {
        legalStatus: "ALL",
        gender: "FEMALE",
        ageGroup: "ALL",
        facility: "Bedrock",
        count: 5,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "12",
        lengthOfStay: "ALL",
      },
    ]);
  });

  it("does not filter by timePeriod if hasTimePeriodDimension is false", () => {
    metric.hasTimePeriodDimension = false;

    expect(metric.dataSeries).toEqual([
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "Bedrock",
        count: 15,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "6",
        populationProportion: "50",
        lengthOfStay: "ALL",
      },
      {
        legalStatus: "ALL",
        gender: "ALL",
        ageGroup: "ALL",
        facility: "School of Rock",
        count: 20,
        lastUpdated: formatDateString("2021-10-27"),
        timePeriod: "12",
        populationProportion: "67",
        lengthOfStay: "ALL",
      },
    ]);
  });

  describe("totalCount", () => {
    beforeEach(() => {
      mockCoreStore.filtersStore = filtersStore;

      metric = new PrisonPopulationSnapshotMetric({
        id: "prisonFacilityPopulation",
        tenantId: mockTenantId,
        sourceFilename: "prison_population_snapshot_by_dimension",
        rootStore: mockCoreStore,
        accessor: "facility",
        dataTransformer: createPrisonPopulationSnapshot,
        filters: {
          enabledFilters: [
            FILTER_TYPES.GENDER,
            FILTER_TYPES.LEGAL_STATUS,
            FILTER_TYPES.AGE_GROUP,
            FILTER_TYPES.FACILITY,
          ],
        },
      });
      metric.hydrate();
    });

    it("returns the count from the ALL row", () => {
      expect(metric.totalCount).toBe(30);
    });
  });

  describe("dataSeries", () => {
    beforeEach(() => {
      mockCoreStore.filtersStore = filtersStore;

      metric = new PrisonPopulationSnapshotMetric({
        id: "prisonFacilityPopulation",
        tenantId: mockTenantId,
        sourceFilename: "prison_population_snapshot_by_dimension",
        rootStore: mockCoreStore,
        accessor: "facility",
        hasTimePeriodDimension: true,
        dataTransformer: createPrisonPopulationSnapshot,
        filters: {
          enabledFilters: [
            FILTER_TYPES.TIME_PERIOD,
            FILTER_TYPES.GENDER,
            FILTER_TYPES.LEGAL_STATUS,
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
          legalStatus: "ALL",
          gender: "ALL",
          ageGroup: "ALL",
          facility: "Bedrock",
          count: 15,
          lastUpdated: formatDateString("2021-10-27"),
          populationProportion: "50",
          timePeriod: "6",
          lengthOfStay: "ALL",
        },
        {
          legalStatus: "ALL",
          gender: "ALL",
          ageGroup: "ALL",
          facility: "School of Rock",
          count: 10,
          lastUpdated: formatDateString("2021-10-27"),
          timePeriod: "6",
          populationProportion: "33",
          lengthOfStay: "ALL",
        },
      ]);
    });

    it("updates when the filters change", () => {
      runInAction(() => {
        if (metric.rootStore) {
          metric.rootStore.filtersStore.setFilters({
            gender: ["FEMALE"],
            facility: ["Bedrock"],
            timePeriod: ["12"],
          });
        }

        expect(metric.dataSeries).toEqual([
          {
            legalStatus: "ALL",
            ageGroup: "ALL",
            gender: "FEMALE",
            facility: "Bedrock",
            count: 5,
            lastUpdated: formatDateString("2021-10-27"),
            timePeriod: "12",
            populationProportion: "17",
            lengthOfStay: "ALL",
          },
        ]);
      });
    });
  });

  describe("when the currentTenantId is US_TN", () => {
    beforeEach(() => {
      mockCoreStore.filtersStore = filtersStore;

      if (metric.rootStore) {
        metric.rootStore.filtersStore.resetFilters();
      }

      metric = new PrisonPopulationSnapshotMetric({
        id: "prisonFacilityPopulation",
        tenantId: mockTenantId,
        sourceFilename: "prison_population_snapshot_by_dimension",
        rootStore: mockCoreStore,
        accessor: "facility",
        dataTransformer: createPrisonPopulationSnapshot,
        filters: {
          enabledFilters: [
            FILTER_TYPES.GENDER,
            FILTER_TYPES.LEGAL_STATUS,
            FILTER_TYPES.AGE_GROUP,
            FILTER_TYPES.FACILITY,
          ],
        },
      });
      metric.hydrate();
    });

    it("has the correct downloadableData", () => {
      const expected = {
        chartDatasets: [
          {
            data: [
              {
                Count: 15,
              },
              {
                Count: 20,
              },
            ],
            label: "",
          },
        ],
        chartId: "Prison population by facility",
        chartLabels: ["Bedrock", "School of Rock"],
        dataExportLabel: "Facility",
      };
      expect(metric.downloadableData).toEqual(expected);
    });
  });
});
