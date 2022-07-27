export type CompliantReportingReferralRecord = {
  poFirstName: string;
  poLastName: string;
  clientFirstName: string;
  clientLastName: string;
  dateToday: string;
  tdocId: string;
  physicalAddress: string;
  currentEmployer: string;
  driversLicense: string;
  driversLicenseSuspended: string;
  driversLicenseRevoked: string;
  convictionCounty: string;
  courtName: string;
  allDockets: string;
  currentOffenses: string[];
  supervisionType: string;
  sentenceStartDate: string;
  sentenceLengthDays: string;
  expirationDate: string;
  supervisionFeeAssessed: number;
  supervisionFeeArrearaged: boolean;
  supervisionFeeArrearagedAmount: number;
  supervisionFeeExemption: string;
  supervisionFeeExemptionType: string;
  supervisionFeeExemptionExpirDate: string;
  supervisionFeeWaived: string;
  courtCostsPaid: boolean;
  courtCostsBalance: string;
  courtCostsMonthlyAmt1: string;
  courtCostsMonthlyAmt2: string;
  restitutionAmt: string;
  restitutionMonthlyPayment: string;
  restitutionMonthlyPaymentTo: string[];
  specialConditionsAlcDrugScreen: boolean;
  specialConditionsAlcDrugScreenDate: string;
  specialConditionsAlcDrugAssessment: string;
  specialConditionsAlcDrugAssessmentComplete: boolean;
  specialConditionsAlcDrugAssessmentCompleteDate: string;
  specialConditionsAlcDrugTreatment: boolean;
  specialConditionsAlcDrugTreatmentInOut: "INPATIENT" | "OUTPATIENT";
  specialConditionsAlcDrugTreatmentCurrent: boolean;
  specialConditionsAlcDrugTreatmentCompleteDate: string;
  specialConditionsCounseling: boolean;
  specialConditionsCounselingAngerManagement: boolean;
  specialConditionsCounselingAngerManagementCurrent: boolean;
  specialConditionsCounselingAngerManagementCompleteDate: string;
  specialConditionsCounselingMentalHealth: boolean;
  specialConditionsCounselingMentalHealthCurrent: boolean;
  specialConditionsCounselingMentalHealthCompleteDate: string;
  specialConditionsCommunityService: boolean;
  specialConditionsCommunityServiceHours: string;
  specialConditionsCommunityServiceCurrent: boolean;
  specialConditionsCommunityServiceCompletionDate: string;
  specialConditionsProgramming: boolean;
  specialConditionsProgrammingCognitiveBehavior: boolean;
  specialConditionsProgrammingCognitiveBehaviorCurrent: boolean;
  specialConditionsProgrammingCognitiveBehaviorCompletionDate: string;
  specialConditionsProgrammingSafe: boolean;
  specialConditionsProgrammingSafeCurrent: boolean;
  specialConditionsProgrammingSafeCompletionDate: string;
  specialConditionsProgrammingVictimImpact: boolean;
  specialConditionsProgrammingVictimImpactCurrent: boolean;
  specialConditionsProgrammingVictimImpactCompletionDate: string;
  specialConditionsProgrammingFsw: boolean;
  specialConditionsProgrammingFswCurrent: boolean;
  specialConditionsProgrammingFswCompletionDate: string;
};

export interface TransformedCompliantReportingReferral {
  /* Computed fields */
  clientFullName: string;
  poFullName: string;
  restitutionMonthlyPaymentTo: string;
  sentenceLengthDaysText: string;
  specialConditionsCounselingAngerManagementComplete: boolean;
  specialConditionsCounselingMentalHealthComplete: boolean;

  /* Converted fields */
  supervisionFeeAssessed: string;
  supervisionFeeArrearagedAmount: string;

  /* Fields directly passed from ETL */
  poFirstName: string;
  poLastName: string;
  clientFirstName: string;
  clientLastName: string;
  dateToday: string;
  tdocId: string;
  physicalAddress: string;
  currentEmployer: string;
  driversLicense: string;
  driversLicenseSuspended: string;
  driversLicenseRevoked: string;
  convictionCounty: string;
  courtName: string;
  allDockets: string;
  currentOffenses: string[];
  supervisionType: string;
  sentenceStartDate: string;
  sentenceLengthDays: string;
  expirationDate: string;
  supervisionFeeArrearaged: boolean;
  supervisionFeeExemption: string;
  supervisionFeeExemptionType: string;
  supervisionFeeExemptionExpirDate: string;
  supervisionFeeWaived: string;
  courtCostsPaid: boolean;
  courtCostsBalance: string;
  courtCostsMonthlyAmt1: string;
  courtCostsMonthlyAmt2: string;
  restitutionAmt: string;
  restitutionMonthlyPayment: string;
  specialConditionsAlcDrugScreen: boolean;
  specialConditionsAlcDrugScreenDate: string;
  specialConditionsAlcDrugAssessment: string;
  specialConditionsAlcDrugAssessmentComplete: boolean;
  specialConditionsAlcDrugAssessmentCompleteDate: string;
  specialConditionsAlcDrugTreatment: boolean;
  specialConditionsAlcDrugTreatmentInOut: "INPATIENT" | "OUTPATIENT";
  specialConditionsAlcDrugTreatmentCurrent: boolean;
  specialConditionsAlcDrugTreatmentCompleteDate: string;
  specialConditionsCounseling: boolean;
  specialConditionsCounselingAngerManagement: boolean;
  specialConditionsCounselingAngerManagementCurrent: boolean;
  specialConditionsCounselingAngerManagementCompleteDate: string;
  specialConditionsCounselingMentalHealth: boolean;
  specialConditionsCounselingMentalHealthCurrent: boolean;
  specialConditionsCounselingMentalHealthCompleteDate: string;
  specialConditionsCommunityService: boolean;
  specialConditionsCommunityServiceHours: string;
  specialConditionsCommunityServiceCurrent: boolean;
  specialConditionsCommunityServiceCompletionDate: string;
  specialConditionsProgramming: boolean;
  specialConditionsProgrammingCognitiveBehavior: boolean;
  specialConditionsProgrammingCognitiveBehaviorCurrent: boolean;
  specialConditionsProgrammingCognitiveBehaviorCompletionDate: string;
  specialConditionsProgrammingSafe: boolean;
  specialConditionsProgrammingSafeCurrent: boolean;
  specialConditionsProgrammingSafeCompletionDate: string;
  specialConditionsProgrammingVictimImpact: boolean;
  specialConditionsProgrammingVictimImpactCurrent: boolean;
  specialConditionsProgrammingVictimImpactCompletionDate: string;
  specialConditionsProgrammingFsw: boolean;
  specialConditionsProgrammingFswCurrent: boolean;
  specialConditionsProgrammingFswCompletionDate: string;

  /* Fields in the UI that are not included in the ETL */
  currentOffenses0: string;
  currentOffenses1: string;
  currentOffenses2: string;
  currentOffenses3: string;
  currentOffenses4: string;
  licenseYears: string;
  telephoneNumber: string;
  supervisorFullName: string;
  iotSanctioning: boolean;
  atrSupervisionTransfer: boolean;
  seeAdditionalOffenses: boolean;
  isProbation: boolean;
  isIsc: boolean;
  isParole: boolean;
  is4035313: boolean;
  specialConditionsAlcDrugTreatmentIsInpatient: boolean;
  specialConditionsAlcDrugTreatmentIsOutpatient: boolean;
  specialConditionsNoContact: boolean;
  specialConditionsNoContactName: string;
  specialConditionsSocialWorker: boolean;
  specialConditionsAlcDrugAssessmentPending: boolean;
  specialConditionsAlcDrugTreatmentComplete: boolean;
  specialConditionsCounselingComplete: boolean;
  specialConditionsCommunityServiceComplete: boolean;
  specialConditionsProgrammingCognitiveBehaviorComplete: boolean;
  specialConditionsProgrammingSafeComplete: boolean;
  specialConditionsProgrammingVictimImpactComplete: boolean;
  specialConditionsProgrammingFswComplete: boolean;
}