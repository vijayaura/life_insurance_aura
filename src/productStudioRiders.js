/**
 * Product Studio — optional riders catalog (preset rows + custom riders).
 * Stored on `productConfiguration.riders`.
 */

/** Built-in riders (stable `id` for enable/disable persistence). */
export const PRESET_RIDER_DEFINITIONS = [
  {
    id: "rider-critical-illness",
    riderName: "Critical Illness",
    description: "Lump sum on diagnosis of listed critical illness",
  },
  {
    id: "rider-accelerated-ci",
    riderName: "Accelerated Critical Illness",
    description: "CI payout reduces death benefit",
  },
  {
    id: "rider-additional-ci",
    riderName: "Additional Critical Illness",
    description: "CI payout in addition to death benefit",
  },
  {
    id: "rider-personal-accident",
    riderName: "Personal Accident",
    description: "Accidental death / disability benefits",
  },
  {
    id: "rider-adb",
    riderName: "Accidental Death Benefit",
    description: "Additional payout on accidental death",
  },
  {
    id: "rider-ptd",
    riderName: "Permanent Total Disability",
    description: "Lump sum or waiver on disability",
  },
  {
    id: "rider-ppd",
    riderName: "Permanent Partial Disability",
    description: "Percentage payout based on disability table",
  },
  {
    id: "rider-ttd",
    riderName: "Temporary Total Disability",
    description: "Weekly / monthly income benefit",
  },
  {
    id: "rider-waiver-premium",
    riderName: "Waiver of Premium",
    description: "Waives future premiums on disability / CI / death of payer",
  },
  {
    id: "rider-hospital-cash",
    riderName: "Hospital Cash",
    description: "Daily hospital cash benefit",
  },
  {
    id: "rider-fib",
    riderName: "Family Income Benefit",
    description: "Monthly income after death",
  },
  {
    id: "rider-child-education",
    riderName: "Child Education Benefit",
    description: "Education payout after death / disability",
  },
  {
    id: "rider-spouse",
    riderName: "Spouse Rider",
    description: "Cover for spouse",
  },
  {
    id: "rider-child",
    riderName: "Child Rider",
    description: "Cover for children",
  },
  {
    id: "rider-funeral",
    riderName: "Funeral Benefit",
    description: "Immediate small payout on death",
  },
  {
    id: "rider-dread-disease",
    riderName: "Dread Disease Rider",
    description: "Similar to CI, depending on product wording",
  },
  {
    id: "rider-payor",
    riderName: "Payor Benefit",
    description: "Waiver if payer dies or becomes disabled",
  },
];

export const SUM_ASSURED_BASIS_CHOICES = [
  { value: "fixed", label: "Fixed amount" },
  { value: "pct_base_sa", label: "Percentage of base SA" },
  { value: "multiple_premium", label: "Multiple of annual premium" },
];

export const RIDER_PREMIUM_TYPE_CHOICES = [
  { value: "level", label: "Level" },
  { value: "age_rated", label: "Age-rated" },
  { value: "annually_renewable", label: "Annually renewable" },
];

export const RIDER_TERM_CHOICES = [
  { value: "same_as_base", label: "Same as base" },
  { value: "shorter", label: "Shorter than base" },
  { value: "to_age_65", label: "To age 65" },
];

export const YES_NO_EMPTY_CHOICES = [
  { value: "", label: "—" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const MEDICAL_UW_CHOICES = [
  { value: "", label: "—" },
  { value: "no", label: "No" },
  { value: "always", label: "Yes (always)" },
  { value: "above_limit", label: "Yes above certain limit" },
];

export function getPresetRiderDefinition(presetId) {
  return PRESET_RIDER_DEFINITIONS.find((p) => p.id === presetId) || null;
}

export function defaultRiderRuleDetails() {
  return {
    minEntryAge: "",
    maxEntryAge: "",
    maxExpiryAge: "",
    sumAssuredBasis: "fixed",
    minRiderSa: "",
    maxRiderSa: "",
    cannotExceedBaseSa: "",
    waitingPeriodDays: "",
    survivalPeriodDays: "",
    allowedOccupations: "",
    requiresMedicalUw: "",
    medicalUwLimit: "",
    riderPremiumType: "level",
    riderTerm: "same_as_base",
    cancellationAllowed: "",
    reinstatementAllowed: "",
  };
}

/** @param {unknown} raw */
export function normalizeRiderRuleDetails(raw) {
  const d = defaultRiderRuleDetails();
  if (!raw || typeof raw !== "object") {
    return d;
  }
  const str = (k) => String(raw[k] ?? "").trim();
  const pick = (k, allowed, fallback) => {
    const v = str(k);
    return allowed.includes(v) ? v : fallback;
  };
  const allowedSum = SUM_ASSURED_BASIS_CHOICES.map((o) => o.value);
  const allowedPrem = RIDER_PREMIUM_TYPE_CHOICES.map((o) => o.value);
  const allowedTerm = RIDER_TERM_CHOICES.map((o) => o.value);
  const yn = ["", "yes", "no"];
  const med = ["", "no", "always", "above_limit"];
  return {
    minEntryAge: str("minEntryAge"),
    maxEntryAge: str("maxEntryAge"),
    maxExpiryAge: str("maxExpiryAge"),
    sumAssuredBasis: pick("sumAssuredBasis", allowedSum, d.sumAssuredBasis),
    minRiderSa: str("minRiderSa"),
    maxRiderSa: str("maxRiderSa"),
    cannotExceedBaseSa: pick("cannotExceedBaseSa", yn, d.cannotExceedBaseSa),
    waitingPeriodDays: str("waitingPeriodDays"),
    survivalPeriodDays: str("survivalPeriodDays"),
    allowedOccupations: str("allowedOccupations"),
    requiresMedicalUw: pick("requiresMedicalUw", med, d.requiresMedicalUw),
    medicalUwLimit: str("medicalUwLimit"),
    riderPremiumType: pick("riderPremiumType", allowedPrem, d.riderPremiumType),
    riderTerm: pick("riderTerm", allowedTerm, d.riderTerm),
    cancellationAllowed: pick("cancellationAllowed", yn, d.cancellationAllowed),
    reinstatementAllowed: pick("reinstatementAllowed", yn, d.reinstatementAllowed),
  };
}

export function defaultRidersConfiguration() {
  return {
    enabledPresetIds: [],
    customRiders: [],
    presetRiderRules: {},
  };
}

/** @param {unknown} raw */
export function normalizeRidersConfig(raw) {
  const base = defaultRidersConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const enabled = raw.enabledPresetIds;
  const customs = raw.customRiders;
  const presetRulesRaw = raw.presetRiderRules;
  const presetRiderRules = {};
  if (presetRulesRaw && typeof presetRulesRaw === "object") {
    for (const [k, v] of Object.entries(presetRulesRaw)) {
      if (typeof k === "string" && k.trim()) {
        presetRiderRules[k.trim()] = normalizeRiderRuleDetails(v);
      }
    }
  }
  return {
    enabledPresetIds: Array.isArray(enabled) ? enabled.filter((x) => typeof x === "string") : base.enabledPresetIds,
    customRiders: Array.isArray(customs)
      ? customs
          .filter((r) => r && typeof r === "object" && r.id && r.riderName)
          .map((r) => ({
            id: String(r.id),
            riderName: String(r.riderName || "").trim(),
            description: String(r.description || "").trim(),
            enabled: Boolean(r.enabled),
            rules: normalizeRiderRuleDetails(r.rules),
          }))
      : base.customRiders,
    presetRiderRules,
  };
}
