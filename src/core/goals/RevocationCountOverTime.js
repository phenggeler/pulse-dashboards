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
import pipe from "lodash/fp/pipe";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";

import { COLORS, CORE_COLORS } from "../../assets/scripts/constants/colors";
import { toNumber } from "../../utils";
import {
  centerSingleMonthDatasetIfNecessary,
  sortFilterAndSupplementMostRecentMonths,
} from "../../utils/datasets";
import { groupByMonth } from "../bars/utils";
import { configureDownloadButtons } from "../utils/configureDownloadButtons";
import { METRIC_MODES } from "../utils/constants";
import {
  filterDatasetByDistrict,
  filterDatasetBySupervisionType,
} from "../utils/dataFilters";
import {
  chartAnnotationForGoal,
  getGoalForChart,
  getMaxForGoalAndDataIfGoalDisplayable,
} from "../utils/metricGoal";
import { metricModePropType } from "../utils/propTypes";
import { monthNamesWithYearsFromNumbers } from "../utils/timePeriod";
import {
  canDisplayGoal,
  toggleLabel,
  toggleYAxisTicksFor,
  updateTooltipForMetricType,
} from "../utils/tooltips";

const dataCountsMapper = ({ year, month, revocation_count: count }) => ({
  year,
  month,
  value: count,
});

const dataRatesMapper = ({
  year,
  month,
  revocation_count: count,
  total_supervision_count: totalCount,
}) => ({
  year,
  month,
  value: ((100 * count) / totalCount).toFixed(2),
});

const chartId = "revocationCountsByMonth";
const stepSize = 10;

const RevocationCountOverTime = ({
  revocationCountsByMonth: countsByMonth,
  supervisionType,
  district,
  metricType,
  metricPeriodMonths,
  disableGoal = false,
  header,
  stateCode,
  getTokenSilently,
}) => {
  const goal = getGoalForChart(stateCode, chartId);

  const chartDataPoints = pipe(
    (dataset) => filterDatasetBySupervisionType(dataset, supervisionType),
    (dataset) => filterDatasetByDistrict(dataset, district),
    groupByMonth(["revocation_count", "total_supervision_count"]),
    map(metricType === METRIC_MODES.RATES ? dataRatesMapper : dataCountsMapper),
    (dataset) =>
      sortFilterAndSupplementMostRecentMonths(
        dataset,
        toNumber(metricPeriodMonths),
        "value",
        0
      )
  )(countsByMonth);

  const chartDataValues = chartDataPoints.map((element) => element.value);
  const chartLabels = monthNamesWithYearsFromNumbers(
    map("month", chartDataPoints),
    true
  );

  const chartMinValue = 0;
  const chartMaxValue = getMaxForGoalAndDataIfGoalDisplayable(
    goal,
    chartDataValues,
    stepSize,
    { disableGoal, metricType, supervisionType, district }
  );

  centerSingleMonthDatasetIfNecessary(chartDataValues, chartLabels);

  const displayGoal = canDisplayGoal(goal, {
    disableGoal,
    metricType,
    supervisionType,
    district,
  });

  function goalLineIfApplicable() {
    if (displayGoal) {
      return chartAnnotationForGoal(
        goal,
        "revocationCountsByMonthGoalLine",
        {}
      );
    }
    return null;
  }

  const chart = (
    <Line
      id={chartId}
      data={{
        labels: chartLabels,
        datasets: [
          {
            label: toggleLabel(
              { counts: "Revocation count", rates: "Revocation rate" },
              metricType
            ),
            backgroundColor: CORE_COLORS.indigo.main,
            borderColor: CORE_COLORS.indigo.main,
            pointBackgroundColor: CORE_COLORS.indigo.main,
            pointHoverBackgroundColor: CORE_COLORS.indigo.main,
            pointHoverBorderColor: CORE_COLORS.indigo.main,
            fill: false,
            borderWidth: 2,
            data: chartDataValues,
          },
        ],
      }}
      options={{
        plugins: {
          datalabels: {
            display: false,
          },
        },
        legend: {
          display: false,
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
          },
        },
        scales: {
          yAxes: [
            {
              ticks: toggleYAxisTicksFor(
                METRIC_MODES.COUNTS,
                metricType,
                chartMinValue,
                chartMaxValue,
                stepSize
              ),
              scaleLabel: {
                display: true,
                labelString: toggleLabel(
                  { counts: "Revocation count", rates: "Percentage" },
                  metricType
                ),
              },
              stacked: true,
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
        tooltips: {
          backgroundColor: COLORS["grey-800-light"],
          mode: "x",
          callbacks: {
            label: (tooltipItem, data) =>
              updateTooltipForMetricType(metricType, tooltipItem, data),
          },
        },
        annotation: goalLineIfApplicable(),
      }}
    />
  );

  useEffect(() => {
    configureDownloadButtons({
      chartId,
      chartTitle: "REVOCATION ADMISSIONS BY MONTH",
      chartDatasets: chart.props.data.datasets,
      chartLabels: chart.props.data.labels,
      chartBox: document.getElementById(chartId),
      filters: { metricType, supervisionType, district },
      convertValuesToNumbers: true,
      handleTimeStringLabels: true,
      getTokenSilently,
    });
  }, [
    getTokenSilently,
    metricType,
    district,
    supervisionType,
    chart.props.data.datasets,
    chart.props.data.labels,
  ]);

  const chartData = chart.props.data.datasets[0].data;
  const mostRecentValue = chartData[chartData.length - 1];

  useEffect(() => {
    const headerElement = document.getElementById(header);

    if (headerElement && mostRecentValue !== null && displayGoal) {
      const title = `There have been <span class='fs-block header-highlight'>${mostRecentValue} revocations</span> that led to incarceration in a DOCR facility this month so far.`;
      headerElement.innerHTML = title;
    } else if (headerElement) {
      headerElement.innerHTML = "";
    }
  }, [displayGoal, header, mostRecentValue]);

  return chart;
};

RevocationCountOverTime.defaultProps = {
  disableGoal: false,
  header: null,
};

RevocationCountOverTime.propTypes = {
  district: PropTypes.arrayOf(PropTypes.string).isRequired,
  metricPeriodMonths: PropTypes.string.isRequired,
  metricType: metricModePropType.isRequired,
  stateCode: PropTypes.string.isRequired,
  supervisionType: PropTypes.string.isRequired,
  revocationCountsByMonth: PropTypes.arrayOf(
    PropTypes.shape({
      district: PropTypes.string.isRequired,
      month: PropTypes.string.isRequired,
      revocation_count: PropTypes.string.isRequired,
      state_code: PropTypes.string.isRequired,
      supervision_type: PropTypes.string.isRequired,
      total_supervision_count: PropTypes.string.isRequired,
      year: PropTypes.string.isRequired,
    })
  ).isRequired,
  disableGoal: PropTypes.bool,
  header: PropTypes.string,
  getTokenSilently: PropTypes.func.isRequired,
};

export default RevocationCountOverTime;
