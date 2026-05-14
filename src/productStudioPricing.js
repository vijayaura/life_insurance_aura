/**
 * Product Studio — pricing methods + per-method configuration defaults.
 * Stored under `productConfiguration.pricing`.
 */

export const PRICING_METHOD_CATALOG = [
  {
    id: "rate_table",
    label: "Rate Table Pricing",
    usedFor: "Term life, CI, PA, group life",
  },
  {
    id: "mortality_table",
    label: "Mortality Table Pricing",
    usedFor: "Individual life, whole life, savings",
  },
  {
    id: "formula_based",
    label: "Formula-Based Pricing",
    usedFor: "Flexible products",
  },
  {
    id: "fund_allocation",
    label: "Fund Allocation Pricing",
    usedFor: "Unit-linked products",
  },
  {
    id: "guaranteed_rate",
    label: "Guaranteed Rate Pricing",
    usedFor: "Savings / endowment",
  },
  {
    id: "experience_rated",
    label: "Experience-Rated Pricing",
    usedFor: "Group life",
  },
  {
    id: "loan_balance",
    label: "Loan Balance Pricing",
    usedFor: "Credit life",
  },
  {
    id: "reinsurance_rate",
    label: "Reinsurance Rate Pricing",
    usedFor: "Facultative or treaty-backed products",
  },
];

const METHOD_IDS = PRICING_METHOD_CATALOG.map((m) => m.id);

/** @param {{ productCategory?: string, productType?: string }} product */
export function suggestPricingMethodId(product) {
  const cat = String(product?.productCategory || "").trim();
  const typ = String(product?.productType || "").trim();
  if (cat === "Credit Life") {
    return "loan_balance";
  }
  if (cat === "Group Life") {
    return "experience_rated";
  }
  if (cat === "Unit Linked" || typ === "ULIP") {
    return "fund_allocation";
  }
  if (cat === "Savings" || typ === "Endowment") {
    return "guaranteed_rate";
  }
  if (typ === "Universal Life") {
    return "formula_based";
  }
  if (cat === "Whole Life" || typ === "Whole Life") {
    return "mortality_table";
  }
  if (typ === "Term" || typ === "PA Life Package") {
    return "rate_table";
  }
  if (cat === "Protection") {
    return "rate_table";
  }
  return "rate_table";
}

export function getPricingMethodMeta(id) {
  return PRICING_METHOD_CATALOG.find((m) => m.id === id) || PRICING_METHOD_CATALOG[0];
}

/** Default flat config keys per method (all strings for form binding). */
function emptyConfigForMethod(methodId) {
  const common = {
    configNotes: "",
    roundingRule: "",
    minimumPremium: "",
    maximumPremium: "",
  };
  const byMethod = {
    rate_table: {
      ...common,
      rateTableCode: "",
      rateTableVersion: "",
      ratingAgeBasis: "",
      smokerDistinctTables: "",
      loadingsAllowed: "",
      premiumMode: "",
    },
    mortality_table: {
      ...common,
      baseMortalityTable: "",
      mortalityClassBasis: "",
      interestRateAssumption: "",
      reserveMethodRef: "",
      selectPeriodRules: "",
    },
    formula_based: {
      ...common,
      formulaId: "",
      formulaExpression: "",
      inputVariables: "",
      benefitCaps: "",
      recalculationTrigger: "",
    },
    fund_allocation: {
      ...common,
      fundMenuCode: "",
      bidOfferSpreadBps: "",
      allocationConstraints: "",
      unitPricingFrequency: "",
      ilpChargeBasis: "",
    },
    guaranteed_rate: {
      ...common,
      guaranteedRateBasis: "",
      creditingRateTable: "",
      bonusScaleReference: "",
      profitParticipationRule: "",
      maturityValueFloor: "",
    },
    experience_rated: {
      ...common,
      experiencePoolId: "",
      poolingPeriodMonths: "",
      corridorMinMax: "",
      deficitCarryforward: "",
      renewalAdjustmentRule: "",
    },
    loan_balance: {
      ...common,
      interestRateBasis: "",
      capitalisationFrequency: "",
      maxLTVPercent: "",
      coverBasisDeclining: "",
      premiumCalculationNote: "",
    },
    reinsurance_rate: {
      ...common,
      treatyReference: "",
      facultativeWorkflow: "",
      cedingCommissionBasis: "",
      retentionLimit: "",
      pricingSlipTemplate: "",
    },
  };
  return byMethod[methodId] || { ...common };
}

export function defaultPricingConfiguration() {
  const methodConfigurations = {};
  for (const id of METHOD_IDS) {
    methodConfigurations[id] = emptyConfigForMethod(id);
  }
  return {
    selectedMethodId: "rate_table",
    methodConfigurations,
  };
}

/** @param {unknown} raw */
export function normalizePricingConfiguration(raw) {
  const base = defaultPricingConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const sel = String(raw.selectedMethodId || "").trim();
  const selectedMethodId = METHOD_IDS.includes(sel) ? sel : base.selectedMethodId;
  const incoming = raw.methodConfigurations;
  const methodConfigurations = { ...base.methodConfigurations };
  if (incoming && typeof incoming === "object") {
    for (const id of METHOD_IDS) {
      const patch = incoming[id];
      const defaults = emptyConfigForMethod(id);
      if (patch && typeof patch === "object") {
        const merged = { ...defaults };
        for (const k of Object.keys(defaults)) {
          if (patch[k] != null) {
            merged[k] = String(patch[k]);
          }
        }
        methodConfigurations[id] = merged;
      }
    }
  }
  return { selectedMethodId, methodConfigurations };
}

/**
 * Field groups for Product Studio form layout (psc-field-grid).
 * type: text | textarea | select
 */
export const PRICING_METHOD_FORM_BLUEPRINT = {
  rate_table: [
    {
      title: "Rate table reference",
      fields: [
        { key: "rateTableCode", label: "Rate table code", type: "text", placeholder: "e.g. RT-TERM-AE-2025" },
        { key: "rateTableVersion", label: "Table version", type: "text", placeholder: "e.g. v3.1" },
        { key: "ratingAgeBasis", label: "Rating age basis", type: "text", placeholder: "Nearest / last / next birthday" },
        {
          key: "smokerDistinctTables",
          label: "Smoker / non-smoker tables",
          type: "select",
          options: ["", "Yes", "No"],
        },
        { key: "loadingsAllowed", label: "Loadings allowed", type: "select", options: ["", "Yes", "No"] },
        { key: "premiumMode", label: "Premium mode", type: "text", placeholder: "e.g. stepped, level, single" },
      ],
    },
    {
      title: "Premium bounds & rounding",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "Per frequency" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "Cap if any" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "e.g. 2 dp, nearest 0.01" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "Assumptions, overrides, sign-off" },
      ],
    },
  ],
  mortality_table: [
    {
      title: "Mortality basis",
      fields: [
        { key: "baseMortalityTable", label: "Base mortality table", type: "text", placeholder: "Table code / vendor ref" },
        { key: "mortalityClassBasis", label: "Class / underwriting basis", type: "text", placeholder: "e.g. standard, preferred" },
        { key: "selectPeriodRules", label: "Select period rules", type: "textarea", placeholder: "Duration, repricing" },
        { key: "interestRateAssumption", label: "Interest / discount assumption", type: "text", placeholder: "For reserves / WL" },
        { key: "reserveMethodRef", label: "Reserve method reference", type: "text", placeholder: "Internal model id" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
  formula_based: [
    {
      title: "Formula engine",
      fields: [
        { key: "formulaId", label: "Formula / engine id", type: "text", placeholder: "Pricing engine reference" },
        { key: "formulaExpression", label: "Expression summary", type: "textarea", placeholder: "Human-readable summary" },
        { key: "inputVariables", label: "Input variables", type: "textarea", placeholder: "SA, age, term, fund mix…" },
        { key: "benefitCaps", label: "Benefit caps & floors", type: "textarea", placeholder: "" },
        { key: "recalculationTrigger", label: "Recalculation triggers", type: "text", placeholder: "e.g. fund switch, top-up" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
  fund_allocation: [
    {
      title: "Funds & units",
      fields: [
        { key: "fundMenuCode", label: "Fund menu code", type: "text", placeholder: "Approved fund list" },
        { key: "bidOfferSpreadBps", label: "Bid / offer spread (bps)", type: "text", placeholder: "" },
        { key: "allocationConstraints", label: "Allocation constraints", type: "textarea", placeholder: "Min/max per fund" },
        { key: "unitPricingFrequency", label: "Unit pricing frequency", type: "text", placeholder: "Daily, weekly…" },
        { key: "ilpChargeBasis", label: "ILP charge basis", type: "text", placeholder: "AMC, bid-offer…" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
  guaranteed_rate: [
    {
      title: "Guarantees & participation",
      fields: [
        { key: "guaranteedRateBasis", label: "Guaranteed rate basis", type: "text", placeholder: "" },
        { key: "creditingRateTable", label: "Crediting rate table", type: "text", placeholder: "" },
        { key: "bonusScaleReference", label: "Bonus scale reference", type: "text", placeholder: "" },
        { key: "profitParticipationRule", label: "Profit participation rule", type: "textarea", placeholder: "" },
        { key: "maturityValueFloor", label: "Maturity value floor", type: "text", placeholder: "" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
  experience_rated: [
    {
      title: "Pool & experience",
      fields: [
        { key: "experiencePoolId", label: "Experience pool id", type: "text", placeholder: "" },
        { key: "poolingPeriodMonths", label: "Pooling period (months)", type: "text", placeholder: "" },
        { key: "corridorMinMax", label: "Corridor min / max", type: "text", placeholder: "" },
        { key: "deficitCarryforward", label: "Deficit carry-forward", type: "textarea", placeholder: "" },
        { key: "renewalAdjustmentRule", label: "Renewal adjustment rule", type: "textarea", placeholder: "" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
  loan_balance: [
    {
      title: "Loan cover mechanics",
      fields: [
        { key: "interestRateBasis", label: "Interest rate basis", type: "text", placeholder: "Variable / fixed ref" },
        { key: "capitalisationFrequency", label: "Capitalisation frequency", type: "text", placeholder: "" },
        { key: "maxLTVPercent", label: "Max LTV %", type: "text", placeholder: "" },
        { key: "coverBasisDeclining", label: "Cover basis (declining)", type: "textarea", placeholder: "Outstanding balance rules" },
        { key: "premiumCalculationNote", label: "Premium calculation note", type: "textarea", placeholder: "" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
  reinsurance_rate: [
    {
      title: "Reinsurance pricing",
      fields: [
        { key: "treatyReference", label: "Treaty reference", type: "text", placeholder: "" },
        { key: "facultativeWorkflow", label: "Facultative workflow", type: "textarea", placeholder: "" },
        { key: "cedingCommissionBasis", label: "Ceding commission basis", type: "text", placeholder: "" },
        { key: "retentionLimit", label: "Retention limit", type: "text", placeholder: "" },
        { key: "pricingSlipTemplate", label: "Pricing slip template", type: "text", placeholder: "" },
      ],
    },
    {
      title: "Bounds & notes",
      fields: [
        { key: "minimumPremium", label: "Minimum premium", type: "text", placeholder: "" },
        { key: "maximumPremium", label: "Maximum premium", type: "text", placeholder: "" },
        { key: "roundingRule", label: "Rounding rule", type: "text", placeholder: "" },
        { key: "configNotes", label: "Underwriter notes", type: "textarea", placeholder: "" },
      ],
    },
  ],
};
