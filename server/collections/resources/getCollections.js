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
const { COLLECTIONS } = require("../../constants/collections");
const { removeAllValue } = require("./dimensionValues/shared");
const dimensionsByStateCode = require("./dimensionValues");
const stateCodes = require("../../constants/stateCodes");

function newRevocations(dimensions) {
  return {
    [COLLECTIONS.NEW_REVOCATION]: {
      revocations_matrix_supervision_location_ids_to_names: {
        filename: "revocations_matrix_supervision_location_ids_to_names.json",
      },
      state_race_ethnicity_population: {
        filename: "state_race_ethnicity_population.json",
      },
      state_gender_population: { filename: "state_gender_population.json" },
      revocations_matrix_events_by_month: {
        filename: "revocations_matrix_events_by_month.txt",
        dimensions: {
          charge_category: dimensions.charge_category,
          month: dimensions.month,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_cells: {
        filename: "revocations_matrix_cells.txt",
        dimensions: {
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: removeAllValue(dimensions.reported_violations),
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: removeAllValue(dimensions.violation_type),
        },
      },
      revocations_matrix_distribution_by_district: {
        filename: "revocations_matrix_distribution_by_district.txt",
        dimensions: {
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_distribution_by_gender: {
        filename: "revocations_matrix_distribution_by_gender.txt",
        dimensions: {
          risk_level: dimensions.risk_level,
          gender: dimensions.gender,
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_distribution_by_officer: {
        filename: "revocations_matrix_distribution_by_officer.txt",
        dimensions: {
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_distribution_by_race: {
        filename: "revocations_matrix_distribution_by_race.txt",
        dimensions: {
          risk_level: dimensions.risk_level,
          race: dimensions.race,
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_distribution_by_risk_level: {
        filename: "revocations_matrix_distribution_by_risk_level.txt",
        dimensions: {
          risk_level: dimensions.risk_level,
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_distribution_by_violation: {
        filename: "revocations_matrix_distribution_by_violation.txt",
        dimensions: {
          charge_category: dimensions.charge_category,
          metric_period_months: dimensions.metric_period_months,
          reported_violations: dimensions.reported_violations,
          supervision_type: dimensions.supervision_type,
          supervision_level: dimensions.supervision_level,
          violation_type: dimensions.violation_type,
        },
      },
      revocations_matrix_filtered_caseload: {
        filename: "revocations_matrix_filtered_caseload.txt",
        dimensions: {
          charge_category: removeAllValue(dimensions.charge_category),
          metric_period_months: dimensions.metric_period_months,
          reported_violations: removeAllValue(dimensions.reported_violations),
          supervision_type: removeAllValue(dimensions.supervision_type),
          supervision_level: removeAllValue(dimensions.supervision_level),
          violation_type: removeAllValue(dimensions.violation_type),
        },
      },
    },
  };
}

const VITALS_COLLECTION = {
  [COLLECTIONS.VITALS]: {
    vitals_summaries: {
      filename: "vitals_summaries.txt",
    },
    vitals_time_series: {
      filename: "vitals_time_series.txt",
    },
  },
};

const PATHWAYS_COLLECTIONS = {
  [COLLECTIONS.PATHWAYS]: {
    liberty_to_prison_count_by_month: {
      filename: "liberty_to_prison_count_by_month.txt",
    },
    liberty_to_prison_population_snapshot_by_dimension: {
      filename: "liberty_to_prison_population_snapshot_by_dimension.txt",
    },
    prison_population_projection_time_series: {
      filename: "prison_population_projection_time_series.txt",
    },
    supervision_population_projection_time_series: {
      filename: "supervision_population_projection_time_series.txt",
    },
    supervision_to_prison_count_by_month: {
      filename: "supervision_to_prison_count_by_month.txt",
    },
    supervision_to_liberty_count_by_month: {
      filename: "supervision_to_liberty_count_by_month.txt",
    },
    prison_population_time_series: {
      filename: "prison_population_time_series.txt",
    },
    prison_population_snapshot_person_level: {
      filename: "prison_population_snapshot_person_level.json",
    },
    prison_population_snapshot_by_dimension: {
      filename: "prison_population_snapshot_by_dimension.txt",
    },
    supervision_to_prison_population_snapshot_by_dimension: {
      filename: "supervision_to_prison_population_snapshot_by_dimension.txt",
    },
    prison_to_supervision_count_by_month: {
      filename: "prison_to_supervision_count_by_month.txt",
    },
    prison_to_supervision_population_snapshot_by_dimension: {
      filename: "prison_to_supervision_population_snapshot_by_dimension.txt",
    },
    prison_to_supervision_population_snapshot_person_level: {
      filename: "prison_to_supervision_population_snapshot_person_level.json",
    },
    supervision_population_time_series: {
      filename: "supervision_population_time_series.txt",
    },
    supervision_population_snapshot_by_dimension: {
      filename: "supervision_population_snapshot_by_dimension.txt",
    },
    supervision_to_liberty_population_snapshot_by_dimension: {
      filename: "supervision_to_liberty_population_snapshot_by_dimension.txt",
    },
    supervision_to_prison_population_snapshot_by_officer: {
      filename: "supervision_to_prison_population_snapshot_by_officer.txt",
    },
  },
};

const CORE_COLLECTIONS = {
  [COLLECTIONS.GOALS]: {
    admissions_by_type_by_month: {
      filename: "admissions_by_type_by_month.txt",
    },
    admissions_by_type_by_period: {
      filename: "admissions_by_type_by_period.txt",
    },
    average_change_lsir_score_by_month: {
      filename: "average_change_lsir_score_by_month.txt",
    },
    average_change_lsir_score_by_period: {
      filename: "average_change_lsir_score_by_period.txt",
    },
    avg_days_at_liberty_by_month: {
      filename: "avg_days_at_liberty_by_month.txt",
    },
    reincarcerations_by_month: { filename: "reincarcerations_by_month.txt" },
    reincarcerations_by_period: {
      filename: "reincarcerations_by_period.txt",
    },
    revocations_by_month: {
      filename: "revocations_by_month.txt",
    },
    revocations_by_period: {
      filename: "revocations_by_period.txt",
    },
    supervision_termination_by_type_by_month: {
      filename: "supervision_termination_by_type_by_month.txt",
    },
    supervision_termination_by_type_by_period: {
      filename: "supervision_termination_by_type_by_period.txt",
    },
    site_offices: {
      filename: "site_offices.json",
    },
  },
  [COLLECTIONS.COMMUNITY_EXPLORE]: {
    site_offices: { filename: "site_offices.json" },
    admissions_by_type_by_month: {
      filename: "admissions_by_type_by_month.txt",
    },
    admissions_by_type_by_period: {
      filename: "admissions_by_type_by_period.txt",
    },
    average_change_lsir_score_by_month: {
      filename: "average_change_lsir_score_by_month.txt",
    },
    average_change_lsir_score_by_period: {
      filename: "average_change_lsir_score_by_period.txt",
    },
    case_terminations_by_type_by_month: {
      filename: "case_terminations_by_type_by_month.txt",
    },
    case_terminations_by_type_by_officer_by_period: {
      filename: "case_terminations_by_type_by_officer_by_period.txt",
    },
    ftr_referrals_by_age_by_period: {
      filename: "ftr_referrals_by_age_by_period.txt",
    },
    ftr_referrals_by_gender_by_period: {
      filename: "ftr_referrals_by_gender_by_period.txt",
    },
    ftr_referrals_by_lsir_by_period: {
      filename: "ftr_referrals_by_lsir_by_period.txt",
    },
    ftr_referrals_by_month: { filename: "ftr_referrals_by_month.txt" },
    ftr_referrals_by_participation_status: {
      filename: "ftr_referrals_by_participation_status.txt",
    },
    ftr_referrals_by_period: { filename: "ftr_referrals_by_period.txt" },
    ftr_referrals_by_race_and_ethnicity_by_period: {
      filename: "ftr_referrals_by_race_and_ethnicity_by_period.txt",
    },
    race_proportions: { filename: "race_proportions.json" },
    revocations_by_month: { filename: "revocations_by_month.txt" },
    revocations_by_officer_by_period: {
      filename: "revocations_by_officer_by_period.txt",
    },
    revocations_by_period: { filename: "revocations_by_period.txt" },
    revocations_by_race_and_ethnicity_by_period: {
      filename: "revocations_by_race_and_ethnicity_by_period.txt",
    },
    revocations_by_supervision_type_by_month: {
      filename: "revocations_by_supervision_type_by_month.txt",
    },
    revocations_by_violation_type_by_month: {
      filename: "revocations_by_violation_type_by_month.txt",
    },
    supervision_termination_by_type_by_month: {
      filename: "supervision_termination_by_type_by_month.txt",
    },
    supervision_termination_by_type_by_period: {
      filename: "supervision_termination_by_type_by_period.txt",
    },
  },
  [COLLECTIONS.FACILITIES_EXPLORE]: {
    admissions_by_type_by_period: {
      filename: "admissions_by_type_by_period.txt",
    },
    admissions_versus_releases_by_month: {
      filename: "admissions_versus_releases_by_month.txt",
    },
    admissions_versus_releases_by_period: {
      filename: "admissions_versus_releases_by_period.txt",
    },
    avg_days_at_liberty_by_month: {
      filename: "avg_days_at_liberty_by_month.txt",
    },
    reincarceration_rate_by_stay_length: {
      filename: "reincarceration_rate_by_stay_length.txt",
    },
    reincarcerations_by_month: { filename: "reincarcerations_by_month.txt" },
    reincarcerations_by_period: {
      filename: "reincarcerations_by_period.txt",
    },
  },
};

function getCollections(stateCode = null) {
  switch (stateCode) {
    case stateCodes.US_MO:
      return {
        ...newRevocations(dimensionsByStateCode[stateCode]),
        ...PATHWAYS_COLLECTIONS,
      };
    case stateCodes.US_PA:
      return newRevocations(dimensionsByStateCode[stateCode]);
    case stateCodes.US_ID:
      return {
        ...VITALS_COLLECTION,
        ...PATHWAYS_COLLECTIONS,
      };
    case stateCodes.US_CO:
    case stateCodes.US_ME:
    case stateCodes.US_MI:
    case stateCodes.US_TN:
      return PATHWAYS_COLLECTIONS;
    case stateCodes.US_ND:
      return {
        ...VITALS_COLLECTION,
        ...CORE_COLLECTIONS,
        ...PATHWAYS_COLLECTIONS,
      };
    default:
      throw new Error(
        `getCollections received an unexpected state code: ${stateCode}`
      );
  }
}

exports.default = getCollections;
