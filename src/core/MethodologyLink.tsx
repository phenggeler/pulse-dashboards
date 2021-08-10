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
import "./DetailsGroup.scss";

import { Icon, IconSVG } from "@recidiviz/design-system";
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";

import { useRootStore } from "../components/StoreProvider";
import * as styles from "./CoreConstants.scss";

const MethodologyLink: React.FC<{ path: string }> = ({ path }) => {
  const { currentTenantId } = useRootStore();
  return (
    <Link
      className="MethodologyLink DetailsGroup__button"
      to={{
        pathname: path,
        search: `?stateCode=${currentTenantId}`,
      }}
      target="_blank"
    >
      <Icon
        className="DetailsGroup__icon"
        kind={IconSVG.Open}
        fill={styles.signalLinks}
      />
      Methodology
    </Link>
  );
};

export default observer(MethodologyLink);
