import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { ProductStudioLineItemsShell } from "./ProductStudioLineItemsShell.jsx";
import {
  DEMO_FEES_LIST,
  FEE_BASIS_OPTIONS,
  FEE_BILLING_OPTIONS,
  FEE_TYPE_CATALOG,
  YES_NO_ACTIVE,
  emptyFeeForm,
  feeFormToRowPartial,
  feeRowToForm,
  getFeeCatalogEntry,
  normalizeChargesConfiguration,
  validateFeeForm,
} from "./productStudioCharges.js";

const FEE_TYPE_SELECT_OPTIONS = FEE_TYPE_CATALOG.map((c) => ({ value: c.id, label: c.chargeName }));

export function ChargesDialogBody({ form, patchForm, embedded = false, onSave, saveLabel = "Save changes" }) {
  const onChargeTypeChange = useCallback(
    (chargeTypeId) => {
      const cat = getFeeCatalogEntry(chargeTypeId);
      patchForm({
        chargeTypeId,
        description: chargeTypeId !== "custom" && cat ? cat.catalogDescription : form.description,
        customChargeName: chargeTypeId === "custom" ? form.customChargeName : "",
      });
    },
    [form.customChargeName, form.description, patchForm],
  );

  const isCustom = form.chargeTypeId === "custom";

  return (
    <div className={`psc-benefit-dialog-body${embedded ? " psc-benefit-dialog-body--embedded" : ""}`}>
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
      {embedded && onSave ? (
        <div className="psc-field-section psc-benefit-dialog-actions-section">
          <div className="psc-benefit-dialog-footer">
            <button type="button" className="primary-button" onClick={onSave}>
              {saveLabel}
            </button>
          </div>
        </div>
      ) : null}
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
export function ProductStudioChargesPanel({ charges, onChargesChange, onViewItemDetails }) {
  const list = useMemo(() => normalizeChargesConfiguration(charges).items, [charges]);

  const onPersistItems = useCallback(
    (items) => {
      onChargesChange(normalizeChargesConfiguration({ items }));
    },
    [onChargesChange],
  );

  const resolveRowById = useCallback(
    (id) => list.find((x) => x.id === id) || DEMO_FEES_LIST.find((x) => x.id === id),
    [list],
  );

  const isPersistedId = useCallback((id) => list.some((x) => x.id === id), [list]);

  const getCardDescription = useCallback((row) => {
    return row.description?.trim() || getFeeCatalogEntry(row.chargeTypeId)?.catalogDescription || "—";
  }, []);

  const getCardMeta = useCallback((row) => {
    return [
      { label: "Basis", value: row.basisValue || "—" },
      { label: "Type", value: getFeeCatalogEntry(row.chargeTypeId)?.chargeName || "—" },
      { label: "Billing", value: row.billingFrequency || "—" },
      { label: "Active", value: row.active || "—" },
    ];
  }, []);

  const renderDialogBody = useCallback(
    ({ form, patchForm }) => <ChargesDialogBody form={form} patchForm={patchForm} />,
    [],
  );

  return (
    <ProductStudioLineItemsShell
      panelClassName="psc-charges-panel"
      listTitle="Fee lines"
      createButtonLabel="Create fee"
      removeConfirmMessage="Remove this fee line from the product?"
      persistedItems={list}
      demoItems={DEMO_FEES_LIST}
      onPersistItems={onPersistItems}
      resolveRowById={resolveRowById}
      isPersistedId={isPersistedId}
      emptyForm={emptyFeeForm}
      rowToForm={feeRowToForm}
      formToRowPartial={feeFormToRowPartial}
      validateForm={validateFeeForm}
      dialogTitleCreate="Create fee"
      dialogTitleEdit="Edit fee"
      saveLabelCreate="Save fee"
      saveLabelEdit="Save changes"
      actionsSectionTitle="Save fee"
      dialogHeadingId="psc-fee-dialog-title"
      getCardTitle={displayChargeTitle}
      getCardDescription={getCardDescription}
      getCardMeta={getCardMeta}
      renderDialogBody={renderDialogBody}
      onViewItemDetails={onViewItemDetails}
    />
  );
}
