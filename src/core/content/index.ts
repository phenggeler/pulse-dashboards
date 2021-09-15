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
import { TenantId } from "../../RootStore/types";
import { ViewMethodology } from "../models/types";
import { US_ID } from "./methodology/usIdMethodology";
import { US_ND } from "./methodology/usNdMethodology";

type TenantMethodology = {
  [key in TenantId]: ViewMethodology;
};

export default { US_ND, US_ID } as TenantMethodology;
