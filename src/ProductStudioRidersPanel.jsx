import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductStudioRiderFormFields } from "./ProductStudioRiderFormFields.jsx";
import {
  PRESET_RIDER_DEFINITIONS,
  defaultRiderRuleDetails,
  normalizeRiderRuleDetails,
  normalizeRidersConfig,
} from "./productStudioRiders.js";
import { uid } from "./productStudioStore.js";

function RiderToggle({ enabled, onChange, labelledBy, ariaLabel }) {
  const inputProps =
    labelledBy != null && labelledBy !== ""
      ? { "aria-labelledby": labelledBy }
      : { "aria-label": ariaLabel || "Enable rider" };
  return (
    <label className="psc-rider-switch">
      <input
        type="checkbox"
        className="psc-rider-switch-input"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        {...inputProps}
      />
      <span className="psc-rider-switch-track" aria-hidden>
        <span className="psc-rider-switch-thumb" />
      </span>
    </label>
  );
}

function emptyNewRiderForm() {
  return {
    riderName: "",
    description: "",
    enabled: true,
    rules: defaultRiderRuleDetails(),
  };
}

/**
 * @param {{ enabledPresetIds: string[], customRiders: object[], presetRiderRules?: object }} riders
 * @param {(next: object) => void} onRidersChange
 * @param {string} productId
 * @param {string} [productCurrency]
 */
export function ProductStudioRidersPanel({ riders, onRidersChange, productId, productCurrency = "AED" }) {
  const navigate = useNavigate();
  const base = `/underwriter/product-studio/${productId}`;
  const ccy = (productCurrency || "AED").trim() || "AED";

  const cfg = useMemo(() => normalizeRidersConfig(riders), [riders]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(() => emptyNewRiderForm());

  const emit = useCallback(
    (next) => {
      onRidersChange(normalizeRidersConfig(next));
    },
    [onRidersChange],
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setForm(emptyNewRiderForm());
  }, []);

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
    setForm(emptyNewRiderForm());
    setDialogOpen(true);
  }, []);

  const patchRules = useCallback((key, value) => {
    setForm((f) => (f ? { ...f, rules: { ...f.rules, [key]: value } } : f));
  }, []);

  const saveNewRider = useCallback(() => {
    const name = form.riderName?.trim();
    if (!name) {
      window.alert("Rider name is required.");
      return;
    }
    const rules = normalizeRiderRuleDetails(form.rules);
    const row = {
      id: uid(),
      riderName: name,
      description: form.description?.trim() || "",
      enabled: Boolean(form.enabled),
      rules,
    };
    emit({
      ...cfg,
      customRiders: [...(cfg.customRiders || []), row],
    });
    closeDialog();
  }, [cfg, closeDialog, emit, form]);

  const presetEnabled = useMemo(() => new Set(cfg.enabledPresetIds), [cfg.enabledPresetIds]);

  const rows = useMemo(() => {
    const presetRows = PRESET_RIDER_DEFINITIONS.map((p) => ({
      kind: "preset",
      id: p.id,
      riderName: p.riderName,
      description: p.description,
      enabled: presetEnabled.has(p.id),
    }));
    const customRows = (cfg.customRiders || []).map((c) => ({
      kind: "custom",
      id: c.id,
      riderName: c.riderName,
      description: c.description || "",
      enabled: Boolean(c.enabled),
    }));
    return [...presetRows, ...customRows];
  }, [cfg.customRiders, presetEnabled]);

  const goEdit = useCallback(
    (kind, id) => {
      navigate(`${base}/riders/edit/${kind}/${encodeURIComponent(id)}`);
    },
    [navigate, base],
  );

  const setPresetEnabled = useCallback(
    (presetId, on) => {
      const set = new Set(cfg.enabledPresetIds);
      if (on) {
        set.add(presetId);
      } else {
        set.delete(presetId);
      }
      emit({ ...cfg, enabledPresetIds: [...set] });
    },
    [cfg, emit],
  );

  const setCustomEnabled = useCallback(
    (customId, on) => {
      const nextCustom = (cfg.customRiders || []).map((c) => (c.id === customId ? { ...c, enabled: on } : c));
      emit({ ...cfg, customRiders: nextCustom });
    },
    [cfg, emit],
  );

  const removeCustom = useCallback(
    (customId) => {
      if (!window.confirm("Remove this custom rider from the product?")) {
        return;
      }
      emit({
        ...cfg,
        customRiders: (cfg.customRiders || []).filter((c) => c.id !== customId),
      });
    },
    [cfg, emit],
  );

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
          className="psc-benefit-dialog psc-rider-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="psc-rider-add-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="psc-benefit-dialog-header">
            <h2 id="psc-rider-add-dialog-title" className="psc-benefit-dialog-title">
              Create rider
            </h2>
            <button type="button" className="psc-benefit-dialog-close" aria-label="Close dialog" onClick={closeDialog}>
              ×
            </button>
          </header>
          <div className="psc-benefit-dialog-body">
            <ProductStudioRiderFormFields form={form} setForm={setForm} patchRules={patchRules} currency={ccy} variant="dialog" />
            <div className="psc-field-section psc-benefit-dialog-actions-section">
              <h3 className="psc-field-section-title psc-core-benefits-subtitle">Save rider</h3>
              <div className="psc-benefit-dialog-footer">
                <button type="button" className="primary-button" onClick={saveNewRider}>
                  Save rider
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
    <div className="psc-riders-panel">
      <div className="psc-core-benefits-section-head">
        <h2 className="psc-field-section-title psc-core-benefits-list-title">Riders ({rows.length})</h2>
        <button type="button" className="primary-button psc-core-benefits-add-btn" onClick={openAddDialog}>
          Create rider
        </button>
      </div>
      <ul className="psc-rider-cards" role="list">
        {rows.map((r) => {
          const titleId = `psc-rider-title-${r.id}`;
          return (
            <li key={r.id} className={`psc-rider-card${r.kind === "custom" ? " psc-rider-card--custom" : ""}`}>
              <div className="psc-rider-card-main">
                <p id={titleId} className="psc-rider-card-name">
                  {r.riderName}
                </p>
                <p className="psc-rider-card-desc">{r.description}</p>
              </div>
              <div className="psc-rider-card-trail">
                <div className="psc-rider-card-actions-row">
                  <button type="button" className="psc-card-action" onClick={() => goEdit(r.kind, r.id)}>
                    Edit
                  </button>
                  {r.kind === "custom" ? (
                    <button type="button" className="psc-card-action psc-rider-card-remove" onClick={() => removeCustom(r.id)}>
                      Remove
                    </button>
                  ) : null}
                </div>
                <RiderToggle
                  enabled={r.enabled}
                  onChange={(on) => (r.kind === "preset" ? setPresetEnabled(r.id, on) : setCustomEnabled(r.id, on))}
                  labelledBy={titleId}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {dialogNode}
    </div>
  );
}
