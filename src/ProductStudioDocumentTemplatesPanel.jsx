import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { ProductStudioLineItemsShell } from "./ProductStudioLineItemsShell.jsx";
import {
  DEMO_DOCUMENT_TEMPLATES_LIST,
  DOCUMENT_REQUIREMENT_OPTIONS,
  DOCUMENT_TEMPLATE_CATALOG,
  YES_NO_ACTIVE,
  labelDocumentRequirement,
  documentTemplateFormToRowPartial,
  documentTemplateRowToForm,
  emptyDocumentTemplateForm,
  getDocumentCatalogEntry,
  normalizeDocumentTemplatesConfiguration,
  validateDocumentTemplateForm,
} from "./productStudioDocumentTemplates.js";

const DOCUMENT_TYPE_SELECT_OPTIONS = DOCUMENT_TEMPLATE_CATALOG.map((c) => ({ value: c.id, label: c.documentName }));

function DocumentTemplateDialogBody({ form, patchForm }) {
  const onDocumentTypeChange = useCallback(
    (documentTypeId) => {
      const cat = getDocumentCatalogEntry(documentTypeId);
      patchForm({
        documentTypeId,
        triggerSummary: documentTypeId !== "custom" && cat ? cat.catalogTrigger : form.triggerSummary,
        customDocumentName: documentTypeId === "custom" ? form.customDocumentName : "",
      });
    },
    [form.customDocumentName, form.triggerSummary, patchForm],
  );

  const isCustom = form.documentTypeId === "custom";

  return (
    <>
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Document</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Document</span>
            <DropdownSelect
              variant="psc"
              value={form.documentTypeId}
              onChange={onDocumentTypeChange}
              options={DOCUMENT_TYPE_SELECT_OPTIONS}
              placeholder="Select document"
            />
          </label>
          {isCustom ? (
            <label className="psc-field psc-field-wide">
              <span className="psc-field-label">Custom document name</span>
              <input
                className="psc-input"
                type="text"
                value={form.customDocumentName}
                onChange={(e) => patchForm("customDocumentName", e.target.value)}
                placeholder="e.g. Regional addendum"
              />
            </label>
          ) : null}
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Trigger</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.triggerSummary}
              onChange={(e) => patchForm("triggerSummary", e.target.value)}
              placeholder="When this document is generated"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Template</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Template code</span>
            <input className="psc-input" type="text" value={form.templateCode} onChange={(e) => patchForm("templateCode", e.target.value)} placeholder="e.g. TMPL-QUOTE-V3" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Mandatory / optional</span>
            <DropdownSelect
              variant="psc"
              value={form.requirementStatus}
              onChange={(v) => patchForm("requirementStatus", v)}
              options={DOCUMENT_REQUIREMENT_OPTIONS}
              placeholder="Select"
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
              placeholder=""
            />
          </label>
        </div>
      </div>
    </>
  );
}

function displayDocumentTitle(row) {
  if (row.documentTypeId === "custom" && row.customDocumentName) {
    return row.customDocumentName;
  }
  const cat = getDocumentCatalogEntry(row.documentTypeId);
  return cat?.documentName || row.documentTypeId || "Document";
}

/**
 * @param {unknown} documentTemplates
 * @param {(next: object) => void} onDocumentTemplatesChange — normalized `{ items }`.
 */
export function ProductStudioDocumentTemplatesPanel({ documentTemplates, onDocumentTemplatesChange }) {
  const list = useMemo(() => normalizeDocumentTemplatesConfiguration(documentTemplates).items, [documentTemplates]);

  const onPersistItems = useCallback(
    (items) => {
      onDocumentTemplatesChange(normalizeDocumentTemplatesConfiguration({ items }));
    },
    [onDocumentTemplatesChange],
  );

  const resolveRowById = useCallback(
    (id) => list.find((x) => x.id === id) || DEMO_DOCUMENT_TEMPLATES_LIST.find((x) => x.id === id),
    [list],
  );

  const isPersistedId = useCallback((id) => list.some((x) => x.id === id), [list]);

  const getCardDescription = useCallback((row) => {
    const t = row.triggerSummary?.trim();
    if (t) {
      return t;
    }
    return getDocumentCatalogEntry(row.documentTypeId)?.catalogTrigger || "—";
  }, []);

  const getCardMeta = useCallback((row) => {
    return [
      { label: "Template", value: row.templateCode?.trim() || "—" },
      { label: "Requirement", value: labelDocumentRequirement(row.requirementStatus) },
      { label: "Active", value: row.active || "—" },
    ];
  }, []);

  const renderDialogBody = useCallback(
    ({ form, patchForm }) => <DocumentTemplateDialogBody form={form} patchForm={patchForm} />,
    [],
  );

  return (
    <ProductStudioLineItemsShell
      panelClassName="psc-charges-panel"
      listTitle="Document templates"
      createButtonLabel="Create document"
      removeConfirmMessage="Remove this document template from the product?"
      persistedItems={list}
      demoItems={DEMO_DOCUMENT_TEMPLATES_LIST}
      onPersistItems={onPersistItems}
      resolveRowById={resolveRowById}
      isPersistedId={isPersistedId}
      emptyForm={emptyDocumentTemplateForm}
      rowToForm={documentTemplateRowToForm}
      formToRowPartial={documentTemplateFormToRowPartial}
      validateForm={validateDocumentTemplateForm}
      dialogTitleCreate="Create document"
      dialogTitleEdit="Edit document"
      saveLabelCreate="Save document"
      saveLabelEdit="Save changes"
      actionsSectionTitle="Save document"
      dialogHeadingId="psc-document-templates-dialog-title"
      getCardTitle={displayDocumentTitle}
      getCardDescription={getCardDescription}
      getCardMeta={getCardMeta}
      renderDialogBody={renderDialogBody}
    />
  );
}
