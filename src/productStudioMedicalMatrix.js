/**
 * Product Studio — medical requirement matrix (age × sum assured → requirement).
 * Stored as `productConfiguration.medicalRequirementMatrix` = { items: MedicalMatrixRow[] }.
 */

import { YES_NO_ACTIVE } from "./productStudioCharges.js";

export { YES_NO_ACTIVE };

export function emptyMedicalMatrixRowForm() {
  return {
    ageBand: "",
    sumAssuredBand: "",
    requirement: "",
    notes: "",
    active: "Yes",
  };
}

function normalizeMedicalMatrixItem(it) {
  const e = emptyMedicalMatrixRowForm();
  if (!it || typeof it !== "object") {
    return { id: "", ...e };
  }
  const pick = (k) => String(it[k] ?? "").trim();
  const active = pick("active");
  return {
    id: pick("id"),
    ageBand: pick("ageBand"),
    sumAssuredBand: pick("sumAssuredBand"),
    requirement: pick("requirement"),
    notes: pick("notes"),
    active: active === "No" ? "No" : "Yes",
  };
}

function medicalMatrixItemIsValid(it) {
  return Boolean(it.id && it.ageBand && it.sumAssuredBand && it.requirement);
}

export function defaultMedicalRequirementMatrixConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizeMedicalRequirementMatrixConfiguration(raw) {
  const base = defaultMedicalRequirementMatrixConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  if (Array.isArray(raw)) {
    return {
      items: raw.map((x) => normalizeMedicalMatrixItem(x)).filter(medicalMatrixItemIsValid),
    };
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  if (list.length > 0) {
    return {
      items: list.map((x) => normalizeMedicalMatrixItem(x)).filter(medicalMatrixItemIsValid),
    };
  }
  return base;
}

/** @param {unknown} row */
export function medicalMatrixRowToForm(row) {
  const r = row && typeof row === "object" ? row : {};
  return {
    ageBand: String(r.ageBand ?? "").trim(),
    sumAssuredBand: String(r.sumAssuredBand ?? "").trim(),
    requirement: String(r.requirement ?? "").trim(),
    notes: String(r.notes ?? "").trim(),
    active: String(r.active ?? "").trim() === "No" ? "No" : "Yes",
  };
}

/** @param {object} form */
export function medicalMatrixFormToRowPartial(form) {
  const f = form && typeof form === "object" ? form : {};
  const active = String(f.active ?? "").trim() === "No" ? "No" : "Yes";
  return {
    ageBand: String(f.ageBand ?? "").trim(),
    sumAssuredBand: String(f.sumAssuredBand ?? "").trim(),
    requirement: String(f.requirement ?? "").trim(),
    notes: String(f.notes ?? "").trim(),
    active,
  };
}

/** @param {object} form */
export function validateMedicalMatrixForm(form) {
  const f = form && typeof form === "object" ? form : {};
  if (!String(f.ageBand ?? "").trim()) {
    return "Enter an age band.";
  }
  if (!String(f.sumAssuredBand ?? "").trim()) {
    return "Enter a sum assured band.";
  }
  if (!String(f.requirement ?? "").trim()) {
    return "Enter a requirement.";
  }
  return null;
}

/** Example matrix when product has none saved. */
export const DEMO_MEDICAL_MATRIX_LIST = [
  {
    id: "demo-med-1",
    ageBand: "18–40",
    sumAssuredBand: "Up to AED 500k",
    requirement: "No medical",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-med-2",
    ageBand: "18–40",
    sumAssuredBand: "AED 500k–2M",
    requirement: "Health questionnaire",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-med-3",
    ageBand: "41–55",
    sumAssuredBand: "AED 500k–1M",
    requirement: "Medical exam",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-med-4",
    ageBand: "56+",
    sumAssuredBand: "Any high SA",
    requirement: "Full medical + UW referral",
    notes: "",
    active: "Yes",
  },
];
