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

import PopulationOverTimeMetric from "../models/PopulationOverTimeMetric";
import ProjectionsMetrics from "../models/ProjectionsMetrics";
import { createProjectionTimeSeries } from "../models/utils";
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
        [PATHWAYS_SECTIONS.populationOverTime]: this.prisonPopulationOverTime,
      },
      [PATHWAYS_PAGES.supervision]: {
        [PATHWAYS_SECTIONS.populationOverTime]: this
          .supervisionPopulationOverTime,
      },
    };
    // @ts-ignore
    return map[page][section];
  }

  get prisonPopulationOverTime(): PopulationOverTimeMetric {
    return new PopulationOverTimeMetric({
      tenantId: this.rootStore.currentTenantId,
      sourceFilename: "prison_population_projection_time_series",
      rootStore: this.rootStore,
      dataTransformer: createProjectionTimeSeries,
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.LEGAL_STATUS,
        FILTER_TYPES.GENDER,
      ],
      chartTitle: "Incarcerated Population",
      noteCopy: `Historical and projected population data were generated`,
    });
  }

  get supervisionPopulationOverTime(): PopulationOverTimeMetric {
    return new PopulationOverTimeMetric({
      tenantId: this.rootStore.currentTenantId,
      sourceFilename: "supervision_population_projection_time_series",
      rootStore: this.rootStore,
      dataTransformer: createProjectionTimeSeries,
      enabledFilters: [
        FILTER_TYPES.TIME_PERIOD,
        FILTER_TYPES.GENDER,
        FILTER_TYPES.SUPERVISION_TYPE,
      ],
      chartTitle: "Supervised Population",
      noteCopy: `Historical and projected population data were generated`,
    });
  }
}
