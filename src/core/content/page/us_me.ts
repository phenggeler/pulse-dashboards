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

import { StateSpecificPageCopy } from "../types";

const content: StateSpecificPageCopy = {
  prison: {
    summary:
      "These charts show people incarcerated in a TDOC prison for a felony or misdemeanor conviction. People in county jails are not included. ",
    sections: {
      countOverTime: "Prison population over time",
      countByLocation: "Prison population by facility",
      personLevelDetail: "List of people in prison",
    },
    methodology:
      "These charts show people incarcerated in a TDOC prison for a felony or misdemeanor conviction. People in county jails are not included.",
  },
  prisonToSupervision: {
    sections: {
      countOverTime: "Releases from prison to supervision over time",
      countByAgeGroup: "Releases from prison to supervision by age",
      countByLocation: "Releases from prison to supervision by facility",
      personLevelDetail: "List of releases from prison to supervision",
    },
  },
  supervision: {
    sections: {
      countOverTime: "Supervision population over time",
      countByLocation: "Supervision population by region",
      countBySupervisionLevel: "Supervision population by supervision level",
    },
  },
  supervisionToPrison: {
    sections: {
      countOverTime: "Admissions from supervision over time",
      countByLocation: "Admissions from supervision by region",
      countByMostSevereViolation:
        "Admissions from supervision by most severe violation",
      countByNumberOfViolations:
        "Admissions from supervision by number of violations",
      countByLengthOfStay: "Time to admission from supervision",
    },
  },
};

export default content;
