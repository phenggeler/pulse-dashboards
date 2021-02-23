/* eslint-disable prettier/prettier */
// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
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
import reduce from "lodash/fp/reduce";

import createPopulationMap, { sumCountsAcrossRiskLevels } from "../createPopulationMap";

describe("#createPopulationMap", () => {
  const revocationData = [
    {
      revocation_count: 1,
      supervision_population_count: 1,
      gender: "MALE",
      revocation_count_all: 10,
      supervision_count_all: 100,
      district: "01",
    },
    {
      revocation_count: 2,
      supervision_population_count: 2,
      gender: "MALE",
      revocation_count_all: 20,
      supervision_count_all: 200,
      district: "02",
    },
    {
      revocation_count: 3,
      supervision_population_count: 3,
      gender: "FEMALE",
      revocation_count_all: 30,
      supervision_count_all: 300,
      district: "01",
    },
    {
      revocation_count: 4,
      supervision_population_count: 4,
      gender: "FEMALE",
      revocation_count_all: 40,
      supervision_count_all: 400,
      district: "01",
    },
  ];

  it("creates the correct population map", () => {
    const expected = {
      FEMALE: {
        REVOKED: [7, 70],
        SUPERVISION_POPULATION: [7, 700]
      },
      MALE: {
        REVOKED: [3, 30],
        SUPERVISION_POPULATION: [3, 300]
      }
    }
    const map = reduce(createPopulationMap("gender"), {})
    expect(map(revocationData)).toEqual(expected);
  });
});


describe("#sumCountsAcrossRiskLevels", () => {
  const revocationData = [
    {
      revocation_count: 1,
      supervision_population_count: 1,
      gender: "MALE",
      revocation_count_all: 10,
      supervision_count_all: 100,
      district: "01",
      risk_level: "HIGH",
    },
    {
      revocation_count: 2,
      supervision_population_count: 2,
      gender: "MALE",
      revocation_count_all: 20,
      supervision_count_all: 200,
      district: "02",
      risk_level: "HIGH",
    },
    {
      revocation_count: 1,
      supervision_population_count: 1,
      gender: "MALE",
      revocation_count_all: 10,
      supervision_count_all: 100,
      district: "01",
      risk_level: "MEDIUM",
    },
    {
      revocation_count: 2,
      supervision_population_count: 2,
      gender: "MALE",
      revocation_count_all: 20,
      supervision_count_all: 200,
      district: "02",
      risk_level: "MEDIUM",
    },
    {
      revocation_count: 3,
      supervision_population_count: 3,
      gender: "FEMALE",
      revocation_count_all: 30,
      supervision_count_all: 300,
      district: "01",
      risk_level: "HIGH",
    },
    {
      revocation_count: 4,
      supervision_population_count: 4,
      gender: "FEMALE",
      revocation_count_all: 40,
      supervision_count_all: 400,
      district: "02",
      risk_level: "HIGH",
    },
    {
      revocation_count: 3,
      supervision_population_count: 3,
      gender: "FEMALE",
      revocation_count_all: 30,
      supervision_count_all: 300,
      district: "01",
      risk_level: "MEDIUM",
    },
    {
      revocation_count: 4,
      supervision_population_count: 4,
      gender: "FEMALE",
      revocation_count_all: 40,
      supervision_count_all: 400,
      district: "02",
      risk_level: "MEDIUM",
    },
  ];

  it("sums across risk levels", () => {
    const expected = [
      {
        "district": "01",
        "gender": "MALE",
        "revocation_count": 2,
        "revocation_count_all": 10,
        "risk_level": "HIGH",
        "supervision_count_all": 100,
        "supervision_population_count": 2
      },
      {
        "district": "02",
        "gender": "MALE",
        "revocation_count": 4,
        "revocation_count_all": 20,
        "risk_level": "HIGH",
        "supervision_count_all": 200,
        "supervision_population_count": 4
      },
      {
        "district": "01",
        "gender": "FEMALE",
        "revocation_count": 6,
        "revocation_count_all": 30,
        "risk_level": "HIGH",
        "supervision_count_all": 300,
        "supervision_population_count": 6,
      },
      {
        "district": "02",
        "gender": "FEMALE",
        "revocation_count": 8,
        "revocation_count_all": 40,
        "risk_level": "HIGH",
        "supervision_count_all": 400,
        "supervision_population_count": 8,
     }
    ]
    const map = reduce(sumCountsAcrossRiskLevels("gender"), [])
    expect(map(revocationData)).toEqual(expected);
  });
});