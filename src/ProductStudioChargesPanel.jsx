import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  DEMO_FEES_LIST,
  FEE_BASIS_OPTIONS,
  FEE_BILLING_OPTIONS,
  FEE_TYPE_CATALOG,
  YES_NO_ACTIVE,
  emptyFeeForm,
  getFeeCatalogEntry,
  normalizeChargesConfiguration,
} from "./productStudioCharges.js";
import { uid } from "./productStudioStore.js";

const FEE_TYPE_SELECT_OPTIONS = FEE_TYPE_CATALOG.map((c) => ({ value: c.id, label: c.chargeName }));

function FeeDialogForm({ form, patchForm, onSave, onCancel, saveLabel, onChargeTypeChange }) {
  const isCustom = form.chargeTypeId === "custom";
  return (
    <div className="psc-benefit-dialog-body">
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Charge type</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Charge</span>
            <DropdownSelect
              variant="psc"
              value={form.chargeTypeId}
              onChange={onChargeTypeChange}
              options={FEE_TYPE_SELECT_OPTIONS}
              placeholder="Select charge type"
            />
          </label>
          {isCustom ? (
            <label className="psc-field psc-field-wide">
              <span className="psc-field-label">Custom charge name</span>
              <input
                className="psc-input"
                type="text"
                value={form.customChargeName}
                onChange={(e) => patchForm("customChargeName", e.target.value)}
                placeholder="e.g. Legacy policy handling fee"
              />
            </label>
          ) : null}
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Description</span>
            <span className="psc-field-hint">How this fee applies on the product (defaults from catalog when you pick a charge).</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.description}
              onChange={(e) => patchForm("description", e.target.value)}
              placeholder="Underwriter-facing description"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Basis & billing</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Basis type</span>
            <DropdownSelect variant="psc" value={form.basisType} onChange={(v) => patchForm("basisType", v)} options={FEE_BASIS_OPTIONS} placeholder="Select" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Basis value</span>
            <span className="psc-field-hint">Amount, %, bps, or table ref</span>
            <input className="psc-input" type="text" value={form.basisValue} onChange={(e) => patchForm("basisValue", e.target.value)} placeholder="e.g. AED 50 or 1.5%" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Billing frequency</span>
            <DropdownSelect
              variant="psc"
              value={form.billingFrequency}
              onChange={(v) => patchForm("billingFrequency", v)}
              options={FEE_BILLING_OPTIONS}
              placeholder="Select"
            />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Applies when</span>
            <input className="psc-input" type="text" value={form.appliesWhen} onChange={(e) => patchForm("appliesWhen", e.target.value)} placeholder="e.g. In force, on surrender" />
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
              placeholder="Waivers, caps, regulatory references"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section psc-benefit-dialog-actions-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Save fee</h3>
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

function displayChargeTitle(row) {
  if (row.chargeTypeId === "custom" && row.customChargeName) {
    return row.customChargeName;
  }
  const cat = getFeeCatalogEntry(row.chargeTypeId);
  return cat?.chargeName || row.chargeTypeId || "Fee";
}

/**
 * @param {unknown} charges
 * @param {(next: object) => void} onChargesChange — receives normalized `{ items }`.
 */
export function ProductStudioChargesPanel({ charges, onChargesChange }) {
  const list = useMemo(() => normalizeChargesConfiguration(charges).items, [charges]);
  const hasSavedFees = list.length > 0;
  const displayList = hasSavedFees ? list : DEMO_FEES_LIST;
  const listIsMock = !hasSavedFees;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyFeeForm());

  const emit = useCallback(
    (nextItems) => {
      onChargesChange(normalizeChargesConfiguration({ items: nextItems }));
    },
    [onChargesChange],
  );

  const patchForm = useCallback((key, v) => {
    setForm((f) => ({ ...f, [key]: v }));
  }, []);

  const resetDialog = useCallback(() => {
    setEditingId(null);
    setForm(emptyFeeForm());
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

  const onChargeTypeChange = useCallback((chargeTypeId) => {
    const cat = getFeeCatalogEntry(chargeTypeId);
    setForm((f) => ({
      ...f,
      chargeTypeId,
      description: cat && chargeTypeId !== "custom" ? cat.catalogDescription : f.description,
      customChargeName: chargeTypeId === "custom" ? f.customChargeName : "",
    }));
  }, []);

  const openCreate = useCallback(() => {
    resetDialog();
    setForm(emptyFeeForm());
    setDialogOpen(true);
  }, [resetDialog]);

  const openEdit = useCallback(
    (id) => {
      const persisted = list.find((x) => x.id === id);
      const demo = DEMO_FEES_LIST.find((x) => x.id === id);
      const row = persisted || demo;
      if (!row) {
        return;
      }
      setEditingId(persisted ? id : null);
      setForm({
        chargeTypeId: row.chargeTypeId || "",
        customChargeName: row.customChargeName || "",
        description: row.description || "",
        basisType: row.basisType || "",
        basisValue: row.basisValue || "",
        billingFrequency: row.billingFrequency || "",
        appliesWhen: row.appliesWhen || "",
        notes: row.notes || "",
        active: row.active === "No" ? "No" : "Yes",
      });
      setDialogOpen(true);
    },
    [list],
  );

  const saveFee = useCallback(() => {
    if (!form.chargeTypeId) {
      window.alert("Select a charge type.");
      return;
    }
    if (form.chargeTypeId === "custom" && !form.customChargeName?.trim()) {
      window.alert("Custom charge name is required.");
      return;
    }
    const row = {
      id: editingId || uid(),
      chargeTypeId: form.chargeTypeId,
      customChargeName: form.customChargeName?.trim() || "",
      description: form.description?.trim() || "",
      basisType: form.basisType?.trim() || "",
      basisValue: form.basisValue?.trim() || "",
      billingFrequency: form.billingFrequency?.trim() || "",
      appliesWhen: form.appliesWhen?.trim() || "",
      notes: form.notes?.trim() || "",
      active: form.active === "No" ? "No" : "Yes",
    };
    const next = editingId ? list.map((x) => (x.id === editingId ? row : x)) : [...list, row];
    emit(next);
    closeDialog();
  }, [closeDialog, editingId, emit, form, list]);

  const removeItem = useCallback(
    (id) => {
      if (!window.confirm("Remove this fee line from the product?")) {
        return;
      }
      emit(list.filter((x) => x.id !== id));
      if (dialogOpen && editingId === id) {
        closeDialog();
      }
    },
    [closeDialog, dialogOpen, editingId, emit, list],
  );

  const dialogTitle = editingId ? "Edit fee" : "Create fee";
  const saveLabel = editingId ? "Save changes" : "Save fee";

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
          aria-labelledby="psc-fee-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id="psc-fee-dialog-title" className="psc-benefit-dialog-title">
              {dialogTitle}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeDialog}>
              ×
            </button>
          </header>
          <FeeDialogForm
            form={form}
            patchForm={patchForm}
            onSave={saveFee}
            onCancel={closeDialog}
            saveLabel={saveLabel}
            onChargeTypeChange={onChargeTypeChange}
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="psc-charges-panel">
      <p className="psc-charges-lead">Configure fee lines for this product. Sample rows show typical structures until you save your own.</p>

      <div className="psc-core-benefits-list-wrap">
        <div className="psc-core-benefits-section-head">
          <h2 className="psc-field-section-title psc-core-benefits-list-title">Fee lines ({displayList.length})</h2>
          <button type="button" className="primary-button psc-core-benefits-add-btn" onClick={openCreate}>
            Create fee
          </button>
        </div>
        <ul className="psc-benefit-cards" role="list">
          {displayList.map((f) => {
            const title = displayChargeTitle(f);
            const meta = [
              { label: "Basis", value: f.basisValue || "—" },
              { label: "Type", value: getFeeCatalogEntry(f.chargeTypeId)?.chargeName || "—" },
              { label: "Billing", value: f.billingFrequency || "—" },
              { label: "Active", value: f.active || "—" },
            ];
            return (
              <li key={f.id} className={`psc-benefit-card${listIsMock ? " psc-benefit-card--demo" : ""}`}>
                <div className="psc-benefit-card-body">
                  <div className="psc-benefit-card-lead">
                    <p className="psc-benefit-card-name">{title}</p>
                    <p className="psc-benefit-card-desc">{f.description?.trim() || getFeeCatalogEntry(f.chargeTypeId)?.catalogDescription || "—"}</p>
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
                      <button type="button" className="psc-card-action psc-studio-row-edit" onClick={() => openEdit(f.id)}>
                        Edit
                      </button>
                      {!listIsMock ? (
                        <button type="button" className="secondary-button psc-benefit-card-remove" onClick={() => removeItem(f.id)}>
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
