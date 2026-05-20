import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { uid } from "./productStudioStore.js";

/**
 * Shared Product Studio pattern: persisted line items + optional demo list,
 * card list, create/edit dialog chrome, remove when not viewing demo-only data.
 *
 * Domain panels supply catalog-specific form UI via `renderDialogBody` and
 * row/form helpers; this shell owns dialog state, Escape, and list/edit/save/remove flow.
 *
 * @param {object} props
 * @param {string} [props.panelClassName]
 * @param {string} [props.lead]
 * @param {string} props.listTitle — shown as "{listTitle} ({count})"
 * @param {string} props.createButtonLabel
 * @param {string} props.removeConfirmMessage
 * @param {unknown[]} props.persistedItems
 * @param {unknown[]} props.demoItems
 * @param {(items: unknown[]) => void} props.onPersistItems
 * @param {(id: string) => unknown | undefined} props.resolveRowById
 * @param {(id: string) => boolean} props.isPersistedId
 * @param {() => object} props.emptyForm
 * @param {(row: unknown) => object} props.rowToForm
 * @param {(form: object) => object} props.formToRowPartial — row fields without `id`
 * @param {(form: object) => string | null} props.validateForm
 * @param {string} props.dialogTitleCreate
 * @param {string} props.dialogTitleEdit
 * @param {string} props.saveLabelCreate
 * @param {string} props.saveLabelEdit
 * @param {string} props.actionsSectionTitle
 * @param {string} props.dialogHeadingId — unique `id` for `aria-labelledby`
 * @param {(row: unknown) => string} props.getCardTitle
 * @param {(row: unknown) => string} props.getCardDescription
 * @param {(row: unknown) => { label: string; value: string }[]} props.getCardMeta
 * @param {(ctx: { form: object; patchForm: Function; isEdit: boolean; editingId: string | null }) => import("react").ReactNode} props.renderDialogBody
 * @param {(id: string) => void} [props.onViewItemDetails] — when set, list shows View details (fund-style) instead of inline Edit
 */
export function ProductStudioLineItemsShell({
  panelClassName = "psc-charges-panel",
  lead,
  listTitle,
  createButtonLabel,
  removeConfirmMessage,
  persistedItems,
  demoItems,
  onPersistItems,
  resolveRowById,
  isPersistedId,
  emptyForm,
  rowToForm,
  formToRowPartial,
  validateForm,
  dialogTitleCreate,
  dialogTitleEdit,
  saveLabelCreate,
  saveLabelEdit,
  actionsSectionTitle,
  dialogHeadingId,
  getCardTitle,
  getCardDescription,
  getCardMeta,
  renderDialogBody,
  onViewItemDetails,
}) {
  const viewDetailsEnabled = typeof onViewItemDetails === "function";
  const list = useMemo(() => (Array.isArray(persistedItems) ? persistedItems : []), [persistedItems]);
  const demos = useMemo(() => (Array.isArray(demoItems) ? demoItems : []), [demoItems]);
  const hasSaved = list.length > 0;
  const displayList = hasSaved ? list : demos;
  const listIsMock = !hasSaved;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm());

  const patchForm = useCallback((keyOrPatch, maybeValue) => {
    if (typeof keyOrPatch === "string") {
      const key = keyOrPatch;
      const v = maybeValue;
      setForm((f) => ({ ...f, [key]: v }));
      return;
    }
    if (keyOrPatch && typeof keyOrPatch === "object") {
      const patch = keyOrPatch;
      setForm((f) => ({ ...f, ...patch }));
    }
  }, []);

  const resetDialog = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
  }, [emptyForm]);

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

  const openCreate = useCallback(() => {
    resetDialog();
    setForm(emptyForm());
    setDialogOpen(true);
  }, [emptyForm, resetDialog]);

  const openEdit = useCallback(
    (id) => {
      const row = resolveRowById(id);
      if (!row) {
        return;
      }
      setEditingId(isPersistedId(id) ? id : null);
      setForm(rowToForm(row));
      setDialogOpen(true);
    },
    [isPersistedId, resolveRowById, rowToForm],
  );

  const saveRow = useCallback(() => {
    const err = validateForm(form);
    if (err) {
      window.alert(err);
      return;
    }
    const partial = formToRowPartial(form);
    const row = {
      ...partial,
      id: editingId || uid(),
    };
    const next = editingId ? list.map((x) => (x.id === editingId ? row : x)) : [...list, row];
    onPersistItems(next);
    closeDialog();
  }, [closeDialog, editingId, form, formToRowPartial, list, onPersistItems, validateForm]);

  const removeItem = useCallback(
    (id) => {
      if (!window.confirm(removeConfirmMessage)) {
        return;
      }
      onPersistItems(list.filter((x) => x.id !== id));
      if (dialogOpen && editingId === id) {
        closeDialog();
      }
    },
    [closeDialog, dialogOpen, editingId, list, onPersistItems, removeConfirmMessage],
  );

  const isEdit = Boolean(editingId);
  const dialogTitle = isEdit ? dialogTitleEdit : dialogTitleCreate;
  const saveLabel = isEdit ? saveLabelEdit : saveLabelCreate;

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
          aria-labelledby={dialogHeadingId}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id={dialogHeadingId} className="psc-benefit-dialog-title">
              {dialogTitle}
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeDialog}>
              ×
            </button>
          </header>
          <div className="psc-benefit-dialog-body">
            {renderDialogBody({ form, patchForm, isEdit, editingId })}
            <div className="psc-field-section psc-benefit-dialog-actions-section">
              <h3 className="psc-field-section-title psc-core-benefits-subtitle">{actionsSectionTitle}</h3>
              <div className="psc-benefit-dialog-footer">
                <button type="button" className="primary-button" onClick={saveRow}>
                  {saveLabel}
                </button>
                <button type="button" className="secondary-button" onClick={closeDialog}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <div className={panelClassName}>
      {lead ? <p className="psc-charges-lead">{lead}</p> : null}

      <div className="psc-core-benefits-list-wrap">
        <div className="psc-core-benefits-section-head">
          <h2 className="psc-field-section-title psc-core-benefits-list-title">
            {listTitle} ({displayList.length})
          </h2>
          <button type="button" className="primary-button psc-core-benefits-add-btn" onClick={openCreate}>
            {createButtonLabel}
          </button>
        </div>
        <ul className="psc-benefit-cards" role="list">
          {displayList.map((row) => {
            const meta = getCardMeta(row);
            return (
              <li key={row.id} className={`psc-benefit-card${listIsMock ? " psc-benefit-card--demo" : ""}`}>
                <div className="psc-benefit-card-body">
                  <div className="psc-benefit-card-lead">
                    <p className="psc-benefit-card-name">{getCardTitle(row)}</p>
                    <p className="psc-benefit-card-desc">{getCardDescription(row)}</p>
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
                      {viewDetailsEnabled ? (
                        <button
                          type="button"
                          className="primary-button psc-benefit-card-view"
                          onClick={() => onViewItemDetails(row.id)}
                        >
                          View details
                        </button>
                      ) : (
                        <button type="button" className="psc-card-action psc-studio-row-edit" onClick={() => openEdit(row.id)}>
                          Edit
                        </button>
                      )}
                      {!listIsMock && !viewDetailsEnabled ? (
                        <button type="button" className="secondary-button psc-benefit-card-remove" onClick={() => removeItem(row.id)}>
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
