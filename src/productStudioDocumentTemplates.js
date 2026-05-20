/**
 * Product Studio — document template configuration (line items per product).
 * Stored as `productConfiguration.documentTemplates` = { items: DocumentTemplateLine[] }.
 */

export const YES_NO_ACTIVE = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const DOCUMENT_REQUIREMENT_OPTIONS = [
  { value: "", label: "—" },
  { value: "mandatory", label: "Mandatory" },
  { value: "optional", label: "Optional" },
];

export function labelDocumentRequirement(value) {
  const o = DOCUMENT_REQUIREMENT_OPTIONS.find((x) => x.value === value);
  return o?.label || value || "—";
}

/** Canonical documents (Create document picks from this list). */
export const DOCUMENT_TEMPLATE_CATALOG = [
  { id: "quotation_illustration", documentName: "Quotation Illustration", catalogTrigger: "Quote generation" },
  { id: "benefit_illustration", documentName: "Benefit Illustration", catalogTrigger: "Savings / UL product quotation" },
  { id: "proposal_form", documentName: "Proposal Form", catalogTrigger: "Application submission" },
  { id: "policy_schedule", documentName: "Policy Schedule", catalogTrigger: "Policy issuance" },
  { id: "policy_wording", documentName: "Policy Wording", catalogTrigger: "Policy issuance" },
  { id: "key_facts_statement", documentName: "Key Facts Statement", catalogTrigger: "Before purchase" },
  { id: "fund_fact_sheet", documentName: "Fund Fact Sheet", catalogTrigger: "UL products" },
  { id: "medical_questionnaire", documentName: "Medical Questionnaire", catalogTrigger: "Underwriting trigger" },
  { id: "financial_questionnaire", documentName: "Financial Questionnaire", catalogTrigger: "High sum assured" },
  { id: "beneficiary_form", documentName: "Beneficiary Form", catalogTrigger: "Nomination" },
  { id: "assignment_form", documentName: "Assignment Form", catalogTrigger: "Bank assignment" },
  { id: "renewal_notice", documentName: "Renewal Notice", catalogTrigger: "Renewal" },
  { id: "lapse_notice", documentName: "Lapse Notice", catalogTrigger: "Non-payment" },
  { id: "surrender_value_statement", documentName: "Surrender Value Statement", catalogTrigger: "Servicing" },
  { id: "annual_statement", documentName: "Annual Statement", catalogTrigger: "Policy anniversary" },
  { id: "commission_statement", documentName: "Commission Statement", catalogTrigger: "Monthly distributor settlement" },
  { id: "custom", documentName: "Custom document", catalogTrigger: "User-defined" },
];

export function getDocumentCatalogEntry(documentTypeId) {
  return DOCUMENT_TEMPLATE_CATALOG.find((c) => c.id === documentTypeId) || null;
}

export function emptyDocumentTemplateForm() {
  return {
    documentTypeId: "",
    customDocumentName: "",
    triggerSummary: "",
    templateCode: "",
    requirementStatus: "",
    notes: "",
    active: "Yes",
  };
}

function normalizeDocumentItem(it) {
  const e = emptyDocumentTemplateForm();
  if (!it || typeof it !== "object") {
    return { id: "", ...e };
  }
  const pick = (k) => String(it[k] ?? "").trim();
  const active = pick("active");
  return {
    id: pick("id"),
    documentTypeId: pick("documentTypeId"),
    customDocumentName: pick("customDocumentName"),
    triggerSummary: pick("triggerSummary"),
    templateCode: pick("templateCode"),
    requirementStatus: pick("requirementStatus"),
    notes: pick("notes"),
    active: active === "No" ? "No" : "Yes",
  };
}

function documentItemIsValid(it) {
  if (!it.id || !it.documentTypeId) {
    return false;
  }
  if (it.documentTypeId === "custom") {
    return Boolean(it.customDocumentName);
  }
  return true;
}

export function defaultDocumentTemplatesConfiguration() {
  return { items: [] };
}

/** @param {unknown} raw */
export function normalizeDocumentTemplatesConfiguration(raw) {
  const base = defaultDocumentTemplatesConfiguration();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  if (Array.isArray(raw)) {
    return {
      items: raw.map((x) => normalizeDocumentItem(x)).filter(documentItemIsValid),
    };
  }
  const list = Array.isArray(raw.items) ? raw.items : [];
  if (list.length > 0) {
    return {
      items: list.map((x) => normalizeDocumentItem(x)).filter(documentItemIsValid),
    };
  }
  return base;
}

/** @param {unknown} row */
export function documentTemplateRowToForm(row) {
  const r = row && typeof row === "object" ? row : {};
  return {
    documentTypeId: String(r.documentTypeId ?? "").trim(),
    customDocumentName: String(r.customDocumentName ?? "").trim(),
    triggerSummary: String(r.triggerSummary ?? "").trim(),
    templateCode: String(r.templateCode ?? "").trim(),
    requirementStatus: String(r.requirementStatus ?? "").trim(),
    notes: String(r.notes ?? "").trim(),
    active: String(r.active ?? "").trim() === "No" ? "No" : "Yes",
  };
}

/** @param {object} form */
export function documentTemplateFormToRowPartial(form) {
  const f = form && typeof form === "object" ? form : {};
  const active = String(f.active ?? "").trim() === "No" ? "No" : "Yes";
  return {
    documentTypeId: String(f.documentTypeId ?? "").trim(),
    customDocumentName: String(f.customDocumentName ?? "").trim(),
    triggerSummary: String(f.triggerSummary ?? "").trim(),
    templateCode: String(f.templateCode ?? "").trim(),
    requirementStatus: String(f.requirementStatus ?? "").trim(),
    notes: String(f.notes ?? "").trim(),
    active,
  };
}

/** @param {object} form */
export function validateDocumentTemplateForm(form) {
  const f = form && typeof form === "object" ? form : {};
  if (!String(f.documentTypeId ?? "").trim()) {
    return "Select a document type.";
  }
  if (f.documentTypeId === "custom" && !String(f.customDocumentName ?? "").trim()) {
    return "Custom document name is required.";
  }
  return null;
}

export const DEMO_DOCUMENT_TEMPLATES_LIST = [
  {
    id: "demo-doc-quote",
    documentTypeId: "quotation_illustration",
    customDocumentName: "",
    triggerSummary: "Quote generation",
    templateCode: "TMPL-QUOTE-V3",
    requirementStatus: "optional",
    notes: "Include fund growth scenario A",
    active: "Yes",
  },
  {
    id: "demo-doc-proposal",
    documentTypeId: "proposal_form",
    customDocumentName: "",
    triggerSummary: "Application submission",
    templateCode: "TMPL-PROP-AE-01",
    requirementStatus: "mandatory",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-doc-kfs",
    documentTypeId: "key_facts_statement",
    customDocumentName: "",
    triggerSummary: "Before purchase",
    templateCode: "TMPL-KFS-2025",
    requirementStatus: "mandatory",
    notes: "Regulatory pack bundle",
    active: "Yes",
  },
  {
    id: "demo-doc-schedule",
    documentTypeId: "policy_schedule",
    customDocumentName: "",
    triggerSummary: "Policy issuance",
    templateCode: "TMPL-SCHED-ILP",
    requirementStatus: "mandatory",
    notes: "",
    active: "Yes",
  },
  {
    id: "demo-doc-commission",
    documentTypeId: "commission_statement",
    customDocumentName: "",
    triggerSummary: "Monthly distributor settlement",
    templateCode: "TMPL-COMM-MTH",
    requirementStatus: "optional",
    notes: "",
    active: "Yes",
  },
];
