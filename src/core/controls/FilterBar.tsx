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
import React from "react";
import Sticky from "react-sticky-fill";
import "./FilterBar.scss";

const FILTER_BAR_STYLE = {
  zIndex: 700,
  top: 79,
};

const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sticky style={FILTER_BAR_STYLE}>
      <div className="FilterBar">
        <div className="FilterBar__filters">{children}</div>
      </div>
    </Sticky>
  );
};

export default FilterBar;