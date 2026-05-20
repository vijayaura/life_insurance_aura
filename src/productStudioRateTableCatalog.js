/**
 * Catalog of benefit / product rate tables and their segment variables.
 * Used by Table Structure design (product) and rate matrix UIs (benefits).
 */

export const RATE_TABLE_IDS = [
  "mortality-rate-table",
  "morbidity-ci-table",
  "accident-rate-table",
  "fund-growth-table",
  "charge-rate-tables",
];

/** @typedef {{ key: string, label: string, description?: string }} RateTableVariable */

/** @typedef {{
 *   id: string,
 *   label: string,
 *   matrixTitle: string,
 *   description: string,
 *   benefitRoute: string,
 *   variables: RateTableVariable[],
 *   defaultEnabledKeys: string[],
 * }} RateTableDefinition */

/** @type {RateTableDefinition[]} */
export const RATE_TABLE_CATALOG = [
  {
    id: "mortality-rate-table",
    label: "Mortality Rate Table",
    matrixTitle: "Mortality rate matrix",
    description: "Age-based mortality rates by demographic and policy dimensions.",
    benefitRoute: "Rate Tables",
    variables: [
      { key: "gender", label: "Gender", description: "Male / Female" },
      { key: "smoker_status", label: "Smoker status", description: "Smoker vs non-smoker" },
      { key: "occupation_class", label: "Occupation class", description: "Occupation risk class" },
      { key: "medical_rating", label: "Medical rating", description: "Underwriting medical rating band" },
      { key: "policy_term", label: "Policy term", description: "Policy duration band" },
      { key: "premium_mode", label: "Premium mode", description: "Premium payment frequency" },
    ],
    defaultEnabledKeys: [
      "gender",
      "smoker_status",
      "occupation_class",
      "medical_rating",
      "policy_term",
      "premium_mode",
    ],
  },
  {
    id: "morbidity-ci-table",
    label: "Morbidity / Critical Illness Table",
    matrixTitle: "Morbidity / critical illness rate matrix",
    description: "Critical illness and morbidity rates by age and risk factors.",
    benefitRoute: "Rate Tables",
    variables: [
      { key: "gender", label: "Gender", description: "Male / Female" },
      { key: "illness_type", label: "Illness type", description: "CI / morbidity condition category" },
      { key: "occupation", label: "Occupation", description: "Occupation risk class" },
    ],
    defaultEnabledKeys: ["gender", "illness_type", "occupation"],
  },
  {
    id: "accident-rate-table",
    label: "Accident Rate Table",
    matrixTitle: "Accident rate matrix",
    description: "Personal accident rates by occupation, geography, and travel.",
    benefitRoute: "Rate Tables",
    variables: [
      { key: "occupation", label: "Occupation", description: "Occupation risk class" },
      { key: "geography", label: "Geography", description: "Coverage territory" },
      { key: "travel_risk", label: "Travel risk", description: "Travel / hazard exposure" },
    ],
    defaultEnabledKeys: ["occupation", "geography", "travel_risk"],
  },
  {
    id: "fund-growth-table",
    label: "Fund Growth Assumption Table",
    matrixTitle: "Fund growth assumption matrix",
    description: "Unit fund growth assumptions by market scenario and duration.",
    benefitRoute: "Funds & Investments",
    variables: [
      { key: "market_scenario", label: "Market scenario", description: "Low / moderate / high growth" },
      { key: "duration", label: "Duration", description: "Projection duration band" },
    ],
    defaultEnabledKeys: ["market_scenario", "duration"],
  },
  {
    id: "charge-rate-tables",
    label: "Charge Rate Tables",
    matrixTitle: "Charge rate matrix",
    description: "Policy charges by charge type and policy duration.",
    benefitRoute: "Charge Rate Tables",
    variables: [{ key: "charge_type", label: "Charge type", description: "Premium allocation, FMC, surrender, etc." }],
    defaultEnabledKeys: ["charge_type"],
  },
];

export const RATE_TABLE_BY_ID = Object.fromEntries(RATE_TABLE_CATALOG.map((t) => [t.id, t]));

export function getRateTableDefinition(tableId) {
  return RATE_TABLE_BY_ID[tableId] ?? null;
}
