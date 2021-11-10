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
import { makeAutoObservable } from "mobx";

import { US_TN } from "../../RootStore/TenantStore/pathwaysTenants";
import PopulationOverTimeMetric from "../models/PopulationOverTimeMetric";
import PopulationProjectionOverTimeMetric from "../models/PopulationProjectionOverTimeMetric";
import PopulationSnapshotMetric from "../models/PopulationSnapshotMetric";
import ProjectionsMetrics from "../models/ProjectionsMetrics";
import SupervisionCountOverTimeMetric from "../models/SupervisionCountOverTimeMetric";
import {
  createFacilityPopulationSnapshot,
  createPopulationTimeSeries,
  createProjectionTimeSeries,
  createSupervisionTransitionTimeSeries,
} from "../models/utils";
import VitalsMetrics from "../models/VitalsMetrics";
import { FILTER_TYPES } from "../utils/constants";
import { PATHWAYS_PAGES, PATHWAYS_SECTIONS } from "../views";
import type CoreStore from ".";

export default class MetricsStore {
  protected readonly rootStore;

  constructor({ rootStore }: { rootStore: CoreStore }) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  get practices(): VitalsMetrics {
    return new VitalsMetrics({
      tenantId: this.rootStore.currentTenantId,
      sourceEndpoint: "vitals",
    });
  }

  get projections(): ProjectionsMetrics {
    return new ProjectionsMetrics({
      tenantId: this.rootStore.currentTenantId,
      sourceEndpoint: "projections",
      rootStore: this.rootStore,
    });
  }

  get current(): any {
    const { page, section } = this.rootStore;
    const map = {
      [PATHWAYS_PAGES.prison]: {
        [PATHWAYS_SECTIONS.countOverTime]:
          this.rootStore.currentTenantId === US_TN
            ? this.prisonPopulationOverTime
            : this.projectedPrisonPopulationOverTime,
        [PATHWAYS_SECTIONS.countByLocation]: this.prisonFacilityPopulation,
      },
      [PATHWAYS_PAGES.supervision]: {
        [PATHWAYS_SECTIONS.countOverTime]: this.supervisionPopulationOverTime,
      },
      [PATHWAYS_PAGES.supervisionToPrison]: {
        [PATHWAYS_SECTIONS.countOverTime]: this.supervisionToPrisonOverTime,
      },
      [PATHWAYS_PAGES.supervisionToLiberty]: {
        [PATHWAYS_SECTIONS.countOverTime]: this.supervisionToLibertyOverTime,
      },
    };
    // @ts-ignore
    return map[page][section];
  }

  get prisonPopulationOverTime(): PopulationOverTimeMetric {
    return new PopulationOverTimeMetric({
      id: "prisonPopulationOverTime",
      tenantId: this.rootStore.currentTenantId,
      compartment: "INCARCERATION",
      sourceFilename: "prison_population_time_series",
      rootStore: this.rootStore,
      dataTransformer: createPopulationTimeSeries,
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.GENDER,
        FILTER_TYPES.FACILITY,
      ],
      enabledMoreFilters: [FILTER_TYPES.AGE, FILTER_TYPES.LEGAL_STATUS],
    });
  }

  get prisonFacilityPopulation(): PopulationSnapshotMetric {
    return new PopulationSnapshotMetric({
      id: "prisonFacilityPopulation",
      tenantId: this.rootStore.currentTenantId,
      compartment: "INCARCERATION",
      sourceFilename: "prison_population_time_series",
      rootStore: this.rootStore,
      dataTransformer: createFacilityPopulationSnapshot,
      enabledFilters: [
        FILTER_TYPES.GENDER,
        FILTER_TYPES.LEGAL_STATUS,
        FILTER_TYPES.AGE,
        FILTER_TYPES.FACILITY,
      ],
    });
  }

  get projectedPrisonPopulationOverTime(): PopulationProjectionOverTimeMetric {
    return new PopulationProjectionOverTimeMetric({
      id: "projectedPrisonPopulationOverTime",
      tenantId: this.rootStore.currentTenantId,
      compartment: "INCARCERATION",
      sourceFilename: "prison_population_projection_time_series",
      rootStore: this.rootStore,
      dataTransformer: createProjectionTimeSeries,
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.GENDER,
        FILTER_TYPES.LEGAL_STATUS,
      ],
    });
  }

  get supervisionPopulationOverTime(): PopulationProjectionOverTimeMetric {
    return new PopulationProjectionOverTimeMetric({
      id: "supervisionPopulationOverTime",
      tenantId: this.rootStore.currentTenantId,
      compartment: "SUPERVISION",
      sourceFilename: "supervision_population_projection_time_series",
      rootStore: this.rootStore,
      dataTransformer: createProjectionTimeSeries,
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.GENDER,
        FILTER_TYPES.SUPERVISION_TYPE,
      ],
    });
  }

  get supervisionToPrisonOverTime(): SupervisionCountOverTimeMetric {
    return new SupervisionCountOverTimeMetric({
      id: "supervisionToPrisonOverTime",
      tenantId: this.rootStore.currentTenantId,
      sourceFilename: "supervision_to_prison_count_by_month",
      rootStore: this.rootStore,
      dataTransformer: (data) =>
        createSupervisionTransitionTimeSeries(data, "admissions"),
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.GENDER,
        FILTER_TYPES.SUPERVISION_TYPE,
      ],
    });
  }

  get supervisionToLibertyOverTime(): SupervisionCountOverTimeMetric {
    return new SupervisionCountOverTimeMetric({
      id: "supervisionToLibertyOverTime",
      tenantId: this.rootStore.currentTenantId,
      sourceFilename: "supervision_to_liberty_count_by_month",
      rootStore: this.rootStore,
      dataTransformer: (data) =>
        createSupervisionTransitionTimeSeries(data, "releases"),
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.GENDER,
        FILTER_TYPES.SUPERVISION_TYPE,
      ],
    });
  }
}
