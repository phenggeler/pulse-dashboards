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
export const SIMULATION_COMPARTMENTS = {
  SUPERVISION: "SUPERVISION",
  INCARCERATION: "INCARCERATION",
};

export const METRIC_MODES = {
  COUNTS: "counts",
  RATES: "rates",
};

export const FILTER_TYPES = {
  TIME_PERIOD: "timePeriod",
  GENDER: "gender",
  LEGAL_STATUS: "legalStatus",
  ADMISSION_REASON: "admissionReason",
  SUPERVISION_TYPE: "supervisionType",
  AGE_GROUP: "ageGroup",
  FACILITY: "facility",
  DISTRICT: "district",
  JUDICIAL_DISTRICT: "judicialDistrict",
  MOST_SEVERE_VIOLATION: "mostSevereViolation",
  RACE: "race",
  NUMBER_OF_VIOLATIONS: "numberOfViolations",
  SUPERVISION_LEVEL: "supervisionLevel",
} as const;

export const DIMENSION_TYPES = {
  ...FILTER_TYPES,
  PRIOR_LENGTH_OF_INCARCERATION: "priorLengthOfIncarceration",
  LENGTH_OF_STAY: "lengthOfStay",
  OFFICER_NAME: "officerName",
} as const;

export const prisonFiltersOrder = [
  FILTER_TYPES.TIME_PERIOD,
  FILTER_TYPES.FACILITY,
  FILTER_TYPES.DISTRICT,
  FILTER_TYPES.GENDER,
  FILTER_TYPES.LEGAL_STATUS,
  FILTER_TYPES.ADMISSION_REASON,
  FILTER_TYPES.JUDICIAL_DISTRICT,
  FILTER_TYPES.AGE_GROUP,
  FILTER_TYPES.RACE,
];

export const supervisionFiltersOrder = [
  FILTER_TYPES.TIME_PERIOD,
  FILTER_TYPES.DISTRICT,
  FILTER_TYPES.GENDER,
  FILTER_TYPES.SUPERVISION_TYPE,
  FILTER_TYPES.SUPERVISION_LEVEL,
  FILTER_TYPES.MOST_SEVERE_VIOLATION,
  FILTER_TYPES.NUMBER_OF_VIOLATIONS,
  FILTER_TYPES.AGE_GROUP,
  FILTER_TYPES.RACE,
];

export const WORKFLOWS_METHODOLOGY_URL: Record<string, string> = {
  US_TN:
    "https://drive.google.com/file/d/1fkqncNb_GNYBvRfOgij4QHw4HEdkkHHz/view?usp=sharing",
  US_ND:
    "https://drive.google.com/file/d/1eHbSEOjjT9FvxffSbXOYEfOYPJheeu6t/view",
  US_ID:
    "http://forms.idoc.idaho.gov/WebLink/0/edoc/282369/Termination%20of%20Probation%20or%20Parole%20Supervision.pdf",
};

export const WORKFLOWS_POLICY_OR_METHODOLOGY_URL: Record<string, string> = {
  US_TN:
    "https://drive.google.com/file/d/1YNAUTViqg_Pgt15KsZPUiNG11Dh2TTiB/view?usp=sharing",
  US_ND: WORKFLOWS_METHODOLOGY_URL.US_ND,
  US_ID: WORKFLOWS_METHODOLOGY_URL.US_ID,
};
