import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  DEMO_FUNDS_LIST,
  FUND_CURRENCY_OPTIONS,
  FUND_MANAGER_OPTIONS,
  FUND_STATUS_OPTIONS,
  FUND_TYPE_OPTIONS,
  NAV_FREQUENCY_OPTIONS,
  RISK_RATING_OPTIONS,
  SHARIA_GUARANTEE_OPTIONS,
  YES_NO_ALLOC_OPTIONS,
  emptyAllocationRulesForm,
  emptyFundForm,
  normalizeAllocationRules,
  normalizeFundsConfiguration,
} from "./productStudioFunds.js";
import { uid } from "./productStudioStore.js";

function PscSelectField({ label, value, options, onChange, placeholder }) {
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      <DropdownSelect variant="psc" value={value ?? ""} onChange={onChange} options={options} placeholder={placeholder || "Select"} />
    </label>
  );
}

function PscTextField({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      {hint ? <span className="psc-field-hint">{hint}</span> : null}
      <input className="psc-input" type={type} value={value ?? ""} placeholder={placeholder || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function FundDialogForm({ form, patchForm, onSave, onCancel, saveLabel }) {
  return (
    <div className="psc-benefit-dialog-body">
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Fund identity</h3>
        <div className="psc-field-grid">
          <PscTextField
            label="Fund name"
            hint="e.g. Balanced Fund, Equity Fund, Sukuk Fund"
            value={form.fundName}
            onChange={(v) => patchForm("fundName", v)}
            placeholder="Display name"
          />
          <PscTextField label="Fund code" hint="Unique code" value={form.fundCode} onChange={(v) => patchForm("fundCode", v)} placeholder="e.g. EQ-AE-01" />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Classification</h3>
        <div className="psc-field-grid">
          <PscSelectField label="Fund type" value={form.fundType} options={FUND_TYPE_OPTIONS} onChange={(v) => patchForm("fundType", v)} />
          <PscSelectField label="Currency" value={form.currency} options={FUND_CURRENCY_OPTIONS} onChange={(v) => patchForm("currency", v)} />
          <PscSelectField label="Risk rating" value={form.riskRating} options={RISK_RATING_OPTIONS} onChange={(v) => patchForm("riskRating", v)} />
          <PscSelectField label="Fund manager" value={form.fundManager} options={FUND_MANAGER_OPTIONS} onChange={(v) => patchForm("fundManager", v)} />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">NAV & allocation limits</h3>
        <div className="psc-field-grid">
          <PscSelectField label="NAV frequency" value={form.navFrequency} options={NAV_FREQUENCY_OPTIONS} onChange={(v) => patchForm("navFrequency", v)} />
          <PscTextField label="Minimum allocation %" hint="e.g. 10" value={form.minAllocationPct} onChange={(v) => patchForm("minAllocationPct", v)} placeholder="%" />
          <PscTextField label="Maximum allocation %" hint="e.g. 100" value={form.maxAllocationPct} onChange={(v) => patchForm("maxAllocationPct", v)} placeholder="%" />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Status & compliance</h3>
        <div className="psc-field-grid">
          <PscSelectField label="Fund status" value={form.fundStatus} options={FUND_STATUS_OPTIONS} onChange={(v) => patchForm("fundStatus", v)} />
          <PscSelectField label="Sharia compliant" value={form.shariaCompliant} options={SHARIA_GUARANTEE_OPTIONS} onChange={(v) => patchForm("shariaCompliant", v)} />
          <PscSelectField label="Guarantee applicable" value={form.guaranteeApplicable} options={SHARIA_GUARANTEE_OPTIONS} onChange={(v) => patchForm("guaranteeApplicable", v)} />
        </div>
      </div>

      <div className="psc-field-section psc-benefit-dialog-actions-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Save fund</h3>
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

function FundAllocationDialogForm({ form, patchForm, onSave, onCancel, saveDisabled, saveHint }) {
  return (
    <div className="psc-benefit-dialog-body">
      {saveHint ? (
        <p className="psc-core-benefits-ref-desc">
          <span className="psc-core-benefits-ref-desc-label">Note</span>
          {saveHint}
        </p>
      ) : null}

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Fund count & allocation totals</h3>
        <div className="psc-field-grid">
          <PscTextField label="Minimum number of funds" hint="e.g. 1" value={form.minNumberOfFunds} onChange={(v) => patchForm("minNumberOfFunds", v)} placeholder="" />
          <PscTextField label="Maximum number of funds" hint="e.g. 5" value={form.maxNumberOfFunds} onChange={(v) => patchForm("maxNumberOfFunds", v)} placeholder="" />
          <PscTextField label="Minimum allocation per fund" hint="e.g. 10%" value={form.minAllocationPerFundPct} onChange={(v) => patchForm("minAllocationPerFundPct", v)} placeholder="%" />
          <PscTextField label="Allocation total must equal" hint="e.g. 100%" value={form.allocationTotalMustEqualPct} onChange={(v) => patchForm("allocationTotalMustEqualPct", v)} placeholder="%" />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Default & rebalancing</h3>
        <div className="psc-field-grid">
          <PscTextField label="Default fund" hint="e.g. Conservative Fund" value={form.defaultFundName} onChange={(v) => patchForm("defaultFundName", v)} placeholder="Name or code" />
          <PscSelectField label="Auto rebalancing" value={form.autoRebalancing} options={YES_NO_ALLOC_OPTIONS} onChange={(v) => patchForm("autoRebalancing", v)} />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Switching</h3>
        <div className="psc-field-grid">
          <PscSelectField label="Switching allowed" value={form.switchingAllowed} options={YES_NO_ALLOC_OPTIONS} onChange={(v) => patchForm("switchingAllowed", v)} />
          <PscTextField label="Free switches per year" hint="e.g. 4" value={form.freeSwitchesPerYear} onChange={(v) => patchForm("freeSwitchesPerYear", v)} placeholder="" />
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Switch fee (after free switches)</span>
            <span className="psc-field-hint">e.g. AED 50 per switch</span>
            <input className="psc-input" type="text" value={form.switchFeeAfterFree} onChange={(e) => patchForm("switchFeeAfterFree", e.target.value)} placeholder="" />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Top-up & withdrawal</h3>
        <div className="psc-field-grid">
          <PscSelectField label="Top-up allowed" value={form.topUpAllowed} options={YES_NO_ALLOC_OPTIONS} onChange={(v) => patchForm("topUpAllowed", v)} />
          <PscSelectField label="Partial withdrawal allowed" value={form.partialWithdrawalAllowed} options={YES_NO_ALLOC_OPTIONS} onChange={(v) => patchForm("partialWithdrawalAllowed", v)} />
          <PscTextField label="Minimum withdrawal amount" hint="e.g. AED 1,000" value={form.minWithdrawalAmount} onChange={(v) => patchForm("minWithdrawalAmount", v)} placeholder="" />
          <PscTextField label="Minimum remaining fund value" hint="e.g. AED 5,000" value={form.minRemainingFundValue} onChange={(v) => patchForm("minRemainingFundValue", v)} placeholder="" />
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Policy behaviour</h3>
        <div className="psc-field-grid">
          <PscSelectField label="Premium holiday allowed" value={form.premiumHolidayAllowed} options={YES_NO_ALLOC_OPTIONS} onChange={(v) => patchForm("premiumHolidayAllowed", v)} />
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Loyalty units</span>
            <span className="psc-field-hint">e.g. add after year 5 / 10</span>
            <input className="psc-input" type="text" value={form.loyaltyUnits} onChange={(e) => patchForm("loyaltyUnits", e.target.value)} placeholder="" />
          </label>
        </div>
      </div>

      <div className="psc-field-section psc-benefit-dialog-actions-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Save rules</h3>
        <div className="psc-benefit-dialog-footer">
          <button type="button" className="primary-button" onClick={onSave} disabled={saveDisabled}>
            Save allocation rules
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
 * @param {object[]} items
 * @param {(items: object[]) => void} onItemsChange
 */
export function ProductStudioFundsPanel({ items, onItemsChange }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyFundForm());

  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [allocationFundId, setAllocationFundId] = useState(null);
  const [allocationFundLabel, setAllocationFundLabel] = useState("");
  const [allocationForm, setAllocationForm] = useState(() => emptyAllocationRulesForm());

  const list = useMemo(() => normalizeFundsConfiguration({ items }).items, [items]);
  const hasSavedFunds = list.length > 0;
  const displayList = hasSavedFunds ? list : DEMO_FUNDS_LIST;
  const listIsMock = !hasSavedFunds;

  const patchForm = useCallback((key, v) => {
    setForm((f) => ({ ...f, [key]: v }));
  }, []);

  const patchAllocationForm = useCallback((key, v) => {
    setAllocationForm((f) => ({ ...f, [key]: v }));
  }, []);

  const resetDialogState = useCallback(() => {
    setEditingId(null);
    setForm(emptyFundForm());
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    resetDialogState();
  }, [resetDialogState]);

  const closeAllocationDialog = useCallback(() => {
    setAllocationDialogOpen(false);
    setAllocationFundId(null);
    setAllocationFundLabel("");
    setAllocationForm(emptyAllocationRulesForm());
  }, []);

  useEffect(() => {
    if (!dialogOpen && !allocationDialogOpen) {
      return undefined;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (allocationDialogOpen) {
          closeAllocationDialog();
        } else {
          closeDialog();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialogOpen, allocationDialogOpen, closeAllocationDialog, closeDialog]);

  const openAddDialog = useCallback(() => {
    resetDialogState();
    setForm({ ...emptyFundForm(), fundStatus: "Active" });
    setDialogOpen(true);
  }, [resetDialogState]);

  const openEditDialog = useCallback(
    (id) => {
      const persisted = list.find((x) => x.id === id);
      const demo = DEMO_FUNDS_LIST.find((x) => x.id === id);
      const row = persisted || demo;
      if (!row) {
        return;
      }
      setEditingId(persisted ? id : null);
      setForm({
        fundName: row.fundName || "",
        fundCode: row.fundCode || "",
        fundType: row.fundType || "",
        currency: row.currency || "",
        riskRating: row.riskRating || "",
        fundManager: row.fundManager || "",
        navFrequency: row.navFrequency || "",
        minAllocationPct: row.minAllocationPct || "",
        maxAllocationPct: row.maxAllocationPct || "",
        fundStatus: row.fundStatus || "Active",
        shariaCompliant: row.shariaCompliant || "",
        guaranteeApplicable: row.guaranteeApplicable || "",
      });
      setDialogOpen(true);
    },
    [list],
  );

  const openAllocationDialog = useCallback((id) => {
    const row = displayList.find((x) => x.id === id);
    if (!row) {
      return;
    }
    setAllocationFundId(id);
    setAllocationFundLabel(row.fundName?.trim() || row.fundCode || "Fund");
    setAllocationForm(normalizeAllocationRules(row.allocationRules));
    setAllocationDialogOpen(true);
  }, [displayList]);

  const saveFund = useCallback(() => {
    const name = form.fundName?.trim();
    const code = form.fundCode?.trim().toUpperCase();
    if (!name) {
      window.alert("Fund name is required.");
      return;
    }
    if (!code) {
      window.alert("Fund code is required.");
      return;
    }
    const other = list.filter((x) => x.id !== editingId);
    if (other.some((x) => x.fundCode.toUpperCase() === code)) {
      window.alert("Fund code must be unique within this product.");
      return;
    }
    const prev = editingId ? list.find((x) => x.id === editingId) : null;
    const row = {
      id: editingId || uid(),
      fundName: name,
      fundCode: code,
      fundType: form.fundType?.trim() || "",
      currency: form.currency?.trim() || "",
      riskRating: form.riskRating?.trim() || "",
      fundManager: form.fundManager?.trim() || "",
      navFrequency: form.navFrequency?.trim() || "",
      minAllocationPct: form.minAllocationPct?.trim() || "",
      maxAllocationPct: form.maxAllocationPct?.trim() || "",
      fundStatus: form.fundStatus?.trim() || "Active",
      shariaCompliant: form.shariaCompliant?.trim() || "",
      guaranteeApplicable: form.guaranteeApplicable?.trim() || "",
      allocationRules: prev?.allocationRules ? normalizeAllocationRules(prev.allocationRules) : normalizeAllocationRules({}),
    };
    const next = editingId ? list.map((x) => (x.id === editingId ? row : x)) : [...list, row];
    onItemsChange(normalizeFundsConfiguration({ items: next }).items);
    closeDialog();
  }, [closeDialog, editingId, form, list, onItemsChange]);

  const saveAllocationRules = useCallback(() => {
    if (listIsMock) {
      window.alert("Add at least one saved fund to this product before saving allocation rules. Sample rows are for preview only.");
      return;
    }
    if (!allocationFundId) {
      return;
    }
    const rules = normalizeAllocationRules(allocationForm);
    const next = list.map((f) => (f.id === allocationFundId ? { ...f, allocationRules: rules } : f));
    onItemsChange(normalizeFundsConfiguration({ items: next }).items);
    closeAllocationDialog();
  }, [allocationForm, allocationFundId, closeAllocationDialog, list, listIsMock, onItemsChange]);

  const removeItem = useCallback(
    (id) => {
      if (!window.confirm("Remove this fund from the product?")) {
        return;
      }
      onItemsChange(list.filter((x) => x.id !== id));
      if (dialogOpen && editingId === id) {
        closeDialog();
      }
      if (allocationDialogOpen && allocationFundId === id) {
        closeAllocationDialog();
      }
    },
    [allocationDialogOpen, allocationFundId, closeAllocationDialog, closeDialog, dialogOpen, editingId, list, onItemsChange],
  );

  const dialogTitle = editingId ? "Edit fund" : "Create fund";
  const saveLabel = editingId ? "Save changes" : "Save fund";

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
          className="psc-benefit-dialog psc-fund-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="psc-fund-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id="psc-fund-dialog-title" className="psc-benefit-dialog-title">
              {dialogTitle}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeDialog}>
              ×
            </button>
          </header>
          <FundDialogForm form={form} patchForm={patchForm} onSave={saveFund} onCancel={closeDialog} saveLabel={saveLabel} />
        </div>
      </div>,
      document.body,
    );

  const allocationDialogNode =
    allocationDialogOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="psc-benefit-dialog-backdrop"
        role="presentation"
        onClick={() => {
          closeAllocationDialog();
        }}
      >
        <div
          className="psc-benefit-dialog psc-fund-dialog psc-fund-allocation-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="psc-fund-allocation-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id="psc-fund-allocation-dialog-title" className="psc-benefit-dialog-title">
              Allocation rules — {allocationFundLabel}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeAllocationDialog}>
              ×
            </button>
          </header>
          <FundAllocationDialogForm
            form={allocationForm}
            patchForm={patchAllocationForm}
            onSave={saveAllocationRules}
            onCancel={closeAllocationDialog}
            saveDisabled={listIsMock}
            saveHint={
              listIsMock
                ? "These rows are sample data. Create funds on the product to save allocation rules onto each fund."
                : ""
            }
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="psc-funds-panel">
      <div className="psc-core-benefits-list-wrap">
        <div className="psc-core-benefits-section-head">
          <h2 className="psc-field-section-title psc-core-benefits-list-title">Funds ({displayList.length})</h2>
          <button type="button" className="primary-button psc-core-benefits-add-btn" onClick={openAddDialog}>
            Create fund
          </button>
        </div>
        {listIsMock ? (
          <p className="psc-core-benefits-ref-desc">
            <span className="psc-core-benefits-ref-desc-label">Sample data</span>
            Example fund menu for layout preview. Create a fund or edit a row and save to store funds on this product.
          </p>
        ) : null}
        <ul className="psc-benefit-cards" role="list">
          {displayList.map((f) => {
            const meta = [
              { label: "Code", value: f.fundCode || "—" },
              { label: "Type", value: f.fundType || "—" },
              { label: "CCY", value: f.currency || "—" },
              { label: "Risk", value: f.riskRating || "—" },
              { label: "NAV", value: f.navFrequency || "—" },
              { label: "Status", value: f.fundStatus || "—" },
            ];
            return (
              <li key={f.id} className={`psc-benefit-card${listIsMock ? " psc-benefit-card--demo" : ""}`}>
                <div className="psc-benefit-card-body">
                  <div className="psc-benefit-card-lead">
                    <p className="psc-benefit-card-name">{f.fundName?.trim() || "Untitled fund"}</p>
                    <p className="psc-benefit-card-desc">
                      {f.fundManager ? `${f.fundManager} manager` : "—"}
                      {f.shariaCompliant ? ` · Sharia: ${f.shariaCompliant}` : ""}
                      {f.guaranteeApplicable ? ` · Guarantee: ${f.guaranteeApplicable}` : ""}
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
                      <button type="button" className="psc-card-action" onClick={() => openAllocationDialog(f.id)}>
                        Allocation rules
                      </button>
                      <button type="button" className="psc-card-action psc-studio-row-edit" onClick={() => openEditDialog(f.id)}>
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
      {allocationDialogNode}
    </div>
  );
}
