import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { ProductStudioLineItemsShell } from "./ProductStudioLineItemsShell.jsx";
import {
  DEMO_MEDICAL_MATRIX_LIST,
  YES_NO_ACTIVE,
  emptyMedicalMatrixRowForm,
  medicalMatrixFormToRowPartial,
  medicalMatrixRowToForm,
  normalizeMedicalRequirementMatrixConfiguration,
  validateMedicalMatrixForm,
} from "./productStudioMedicalMatrix.js";

function MedicalMatrixDialogBody({ form, patchForm }) {
  return (
    <>
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Matrix row</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Age band</span>
            <input className="psc-input" type="text" value={form.ageBand} onChange={(e) => patchForm("ageBand", e.target.value)} placeholder="e.g. 18–40" />
          </label>
          <label className="psc-field">
            <span className="psc-field-label">Sum assured band</span>
            <input className="psc-input" type="text" value={form.sumAssuredBand} onChange={(e) => patchForm("sumAssuredBand", e.target.value)} placeholder="e.g. Up to AED 500k" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Requirement</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.requirement}
              onChange={(e) => patchForm("requirement", e.target.value)}
              placeholder="e.g. No medical, medical exam, full medical + referral"
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

function cardTitle(row) {
  return row.ageBand || "—";
}

/**
 * @param {unknown} medicalRequirementMatrix
 * @param {(next: object) => void} onMedicalRequirementMatrixChange — normalized `{ items }`.
 */
export function ProductStudioMedicalMatrixPanel({ medicalRequirementMatrix, onMedicalRequirementMatrixChange }) {
  const list = useMemo(() => normalizeMedicalRequirementMatrixConfiguration(medicalRequirementMatrix).items, [medicalRequirementMatrix]);

  const onPersistItems = useCallback(
    (items) => {
      onMedicalRequirementMatrixChange(normalizeMedicalRequirementMatrixConfiguration({ items }));
    },
    [onMedicalRequirementMatrixChange],
  );

  const resolveRowById = useCallback(
    (id) => list.find((x) => x.id === id) || DEMO_MEDICAL_MATRIX_LIST.find((x) => x.id === id),
    [list],
  );

  const isPersistedId = useCallback((id) => list.some((x) => x.id === id), [list]);

  const getCardDescription = useCallback((row) => row.requirement?.trim() || "—", []);

  const getCardMeta = useCallback(
    (row) => [
      { label: "Sum assured", value: row.sumAssuredBand?.trim() || "—" },
      { label: "Active", value: row.active || "—" },
    ],
    [],
  );

  const renderDialogBody = useCallback(
    ({ form, patchForm }) => <MedicalMatrixDialogBody form={form} patchForm={patchForm} />,
    [],
  );

  return (
    <ProductStudioLineItemsShell
      panelClassName="psc-charges-panel"
      listTitle="Medical requirement matrix"
      createButtonLabel="Add row"
      removeConfirmMessage="Remove this row from the matrix?"
      persistedItems={list}
      demoItems={DEMO_MEDICAL_MATRIX_LIST}
      onPersistItems={onPersistItems}
      resolveRowById={resolveRowById}
      isPersistedId={isPersistedId}
      emptyForm={emptyMedicalMatrixRowForm}
      rowToForm={medicalMatrixRowToForm}
      formToRowPartial={medicalMatrixFormToRowPartial}
      validateForm={validateMedicalMatrixForm}
      dialogTitleCreate="Add medical requirement"
      dialogTitleEdit="Edit medical requirement"
      saveLabelCreate="Save row"
      saveLabelEdit="Save changes"
      actionsSectionTitle="Save row"
      dialogHeadingId="psc-medical-matrix-dialog-title"
      getCardTitle={cardTitle}
      getCardDescription={getCardDescription}
      getCardMeta={getCardMeta}
      renderDialogBody={renderDialogBody}
    />
  );
}
