/**
 * Product Studio — charges & fees (line items per product).
 * Stored as `productConfiguration.charges` = { items: FeeLine[] }.
 */

export const YES_NO_ACTIVE = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const FEE_BASIS_OPTIONS = [
  { value: "", label: "—" },
  { value: "flat", label: "Fixed amount" },
  { value: "pct_premium", label: "% of premium" },
  { value: "pct_fund", label: "% of fund value" },
  { value: "bps", label: "Basis points (bps)" },
  { value: "per_policy", label: "Per policy (flat)" },
  { value: "schedule", label: "Per schedule / table" },
];

export const FEE_BILLING_OPTIONS = [
  { value: "", label: "—" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "on_premium", label: "On each premium" },
  { value: "on_event", label: "On event (switch, WD, etc.)" },
];

/** Canonical charge types (Create fee picks from this list). */
export const FEE_TYPE_CATALOG = [
  { id: "policy_fee", chargeName: "Policy Fee", catalogDescription: "Fixed monthly/annual fee" },
  { id: "allocation_charge", chargeName: "Allocation Charge", catalogDescription: "Deducted from premium before investment" },
  { id: "bid_offer_spread", chargeName: "Bid/Offer Spread", catalogDescription: "Difference between buying and selling units" },
  { id: "fund_management", chargeName: "Fund Management Charge", catalogDescription: "Annual percentage of fund value" },
  { id: "mortality", chargeName: "Mortality Charge", catalogDescription: "Cost of insurance deducted monthly" },
  { id: "rider", chargeName: "Rider Charge", catalogDescription: "Cost of rider benefit" },
  { id: "administration", chargeName: "Administration Charge", catalogDescription: "Monthly policy admin charge" },
  { id: "surrender", chargeName: "Surrender Charge", catalogDescription: "Deducted on early surrender" },
  { id: "partial_withdrawal", chargeName: "Partial Withdrawal Fee", catalogDescription: "Deducted on withdrawal" },
  { id: "fund_switch", chargeName: "Fund Switch Fee", catalogDescription: "Deducted after free switches" },
  { id: "topup", chargeName: "Top-up Charge", catalogDescription: "Deducted from additional contribution" },
  { id: "premium_holiday", chargeName: "Premium Holiday Charge", catalogDescription: "If applicable" },
  { id: "reinstatement", chargeName: "Reinstatement Fee", catalogDescription: "For lapsed policy revival" },
  { id: "custom", chargeName: "Custom fee", catalogDescription: "User-defined charge line" },
];

export function getFeeCatalogEntry(chargeTypeId) {
  return FEE_TYPE_CATALOG.find((c) => c.id === chargeTypeId) || null;
}

export function emptyFeeForm() {
  return {
    chargeTypeId: "",
    customChargeName: "",
    description: "",
    basisType: "",
    basisValue: "",
    billingFrequency: "",
    appliesWhen: "",
    notes: "",
    active: "Yes",
  };
}

function normalizeFeeItem(it) {
  const e = emptyFeeForm();
  if (!it || typeof it !== "object") {
    return { id: "", ...e };
  }
  const pick = (k) => String(it[k] ?? "").trim();
  const active = pick("active");
  return {
    id: pick("id"),
    chargeTypeId: pick("chargeTypeId"),
    customChargeName: pick("customChargeName"),
    description: pick("description"),
    basisType: pick("basisType"),
    basisValue: pick("basisValue"),
    billingFrequency: pick("billingFrequency"),
    appliesWhen: pick("appliesWhen"),
    notes: pick("notes"),
    active: active === "No" ? "No" : "Yes",
  };
}

function feeItemIsValid(it) {
  if (!it.id || !it.chargeTypeId) {
    return false;
  }
  if (it.chargeTypeId === "custom") {
    return Boolean(it.customChargeName);
  }
  return true;
}

export function defaultChargesConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizeChargesConfiguration(raw) {
  const base = defaultChargesConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  if (Array.isArray(raw)) {
    return {
      items: raw.map((x) => normalizeFeeItem(x)).filter(feeItemIsValid),
    };
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  if (list.length > 0) {
    return {
      items: list.map((x) => normalizeFeeItem(x)).filter(feeItemIsValid),
    };
  }
  return base;
}

/** Demo fee lines when product has none saved. */
export const DEMO_FEES_LIST = [
  {
    id: "demo-fee-policy",
    chargeTypeId: "policy_fee",
    customChargeName: "",
    description: "Fixed monthly/annual fee",
    basisType: "flat",
    basisValue: "AED 25 / month",
    billingFrequency: "monthly",
    appliesWhen: "In force",
    notes: "Waived first policy year if campaign applies",
    active: "Yes",
  },
  {
    id: "demo-fee-allocation",
    chargeTypeId: "allocation_charge",
    customChargeName: "",
    description: "Deducted from premium before investment",
    basisType: "pct_premium",
    basisValue: "4%",
    billingFrequency: "on_premium",
    appliesWhen: "Years 1–5",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-fee-fmc",
    chargeTypeId: "fund_management",
    customChargeName: "",
    description: "Annual percentage of fund value",
    basisType: "pct_fund",
    basisValue: "1.35% p.a.",
    billingFrequency: "monthly",
    appliesWhen: "Daily accrual on unit fund",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-fee-coi",
    chargeTypeId: "mortality",
    customChargeName: "",
    description: "Cost of insurance deducted monthly",
    basisType: "schedule",
    basisValue: "Attained-age COI table v3",
    billingFrequency: "monthly",
    appliesWhen: "UL deduction from units",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-fee-switch",
    chargeTypeId: "fund_switch",
    customChargeName: "",
    description: "Deducted after free switches",
    basisType: "flat",
    basisValue: "AED 50 after 4 free / year",
    billingFrequency: "on_event",
    appliesWhen: "Per switch request",
    notes: "",
    active: "Yes",
  },
];
