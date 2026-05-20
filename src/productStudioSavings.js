/**
 * Product Studio — savings benefit mechanics (guaranteed values, bonuses, crediting).
 * Stored as `productConfiguration.savings` = { items: SavingsFeatureLine[] }.
 */

export const YES_NO_ACTIVE = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const SAVINGS_BASIS_OPTIONS = [
  { value: "", label: "—" },
  { value: "guaranteed", label: "Guaranteed" },
  { value: "discretionary", label: "Discretionary / board-declared" },
  { value: "formula", label: "Formula-driven" },
  { value: "fund_linked", label: "Fund-linked / unit-linked" },
  { value: "hybrid", label: "Hybrid (guaranteed + variable)" },
  { value: "na", label: "Not applicable" },
];

/** Canonical savings features for benefit configuration. */
export const SAVINGS_FEATURE_CATALOG = [
  { id: "guaranteed_maturity", featureName: "Guaranteed maturity benefit", catalogDescription: "Minimum benefit at maturity" },
  { id: "guaranteed_death", featureName: "Guaranteed death benefit (savings)", catalogDescription: "Death benefit on savings / endowment" },
  { id: "guaranteed_crediting", featureName: "Guaranteed crediting rate", catalogDescription: "Fixed crediting on account value" },
  { id: "reversionary_bonus", featureName: "Reversionary bonus", catalogDescription: "Annual bonus added to policy" },
  { id: "terminal_bonus", featureName: "Terminal bonus", catalogDescription: "Bonus at claim / maturity" },
  { id: "loyalty_bonus", featureName: "Loyalty / persistency bonus", catalogDescription: "Reward for continued premium payment" },
  { id: "cash_value_basis", featureName: "Cash value basis", catalogDescription: "How cash / account value is projected" },
  { id: "premium_allocation", featureName: "Premium allocation (savings)", catalogDescription: "% of premium to savings account" },
  { id: "partial_withdrawal", featureName: "Partial withdrawal (savings)", catalogDescription: "Withdrawals from accumulated value" },
  { id: "paid_up_option", featureName: "Paid-up option", catalogDescription: "Continue policy without further premium" },
  { id: "extended_term", featureName: "Extended term option", catalogDescription: "Reduced paid-up cover for remaining term" },
  { id: "custom", featureName: "Custom savings feature", catalogDescription: "User-defined savings mechanic" },
];

export function getSavingsCatalogEntry(featureTypeId) {
  return SAVINGS_FEATURE_CATALOG.find((c) => c.id === featureTypeId) || null;
}

export function emptySavingsFeatureForm() {
  return {
    featureTypeId: "",
    customFeatureName: "",
    description: "",
    basis: "",
    rateOrFormula: "",
    notes: "",
    active: "Yes",
  };
}

function normalizeSavingsItem(it) {
  const e = emptySavingsFeatureForm();
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
    basis: pick("basis"),
    rateOrFormula: pick("rateOrFormula"),
    notes: pick("notes"),
    active: active === "No" ? "No" : "Yes",
  };
}

function savingsItemIsValid(it) {
  if (!it.id || !it.featureTypeId) {
    return false;
  }
  if (it.featureTypeId === "custom") {
    return Boolean(it.customFeatureName);
  }
  return true;
}

export function defaultSavingsConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizeSavingsConfiguration(raw) {
  const base = defaultSavingsConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  if (Array.isArray(raw)) {
    return {
      items: raw.map((x) => normalizeSavingsItem(x)).filter(savingsItemIsValid),
    };
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  if (list.length > 0) {
    return {
      items: list.map((x) => normalizeSavingsItem(x)).filter(savingsItemIsValid),
    };
  }
  return base;
}

/** @param {unknown} row */
export function savingsRowToForm(row) {
  const r = row && typeof row === "object" ? row : {};
  return {
    featureTypeId: String(r.featureTypeId ?? "").trim(),
    customFeatureName: String(r.customFeatureName ?? "").trim(),
    description: String(r.description ?? "").trim(),
    basis: String(r.basis ?? "").trim(),
    rateOrFormula: String(r.rateOrFormula ?? "").trim(),
    notes: String(r.notes ?? "").trim(),
    active: String(r.active ?? "").trim() === "No" ? "No" : "Yes",
  };
}

/** @param {object} form */
export function savingsFormToRowPartial(form) {
  const f = form && typeof form === "object" ? form : {};
  const active = String(f.active ?? "").trim() === "No" ? "No" : "Yes";
  return {
    featureTypeId: String(f.featureTypeId ?? "").trim(),
    customFeatureName: String(f.customFeatureName ?? "").trim(),
    description: String(f.description ?? "").trim(),
    basis: String(f.basis ?? "").trim(),
    rateOrFormula: String(f.rateOrFormula ?? "").trim(),
    notes: String(f.notes ?? "").trim(),
    active,
  };
}

/** @param {object} form */
export function validateSavingsForm(form) {
  const f = form && typeof form === "object" ? form : {};
  if (!String(f.featureTypeId ?? "").trim()) {
    return "Select a savings feature.";
  }
  if (f.featureTypeId === "custom" && !String(f.customFeatureName ?? "").trim()) {
    return "Custom feature name is required.";
  }
  return null;
}

/** Demo lines when product has none saved. */
export const DEMO_SAVINGS_LIST = [
  {
    id: "demo-sav-gmb",
    featureTypeId: "guaranteed_maturity",
    customFeatureName: "",
    description: "Minimum benefit at maturity",
    basis: "guaranteed",
    rateOrFormula: "100% of sum assured plus declared bonuses",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-sav-credit",
    featureTypeId: "guaranteed_crediting",
    customFeatureName: "",
    description: "Fixed crediting on account value",
    basis: "guaranteed",
    rateOrFormula: "2.5% p.a. on account value",
    notes: "Reviewed annually by actuarial committee",
    active: "Yes",
  },
  {
    id: "demo-sav-rev-bonus",
    featureTypeId: "reversionary_bonus",
    customFeatureName: "",
    description: "Annual bonus added to policy",
    basis: "discretionary",
    rateOrFormula: "Declared yearly; simple reversionary",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-sav-alloc",
    featureTypeId: "premium_allocation",
    customFeatureName: "",
    description: "% of premium to savings account",
    basis: "formula",
    rateOrFormula: "95% of premium after initial charge",
    notes: "",
    active: "Yes",
  },
];
