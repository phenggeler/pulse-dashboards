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
// ===================== ========================================================

import { observer } from "mobx-react-lite";
import React from "react";

import PopulationProjectionOverTimeMetric from "../models/PopulationProjectionOverTimeMetric";
import PopulationSummaryMetrics from "../PopulationSummaryMetrics";
import { PopulationProjectionTimeSeriesChart } from "../PopulationTimeSeriesChart";

type VizPopulationProjectionOverTimeProps = {
  metric: PopulationProjectionOverTimeMetric;
};

const VizPopulationProjectionOverTime: React.FC<VizPopulationProjectionOverTimeProps> = ({
  metric,
}) => {
  const { dataSeries, chartTitle, error, simulationDate, isLoading } = metric;

  return (
    <>
      <PopulationSummaryMetrics
        data={dataSeries}
        simulationDate={simulationDate}
        isLoading={isLoading}
        isError={error}
      />
      <PopulationProjectionTimeSeriesChart
        metric={metric}
        data={dataSeries}
        title={chartTitle}
      />
    </>
  );
};

export default observer(VizPopulationProjectionOverTime);
