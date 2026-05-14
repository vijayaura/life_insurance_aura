import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  DEMO_POLICY_SERVICING_LIST,
  SERVICING_ALLOWED_AS,
  SERVICING_FEATURE_CATALOG,
  SERVICING_UW_OPTIONS,
  YES_NO_ACTIVE,
  emptyServicingRuleForm,
  getServicingCatalogEntry,
  normalizePolicyServicingConfiguration,
} from "./productStudioPolicyServicing.js";
import { uid } from "./productStudioStore.js";

const FEATURE_SELECT_OPTIONS = SERVICING_FEATURE_CATALOG.map((c) => ({ value: c.id, label: c.featureName }));

function labelForOption(options, value) {
  const o = options.find((x) => x.value === value);
  return o?.label || value || "—";
}

function ServicingRuleDialogForm({ form, patchForm, onSave, onCancel, saveLabel, onFeatureTypeChange }) {
  const isCustom = form.featureTypeId === "custom";
  return (
    <div className="psc-benefit-dialog-body">
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Feature</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Servicing feature</span>
            <DropdownSelect
              variant="psc"
              value={form.featureTypeId}
              onChange={onFeatureTypeChange}
              options={FEATURE_SELECT_OPTIONS}
              placeholder="Select feature"
            />
          </label>
          {isCustom ? (
            <label className="psc-field psc-field-wide">
              <span className="psc-field-label">Custom rule name</span>
              <input
                className="psc-input"
                type="text"
                value={form.customFeatureName}
                onChange={(e) => patchForm("customFeatureName", e.target.value)}
                placeholder="e.g. Portability request"
              />
            </label>
          ) : null}
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Description</span>
            <span className="psc-field-hint">What must be configured for this product (defaults from catalog when you pick a feature).</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.description}
              onChange={(e) => patchForm("description", e.target.value)}
              placeholder="Rule summary for underwriters"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Product treatment</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Allowed as</span>
            <DropdownSelect variant="psc" value={form.allowedAs} onChange={(v) => patchForm("allowedAs", v)} options={SERVICING_ALLOWED_AS} placeholder="Select" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Underwriting</span>
            <DropdownSelect variant="psc" value={form.uwRequired} onChange={(v) => patchForm("uwRequired", v)} options={SERVICING_UW_OPTIONS} placeholder="Select" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Effective / timing</span>
            <span className="psc-field-hint">Durations, lock-in, windows, anniversaries</span>
            <input
              className="psc-input"
              type="text"
              value={form.effectiveTiming}
              onChange={(e) => patchForm("effectiveTiming", e.target.value)}
              placeholder="e.g. After policy year 3; cooling-off 30 days"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Status & notes</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Active</span>
            <DropdownSelect variant="psc" value={form.active} onChange={(v) => patchForm("active", v)} options={YES_NO_ACTIVE} placeholder="Select" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Notes</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.notes}
              onChange={(e) => patchForm("notes", e.target.value)}
              placeholder="Regulatory references, caps, exceptions"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section psc-benefit-dialog-actions-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Save rule</h3>
        <div className="psc-benefit-dialog-footer">
          <button type="button" className="primary-button" onClick={onSave}>
            {saveLabel}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function displayFeatureTitle(row) {
  if (row.featureTypeId === "custom" && row.customFeatureName) {
    return row.customFeatureName;
  }
  const cat = getServicingCatalogEntry(row.featureTypeId);
  return cat?.featureName || row.featureTypeId || "Rule";
}

/**
 * @param {unknown} policyServicing
 * @param {(next: object) => void} onPolicyServicingChange — receives normalized `{ items }`.
 */
export function ProductStudioPolicyServicingPanel({ policyServicing, onPolicyServicingChange }) {
  const list = useMemo(() => normalizePolicyServicingConfiguration(policyServicing).items, [policyServicing]);
  const hasSaved = list.length > 0;
  const displayList = hasSaved ? list : DEMO_POLICY_SERVICING_LIST;
  const listIsMock = !hasSaved;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyServicingRuleForm());

  const emit = useCallback(
    (nextItems) => {
      onPolicyServicingChange(normalizePolicyServicingConfiguration({ items: nextItems }));
    },
    [onPolicyServicingChange],
  );

  const patchForm = useCallback((key, v) => {
    setForm((f) => ({ ...f, [key]: v }));
  }, []);

  const resetDialog = useCallback(() => {
    setEditingId(null);
    setForm(emptyServicingRuleForm());
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    resetDialog();
  }, [resetDialog]);

  useEffect(() => {
    if (!dialogOpen) {
      return undefined;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeDialog();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialogOpen, closeDialog]);

  const onFeatureTypeChange = useCallback((featureTypeId) => {
    const cat = getServicingCatalogEntry(featureTypeId);
    setForm((f) => ({
      ...f,
      featureTypeId,
      description: cat && featureTypeId !== "custom" ? cat.catalogDescription : f.description,
      customFeatureName: featureTypeId === "custom" ? f.customFeatureName : "",
    }));
  }, []);

  const openCreate = useCallback(() => {
    resetDialog();
    setForm(emptyServicingRuleForm());
    setDialogOpen(true);
  }, [resetDialog]);

  const openEdit = useCallback(
    (id) => {
      const persisted = list.find((x) => x.id === id);
      const demo = DEMO_POLICY_SERVICING_LIST.find((x) => x.id === id);
      const row = persisted || demo;
      if (!row) {
        return;
      }
      setEditingId(persisted ? id : null);
      setForm({
        featureTypeId: row.featureTypeId || "",
        customFeatureName: row.customFeatureName || "",
        description: row.description || "",
        allowedAs: row.allowedAs || "",
        effectiveTiming: row.effectiveTiming || "",
        uwRequired: row.uwRequired || "",
        notes: row.notes || "",
        active: row.active === "No" ? "No" : "Yes",
      });
      setDialogOpen(true);
    },
    [list],
  );

  const saveRule = useCallback(() => {
    if (!form.featureTypeId) {
      window.alert("Select a servicing feature.");
      return;
    }
    if (form.featureTypeId === "custom" && !form.customFeatureName?.trim()) {
      window.alert("Custom rule name is required.");
      return;
    }
    const row = {
      id: editingId || uid(),
      featureTypeId: form.featureTypeId,
      customFeatureName: form.customFeatureName?.trim() || "",
      description: form.description?.trim() || "",
      allowedAs: form.allowedAs?.trim() || "",
      effectiveTiming: form.effectiveTiming?.trim() || "",
      uwRequired: form.uwRequired?.trim() || "",
      notes: form.notes?.trim() || "",
      active: form.active === "No" ? "No" : "Yes",
    };
    const next = editingId ? list.map((x) => (x.id === editingId ? row : x)) : [...list, row];
    emit(next);
    closeDialog();
  }, [closeDialog, editingId, emit, form, list]);

  const removeItem = useCallback(
    (id) => {
      if (!window.confirm("Remove this servicing rule from the product?")) {
        return;
      }
      emit(list.filter((x) => x.id !== id));
      if (dialogOpen && editingId === id) {
        closeDialog();
      }
    },
    [closeDialog, dialogOpen, editingId, emit, list],
  );

  const dialogTitle = editingId ? "Edit servicing rule" : "Create servicing rule";
  const saveLabel = editingId ? "Save changes" : "Save rule";

  const dialogNode =
    dialogOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="psc-benefit-dialog-backdrop"
        role="presentation"
        onClick={() => {
          closeDialog();
        }}
      >
        <div
          className="psc-benefit-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="psc-servicing-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id="psc-servicing-dialog-title" className="psc-benefit-dialog-title">
              {dialogTitle}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeDialog}>
              ×
            </button>
          </header>
          <ServicingRuleDialogForm
            form={form}
            patchForm={patchForm}
            onSave={saveRule}
            onCancel={closeDialog}
            saveLabel={saveLabel}
            onFeatureTypeChange={onFeatureTypeChange}
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="psc-charges-panel">
      <p className="psc-charges-lead">
        Configure surrender, loan, withdrawal, and policy servicing behaviour. Sample rows show typical structures until you save your own.
      </p>

      <div className="psc-core-benefits-list-wrap">
        <div className="psc-core-benefits-section-head">
          <h2 className="psc-field-section-title psc-core-benefits-list-title">Servicing rules ({displayList.length})</h2>
          <button type="button" className="primary-button psc-core-benefits-add-btn" onClick={openCreate}>
            Create rule
          </button>
        </div>
        <ul className="psc-benefit-cards" role="list">
          {displayList.map((r) => {
            const title = displayFeatureTitle(r);
            const meta = [
              { label: "Allowed", value: labelForOption(SERVICING_ALLOWED_AS, r.allowedAs) },
              { label: "Timing", value: r.effectiveTiming?.trim() || "—" },
              { label: "UW", value: labelForOption(SERVICING_UW_OPTIONS, r.uwRequired) },
              { label: "Active", value: r.active || "—" },
            ];
            return (
              <li key={r.id} className={`psc-benefit-card${listIsMock ? " psc-benefit-card--demo" : ""}`}>
                <div className="psc-benefit-card-body">
                  <div className="psc-benefit-card-lead">
                    <p className="psc-benefit-card-name">{title}</p>
                    <p className="psc-benefit-card-desc">
                      {r.description?.trim() || getServicingCatalogEntry(r.featureTypeId)?.catalogDescription || "—"}
                    </p>
                  </div>
                  <div className="psc-benefit-card-meta-wrap">
                    <div className="psc-benefit-card-meta psc-benefit-card-meta--strip" role="list">
                      {meta.map((cell) => (
                        <div key={cell.label} className="psc-benefit-card-meta-box" role="listitem">
                          <span className="psc-meta-box-label">{cell.label}</span>
                          <div className="psc-meta-box-value-row">
                            <span className="psc-meta-box-value">{cell.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="psc-benefit-card-actions">
                      <button type="button" className="psc-card-action psc-studio-row-edit" onClick={() => openEdit(r.id)}>
                        Edit
                      </button>
                      {!listIsMock ? (
                        <button type="button" className="secondary-button psc-benefit-card-remove" onClick={() => removeItem(r.id)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {dialogNode}
    </div>
  );
}
