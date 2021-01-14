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
import { get } from "mobx";

import ModeSwitcher from "../ModeSwitcher";
import RevocationsByDimensionComponent from "./RevocationsByDimensionComponent";

import useChartData from "../../../../hooks/useChartData";
import Loading from "../../../Loading";
import Error from "../../../Error";
import { isDenominatorsMatrixStatisticallySignificant } from "../../../../utils/charts/significantStatistics";
import getLabelByMode from "../utils/getLabelByMode";
import { DISTRICT } from "../../../../constants/filterTypes";
import { useRootStore } from "../../../../StoreProvider";

const RevocationsByDimension = ({
  chartId,
  apiUrl,
  apiFile,
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
  const { filters } = useRootStore();
  const currentDistricts = get(filters, DISTRICT);
  const [mode, setMode] = useState(defaultMode);

  const { isLoading, isError, apiData, unflattenedValues } = useChartData(
    apiUrl,
    apiFile,
    false
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }
  const { data, numerators, denominators, averageRate } = generateChartData(
    apiData,
    mode,
    unflattenedValues,
    currentDistricts.map((d) => d.toLowerCase())
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
  chartId: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  apiFile: PropTypes.string.isRequired,
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
