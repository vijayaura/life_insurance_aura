import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  BENEFIT_TRIGGER_OPTIONS,
  BENEFIT_TYPE_OPTIONS,
  CALCULATION_METHOD_OPTIONS,
  DEMO_CORE_BENEFIT_LIST,
  MANDATORY_OPTIONAL_OPTIONS,
  MORTALITY_RATE_BASIS_OPTIONS,
  YES_NO_OPTIONS,
  coreBenefitRowToForm,
  descriptionForBenefitName,
  emptyCoreBenefitForm,
} from "./productStudioCoreBenefits.js";
import { uid } from "./productStudioStore.js";

function PscSelectField({ label, value, options, onChange, placeholder }) {
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      <DropdownSelect variant="psc" value={value ?? ""} onChange={onChange} options={options} placeholder={placeholder || "Select"} />
    </label>
  );
}

function PscTextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      <input className="psc-input" type={type} value={value ?? ""} placeholder={placeholder || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/**
 * Shared benefit fields (dialog body or full-page editor). No save/cancel row.
 */
export function CoreBenefitEditorFormBody({ form, patchForm }) {
  return (
    <>
      <div className="psc-field-section">
        <h2 className="psc-field-section-title">Benefit identity</h2>
        <div className="psc-field-grid">
          <PscTextField label="Benefit name" value={form.benefitName} onChange={(v) => patchForm("benefitName", v)} placeholder="e.g. Death Benefit" />
          <PscSelectField label="Benefit type" value={form.benefitType} options={BENEFIT_TYPE_OPTIONS} onChange={(v) => patchForm("benefitType", v)} />
          <PscSelectField
            label="Mandatory / optional"
            value={form.mandatoryOptional}
            options={MANDATORY_OPTIONAL_OPTIONS}
            onChange={(v) => patchForm("mandatoryOptional", v)}
          />
          <PscSelectField label="Rate basis" value={form.rateBasis} options={MORTALITY_RATE_BASIS_OPTIONS} onChange={(v) => patchForm("rateBasis", v)} />
        </div>
      </div>

      <div className="psc-field-section">
        <h2 className="psc-field-section-title">Calculation & limits</h2>
        <div className="psc-field-grid">
          <PscSelectField
            label="Benefit calculation method"
            value={form.calculationMethod}
            options={CALCULATION_METHOD_OPTIONS}
            onChange={(v) => patchForm("calculationMethod", v)}
          />
          <PscSelectField label="Benefit trigger" value={form.benefitTrigger} options={BENEFIT_TRIGGER_OPTIONS} onChange={(v) => patchForm("benefitTrigger", v)} />
          <PscTextField
            label="Maximum payable"
            value={form.maximumPayable}
            onChange={(v) => patchForm("maximumPayable", v)}
            placeholder="Sum assured / fund value / capped amount"
          />
          <PscTextField label="Benefit expiry" value={form.benefitExpiry} onChange={(v) => patchForm("benefitExpiry", v)} placeholder="e.g. at age 65, policy maturity" />
        </div>
      </div>

      <div className="psc-field-section">
        <h2 className="psc-field-section-title">Waiting, exclusions & behaviour</h2>
        <div className="psc-field-grid">
          <PscTextField label="Waiting period" value={form.waitingPeriod} onChange={(v) => patchForm("waitingPeriod", v)} placeholder="e.g. 90 days" />
          <PscTextField
            label="Exclusion period"
            value={form.exclusionPeriod}
            onChange={(v) => patchForm("exclusionPeriod", v)}
            placeholder="e.g. suicide exclusion first 12 months"
          />
          <PscSelectField
            label="Multiple claims allowed"
            value={form.multipleClaimsAllowed}
            options={YES_NO_OPTIONS}
            onChange={(v) => patchForm("multipleClaimsAllowed", v)}
          />
          <PscSelectField
            label="Reduces base sum assured"
            value={form.reducesBaseSumAssured}
            options={YES_NO_OPTIONS}
            onChange={(v) => patchForm("reducesBaseSumAssured", v)}
          />
          <PscSelectField label="Can be accelerated" value={form.canBeAccelerated} options={YES_NO_OPTIONS} onChange={(v) => patchForm("canBeAccelerated", v)} />
        </div>
      </div>
    </>
  );
}

function BenefitDialogForm({ form, patchForm, onSave, onCancel, saveLabel }) {
  return (
    <div className="psc-benefit-dialog-body">
      <CoreBenefitEditorFormBody form={form} patchForm={patchForm} />

      <div className="psc-field-section psc-benefit-dialog-actions-section">
        <h2 className="psc-field-section-title">Save benefit</h2>
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

/**
 * Core benefits & riders — list + Add benefit / View details (full-page) or Edit in dialog.
 * @param {{ items: object[] }} props
 * @param {(nextItems: object[]) => void} props.onItemsChange
 * @param {string} [props.benefitEditBasePath] — when set, Edit opens full-page editor at `{base}/benefits/:id/edit`
 */
export function CoreBenefitsRidersPanel({ items, onItemsChange, benefitEditBasePath = "" }) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyCoreBenefitForm());

  const hasSavedBenefits = items.length > 0;
  const displayList = hasSavedBenefits ? items : DEMO_CORE_BENEFIT_LIST;
  const listIsMock = !hasSavedBenefits;

  const patchForm = useCallback((key, v) => {
    setForm((f) => ({ ...f, [key]: v }));
  }, []);

  const resetDialogState = useCallback(() => {
    setEditingId(null);
    setForm(emptyCoreBenefitForm());
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    resetDialogState();
  }, [resetDialogState]);

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

  const openAddDialog = useCallback(() => {
    resetDialogState();
    setDialogOpen(true);
  }, [resetDialogState]);

  const openEditDialog = useCallback(
    (id) => {
      const persisted = items.find((x) => x.id === id);
      const demo = DEMO_CORE_BENEFIT_LIST.find((x) => x.id === id);
      const row = persisted || demo;
      if (!row) {
        return;
      }
      setEditingId(persisted ? id : null);
      setForm(coreBenefitRowToForm(row));
      setDialogOpen(true);
    },
    [items],
  );

  const goEditBenefit = useCallback(
    (id) => {
      const base = typeof benefitEditBasePath === "string" ? benefitEditBasePath.trim() : "";
      if (base) {
        navigate(`${base.replace(/\/$/, "")}/benefits/${encodeURIComponent(id)}/edit`);
        return;
      }
      openEditDialog(id);
    },
    [benefitEditBasePath, navigate, openEditDialog],
  );

  const saveBenefit = useCallback(() => {
    const name = form.benefitName?.trim();
    if (!name) {
      window.alert("Benefit name is required.");
      return;
    }
    const row = {
      id: editingId || uid(),
      benefitName: name,
      benefitType: form.benefitType,
      mandatoryOptional: form.mandatoryOptional,
      rateBasis: form.rateBasis,
      calculationMethod: form.calculationMethod,
      benefitTrigger: form.benefitTrigger,
      waitingPeriod: form.waitingPeriod?.trim() || "",
      exclusionPeriod: form.exclusionPeriod?.trim() || "",
      maximumPayable: form.maximumPayable?.trim() || "",
      benefitExpiry: form.benefitExpiry?.trim() || "",
      multipleClaimsAllowed: form.multipleClaimsAllowed,
      reducesBaseSumAssured: form.reducesBaseSumAssured,
      canBeAccelerated: form.canBeAccelerated,
    };
    if (editingId) {
      onItemsChange(items.map((x) => (x.id === editingId ? row : x)));
    } else {
      onItemsChange([...items, row]);
    }
    closeDialog();
  }, [closeDialog, editingId, form, items, onItemsChange]);

  const removeItem = useCallback(
    (id) => {
      if (!window.confirm("Remove this benefit from the product?")) {
        return;
      }
      onItemsChange(items.filter((x) => x.id !== id));
      if (dialogOpen && editingId === id) {
        closeDialog();
      }
    },
    [closeDialog, dialogOpen, editingId, items, onItemsChange],
  );

  const dialogTitle = editingId ? "Edit benefit" : "Add benefit";
  const saveLabel = editingId ? "Save changes" : "Save benefit";

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
          aria-labelledby="psc-benefit-dialog-title"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id="psc-benefit-dialog-title" className="psc-benefit-dialog-title">
              {dialogTitle}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeDialog}>
              ×
            </button>
          </header>
          <BenefitDialogForm
            form={form}
            patchForm={patchForm}
            onSave={saveBenefit}
            onCancel={closeDialog}
            saveLabel={saveLabel}
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="psc-core-benefits">
      <div className="psc-core-benefits-list-wrap">
        <div className="psc-core-benefits-section-head">
          <h2 className="psc-field-section-title psc-core-benefits-list-title">Benefits ({displayList.length})</h2>
          <button type="button" className="primary-button psc-core-benefits-add-btn" onClick={openAddDialog}>
            Add benefit
          </button>
        </div>
        <ul className="psc-benefit-cards" role="list">
          {displayList.map((b) => {
            const desc = descriptionForBenefitName(b.benefitName);
            const meta = [
              { label: "Type", value: b.benefitType || "—" },
              { label: "Core / add-on", value: b.mandatoryOptional || "—" },
              { label: "Trigger", value: b.benefitTrigger || "—" },
              { label: "Calculation", value: b.calculationMethod || "—" },
              { label: "Max payable", value: b.maximumPayable?.trim() || "—" },
            ];
            return (
              <li key={b.id} className="psc-benefit-card">
                <div className="psc-benefit-card-body">
                  <div className="psc-benefit-card-lead">
                    <p className="psc-benefit-card-name">{b.benefitName?.trim() || "Untitled benefit"}</p>
                    {desc ? <p className="psc-benefit-card-desc">{desc}</p> : null}
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
                      <button
                        type="button"
                        className={
                          benefitEditBasePath?.trim()
                            ? "primary-button psc-benefit-card-view"
                            : "psc-card-action psc-studio-row-edit"
                        }
                        onClick={() => goEditBenefit(b.id)}
                      >
                        View details
                      </button>
                      {!listIsMock ? (
                        <button type="button" className="secondary-button psc-benefit-card-remove" onClick={() => removeItem(b.id)}>
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
