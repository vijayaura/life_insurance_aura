import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FundAllocationDialogForm,
  FundDialogForm,
  ProductStudioFundsPanel,
  fundRowToEditForm,
} from "./ProductStudioFundsPanel.jsx";
import { ProductStudioSavingsPanel } from "./ProductStudioSavingsPanel.jsx";
import {
  DEMO_FUNDS_LIST,
  effectiveAllocationRulesForFund,
  emptyAllocationRulesForm,
  normalizeAllocationRules,
  normalizeFundsConfiguration,
} from "./productStudioFunds.js";
import { FacetMultiselectField } from "./FacetMultiselect.jsx";
import {
  DEFAULT_RATE_VALUE_TYPE,
  POLICY_DURATION_ROW_AXIS,
  RateSegmentTablePanel,
  defaultAgeRateRows,
  defaultRateRows,
  normalizeAgeRateRows,
  normalizeRateRows,
} from "./ProductStudioRateSegmentTable.jsx";
import {
  facetKeyFromFacets,
  joinFacetLabels,
  joinFacetShortLabels,
  normalizeFacetObject,
} from "./productStudioRateSegmentFacets.js";
import { ProductStudioUnderwritingPanel } from "./ProductStudioUnderwritingPanel.jsx";
import { ChargesDialogBody, ProductStudioChargesPanel } from "./ProductStudioChargesPanel.jsx";
import {
  DEMO_FEES_LIST,
  emptyFeeForm,
  feeFormToRowPartial,
  feeRowToForm,
  getFeeCatalogEntry,
  normalizeChargesConfiguration,
  validateFeeForm,
} from "./productStudioCharges.js";
import { applyTableStructureToRateConfig } from "./productStudioTableStructure.jsx";
import { uid } from "./productStudioStore.js";

const BENEFIT_RATE_TABLE_TAB_IDS = ["mortality-rate-table", "morbidity-ci-table", "accident-rate-table"];

const BENEFIT_COMPONENT_CARDS = [
  { id: "rate-tables", label: "Rate Tables", route: "rate-tables", icon: "database" },
  { id: "charge-rate-tables", label: "Charge Rate Tables", route: "charge-rate-tables", icon: "layers" },
  { id: "charges", label: "Charges", route: "charges", icon: "gear" },
  { id: "funds", label: "Funds & Investments", route: "funds", icon: "flow" },
  { id: "savings", label: "Savings", route: "savings", icon: "target" },
  { id: "underwriting-rules", label: "Underwriting Rules", route: "underwriting-rules", icon: "shield" },
];

function benefitComponentCardIdForTab(tabId) {
  if (tabId === "charge-rate-tables") {
    return "charge-rate-tables";
  }
  if (tabId === "charges") {
    return "charges";
  }
  if (tabId === "savings") {
    return "savings";
  }
  if (tabId === "fund-growth-table") {
    return "funds";
  }
  if (BENEFIT_RATE_TABLE_TAB_IDS.includes(tabId)) {
    return "rate-tables";
  }
  return tabId;
}

function BenefitComponentCardIcon({ name }) {
  const svgProps = {
    className: "psc-component-card-icon-svg",
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "database":
      return (
        <svg {...svgProps}>
          <ellipse cx="12" cy="5.5" rx="8" ry="3" />
          <path d="M4 5.5v5c0 1.7 3.5 3 8 3s8-1.3 8-3v-5" />
          <path d="M4 10.5v5c0 1.7 3.5 3 8 3s8-1.3 8-3v-5" />
        </svg>
      );
    case "flow":
      return (
        <svg {...svgProps}>
          <circle cx="6" cy="6" r="2.25" />
          <circle cx="18" cy="6" r="2.25" />
          <circle cx="12" cy="18" r="2.25" />
          <path d="M7.5 7.5l3 3m3 0l3-3M12 10.5V15" />
        </svg>
      );
    case "gear":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...svgProps}>
          <path d="M12 3L5 6v6c0 5 4 8 7 9 3-1 7-4 7-9V6l-7-3z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...svgProps}>
          <path d="M4 18V6M8 18v-7M12 18V9M16 18v-4M20 18v-8" />
        </svg>
      );
    case "layers":
      return (
        <svg {...svgProps}>
          <path d="M12 3L2 8l10 5 10-5-10-5z" />
          <path d="M2 13l10 5 10-5M2 18l10 5 10-5" />
        </svg>
      );
    case "target":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "document":
    default:
      return (
        <svg {...svgProps}>
          <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M14 3v5h5M9 12h6M9 16h6" />
        </svg>
      );
  }
}

const BENEFIT_DETAIL_EXTENSION_TABS = [
  { id: "mortality-rate-table", label: "Mortality Rate Table" },
  { id: "morbidity-ci-table", label: "Morbidity / Critical Illness Table" },
  { id: "accident-rate-table", label: "Accident Rate Table" },
  { id: "fund-growth-table", label: "Fund Growth Assumption Table" },
  { id: "charge-rate-tables", label: "Charge Rate Tables" },
  { id: "actuarial-assumptions", label: "Actuarial assumptions" },
];

const BENEFIT_RATE_TABLE_TABS = BENEFIT_DETAIL_EXTENSION_TABS.filter((t) => BENEFIT_RATE_TABLE_TAB_IDS.includes(t.id));

const BENEFIT_CHARGE_RATE_TAB_IDS = ["charge-rate-tables"];

const BENEFIT_FUNDS_TAB_IDS = ["fund-growth-table"];

const BENEFIT_FUNDS_TABS = BENEFIT_DETAIL_EXTENSION_TABS.filter((t) => BENEFIT_FUNDS_TAB_IDS.includes(t.id));

/** Inline tabs on benefit edit — hidden from the tab bar; not shown as component cards. */
const BENEFIT_EDIT_INLINE_TAB_IDS = ["actuarial-assumptions"];

const BENEFIT_EDIT_EXTENSION_TABS = BENEFIT_DETAIL_EXTENSION_TABS.filter(
  (t) =>
    !BENEFIT_RATE_TABLE_TAB_IDS.includes(t.id) &&
    !BENEFIT_CHARGE_RATE_TAB_IDS.includes(t.id) &&
    !BENEFIT_FUNDS_TAB_IDS.includes(t.id) &&
    !BENEFIT_EDIT_INLINE_TAB_IDS.includes(t.id),
);

const PLACEHOLDER_COPY = {
  "actuarial-assumptions": "Document mortality, morbidity, lapse, and other actuarial assumptions used for this benefit.",
};

const MORTALITY_DEMO_ROWS_FALLBACK = [{ age: 30, gender: "Male", smoker_status: "No", rate: 1.85 }];

/** Dense illustrative mortality grid: ages × gender × smoker, with occupation / rating / term / mode. */
function buildMortalityMockRows() {
  const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  const genders = ["Male", "Female"];
  const smokerVariants = [
    { key: "No", labelMult: 1 },
    { key: "Yes", labelMult: 1.72 },
  ];

  const occupationFor = (age, gender) => {
    if (age <= 30) {
      return gender === "Male" ? "Class 1 — Professional" : "Class 1 — Office";
    }
    if (age <= 45) {
      return "Class 2 — Light manual";
    }
    if (age <= 55) {
      return "Class 2 — Mixed duties";
    }
    return "Class 3 — Manual / Higher risk";
  };

  const rows = [];
  for (const age of ages) {
    for (const gender of genders) {
      for (const { key: smokerFlag, labelMult } of smokerVariants) {
        const ageSlope = (age - 20) * 0.105;
        const genderAdj = gender === "Male" ? 0.12 : -0.06;
        const base = 0.42 + ageSlope + genderAdj;
        const rate = Math.round(base * labelMult * 100) / 100;
        const isSmoker = smokerFlag === "Yes";
        rows.push({
          age,
          gender,
          smoker_status: smokerFlag,
          occupation_class: occupationFor(age, gender),
          medical_rating: isSmoker && age >= 50 ? "Substandard (+50 NT)" : isSmoker && age >= 40 ? "Standard (smoker load)" : "Standard",
          policy_term: age <= 35 ? "25 years" : age <= 50 ? "20 years" : "10–15 years",
          premium_mode: age % 20 === 0 || age === 65 ? "Annual" : "Monthly",
          rate,
        });
      }
    }
  }
  return rows;
}

const MORTALITY_MOCK_ROWS = buildMortalityMockRows();

const MORTALITY_GENDER_OPTIONS = ["Male", "Female"];

const MORTALITY_SMOKER_OPTIONS = [
  { value: "Non-smoker", label: "Non-smoker" },
  { value: "Smoker", label: "Smoker" },
];

const MORTALITY_OCCUPATION_OPTIONS = [
  { value: "Class 1 — Professional", label: "Class 1 — Professional" },
  { value: "Class 1 — Office", label: "Class 1 — Office" },
  { value: "Class 2 — Light manual", label: "Class 2 — Light manual" },
  { value: "Class 2 — Mixed duties", label: "Class 2 — Mixed duties" },
  { value: "Class 3 — Manual / Higher risk", label: "Class 3 — Manual / Higher risk" },
];

const MORTALITY_MEDICAL_RATING_OPTIONS = [
  { value: "Standard", label: "Standard" },
  { value: "Preferred", label: "Preferred" },
  { value: "Standard (smoker load)", label: "Standard (smoker load)" },
  { value: "Substandard (+50 NT)", label: "Substandard (+50 NT)" },
  { value: "Substandard (+100)", label: "Substandard (+100)" },
];

const MORTALITY_POLICY_TERM_OPTIONS = [
  { value: "10 years", label: "10 years" },
  { value: "15 years", label: "15 years" },
  { value: "10–15 years", label: "10–15 years" },
  { value: "20 years", label: "20 years" },
  { value: "25 years", label: "25 years" },
  { value: "Whole life", label: "Whole life" },
];

const MORTALITY_PREMIUM_MODE_OPTIONS = [
  { value: "Annual", label: "Annual" },
  { value: "Semi-annual", label: "Semi-annual" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Monthly", label: "Monthly" },
];

function coerceMortalityOptionValue(value, options) {
  const v = String(value ?? "").trim();
  if (!v) {
    return options[0]?.value ?? "";
  }
  const found = options.find((o) => o.value === v);
  return found ? found.value : options[0]?.value ?? "";
}

const MORTALITY_FACET_KEYS = ["gender", "smoker_status", "occupation_class", "medical_rating", "policy_term", "premium_mode"];

function defaultMortalityFacets() {
  return {
    gender: ["Male"],
    smoker_status: ["Non-smoker"],
    occupation_class: [MORTALITY_OCCUPATION_OPTIONS[0].value],
    medical_rating: [MORTALITY_MEDICAL_RATING_OPTIONS[0].value],
    policy_term: [MORTALITY_POLICY_TERM_OPTIONS[3].value],
    premium_mode: [MORTALITY_PREMIUM_MODE_OPTIONS[0].value],
  };
}

function mortalityFacetKey(facets) {
  return facetKeyFromFacets(facets, MORTALITY_FACET_KEYS);
}

/** Group flat mock rows into scenarios (one age–rate curve per facet combination). */
function buildMortalityScenariosFromMock() {
  if (!MORTALITY_MOCK_ROWS.length) {
    const r = MORTALITY_DEMO_ROWS_FALLBACK[0];
    return [
      {
        id: uid(),
        facets: normalizeFacetObject(
          {
            ...defaultMortalityFacets(),
            gender: r.gender || "Male",
            smoker_status: r.smoker_status === "No" || r.smoker_status === "Non-smoker" ? "Non-smoker" : "Smoker",
          },
          MORTALITY_FACET_KEYS,
        ),
        rows: defaultAgeRateRows(),
      },
    ];
  }

  const groups = new Map();
  for (const r of MORTALITY_MOCK_ROWS) {
    const smoker = r.smoker_status === "No" || r.smoker_status === "Non-smoker" ? "Non-smoker" : "Smoker";
    const facets = normalizeFacetObject(
      {
        gender: r.gender || "Male",
        smoker_status: smoker,
        occupation_class: coerceMortalityOptionValue(r.occupation_class, MORTALITY_OCCUPATION_OPTIONS),
        medical_rating: coerceMortalityOptionValue(r.medical_rating, MORTALITY_MEDICAL_RATING_OPTIONS),
        policy_term: coerceMortalityOptionValue(r.policy_term, MORTALITY_POLICY_TERM_OPTIONS),
        premium_mode: coerceMortalityOptionValue(r.premium_mode, MORTALITY_PREMIUM_MODE_OPTIONS),
      },
      MORTALITY_FACET_KEYS,
    );
    const key = mortalityFacetKey(facets);
    if (!groups.has(key)) {
      groups.set(key, { id: uid(), facets: { ...facets }, rows: [] });
    }
    groups.get(key).rows.push({
      id: uid(),
      age: String(r.age ?? ""),
      value_type: DEFAULT_RATE_VALUE_TYPE,
      rate: r.rate != null && r.rate !== "" ? String(r.rate) : "",
    });
  }

  return Array.from(groups.values()).map((s) => ({
    ...s,
    rows: normalizeAgeRateRows(s.rows),
  }));
}

const INITIAL_MORTALITY_SCENARIOS = (() => {
  const scenarios = buildMortalityScenariosFromMock();
  return { scenarios, activeId: scenarios[0]?.id ?? "" };
})();

function shortMortalityGender(value) {
  if (value === "Female") {
    return "F";
  }
  if (value === "Male") {
    return "M";
  }
  return "—";
}

function shortMortalitySmoker(value) {
  if (value === "Smoker") {
    return "Sm";
  }
  if (value === "Non-smoker") {
    return "NS";
  }
  return "—";
}

function shortMortalityOccupation(value) {
  const map = {
    "Class 1 — Professional": "C1-Pro",
    "Class 1 — Office": "C1-Off",
    "Class 2 — Light manual": "C2-Lgt",
    "Class 2 — Mixed duties": "C2-Mix",
    "Class 3 — Manual / Higher risk": "C3-HiR",
  };
  return map[value] || "—";
}

function shortMortalityMedicalRating(value) {
  const map = {
    Standard: "Std",
    Preferred: "Pref",
    "Standard (smoker load)": "Std-Smk",
    "Substandard (+50 NT)": "Sub-50",
    "Substandard (+100)": "Sub-100",
  };
  return map[value] || "—";
}

function shortMortalityPolicyTerm(value) {
  const map = {
    "10 years": "10y",
    "15 years": "15y",
    "10–15 years": "10-15y",
    "20 years": "20y",
    "25 years": "25y",
    "Whole life": "WL",
  };
  return map[value] || "—";
}

function shortMortalityPremiumMode(value) {
  const map = {
    Annual: "Ann",
    "Semi-annual": "Semi",
    Quarterly: "Qtr",
    Monthly: "Mo",
  };
  return map[value] || "—";
}

/** All six facet values in compact form for sidebar segment labels. */
function mortalityScenarioPillLabel(facets) {
  return [
    joinFacetShortLabels(facets.gender, shortMortalityGender),
    joinFacetShortLabels(facets.smoker_status, shortMortalitySmoker),
    joinFacetShortLabels(facets.occupation_class, shortMortalityOccupation),
    joinFacetShortLabels(facets.medical_rating, shortMortalityMedicalRating),
    joinFacetShortLabels(facets.policy_term, shortMortalityPolicyTerm),
    joinFacetShortLabels(facets.premium_mode, shortMortalityPremiumMode),
  ].join(" · ");
}

/** Full facet labels for the active segment heading in the rate panel. */
function mortalityScenarioTitle(facets) {
  return MORTALITY_FACET_KEYS.map((k) => joinFacetLabels(facets[k])).filter(Boolean).join(" · ");
}

/** Facet multiselects — segment definition and search filters. */
function MortalitySegmentFacetFields({ facets, onPatch, filterMode = false, enabledFacetKeys }) {
  const keys = enabledFacetKeys ?? MORTALITY_FACET_KEYS;
  const genderOptions = MORTALITY_GENDER_OPTIONS.map((g) => ({ value: g, label: g }));

  return (
    <div className="psc-mortality-dialog-facet-stack">
      {keys.includes("gender") && (
        <FacetMultiselectField label="Gender" facetKey="gender" facets={facets} onPatch={onPatch} options={genderOptions} filterMode={filterMode} />
      )}
      {keys.includes("smoker_status") && (
        <FacetMultiselectField
          label="Smoker status"
          facetKey="smoker_status"
          facets={facets}
          onPatch={onPatch}
          options={MORTALITY_SMOKER_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("occupation_class") && (
        <FacetMultiselectField
          label="Occupation class"
          facetKey="occupation_class"
          facets={facets}
          onPatch={onPatch}
          options={MORTALITY_OCCUPATION_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("medical_rating") && (
        <FacetMultiselectField
          label="Medical rating"
          facetKey="medical_rating"
          facets={facets}
          onPatch={onPatch}
          options={MORTALITY_MEDICAL_RATING_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("policy_term") && (
        <FacetMultiselectField
          label="Policy term"
          facetKey="policy_term"
          facets={facets}
          onPatch={onPatch}
          options={MORTALITY_POLICY_TERM_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("premium_mode") && (
        <FacetMultiselectField
          label="Premium mode"
          facetKey="premium_mode"
          facets={facets}
          onPatch={onPatch}
          options={MORTALITY_PREMIUM_MODE_OPTIONS}
          filterMode={filterMode}
        />
      )}
    </div>
  );
}

const MORTALITY_RATE_TABLE_CONFIG = {
  matrixTitle: "Mortality rate matrix",
  segmentsAriaLabel: "Mortality segments",
  facetKeys: MORTALITY_FACET_KEYS,
  initialScenarios: INITIAL_MORTALITY_SCENARIOS,
  defaultFacets: defaultMortalityFacets,
  facetKey: mortalityFacetKey,
  FacetFields: MortalitySegmentFacetFields,
  pillLabel: mortalityScenarioPillLabel,
  titleLabel: mortalityScenarioTitle,
  csvFilePrefix: "mortality-age-rates",
  dialogIdPrefix: "psc-mortality",
  labels: {
    addSegmentDialog: "Add mortality segment",
    editSegmentDialog: "Edit mortality segment",
    removeSegmentTitle: "Remove mortality segment?",
    removeSegmentMessage: "Age and rate rows for this segment will be permanently deleted.",
  },
};

const MORBIDITY_GENDER_OPTIONS = ["Male", "Female"];

const MORBIDITY_ILLNESS_TYPE_OPTIONS = [
  { value: "Cancer — Major", label: "Cancer — Major" },
  { value: "Heart — Major", label: "Heart — Major" },
  { value: "Stroke — Major", label: "Stroke — Major" },
  { value: "Kidney failure", label: "Kidney failure" },
  { value: "Major organ transplant", label: "Major organ transplant" },
  { value: "Multiple / Accelerated CI", label: "Multiple / Accelerated CI" },
  { value: "Early-stage CI", label: "Early-stage CI" },
];

const MORBIDITY_OCCUPATION_OPTIONS = [
  { value: "Class 1 — Low risk", label: "Class 1 — Low risk" },
  { value: "Class 2 — Standard", label: "Class 2 — Standard" },
  { value: "Class 3 — Elevated", label: "Class 3 — Elevated" },
  { value: "Class 4 — High risk", label: "Class 4 — High risk" },
];

const MORBIDITY_FACET_KEYS = ["gender", "illness_type", "occupation"];

function coerceMorbidityOptionValue(value, options) {
  const v = String(value ?? "").trim();
  if (!v) {
    return options[0]?.value ?? "";
  }
  const found = options.find((o) => o.value === v);
  return found ? found.value : options[0]?.value ?? "";
}

function defaultMorbidityFacets() {
  return {
    gender: ["Male"],
    illness_type: [MORBIDITY_ILLNESS_TYPE_OPTIONS[0].value],
    occupation: [MORBIDITY_OCCUPATION_OPTIONS[0].value],
  };
}

function morbidityFacetKey(facets) {
  return facetKeyFromFacets(facets, MORBIDITY_FACET_KEYS);
}

/** Dense illustrative morbidity grid: ages × gender × illness × occupation. */
function buildMorbidityMockRows() {
  const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  const genders = ["Male", "Female"];
  const illnessTypes = MORBIDITY_ILLNESS_TYPE_OPTIONS.map((o) => o.value);
  const occupations = MORBIDITY_OCCUPATION_OPTIONS.map((o) => o.value);

  const rows = [];
  for (const age of ages) {
    for (const gender of genders) {
      for (const illness_type of illnessTypes) {
        for (const occupation of occupations) {
          const ageSlope = (age - 20) * 0.018;
          const genderAdj = gender === "Male" ? 0.04 : -0.02;
          const illnessAdj = illnessTypes.indexOf(illness_type) * 0.035;
          const occAdj = occupations.indexOf(occupation) * 0.025;
          const rate = Math.round((0.22 + ageSlope + genderAdj + illnessAdj + occAdj) * 100) / 100;
          rows.push({ age, gender, illness_type, occupation, rate });
        }
      }
    }
  }
  return rows;
}

const MORBIDITY_MOCK_ROWS = buildMorbidityMockRows();

function buildMorbidityScenariosFromMock() {
  if (!MORBIDITY_MOCK_ROWS.length) {
    return [
      {
        id: uid(),
        facets: defaultMorbidityFacets(),
        rows: defaultAgeRateRows(),
      },
    ];
  }

  const groups = new Map();
  for (const r of MORBIDITY_MOCK_ROWS) {
    const facets = normalizeFacetObject(
      {
        gender: r.gender || "Male",
        illness_type: coerceMorbidityOptionValue(r.illness_type, MORBIDITY_ILLNESS_TYPE_OPTIONS),
        occupation: coerceMorbidityOptionValue(r.occupation, MORBIDITY_OCCUPATION_OPTIONS),
      },
      MORBIDITY_FACET_KEYS,
    );
    const key = morbidityFacetKey(facets);
    if (!groups.has(key)) {
      groups.set(key, { id: uid(), facets: { ...facets }, rows: [] });
    }
    groups.get(key).rows.push({
      id: uid(),
      age: String(r.age ?? ""),
      value_type: DEFAULT_RATE_VALUE_TYPE,
      rate: r.rate != null && r.rate !== "" ? String(r.rate) : "",
    });
  }

  return Array.from(groups.values()).map((s) => ({
    ...s,
    rows: normalizeAgeRateRows(s.rows),
  }));
}

const INITIAL_MORBIDITY_SCENARIOS = (() => {
  const scenarios = buildMorbidityScenariosFromMock();
  return { scenarios, activeId: scenarios[0]?.id ?? "" };
})();

function shortMorbidityGender(value) {
  if (value === "Female") {
    return "F";
  }
  if (value === "Male") {
    return "M";
  }
  return "—";
}

function shortMorbidityIllnessType(value) {
  const map = {
    "Cancer — Major": "Cancer",
    "Heart — Major": "Heart",
    "Stroke — Major": "Stroke",
    "Kidney failure": "Kidney",
    "Major organ transplant": "Organ",
    "Multiple / Accelerated CI": "Multi-CI",
    "Early-stage CI": "Early-CI",
  };
  return map[value] || "—";
}

function shortMorbidityOccupation(value) {
  const map = {
    "Class 1 — Low risk": "C1-Low",
    "Class 2 — Standard": "C2-Std",
    "Class 3 — Elevated": "C3-Elev",
    "Class 4 — High risk": "C4-HiR",
  };
  return map[value] || "—";
}

function morbidityScenarioPillLabel(facets) {
  return [
    joinFacetShortLabels(facets.gender, shortMorbidityGender),
    joinFacetShortLabels(facets.illness_type, shortMorbidityIllnessType),
    joinFacetShortLabels(facets.occupation, shortMorbidityOccupation),
  ].join(" · ");
}

function morbidityScenarioTitle(facets) {
  return MORBIDITY_FACET_KEYS.map((k) => joinFacetLabels(facets[k])).filter(Boolean).join(" · ");
}

function MorbiditySegmentFacetFields({ facets, onPatch, filterMode = false, enabledFacetKeys }) {
  const keys = enabledFacetKeys ?? MORBIDITY_FACET_KEYS;
  const genderOptions = MORBIDITY_GENDER_OPTIONS.map((g) => ({ value: g, label: g }));

  return (
    <div className="psc-mortality-dialog-facet-stack">
      {keys.includes("gender") && (
        <FacetMultiselectField label="Gender" facetKey="gender" facets={facets} onPatch={onPatch} options={genderOptions} filterMode={filterMode} />
      )}
      {keys.includes("illness_type") && (
        <FacetMultiselectField
          label="Illness type"
          facetKey="illness_type"
          facets={facets}
          onPatch={onPatch}
          options={MORBIDITY_ILLNESS_TYPE_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("occupation") && (
        <FacetMultiselectField
          label="Occupation"
          facetKey="occupation"
          facets={facets}
          onPatch={onPatch}
          options={MORBIDITY_OCCUPATION_OPTIONS}
          filterMode={filterMode}
        />
      )}
    </div>
  );
}

const MORBIDITY_CI_RATE_TABLE_CONFIG = {
  matrixTitle: "Morbidity / critical illness rate matrix",
  segmentsAriaLabel: "Morbidity and critical illness segments",
  facetKeys: MORBIDITY_FACET_KEYS,
  initialScenarios: INITIAL_MORBIDITY_SCENARIOS,
  defaultFacets: defaultMorbidityFacets,
  facetKey: morbidityFacetKey,
  FacetFields: MorbiditySegmentFacetFields,
  pillLabel: morbidityScenarioPillLabel,
  titleLabel: morbidityScenarioTitle,
  csvFilePrefix: "morbidity-ci-age-rates",
  dialogIdPrefix: "psc-morbidity-ci",
  labels: {
    addSegmentDialog: "Add morbidity / CI segment",
    editSegmentDialog: "Edit morbidity / CI segment",
    removeSegmentTitle: "Remove morbidity / CI segment?",
    removeSegmentMessage: "Age and rate rows for this segment will be permanently deleted.",
  },
};

const ACCIDENT_OCCUPATION_OPTIONS = [
  { value: "Class 1 — Office / Professional", label: "Class 1 — Office / Professional" },
  { value: "Class 2 — Light manual", label: "Class 2 — Light manual" },
  { value: "Class 3 — Manual / Higher risk", label: "Class 3 — Manual / Higher risk" },
  { value: "Class 4 — Hazardous", label: "Class 4 — Hazardous" },
];

const ACCIDENT_GEOGRAPHY_OPTIONS = [
  { value: "Domestic", label: "Domestic" },
  { value: "Regional", label: "Regional" },
  { value: "Worldwide excl. USA", label: "Worldwide excl. USA" },
  { value: "Worldwide incl. USA", label: "Worldwide incl. USA" },
  { value: "Not applicable", label: "Not applicable" },
];

const ACCIDENT_TRAVEL_RISK_OPTIONS = [
  { value: "None / Low", label: "None / Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
  { value: "Extreme", label: "Extreme" },
  { value: "Not applicable", label: "Not applicable" },
];

const ACCIDENT_FACET_KEYS = ["occupation", "geography", "travel_risk"];

function coerceAccidentOptionValue(value, options) {
  const v = String(value ?? "").trim();
  if (!v) {
    return options[0]?.value ?? "";
  }
  const found = options.find((o) => o.value === v);
  return found ? found.value : options[0]?.value ?? "";
}

function defaultAccidentFacets() {
  return {
    occupation: [ACCIDENT_OCCUPATION_OPTIONS[0].value],
    geography: [ACCIDENT_GEOGRAPHY_OPTIONS[0].value],
    travel_risk: [ACCIDENT_TRAVEL_RISK_OPTIONS[0].value],
  };
}

function accidentFacetKey(facets) {
  return facetKeyFromFacets(facets, ACCIDENT_FACET_KEYS);
}

/** Illustrative accident grid: ages × occupation × geography × travel risk. */
function buildAccidentMockRows() {
  const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  const occupations = ACCIDENT_OCCUPATION_OPTIONS.map((o) => o.value);
  const geographies = ACCIDENT_GEOGRAPHY_OPTIONS.map((o) => o.value);
  const travelRisks = ACCIDENT_TRAVEL_RISK_OPTIONS.map((o) => o.value);

  const rows = [];
  for (const age of ages) {
    for (const occupation of occupations) {
      for (const geography of geographies) {
        for (const travel_risk of travelRisks) {
          const ageSlope = (age - 20) * 0.012;
          const occAdj = occupations.indexOf(occupation) * 0.08;
          const geoAdj = geographies.indexOf(geography) * 0.04;
          const travelAdj = travelRisks.indexOf(travel_risk) * 0.06;
          const rate = Math.round((0.18 + ageSlope + occAdj + geoAdj + travelAdj) * 100) / 100;
          rows.push({ age, occupation, geography, travel_risk, rate });
        }
      }
    }
  }
  return rows;
}

const ACCIDENT_MOCK_ROWS = buildAccidentMockRows();

function buildAccidentScenariosFromMock() {
  if (!ACCIDENT_MOCK_ROWS.length) {
    return [
      {
        id: uid(),
        facets: defaultAccidentFacets(),
        rows: defaultAgeRateRows(),
      },
    ];
  }

  const groups = new Map();
  for (const r of ACCIDENT_MOCK_ROWS) {
    const facets = normalizeFacetObject(
      {
        occupation: coerceAccidentOptionValue(r.occupation, ACCIDENT_OCCUPATION_OPTIONS),
        geography: coerceAccidentOptionValue(r.geography, ACCIDENT_GEOGRAPHY_OPTIONS),
        travel_risk: coerceAccidentOptionValue(r.travel_risk, ACCIDENT_TRAVEL_RISK_OPTIONS),
      },
      ACCIDENT_FACET_KEYS,
    );
    const key = accidentFacetKey(facets);
    if (!groups.has(key)) {
      groups.set(key, { id: uid(), facets: { ...facets }, rows: [] });
    }
    groups.get(key).rows.push({
      id: uid(),
      age: String(r.age ?? ""),
      value_type: DEFAULT_RATE_VALUE_TYPE,
      rate: r.rate != null && r.rate !== "" ? String(r.rate) : "",
    });
  }

  return Array.from(groups.values()).map((s) => ({
    ...s,
    rows: normalizeAgeRateRows(s.rows),
  }));
}

const INITIAL_ACCIDENT_SCENARIOS = (() => {
  const scenarios = buildAccidentScenariosFromMock();
  return { scenarios, activeId: scenarios[0]?.id ?? "" };
})();

function shortAccidentOccupation(value) {
  const map = {
    "Class 1 — Office / Professional": "C1-Off",
    "Class 2 — Light manual": "C2-Lgt",
    "Class 3 — Manual / Higher risk": "C3-Man",
    "Class 4 — Hazardous": "C4-Haz",
  };
  return map[value] || "—";
}

function shortAccidentGeography(value) {
  const map = {
    Domestic: "Dom",
    Regional: "Reg",
    "Worldwide excl. USA": "WW-exUS",
    "Worldwide incl. USA": "WW-incUS",
    "Not applicable": "N/A",
  };
  return map[value] || "—";
}

function shortAccidentTravelRisk(value) {
  const map = {
    "None / Low": "Low",
    Moderate: "Mod",
    High: "Hi",
    Extreme: "Ext",
    "Not applicable": "N/A",
  };
  return map[value] || "—";
}

function accidentScenarioPillLabel(facets) {
  return [
    joinFacetShortLabels(facets.occupation, shortAccidentOccupation),
    joinFacetShortLabels(facets.geography, shortAccidentGeography),
    joinFacetShortLabels(facets.travel_risk, shortAccidentTravelRisk),
  ].join(" · ");
}

function accidentScenarioTitle(facets) {
  return ACCIDENT_FACET_KEYS.map((k) => joinFacetLabels(facets[k])).filter(Boolean).join(" · ");
}

function AccidentSegmentFacetFields({ facets, onPatch, filterMode = false, enabledFacetKeys }) {
  const keys = enabledFacetKeys ?? ACCIDENT_FACET_KEYS;

  return (
    <div className="psc-mortality-dialog-facet-stack">
      {keys.includes("occupation") && (
        <FacetMultiselectField
          label="Occupation"
          facetKey="occupation"
          facets={facets}
          onPatch={onPatch}
          options={ACCIDENT_OCCUPATION_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("geography") && (
        <FacetMultiselectField
          label="Geography"
          facetKey="geography"
          facets={facets}
          onPatch={onPatch}
          options={ACCIDENT_GEOGRAPHY_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("travel_risk") && (
        <FacetMultiselectField
          label="Travel risk"
          facetKey="travel_risk"
          facets={facets}
          onPatch={onPatch}
          options={ACCIDENT_TRAVEL_RISK_OPTIONS}
          filterMode={filterMode}
        />
      )}
    </div>
  );
}

const ACCIDENT_RATE_TABLE_CONFIG = {
  matrixTitle: "Accident rate matrix",
  segmentsAriaLabel: "Accident rate segments",
  facetKeys: ACCIDENT_FACET_KEYS,
  initialScenarios: INITIAL_ACCIDENT_SCENARIOS,
  defaultFacets: defaultAccidentFacets,
  facetKey: accidentFacetKey,
  FacetFields: AccidentSegmentFacetFields,
  pillLabel: accidentScenarioPillLabel,
  titleLabel: accidentScenarioTitle,
  csvFilePrefix: "accident-age-rates",
  dialogIdPrefix: "psc-accident",
  labels: {
    addSegmentDialog: "Add accident segment",
    editSegmentDialog: "Edit accident segment",
    removeSegmentTitle: "Remove accident segment?",
    removeSegmentMessage: "Age and rate rows for this segment will be permanently deleted.",
  },
};

const FUND_MARKET_SCENARIO_OPTIONS = [
  { value: "Bull", label: "Bull" },
  { value: "Bear", label: "Bear" },
  { value: "Base", label: "Base" },
];

const FUND_DURATION_OPTIONS = [
  { value: "1 year", label: "1 year" },
  { value: "5 years", label: "5 years" },
  { value: "10 years", label: "10 years" },
  { value: "15 years", label: "15 years" },
  { value: "20 years", label: "20 years" },
  { value: "25 years", label: "25 years" },
  { value: "30 years", label: "30 years" },
];

const FUND_GROWTH_FACET_KEYS = ["market_scenario", "duration"];

function coerceFundGrowthOptionValue(value, options) {
  const v = String(value ?? "").trim();
  if (!v) {
    return options[0]?.value ?? "";
  }
  const found = options.find((o) => o.value === v);
  return found ? found.value : options[0]?.value ?? "";
}

function defaultFundGrowthFacets() {
  return {
    market_scenario: [FUND_MARKET_SCENARIO_OPTIONS[0].value],
    duration: [FUND_DURATION_OPTIONS[2].value],
  };
}

function fundGrowthFacetKey(facets) {
  return facetKeyFromFacets(facets, FUND_GROWTH_FACET_KEYS);
}

/** Illustrative fund growth grid: ages × market scenario × duration. */
function buildFundGrowthMockRows() {
  const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  const scenarios = FUND_MARKET_SCENARIO_OPTIONS.map((o) => o.value);
  const durations = FUND_DURATION_OPTIONS.map((o) => o.value);

  const rows = [];
  for (const age of ages) {
    for (const market_scenario of scenarios) {
      for (const duration of durations) {
        const scenAdj = market_scenario === "Bull" ? 1.2 : market_scenario === "Bear" ? -0.6 : 0.2;
        const durAdj = durations.indexOf(duration) * 0.08;
        const ageAdj = (age - 20) * 0.01;
        const rate = Math.round((4 + scenAdj + durAdj + ageAdj) * 100) / 100;
        rows.push({ age, market_scenario, duration, rate });
      }
    }
  }
  return rows;
}

const FUND_GROWTH_MOCK_ROWS = buildFundGrowthMockRows();

function buildFundGrowthScenariosFromMock() {
  if (!FUND_GROWTH_MOCK_ROWS.length) {
    return [
      {
        id: uid(),
        facets: defaultFundGrowthFacets(),
        rows: defaultAgeRateRows(),
      },
    ];
  }

  const groups = new Map();
  for (const r of FUND_GROWTH_MOCK_ROWS) {
    const facets = normalizeFacetObject(
      {
        market_scenario: coerceFundGrowthOptionValue(r.market_scenario, FUND_MARKET_SCENARIO_OPTIONS),
        duration: coerceFundGrowthOptionValue(r.duration, FUND_DURATION_OPTIONS),
      },
      FUND_GROWTH_FACET_KEYS,
    );
    const key = fundGrowthFacetKey(facets);
    if (!groups.has(key)) {
      groups.set(key, { id: uid(), facets: { ...facets }, rows: [] });
    }
    groups.get(key).rows.push({
      id: uid(),
      age: String(r.age ?? ""),
      value_type: DEFAULT_RATE_VALUE_TYPE,
      rate: r.rate != null && r.rate !== "" ? String(r.rate) : "",
    });
  }

  return Array.from(groups.values()).map((s) => ({
    ...s,
    rows: normalizeAgeRateRows(s.rows),
  }));
}

const INITIAL_FUND_GROWTH_SCENARIOS = (() => {
  const scenarios = buildFundGrowthScenariosFromMock();
  return { scenarios, activeId: scenarios[0]?.id ?? "" };
})();

function shortMarketScenario(value) {
  const map = {
    Bull: "Bull",
    Bear: "Bear",
    Base: "Base",
  };
  return map[value] || "—";
}

function shortFundDuration(value) {
  const map = {
    "1 year": "1y",
    "5 years": "5y",
    "10 years": "10y",
    "15 years": "15y",
    "20 years": "20y",
    "25 years": "25y",
    "30 years": "30y",
  };
  return map[value] || "—";
}

function fundGrowthScenarioPillLabel(facets) {
  return [joinFacetShortLabels(facets.market_scenario, shortMarketScenario), joinFacetShortLabels(facets.duration, shortFundDuration)].join(
    " · ",
  );
}

function fundGrowthScenarioTitle(facets) {
  return FUND_GROWTH_FACET_KEYS.map((k) => joinFacetLabels(facets[k])).filter(Boolean).join(" · ");
}

function FundGrowthSegmentFacetFields({ facets, onPatch, filterMode = false, enabledFacetKeys }) {
  const keys = enabledFacetKeys ?? FUND_GROWTH_FACET_KEYS;

  return (
    <div className="psc-mortality-dialog-facet-stack">
      {keys.includes("market_scenario") && (
        <FacetMultiselectField
          label="Market scenario"
          facetKey="market_scenario"
          facets={facets}
          onPatch={onPatch}
          options={FUND_MARKET_SCENARIO_OPTIONS}
          filterMode={filterMode}
        />
      )}
      {keys.includes("duration") && (
        <FacetMultiselectField
          label="Duration (year)"
          facetKey="duration"
          facets={facets}
          onPatch={onPatch}
          options={FUND_DURATION_OPTIONS}
          filterMode={filterMode}
        />
      )}
    </div>
  );
}

const FUND_GROWTH_RATE_TABLE_CONFIG = {
  matrixTitle: "Fund growth assumption matrix",
  segmentsAriaLabel: "Fund growth assumption segments",
  facetKeys: FUND_GROWTH_FACET_KEYS,
  initialScenarios: INITIAL_FUND_GROWTH_SCENARIOS,
  defaultFacets: defaultFundGrowthFacets,
  facetKey: fundGrowthFacetKey,
  FacetFields: FundGrowthSegmentFacetFields,
  pillLabel: fundGrowthScenarioPillLabel,
  titleLabel: fundGrowthScenarioTitle,
  csvFilePrefix: "fund-growth-age-rates",
  dialogIdPrefix: "psc-fund-growth",
  labels: {
    addSegmentDialog: "Add fund growth segment",
    editSegmentDialog: "Edit fund growth segment",
    removeSegmentTitle: "Remove fund growth segment?",
    removeSegmentMessage: "Age and rate rows for this segment will be permanently deleted.",
  },
};

const CHARGE_TYPE_ROWS = [
  ["Premium Allocation"],
  ["Policy Admin"],
  ["FMC"],
  ["Surrender"],
  ["Switching"],
  ["Rider Charge"],
  ["Mortality Charge"],
];

const CHARGE_TYPE_OPTIONS = CHARGE_TYPE_ROWS.map(([label]) => ({ value: label, label }));

const CHARGE_FACET_KEYS = ["charge_type"];

function coerceChargeTypeValue(value) {
  const v = String(value ?? "").trim();
  if (!v) {
    return CHARGE_TYPE_OPTIONS[0]?.value ?? "";
  }
  const found = CHARGE_TYPE_OPTIONS.find((o) => o.value === v);
  return found ? found.value : CHARGE_TYPE_OPTIONS[0]?.value ?? "";
}

function defaultChargeFacets() {
  return {
    charge_type: [CHARGE_TYPE_OPTIONS[0].value],
  };
}

function chargeFacetKey(facets) {
  return facetKeyFromFacets(facets, CHARGE_FACET_KEYS);
}

function buildChargeMockRows() {
  const policyYears = [1, 2, 3, 5, 7, 10, 12, 15, 20, 25];
  const chargeTypes = CHARGE_TYPE_OPTIONS.map((o) => o.value);
  const rows = [];
  for (const charge_type of chargeTypes) {
    const typeIdx = chargeTypes.indexOf(charge_type);
    for (const policy_duration of policyYears) {
      const rate = Math.round((1.5 + typeIdx * 0.45 + (policy_duration - 1) * 0.08) * 100) / 100;
      rows.push({ policy_duration, charge_type, rate });
    }
  }
  return rows;
}

const CHARGE_MOCK_ROWS = buildChargeMockRows();

function buildChargeScenariosFromMock() {
  if (!CHARGE_MOCK_ROWS.length) {
    return [
      {
        id: uid(),
        facets: defaultChargeFacets(),
        rows: defaultRateRows(POLICY_DURATION_ROW_AXIS),
      },
    ];
  }

  const groups = new Map();
  for (const r of CHARGE_MOCK_ROWS) {
    const facets = normalizeFacetObject(
      { charge_type: coerceChargeTypeValue(r.charge_type) },
      CHARGE_FACET_KEYS,
    );
    const key = chargeFacetKey(facets);
    if (!groups.has(key)) {
      groups.set(key, { id: uid(), facets: { ...facets }, rows: [] });
    }
    groups.get(key).rows.push({
      id: uid(),
      policy_duration: String(r.policy_duration ?? ""),
      value_type: DEFAULT_RATE_VALUE_TYPE,
      rate: r.rate != null && r.rate !== "" ? String(r.rate) : "",
    });
  }

  return Array.from(groups.values()).map((s) => ({
    ...s,
    rows: normalizeRateRows(s.rows, POLICY_DURATION_ROW_AXIS),
  }));
}

const INITIAL_CHARGE_SCENARIOS = (() => {
  const scenarios = buildChargeScenariosFromMock();
  return { scenarios, activeId: scenarios[0]?.id ?? "" };
})();

function shortChargeType(value) {
  const map = {
    "Premium Allocation": "Prem Alloc",
    "Policy Admin": "Pol Admin",
    FMC: "FMC",
    Surrender: "Surr",
    Switching: "Switch",
    "Rider Charge": "Rider",
    "Mortality Charge": "Mort Chg",
  };
  return map[value] || "—";
}

function chargeScenarioPillLabel(facets) {
  return joinFacetShortLabels(facets.charge_type, shortChargeType);
}

function chargeScenarioTitle(facets) {
  return joinFacetLabels(facets.charge_type);
}

function ChargeSegmentFacetFields({ facets, onPatch, filterMode = false, enabledFacetKeys }) {
  const keys = enabledFacetKeys ?? CHARGE_FACET_KEYS;

  return (
    <div className="psc-mortality-dialog-facet-stack">
      {keys.includes("charge_type") && (
        <FacetMultiselectField
          label="Charge type"
          facetKey="charge_type"
          facets={facets}
          onPatch={onPatch}
          options={CHARGE_TYPE_OPTIONS}
          filterMode={filterMode}
        />
      )}
    </div>
  );
}

const CHARGE_RATE_TABLE_CONFIG = {
  matrixTitle: "Charge rate matrix",
  segmentsAriaLabel: "Charge rate segments",
  facetKeys: CHARGE_FACET_KEYS,
  initialScenarios: INITIAL_CHARGE_SCENARIOS,
  defaultFacets: defaultChargeFacets,
  facetKey: chargeFacetKey,
  FacetFields: ChargeSegmentFacetFields,
  pillLabel: chargeScenarioPillLabel,
  titleLabel: chargeScenarioTitle,
  csvFilePrefix: "charge-policy-duration-rates",
  dialogIdPrefix: "psc-charge",
  rowAxis: POLICY_DURATION_ROW_AXIS,
  labels: {
    addSegmentDialog: "Add charge segment",
    editSegmentDialog: "Edit charge segment",
    removeSegmentTitle: "Remove charge segment?",
    removeSegmentMessage: "Policy duration and rate rows for this segment will be permanently deleted.",
  },
};

function FieldLegendTable({ title, rows }) {
  return (
    <div className="psc-benefit-matrix-block">
      {title ? <h3 className="psc-benefit-matrix-subtitle">{title}</h3> : null}
      <div className="psc-benefit-matrix-table-wrap">
        <table className="psc-benefit-matrix-table psc-benefit-matrix-table--legend">
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, desc]) => (
              <tr key={field}>
                <td>{field}</td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MortalityRateTablePanel({ tableStructure }) {
  const config = applyTableStructureToRateConfig(
    MORTALITY_RATE_TABLE_CONFIG,
    "mortality-rate-table",
    tableStructure,
    MortalitySegmentFacetFields,
  );
  return <RateSegmentTablePanel config={config} />;
}

function MorbidityCiTablePanel({ tableStructure }) {
  const config = applyTableStructureToRateConfig(
    MORBIDITY_CI_RATE_TABLE_CONFIG,
    "morbidity-ci-table",
    tableStructure,
    MorbiditySegmentFacetFields,
  );
  return <RateSegmentTablePanel config={config} />;
}

function AccidentRateTablePanel({ tableStructure }) {
  const config = applyTableStructureToRateConfig(
    ACCIDENT_RATE_TABLE_CONFIG,
    "accident-rate-table",
    tableStructure,
    AccidentSegmentFacetFields,
  );
  return <RateSegmentTablePanel config={config} />;
}

function ChargeRateTablesPanel({ tableStructure }) {
  const config = applyTableStructureToRateConfig(
    CHARGE_RATE_TABLE_CONFIG,
    "charge-rate-tables",
    tableStructure,
    ChargeSegmentFacetFields,
  );
  return <RateSegmentTablePanel config={config} />;
}

/** Savings features on the dedicated benefit savings page. */
export function BenefitSavingsPanel({ savings, onSavingsChange }) {
  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-savings-panel">
      <ProductStudioSavingsPanel savings={savings} onSavingsChange={onSavingsChange} />
    </div>
  );
}

/** Underwriting rules on the dedicated benefit underwriting-rules page (same panel as product components). */
export function BenefitUnderwritingRulesPanel({ underwritingRules, onUnderwritingRulesChange }) {
  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-underwriting-rules-panel">
      <ProductStudioUnderwritingPanel
        underwritingRules={underwritingRules}
        onUnderwritingRulesChange={onUnderwritingRulesChange}
      />
    </div>
  );
}

/** Charge rate tables on the dedicated benefit charge-rate-tables page. */
export function BenefitChargeRateTablesPanel({ tableStructure }) {
  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-charge-rate-tables-panel">
      <ChargeRateTablesPanel tableStructure={tableStructure} />
    </div>
  );
}

/**
 * Benefit charges list — fee lines with View details (product-level charges on this benefit context).
 * @param {{
 *   charges: unknown,
 *   onChargesChange: (next: object) => void,
 *   chargeDetailBasePath: string,
 * }} props
 */
export function BenefitChargesPanel({ charges, onChargesChange, chargeDetailBasePath }) {
  const navigate = useNavigate();
  const base = typeof chargeDetailBasePath === "string" ? chargeDetailBasePath.trim().replace(/\/$/, "") : "";

  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-charges-panel">
      <ProductStudioChargesPanel
        charges={charges}
        onChargesChange={onChargesChange}
        onViewItemDetails={base ? (id) => navigate(`${base}/${encodeURIComponent(id)}`) : undefined}
      />
    </div>
  );
}

/**
 * Benefit charge detail — editable fee line (collapsible sections).
 * @param {{ chargeId: string, charges: unknown, onChargesChange: (next: object) => void }} props
 */
export function BenefitChargeDetailPanel({ chargeId, charges, onChargesChange }) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [form, setForm] = useState(() => emptyFeeForm());

  const list = useMemo(() => normalizeChargesConfiguration(charges).items, [charges]);
  const hasSaved = list.length > 0;
  const displayList = hasSaved ? list : DEMO_FEES_LIST;
  const listIsMock = !hasSaved;
  const row = displayList.find((x) => x.id === chargeId);
  const persistedId = list.some((x) => x.id === chargeId) ? chargeId : null;

  useEffect(() => {
    if (!row) {
      return;
    }
    setForm(feeRowToForm(row));
  }, [row, chargeId]);

  const patchForm = useCallback((keyOrPatch, maybeValue) => {
    if (typeof keyOrPatch === "string") {
      setForm((f) => ({ ...f, [keyOrPatch]: maybeValue }));
      return;
    }
    if (keyOrPatch && typeof keyOrPatch === "object") {
      setForm((f) => ({ ...f, ...keyOrPatch }));
    }
  }, []);

  const saveCharge = useCallback(() => {
    const err = validateFeeForm(form);
    if (err) {
      window.alert(err);
      return;
    }
    if (listIsMock) {
      window.alert("Save at least one fee on the product before editing charge details. Sample rows are for preview only.");
      return;
    }
    if (!persistedId) {
      return;
    }
    const partial = feeFormToRowPartial(form);
    const next = list.map((x) => (x.id === persistedId ? { ...x, ...partial } : x));
    onChargesChange(normalizeChargesConfiguration({ items: next }));
  }, [form, list, listIsMock, onChargesChange, persistedId]);

  if (!row) {
    return null;
  }

  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-charge-detail-page">
      <div className="psc-fund-detail-collapse-stack">
        <FundDetailCollapsible
          id="charge-fee-details"
          title="Fee details"
          open={detailsOpen}
          onToggle={() => setDetailsOpen((v) => !v)}
        >
          <ChargesDialogBody
            form={form}
            patchForm={patchForm}
            embedded
            onSave={saveCharge}
            saveLabel="Save charge details"
          />
        </FundDetailCollapsible>
      </div>
    </div>
  );
}

/** Fund growth assumption matrix (segment table). */
function FundGrowthTablePanel({ tableStructure }) {
  const config = applyTableStructureToRateConfig(
    FUND_GROWTH_RATE_TABLE_CONFIG,
    "fund-growth-table",
    tableStructure,
    FundGrowthSegmentFacetFields,
  );
  return <RateSegmentTablePanel config={config} />;
}

function FundDetailCollapsible({ id, title, open, onToggle, children }) {
  return (
    <section className={`psc-fund-detail-collapse${open ? " is-open" : ""}`}>
      <h2 className="psc-fund-detail-collapse-heading">
        <button
          type="button"
          id={`${id}-trigger`}
          className="psc-fund-detail-collapse-trigger"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
        >
          <span className="psc-fund-detail-collapse-title">{title}</span>
          <span className="psc-fund-detail-collapse-chevron" aria-hidden />
        </button>
      </h2>
      {open ? (
        <div id={`${id}-panel`} className="psc-fund-detail-collapse-panel" role="region" aria-labelledby={`${id}-trigger`}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Benefit fund detail page — collapsible allocation & fund forms, then growth rate matrix.
 * @param {{ fundId: string, fundsItems: object[], onFundsChange: (items: object[]) => void }} props
 */
export function BenefitFundDetailPanel({ fundId, fundsItems, onFundsChange, tableStructure }) {
  const [fundDetailsOpen, setFundDetailsOpen] = useState(true);
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState(() => emptyAllocationRulesForm());
  const [fundForm, setFundForm] = useState(() => fundRowToEditForm({}));

  const list = useMemo(() => normalizeFundsConfiguration({ items: fundsItems }).items, [fundsItems]);
  const hasSavedFunds = list.length > 0;
  const displayList = hasSavedFunds ? list : DEMO_FUNDS_LIST;
  const listIsMock = !hasSavedFunds;
  const fund = displayList.find((f) => f.id === fundId);
  const persistedId = list.some((f) => f.id === fundId) ? fundId : null;

  useEffect(() => {
    if (!fund) {
      return;
    }
    setAllocationForm(effectiveAllocationRulesForFund(fund));
    setFundForm(fundRowToEditForm(fund));
  }, [fund, fundId]);

  const patchAllocationForm = useCallback((key, v) => {
    setAllocationForm((f) => ({ ...f, [key]: v }));
  }, []);

  const patchFundForm = useCallback((key, v) => {
    setFundForm((f) => ({ ...f, [key]: v }));
  }, []);

  const saveAllocationRules = useCallback(() => {
    if (listIsMock) {
      window.alert("Add at least one saved fund to this product before saving allocation rules. Sample rows are for preview only.");
      return;
    }
    if (!persistedId) {
      return;
    }
    const rules = normalizeAllocationRules(allocationForm);
    const next = list.map((f) => (f.id === persistedId ? { ...f, allocationRules: rules } : f));
    onFundsChange(normalizeFundsConfiguration({ items: next }).items);
  }, [allocationForm, list, listIsMock, onFundsChange, persistedId]);

  const saveFundDetails = useCallback(() => {
    const name = fundForm.fundName?.trim();
    const code = fundForm.fundCode?.trim().toUpperCase();
    if (!name) {
      window.alert("Fund name is required.");
      return;
    }
    if (!code) {
      window.alert("Fund code is required.");
      return;
    }
    const other = list.filter((x) => x.id !== persistedId);
    if (other.some((x) => x.fundCode.toUpperCase() === code)) {
      window.alert("Fund code must be unique within this product.");
      return;
    }
    const prev = persistedId ? list.find((x) => x.id === persistedId) : fund;
    const row = {
      id: persistedId || uid(),
      fundName: name,
      fundCode: code,
      fundType: fundForm.fundType?.trim() || "",
      currency: fundForm.currency?.trim() || "",
      riskRating: fundForm.riskRating?.trim() || "",
      fundManager: fundForm.fundManager?.trim() || "",
      navFrequency: fundForm.navFrequency?.trim() || "",
      minAllocationPct: fundForm.minAllocationPct?.trim() || "",
      maxAllocationPct: fundForm.maxAllocationPct?.trim() || "",
      fundStatus: fundForm.fundStatus?.trim() || "Active",
      shariaCompliant: fundForm.shariaCompliant?.trim() || "",
      guaranteeApplicable: fundForm.guaranteeApplicable?.trim() || "",
      allocationRules: prev?.allocationRules ? normalizeAllocationRules(prev.allocationRules) : normalizeAllocationRules(allocationForm),
    };
    const next = persistedId ? list.map((x) => (x.id === persistedId ? row : x)) : [...list, row];
    onFundsChange(normalizeFundsConfiguration({ items: next }).items);
  }, [allocationForm, fund, fundForm, list, onFundsChange, persistedId]);

  if (!fund) {
    return null;
  }

  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-fund-detail-page">
      <div className="psc-fund-detail-collapse-stack">
        <FundDetailCollapsible
          id="fund-details"
          title="Fund details"
          open={fundDetailsOpen}
          onToggle={() => setFundDetailsOpen((v) => !v)}
        >
          <FundDialogForm form={fundForm} patchForm={patchFundForm} onSave={saveFundDetails} saveLabel="Save fund details" embedded />
        </FundDetailCollapsible>

        <FundDetailCollapsible
          id="fund-allocation-rules"
          title="Allocation rules"
          open={allocationOpen}
          onToggle={() => setAllocationOpen((v) => !v)}
        >
          <FundAllocationDialogForm
            form={allocationForm}
            patchForm={patchAllocationForm}
            onSave={saveAllocationRules}
            embedded
          />
        </FundDetailCollapsible>
      </div>

      <div className="psc-benefit-fund-growth-section">
        <h2 className="psc-field-section-title psc-benefit-fund-growth-section-title">Fund growth rate</h2>
        <FundGrowthTablePanel tableStructure={tableStructure} />
      </div>
    </div>
  );
}

/** @deprecated Use BenefitFundDetailPanel */
export function BenefitFundGrowthRatePanel(props) {
  return <BenefitFundDetailPanel {...props} />;
}

/**
 * Benefit funds list page.
 * @param {{
 *   fundsItems: object[],
 *   onFundsChange: (items: object[]) => void,
 *   fundGrowthRateBasePath: string,
 * }} props
 */
export function BenefitFundsPanel({ fundsItems, onFundsChange, fundGrowthRateBasePath }) {
  const navigate = useNavigate();
  const base = typeof fundGrowthRateBasePath === "string" ? fundGrowthRateBasePath.trim().replace(/\/$/, "") : "";

  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-funds-panel">
      <ProductStudioFundsPanel
        items={fundsItems}
        onItemsChange={onFundsChange}
        onViewFundDetails={
          base ? (id) => navigate(`${base}/${encodeURIComponent(id)}/growth-rate`) : undefined
        }
      />
    </div>
  );
}

function renderTabBody(tabId, tableStructure) {
  switch (tabId) {
    case "mortality-rate-table":
      return <MortalityRateTablePanel tableStructure={tableStructure} />;
    case "morbidity-ci-table":
      return <MorbidityCiTablePanel tableStructure={tableStructure} />;
    case "accident-rate-table":
      return <AccidentRateTablePanel tableStructure={tableStructure} />;
    case "fund-growth-table":
      return <FundGrowthTablePanel tableStructure={tableStructure} />;
    case "charge-rate-tables":
      return <ChargeRateTablesPanel tableStructure={tableStructure} />;
    default: {
      const text = PLACEHOLDER_COPY[tabId] || "";
      return text ? <p className="psc-benefit-detail-placeholder">{text}</p> : null;
    }
  }
}

/**
 * Rate table tabs on the dedicated benefit rate-tables page.
 * @param {{ activeTab: string, onTabChange: (id: string) => void }} props
 */
export function BenefitRateTablesPanel({ activeTab, onTabChange, tableStructure }) {
  return (
    <div className="psc-field-section psc-benefit-detail-extension psc-benefit-rate-tables-panel">
      <div className="psc-benefit-detail-tabs" role="tablist" aria-label="Rate tables">
        {BENEFIT_RATE_TABLE_TABS.map((t) => (
          <button
            key={t.id}
            id={`benefit-rate-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            aria-controls={`benefit-rate-panel-${t.id}`}
            className={activeTab === t.id ? "is-active" : ""}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`benefit-rate-panel-${activeTab}`}
        className="psc-benefit-detail-tab-panel"
        role="tabpanel"
        aria-labelledby={`benefit-rate-tab-${activeTab}`}
      >
        {renderTabBody(activeTab, tableStructure)}
      </div>
    </div>
  );
}

/**
 * Horizontal tabs + panel body for the product-studio benefit edit page.
 * @param {{
 *   activeTab: string,
 *   onTabChange: (id: string) => void,
 *   rateTablesPath?: string,
 *   chargeRateTablesPath?: string,
 *   chargesPath?: string,
 *   fundsPath?: string,
 *   savingsPath?: string,
 *   underwritingRulesPath?: string,
 *   highlightComponentCardId?: string,
 * }} props
 */
export function BenefitDetailExtensionPanel({
  activeTab,
  onTabChange,
  rateTablesPath = "",
  chargeRateTablesPath = "",
  chargesPath = "",
  fundsPath = "",
  savingsPath = "",
  underwritingRulesPath = "",
  highlightComponentCardId = "",
}) {
  const navigate = useNavigate();
  const activeComponentCardId = highlightComponentCardId || benefitComponentCardIdForTab(activeTab);

  const handleComponentCardClick = (card) => {
    if (card.route === "rate-tables" && rateTablesPath) {
      navigate(rateTablesPath);
      return;
    }
    if (card.route === "charge-rate-tables" && chargeRateTablesPath) {
      navigate(chargeRateTablesPath);
      return;
    }
    if (card.route === "charges" && chargesPath) {
      navigate(chargesPath);
      return;
    }
    if (card.route === "funds" && fundsPath) {
      navigate(fundsPath);
      return;
    }
    if (card.route === "savings" && savingsPath) {
      navigate(savingsPath);
      return;
    }
    if (card.route === "underwriting-rules" && underwritingRulesPath) {
      navigate(underwritingRulesPath);
      return;
    }
    if (card.tabId) {
      onTabChange(card.tabId);
    }
  };

  return (
    <div className="psc-field-section psc-benefit-detail-extension">
      <div className="psc-benefit-components-section">
        <h2 className="psc-benefit-components-title">Benefits Components</h2>
        <div className="psc-benefit-components-cards" role="group" aria-label="Benefits components">
          {BENEFIT_COMPONENT_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`psc-component-card psc-benefit-component-card${activeComponentCardId === card.id ? " is-active" : ""}`}
              aria-pressed={activeComponentCardId === card.id}
              onClick={() => handleComponentCardClick(card)}
            >
              <span className={`psc-component-card-icon-wrap psc-component-card-icon-wrap--${card.icon}`}>
                <BenefitComponentCardIcon name={card.icon} />
              </span>
              <span className="psc-component-card-label">{card.label}</span>
              <span className="psc-component-card-action" aria-hidden>
                <svg
                  className="psc-component-card-action-svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 3h7v7M10 14L21 3M18 13v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7"
                  />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
      {BENEFIT_EDIT_EXTENSION_TABS.length > 0 && (
        <>
          <div className="psc-benefit-detail-tabs" role="tablist" aria-label="Benefit configuration areas">
            {BENEFIT_EDIT_EXTENSION_TABS.map((t) => (
              <button
                key={t.id}
                id={`benefit-ext-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                aria-controls={`benefit-ext-panel-${t.id}`}
                className={activeTab === t.id ? "is-active" : ""}
                onClick={() => onTabChange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            id={`benefit-ext-panel-${activeTab}`}
            className="psc-benefit-detail-tab-panel"
            role="tabpanel"
            aria-labelledby={`benefit-ext-tab-${activeTab}`}
          >
            {renderTabBody(activeTab)}
          </div>
        </>
      )}
    </div>
  );
}

export { BENEFIT_DETAIL_EXTENSION_TABS, BENEFIT_EDIT_EXTENSION_TABS, BENEFIT_FUNDS_TABS, BENEFIT_RATE_TABLE_TABS };
