import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { ProductStudioLineItemsShell } from "./ProductStudioLineItemsShell.jsx";
import {
  DEMO_POLICY_SERVICING_LIST,
  SERVICING_ALLOWED_AS,
  SERVICING_FEATURE_CATALOG,
  SERVICING_UW_OPTIONS,
  YES_NO_ACTIVE,
  emptyServicingRuleForm,
  getServicingCatalogEntry,
  normalizePolicyServicingConfiguration,
  servicingFormToRowPartial,
  servicingRowToForm,
  validateServicingForm,
} from "./productStudioPolicyServicing.js";

const FEATURE_SELECT_OPTIONS = SERVICING_FEATURE_CATALOG.map((c) => ({ value: c.id, label: c.featureName }));

function labelForOption(options, value) {
  const o = options.find((x) => x.value === value);
  return o?.label || value || "—";
}

function ServicingDialogBody({ form, patchForm }) {
  const onFeatureTypeChange = useCallback(
    (featureTypeId) => {
      const cat = getServicingCatalogEntry(featureTypeId);
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
    </>
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

  const onPersistItems = useCallback(
    (items) => {
      onPolicyServicingChange(normalizePolicyServicingConfiguration({ items }));
    },
    [onPolicyServicingChange],
  );

  const resolveRowById = useCallback(
    (id) => list.find((x) => x.id === id) || DEMO_POLICY_SERVICING_LIST.find((x) => x.id === id),
    [list],
  );

  const isPersistedId = useCallback((id) => list.some((x) => x.id === id), [list]);

  const getCardDescription = useCallback((row) => {
    return row.description?.trim() || getServicingCatalogEntry(row.featureTypeId)?.catalogDescription || "—";
  }, []);

  const getCardMeta = useCallback((row) => {
    return [
      { label: "Allowed", value: labelForOption(SERVICING_ALLOWED_AS, row.allowedAs) },
      { label: "Timing", value: row.effectiveTiming?.trim() || "—" },
      { label: "UW", value: labelForOption(SERVICING_UW_OPTIONS, row.uwRequired) },
      { label: "Active", value: row.active || "—" },
    ];
  }, []);

  const renderDialogBody = useCallback(
    ({ form, patchForm }) => <ServicingDialogBody form={form} patchForm={patchForm} />,
    [],
  );

  return (
    <ProductStudioLineItemsShell
      panelClassName="psc-charges-panel"
      listTitle="Servicing rules"
      createButtonLabel="Create rule"
      removeConfirmMessage="Remove this servicing rule from the product?"
      persistedItems={list}
      demoItems={DEMO_POLICY_SERVICING_LIST}
      onPersistItems={onPersistItems}
      resolveRowById={resolveRowById}
      isPersistedId={isPersistedId}
      emptyForm={emptyServicingRuleForm}
      rowToForm={servicingRowToForm}
      formToRowPartial={servicingFormToRowPartial}
      validateForm={validateServicingForm}
      dialogTitleCreate="Create servicing rule"
      dialogTitleEdit="Edit servicing rule"
      saveLabelCreate="Save rule"
      saveLabelEdit="Save changes"
      actionsSectionTitle="Save rule"
      dialogHeadingId="psc-servicing-dialog-title"
      getCardTitle={displayFeatureTitle}
      getCardDescription={getCardDescription}
      getCardMeta={getCardMeta}
      renderDialogBody={renderDialogBody}
    />
  );
}
