/**
 * Product Studio — product configuration (declarative tabs + resolvable defaults).
 *
 * Convention: "boxed structure" = one outer border + inner dividers only (no gaps
 * between segment borders). Tabs and rule rows are data-driven so future prompts
 * can add tabs, rules, and per-product overrides without rewiring UI.
 *
 * Expectation: configuration stays *declarative* (tab list + rule ids + resolvers +
 * editable overrides on `product.productConfiguration`) so behaviour is controllable,
 * testable, and easy to extend without duplicating layout logic in JSX.
 */

import { defaultChargesConfiguration } from "./productStudioCharges.js";
import { defaultFundsConfiguration } from "./productStudioFunds.js";
import { defaultPolicyServicingConfiguration } from "./productStudioPolicyServicing.js";
import { defaultUnderwritingRulesConfiguration } from "./productStudioUnderwriting.js";
import { defaultMedicalRequirementMatrixConfiguration } from "./productStudioMedicalMatrix.js";
import { defaultDocumentTemplatesConfiguration } from "./productStudioDocumentTemplates.js";
import { defaultCommissionDistributionConfiguration } from "./productStudioCommissionDistribution.js";
import { defaultTableStructureDesign } from "./productStudioTableStructure.jsx";
import { defaultRidersConfiguration } from "./productStudioRiders.js";

/** Section headings for the Product components card hub (display order). */
export const PRODUCT_COMPONENT_SECTION_ORDER = [
  "Policy controls",
  "Forms & Data",
  "Pricing & UW",
  "Reports & Integrations",
];

/**
 * Configuration tabs nested inside the Product details collapsible (order fixed).
 * `category` + `icon` drive the card hub layout; tabs without `category` fall back to "Other" in the hub.
 */
export const VIEW_CONFIG_TABS_INSIDE_DETAILS = [
  { id: "policy-term-coverage", label: "Policy term & coverage", ready: true, category: "Policy controls", icon: "layers" },
  {
    id: "policy-servicing",
    label: "Policy Servicing Rules",
    ready: true,
    category: "Policy controls",
    icon: "chart",
  },
  {
    id: "medical-matrix",
    label: "Medical Matrix",
    ready: true,
    category: "Policy controls",
    icon: "medical",
  },
  { id: "proposal-form-design", label: "Proposal Form Design", ready: true, category: "Forms & Data", icon: "document" },
  { id: "masters-management", label: "Masters Management", ready: true, category: "Forms & Data", icon: "database" },
  { id: "workflow-management", label: "Workflow Management", ready: true, category: "Forms & Data", icon: "flow" },
  { id: "authority-matrix", label: "Authority Matrix", ready: true, category: "Forms & Data", icon: "key" },
  {
    id: "table-structure-design",
    label: "Rating Structure Design",
    ready: true,
    category: "Pricing & UW",
    icon: "database",
  },
  { id: "underwriting-eligibility", label: "Underwriting eligibility", ready: true, category: "Pricing & UW", icon: "shield" },
  {
    id: "underwriting-rules",
    label: "UW Rules Engine",
    ready: true,
    category: "Pricing & UW",
    icon: "sliders",
  },
  {
    id: "commission-distribution",
    label: "Commissions & Campaigns",
    ready: true,
    category: "Pricing & UW",
    icon: "target",
  },
  {
    id: "document-templates",
    label: "Document Templates",
    ready: true,
    category: "Reports & Integrations",
    icon: "document",
  },
  { id: "notifications", label: "Notifications", ready: true, category: "Reports & Integrations", icon: "bell" },
];

/** Configuration tabs below Product details (benefits, riders, funds, charges). */
export const VIEW_CONFIG_TABS_BELOW_DETAILS = [
  { id: "benefit-premium", label: "Benefit amounts & premium", ready: true },
  { id: "core-benefits", label: "Core benefits", ready: true },
  { id: "riders", label: "Riders", ready: true },
  { id: "funds", label: "Funds & Investments", ready: true },
  { id: "charges", label: "Charges and fees", ready: true },
];

/** Full tab list: inside Product details first, then below (import/export and tooling). */
export const VIEW_CONFIG_TABS = [...VIEW_CONFIG_TABS_INSIDE_DETAILS, ...VIEW_CONFIG_TABS_BELOW_DETAILS];

const CCY = (p) => p?.productCurrency || "AED";

/** Shared length / maturity choices — used for policy term and coverage term multiselects. */
const PRODUCT_TERM_LENGTH_CHOICES = [
  "1 year",
  "5 years",
  "10 years",
  "15 years",
  "20 years",
  "25 years",
  "30 years",
  "To age 65",
  "To age 75",
  "To age 100",
  "Whole life",
  "Single year renewable",
];

/** Applicable benefits (benefit amounts section) — benefit name + description for multiselect rows. */
const APPLICABLE_BENEFITS_META = [
  ["Death Benefit", "Lump sum payable on death"],
  ["Terminal Illness Benefit", "Early payout if terminal illness diagnosed"],
  ["Maturity Benefit", "Amount payable at maturity"],
  ["Survival Benefit", "Periodic survival payout"],
  ["Cash Value", "Accumulated surrender / cash value"],
  ["Fund Value", "Value of investment units"],
  ["Guaranteed Return", "Fixed guaranteed return"],
  ["Loyalty Bonus", "Payable after certain policy duration"],
  ["Annual Bonus", "Participating product bonus"],
  ["Final Bonus", "Terminal bonus at maturity / death"],
  ["Annuity Benefit", "Periodic pension / income benefit"],
];

const APPLICABLE_BENEFIT_OPTION_NAMES = APPLICABLE_BENEFITS_META.map(([name]) => name);
const APPLICABLE_BENEFIT_DESCRIPTIONS = Object.fromEntries(
  APPLICABLE_BENEFITS_META.map(([name, desc]) => [name, desc]),
);

/** Rule ids grouped by product-configuration sidebar tab (duration & eligibility split). */
export const DURATION_ELIGIBILITY_TAB_RULE_IDS = {
  "duration-eligibility": ["minEntryAge", "maxEntryAge", "minMaturityAge", "maxMaturityAge"],
  "policy-term-coverage": ["policyTermOptions", "premiumPaymentTerm", "coverageTerm", "renewalAllowed", "conversionAllowed"],
  "benefit-premium": ["minSumAssured", "maxSumAssured", "minPremium", "applicableBenefits"],
  "underwriting-eligibility": [
    "residencyEligibility",
    "nationalityRestrictions",
    "occupationRestrictions",
    "smokerStatus",
    "genderLogic",
  ],
};

/** Rule ids for the "Product Duration & Eligibility" block inside Product details (not a sidebar tab). */
export const PRODUCT_DETAILS_DURATION_ELIGIBILITY_RULE_IDS = DURATION_ELIGIBILITY_TAB_RULE_IDS["duration-eligibility"];

export const PRODUCT_DETAILS_DURATION_ELIGIBILITY_SECTION_TITLE = "Product Duration & Eligibility";

/** Tab / template ids that map to `durationEligibility.overrides` (includes `duration-eligibility` for CSV upload). */
export const DURATION_ELIGIBILITY_CONFIG_TAB_IDS = Object.keys(DURATION_ELIGIBILITY_TAB_RULE_IDS);

const DURATION_SECTION_TITLE_BY_FIRST_ID = {
  minEntryAge: "Entry & maturity ages",
  policyTermOptions: "Policy term & coverage",
  minSumAssured: "Benefit amounts & premium",
  residencyEligibility: "Underwriting eligibility",
};

/** Grouped sections per tab (one visual section per tab, same titles as before the split). */
export const DURATION_ELIGIBILITY_TABS_FIELD_SECTIONS = Object.fromEntries(
  Object.entries(DURATION_ELIGIBILITY_TAB_RULE_IDS).map(([tabId, ids]) => {
    const title = DURATION_SECTION_TITLE_BY_FIRST_ID[ids[0]] || "Configuration";
    return [tabId, [{ title, ids }]];
  }),
);

/** @typedef {"text" | "number" | "select" | "multiselect" | "textarea"} DurationEligibilityFieldKind */

/** How each rule is captured in the UI (stored as string in overrides; multiselect uses JSON array string). */
const DURATION_ELIGIBILITY_FIELD_DEFS = {
  minEntryAge: { kind: "number", min: 0, max: 120, step: 1, suffix: "years" },
  maxEntryAge: { kind: "number", min: 0, max: 120, step: 1, suffix: "years" },
  minMaturityAge: { kind: "number", min: 0, max: 120, step: 1, suffix: "years" },
  maxMaturityAge: { kind: "number", min: 0, max: 120, step: 1, suffix: "years" },
  policyTermOptions: {
    kind: "multiselect",
    options: [...PRODUCT_TERM_LENGTH_CHOICES],
  },
  premiumPaymentTerm: {
    kind: "multiselect",
    options: [
      "Single premium",
      "Regular premium (same as policy term)",
      "Limited pay — 10 years",
      "Limited pay — 15 years",
      "Limited pay — 20 years",
      "Pay to age 55",
      "Pay to age 60",
      "Pay to age 65",
    ],
  },
  coverageTerm: {
    kind: "multiselect",
    options: ["Same as policy term", "Rider-specific term", ...PRODUCT_TERM_LENGTH_CHOICES],
  },
  renewalAllowed: {
    kind: "select",
    options: ["Yes", "No", "Term-dependent", "As per product schedule", "Renewable with evidence"],
  },
  conversionAllowed: {
    kind: "select",
    options: ["Yes", "No", "N/A", "Term to whole life", "Term to savings", "Per conversion schedule", "Configurable"],
  },
  minSumAssured: { kind: "text" },
  maxSumAssured: { kind: "text" },
  minPremium: { kind: "text" },
  applicableBenefits: {
    kind: "multiselect",
    options: [...APPLICABLE_BENEFIT_OPTION_NAMES],
    optionDescriptions: APPLICABLE_BENEFIT_DESCRIPTIONS,
    multiselectPlaceholder: "Click to choose applicable benefits",
  },
  residencyEligibility: {
    kind: "multiselect",
    options: [
      "UAE resident",
      "GCC resident",
      "KSA national",
      "Expat / work visa",
      "Worldwide (incl. US)",
      "Worldwide (excl. US)",
      "Offshore / captive structures",
      "Minimum residency months apply",
    ],
  },
  nationalityRestrictions: {
    kind: "multiselect",
    options: [
      "GCC nationals",
      "No sanctions-listed countries",
      "Country list A (refer)",
      "Country list B (decline)",
      "US persons — enhanced due diligence",
      "Refer all non-GCC",
    ],
  },
  occupationRestrictions: {
    kind: "multiselect",
    options: [
      "Class 1–2 standard",
      "Class 3 with loading",
      "Manual / heavy — refer",
      "Hazardous — decline",
      "Occupation matrix (refer)",
      "Professional / desk only",
    ],
  },
  smokerStatus: {
    kind: "multiselect",
    options: ["Smoker", "Non-smoker", "Ex-smoker", "Blended / table rates", "Preferred non-smoker"],
  },
  genderLogic: {
    kind: "select",
    options: [
      "Male / female — separate rates",
      "Unisex rates",
      "Regulated unisex (jurisdiction)",
      "Market-specific (refer pricing)",
    ],
  },
};

/** Rule row ids — used for overrides: productConfiguration.durationEligibility.overrides[id] */
export const DURATION_ELIGIBILITY_RULE_IDS = DURATION_ELIGIBILITY_CONFIG_TAB_IDS.flatMap(
  (tabId) => DURATION_ELIGIBILITY_TAB_RULE_IDS[tabId],
);

function labelForId(id) {
  const map = {
    minEntryAge: "Minimum Entry Age",
    maxEntryAge: "Maximum Entry Age",
    minMaturityAge: "Minimum Maturity Age",
    maxMaturityAge: "Maximum Maturity Age",
    policyTermOptions: "Policy Term Options",
    premiumPaymentTerm: "Premium Payment Term",
    coverageTerm: "Coverage Term",
    renewalAllowed: "Renewal Allowed",
    conversionAllowed: "Conversion Allowed",
    minSumAssured: "Minimum Sum Assured",
    maxSumAssured: "Maximum Sum Assured",
    minPremium: "Minimum Premium",
    applicableBenefits: "Applicable benefits",
    residencyEligibility: "Residency Eligibility",
    nationalityRestrictions: "Nationality Restrictions",
    occupationRestrictions: "Occupation Restrictions",
    smokerStatus: "Smoker Status",
    genderLogic: "Gender Logic",
  };
  return map[id] || id;
}

function typeNorm(p) {
  return String(p?.productType || "Term").toLowerCase();
}

/** Default example text per rule, derived from product context (intelligent baselines). */
function defaultExample(id, product) {
  const t = typeNorm(product);
  const cur = CCY(product);
  const juris = product?.regulatoryJurisdiction || "UAE";

  switch (id) {
    case "minEntryAge":
      return t.includes("group") ? "16 years (member)" : "18 years";
    case "maxEntryAge":
      return t.includes("whole") ? "70 years" : t.includes("ulip") ? "60 years" : "65 years";
    case "minMaturityAge":
      return "21 years";
    case "maxMaturityAge":
      return "75 / 85 / 100 years";
    case "policyTermOptions":
      return t.includes("whole")
        ? "Whole life to age 100"
        : "1 year, 5 years, 10 years, 20 years, to age 65, whole life";
    case "premiumPaymentTerm":
      return "Single premium, regular premium, limited pay, pay to age 60";
    case "coverageTerm":
      return t.includes("term") ? "Same as policy term or rider-specific" : "Same as policy term or different (configurable)";
    case "renewalAllowed":
      return t.includes("term") && !t.includes("whole") ? "Yes / No (term-dependent)" : "Yes";
    case "conversionAllowed":
      return t.includes("term") ? "Term to whole life, term to savings" : "N/A or savings conversion per schedule";
    case "minSumAssured":
      return `${cur} 50,000`;
    case "maxSumAssured":
      return `${cur} 10,000,000`;
    case "minPremium":
      return `${cur} 100 monthly`;
    case "applicableBenefits":
      return t.includes("whole") || t.includes("endowment")
        ? "Death benefit, maturity benefit, cash value, bonuses as applicable"
        : "Death benefit, terminal illness, maturity / survival per schedule";
    case "residencyEligibility":
      return juris === "UAE"
        ? "UAE resident, GCC resident, worldwide with exclusions"
        : `${juris} resident, GCC, worldwide with exclusions`;
    case "nationalityRestrictions":
      return `Configurable (${juris} rules + sanctions lists)`;
    case "occupationRestrictions":
      return "Decline / refer / load (occupation class matrix)";
    case "smokerStatus":
      return "Smoker, non-smoker, ex-smoker";
    case "genderLogic":
      return juris === "UAE" || juris === "KSA"
        ? "Male, female, unisex depending on market/regulation"
        : "Male, female, unisex per jurisdiction";
    default:
      return "—";
  }
}

export function getDurationEligibilityRuleLabel(id) {
  return labelForId(id);
}

/** Field control metadata for rule `id` (defaults to free text if unknown). */
export function getDurationEligibilityFieldDef(id) {
  return DURATION_ELIGIBILITY_FIELD_DEFS[id] || { kind: "text" };
}

/** Parse stored override for multiselect fields (JSON array or legacy `;`-separated). */
export function parseDurationMultiselectValue(stored) {
  if (stored == null || String(stored).trim() === "") {
    return [];
  }
  const s = String(stored).trim();
  if (s.startsWith("[")) {
    try {
      const p = JSON.parse(s);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return s
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function serializeDurationMultiselectValue(arr) {
  return JSON.stringify(arr);
}

/** Resolved default example (before per-rule override). Use as input placeholder. */
export function resolveDurationEligibilityDefault(id, product) {
  return defaultExample(id, product);
}

/**
 * Build Rule | Example rows for Product Duration & Eligibility (effective values).
 */
export function buildDurationEligibilityRows(product) {
  const overrides = product?.productConfiguration?.durationEligibility?.overrides || {};

  return DURATION_ELIGIBILITY_RULE_IDS.map((id) => {
    const raw = overrides[id];
    const def = DURATION_ELIGIBILITY_FIELD_DEFS[id];
    let example;
    if (def?.kind === "multiselect") {
      const arr = parseDurationMultiselectValue(raw);
      example = arr.length ? arr.join(", ") : defaultExample(id, product);
    } else if (raw != null && String(raw).trim() !== "") {
      example = String(raw);
    } else {
      example = defaultExample(id, product);
    }
    return { id, rule: labelForId(id), example };
  });
}

/** Defaults merged into new products (editable later via API / form). */
export function defaultProductConfiguration() {
  return {
    durationEligibility: {
      overrides: {},
    },
    coreBenefitsAndRiders: {
      items: [],
    },
    riders: defaultRidersConfiguration(),
    tableStructureDesign: defaultTableStructureDesign(),
    charges: defaultChargesConfiguration(),
    funds: defaultFundsConfiguration(),
    policyServicing: defaultPolicyServicingConfiguration(),
    underwritingRules: defaultUnderwritingRulesConfiguration(),
    medicalRequirementMatrix: defaultMedicalRequirementMatrixConfiguration(),
    commissionDistribution: defaultCommissionDistributionConfiguration(),
    documentTemplates: defaultDocumentTemplatesConfiguration(),
  };
}
