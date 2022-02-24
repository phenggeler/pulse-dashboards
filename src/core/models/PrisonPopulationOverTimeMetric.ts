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

import { pipe } from "lodash/fp";
import groupBy from "lodash/fp/groupBy";
import map from "lodash/fp/map";
import sumBy from "lodash/fp/sumBy";
import values from "lodash/fp/values";
import { computed, makeObservable } from "mobx";

import { formatDate } from "../../utils";
import { downloadChartAsData } from "../../utils/downloads/downloadData";
import { DownloadableData, DownloadableDataset } from "../PagePractices/types";
import { formatMonthAndYear } from "../PopulationTimeSeriesChart/helpers";
import PathwaysMetric, { BaseMetricConstructorOptions } from "./PathwaysMetric";
import { PrisonPopulationTimeSeriesRecord } from "./types";
import { filterRecords, getRecordDate } from "./utils";

export default class PrisonPopulationOverTimeMetric extends PathwaysMetric<PrisonPopulationTimeSeriesRecord> {
  constructor(
    props: BaseMetricConstructorOptions<PrisonPopulationTimeSeriesRecord>
  ) {
    super(props);

    makeObservable<PrisonPopulationOverTimeMetric>(this, {
      mostRecentDate: computed,
      dataSeries: computed,
      downloadableData: computed,
    });

    this.download = this.download.bind(this);
  }

  get dataSeries(): PrisonPopulationTimeSeriesRecord[] {
    if (!this.rootStore || !this.allRecords?.length) return [];
    const { filters } = this.rootStore.filtersStore;
    const { monthRange } = this.rootStore.filtersStore;
    const { mostRecentDate } = this;
    const stepSize = monthRange === 60 ? 2 : 1;

    const filteredRecords = this.allRecords.filter(
      (record: PrisonPopulationTimeSeriesRecord) => {
        const monthsOut =
          (record.year - mostRecentDate.getFullYear()) * 12 +
          (record.month - (mostRecentDate.getMonth() + 1));
        return (
          Math.abs(monthsOut) <= monthRange &&
          monthsOut % stepSize === 0 &&
          filterRecords(record, this.dimensions, filters)
        );
      }
    );

    const result = pipe(
      groupBy((d: PrisonPopulationTimeSeriesRecord) => [d.year, d.month]),
      values,
      map((dataset) => {
        const datasetWithoutCount = dataset.map(
          (group: PrisonPopulationTimeSeriesRecord) => {
            const { count, avg90day, ...rest } = group;
            return rest;
          }
        );
        return {
          count: sumBy("count", dataset),
          avg90day: sumBy("avg90day", dataset),
          ...datasetWithoutCount[0],
        };
      })
    )(filteredRecords);

    return result as PrisonPopulationTimeSeriesRecord[];
  }

  get mostRecentDate(): Date {
    const { allRecords } = this;

    if (!allRecords || allRecords.length === 0) {
      return new Date(9999, 11, 31);
    }

    return getRecordDate(allRecords.slice(-1)[0]);
  }

  get downloadableData(): DownloadableData | undefined {
    if (!this.dataSeries) return undefined;

    const datasets = [] as DownloadableDataset[];
    const data: Record<string, number>[] = [];
    const labels: string[] = [];

    this.dataSeries.forEach((d: PrisonPopulationTimeSeriesRecord) => {
      data.push({
        Population: Math.round(d.count),
        ...(d.avg90day && {
          "3-month rolling average": Math.round(d.avg90day),
        }),
      });

      labels.push(formatMonthAndYear(getRecordDate(d)));
    });

    datasets.push({ data, label: "" });

    return {
      chartDatasets: datasets,
      chartLabels: labels,
      chartId: this.chartTitle,
      dataExportLabel: "Month",
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
      lastUpdatedOn: formatDate(this.mostRecentDate),
      methodologyContent: this.methodology,
    });
  }
}
