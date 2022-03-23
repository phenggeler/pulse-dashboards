// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2022 Recidiviz, Inc.
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

import { observer } from "mobx-react-lite";
import React from "react";

import { useRootStore } from "../../components/StoreProvider";
import { CompliantReportingModule } from "./CompliantReportingModule";
import { Details } from "./Details";
import { Heading } from "./Heading";
import { ClientProfileProps } from "./types";

const PracticesClientProfile: React.FC = () => {
  const { practicesStore } = useRootStore();

  const client = practicesStore.selectedClient;

  if (!client) {
    return null;
  }

  return <ClientProfile client={client} />;
};

export default observer(PracticesClientProfile);

const ClientProfile = observer(({ client }: ClientProfileProps) => {
  return (
    <article>
      <Heading client={client} />
      <CompliantReportingModule client={client} />
      <Details client={client} />
    </article>
  );
});
