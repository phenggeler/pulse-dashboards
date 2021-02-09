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

import React, { useState } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react-lite";

import ModeSwitcher from "../ModeSwitcher";
import RevocationsByDimensionComponent from "./RevocationsByDimensionComponent";

import Loading from "../../../Loading";
import Error from "../../../Error";
import { isDenominatorsMatrixStatisticallySignificant } from "../../../../utils/charts/significantStatistics";
import getLabelByMode from "../utils/getLabelByMode";

const RevocationsByDimension = ({
  chartId,
  dataStore,
  renderChart,
  generateChartData,
  metricTitle,
  chartTitle,
  timeDescription,
  modes,
  defaultMode,
  dataExportLabel,
  includeWarning,
}) => {
  const [mode, setMode] = useState(defaultMode);

  if (dataStore.isLoading) {
    return <Loading />;
  }

  if (dataStore.isError) {
    return <Error />;
  }
  const { data, numerators, denominators, averageRate } = generateChartData(
    mode
  );

  const showWarning =
    includeWarning &&
    !isDenominatorsMatrixStatisticallySignificant(denominators);

  const modeButtons = modes.map((item) => ({
    label: getLabelByMode(item),
    value: item,
  }));

  return (
    <RevocationsByDimensionComponent
      timeDescription={timeDescription}
      chartId={chartId}
      datasets={data.datasets}
      labels={data.labels}
      metricTitle={
        typeof metricTitle === "function" ? metricTitle(mode) : metricTitle
      }
      showWarning={showWarning}
      chartTitle={chartTitle}
      chart={renderChart({
        chartId,
        data,
        denominators,
        numerators,
        mode,
        averageRate,
      })}
      modeSwitcher={
        modes.length ? (
          <ModeSwitcher mode={mode} setMode={setMode} buttons={modeButtons} />
        ) : null
      }
      classModifier={chartId}
      dataExportLabel={dataExportLabel}
    />
  );
};

RevocationsByDimension.defaultProps = {
  modes: [],
  defaultMode: null,
  dataExportLabel: null,
  includeWarning: true,
};

RevocationsByDimension.propTypes = {
  dataStore: PropTypes.shape({
    filteredData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
  }).isRequired,
  chartId: PropTypes.string.isRequired,
  renderChart: PropTypes.func.isRequired,
  generateChartData: PropTypes.func.isRequired,
  metricTitle: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
    .isRequired,
  chartTitle: PropTypes.string.isRequired,
  timeDescription: PropTypes.string.isRequired,
  modes: PropTypes.arrayOf(PropTypes.string),
  defaultMode: PropTypes.string,
  dataExportLabel: PropTypes.string,
  includeWarning: PropTypes.bool,
};

export default observer(RevocationsByDimension);