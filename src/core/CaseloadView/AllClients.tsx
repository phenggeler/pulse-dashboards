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
import { palette, Sans14, spacing } from "@recidiviz/design-system";
import { groupBy } from "lodash";
import { observer } from "mobx-react-lite";
import { rem } from "polished";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";

import { useRootStore } from "../../components/StoreProvider";
import { Client } from "../../WorkflowsStore";
import { ProfileCapsule } from "../ClientCapsule";
import { workflowsUrl } from "../views";
import WorkflowsOfficerName from "../WorkflowsOfficerName";
import { Heading } from "./styles";

const CaseloadWrapper = styled.ul`
  column-gap: ${rem(spacing.md)};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${rem(320)}, 1fr));
  list-style-type: none;
  margin: 0;
  margin-top: ${rem(spacing.md)};
  padding: 0;
  row-gap: ${rem(spacing.sm)};
`;

const OfficerName = styled(Sans14)`
  color: ${palette.pine2};
  margin-top: ${rem(spacing.lg)};
`;

const Caseload = ({ clients }: { clients: Client[] }) => {
  const items = clients.map((client: Client) => (
    <li key={client.id}>
      <Link to={workflowsUrl("general", { clientId: client.pseudonymizedId })}>
        <ProfileCapsule avatarSize="lg" client={client} textSize="sm" />
      </Link>
    </li>
  ));

  return <CaseloadWrapper>{items}</CaseloadWrapper>;
};

export const AllClients = observer(() => {
  const {
    workflowsStore: { caseloadClients, selectedOfficerIds },
  } = useRootStore();

  if (!selectedOfficerIds.length) return null;

  const caseloads = groupBy(caseloadClients, "officerId");

  return (
    <>
      <Heading>
        All clients
        {selectedOfficerIds.length > 1 && " across selected caseloads"}
      </Heading>
      {selectedOfficerIds.map((officerId) => (
        <React.Fragment key={officerId}>
          {selectedOfficerIds.length > 1 && (
            <OfficerName>
              <WorkflowsOfficerName officerId={officerId} />
            </OfficerName>
          )}
          {/* in practice there should never be a missing caseload,
              but fall back to an empty array for type safety */}
          <Caseload clients={caseloads[officerId] ?? []} />
        </React.Fragment>
      ))}
    </>
  );
});
