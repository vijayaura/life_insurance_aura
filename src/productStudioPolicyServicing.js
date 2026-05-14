/**
 * Product Studio — surrender, loan, withdrawal & policy servicing rules (line items).
 * Stored as `productConfiguration.policyServicing` = { items: ServicingRuleLine[] }.
 */

export const YES_NO_ACTIVE = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const SERVICING_ALLOWED_AS = [
  { value: "", label: "—" },
  { value: "allowed", label: "Allowed" },
  { value: "not_allowed", label: "Not allowed" },
  { value: "limited", label: "Limited / conditional" },
  { value: "na", label: "Not applicable" },
];

export const SERVICING_UW_OPTIONS = [
  { value: "", label: "—" },
  { value: "yes", label: "Underwriting required" },
  { value: "no", label: "No underwriting" },
  { value: "conditional", label: "Conditional / case-by-case" },
];

/** Canonical servicing features (Create rule picks from this list). */
export const SERVICING_FEATURE_CATALOG = [
  { id: "full_surrender", featureName: "Full Surrender", catalogDescription: "Allowed after certain duration" },
  { id: "partial_withdrawal", featureName: "Partial Withdrawal", catalogDescription: "Allowed after lock-in period" },
  { id: "policy_loan", featureName: "Policy Loan", catalogDescription: "Allowed on whole life/cash value products" },
  { id: "premium_holiday", featureName: "Premium Holiday", catalogDescription: "Allowed after minimum paid period" },
  { id: "fund_switch", featureName: "Fund Switch", catalogDescription: "Allowed for UL products" },
  { id: "topup", featureName: "Top-up", catalogDescription: "Single additional contribution" },
  { id: "change_beneficiary", featureName: "Change Beneficiary", catalogDescription: "Allowed subject to rules" },
  { id: "change_premium_frequency", featureName: "Change Premium Frequency", catalogDescription: "Monthly to annual, etc." },
  { id: "increase_sum_assured", featureName: "Increase Sum Assured", catalogDescription: "Requires underwriting" },
  { id: "decrease_sum_assured", featureName: "Decrease Sum Assured", catalogDescription: "May be allowed without UW" },
  { id: "add_rider", featureName: "Add Rider", catalogDescription: "May require underwriting" },
  { id: "remove_rider", featureName: "Remove Rider", catalogDescription: "Allowed on anniversary" },
  { id: "reinstatement", featureName: "Reinstatement", catalogDescription: "Allowed within defined period" },
  { id: "assignment", featureName: "Assignment", catalogDescription: "Bank/lender assignment" },
  { id: "nomination", featureName: "Nomination", catalogDescription: "Beneficiary registration" },
  { id: "free_look", featureName: "Free Look Cancellation", catalogDescription: "Allowed within cooling-off period" },
  { id: "custom", featureName: "Custom rule", catalogDescription: "User-defined servicing rule" },
];

export function getServicingCatalogEntry(featureTypeId) {
  return SERVICING_FEATURE_CATALOG.find((c) => c.id === featureTypeId) || null;
}

export function emptyServicingRuleForm() {
  return {
    featureTypeId: "",
    customFeatureName: "",
    description: "",
    allowedAs: "",
    effectiveTiming: "",
    uwRequired: "",
    notes: "",
    active: "Yes",
  };
}

function normalizeServicingItem(it) {
  const e = emptyServicingRuleForm();
  if (!it || typeof it !== "object") {
    return { id: "", ...e };
  }
  const pick = (k) => String(it[k] ?? "").trim();
  const active = pick("active");
  return {
    id: pick("id"),
    featureTypeId: pick("featureTypeId"),
    customFeatureName: pick("customFeatureName"),
    description: pick("description"),
    allowedAs: pick("allowedAs"),
    effectiveTiming: pick("effectiveTiming"),
    uwRequired: pick("uwRequired"),
    notes: pick("notes"),
    active: active === "No" ? "No" : "Yes",
  };
}

function servicingItemIsValid(it) {
  if (!it.id || !it.featureTypeId) {
    return false;
  }
  if (it.featureTypeId === "custom") {
    return Boolean(it.customFeatureName);
  }
  return true;
}

export function defaultPolicyServicingConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizePolicyServicingConfiguration(raw) {
  const base = defaultPolicyServicingConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  if (Array.isArray(raw)) {
    return {
      items: raw.map((x) => normalizeServicingItem(x)).filter(servicingItemIsValid),
    };
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  if (list.length > 0) {
    return {
      items: list.map((x) => normalizeServicingItem(x)).filter(servicingItemIsValid),
    };
  }
  return base;
}

/** Demo rule lines when product has none saved. */
export const DEMO_POLICY_SERVICING_LIST = [
  {
    id: "demo-srv-surrender",
    featureTypeId: "full_surrender",
    customFeatureName: "",
    description: "Allowed after certain duration",
    allowedAs: "allowed",
    effectiveTiming: "After end of policy year 3; zero SC after year 10",
    uwRequired: "no",
    notes: "Surrender charge scale per product appendix A",
    active: "Yes",
  },
  {
    id: "demo-srv-partial",
    featureTypeId: "partial_withdrawal",
    customFeatureName: "",
    description: "Allowed after lock-in period",
    allowedAs: "limited",
    effectiveTiming: "After 5-year lock-in; max 2 WD per year",
    uwRequired: "no",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-srv-loan",
    featureTypeId: "policy_loan",
    customFeatureName: "",
    description: "Allowed on whole life/cash value products",
    allowedAs: "allowed",
    effectiveTiming: "When net CSV ≥ minimum loan threshold",
    uwRequired: "no",
    notes: "Interest rate board-approved",
    active: "Yes",
  },
  {
    id: "demo-srv-fund-switch",
    featureTypeId: "fund_switch",
    customFeatureName: "",
    description: "Allowed for UL products",
    allowedAs: "allowed",
    effectiveTiming: "4 free switches per policy year; fee thereafter",
    uwRequired: "no",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-srv-increase-sa",
    featureTypeId: "increase_sum_assured",
    customFeatureName: "",
    description: "Requires underwriting",
    allowedAs: "limited",
    effectiveTiming: "On anniversary only; evidence of insurability",
    uwRequired: "yes",
    notes: "",
    active: "Yes",
  },
];
