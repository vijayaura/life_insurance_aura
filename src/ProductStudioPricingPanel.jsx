import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRICING_METHOD_CATALOG,
  PRICING_METHOD_FORM_BLUEPRINT,
  getPricingMethodMeta,
  normalizePricingConfiguration,
  suggestPricingMethodId,
} from "./productStudioPricing.js";

function renderField(def, value, onChange) {
  if (def.type === "textarea") {
    return (
      <label key={def.key} className="psc-field psc-field-wide">
        <span className="psc-field-label">{def.label}</span>
        <textarea
          className="psc-input psc-textarea psc-textarea--compact"
          rows={def.key === "configNotes" ? 3 : 2}
          value={value ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  if (def.type === "select") {
    const opts = def.options || [];
    return (
      <label key={def.key} className="psc-field">
        <span className="psc-field-label">{def.label}</span>
        <select className="psc-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {opts.map((o) => (
            <option key={String(o)} value={o}>
              {o === "" ? "—" : o}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label key={def.key} className="psc-field">
      <span className="psc-field-label">{def.label}</span>
      <input className="psc-input" type="text" value={value ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/**
 * @param {{ productCategory?: string, productType?: string, productCurrency?: string }} product
 * @param {unknown} pricing
 * @param {(next: object) => void} onPricingChange
 */
export function ProductStudioPricingPanel({ product, pricing, onPricingChange }) {
  const cfg = useMemo(() => normalizePricingConfiguration(pricing), [pricing]);
  const suggestedId = useMemo(() => suggestPricingMethodId(product), [product]);
  const [focusMethodId, setFocusMethodId] = useState(cfg.selectedMethodId);

  useEffect(() => {
    setFocusMethodId(cfg.selectedMethodId);
  }, [cfg.selectedMethodId]);

  const emit = useCallback(
    (next) => {
      onPricingChange(normalizePricingConfiguration(next));
    },
    [onPricingChange],
  );

  const patchMethodField = useCallback(
    (methodId, key, value) => {
      const prev = cfg.methodConfigurations[methodId] || {};
      emit({
        ...cfg,
        methodConfigurations: {
          ...cfg.methodConfigurations,
          [methodId]: { ...prev, [key]: value },
        },
      });
    },
    [cfg, emit],
  );

  const applyRecommendation = useCallback(() => {
    emit({ ...cfg, selectedMethodId: suggestedId });
    setFocusMethodId(suggestedId);
  }, [cfg, emit, suggestedId]);

  const useFocusedAsProductMethod = useCallback(() => {
    emit({ ...cfg, selectedMethodId: focusMethodId });
  }, [cfg, emit, focusMethodId]);

  const focusMeta = getPricingMethodMeta(focusMethodId);
  const selectedMeta = getPricingMethodMeta(cfg.selectedMethodId);
  const blueprint = PRICING_METHOD_FORM_BLUEPRINT[focusMethodId] || PRICING_METHOD_FORM_BLUEPRINT.rate_table;
  const methodValues = cfg.methodConfigurations[focusMethodId] || {};

  const cat = String(product?.productCategory || "—").trim() || "—";
  const typ = String(product?.productType || "—").trim() || "—";
  const ccy = String(product?.productCurrency || "—").trim() || "—";

  const isViewingAlternate = focusMethodId !== cfg.selectedMethodId;
  const suggestedDiffers = suggestedId !== cfg.selectedMethodId;

  return (
    <div className="psc-pricing-panel">
      <div className="psc-pricing-context">
        <h3 className="psc-field-section-title psc-pricing-context-title">Product context</h3>
        <div className="psc-pricing-context-grid">
          <div className="psc-pricing-context-cell">
            <span className="psc-pricing-context-label">Category</span>
            <span className="psc-pricing-context-value">{cat}</span>
          </div>
          <div className="psc-pricing-context-cell">
            <span className="psc-pricing-context-label">Type</span>
            <span className="psc-pricing-context-value">{typ}</span>
          </div>
          <div className="psc-pricing-context-cell">
            <span className="psc-pricing-context-label">Currency</span>
            <span className="psc-pricing-context-value">{ccy}</span>
          </div>
          <div className="psc-pricing-context-cell psc-pricing-context-cell--wide">
            <span className="psc-pricing-context-label">Recommended pricing approach</span>
            <span className="psc-pricing-context-value">
              <strong>{getPricingMethodMeta(suggestedId).label}</strong>
              <span className="psc-pricing-context-sub"> — {getPricingMethodMeta(suggestedId).usedFor}</span>
            </span>
            {suggestedDiffers ? (
              <button type="button" className="psc-card-action psc-pricing-apply-rec" onClick={applyRecommendation}>
                Apply recommendation
              </button>
            ) : null}
          </div>
          <div className="psc-pricing-context-cell psc-pricing-context-cell--wide">
            <span className="psc-pricing-context-label">Pricing method in use for this product</span>
            <span className="psc-pricing-context-value">
              <strong>{selectedMeta.label}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="psc-field-section psc-pricing-methods-section">
        <h3 className="psc-field-section-title">Pricing methods — browse structure</h3>
        <p className="psc-pricing-methods-lead">
          Select a method to view its configuration layout. Each method keeps its own fields; only the method marked &quot;in use&quot; is the one applied to this product unless you change it.
        </p>
        <div className="psc-pricing-method-rail" role="tablist" aria-label="Pricing methods">
          {PRICING_METHOD_CATALOG.map((m) => {
            const isFocus = m.id === focusMethodId;
            const isProduct = m.id === cfg.selectedMethodId;
            const isSuggested = m.id === suggestedId;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isFocus}
                className={`psc-pricing-method-chip${isFocus ? " is-focus" : ""}${isProduct ? " is-in-use" : ""}${isSuggested ? " is-suggested" : ""}`}
                onClick={() => setFocusMethodId(m.id)}
              >
                <span className="psc-pricing-method-chip-label">{m.label}</span>
                <span className="psc-pricing-method-chip-used">{m.usedFor}</span>
                {isProduct ? <span className="psc-pricing-method-chip-badge">In use</span> : null}
                {isSuggested && !isProduct ? <span className="psc-pricing-method-chip-badge psc-pricing-method-chip-badge--soft">Suggested</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {isViewingAlternate ? (
        <div className="psc-pricing-preview-banner">
          <p>
            Viewing <strong>{focusMeta.label}</strong>. This product is set to use <strong>{selectedMeta.label}</strong>.
          </p>
          <button type="button" className="primary-button" onClick={useFocusedAsProductMethod}>
            Use {focusMeta.label} for this product
          </button>
        </div>
      ) : null}

      <div className="psc-pricing-method-form">
        <h3 className="psc-field-section-title psc-pricing-method-form-title">{focusMeta.label}</h3>
        <p className="psc-pricing-method-form-used">Used for: {focusMeta.usedFor}</p>

        {blueprint.map((section) => (
          <div key={section.title} className="psc-field-section">
            <h4 className="psc-field-section-title psc-core-benefits-subtitle">{section.title}</h4>
            <div className="psc-field-grid">{section.fields.map((f) => renderField(f, methodValues[f.key], (v) => patchMethodField(focusMethodId, f.key, v)))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
