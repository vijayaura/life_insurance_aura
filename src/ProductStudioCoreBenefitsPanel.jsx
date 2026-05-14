import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  BENEFIT_TRIGGER_OPTIONS,
  BENEFIT_TYPE_OPTIONS,
  CALCULATION_METHOD_OPTIONS,
  DEMO_CORE_BENEFIT_LIST,
  MANDATORY_OPTIONAL_OPTIONS,
  YES_NO_OPTIONS,
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

function BenefitDialogForm({ form, derivedDescription, patchForm, onSave, onCancel, saveLabel }) {
  return (
    <div className="psc-benefit-dialog-body">
      {form.benefitName.trim() && derivedDescription ? (
        <p className="psc-core-benefits-ref-desc">
          <span className="psc-core-benefits-ref-desc-label">Reference</span>
          {derivedDescription}
        </p>
      ) : null}

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Benefit identity</h3>
        <div className="psc-field-grid">
          <PscTextField label="Benefit name" value={form.benefitName} onChange={(v) => patchForm("benefitName", v)} placeholder="e.g. Death Benefit" />
          <PscSelectField label="Benefit type" value={form.benefitType} options={BENEFIT_TYPE_OPTIONS} onChange={(v) => patchForm("benefitType", v)} />
          <PscSelectField
            label="Mandatory / optional"
            value={form.mandatoryOptional}
            options={MANDATORY_OPTIONAL_OPTIONS}
            onChange={(v) => patchForm("mandatoryOptional", v)}
          />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Calculation & limits</h3>
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
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Waiting, exclusions & behaviour</h3>
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

      <div className="psc-field-section psc-benefit-dialog-actions-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Save benefit</h3>
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
 * Core benefits & riders — list + Add benefit / Edit in dialog.
 * @param {{ items: object[] }} props
 * @param {(nextItems: object[]) => void} props.onItemsChange
 */
export function CoreBenefitsRidersPanel({ items, onItemsChange }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyCoreBenefitForm());

  const hasSavedBenefits = items.length > 0;
  const displayList = hasSavedBenefits ? items : DEMO_CORE_BENEFIT_LIST;
  const listIsMock = !hasSavedBenefits;

  const patchForm = useCallback((key, v) => {
    setForm((f) => ({ ...f, [key]: v }));
  }, []);

  const derivedDescription = useMemo(() => descriptionForBenefitName(form.benefitName), [form.benefitName]);

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
      setForm({
        benefitName: row.benefitName || "",
        benefitType: row.benefitType || BENEFIT_TYPE_OPTIONS[0],
        mandatoryOptional: row.mandatoryOptional || MANDATORY_OPTIONAL_OPTIONS[0],
        calculationMethod: row.calculationMethod || CALCULATION_METHOD_OPTIONS[0],
        benefitTrigger: row.benefitTrigger || BENEFIT_TRIGGER_OPTIONS[0],
        waitingPeriod: row.waitingPeriod || "",
        exclusionPeriod: row.exclusionPeriod || "",
        maximumPayable: row.maximumPayable || "",
        benefitExpiry: row.benefitExpiry || "",
        multipleClaimsAllowed: row.multipleClaimsAllowed || "No",
        reducesBaseSumAssured: row.reducesBaseSumAssured || "No",
        canBeAccelerated: row.canBeAccelerated || "No",
      });
      setDialogOpen(true);
    },
    [items],
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
            derivedDescription={derivedDescription}
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
                      <button type="button" className="psc-card-action psc-studio-row-edit" onClick={() => openEditDialog(b.id)}>
                        Edit
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
