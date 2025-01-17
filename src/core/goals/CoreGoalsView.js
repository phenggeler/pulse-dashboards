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

import { Loading } from "@recidiviz/design-system";
import React from "react";

import ChartCard from "../ChartCard";
import { metrics } from "../community/constants";
import GeoViewTimeChart from "../GeoViewTimeChart";
import useChartData from "../hooks/useChartData";
import Methodology from "../Methodology";
import PageTemplate from "../PageTemplate";
import PeriodLabel from "../PeriodLabel";
import DaysAtLibertySnapshot from "./DaysAtLibertySnapshot";
import LsirScoreChangeSnapshot from "./LsirScoreChangeSnapshot";
import ReincarcerationCountOverTime from "./ReincarcerationCountOverTime";
import RevocationAdmissionsSnapshot from "./RevocationAdmissionsSnapshot";
import RevocationCountOverTime from "./RevocationCountOverTime";
import SupervisionSuccessSnapshot from "./SupervisionSuccessSnapshot";

const CoreGoalsView = () => {
  const { apiData, isLoading, getTokenSilently } = useChartData("us_nd/goals");

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageTemplate>
      <div className="row gap-20 pos-r">
        <ChartCard
          chartId="revocationCountsByMonth"
          chartTitle="REVOCATION ADMISSIONS BY MONTH"
          chart={
            <RevocationCountOverTime
              metricType="counts"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              district={metrics.district}
              officeData={apiData.site_offices.data}
              revocationCountsByMonth={apiData.revocations_by_month.data}
              header="revocationCountsByMonth-header"
              stateCode="US_ND"
              getTokenSilently={getTokenSilently}
            />
          }
          geoChart={
            <GeoViewTimeChart
              chartId="revocationCountsByMonth"
              chartTitle="REVOCATION ADMISSIONS BY MONTH"
              metricType="counts"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              keyedByOffice
              officeData={apiData.site_offices.data}
              dataPointsByOffice={apiData.revocations_by_period.data}
              numeratorKeys={["revocation_count"]}
              denominatorKeys={["total_supervision_count"]}
              centerLat={47.3}
              centerLong={-100.5}
              getTokenSilently={getTokenSilently}
            />
          }
          footer={<Methodology chartId="revocationCountsByMonthGoal" />}
          geoFooter={
            <>
              <Methodology chartId="revocationCountsByMonthGoal" />
              <PeriodLabel metricPeriodMonths={metrics.metricPeriodMonths} />
            </>
          }
        />

        <ChartCard
          chartId="supervisionSuccessSnapshot"
          chartTitle="SUCCESSFUL COMPLETION OF SUPERVISION"
          chart={
            <SupervisionSuccessSnapshot
              metricType="rates"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              district={metrics.district}
              supervisionSuccessRates={
                apiData.supervision_termination_by_type_by_month.data
              }
              header="supervisionSuccessSnapshot-header"
              stateCode="US_ND"
              getTokenSilently={getTokenSilently}
            />
          }
          geoChart={
            <GeoViewTimeChart
              chartId="supervisionSuccessSnapshot"
              chartTitle="SUCCESSFUL COMPLETION OF SUPERVISION"
              metricType="rates"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              keyedByOffice
              officeData={apiData.site_offices.data}
              dataPointsByOffice={
                apiData.supervision_termination_by_type_by_period.data
              }
              numeratorKeys={["successful_termination"]}
              denominatorKeys={[
                "revocation_termination",
                "successful_termination",
              ]}
              centerLat={47.3}
              centerLong={-100.5}
              getTokenSilently={getTokenSilently}
            />
          }
          footer={<Methodology chartId="supervisionSuccessSnapshot" />}
          geoFooter={
            <>
              <Methodology chartId="supervisionSuccessSnapshot" />
              <PeriodLabel metricPeriodMonths={metrics.metricPeriodMonths} />
            </>
          }
        />

        <ChartCard
          chartId="lsirScoreChangeSnapshot"
          chartTitle="LSI-R SCORE CHANGES (AVERAGE)"
          chart={
            <LsirScoreChangeSnapshot
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              district={metrics.district}
              lsirScoreChangeByMonth={
                apiData.average_change_lsir_score_by_month.data
              }
              header="lsirScoreChangeSnapshot-header"
              stateCode="US_ND"
              getTokenSilently={getTokenSilently}
            />
          }
          geoChart={
            <GeoViewTimeChart
              chartId="lsirScoreChangeSnapshot"
              chartTitle="LSI-R SCORE CHANGES (AVERAGE)"
              metricType="counts"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              keyedByOffice
              possibleNegativeValues
              officeData={apiData.site_offices.data}
              dataPointsByOffice={
                apiData.average_change_lsir_score_by_period.data
              }
              numeratorKeys={["average_change"]}
              denominatorKeys={[]}
              centerLat={47.3}
              centerLong={-100.5}
              getTokenSilently={getTokenSilently}
            />
          }
          footer={<Methodology chartId="lsirScoreChangeSnapshot" />}
          geoFooter={
            <>
              <Methodology chartId="lsirScoreChangeSnapshot" />
              <PeriodLabel metricPeriodMonths={metrics.metricPeriodMonths} />
            </>
          }
        />

        <ChartCard
          chartId="revocationAdmissionsSnapshot"
          chartTitle="PRISON ADMISSIONS DUE TO REVOCATION"
          chart={
            <RevocationAdmissionsSnapshot
              metricType="rates"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              district={metrics.district}
              revocationAdmissionsByMonth={
                apiData.admissions_by_type_by_month.data
              }
              header="revocationAdmissionsSnapshot-header"
              stateCode="US_ND"
              getTokenSilently={getTokenSilently}
            />
          }
          geoChart={
            <GeoViewTimeChart
              chartId="revocationAdmissionsSnapshot"
              chartTitle="PRISON ADMISSIONS DUE TO REVOCATION"
              metricType="rates"
              metricPeriodMonths={metrics.metricPeriodMonths}
              supervisionType={metrics.supervisionType}
              keyedByOffice
              shareDenominatorAcrossRates
              officeData={apiData.site_offices.data}
              dataPointsByOffice={apiData.admissions_by_type_by_period.data}
              numeratorKeys={[
                "technicals",
                "non_technicals",
                "unknown_revocations",
              ]}
              denominatorKeys={[
                "technicals",
                "non_technicals",
                "unknown_revocations",
                "new_admissions",
              ]}
              centerLat={47.3}
              centerLong={-100.5}
              getTokenSilently={getTokenSilently}
            />
          }
          footer={<Methodology chartId="revocationAdmissionsSnapshotGoal" />}
          geoFooter={
            <>
              <Methodology chartId="revocationAdmissionsSnapshotGoal" />
              <PeriodLabel metricPeriodMonths={metrics.metricPeriodMonths} />
            </>
          }
        />
        <ChartCard
          chartId="daysAtLibertySnapshot"
          chartTitle="DAYS AT LIBERTY (AVERAGE)"
          chart={
            <DaysAtLibertySnapshot
              metricPeriodMonths={metrics.metricPeriodMonths}
              daysAtLibertyByMonth={apiData.avg_days_at_liberty_by_month.data}
              header="daysAtLibertySnapshot-header"
              stateCode="US_ND"
              getTokenSilently={getTokenSilently}
            />
          }
          footer={<Methodology chartId="daysAtLibertySnapshot" />}
        />

        <ChartCard
          chartId="reincarcerationCountsByMonth"
          chartTitle="REINCARCERATIONS BY MONTH"
          chart={
            <ReincarcerationCountOverTime
              metricType="counts"
              metricPeriodMonths={metrics.metricPeriodMonths}
              district={metrics.district}
              reincarcerationCountsByMonth={
                apiData.reincarcerations_by_month.data
              }
              header="reincarcerationCountsByMonth-header"
              stateCode="US_ND"
              getTokenSilently={getTokenSilently}
            />
          }
          geoChart={
            <GeoViewTimeChart
              chartId="reincarcerationCountsByMonth"
              chartTitle="REINCARCERATIONS BY MONTH"
              metricType="counts"
              metricPeriodMonths={metrics.metricPeriodMonths}
              stateCode="us_nd"
              dataPointsByOffice={apiData.reincarcerations_by_period.data}
              numeratorKeys={["returns"]}
              denominatorKeys={["total_admissions"]}
              centerLat={47.3}
              centerLong={-100.5}
              getTokenSilently={getTokenSilently}
            />
          }
          footer={<Methodology chartId="reincarcerationCountsByMonthGoal" />}
          geoFooter={
            <>
              <Methodology chartId="reincarcerationCountsByMonthGoal" />
              <PeriodLabel metricPeriodMonths={metrics.metricPeriodMonths} />
            </>
          }
        />
      </div>
    </PageTemplate>
  );
};

export default CoreGoalsView;
