import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitleWithBack } from "./PageTitleWithBack.jsx";
import { defaultProductConfiguration } from "./productStudioConfiguration.js";
import { ProductStudioRiderFormFields } from "./ProductStudioRiderFormFields.jsx";
import {
  defaultRiderRuleDetails,
  getPresetRiderDefinition,
  normalizeRiderRuleDetails,
  normalizeRidersConfig,
} from "./productStudioRiders.js";
import { applyCatalogDraft, findProductById, loadProductCatalog, saveProductCatalog, uid } from "./productStudioStore.js";

function persistProductRidersOnly(productId, nextRidersCfg) {
  const list = loadProductCatalog();
  const draft = findProductById(list, productId);
  if (!draft) {
    return false;
  }
  const pc = { ...(draft.productConfiguration || defaultProductConfiguration()) };
  pc.riders = normalizeRidersConfig(nextRidersCfg);
  const nextDraft = { ...draft, productConfiguration: pc };
  saveProductCatalog(applyCatalogDraft(list, nextDraft));
  return true;
}

/**
 * Full-page edit rider rules (Product Studio).
 * Route: `.../:productId/riders/edit/:kind/:riderId` (kind = preset | custom). New riders use the dialog on the Riders tab.
 */
export function ProductStudioRiderFormPage() {
  const navigate = useNavigate();
  const { productId, kind, riderId } = useParams();
  const isPresetEdit = kind === "preset";
  const isCustomEdit = kind === "custom";

  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setProduct(null);
      setForm(null);
      return;
    }
    setNotFound(false);
    setProduct(found);
    const cfg = normalizeRidersConfig(found.productConfiguration?.riders);

    if (kind === "preset") {
      const def = getPresetRiderDefinition(riderId);
      if (!def) {
        setNotFound(true);
        setForm(null);
        return;
      }
      const rules = cfg.presetRiderRules[riderId] ? { ...cfg.presetRiderRules[riderId] } : defaultRiderRuleDetails();
      setForm({
        riderName: def.riderName,
        description: def.description,
        rules,
        readOnlyIdentity: true,
      });
      return;
    }

    if (kind === "custom") {
      const row = (cfg.customRiders || []).find((c) => c.id === riderId);
      if (!row) {
        setNotFound(true);
        setForm(null);
        return;
      }
      setForm({
        riderName: row.riderName,
        description: row.description,
        enabled: Boolean(row.enabled),
        rules: row.rules ? { ...normalizeRiderRuleDetails(row.rules) } : defaultRiderRuleDetails(),
        readOnlyIdentity: false,
      });
      return;
    }

    setNotFound(true);
    setForm(null);
  }, [productId, kind, riderId]);

  const ccy = (product?.productCurrency || "AED").trim() || "AED";

  const patchRules = useCallback((key, value) => {
    setForm((f) => (f ? { ...f, rules: { ...f.rules, [key]: value } } : f));
  }, []);

  const save = useCallback(() => {
    if (!product || !form) {
      return;
    }
    const cfg = normalizeRidersConfig(product.productConfiguration?.riders);
    const rules = normalizeRiderRuleDetails(form.rules);

    if (isCustomEdit) {
      const name = form.riderName?.trim();
      if (!name) {
        window.alert("Rider name is required.");
        return;
      }
      const next = {
        ...cfg,
        customRiders: cfg.customRiders.map((c) =>
          c.id === riderId
            ? {
                ...c,
                riderName: name,
                description: form.description?.trim() || "",
                enabled: Boolean(form.enabled),
                rules,
              }
            : c,
        ),
      };
      if (!persistProductRidersOnly(productId, next)) {
        window.alert("Could not save rider.");
        return;
      }
      navigate(`/underwriter/product-studio/${productId}`);
      return;
    }

    if (isPresetEdit) {
      const next = {
        ...cfg,
        presetRiderRules: { ...cfg.presetRiderRules, [riderId]: rules },
      };
      if (!persistProductRidersOnly(productId, next)) {
        window.alert("Could not save rider.");
        return;
      }
      navigate(`/underwriter/product-studio/${productId}`);
    }
  }, [form, isCustomEdit, isPresetEdit, product, productId, riderId, navigate]);

  const cancel = useCallback(() => {
    navigate(`/underwriter/product-studio/${productId}`);
  }, [navigate, productId]);

  const title = useMemo(() => {
    if (form?.riderName) {
      return `Edit rider — ${form.riderName}`;
    }
    return "Edit rider";
  }, [form?.riderName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Product configuration"
            eyebrow="Underwriter portal"
            onBack={() => navigate(`/underwriter/product-studio/${productId}`)}
            title="Rider not found"
          />
        </header>
      </main>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Product configuration"
          eyebrow="Underwriter portal"
          onBack={cancel}
          title={title}
          subtitle={
            <p>
              {isPresetEdit
                ? "Catalog rider — name and description are fixed. Use the Riders list toggle to enable or disable; this page saves product-specific rules only."
                : "Define rider eligibility and limits for this product."}
            </p>
          }
        />
      </header>

      <section className="psc-form-card psc-rider-form-card">
        <ProductStudioRiderFormFields form={form} setForm={setForm} patchRules={patchRules} currency={ccy} variant="page" />

        <div className="psc-form-actions psc-rider-form-footer">
          <button type="button" className="primary-button" onClick={save}>
            Save rider
          </button>
          <button type="button" className="secondary-button" onClick={cancel}>
            Cancel
          </button>
        </div>
      </section>
    </main>
  );
}
