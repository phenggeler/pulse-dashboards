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

import "./PathwaysLayout.scss";

import { observer } from "mobx-react-lite";
import React from "react";

import Footer from "../components/Footer";
import IE11Banner from "../components/IE11Banner";
import useIntercom from "../hooks/useIntercom";
import CoreStoreProvider from "./CoreStoreProvider";
import ErrorBoundary from "./ErrorBoundary";
import PathwaysNavigation from "./PathwaysNavigation";
import ViewNavigation from "./ViewNavigation";

interface Props {
  children: React.ReactElement;
}

const PathwaysLayout: React.FC<Props> = ({ children }): React.ReactElement => {
  useIntercom();
  return (
    <CoreStoreProvider>
      <ErrorBoundary>
        <div id="app" className="PathwaysLayout">
          <ViewNavigation />
          <div className="PathwaysLayout__main">
            <div className="PathwaysLayout__header">
              <PathwaysNavigation />
            </div>
            <IE11Banner />
            {children}
            <Footer />
          </div>
        </div>
      </ErrorBoundary>
    </CoreStoreProvider>
  );
};

export default observer(PathwaysLayout);