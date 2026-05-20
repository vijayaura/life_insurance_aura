import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { ProductStudioLineItemsShell } from "./ProductStudioLineItemsShell.jsx";
import {
  DEMO_SAVINGS_LIST,
  SAVINGS_BASIS_OPTIONS,
  SAVINGS_FEATURE_CATALOG,
  YES_NO_ACTIVE,
  emptySavingsFeatureForm,
  getSavingsCatalogEntry,
  normalizeSavingsConfiguration,
  savingsFormToRowPartial,
  savingsRowToForm,
  validateSavingsForm,
} from "./productStudioSavings.js";

const FEATURE_SELECT_OPTIONS = SAVINGS_FEATURE_CATALOG.map((c) => ({ value: c.id, label: c.featureName }));

function labelForOption(options, value) {
  const o = options.find((x) => x.value === value);
  return o?.label || value || "—";
}

function SavingsDialogBody({ form, patchForm }) {
  const onFeatureTypeChange = useCallback(
    (featureTypeId) => {
      const cat = getSavingsCatalogEntry(featureTypeId);
      patchForm({
        featureTypeId,
        description: featureTypeId !== "custom" && cat ? cat.catalogDescription : form.description,
        customFeatureName: featureTypeId === "custom" ? form.customFeatureName : "",
      });
    },
    [form.customFeatureName, form.description, patchForm],
  );

  const isCustom = form.featureTypeId === "custom";

  return (
    <>
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Feature</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Savings feature</span>
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
              <span className="psc-field-label">Custom feature name</span>
              <input
                className="psc-input"
                type="text"
                value={form.customFeatureName}
                onChange={(e) => patchForm("customFeatureName", e.target.value)}
                placeholder="e.g. Index-linked top-up"
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
              placeholder="How this feature applies on the benefit"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Basis & values</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Basis</span>
            <DropdownSelect variant="psc" value={form.basis} onChange={(v) => patchForm("basis", v)} options={SAVINGS_BASIS_OPTIONS} placeholder="Select" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Rate / formula</span>
            <input
              className="psc-input"
              type="text"
              value={form.rateOrFormula}
              onChange={(e) => patchForm("rateOrFormula", e.target.value)}
              placeholder="e.g. 2.5% p.a.; bonus table ref B-12"
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
              placeholder="Actuarial references, caps, declaration rules"
            />
          </label>
        </div>
      </div>
    </>
  );
}

function displayFeatureTitle(row) {
  if (row.featureTypeId === "custom" && row.customFeatureName) {
    return row.customFeatureName;
  }
  const cat = getSavingsCatalogEntry(row.featureTypeId);
  return cat?.featureName || row.featureTypeId || "Feature";
}

/**
 * @param {unknown} savings
 * @param {(next: object) => void} onSavingsChange — receives normalized `{ items }`.
 */
export function ProductStudioSavingsPanel({ savings, onSavingsChange }) {
  const list = useMemo(() => normalizeSavingsConfiguration(savings).items, [savings]);

  const onPersistItems = useCallback(
    (items) => {
      onSavingsChange(normalizeSavingsConfiguration({ items }));
    },
    [onSavingsChange],
  );

  const resolveRowById = useCallback(
    (id) => list.find((x) => x.id === id) || DEMO_SAVINGS_LIST.find((x) => x.id === id),
    [list],
  );

  const isPersistedId = useCallback((id) => list.some((x) => x.id === id), [list]);

  const getCardDescription = useCallback((row) => {
    return row.description?.trim() || getSavingsCatalogEntry(row.featureTypeId)?.catalogDescription || "—";
  }, []);

  const getCardMeta = useCallback((row) => {
    return [
      { label: "Basis", value: labelForOption(SAVINGS_BASIS_OPTIONS, row.basis) },
      { label: "Rate / formula", value: row.rateOrFormula?.trim() || "—" },
      { label: "Active", value: row.active || "—" },
    ];
  }, []);

  const renderDialogBody = useCallback(
    ({ form, patchForm }) => <SavingsDialogBody form={form} patchForm={patchForm} />,
    [],
  );

  return (
    <ProductStudioLineItemsShell
      panelClassName="psc-charges-panel"
      listTitle="Savings features"
      createButtonLabel="Create feature"
      removeConfirmMessage="Remove this savings feature from the product?"
      persistedItems={list}
      demoItems={DEMO_SAVINGS_LIST}
      onPersistItems={onPersistItems}
      resolveRowById={resolveRowById}
      isPersistedId={isPersistedId}
      emptyForm={emptySavingsFeatureForm}
      rowToForm={savingsRowToForm}
      formToRowPartial={savingsFormToRowPartial}
      validateForm={validateSavingsForm}
      dialogTitleCreate="Create savings feature"
      dialogTitleEdit="Edit savings feature"
      saveLabelCreate="Save feature"
      saveLabelEdit="Save changes"
      actionsSectionTitle="Save feature"
      dialogHeadingId="psc-savings-dialog-title"
      getCardTitle={displayFeatureTitle}
      getCardDescription={getCardDescription}
      getCardMeta={getCardMeta}
      renderDialogBody={renderDialogBody}
    />
  );
}
