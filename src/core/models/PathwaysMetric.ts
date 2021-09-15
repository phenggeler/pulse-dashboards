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

import { action, makeObservable, observable, runInAction } from "mobx";

import { parseResponseByFileFormat } from "../../api/metrics";
import { callMetricsApi } from "../../api/metrics/metricsClient";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import RootStore from "../../RootStore";
import CoreStore from "../CoreStore";
import { EnabledFilters } from "../types/filters";
import { Hydratable, MetricRecord, RawMetricData, TenantId } from "./types";

export type BaseMetricConstructorOptions<RecordFormat extends MetricRecord> = {
  tenantId?: TenantId;
  sourceFilename: string;
  dataTransformer: (d: RawMetricData) => RecordFormat[];
  rootStore?: CoreStore;
  enabledFilters: EnabledFilters;
};

/**
 * Represents a single dataset backed by our metrics API,
 * plus any applicable metadata.
 * This is an abstract class that cannot be instantiated directly!
 * See subclasses that narrow this base down to a specific metric format.
 * The preferred way to instantiate `Metric` subclasses is in the
 * MetricsStore.
 */
export default abstract class PathwaysMetric<RecordFormat extends MetricRecord>
  implements Hydratable {
  rootStore?: CoreStore;

  readonly tenantId?: TenantId;

  // data properties
  protected readonly sourceFilename: string;

  protected dataTransformer: (d: RawMetricData) => RecordFormat[];

  eagerExpand: boolean;

  isLoading?: boolean;

  protected allRecords?: RecordFormat[];

  error?: Error;

  // filter properties
  enabledFilters: EnabledFilters;

  constructor({
    rootStore,
    tenantId,
    sourceFilename,
    dataTransformer,
    enabledFilters,
  }: BaseMetricConstructorOptions<RecordFormat>) {
    makeObservable<PathwaysMetric<RecordFormat>, "allRecords">(this, {
      allRecords: observable.ref,
      error: observable,
      hydrate: action,
      isLoading: observable,
    });

    this.rootStore = rootStore;

    this.tenantId = tenantId;
    this.sourceFilename = sourceFilename;
    this.dataTransformer = dataTransformer;
    this.eagerExpand = true;

    this.enabledFilters = enabledFilters;
  }

  /**
   * Fetches metric data and stores the result reactively on this Metric instance.
   */
  async hydrate(): Promise<void> {
    this.isLoading = true;
    try {
      const fetchedData = await this.fetchAndTransform();
      runInAction(() => {
        this.allRecords = fetchedData;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.isLoading = false;
        this.error = e;
      });
    }
  }

  /**
   * Implements the standard retrieval for a single metric:
   * fetches one metric, applies a transformation function to it,
   * and throws an error if no data could be fetched.
   */
  protected async fetchAndTransform(): Promise<RecordFormat[]> {
    const apiResponse = await this.fetchMetrics();
    if (apiResponse[this.sourceFilename]) {
      const parsedData = parseResponseByFileFormat(
        apiResponse,
        this.sourceFilename,
        this.eagerExpand
      );
      return this.dataTransformer(parsedData.data);
    }
    throw new Error(ERROR_MESSAGES.noMetricData);
  }

  /**
   * Fetches the metric data from the server.
   */
  protected async fetchMetrics(): Promise<Record<string, RawMetricData>> {
    const endpoint = `${this.tenantId}/pathways/${this.sourceFilename}`.toLowerCase();
    return callMetricsApi(endpoint, RootStore.getTokenSilently);
  }

  get records(): RecordFormat[] | undefined {
    return this.allRecords;
  }
}