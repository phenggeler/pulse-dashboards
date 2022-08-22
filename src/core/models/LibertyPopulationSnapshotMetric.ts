/*
 * Recidiviz - a data platform for criminal justice reform
 * Copyright (C) 2021 Recidiviz, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * =============================================================================
 *
 */
import { pipe } from "lodash/fp";
import groupBy from "lodash/fp/groupBy";
import map from "lodash/fp/map";
import sumBy from "lodash/fp/sumBy";
import values from "lodash/fp/values";
import { computed, makeObservable } from "mobx";

import { toTitleCase } from "../../utils";
import { downloadChartAsData } from "../../utils/downloads/downloadData";
import { DownloadableData, DownloadableDataset } from "../PageVitals/types";
import { PopulationFilterLabels } from "../types/filters";
import { SnapshotDiffer } from "./backendDiff/SnapshotDiffer";
import PathwaysMetric, { BaseMetricConstructorOptions } from "./PathwaysMetric";
import SnapshotMetric from "./SnapshotMetric";
import { LibertyPopulationSnapshotRecord, TimePeriod } from "./types";
import { filterRecordByDimensions, filterTimePeriod } from "./utils";

export default class LibertyPopulationSnapshotMetric extends PathwaysMetric<LibertyPopulationSnapshotRecord> {
  accessor: keyof LibertyPopulationSnapshotRecord;

  constructor(
    props: BaseMetricConstructorOptions<LibertyPopulationSnapshotRecord> & {
      accessor: keyof LibertyPopulationSnapshotRecord;
    }
  ) {
    super(props);

    makeObservable<LibertyPopulationSnapshotMetric>(this, {
      totalCount: computed,
      dataSeries: computed,
      downloadableData: computed,
    });

    this.accessor = props.accessor;
    this.download = this.download.bind(this);
    this.groupBy = this.accessor;
    this.differ = new SnapshotDiffer(this.accessor);
    this.newBackendMetric = new SnapshotMetric(props);
  }

  get totalCount(): number {
    if (!this.rootStore || !this.allRecords) return -1;
    const { timePeriod } = this.rootStore.filtersStore.filters;

    const allRows = this.allRecords.filter(
      (record: LibertyPopulationSnapshotRecord) => {
        return (
          this.dimensions.every(
            // @ts-ignore
            (dimensionId) => record[dimensionId] === "ALL"
          ) &&
          filterTimePeriod(
            this.hasTimePeriodDimension,
            record.timePeriod,
            timePeriod[0] as TimePeriod
          )
        );
      }
    );

    if (allRows.length === 0) {
      throw new Error(`Metric ${this.id} is missing the "ALL" row`);
    }

    /* Since the counts are not accumulated per time period in the data platform,
     * we must sum the rows to find the total across currently active time periods
     */
    return allRows.map((r) => r.count).reduce((a, b) => a + b, 0);
  }

  get dataSeries(): LibertyPopulationSnapshotRecord[] {
    if (!this.rootStore || !this.allRecords?.length) return [];
    const { filters } = this.rootStore.filtersStore;
    const { timePeriod } = filters;

    const filteredRecords = this.allRecords.filter(
      (record: LibertyPopulationSnapshotRecord) => {
        return (
          filterRecordByDimensions(
            record,
            this.dimensions,
            filters,
            this.accessor
          ) &&
          filterTimePeriod(
            this.hasTimePeriodDimension,
            record.timePeriod,
            timePeriod[0] as TimePeriod
          )
        );
      }
    );

    const result = pipe(
      groupBy((d: LibertyPopulationSnapshotRecord) => [d[this.accessor]]),
      values,
      map((dataset) => {
        const datasetWithoutCount = dataset.map(
          (group: LibertyPopulationSnapshotRecord) => {
            const { count, ...rest } = group;
            return rest;
          }
        );
        return {
          count: sumBy("count", dataset),
          populationProportion: (
            (sumBy("count", dataset) * 100) /
            this.totalCount
          ).toFixed(),
          ...datasetWithoutCount[0],
        };
      })
    )(filteredRecords);

    return result as LibertyPopulationSnapshotRecord[];
  }

  get downloadableData(): DownloadableData | undefined {
    if (!this.dataSeries) return undefined;

    const datasets = [] as DownloadableDataset[];
    const data: Record<string, number>[] = [];
    const labels: string[] = [];

    this.dataSeries.forEach((d: LibertyPopulationSnapshotRecord) => {
      data.push({
        Count: Math.round(d.count),
      });

      if (this.rootStore?.filtersStore) {
        labels.push(
          this.rootStore?.filtersStore.getFilterLabel(
            this.accessor as keyof PopulationFilterLabels,
            d[this.accessor].toString()
          ) || d[this.accessor].toString()
        );
      }
    });

    datasets.push({ data, label: "" });
    return {
      chartDatasets: datasets,
      chartLabels: labels,
      chartId: this.chartTitle,
      dataExportLabel:
        this.rootStore?.filtersStore.filterOptions?.[
          this.accessor as keyof PopulationFilterLabels
        ]?.title || toTitleCase(this.accessor),
    };
  }

  async download(): Promise<void> {
    return downloadChartAsData({
      fileContents: [this.downloadableData],
      chartTitle: this.chartTitle,
      shouldZipDownload: true,
      getTokenSilently: this.rootStore?.userStore.getTokenSilently,
      includeFiltersDescriptionInCSV: true,
      filters: {
        filtersDescription: this.rootStore?.filtersStore.filtersDescription,
      },
      methodologyContent: this.methodology,
    });
  }
}
