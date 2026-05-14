/**
 * Product Studio — core benefits & riders: option sets + intelligent presets
 * (canonical benefit names + descriptions merged with suggested defaults).
 */

export const BENEFIT_TYPE_OPTIONS = ["Protection", "Savings", "Investment", "Income"];

export const MANDATORY_OPTIONAL_OPTIONS = ["Core", "Add-on"];

export const CALCULATION_METHOD_OPTIONS = ["Fixed amount", "Multiple of premium", "Fund value", "Formula"];

export const BENEFIT_TRIGGER_OPTIONS = ["Death", "Maturity", "Disability", "Illness", "Survival", "Surrender"];

export const YES_NO_OPTIONS = ["Yes", "No"];

/**
 * Each preset seeds the benefit form. All fields are user-editable after selection.
 * `description` is reference copy for the UI (not persisted on the benefit row).
 */
export const CORE_BENEFIT_PRESETS = [
  {
    presetId: "death-benefit",
    benefitName: "Death Benefit",
    description: "Lump sum payable on death",
    benefitType: "Protection",
    mandatoryOptional: "Core",
    calculationMethod: "Multiple of premium",
    benefitTrigger: "Death",
    waitingPeriod: "",
    exclusionPeriod: "e.g. suicide exclusion first 12 months (jurisdiction-specific)",
    maximumPayable: "Sum assured",
    benefitExpiry: "Policy term or whole life",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "Yes",
  },
  {
    presetId: "terminal-illness",
    benefitName: "Terminal Illness Benefit",
    description: "Early payout if terminal illness diagnosed",
    benefitType: "Protection",
    mandatoryOptional: "Add-on",
    calculationMethod: "Fixed amount",
    benefitTrigger: "Illness",
    waitingPeriod: "Often 90 days from diagnosis (refer policy)",
    exclusionPeriod: "",
    maximumPayable: "Capped % of sum assured (e.g. 50–100%)",
    benefitExpiry: "Earlier of claim payment or policy maturity",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "Yes",
    canBeAccelerated: "Yes",
  },
  {
    presetId: "maturity",
    benefitName: "Maturity Benefit",
    description: "Amount payable at maturity",
    benefitType: "Savings",
    mandatoryOptional: "Core",
    calculationMethod: "Formula",
    benefitTrigger: "Maturity",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Sum assured + vested bonuses (participating)",
    benefitExpiry: "Policy maturity date",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
  {
    presetId: "survival",
    benefitName: "Survival Benefit",
    description: "Periodic survival payout",
    benefitType: "Savings",
    mandatoryOptional: "Core",
    calculationMethod: "Fixed amount",
    benefitTrigger: "Survival",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Per schedule (% of SA or fixed)",
    benefitExpiry: "End of payout schedule / maturity",
    multipleClaimsAllowed: "Yes",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
  {
    presetId: "cash-value",
    benefitName: "Cash Value",
    description: "Accumulated surrender / cash value",
    benefitType: "Savings",
    mandatoryOptional: "Core",
    calculationMethod: "Formula",
    benefitTrigger: "Surrender",
    waitingPeriod: "",
    exclusionPeriod: "Surrender charge period may apply",
    maximumPayable: "Account value less charges / loans",
    benefitExpiry: "Surrender or maturity",
    multipleClaimsAllowed: "Yes",
    reducesBaseSumAssured: "Yes",
    canBeAccelerated: "No",
  },
  {
    presetId: "fund-value",
    benefitName: "Fund Value",
    description: "Value of investment units",
    benefitType: "Investment",
    mandatoryOptional: "Core",
    calculationMethod: "Fund value",
    benefitTrigger: "Maturity",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Unit fund value at claim / surrender",
    benefitExpiry: "Policy maturity or whole life",
    multipleClaimsAllowed: "Yes",
    reducesBaseSumAssured: "Yes",
    canBeAccelerated: "No",
  },
  {
    presetId: "guaranteed-return",
    benefitName: "Guaranteed Return",
    description: "Fixed guaranteed return",
    benefitType: "Savings",
    mandatoryOptional: "Core",
    calculationMethod: "Fixed amount",
    benefitTrigger: "Maturity",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Per guaranteed crediting schedule",
    benefitExpiry: "Maturity or vesting",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
  {
    presetId: "loyalty-bonus",
    benefitName: "Loyalty Bonus",
    description: "Payable after certain policy duration",
    benefitType: "Savings",
    mandatoryOptional: "Add-on",
    calculationMethod: "Formula",
    benefitTrigger: "Survival",
    waitingPeriod: "Typically after N policy years",
    exclusionPeriod: "",
    maximumPayable: "Capped per schedule",
    benefitExpiry: "Maturity or defined loyalty dates",
    multipleClaimsAllowed: "Yes",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
  {
    presetId: "annual-bonus",
    benefitName: "Annual Bonus",
    description: "Participating product bonus",
    benefitType: "Savings",
    mandatoryOptional: "Add-on",
    calculationMethod: "Formula",
    benefitTrigger: "Survival",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Declared bonus (reversionary)",
    benefitExpiry: "Vested at maturity / on death",
    multipleClaimsAllowed: "Yes",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
  {
    presetId: "final-bonus",
    benefitName: "Final Bonus",
    description: "Terminal bonus at maturity / death",
    benefitType: "Savings",
    mandatoryOptional: "Add-on",
    calculationMethod: "Formula",
    benefitTrigger: "Death",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Non-guaranteed terminal bonus scale",
    benefitExpiry: "Maturity or death",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
  {
    presetId: "annuity",
    benefitName: "Annuity Benefit",
    description: "Periodic pension / income benefit",
    benefitType: "Income",
    mandatoryOptional: "Core",
    calculationMethod: "Fixed amount",
    benefitTrigger: "Survival",
    waitingPeriod: "Deferment period if applicable",
    exclusionPeriod: "",
    maximumPayable: "Per annuity rate / fund",
    benefitExpiry: "Life only, term certain, or joint life",
    multipleClaimsAllowed: "Yes",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
];

/** @param {string} name */
export function descriptionForBenefitName(name) {
  const n = (name || "").trim();
  const row = CORE_BENEFIT_PRESETS.find((p) => p.benefitName === n);
  return row?.description || "";
}

export function emptyCoreBenefitForm() {
  return {
    benefitName: "",
    benefitType: BENEFIT_TYPE_OPTIONS[0],
    mandatoryOptional: MANDATORY_OPTIONAL_OPTIONS[0],
    calculationMethod: CALCULATION_METHOD_OPTIONS[0],
    benefitTrigger: BENEFIT_TRIGGER_OPTIONS[0],
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "",
    benefitExpiry: "",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  };
}

/** Map a preset row into form state (drops presetId + description). */
export function formFromPreset(preset) {
  const { presetId: _pid, description: _d, ...rest } = preset;
  return { ...emptyCoreBenefitForm(), ...rest };
}

/**
 * Sample benefits shown in the list when the product has none saved yet (read-only; not persisted).
 * Same shape as `coreBenefitsAndRiders.items[]`.
 */
export const DEMO_CORE_BENEFIT_LIST = [
  {
    id: "psc-mock-death",
    benefitName: "Death Benefit",
    benefitType: "Protection",
    mandatoryOptional: "Core",
    calculationMethod: "Multiple of premium",
    benefitTrigger: "Death",
    waitingPeriod: "",
    exclusionPeriod: "Suicide exclusion first 12 months",
    maximumPayable: "Sum assured",
    benefitExpiry: "Whole life",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "Yes",
  },
  {
    id: "psc-mock-ti",
    benefitName: "Terminal Illness Benefit",
    benefitType: "Protection",
    mandatoryOptional: "Add-on",
    calculationMethod: "Fixed amount",
    benefitTrigger: "Illness",
    waitingPeriod: "90 days",
    exclusionPeriod: "",
    maximumPayable: "50% of sum assured (cap)",
    benefitExpiry: "Earlier of payout or maturity",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "Yes",
    canBeAccelerated: "Yes",
  },
  {
    id: "psc-mock-maturity",
    benefitName: "Maturity Benefit",
    benefitType: "Savings",
    mandatoryOptional: "Core",
    calculationMethod: "Formula",
    benefitTrigger: "Maturity",
    waitingPeriod: "",
    exclusionPeriod: "",
    maximumPayable: "Sum assured + vested bonuses",
    benefitExpiry: "Policy maturity date",
    multipleClaimsAllowed: "No",
    reducesBaseSumAssured: "No",
    canBeAccelerated: "No",
  },
];
