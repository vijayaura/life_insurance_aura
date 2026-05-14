/**
 * Product Studio — UL / fund menu configuration.
 * Stored as `productConfiguration.funds` = { items: Fund[] }.
 */

export const FUND_TYPE_OPTIONS = ["Equity", "Bond", "Balanced", "Money market", "Sukuk", "Global"];

export const FUND_CURRENCY_OPTIONS = ["AED", "USD", "SAR", "OMR", "QAR", "BHD", "KWD", "EUR", "GBP"];

export const RISK_RATING_OPTIONS = ["Low", "Medium", "High"];

export const FUND_MANAGER_OPTIONS = ["Internal", "External"];

export const NAV_FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly"];

export const FUND_STATUS_OPTIONS = ["Active", "Suspended", "Closed"];

export const SHARIA_GUARANTEE_OPTIONS = ["Yes", "No"];

export const YES_NO_ALLOC_OPTIONS = [
  { value: "", label: "—" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

/** Per-fund allocation / switching rules (ILP menu). */
export function emptyAllocationRulesForm() {
  return {
    minNumberOfFunds: "",
    maxNumberOfFunds: "",
    minAllocationPerFundPct: "",
    allocationTotalMustEqualPct: "",
    defaultFundName: "",
    autoRebalancing: "",
    switchingAllowed: "",
    freeSwitchesPerYear: "",
    switchFeeAfterFree: "",
    topUpAllowed: "",
    partialWithdrawalAllowed: "",
    minWithdrawalAmount: "",
    minRemainingFundValue: "",
    premiumHolidayAllowed: "",
    loyaltyUnits: "",
  };
}

/** @param {unknown} raw */
export function normalizeAllocationRules(raw) {
  const d = emptyAllocationRulesForm();
  if (!raw || typeof raw !== "object") {
    return d;
  }
  const out = { ...d };
  for (const k of Object.keys(d)) {
    out[k] = String(raw[k] ?? "").trim();
  }
  return out;
}

/** Sample funds shown when the product has none saved (same pattern as core benefits demo list). */
export const DEMO_FUNDS_LIST = [
  {
    id: "demo-fund-balanced-ae",
    fundName: "Salama Balanced Growth",
    fundCode: "SAL-BAL-AE",
    fundType: "Balanced",
    currency: "AED",
    riskRating: "Medium",
    fundManager: "Internal",
    navFrequency: "Daily",
    minAllocationPct: "10",
    maxAllocationPct: "100",
    fundStatus: "Active",
    shariaCompliant: "Yes",
    guaranteeApplicable: "No",
  },
  {
    id: "demo-fund-equity-usd",
    fundName: "Global Equity Index",
    fundCode: "GLB-EQ-USD",
    fundType: "Equity",
    currency: "USD",
    riskRating: "High",
    fundManager: "External",
    navFrequency: "Daily",
    minAllocationPct: "5",
    maxAllocationPct: "80",
    fundStatus: "Active",
    shariaCompliant: "No",
    guaranteeApplicable: "No",
  },
  {
    id: "demo-fund-sukuk",
    fundName: "Sukuk Income Portfolio",
    fundCode: "SUK-INC-AE",
    fundType: "Sukuk",
    currency: "AED",
    riskRating: "Low",
    fundManager: "External",
    navFrequency: "Weekly",
    minAllocationPct: "15",
    maxAllocationPct: "100",
    fundStatus: "Active",
    shariaCompliant: "Yes",
    guaranteeApplicable: "Yes",
  },
  {
    id: "demo-fund-money-mkt",
    fundName: "Liquidity Money Market",
    fundCode: "MM-LIQ-AE",
    fundType: "Money market",
    currency: "AED",
    riskRating: "Low",
    fundManager: "Internal",
    navFrequency: "Monthly",
    minAllocationPct: "0",
    maxAllocationPct: "100",
    fundStatus: "Active",
    shariaCompliant: "No",
    guaranteeApplicable: "No",
  },
];

export function emptyFundForm() {
  return {
    fundName: "",
    fundCode: "",
    fundType: "",
    currency: "",
    riskRating: "",
    fundManager: "",
    navFrequency: "",
    minAllocationPct: "",
    maxAllocationPct: "",
    fundStatus: "Active",
    shariaCompliant: "",
    guaranteeApplicable: "",
  };
}

function normalizeFundRow(it) {
  const e = emptyFundForm();
  if (!it || typeof it !== "object") {
    return { id: "", ...e, allocationRules: normalizeAllocationRules({}) };
  }
  const pick = (k) => String(it[k] ?? "").trim();
  return {
    id: pick("id"),
    fundName: pick("fundName"),
    fundCode: pick("fundCode").toUpperCase(),
    fundType: pick("fundType"),
    currency: pick("currency"),
    riskRating: pick("riskRating"),
    fundManager: pick("fundManager"),
    navFrequency: pick("navFrequency"),
    minAllocationPct: pick("minAllocationPct"),
    maxAllocationPct: pick("maxAllocationPct"),
    fundStatus: pick("fundStatus") || e.fundStatus,
    shariaCompliant: pick("shariaCompliant"),
    guaranteeApplicable: pick("guaranteeApplicable"),
    allocationRules: normalizeAllocationRules(it.allocationRules),
  };
}

export function defaultFundsConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizeFundsConfiguration(raw) {
  const base = defaultFundsConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  return {
    items: list
      .map((it) => normalizeFundRow(it))
      .filter((it) => it.id && it.fundCode),
  };
}
