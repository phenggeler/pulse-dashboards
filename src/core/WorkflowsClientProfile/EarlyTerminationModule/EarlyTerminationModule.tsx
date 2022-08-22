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

import {
  ActionButtons,
  PrintButton,
  Title,
  useStatusColors,
  Wrapper,
} from "../common";
import { CriteriaList } from "../CriteriaList";
import { OpportunityDenial } from "../OpportunityDenial";
import { ClientProfileProps } from "../types";

const OPPORTUNITY_TYPE = "earlyTermination";

export const EarlyTerminationModule = observer(
  ({ client }: ClientProfileProps) => {
    if (!client.opportunities.earlyTermination) return null;

    const colors = useStatusColors(client.opportunities.earlyTermination);

    return (
      <Wrapper {...colors}>
        <Title
          titleText="Early Termination"
          statusMessage={
            client.opportunities.earlyTermination?.statusMessageShort
          }
        />
        <CriteriaList
          opportunity={client.opportunities.earlyTermination}
          colors={colors}
        />
        <ActionButtons>
          <div>
            <PrintButton
              kind="primary"
              shape="block"
              buttonFill={colors.buttonFill}
              onClick={() => client.printReferralForm(OPPORTUNITY_TYPE)}
            >
              {client.opportunities.earlyTermination.printText}
            </PrintButton>
          </div>
          <OpportunityDenial
            client={client}
            opportunity={client.opportunities.earlyTermination}
          />
        </ActionButtons>
      </Wrapper>
    );
  }
);
