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
import { observer } from "mobx-react-lite";
import { rem, rgba } from "polished";
import React from "react";
import styled from "styled-components/macro";

import type { Client } from "../../../PracticesStore/Client";
import { ClientProfileProps } from "../types";

export const STATUS_COLORS = {
  eligible: {
    icon: palette.signal.highlight,
    background: rgba(palette.signal.highlight, 0.1),
    border: rgba(palette.signal.highlight, 0.3),
    text: palette.pine4,
    buttonFill: palette.signal.links,
    link: palette.signal.links,
  },
  ineligible: {
    icon: palette.data.gold1,
    background: rgba(palette.data.gold1, 0.1),
    border: rgba(palette.data.gold1, 0.5),
    text: palette.slate85,
    buttonFill: palette.data.gold1,
    link: palette.data.gold1,
  },
} as const;

export type StatusPalette = typeof STATUS_COLORS[keyof typeof STATUS_COLORS];

export function useStatusColors(client: Client): StatusPalette {
  return client.eligibilityStatus.compliantReporting
    ? STATUS_COLORS.eligible
    : STATUS_COLORS.ineligible;
}

export const Wrapper = styled.div<{ background: string; border: string }>`
  background-color: ${({ background: backgroundColor }) => backgroundColor};
  border-color: ${({ border: borderColor }) => borderColor};
  border-style: solid;
  border-width: 1px 0;
  color: ${palette.pine1};
  margin: 0 -${rem(spacing.md)};
  padding: ${rem(spacing.md)};
`;

export const Title = observer(({ client }: ClientProfileProps) => {
  return (
    <Sans14>
      Compliant Reporting: {client.reviewStatusMessages.compliantReporting}
    </Sans14>
  );
});
