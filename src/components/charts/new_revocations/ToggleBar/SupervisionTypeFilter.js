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

import Select from "../../../controls/Select";
import FilterField from "./FilterField";

const SupervisionTypeFilter = ({ options, defaultValue, onChange }) => {
  return (
    <FilterField label="Supervision Type">
      <Select
        className="select-align"
        options={options}
        onChange={(option) => {
          onChange({ supervisionType: option.value });
        }}
        defaultValue={defaultValue}
      />
    </FilterField>
  );
};

SupervisionTypeFilter.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
  ).isRequired,
  defaultValue: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SupervisionTypeFilter;