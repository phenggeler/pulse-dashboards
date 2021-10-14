/*
 * Recidiviz - a data platform for criminal justice reform
 * Copyright (C) 2021 Recidiviz, Inc.
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

import { PageCopy } from "../types";

const content: PageCopy = {
  prison: {
    title: "Prison",
    summary: "This page shows all people in state prison facilities.",
    sections: {
      countOverTime: "Prison Population",
    },
  },
  supervision: {
    title: "Supervision",
    summary: "This page shows all people supervised by the state.",
    sections: {
      countOverTime: "Supervision Population",
    },
  },
  supervisionToPrison: {
    title: "Supervision to Prison",
    summary:
      "This chart includes people who have been incarcerated in a state facility because their parole or probation was revoked. Revocations are counted when the person was admitted to a facility, not when the violation occurred.",
    sections: {
      countOverTime: "Admissions from Supervision to Prison",
    },
  },
  supervisionToLiberty: {
    title: "Supervision to Liberty",
    summary:
      "These charts show people who were discharged from supervision positively or if their supervision period expired.",
    sections: {
      countOverTime: "Releases from Supervision to Liberty",
    },
  },
};

export default content;
