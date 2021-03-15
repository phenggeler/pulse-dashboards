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
import * as helpers from "../helpers";
import { setTranslateLocale } from "../../../../utils/i18nSettings";
import * as lanternTenant from "../../../../RootStore/TenantStore/lanternTenants";

describe("helper", () => {
  let data;
  let options;

  describe("#formatData", () => {
    beforeEach(() => {
      setTranslateLocale(lanternTenant.US_MO);
      data = {
        charge_category: "ALCOHOL_DRUG",
        district: "01",
        metric_period_months: "12",
        officer: "111222: FRED FLINSTONE",
        officer_recommendation: "ANY_NORMAL_RECOMMENDATION",
        reported_violations: "3",
        risk_level: "MEDIUM",
        state_code: "US_PA",
        state_id: "75XXX",
        supervision_level: "MEDIUM",
        supervision_type: "PAROLE",
        violation_record: "1fel;2low_tech",
        violation_type: "FELONY",
      };
      options = [
        { key: "state_id", label: "DOC ID" },
        { key: "district", label: "District" },
        { key: "officer", label: "Officer" },
        { key: "risk_level", label: "Risk level" },
        {
          key: "officer_recommendation",
          label: "Last Rec. (Incl. Supplementals)",
        },
        { key: "violation_record", label: "Violation record" },
      ];
    });

    it("formats the officer id", () => {
      const result = helpers.formatData([data], options);
      expect(result[0].officer).toEqual("FRED FLINSTONE");
    });

    describe("when the tenant is US_MO", () => {
      it("formats the risk level for US_MO", () => {
        setTranslateLocale(lanternTenant.US_MO);
        const result = helpers.formatData([data], options);
        expect(result[0].risk_level).toEqual("Moderate Risk");
      });
    });

    describe("when the tenant is US_PA", () => {
      it("formats the risk level for US_PA", () => {
        setTranslateLocale(lanternTenant.US_PA);
        const result = helpers.formatData([data], options);
        expect(result[0].risk_level).toEqual("Medium Risk");
      });
    });

    describe("officer recommendation", () => {
      it("when officer recommendation is DOC", () => {
        data.officer_recommendation = "PLACEMENT_IN_DOC_FACILITY";
        const result = helpers.formatData([data], options);
        const expected = "Placement In DOC Facility";
        expect(result[0].officer_recommendation).toEqual(expected);
      });

      it("when officer recommendation is CODS case", () => {
        data.officer_recommendation = "CODS";
        const result = helpers.formatData([data], options);
        const expected = "CODS";
        expect(result[0].officer_recommendation).toEqual(expected);
      });

      it("title cases everything else", () => {
        const result = helpers.formatData([data], options);
        const expected = "Any Normal Recommendation";
        expect(result[0].officer_recommendation).toEqual(expected);
      });

      it("is not exported when it is not in options", () => {
        const filteredOptions = options.filter(
          (option) => option.key !== "officer_recommendation"
        );
        const result = helpers.formatData([data], filteredOptions);
        expect(result[0]).not.toHaveProperty("officer_recommendation");
      });
    });
  });

  describe("#formatExportData", () => {
    beforeEach(() => {
      setTranslateLocale(lanternTenant.US_MO);
      data = {
        charge_category: "ALCOHOL_DRUG",
        district: "01",
        metric_period_months: "12",
        officer: "111222: FRED FLINSTONE",
        officer_recommendation: "ANY_NORMAL_RECOMMENDATION",
        reported_violations: "3",
        risk_level: "MEDIUM",
        state_code: "US_PA",
        state_id: "75XXX",
        supervision_level: "MEDIUM",
        supervision_type: "PAROLE",
        violation_record: "1fel;2low_tech",
        violation_type: "FELONY",
      };
      options = [
        { key: "state_id", label: "DOC ID" },
        { key: "district", label: "District" },
        { key: "officer", label: "Officer" },
        { key: "risk_level", label: "Risk level" },
        {
          key: "officer_recommendation",
          label: "Last Rec. (Incl. Supplementals)",
        },
        { key: "violation_record", label: "Violation record" },
      ];
    });

    it("formats the data correctly for export", () => {
      const result = helpers.formatExportData([data], options);
      const expected = [
        {
          data: [
            "75XXX",
            "01",
            "FRED FLINSTONE",
            "Moderate Risk",
            "1 fel",
            "Any Normal Recommendation",
          ],
        },
      ];
      expect(result).toEqual(expected);
    });

    it("only only includes columns that are in options", () => {
      const filteredOptions = options.filter(
        (option) => option.key !== "officer_recommendation"
      );
      const result = helpers.formatExportData([data], filteredOptions);
      const expected = [
        {
          data: ["75XXX", "01", "FRED FLINSTONE", "Moderate Risk", "1 fel"],
        },
      ];
      expect(result).toEqual(expected);
    });
  });
});