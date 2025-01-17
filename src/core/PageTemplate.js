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

import "../assets/styles/index.scss";
import "./PageTemplate.scss";

import PropTypes from "prop-types";
import React from "react";

import ImportantNotesBar from "./ImportantNotesBar";

const PageTemplate = ({
  children,
  importantNotes,
  filters = null,
  leftPanel = null,
  mobileNavigation = null,
}) => (
  <div className="PageTemplate">
    {mobileNavigation}
    <div className="PageTemplate__left-panel">{leftPanel}</div>
    <div className="PageTemplate__body">
      {filters}
      <div className="row gap-20 pos-r">
        {importantNotes.length !== 0 && (
          <ImportantNotesBar importantNotes={importantNotes} />
        )}
        <div className="PageTemplate__content">{children}</div>
      </div>
    </div>
  </div>
);

PageTemplate.defaultProps = {
  importantNotes: [],
  filters: null,
  leftPanel: null,
  mobileNavigation: null,
};

PageTemplate.propTypes = {
  children: PropTypes.node.isRequired,
  importantNotes: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    }).isRequired
  ),
  filters: PropTypes.node,
  leftPanel: PropTypes.node,
  mobileNavigation: PropTypes.node,
};

export default PageTemplate;
