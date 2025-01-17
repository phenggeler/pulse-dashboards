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

import { snakeCase } from "lodash";
import {
  action,
  comparer,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from "mobx";

import { callNewMetricsApi } from "../../api/metrics/metricsClient";
import RootStore from "../../RootStore";
import { getMethodologyCopy, getMetricCopy } from "../content";
import { MetricContent, PageContent } from "../content/types";
import CoreStore from "../CoreStore";
import { Filters, PopulationFilterValues } from "../types/filters";
import { PathwaysPage } from "../views";
import PathwaysMetric from "./PathwaysMetric";
import {
  MetricId,
  MetricRecord,
  NewBackendRecord,
  PathwaysMetricRecords,
  SimulationCompartment,
  TenantId,
} from "./types";
import { formatDateString, getTimePeriodRawValue } from "./utils";

export type BaseNewMetricConstructorOptions = {
  id: MetricId;
  endpoint: string;
  rootStore: CoreStore;
  filters?: Filters;
  enableMetricModeToggle?: boolean;
  compartment?: SimulationCompartment;
  isHorizontal?: boolean;
  isGeographic?: boolean;
  rotateLabels?: boolean;
  accessorIsNotFilterType?: boolean;
};

export default abstract class PathwaysNewBackendMetric<
  RecordFormat extends MetricRecord
> {
  readonly id: MetricId;

  readonly endpoint: string;

  readonly rootStore: CoreStore;

  readonly filters: Filters;

  readonly enableMetricModeToggle: boolean;

  readonly tenantId?: TenantId;

  readonly isHorizontal: boolean;

  readonly isGeographic: boolean;

  readonly rotateLabels: boolean;

  readonly accessorIsNotFilterType: boolean;

  isLoading?: boolean;

  protected allRecords?: RecordFormat[];

  error?: Error;

  lastUpdated?: Date;

  constructor({
    id,
    endpoint,
    rootStore,
    filters,
    enableMetricModeToggle = false,
    isHorizontal = false,
    isGeographic = false,
    rotateLabels = false,
    accessorIsNotFilterType = false,
  }: BaseNewMetricConstructorOptions) {
    this.id = id;
    this.endpoint = endpoint;
    this.rootStore = rootStore;
    this.tenantId = rootStore.currentTenantId;
    this.filters = filters ?? rootStore.filtersStore.enabledFilters[id];
    this.enableMetricModeToggle = enableMetricModeToggle;
    this.isHorizontal = isHorizontal;
    this.isGeographic = isGeographic;
    this.rotateLabels = rotateLabels;
    this.accessorIsNotFilterType = accessorIsNotFilterType;

    makeObservable<PathwaysNewBackendMetric<RecordFormat>, "allRecords">(this, {
      allRecords: observable.ref,
      error: observable,
      hydrate: action,
      isLoading: observable,
    });

    reaction(
      () => {
        // Use toJS to ensure we access all the values of the filters. Reactions are only triggered
        // if data was accessed in the data function (this one), and so just returning
        // this.rootStore?.filters isn't enough to track a change to a property of filters.
        return toJS(this.rootStore.filters);
      },
      () => {
        // Update the data in allRecords when a filter changes, but only after allRecords has been
        // read the first time.
        if (!this.isHydrated) return;

        this.hydrate();
      },
      {
        // Use a structural comparison instead of the default '==='. This actually compares the
        // values of the filters, and ensures that if a user clicks on the filter value that's
        // already selected, we don't make another API call (because the comparer will return false,
        // so the reaction won't be entered).
        // This solves a different problem than the toJS call above! The above one solves the
        // problem where we always think things are equal because we aren't seeing changes to filter
        // values at all. This one solves the problem where we always think things are different
        // because two objects with all the same properties don't compare as equal with ===.
        equals: comparer.structural,
      }
    );
  }

  get isHydrated(): boolean {
    return this.isLoading === false && this.error === undefined;
  }

  getQueryParams(): URLSearchParams {
    const queryParams = new URLSearchParams();
    if (!this.rootStore) {
      return queryParams;
    }
    const filterValues = this.rootStore.filters;

    this.filters.enabledFilters.forEach((filter) => {
      const key = filter as keyof PopulationFilterValues;
      const values = filterValues[key];
      const queryKey = snakeCase(key);
      if (values) {
        values.forEach((val: any) => {
          if (queryKey === "time_period") {
            const timePeriod = getTimePeriodRawValue(val);
            if (timePeriod) {
              queryParams.append(`filters[${queryKey}]`, timePeriod);
            }
          } else if (val !== "ALL") {
            queryParams.append(`filters[${queryKey}]`, val);
          }
        });
      }
    });
    return queryParams;
  }

  abstract get dataSeries(): PathwaysMetricRecords;

  abstract get dataSeriesForDiffing(): RecordFormat[];

  get content(): MetricContent {
    return getMetricCopy(this.rootStore?.currentTenantId)[this.id];
  }

  get chartTitle(): string {
    return this.content.title;
  }

  /**
   * Returns the note copy, unformatted. Child metric classes can override this
   * function and format the note if necessary.
   */
  get note(): string | undefined {
    return this.content.note;
  }

  get chartXAxisTitle(): string | undefined {
    return this.content.chartXAxisTitle;
  }

  get chartYAxisTitle(): string | undefined {
    return this.content.chartYAxisTitle;
  }

  /**
   * Returns the methodology copy specific to this metric.
   * Page methodology + metric methodology.
   */
  get methodology(): (PageContent | MetricContent)[] {
    if (!this.rootStore?.currentTenantId) return [];
    const methodology = getMethodologyCopy(this.rootStore.currentTenantId)
      .system;
    if (!methodology?.metricCopy || !methodology?.pageCopy) return [];

    return [
      methodology.pageCopy[this.rootStore.page as PathwaysPage],
      methodology.metricCopy[this.id],
    ];
  }

  protected async fetchNewMetrics(
    params: URLSearchParams
  ): Promise<NewBackendRecord<RecordFormat>> {
    return this.endpoint &&
      process.env.REACT_APP_DEPLOY_ENV !== "production" &&
      process.env.REACT_APP_NEW_BACKEND_API_URL
      ? callNewMetricsApi(
          `${this.tenantId}/${this.endpoint}?${params.toString()}`,
          RootStore.getTokenSilently
        )
      : Promise.resolve({});
  }

  /**
   * Fetches metric data and stores the result reactively on this Metric instance.
   */
  async hydrate(): Promise<void> {
    if (PathwaysMetric.backendForMetric(this.id) === "OLD") {
      return Promise.resolve();
    }
    this.isLoading = true;
    this.error = undefined;
    this.fetchNewMetrics(this.getQueryParams())
      .then((fetchedData) => {
        runInAction(() => {
          this.allRecords = fetchedData.data;
          this.lastUpdated = formatDateString(
            fetchedData.metadata?.lastUpdated
          );
          this.isLoading = false;
        });
      })
      .catch((e) => {
        this.isLoading = false;
        this.error = e;
      });
  }

  get records(): RecordFormat[] | undefined {
    return this.allRecords;
  }
}
