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

import { observer } from "mobx-react-lite";
import PropTypes from "prop-types";
import React from "react";

import flags from "../../flags";
import { translate } from "../../utils/i18nSettings";
import { useDataStore } from "../LanternStoreProvider";
import PercentRevokedChart from "../PercentRevokedChart";
import RevocationCountChart from "../RevocationCountChart";
import RevocationsByDimension from "../RevocationsByDimension";
import createGenerateChartData from "./createGenerateChartData";

const MAX_OFFICERS_COUNT = 50;
const DEFAULT_MODE = "counts";

const RevocationsByOfficer = observer(
  ({ containerHeight, timeDescription }, ref) => {
    const dataStore = useDataStore();
    const { revocationsChartStore } = dataStore;
    const CHART_TITLE = `${translate("revocationsByOfficerChartTitle")}`;
    const CHART_ID = `${translate("revocationsByOfficerChartId")}`;

    const includeWarning = false;
    // TODO 830 - re-enable rate line once data is ready
    const hideRateLine = true;

    return (
      <RevocationsByDimension
        ref={ref}
        chartId={CHART_ID}
        dataStore={revocationsChartStore}
        containerHeight={containerHeight}
        includeWarning={includeWarning}
        renderChart={({
          chartId,
          data,
          denominators,
          numerators,
          averageRate,
          mode,
        }) => {
          const slicedData = {
            datasets: data.datasets.map((dataset) => ({
              ...dataset,
              data: dataset.data.slice(0, MAX_OFFICERS_COUNT),
            })),
            labels: data.labels.slice(0, MAX_OFFICERS_COUNT),
          };

          return mode === "counts" ? (
            <RevocationCountChart
              chartId={chartId}
              data={slicedData}
              xAxisLabel={`District - ${translate("Officer")} name`}
            />
          ) : (
            <PercentRevokedChart
              data={slicedData}
              chartId={chartId}
              numerators={numerators}
              denominators={denominators}
              averageRate={averageRate}
              xAxisLabel={`District-${translate("Officer")} name`}
              yAxisLabel={
                mode === "rates"
                  ? translate("percentOfPopulationRevoked")
                  : `Percent ${translate("revoked")} out of all exits`
              }
              includeWarning={includeWarning}
              hideRateLine={hideRateLine}
            />
          );
        }}
        generateChartData={createGenerateChartData(
          revocationsChartStore.filteredData
        )}
        chartTitle={CHART_TITLE}
        metricTitle={CHART_TITLE}
        timeDescription={timeDescription}
        modes={
          flags.enableRevocationRateByExit
            ? ["counts", "rates", "exits"]
            : ["counts", "rates"]
        }
        defaultMode={DEFAULT_MODE}
        dataExportLabel={translate("Officer")}
      />
    );
  },
  { forwardRef: true }
);

RevocationsByOfficer.defaultProps = { containerHeight: null };

RevocationsByOfficer.propTypes = {
  containerHeight: PropTypes.number,
  timeDescription: PropTypes.string.isRequired,
};

export default RevocationsByOfficer;
