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

import React from "react";
import PropTypes from "prop-types";

import PerOfficerBarChart from "../common/bars/PerOfficerBarChart";
import { COLORS_FIVE_VALUES } from "../../../assets/scripts/constants/colors";

const chartId = "revocationsByOfficer";

const RevocationCountByOfficer = ({
  revocationCountsByOfficer,
  officeData,
  metricType,
  metricPeriodMonths,
  supervisionType,
  district,
}) => (
  <PerOfficerBarChart
    chartId={chartId}
    exportLabel="Revocations by officer"
    countsPerPeriodPerOfficer={revocationCountsByOfficer}
    officeData={officeData}
    metricType={metricType}
    metricPeriodMonths={metricPeriodMonths}
    supervisionType={supervisionType}
    district={district}
    bars={[
      { key: "absconsion_count", label: "Absconsion" },
      { key: "felony_count", label: "New Offense" },
      { key: "technical_count", label: "Technical" },
      { key: "unknown_count", label: "Unknown Type" },
    ]}
    yAxisLabel={metricType === "counts" ? "Revocation count" : "Percentage"}
    barColorPalette={COLORS_FIVE_VALUES}
  />
);

RevocationCountByOfficer.defaultProps = {
  revocationCountsByOfficer: [],
};

RevocationCountByOfficer.propTypes = {
  revocationCountsByOfficer: PropTypes.arrayOf(PropTypes.shape({})),
  metricType: PropTypes.string.isRequired,
  metricPeriodMonths: PropTypes.string.isRequired,
  supervisionType: PropTypes.string.isRequired,
  district: PropTypes.arrayOf(PropTypes.string).isRequired,
  officeData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default RevocationCountByOfficer;