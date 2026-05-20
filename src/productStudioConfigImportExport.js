/**
 * Product Studio — per-tab CSV template download and file upload for configuration.
 */

import {
  DURATION_ELIGIBILITY_CONFIG_TAB_IDS,
  DURATION_ELIGIBILITY_RULE_IDS,
  DURATION_ELIGIBILITY_TAB_RULE_IDS,
  getDurationEligibilityRuleLabel,
} from "./productStudioConfiguration.js";

const DURATION_ELIGIBILITY_CSV_HEADERS = ["rule_id", "value"];

const TEMPLATE_HEADERS = {
  "duration-eligibility": DURATION_ELIGIBILITY_CSV_HEADERS,
  "policy-term-coverage": DURATION_ELIGIBILITY_CSV_HEADERS,
  "benefit-premium": DURATION_ELIGIBILITY_CSV_HEADERS,
  "underwriting-eligibility": DURATION_ELIGIBILITY_CSV_HEADERS,
  "core-benefits": ["benefitName", "benefitType", "mandatoryOptional", "calculationMethod", "benefitTrigger", "active"],
  riders: ["riderName", "enabled", "description"],
  "table-structure-design": ["table_id", "variable_key", "enabled"],
  charges: ["chargeTypeId", "customChargeName", "description", "basisType", "basisValue", "billingFrequency", "active"],
  funds: ["fundName", "fundCode", "fundType", "currency", "riskRating", "fundStatus", "active"],
  "policy-servicing": ["featureTypeId", "customFeatureName", "description", "allowedAs", "effectiveTiming", "active"],
  "underwriting-rules": ["conditionTypeId", "conditionNarrative", "outcomeType", "outcomeDetail", "priority", "active"],
  "medical-matrix": ["ageBand", "sumAssuredBand", "requirement", "active"],
  "commission-distribution": ["field", "value"],
  "document-templates": ["documentTypeId", "customDocumentName", "triggerSummary", "templateCode", "requirementStatus", "active"],
};

function escapeCsvCell(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers, rows = []) {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(","));
  }
  return lines.join("\n");
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 1) {
    return { headers: [], rows: [] };
  }
  const parseLine = (line) => {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') {
          inQ = false;
        } else {
          cur += c;
        }
      } else if (c === '"') {
        inQ = true;
      } else if (c === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function triggerDownload(filename, content, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** @param {string} tabId */
export function downloadConfigTabTemplate(tabId, productCode = "product") {
  const headers = TEMPLATE_HEADERS[tabId];
  if (!headers) {
    window.alert("No template available for this section.");
    return;
  }
  let exampleRows = [];
  if (DURATION_ELIGIBILITY_CONFIG_TAB_IDS.includes(tabId)) {
    const ids = DURATION_ELIGIBILITY_TAB_RULE_IDS[tabId] || DURATION_ELIGIBILITY_RULE_IDS;
    exampleRows = ids.slice(0, 3).map((id) => ({
      rule_id: id,
      value: "",
    }));
  }
  const csv = rowsToCsv(headers, exampleRows);
  const safeCode = String(productCode || "product")
    .trim()
    .replace(/[^\w-]+/g, "-")
    .toLowerCase();
  triggerDownload(`${safeCode}-${tabId}-template.csv`, csv);
}

/**
 * @param {string} tabId
 * @param {string} text
 * @param {string} [filename]
 */
export function parseConfigTabUpload(tabId, text, filename = "") {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".json")) {
    const data = JSON.parse(text);
    return { kind: "json", data };
  }
  const headers = TEMPLATE_HEADERS[tabId];
  if (!headers) {
    throw new Error("Upload is not supported for this section.");
  }
  const { rows } = parseCsv(text);
  if (rows.length === 0) {
    throw new Error("The file has no data rows.");
  }
  return { kind: "csv", rows, tabId };
}

/** Map parsed upload to draft patch payload per tab. */
export function configUploadToPatch(tabId, parsed) {
  if (parsed.kind === "json" && parsed.data) {
    return parsed.data;
  }
  const rows = parsed.rows || [];
  if (DURATION_ELIGIBILITY_CONFIG_TAB_IDS.includes(tabId)) {
    const overrides = {};
    for (const r of rows) {
      const id = r.rule_id || r.ruleId;
      if (id && r.value != null && String(r.value).trim() !== "") {
        overrides[id] = String(r.value).trim();
      }
    }
    return { overrides };
  }
  switch (tabId) {
    case "core-benefits":
      return {
        items: rows.map((r) => ({
          benefitName: r.benefitName || "",
          benefitType: r.benefitType || "",
          mandatoryOptional: r.mandatoryOptional || "",
          calculationMethod: r.calculationMethod || "",
          benefitTrigger: r.benefitTrigger || "",
          active: r.active === "No" ? "No" : "Yes",
        })),
      };
    case "charges":
      return {
        items: rows.map((r) => ({
          chargeTypeId: r.chargeTypeId || "",
          customChargeName: r.customChargeName || "",
          description: r.description || "",
          basisType: r.basisType || "",
          basisValue: r.basisValue || "",
          billingFrequency: r.billingFrequency || "",
          appliesWhen: r.appliesWhen || "",
          notes: r.notes || "",
          active: r.active === "No" ? "No" : "Yes",
        })),
      };
    case "funds":
      return {
        items: rows.map((r) => ({
          fundName: r.fundName || "",
          fundCode: r.fundCode || "",
          fundType: r.fundType || "",
          currency: r.currency || "",
          riskRating: r.riskRating || "",
          fundStatus: r.fundStatus || "",
          shariaCompliant: r.shariaCompliant || "",
          guaranteeApplicable: r.guaranteeApplicable || "",
          navFrequency: r.navFrequency || "",
          minAllocationPct: r.minAllocationPct || "",
          maxAllocationPct: r.maxAllocationPct || "",
        })),
      };
    case "policy-servicing":
      return {
        items: rows.map((r) => ({
          featureTypeId: r.featureTypeId || "",
          customFeatureName: r.customFeatureName || "",
          description: r.description || "",
          allowedAs: r.allowedAs || "",
          effectiveTiming: r.effectiveTiming || "",
          uwRequired: r.uwRequired || "",
          notes: r.notes || "",
          active: r.active === "No" ? "No" : "Yes",
        })),
      };
    case "underwriting-rules":
      return {
        items: rows.map((r) => ({
          conditionTypeId: r.conditionTypeId || "",
          customConditionName: r.customConditionName || "",
          conditionNarrative: r.conditionNarrative || "",
          outcomeType: r.outcomeType || "",
          outcomeDetail: r.outcomeDetail || "",
          priority: r.priority || "",
          active: r.active === "No" ? "No" : "Yes",
        })),
      };
    case "medical-matrix":
      return {
        items: rows.map((r) => ({
          ageBand: r.ageBand || "",
          sumAssuredBand: r.sumAssuredBand || "",
          requirement: r.requirement || "",
          notes: r.notes || "",
          active: r.active === "No" ? "No" : "Yes",
        })),
      };
    case "commission-distribution": {
      const flat = {};
      for (const r of rows) {
        if (r.field) {
          flat[r.field] = r.value ?? "";
        }
      }
      return flat;
    }
    case "document-templates":
      return {
        items: rows.map((r) => ({
          documentTypeId: r.documentTypeId || "",
          customDocumentName: r.customDocumentName || "",
          triggerSummary: r.triggerSummary || "",
          templateCode: r.templateCode || "",
          requirementStatus: r.requirementStatus || "",
          notes: r.notes || "",
          active: r.active === "No" ? "No" : "Yes",
        })),
      };
    case "table-structure-design":
      throw new Error("For table structure design, upload a JSON file or use the form.");
    case "riders":
      throw new Error("For riders, upload a JSON file or configure riders in the form.");
    default:
      throw new Error("Upload is not supported for this section.");
  }
}

export function durationEligibilityTemplateHint() {
  return DURATION_ELIGIBILITY_RULE_IDS.map((id) => `${id} (${getDurationEligibilityRuleLabel(id)})`).join(", ");
}
