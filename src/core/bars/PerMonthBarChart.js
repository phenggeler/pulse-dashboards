// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
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

import map from "lodash/fp/map";
import mergeAllWith from "lodash/fp/mergeAllWith";
import pipe from "lodash/fp/pipe";
import reduce from "lodash/fp/reduce";
import values from "lodash/fp/values";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";

import { COLORS } from "../../assets/scripts/constants/colors";
import { toNumber } from "../../utils";
import { sortFilterAndSupplementMostRecentMonths } from "../../utils/datasets";
import { METRIC_MODES } from "../utils/constants";
import {
  filterDatasetByDistrict,
  filterDatasetBySupervisionType,
} from "../utils/dataFilters";
import { metricModePropType } from "../utils/propTypes";
import { monthNamesWithYearsFromNumbers } from "../utils/timePeriod";
import {
  toggleLabel,
  toggleYAxisTicksStackedRateBasicCount,
  updateTooltipForMetricType,
} from "../utils/tooltips";
import {
  configureDownloads,
  ensureWrappedInArray,
  groupByMonth,
  mergeAllResolver,
  sum,
} from "./utils";

export const prepareDataGroupedByMonth = (metricType, bars) => (data) => {
  const { year, month } = data;

  const monthCounts = reduce(
    (acc, { key }) => {
      const { [key]: d } = data;
      return { ...acc, [key]: Number(d) };
    },
    {},
    bars
  );

  const totalCount = pipe(values, reduce(sum, 0))(monthCounts);

  if (metricType === METRIC_MODES.COUNTS) {
    return {
      year,
      month,
      monthDict: monthCounts,
    };
  }
  if (metricType === METRIC_MODES.RATES) {
    const monthRates = {};

    Object.keys(monthCounts).forEach((key) => {
      const count = monthCounts[key];
      monthRates[key] = Number((100 * (count / totalCount)).toFixed(2));
    });

    return {
      year,
      month,
      monthDict: monthRates,
    };
  }
  return null;
};

const PerMonthBarChart = ({
  chartId,
  exportLabel,
  countsByMonth,
  metricType,
  numMonths,
  filters: { district: visibleOffices, supervisionType },
  bars,
  yAxisLabel,
  barColorPalette,
  dataExportLabel,
  getTokenSilently,
}) => {
  const months = toNumber(numMonths);
  const barKeys = map("key", bars);
  const emptyMonthDict = barKeys.reduce(
    (monthCounts, key) => ({ ...monthCounts, [key]: 0 }),
    {}
  );

  const dataPoints = pipe(
    (dataset) =>
      visibleOffices
        ? filterDatasetByDistrict(dataset, visibleOffices)
        : dataset,
    (dataset) =>
      supervisionType
        ? filterDatasetBySupervisionType(dataset, supervisionType)
        : dataset,
    groupByMonth(barKeys),
    map(prepareDataGroupedByMonth(metricType, bars)),
    (dataset) =>
      sortFilterAndSupplementMostRecentMonths(
        dataset,
        months,
        "monthDict",
        emptyMonthDict
      )
  )(countsByMonth);

  const chartLabels = pipe(map("month"), (monthLabels) =>
    monthNamesWithYearsFromNumbers(monthLabels, true)
  )(dataPoints);

  const dataArrays = pipe(
    map("monthDict"),
    mergeAllWith(mergeAllResolver),
    ensureWrappedInArray
  )(dataPoints);

  useEffect(() => {
    configureDownloads({
      chartId,
      chartLabels,
      countsByType: dataArrays,
      visibleOffices,
      exportLabel,
      bars,
      filters: { metricType, visibleOffices },
      dataExportLabel,
      getTokenSilently,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTokenSilently, metricType, visibleOffices]);

  return (
    <Bar
      id={chartId}
      data={{
        labels: chartLabels,
        datasets: bars.map((bar, i) => ({
          label: bar.label,
          backgroundColor: barColorPalette[i],
          hoverBackgroundColor: barColorPalette[i],
          hoverBorderColor: barColorPalette[i],
          data: dataArrays[bar.key],
        })),
      }}
      options={{
        plugins: {
          datalabels: {
            display: false,
          },
        },
        responsive: true,
        legend: {
          position: "bottom",
          boxWidth: 10,
        },
        tooltips: {
          backgroundColor: COLORS["grey-800-light"],
          mode: "index",
          intersect: false,
          callbacks: {
            label: (tooltipItem, data) =>
              updateTooltipForMetricType(metricType, tooltipItem, data),
          },
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Month",
              },
              stacked: true,
            },
          ],
          yAxes: [
            {
              ticks: toggleYAxisTicksStackedRateBasicCount(
                metricType,
                undefined
              ),
              scaleLabel: {
                display: true,
                labelString: toggleLabel(
                  { [metricType]: yAxisLabel },
                  metricType
                ),
              },
              stacked: true,
            },
          ],
        },
      }}
    />
  );
};

PerMonthBarChart.defaultProps = {
  countsByMonth: [],
  filters: {},
  dataExportLabel: "Month",
};

PerMonthBarChart.propTypes = {
  getTokenSilently: PropTypes.func.isRequired,
  chartId: PropTypes.string.isRequired,
  exportLabel: PropTypes.string.isRequired,
  countsByMonth: PropTypes.arrayOf(PropTypes.shape({})),
  metricType: metricModePropType.isRequired,
  numMonths: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    district: PropTypes.arrayOf(PropTypes.string),
    supervisionType: PropTypes.string,
  }),
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  yAxisLabel: PropTypes.string.isRequired,
  barColorPalette: PropTypes.arrayOf(PropTypes.string).isRequired,
  dataExportLabel: PropTypes.string,
};

export default PerMonthBarChart;
