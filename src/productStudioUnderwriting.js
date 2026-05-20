/**
 * Product Studio — underwriting rules engine (ordered condition → outcome lines).
 * Stored as `productConfiguration.underwritingRules` = { items: UwRuleLine[] }.
 */

import { YES_NO_ACTIVE } from "./productStudioCharges.js";

export { YES_NO_ACTIVE };

export const UW_FACT_OPERATOR_OPTIONS = [
  { value: "", label: "—" },
  { value: "gt", label: "Greater than ( > )" },
  { value: "gte", label: "Greater or equal ( ≥ )" },
  { value: "lt", label: "Less than ( < )" },
  { value: "lte", label: "Less or equal ( ≤ )" },
  { value: "eq", label: "Equals" },
  { value: "neq", label: "Not equals" },
  { value: "in_list", label: "In list / multiselect" },
  { value: "between", label: "Between (two thresholds)" },
  { value: "expression", label: "Custom expression (engine)" },
];

export const UW_OUTCOME_KIND_OPTIONS = [
  { value: "", label: "—" },
  { value: "medical_required", label: "Medical required" },
  { value: "referral_uw", label: "Underwriter referral" },
  { value: "loading", label: "Loading" },
  { value: "exclusion", label: "Exclusion" },
  { value: "decline", label: "Decline" },
  { value: "table_rate", label: "Table / class rate" },
  { value: "financial_uw", label: "Financial underwriting" },
  { value: "compliance_referral", label: "Compliance referral" },
  { value: "combined", label: "Combined outcomes" },
  { value: "other", label: "Other (describe)" },
];

export const UW_ON_MATCH_OPTIONS = [
  { value: "", label: "—" },
  { value: "continue", label: "Continue evaluating lower-priority rules" },
  { value: "stop_branch", label: "Stop this branch" },
  { value: "stop_all", label: "Stop — final decision" },
];

export const UW_COMBINE_WITH_NEXT_OPTIONS = [
  { value: "", label: "—" },
  { value: "none", label: "None" },
  { value: "and", label: "AND (all must match)" },
  { value: "or", label: "OR (either may match)" },
];

/** Starter conditions from product playbook (condition → typical outcome). */
export const UW_RULE_CONDITION_CATALOG = [
  { id: "sa_above_2m", conditionLabel: "Sum assured > AED 2M", defaultOutcomeDescription: "Medical required" },
  { id: "age55_sa500k", conditionLabel: "Age > 55 and SA > AED 500k", defaultOutcomeDescription: "Medical + underwriter referral" },
  { id: "bmi_threshold", conditionLabel: "BMI above threshold", defaultOutcomeDescription: "Loading or referral" },
  { id: "hazardous_occupation", conditionLabel: "Hazardous occupation", defaultOutcomeDescription: "Loading / exclusion / decline" },
  { id: "smoker", conditionLabel: "Smoker", defaultOutcomeDescription: "Smoker rate table" },
  { id: "ci_yes", conditionLabel: "Critical illness answer = yes", defaultOutcomeDescription: "Referral" },
  { id: "prev_declined", conditionLabel: "Previous declined insurance", defaultOutcomeDescription: "Referral" },
  { id: "aviation_hobbies", conditionLabel: "Aviation / diving / motorsport", defaultOutcomeDescription: "Exclusion or loading" },
  { id: "non_resident", conditionLabel: "Non-resident", defaultOutcomeDescription: "Referral or decline" },
  { id: "high_risk_residency", conditionLabel: "High-risk nationality / residency", defaultOutcomeDescription: "Referral" },
  { id: "pep", conditionLabel: "Politically exposed person", defaultOutcomeDescription: "Compliance referral" },
  { id: "premium_financial", conditionLabel: "Premium above financial threshold", defaultOutcomeDescription: "Financial underwriting" },
  { id: "custom", conditionLabel: "Custom condition", defaultOutcomeDescription: "Define in narrative" },
];

export function getUwConditionCatalogEntry(conditionTypeId) {
  return UW_RULE_CONDITION_CATALOG.find((c) => c.id === conditionTypeId) || null;
}

export function labelFromUwOptions(options, value) {
  const o = options.find((x) => x.value === value);
  return o?.label || value || "—";
}

export function emptyUwRuleForm() {
  return {
    conditionTypeId: "",
    customConditionName: "",
    conditionNarrative: "",
    variableCode: "",
    secondaryFactKey: "",
    operator: "",
    thresholdPrimary: "",
    thresholdSecondary: "",
    currency: "",
    outcomeType: "",
    outcomeDetail: "",
    onMatch: "",
    priority: "",
    combineWithNext: "",
    notes: "",
    active: "Yes",
  };
}

function normalizeUwItem(it) {
  const e = emptyUwRuleForm();
  if (!it || typeof it !== "object") {
    return { id: "", ...e };
  }
  const pick = (k) => String(it[k] ?? "").trim();
  const active = pick("active");
  return {
    id: pick("id"),
    conditionTypeId: pick("conditionTypeId"),
    customConditionName: pick("customConditionName"),
    conditionNarrative: pick("conditionNarrative"),
    variableCode: pick("variableCode"),
    secondaryFactKey: pick("secondaryFactKey"),
    operator: pick("operator"),
    thresholdPrimary: pick("thresholdPrimary"),
    thresholdSecondary: pick("thresholdSecondary"),
    currency: pick("currency"),
    outcomeType: pick("outcomeType"),
    outcomeDetail: pick("outcomeDetail"),
    onMatch: pick("onMatch"),
    priority: pick("priority"),
    combineWithNext: pick("combineWithNext"),
    notes: pick("notes"),
    active: active === "No" ? "No" : "Yes",
  };
}

function uwItemIsValid(it) {
  if (!it.id || !it.conditionTypeId) {
    return false;
  }
  if (it.conditionTypeId === "custom") {
    return Boolean(it.customConditionName);
  }
  return true;
}

export function defaultUnderwritingRulesConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizeUnderwritingRulesConfiguration(raw) {
  const base = defaultUnderwritingRulesConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  if (Array.isArray(raw)) {
    return {
      items: raw.map((x) => normalizeUwItem(x)).filter(uwItemIsValid),
    };
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  if (list.length > 0) {
    return {
      items: list.map((x) => normalizeUwItem(x)).filter(uwItemIsValid),
    };
  }
  return base;
}

/** @param {unknown} row */
export function uwRuleRowToForm(row) {
  const r = row && typeof row === "object" ? row : {};
  return {
    conditionTypeId: String(r.conditionTypeId ?? "").trim(),
    customConditionName: String(r.customConditionName ?? "").trim(),
    conditionNarrative: String(r.conditionNarrative ?? "").trim(),
    variableCode: String(r.variableCode ?? "").trim(),
    secondaryFactKey: String(r.secondaryFactKey ?? "").trim(),
    operator: String(r.operator ?? "").trim(),
    thresholdPrimary: String(r.thresholdPrimary ?? "").trim(),
    thresholdSecondary: String(r.thresholdSecondary ?? "").trim(),
    currency: String(r.currency ?? "").trim(),
    outcomeType: String(r.outcomeType ?? "").trim(),
    outcomeDetail: String(r.outcomeDetail ?? "").trim(),
    onMatch: String(r.onMatch ?? "").trim(),
    priority: String(r.priority ?? "").trim(),
    combineWithNext: String(r.combineWithNext ?? "").trim(),
    notes: String(r.notes ?? "").trim(),
    active: String(r.active ?? "").trim() === "No" ? "No" : "Yes",
  };
}

/** @param {object} form */
export function uwRuleFormToRowPartial(form) {
  const f = form && typeof form === "object" ? form : {};
  const active = String(f.active ?? "").trim() === "No" ? "No" : "Yes";
  return {
    conditionTypeId: String(f.conditionTypeId ?? "").trim(),
    customConditionName: String(f.customConditionName ?? "").trim(),
    conditionNarrative: String(f.conditionNarrative ?? "").trim(),
    variableCode: String(f.variableCode ?? "").trim(),
    secondaryFactKey: String(f.secondaryFactKey ?? "").trim(),
    operator: String(f.operator ?? "").trim(),
    thresholdPrimary: String(f.thresholdPrimary ?? "").trim(),
    thresholdSecondary: String(f.thresholdSecondary ?? "").trim(),
    currency: String(f.currency ?? "").trim(),
    outcomeType: String(f.outcomeType ?? "").trim(),
    outcomeDetail: String(f.outcomeDetail ?? "").trim(),
    onMatch: String(f.onMatch ?? "").trim(),
    priority: String(f.priority ?? "").trim(),
    combineWithNext: String(f.combineWithNext ?? "").trim(),
    notes: String(f.notes ?? "").trim(),
    active,
  };
}

/** @param {object} form */
export function validateUwRuleForm(form) {
  const f = form && typeof form === "object" ? form : {};
  if (!String(f.conditionTypeId ?? "").trim()) {
    return "Select a condition template.";
  }
  if (f.conditionTypeId === "custom" && !String(f.customConditionName ?? "").trim()) {
    return "Custom condition name is required.";
  }
  return null;
}

export const DEMO_UNDERWRITING_RULES_LIST = [
  {
    id: "demo-uw-sa2m",
    conditionTypeId: "sa_above_2m",
    customConditionName: "",
    conditionNarrative: "Sum assured > AED 2,000,000",
    variableCode: "sum_assured",
    secondaryFactKey: "",
    operator: "gt",
    thresholdPrimary: "2000000",
    thresholdSecondary: "",
    currency: "AED",
    outcomeType: "medical_required",
    outcomeDetail: "APS + blood profile per medical grid M1",
    onMatch: "stop_branch",
    priority: "10",
    combineWithNext: "none",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-uw-age55",
    conditionTypeId: "age55_sa500k",
    customConditionName: "",
    conditionNarrative: "Attained age > 55 AND sum assured > AED 500,000",
    variableCode: "attained_age",
    secondaryFactKey: "sum_assured",
    operator: "expression",
    thresholdPrimary: "age>55 && sa>500000",
    thresholdSecondary: "",
    currency: "AED",
    outcomeType: "combined",
    outcomeDetail: "Medical + mandatory underwriter referral",
    onMatch: "continue",
    priority: "20",
    combineWithNext: "and",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-uw-bmi",
    conditionTypeId: "bmi_threshold",
    customConditionName: "",
    conditionNarrative: "BMI above band per occupation table OB-2",
    variableCode: "bmi",
    secondaryFactKey: "",
    operator: "gte",
    thresholdPrimary: "32",
    thresholdSecondary: "38",
    currency: "",
    outcomeType: "loading",
    outcomeDetail: "Refer if BMI > 38; else standard loading bands L1–L3",
    onMatch: "continue",
    priority: "30",
    combineWithNext: "none",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-uw-pep",
    conditionTypeId: "pep",
    customConditionName: "",
    conditionNarrative: "Applicant or related party flagged as PEP",
    variableCode: "pep_flag",
    secondaryFactKey: "",
    operator: "eq",
    thresholdPrimary: "true",
    thresholdSecondary: "",
    currency: "",
    outcomeType: "compliance_referral",
    outcomeDetail: "AML / compliance queue — no bind until cleared",
    onMatch: "stop_all",
    priority: "5",
    combineWithNext: "none",
    notes: "Overrides standard medical path",
    active: "Yes",
  },
  {
    id: "demo-uw-fin",
    conditionTypeId: "premium_financial",
    customConditionName: "",
    conditionNarrative: "Annualised premium exceeds free-cover financial limit",
    variableCode: "annual_premium",
    secondaryFactKey: "free_cover_limit",
    operator: "gt",
    thresholdPrimary: "ratio>1",
    thresholdSecondary: "",
    currency: "AED",
    outcomeType: "financial_uw",
    outcomeDetail: "Evidence of income + DSR check per FW-01",
    onMatch: "continue",
    priority: "25",
    combineWithNext: "or",
    notes: "",
    active: "Yes",
  },
];
