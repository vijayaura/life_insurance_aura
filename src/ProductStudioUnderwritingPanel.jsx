import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { ProductStudioLineItemsShell } from "./ProductStudioLineItemsShell.jsx";
import {
  DEMO_UNDERWRITING_RULES_LIST,
  UW_COMBINE_WITH_NEXT_OPTIONS,
  UW_FACT_OPERATOR_OPTIONS,
  UW_ON_MATCH_OPTIONS,
  UW_OUTCOME_KIND_OPTIONS,
  UW_RULE_CONDITION_CATALOG,
  YES_NO_ACTIVE,
  emptyUwRuleForm,
  getUwConditionCatalogEntry,
  labelFromUwOptions,
  normalizeUnderwritingRulesConfiguration,
  uwRuleFormToRowPartial,
  uwRuleRowToForm,
  validateUwRuleForm,
} from "./productStudioUnderwriting.js";

const CONDITION_SELECT_OPTIONS = UW_RULE_CONDITION_CATALOG.map((c) => ({ value: c.id, label: c.conditionLabel }));

function UnderwritingDialogBody({ form, patchForm }) {
  const onConditionTypeChange = useCallback(
    (conditionTypeId) => {
      const cat = getUwConditionCatalogEntry(conditionTypeId);
      patchForm({
        conditionTypeId,
        conditionNarrative: conditionTypeId !== "custom" && cat ? cat.conditionLabel : form.conditionNarrative,
        outcomeDetail: conditionTypeId !== "custom" && cat ? cat.defaultOutcomeDescription : form.outcomeDetail,
        customConditionName: conditionTypeId === "custom" ? form.customConditionName : "",
      });
    },
    [form.conditionNarrative, form.customConditionName, form.outcomeDetail, patchForm],
  );

  const isCustom = form.conditionTypeId === "custom";

  return (
    <>
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Condition template</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Catalog condition</span>
            <DropdownSelect
              variant="psc"
              value={form.conditionTypeId}
              onChange={onConditionTypeChange}
              options={CONDITION_SELECT_OPTIONS}
              placeholder="Select condition"
            />
          </label>
          {isCustom ? (
            <label className="psc-field psc-field-wide">
              <span className="psc-field-label">Custom condition name</span>
              <input
                className="psc-input"
                type="text"
                value={form.customConditionName}
                onChange={(e) => patchForm("customConditionName", e.target.value)}
                placeholder="e.g. Sanctions list match"
              />
            </label>
          ) : null}
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Condition narrative</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.conditionNarrative}
              onChange={(e) => patchForm("conditionNarrative", e.target.value)}
              placeholder="What must be true for this rule to fire"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Facts & thresholds (engine binding)</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Primary fact key</span>
            <input className="psc-input" type="text" value={form.variableCode} onChange={(e) => patchForm("variableCode", e.target.value)} placeholder="variable_code" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Secondary fact key</span>
            <input className="psc-input" type="text" value={form.secondaryFactKey} onChange={(e) => patchForm("secondaryFactKey", e.target.value)} placeholder="optional" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Operator</span>
            <DropdownSelect variant="psc" value={form.operator} onChange={(v) => patchForm("operator", v)} options={UW_FACT_OPERATOR_OPTIONS} placeholder="Select" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Threshold / value A</span>
            <input className="psc-input" type="text" value={form.thresholdPrimary} onChange={(e) => patchForm("thresholdPrimary", e.target.value)} placeholder="e.g. 2000000" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Threshold / value B</span>
            <input className="psc-input" type="text" value={form.thresholdSecondary} onChange={(e) => patchForm("thresholdSecondary", e.target.value)} placeholder="optional" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Currency</span>
            <input className="psc-input" type="text" value={form.currency} onChange={(e) => patchForm("currency", e.target.value)} placeholder="e.g. AED" />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Outcome</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Outcome type</span>
            <DropdownSelect variant="psc" value={form.outcomeType} onChange={(v) => patchForm("outcomeType", v)} options={UW_OUTCOME_KIND_OPTIONS} placeholder="Select" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Outcome detail</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.outcomeDetail}
              onChange={(e) => patchForm("outcomeDetail", e.target.value)}
              placeholder="Instructions, referrals, loadings, exclusions"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Evaluation order & flow</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Priority</span>
            <input className="psc-input" type="text" value={form.priority} onChange={(e) => patchForm("priority", e.target.value)} placeholder="e.g. 10" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">When condition matches</span>
            <DropdownSelect variant="psc" value={form.onMatch} onChange={(v) => patchForm("onMatch", v)} options={UW_ON_MATCH_OPTIONS} placeholder="Select" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Combine with next rule</span>
            <DropdownSelect variant="psc" value={form.combineWithNext} onChange={(v) => patchForm("combineWithNext", v)} options={UW_COMBINE_WITH_NEXT_OPTIONS} placeholder="Select" />
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
              placeholder="Overrides, version, regulatory refs"
            />
          </label>
        </div>
      </div>
    </>
  );
}

function displayUwRuleTitle(row) {
  if (row.conditionTypeId === "custom" && row.customConditionName) {
    return row.customConditionName;
  }
  const cat = getUwConditionCatalogEntry(row.conditionTypeId);
  return cat?.conditionLabel || row.conditionTypeId || "Rule";
}

/**
 * @param {unknown} underwritingRules
 * @param {(next: object) => void} onUnderwritingRulesChange — receives normalized `{ items }`.
 */
export function ProductStudioUnderwritingPanel({ underwritingRules, onUnderwritingRulesChange }) {
  const list = useMemo(() => normalizeUnderwritingRulesConfiguration(underwritingRules).items, [underwritingRules]);

  const onPersistItems = useCallback(
    (items) => {
      onUnderwritingRulesChange(normalizeUnderwritingRulesConfiguration({ items }));
    },
    [onUnderwritingRulesChange],
  );

  const resolveRowById = useCallback(
    (id) => list.find((x) => x.id === id) || DEMO_UNDERWRITING_RULES_LIST.find((x) => x.id === id),
    [list],
  );

  const isPersistedId = useCallback((id) => list.some((x) => x.id === id), [list]);

  const getCardDescription = useCallback((row) => {
    const o = row.outcomeDetail?.trim();
    if (o) {
      return o;
    }
    const d = row.conditionNarrative?.trim();
    if (d) {
      return d;
    }
    const cat = getUwConditionCatalogEntry(row.conditionTypeId);
    return cat?.defaultOutcomeDescription || "—";
  }, []);

  const getCardMeta = useCallback((row) => {
    return [
      { label: "Outcome", value: labelFromUwOptions(UW_OUTCOME_KIND_OPTIONS, row.outcomeType) },
      { label: "Operator", value: labelFromUwOptions(UW_FACT_OPERATOR_OPTIONS, row.operator) },
      { label: "Priority", value: row.priority?.trim() || "—" },
      { label: "Active", value: row.active || "—" },
    ];
  }, []);

  const renderDialogBody = useCallback(
    ({ form, patchForm }) => <UnderwritingDialogBody form={form} patchForm={patchForm} />,
    [],
  );

  return (
    <ProductStudioLineItemsShell
      panelClassName="psc-charges-panel"
      listTitle="UW rules"
      createButtonLabel="Create rule"
      removeConfirmMessage="Remove this underwriting rule from the product?"
      persistedItems={list}
      demoItems={DEMO_UNDERWRITING_RULES_LIST}
      onPersistItems={onPersistItems}
      resolveRowById={resolveRowById}
      isPersistedId={isPersistedId}
      emptyForm={emptyUwRuleForm}
      rowToForm={uwRuleRowToForm}
      formToRowPartial={uwRuleFormToRowPartial}
      validateForm={validateUwRuleForm}
      dialogTitleCreate="Create underwriting rule"
      dialogTitleEdit="Edit underwriting rule"
      saveLabelCreate="Save rule"
      saveLabelEdit="Save changes"
      actionsSectionTitle="Save rule"
      dialogHeadingId="psc-uw-rules-dialog-title"
      getCardTitle={displayUwRuleTitle}
      getCardDescription={getCardDescription}
      getCardMeta={getCardMeta}
      renderDialogBody={renderDialogBody}
    />
  );
}
