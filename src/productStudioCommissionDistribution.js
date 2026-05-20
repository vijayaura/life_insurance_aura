/**
 * Product Studio — commission & distribution setup (flat form under `productConfiguration.commissionDistribution`).
 */

/** Reference taxonomy (Type → Description). Used in UI reference table, not stored as rows. */
export const COMMISSION_TYPE_CATALOG = [
  { id: "first_year", typeLabel: "First Year Commission", description: "High commission in year 1" },
  { id: "renewal", typeLabel: "Renewal Commission", description: "Smaller commission in later years" },
  { id: "level", typeLabel: "Level Commission", description: "Same percentage throughout" },
  { id: "trail", typeLabel: "Trail Commission", description: "Based on fund value" },
  { id: "override", typeLabel: "Override Commission", description: "Manager/agency override" },
  { id: "broker", typeLabel: "Broker Commission", description: "Broker remuneration" },
  { id: "bancassurance", typeLabel: "Bancassurance Commission", description: "Bank distribution commission" },
  { id: "clawback", typeLabel: "Clawback", description: "If policy lapses early" },
  { id: "persistency", typeLabel: "Persistency Bonus", description: "Based on policy retention" },
  { id: "campaign", typeLabel: "Campaign Bonus", description: "Temporary incentive" },
];

export const COMMISSION_BASED_ON_OPTIONS = [
  { value: "", label: "—" },
  { value: "annualized_premium", label: "Annualized premium" },
  { value: "paid_premium", label: "Paid premium" },
  { value: "fund_value", label: "Fund value" },
  { value: "other", label: "Other (describe in notes)" },
];

export const RIDER_COMMISSION_OPTIONS = [
  { value: "", label: "—" },
  { value: "same_as_base", label: "Same as base" },
  { value: "different_from_base", label: "Different from base" },
  { value: "not_applicable", label: "Not applicable" },
];

export const CHANNEL_SPECIFIC_OPTIONS = [
  { value: "", label: "—" },
  { value: "broker", label: "Broker" },
  { value: "bank", label: "Bank (bancassurance)" },
  { value: "direct", label: "Direct" },
  { value: "mixed", label: "Mixed / multiple channels" },
];

const KEYS = [
  "year1Commission",
  "year2Commission",
  "renewalCommission",
  "clawbackPeriod",
  "clawbackBasis",
  "commissionBasedOn",
  "riderCommission",
  "channelSpecific",
  "commissionNotes",
];

export function defaultCommissionDistributionConfiguration() {
  return {
    year1Commission: "",
    year2Commission: "",
    renewalCommission: "",
    clawbackPeriod: "",
    clawbackBasis: "",
    commissionBasedOn: "",
    riderCommission: "",
    channelSpecific: "",
    commissionNotes: "",
  };
}

/** @param {unknown} raw */
export function normalizeCommissionDistributionConfiguration(raw) {
  const base = defaultCommissionDistributionConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const out = { ...base };
  for (const k of KEYS) {
    if (raw[k] != null) {
      out[k] = String(raw[k]).trim();
    }
  }
  return out;
}
