import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  defaultSegmentFilter,
  facetKeyFromFacets,
  facetValuesList,
  normalizeFacetObject,
  scenarioMatchesSegmentFilter,
  segmentFilterIsActive,
} from "./productStudioRateSegmentFacets.js";
import { uid } from "./productStudioStore.js";

export const RATE_AGE_MIN = 18;
export const RATE_AGE_MAX = 100;

export const RATE_POLICY_DURATION_MIN = 1;
export const RATE_POLICY_DURATION_MAX = 100;

/** @typedef {{ key: string, columnLabel: string, min: number, max: number, curveTitle: string, addRowLabel: string, rowCountLabel: string, csvColumn: string, csvAliases?: string[] }} RateRowAxis */

/** @type {RateRowAxis} */
export const DEFAULT_ROW_AXIS = {
  key: "age",
  columnLabel: "Age",
  min: RATE_AGE_MIN,
  max: RATE_AGE_MAX,
  curveTitle: "Rate by age (this segment)",
  addRowLabel: "Add age row",
  rowCountLabel: "age row",
  csvColumn: "age",
};

/** @type {RateRowAxis} */
export const POLICY_DURATION_ROW_AXIS = {
  key: "policy_duration",
  columnLabel: "Policy Duration",
  min: RATE_POLICY_DURATION_MIN,
  max: RATE_POLICY_DURATION_MAX,
  curveTitle: "Rate by policy duration (this segment)",
  addRowLabel: "Add policy year row",
  rowCountLabel: "policy year row",
  csvColumn: "policy_duration",
  csvAliases: ["policy_duration", "duration", "year"],
};

export const RATE_VALUE_TYPE_OPTIONS = [
  { value: "Percentage %", label: "Percentage %" },
  { value: "Rate", label: "Rate" },
  { value: "Fixed Amount", label: "Fixed Amount" },
];

export const DEFAULT_RATE_VALUE_TYPE = RATE_VALUE_TYPE_OPTIONS[1].value;

const RATE_CSV_VALUE_HEADERS = ["value_type", "rate"];

function rateRowRange(rowAxis) {
  return Array.from({ length: rowAxis.max - rowAxis.min + 1 }, (_, i) => rowAxis.min + i);
}

function rateCsvHeaders(rowAxis) {
  return [rowAxis.csvColumn, ...RATE_CSV_VALUE_HEADERS];
}

export function defaultRateRows(rowAxis = DEFAULT_ROW_AXIS) {
  return rateRowRange(rowAxis).map((period) => ({
    id: uid(),
    [rowAxis.key]: String(period),
    value_type: DEFAULT_RATE_VALUE_TYPE,
    rate: "",
  }));
}

export function defaultAgeRateRows() {
  return defaultRateRows(DEFAULT_ROW_AXIS);
}

export function coerceRateValueType(value) {
  const v = String(value ?? "").trim();
  const found = RATE_VALUE_TYPE_OPTIONS.find((o) => o.value === v);
  return found ? found.value : DEFAULT_RATE_VALUE_TYPE;
}

export function normalizeRateRows(rows, rowAxis = DEFAULT_ROW_AXIS) {
  const byPeriod = new Map();
  for (const row of rows) {
    const period = String(row[rowAxis.key] ?? row.age ?? "").trim();
    if (!period) {
      continue;
    }
    byPeriod.set(period, row);
  }
  return rateRowRange(rowAxis).map((period) => {
    const existing = byPeriod.get(String(period));
    if (existing) {
      return {
        ...existing,
        [rowAxis.key]: String(period),
        value_type: coerceRateValueType(existing.value_type),
        rate: existing.rate != null && existing.rate !== "" ? String(existing.rate) : "",
      };
    }
    return { id: uid(), [rowAxis.key]: String(period), value_type: DEFAULT_RATE_VALUE_TYPE, rate: "" };
  });
}

export function normalizeAgeRateRows(rows) {
  return normalizeRateRows(rows, DEFAULT_ROW_AXIS);
}

function escapeCsvCell(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rateRowsToCsv(rows, rowAxis) {
  const headers = rateCsvHeaders(rowAxis);
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(
      headers.map((h) => {
        if (h === "value_type") {
          return escapeCsvCell(row.value_type ?? DEFAULT_RATE_VALUE_TYPE);
        }
        if (h === rowAxis.csvColumn) {
          return escapeCsvCell(row[rowAxis.key] ?? row.age ?? "");
        }
        return escapeCsvCell(row[h]);
      }).join(","),
    );
  }
  return lines.join("\n");
}

function parseRateCsv(text, rowAxis) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    throw new Error("File must include a header row and at least one data row.");
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
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const periodAliases = [rowAxis.csvColumn, ...(rowAxis.csvAliases ?? [])].map((h) => h.toLowerCase());
  const periodIdx = headers.findIndex((h) => periodAliases.includes(h));
  const typeIdx = headers.indexOf("value_type");
  const rateIdx = headers.indexOf("rate");
  if (periodIdx === -1 || rateIdx === -1) {
    throw new Error(`CSV must include "${rowAxis.csvColumn}" and "rate" columns.`);
  }
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    return {
      id: uid(),
      [rowAxis.key]: cells[periodIdx] ?? "",
      value_type: coerceRateValueType(typeIdx >= 0 ? cells[typeIdx] : DEFAULT_RATE_VALUE_TYPE),
      rate: cells[rateIdx] ?? "",
    };
  });
}

function triggerFileDownload(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SegmentEditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function SegmentRemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function RateRowFileActions({ rows, segmentLabel, csvFilePrefix, rowAxis, onUpload }) {
  const fileRef = useRef(null);

  const downloadTemplate = () => {
    const exampleRows =
      rows.length > 0
        ? rows.map((r) => ({
            [rowAxis.key]: r[rowAxis.key] ?? r.age ?? "",
            value_type: r.value_type ?? DEFAULT_RATE_VALUE_TYPE,
            rate: r.rate,
          }))
        : [{ [rowAxis.key]: String(rowAxis.min), value_type: DEFAULT_RATE_VALUE_TYPE, rate: "" }];
    const safeLabel = String(segmentLabel || "segment")
      .trim()
      .replace(/[^\w-]+/g, "-")
      .toLowerCase()
      .slice(0, 48);
    triggerFileDownload(`${csvFilePrefix}-${safeLabel || "segment"}.csv`, rateRowsToCsv(exampleRows, rowAxis));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseRateCsv(String(reader.result ?? ""), rowAxis);
        if (!parsed.length) {
          throw new Error("No data rows found in file.");
        }
        onUpload(parsed);
      } catch (err) {
        window.alert(err?.message || "Could not read file.");
      }
      e.target.value = "";
    };
    reader.onerror = () => {
      window.alert("Could not read file.");
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="psc-config-tab-file-actions">
      <button type="button" className="secondary-button" onClick={downloadTemplate}>
        Download template
      </button>
      <button type="button" className="secondary-button" onClick={() => fileRef.current?.click()}>
        Upload file
      </button>
      <input ref={fileRef} type="file" className="psc-config-file-input" accept=".csv,text/csv" onChange={onFileChange} hidden />
    </div>
  );
}

function PscConfirmDialog({ open, title, message, detail, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="psc-benefit-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="psc-benefit-dialog psc-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="psc-confirm-dialog-title"
        aria-describedby="psc-confirm-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="psc-benefit-dialog-header">
          <h2 id="psc-confirm-dialog-title" className="psc-benefit-dialog-title">
            {title}
          </h2>
          <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={onCancel}>
            ×
          </button>
        </header>
        <div className="psc-benefit-dialog-body psc-confirm-dialog-body">
          <p id="psc-confirm-dialog-desc" className="psc-confirm-dialog-message">
            {message}
          </p>
          {detail ? <p className="psc-confirm-dialog-detail">{detail}</p> : null}
          <div className="psc-benefit-dialog-footer psc-confirm-dialog-footer">
            <button type="button" className="psc-button-danger" onClick={onConfirm}>
              {confirmLabel}
            </button>
            <button type="button" className="secondary-button" onClick={onCancel}>
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * @param {{
 *   matrixTitle: string,
 *   segmentsAriaLabel: string,
 *   facetKeys: string[],
 *   initialScenarios: { scenarios: object[], activeId: string },
 *   defaultFacets: () => object,
 *   facetKey: (facets: object) => string,
 *   FacetFields: import("react").ComponentType<{ facets: object, onPatch: (key: string, value: string) => void, filterMode?: boolean }>,
 *   pillLabel: (facets: object) => string,
 *   titleLabel: (facets: object) => string,
 *   csvFilePrefix: string,
 *   dialogIdPrefix: string,
 *   labels: {
 *     addSegmentDialog: string,
 *     editSegmentDialog: string,
 *     removeSegmentTitle: string,
 *     removeSegmentMessage: string,
 *   },
 *   rowAxis?: RateRowAxis,
 * }} config
 */
export function RateSegmentTablePanel({ config }) {
  const {
    matrixTitle,
    segmentsAriaLabel,
    facetKeys,
    initialScenarios,
    defaultFacets,
    facetKey,
    FacetFields,
    pillLabel,
    titleLabel,
    csvFilePrefix,
    dialogIdPrefix,
    labels,
    rowAxis = DEFAULT_ROW_AXIS,
  } = config;

  const [scenarios, setScenarios] = useState(initialScenarios.scenarios);
  const [activeId, setActiveId] = useState(initialScenarios.activeId);
  const [segmentDialogMode, setSegmentDialogMode] = useState(null);
  const [segmentEditingId, setSegmentEditingId] = useState(null);
  const [draftFacets, setDraftFacets] = useState(() => defaultFacets());
  const [segmentRemoveTarget, setSegmentRemoveTarget] = useState(null);
  const [segmentFilterOpen, setSegmentFilterOpen] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState(() => defaultSegmentFilter(facetKeys));
  const [draftSegmentFilter, setDraftSegmentFilter] = useState(() => defaultSegmentFilter(facetKeys));

  const activeScenario = useMemo(() => scenarios.find((s) => s.id === activeId) ?? scenarios[0], [scenarios, activeId]);

  const filteredScenarios = useMemo(() => {
    if (!segmentFilterIsActive(segmentFilter, facetKeys)) {
      return scenarios;
    }
    return scenarios.filter((s) => scenarioMatchesSegmentFilter(s.facets, segmentFilter, facetKeys));
  }, [scenarios, segmentFilter, facetKeys]);

  const segmentFilterActive = segmentFilterIsActive(segmentFilter, facetKeys);

  useEffect(() => {
    if (!filteredScenarios.length) {
      return;
    }
    if (!filteredScenarios.some((s) => s.id === activeId)) {
      setActiveId(filteredScenarios[0].id);
    }
  }, [filteredScenarios, activeId]);

  const closeSegmentFilterDialog = () => setSegmentFilterOpen(false);

  const openSegmentFilterDialog = () => {
    setDraftSegmentFilter({ ...segmentFilter });
    setSegmentFilterOpen(true);
  };

  const applySegmentFilter = () => {
    setSegmentFilter({ ...draftSegmentFilter });
    closeSegmentFilterDialog();
  };

  const clearSegmentFilter = () => {
    const empty = defaultSegmentFilter(facetKeys);
    setDraftSegmentFilter(empty);
    setSegmentFilter(empty);
    closeSegmentFilterDialog();
  };

  const patchDraftSegmentFilter = (key, value) => {
    setDraftSegmentFilter((d) => ({ ...d, [key]: value }));
  };

  const closeSegmentDialog = () => {
    setSegmentDialogMode(null);
    setSegmentEditingId(null);
  };

  useEffect(() => {
    if (!segmentDialogMode && !segmentRemoveTarget && !segmentFilterOpen) {
      return undefined;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (segmentRemoveTarget) {
          setSegmentRemoveTarget(null);
        } else if (segmentFilterOpen) {
          closeSegmentFilterDialog();
        } else {
          closeSegmentDialog();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [segmentDialogMode, segmentRemoveTarget, segmentFilterOpen]);

  const openAddSegmentDialog = () => {
    setDraftFacets({ ...defaultFacets() });
    setSegmentEditingId(null);
    setSegmentDialogMode("add");
  };

  const openEditSegmentDialog = (scenario) => {
    setActiveId(scenario.id);
    setDraftFacets(normalizeFacetObject(scenario.facets, facetKeys));
    setSegmentEditingId(scenario.id);
    setSegmentDialogMode("edit");
  };

  const saveSegmentDialog = () => {
    const normalized = normalizeFacetObject(draftFacets, facetKeys);
    const missing = facetKeys.filter((k) => facetValuesList(normalized[k]).length === 0);
    if (missing.length) {
      window.alert("Select at least one value for each segment field.");
      return;
    }
    const k = facetKeyFromFacets(normalized, facetKeys);
    const conflict = scenarios.find((s) => facetKeyFromFacets(s.facets, facetKeys) === k && s.id !== segmentEditingId);
    if (conflict) {
      window.alert("Another segment already uses this combination. Change at least one value.");
      return;
    }
    if (segmentDialogMode === "add") {
      const newScenario = {
        id: uid(),
        facets: normalized,
        rows: defaultRateRows(rowAxis),
      };
      setScenarios((prev) => [...prev, newScenario]);
      setActiveId(newScenario.id);
    } else if (segmentDialogMode === "edit" && segmentEditingId) {
      setScenarios((prev) => prev.map((s) => (s.id === segmentEditingId ? { ...s, facets: normalized } : s)));
    }
    closeSegmentDialog();
  };

  const patchDraftFacet = (key, value) => {
    setDraftFacets((d) => ({ ...d, [key]: value }));
  };

  const patchAgeRateRow = (rowId, key, value) => {
    if (!activeScenario) {
      return;
    }
    setScenarios((prev) =>
      prev.map((s) =>
        s.id !== activeId
          ? s
          : {
              ...s,
              rows: s.rows.map((r) => (r.id === rowId ? { ...r, [key]: value } : r)),
            },
      ),
    );
  };

  const addAgeRow = () => {
    if (!activeScenario) {
      return;
    }
    setScenarios((prev) =>
      prev.map((s) =>
        s.id !== activeId
          ? s
          : {
              ...s,
              rows: [...s.rows, { id: uid(), [rowAxis.key]: "", value_type: DEFAULT_RATE_VALUE_TYPE, rate: "" }],
            },
      ),
    );
  };

  const removeAgeRow = (rowId) => {
    if (!activeScenario || activeScenario.rows.length <= 1) {
      return;
    }
    setScenarios((prev) => prev.map((s) => (s.id !== activeId ? s : { ...s, rows: s.rows.filter((r) => r.id !== rowId) })));
  };

  const requestRemoveSegment = (scenario) => {
    if (scenarios.length <= 1) {
      return;
    }
    setSegmentRemoveTarget(scenario);
  };

  const confirmRemoveSegment = () => {
    if (!segmentRemoveTarget || scenarios.length <= 1) {
      setSegmentRemoveTarget(null);
      return;
    }
    const scenario = segmentRemoveTarget;
    setScenarios((prev) => prev.filter((s) => s.id !== scenario.id));
    if (activeId === scenario.id) {
      const next = scenarios.filter((s) => s.id !== scenario.id);
      setActiveId(next[0]?.id ?? "");
    }
    if (segmentEditingId === scenario.id) {
      closeSegmentDialog();
    }
    setSegmentRemoveTarget(null);
  };

  const uploadAgeRateRows = (nextRows) => {
    if (!activeScenario) {
      return;
    }
    setScenarios((prev) =>
      prev.map((s) =>
        s.id !== activeId
          ? s
          : {
              ...s,
              rows: normalizeRateRows(
                nextRows.map((r) => ({
                  id: r.id || uid(),
                  [rowAxis.key]: String(r[rowAxis.key] ?? r.age ?? ""),
                  value_type: coerceRateValueType(r.value_type),
                  rate: r.rate != null ? String(r.rate) : "",
                })),
                rowAxis,
              ),
            },
      ),
    );
  };

  const curveRows = activeScenario?.rows ?? [];
  const activeSegmentLabel = activeScenario ? pillLabel(activeScenario.facets) : "";
  const activeSegmentTitle = activeScenario ? titleLabel(activeScenario.facets) : "";

  const segmentDialogTitle = segmentDialogMode === "add" ? labels.addSegmentDialog : labels.editSegmentDialog;
  const segmentDialogNode =
    segmentDialogMode &&
    typeof document !== "undefined" &&
    createPortal(
      <div className="psc-benefit-dialog-backdrop" role="presentation" onClick={closeSegmentDialog}>
        <div
          className="psc-benefit-dialog psc-mortality-segment-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${dialogIdPrefix}-segment-dialog-title`}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id={`${dialogIdPrefix}-segment-dialog-title`} className="psc-benefit-dialog-title">
              {segmentDialogTitle}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeSegmentDialog}>
              ×
            </button>
          </header>
          <div className="psc-benefit-dialog-body">
            <div className="psc-field-section">
              <h2 className="psc-field-section-title">Segment definition</h2>
              <FacetFields facets={draftFacets} onPatch={patchDraftFacet} />
            </div>
            <div className="psc-field-section">
              <h2 className="psc-field-section-title">Save segment</h2>
              <div className="psc-benefit-dialog-footer">
                <button type="button" className="primary-button" onClick={saveSegmentDialog}>
                  {segmentDialogMode === "add" ? "Add segment" : "Save changes"}
                </button>
                <button type="button" className="secondary-button" onClick={closeSegmentDialog}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  const segmentFilterDialogNode =
    segmentFilterOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div className="psc-benefit-dialog-backdrop" role="presentation" onClick={closeSegmentFilterDialog}>
        <div
          className="psc-benefit-dialog psc-mortality-segment-dialog psc-mortality-segment-filter-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${dialogIdPrefix}-segment-filter-dialog-title`}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id={`${dialogIdPrefix}-segment-filter-dialog-title`} className="psc-benefit-dialog-title">
              Search segments
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeSegmentFilterDialog}>
              ×
            </button>
          </header>
          <div className="psc-benefit-dialog-body">
            <p className="psc-mortality-segment-filter-hint">Filter the segment list using facet multiselects. Leave a field empty (All) to ignore it.</p>
            <div className="psc-field-section">
              <h2 className="psc-field-section-title">Segment criteria</h2>
              <FacetFields facets={draftSegmentFilter} onPatch={patchDraftSegmentFilter} filterMode />
            </div>
            <div className="psc-field-section">
              <div className="psc-benefit-dialog-footer">
                <button type="button" className="primary-button" onClick={applySegmentFilter}>
                  Apply filters
                </button>
                <button type="button" className="secondary-button" onClick={clearSegmentFilter}>
                  Clear all
                </button>
                <button type="button" className="secondary-button" onClick={closeSegmentFilterDialog}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  const segmentCountLabel = segmentFilterActive
    ? `${filteredScenarios.length} of ${scenarios.length} segment${scenarios.length === 1 ? "" : "s"}`
    : `${scenarios.length} segment${scenarios.length === 1 ? "" : "s"}`;

  return (
    <div className="psc-benefit-rate-panels psc-benefit-rate-panels--full-width">
      <div className="psc-benefit-matrix-block">
        <div className="psc-benefit-matrix-toolbar">
          <h3 className="psc-benefit-matrix-subtitle psc-benefit-matrix-subtitle--inline">{matrixTitle}</h3>
          <span className="psc-benefit-matrix-row-count">
            {segmentCountLabel} · {curveRows.length} {rowAxis.rowCountLabel}
            {curveRows.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="psc-mortality-segment-layout">
          <aside className="psc-mortality-segment-sidebar">
            <div className="psc-mortality-segment-sidebar-head">
              <h4 className="psc-mortality-segment-sidebar-title">Segment</h4>
              <div className="psc-mortality-segment-sidebar-head-actions">
                <button
                  type="button"
                  className={`secondary-button psc-mortality-segment-search-btn${segmentFilterActive ? " is-active" : ""}`}
                  onClick={openSegmentFilterDialog}
                  aria-label={segmentFilterActive ? "Search segments (filters active)" : "Search segments"}
                >
                  Search
                </button>
                <button type="button" className="secondary-button psc-mortality-segment-add-btn" onClick={openAddSegmentDialog}>
                  Add segment
                </button>
              </div>
            </div>
            <div className="psc-mortality-segment-sidebar-list" role="tablist" aria-label={segmentsAriaLabel}>
              {filteredScenarios.length === 0 ? (
                <p className="psc-mortality-segment-sidebar-empty">No segments match these filters.</p>
              ) : (
                filteredScenarios.map((s) => (
                  <div
                    key={s.id}
                    className={`psc-mortality-segment-sidebar-item${s.id === activeId ? " is-active" : ""}`}
                    role="presentation"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={s.id === activeId}
                      className="psc-mortality-segment-sidebar-select"
                      onClick={() => setActiveId(s.id)}
                    >
                      {pillLabel(s.facets)}
                    </button>
                    <div className="psc-mortality-segment-sidebar-actions">
                      <button
                        type="button"
                        className="psc-mortality-segment-icon-btn"
                        aria-label={`Edit segment ${pillLabel(s.facets)}`}
                        title="Edit segment"
                        onClick={() => openEditSegmentDialog(s)}
                      >
                        <SegmentEditIcon />
                      </button>
                      <button
                        type="button"
                        className="psc-mortality-segment-icon-btn psc-mortality-segment-icon-btn--danger"
                        aria-label={`Remove segment ${pillLabel(s.facets)}`}
                        title="Remove segment"
                        disabled={scenarios.length <= 1}
                        onClick={() => requestRemoveSegment(s)}
                      >
                        <SegmentRemoveIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="psc-mortality-segment-main">
            {activeSegmentTitle ? <h3 className="psc-mortality-segment-active-title">{activeSegmentTitle}</h3> : null}
            <div className="psc-benefit-matrix-toolbar psc-benefit-matrix-toolbar--nested">
              <h4 className="psc-mortality-curve-title">{rowAxis.curveTitle}</h4>
              <div className="psc-mortality-curve-toolbar-actions">
                <RateRowFileActions
                  rows={curveRows}
                  segmentLabel={activeSegmentLabel}
                  csvFilePrefix={csvFilePrefix}
                  rowAxis={rowAxis}
                  onUpload={uploadAgeRateRows}
                />
                <button type="button" className="secondary-button" onClick={addAgeRow}>
                  {rowAxis.addRowLabel}
                </button>
              </div>
            </div>
            <div className="psc-benefit-matrix-table-wrap psc-benefit-matrix-table-wrap--config">
              <table className="psc-benefit-matrix-table psc-benefit-matrix-table--config psc-benefit-matrix-table--age-rate">
                <thead>
                  <tr>
                    <th scope="col">{rowAxis.columnLabel}</th>
                    <th scope="col">Value type</th>
                    <th scope="col">Rate</th>
                    <th scope="col" className="psc-benefit-matrix-col-actions">
                      <span className="psc-visually-hidden">Row actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {curveRows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input
                          className="psc-input psc-benefit-matrix-cell-input"
                          type="number"
                          inputMode="numeric"
                          min={rowAxis.min}
                          max={rowAxis.max}
                          value={r[rowAxis.key] ?? r.age ?? ""}
                          onChange={(e) => patchAgeRateRow(r.id, rowAxis.key, e.target.value)}
                          aria-label={rowAxis.columnLabel}
                        />
                      </td>
                      <td>
                        <div className="psc-benefit-matrix-dd">
                          <DropdownSelect
                            variant="psc"
                            className="dd--compact"
                            value={r.value_type ?? DEFAULT_RATE_VALUE_TYPE}
                            onChange={(v) => patchAgeRateRow(r.id, "value_type", v)}
                            options={RATE_VALUE_TYPE_OPTIONS}
                            aria-label="Value type"
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          className="psc-input psc-benefit-matrix-cell-input psc-benefit-matrix-num-input"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          value={r.rate}
                          onChange={(e) => patchAgeRateRow(r.id, "rate", e.target.value)}
                          aria-label="Rate"
                        />
                      </td>
                      <td className="psc-benefit-matrix-actions-cell">
                        <button
                          type="button"
                          className="secondary-button psc-benefit-matrix-remove-btn"
                          onClick={() => removeAgeRow(r.id)}
                          disabled={curveRows.length <= 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {segmentDialogNode}
      {segmentFilterDialogNode}
      <PscConfirmDialog
        open={Boolean(segmentRemoveTarget)}
        title={labels.removeSegmentTitle}
        message={labels.removeSegmentMessage}
        detail={segmentRemoveTarget ? pillLabel(segmentRemoveTarget.facets) : ""}
        confirmLabel="Remove segment"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveSegment}
        onCancel={() => setSegmentRemoveTarget(null)}
      />
    </div>
  );
}
