/*
 * Recidiviz - a data platform for criminal justice reform
 * Copyright (C) 2022 Recidiviz, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * =============================================================================
 *
 */

import { TenantConfig } from "../core/models/types";
import * as lantern from "../RootStore/TenantStore/lanternTenants";

const US_PA_CONFIG: TenantConfig = {
  name: "Pennsylvania",
  stateCode: "PA",
  availableStateCodes: [lantern.US_PA],
  enableUserRestrictions: false,
  enableVitalsCaseloadButton: false,
  navigation: {
    // TODO remove once LANTERN is deprecated
    // @ts-ignore
    revocations: [],
  },
};

export default US_PA_CONFIG;
