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

import "./UserAvatar.scss";

import { observer } from "mobx-react-lite";
import React from "react";

import { useUserStore } from "../StoreProvider";

const UserAvatar = (): React.ReactElement => {
  const { user } = useUserStore();

  if (user?.picture === undefined) {
    return <div />;
  }

  // The autogenerated profile icons with the letter in the middle of a
  // solid field come from gravatar. We want to overwrite them with our
  // own custom letter on a solid field.
  if (user.picture?.includes("gravatar")) {
    return (
      <span className="UserAvatar UserAvatar--default">
        {user.name && user.name[0]}
      </span>
    );
  }
  return <img src={user.picture} className="UserAvatar" alt="User icon" />;
};

export default observer(UserAvatar);
