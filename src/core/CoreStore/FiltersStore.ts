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
import {
  action,
  computed,
  get,
  keys,
  makeAutoObservable,
  observable,
  reaction,
  set,
  toJS,
} from "mobx";
import { QueryParamConfigMap } from "use-query-params";

import { US_DEMO } from "../../RootStore/TenantStore/pathwaysTenants";
import { isDemoMode } from "../../utils/isDemoMode";
import { isOfflineMode } from "../../utils/isOfflineMode";
import { MonthOptions } from "../PopulationTimeSeriesChart/helpers";
import {
  EnabledFiltersByMetric,
  FilterOption,
  Filters,
  PopulationFilterLabels,
  PopulationFilters,
  PopulationFilterValues,
} from "../types/filters";
import { FILTER_TYPES } from "../utils/constants";
import enabledFilters from "../utils/enabledFilters";
import filterOptions, {
  defaultMetricMode,
  DefaultPopulationFilterOptions,
  defaultPopulationFilterValues,
  getFilterOptions,
} from "../utils/filterOptions";
import { formatTimePeriodLabel } from "../utils/timePeriod";
import type CoreStore from ".";

export default class FiltersStore {
  rootStore;

  filters: PopulationFilterValues = defaultPopulationFilterValues;

  metricMode: string = defaultMetricMode;

  constructor({ rootStore }: { rootStore: CoreStore }) {
    makeAutoObservable(this, {
      filters: observable,
      timePeriodLabel: computed,
      setFilters: action,
    });

    this.rootStore = rootStore;
    this.resetFilters = this.resetFilters.bind(this);
    this.getFilterLabel = this.getFilterLabel.bind(this);
    this.getLocationName = this.getLocationName.bind(this);

    reaction(
      () => this.rootStore.metricsStore.current.filters,
      (filters: Filters) => {
        this.clearDisabledFilters(filters);
      }
    );
  }

  setFilters(updatedFilters: Partial<PopulationFilterValues>): void {
    Object.keys(updatedFilters).forEach((filterKey) => {
      set(
        this.filters,
        filterKey,
        updatedFilters[filterKey as keyof PopulationFilters]
      );
    });
  }

  clearDisabledFilters(filters: Filters): void {
    const currentlyEnabledFilters = [
      ...filters.enabledFilters,
      ...(filters.enabledMoreFilters || []),
    ];
    keys(this.filters).forEach((filterType) => {
      if (
        filterType !== FILTER_TYPES.TIME_PERIOD &&
        // @ts-ignore
        !currentlyEnabledFilters.includes(filterType)
      )
        this.setFilters({ [filterType]: ["ALL"] });
    });
  }

  setMetricMode(metricMode: string): void {
    this.metricMode = metricMode;
  }

  resetFilters(): void {
    this.setFilters(defaultPopulationFilterValues);
  }

  get enabledFiltersDefaultQueryString(): QueryParamConfigMap {
    const { current: metric } = this.rootStore.metricsStore;
    const query = {} as QueryParamConfigMap;
    [
      ...metric.filters.enabledFilters,
      ...metric.filters.enabledMoreFilters,
    ].forEach((filterType) => {
      query[filterType] = this.filterOptions[
        filterType as keyof PopulationFilters
      ].defaultOption.label as any;
    });
    return query;
  }

  get timePeriodLabel(): string {
    return formatTimePeriodLabel(get(this.filters, "timePeriod"));
  }

  get monthRange(): MonthOptions {
    // the timePeriod filter will only ever be single-select so always use the 0 index
    return parseInt(this.filters.timePeriod[0]) as MonthOptions;
  }

  get filtersDescription(): string {
    const metric = this.rootStore.metricsStore.current;
    const filters = toJS(this.filters);
    const filtersStrings = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (
          metric.filters.enabledFilters.includes(key) ||
          metric.filters.enabledMoreFilters?.includes(key)
        ) {
          const { title } = this.filterOptions[key as keyof PopulationFilters];
          acc.push(
            `${title}:, ${
              this.filtersLabels[key as keyof PopulationFilterLabels]
            }`
          );
        }

        return acc;
      },
      [] as string[]
    );
    return filtersStrings.join("\n").concat("\n");
  }

  get currentMetricMode(): string {
    return this.metricMode;
  }

  get filtersLabels(): PopulationFilterLabels {
    return keys(this.filters).reduce((acc, filterType) => {
      const filter = this.filterOptions[
        filterType as keyof PopulationFilterLabels
      ];
      const labels = getFilterOptions(
        this.filters[filter.type] as string[],
        filter.options
      )
        .map((o) => o.label)
        .join(",");
      acc[filterType as keyof PopulationFilterLabels] = labels;
      return acc;
    }, {} as PopulationFilterLabels);
  }

  get enabledFilters(): EnabledFiltersByMetric {
    // @ts-ignore
    return this.rootStore.currentTenantId
      ? enabledFilters[this.rootStore.currentTenantId]
      : undefined;
  }

  get filterOptions(): PopulationFilters {
    return this.rootStore.currentTenantId
      ? filterOptions[
          isDemoMode() || isOfflineMode()
            ? US_DEMO
            : this.rootStore.currentTenantId
        ]
      : DefaultPopulationFilterOptions;
  }

  getFilterLabel(
    filterType: keyof PopulationFilters,
    filterValue: string
  ): string {
    return (
      this.filterOptions[filterType].options.find(
        (option: FilterOption) => option.value === filterValue
      )?.label || ""
    );
  }

  getLocationName(
    filterType: keyof PopulationFilters,
    locationValue: string
  ): string | undefined {
    const { locationNameMap } = this.filterOptions[filterType];
    return locationNameMap ? locationNameMap[locationValue] : undefined;
  }
}
