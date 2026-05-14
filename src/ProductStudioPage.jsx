import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { PageTitleWithBack } from "./PageTitleWithBack.jsx";
import {
  DURATION_ELIGIBILITY_FIELD_SECTIONS,
  VIEW_CONFIG_TABS,
  defaultProductConfiguration,
  getDurationEligibilityFieldDef,
  getDurationEligibilityRuleLabel,
  parseDurationMultiselectValue,
  resolveDurationEligibilityDefault,
  serializeDurationMultiselectValue,
} from "./productStudioConfiguration.js";
import { CoreBenefitsRidersPanel } from "./ProductStudioCoreBenefitsPanel.jsx";
import { ProductStudioChargesPanel } from "./ProductStudioChargesPanel.jsx";
import { ProductStudioPricingPanel } from "./ProductStudioPricingPanel.jsx";
import { ProductStudioFundsPanel } from "./ProductStudioFundsPanel.jsx";
import { ProductStudioPolicyServicingPanel } from "./ProductStudioPolicyServicingPanel.jsx";
import { normalizeChargesConfiguration } from "./productStudioCharges.js";
import { normalizeFundsConfiguration } from "./productStudioFunds.js";
import { normalizePolicyServicingConfiguration } from "./productStudioPolicyServicing.js";
import { normalizePricingConfiguration } from "./productStudioPricing.js";
import { normalizeRidersConfig } from "./productStudioRiders.js";
import { ProductStudioRiderFormPage } from "./ProductStudioRiderFormPage.jsx";
import { ProductStudioRidersPanel } from "./ProductStudioRidersPanel.jsx";
import {
  applyCatalogDraft,
  catalogListRowSnapshots,
  defaultProductRecord,
  findProductById,
  hasProductCodeConflictWithOthers,
  loadProductCatalog,
  saveProductCatalog,
} from "./productStudioStore.js";

function mergeCoreBenefitsItemsIntoDraft(draft, items) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  const prev = pc.coreBenefitsAndRiders && typeof pc.coreBenefitsAndRiders === "object" ? pc.coreBenefitsAndRiders : {};
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      coreBenefitsAndRiders: {
        ...prev,
        items,
      },
    },
  };
}

function mergeRidersIntoDraft(draft, riders) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      riders: normalizeRidersConfig(riders),
    },
  };
}

function mergePricingIntoDraft(draft, pricing) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      pricing: normalizePricingConfiguration(pricing),
    },
  };
}

function mergeChargesIntoDraft(draft, charges) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      charges: normalizeChargesConfiguration(charges),
    },
  };
}

function mergeFundsIntoDraft(draft, items) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      funds: normalizeFundsConfiguration({ items: Array.isArray(items) ? items : [] }),
    },
  };
}

function mergePolicyServicingIntoDraft(draft, policyServicing) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      policyServicing: normalizePolicyServicingConfiguration(policyServicing),
    },
  };
}

const CATEGORY_OPTIONS = ["Protection", "Savings", "Whole Life", "Unit Linked", "Group Life", "Credit Life"];

const TYPE_OPTIONS = ["Term", "Whole Life", "Endowment", "ULIP", "Universal Life", "PA Life Package"];

const CURRENCY_OPTIONS = ["AED", "USD", "SAR", "OMR", "QAR", "BHD", "KWD"];

const STATUS_OPTIONS = ["Draft", "Under Review", "Approved", "Published", "Suspended", "Retired"];

/** CSS suffix for `psc-catalog-status--*` on list meta (matches STATUS_OPTIONS). */
function catalogProductStatusClass(status) {
  const s = (status || "").trim().toLowerCase();
  if (s === "published") {
    return "psc-catalog-status--published";
  }
  if (s === "approved") {
    return "psc-catalog-status--approved";
  }
  if (s === "under review") {
    return "psc-catalog-status--under-review";
  }
  if (s === "draft") {
    return "psc-catalog-status--draft";
  }
  if (s === "suspended") {
    return "psc-catalog-status--suspended";
  }
  if (s === "retired") {
    return "psc-catalog-status--retired";
  }
  return "psc-catalog-status--unknown";
}

const CHANNEL_OPTIONS = ["Direct", "Broker", "Bank", "Agent", "Affinity", "Digital"];

const SEGMENT_OPTIONS = ["Individual", "SME", "Group", "HNW", "Mass Retail"];

const JURISDICTION_OPTIONS = ["UAE", "Oman", "KSA", "Bahrain", "Qatar", "Kuwait"];

const TAKAFUL_OPTIONS = ["Takaful", "Conventional"];

const ADMIN_MODE_OPTIONS = ["Individual policy", "Group policy", "Master policy / certificate"];

/** Grouped by kind of data: identity, lifecycle, go-to-market, compliance. */
const FIELD_SECTIONS = [
  {
    title: "Product identity",
    fields: [
      {
        key: "productName",
        label: "Product Name",
        type: "text",
        placeholder: "Display name",
      },
      { key: "productCode", label: "Product Code", type: "text", placeholder: "PROD-001" },
      {
        key: "productCategory",
        label: "Product Category",
        type: "select",
        options: CATEGORY_OPTIONS,
      },
      {
        key: "productType",
        label: "Product Type",
        type: "select",
        options: TYPE_OPTIONS,
      },
      {
        key: "productVersion",
        label: "Product Version",
        type: "text",
        placeholder: "V1.0",
      },
    ],
  },
  {
    title: "Lifecycle",
    fields: [
      {
        key: "productStatus",
        label: "Product Status",
        type: "select",
        options: STATUS_OPTIONS,
      },
      {
        key: "effectiveDate",
        label: "Effective Date",
        type: "date",
      },
      {
        key: "expiryDate",
        label: "Expiry Date",
        type: "date",
      },
    ],
  },
  {
    title: "Distribution & market",
    fields: [
      {
        key: "productCurrency",
        label: "Product Currency",
        type: "select",
        options: CURRENCY_OPTIONS,
      },
      {
        key: "distributionChannel",
        label: "Distribution Channel",
        type: "select",
        options: CHANNEL_OPTIONS,
      },
      {
        key: "targetSegment",
        label: "Target Segment",
        type: "select",
        options: SEGMENT_OPTIONS,
      },
    ],
  },
  {
    title: "Regulatory & administration",
    fields: [
      {
        key: "regulatoryJurisdiction",
        label: "Regulatory Jurisdiction",
        type: "select",
        options: JURISDICTION_OPTIONS,
      },
      {
        key: "takafulOrConventional",
        label: "Takaful / Conventional",
        type: "select",
        options: TAKAFUL_OPTIONS,
      },
      {
        key: "policyAdminMode",
        label: "Policy Administration Mode",
        type: "select",
        options: ADMIN_MODE_OPTIONS,
      },
    ],
  },
];

function FormField({ def, value, onChange }) {
  if (def.type === "select") {
    return (
      <label className="psc-field">
        <span className="psc-field-label">{def.label}</span>
        <DropdownSelect variant="psc" value={value ?? ""} onChange={onChange} options={def.options || []} placeholder="Select" />
      </label>
    );
  }
  return (
    <label className="psc-field">
      <span className="psc-field-label">{def.label}</span>
      <input
        className="psc-input"
        type={def.type || "text"}
        placeholder={def.placeholder || ""}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function PscDurationMultiselect({
  options,
  selected,
  onSelectedChange,
  placeholder,
  ariaLabel,
  optionDescriptions,
  widePanel = false,
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const uid = useId();
  const listboxId = `${uid}-ms-list`;
  const triggerId = `${uid}-ms-trigger`;
  const optionSet = useMemo(() => new Set(options), [options]);

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return undefined;
    }
    const trigger = triggerRef.current;
    if (!trigger) {
      return undefined;
    }
    const update = () => {
      const r = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom - 12;
      const maxH = Math.min(340, Math.max(140, spaceBelow));
      const minW = widePanel ? 440 : r.width;
      const widthPx = Math.min(Math.max(r.width, minW), window.innerWidth - r.left - 12);
      setPanelStyle({
        position: "fixed",
        left: `${r.left}px`,
        top: `${r.bottom + 4}px`,
        width: `${widthPx}px`,
        maxHeight: `${maxH}px`,
        zIndex: 10050,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, widePanel]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onDown = (e) => {
      const t = e.target;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = useCallback(
    (opt) => {
      if (selected.includes(opt)) {
        onSelectedChange(selected.filter((s) => s !== opt));
      } else {
        onSelectedChange([...selected, opt]);
      }
    },
    [onSelectedChange, selected],
  );

  const removeChip = useCallback(
    (e, item) => {
      e.stopPropagation();
      onSelectedChange(selected.filter((s) => s !== item));
    },
    [onSelectedChange, selected],
  );

  const panel =
    open &&
    panelStyle && (
      <div ref={panelRef} className="psc-ms-panel" id={listboxId} role="listbox" aria-multiselectable="true" style={panelStyle}>
        {options.map((opt) => {
          const isOn = selected.includes(opt);
          const desc = optionDescriptions?.[opt];
          return (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={isOn}
              className={`psc-ms-option ${isOn ? "is-on" : ""} ${desc ? "has-desc" : ""}`}
              onClick={() => toggle(opt)}
            >
              <span className="psc-ms-option-check" aria-hidden>
                {isOn ? "✓" : ""}
              </span>
              <span className="psc-ms-option-body">
                <span className="psc-ms-option-title">{opt}</span>
                {desc ? <span className="psc-ms-option-desc">{desc}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    );

  return (
    <div className="psc-ms">
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        id={triggerId}
        className="psc-ms-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={(e) => {
          if (e.target.closest(".psc-ms-chip-remove")) {
            return;
          }
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        <div className="psc-ms-trigger-body">
          {selected.length === 0 ? (
            <span className="psc-ms-placeholder">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span key={item} className={`psc-ms-chip ${optionSet.has(item) ? "" : "is-custom"}`}>
                <span className="psc-ms-chip-text">{item}</span>
                <button
                  type="button"
                  className="psc-ms-chip-remove"
                  aria-label={`Remove ${item}`}
                  onClick={(e) => removeChip(e, item)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <span className="psc-ms-chevron" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

function DurationRuleControl({ ruleId, def, overrides, productForView, onOverrideChange }) {
  const label = getDurationEligibilityRuleLabel(ruleId);
  const hint = resolveDurationEligibilityDefault(ruleId, productForView);
  const raw = overrides[ruleId];
  const kind = def.kind || "text";

  if (kind === "number") {
    const value = raw != null && String(raw).trim() !== "" ? String(raw) : "";
    return (
      <div className="psc-field">
        <span className="psc-field-label">{label}</span>
        <div className="psc-input-with-suffix">
          <input
            className="psc-input"
            type="number"
            min={def.min}
            max={def.max}
            step={def.step ?? 1}
            placeholder={hint}
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              onOverrideChange(ruleId, v.trim() === "" ? "" : v);
            }}
          />
          {def.suffix ? <span className="psc-input-suffix">{def.suffix}</span> : null}
        </div>
      </div>
    );
  }

  if (kind === "select") {
    const value = raw != null ? String(raw) : "";
    return (
      <label className="psc-field">
        <span className="psc-field-label">{label}</span>
        <DropdownSelect
          variant="psc"
          value={value}
          onChange={(v) => onOverrideChange(ruleId, v)}
          options={def.options || []}
          placeholder="Match product default"
          emptyOptionLabel="Match product default"
        />
      </label>
    );
  }

  if (kind === "multiselect") {
    const options = def.options || [];
    const selected = parseDurationMultiselectValue(raw);

    const setSelected = (next) => {
      onOverrideChange(ruleId, next.length ? serializeDurationMultiselectValue(next) : "");
    };

    return (
      <div className="psc-field psc-field-wide psc-multi-rule-field">
        <span className="psc-field-label">{label}</span>
        <PscDurationMultiselect
          options={options}
          selected={selected}
          onSelectedChange={setSelected}
          placeholder={def.multiselectPlaceholder ?? "Click to choose — selections appear here"}
          ariaLabel={label}
          optionDescriptions={def.optionDescriptions}
          widePanel={Boolean(def.optionDescriptions)}
        />
      </div>
    );
  }

  if (kind === "textarea") {
    const value = raw != null ? String(raw) : "";
    return (
      <label className="psc-field psc-field-wide">
        <span className="psc-field-label">{label}</span>
        <textarea
          className="psc-input psc-textarea"
          rows={def.rows ?? 3}
          placeholder={hint}
          value={value}
          onChange={(e) => onOverrideChange(ruleId, e.target.value)}
        />
      </label>
    );
  }

  const value = raw != null ? String(raw) : "";
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      <input
        className="psc-input"
        type="text"
        placeholder={hint}
        value={value}
        onChange={(e) => onOverrideChange(ruleId, e.target.value)}
      />
    </label>
  );
}

function ProductStudioListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => loadProductCatalog());
  const timerRef = useRef(null);

  useEffect(() => {
    setProducts(loadProductCatalog());
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      saveProductCatalog(products);
    }, 400);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [products]);

  return (
    <main className="portal psc-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Underwriting workspace"
          eyebrow="Underwriter portal"
          onBack={() => navigate("/underwriter")}
          title="Product Studio"
        />
        <div className="psc-header-actions">
          <button className="primary-button" type="button" onClick={() => navigate("/underwriter/product-studio/new")}>
            Create new product
          </button>
        </div>
      </header>

      <section className="psc-catalog" aria-labelledby="psc-catalog-title">
        <h2 id="psc-catalog-title" className="psc-panel-title">
          Products
        </h2>
        <ul className="psc-product-cards" role="list">
          {products.map((p) => {
            const name = p.productName?.trim() || "Untitled product";
            const snapshots = catalogListRowSnapshots(p);
            const multiVersion = snapshots.length > 1;
            const metaItemsForRow = (row) => {
              const code = row.productCode?.trim() || "—";
              const rawStatus = row.productStatus || "";
              const statusDisplay = rawStatus.trim() || "—";
              return [
                { label: "Code", value: code },
                { label: "Category", value: row.productCategory || "—" },
                { label: "Type", value: row.productType || "—" },
                { label: "Version", value: row.productVersion || "—" },
                { label: "Status", value: statusDisplay, kind: "status", rawStatus },
                { label: "Effective", value: row.effectiveDate || "—" },
              ];
            };
            return (
              <li key={p.id} className="psc-product-card">
                <div className="psc-product-card-body">
                  <div className="psc-product-card-lead">
                    <p className="psc-product-card-name">{name}</p>
                    {multiVersion ? (
                      <span className="psc-product-card-version-count">{snapshots.length} versions</span>
                    ) : null}
                  </div>
                  <div className="psc-product-card-versions">
                    {snapshots.map((row) => {
                      const idPath = encodeURIComponent(row.id);
                      const openEdit = () => navigate(`/underwriter/product-studio/${idPath}/edit`);
                      const openView = () => navigate(`/underwriter/product-studio/${idPath}`);
                      const displayName = row.productName?.trim() || name;
                      const metaItems = metaItemsForRow(row);
                      return (
                        <div key={row.id} className="psc-product-card-version-strip">
                          <div className="psc-product-card-meta-wrap">
                            <div className="psc-product-card-meta psc-product-card-meta--strip" role="list" aria-label="Product summary">
                              {metaItems.map((item) => (
                                <div key={item.label} className="psc-product-card-meta-box" role="listitem">
                                  <span className="psc-meta-box-label">{item.label}</span>
                                  <div className="psc-meta-box-value-row">
                                    {item.kind === "status" ? (
                                      <span
                                        className={`psc-catalog-status psc-catalog-status--inline ${catalogProductStatusClass(item.rawStatus)}`}
                                      >
                                        {item.value}
                                      </span>
                                    ) : (
                                      <span className="psc-meta-box-value">{item.value}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="psc-product-card-actions">
                              <button type="button" className="psc-card-action psc-studio-row-edit" onClick={openEdit}>
                                Edit
                              </button>
                              <button type="button" className="primary-button psc-product-card-view" onClick={openView}>
                                View details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function ProductStudioConfigurationPanel({
  product,
  onOverrideChange,
  onCoreBenefitsItemsChange,
  onRidersChange = () => {},
  onPricingChange = () => {},
  onChargesChange = () => {},
  onFundsChange = () => {},
  onPolicyServicingChange = () => {},
  onSaveProduct,
}) {
  const [activeTab, setActiveTab] = useState(VIEW_CONFIG_TABS[0]?.id || "duration-eligibility");

  const productForView = useMemo(
    () => ({
      ...product,
      productConfiguration: product?.productConfiguration || defaultProductConfiguration(),
    }),
    [product],
  );

  const overrides = productForView.productConfiguration?.durationEligibility?.overrides || {};
  const activeDef = VIEW_CONFIG_TABS.find((t) => t.id === activeTab) || VIEW_CONFIG_TABS[0];
  const coreItems = productForView.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
  const ridersRaw = productForView.productConfiguration?.riders;
  const pricingRaw = productForView.productConfiguration?.pricing;
  const chargesRaw = productForView.productConfiguration?.charges;
  const fundsItems = productForView.productConfiguration?.funds?.items ?? [];
  const policyServicingRaw = productForView.productConfiguration?.policyServicing;

  const mainContent = (() => {
    if (activeTab === "duration-eligibility") {
      return (
        <>
          <div className="psc-config-main-head">
            <h2 className="psc-field-section-title psc-config-main-head-title">{activeDef.label}</h2>
            {onSaveProduct ? (
              <button type="button" className="primary-button psc-config-main-save" onClick={onSaveProduct}>
                Save product
              </button>
            ) : null}
          </div>
          {DURATION_ELIGIBILITY_FIELD_SECTIONS.map((section) => (
            <div key={section.title} className="psc-field-section">
              <h2 className="psc-field-section-title">{section.title}</h2>
              <div className="psc-field-grid">
                {section.ids.map((id) => (
                  <DurationRuleControl
                    key={id}
                    ruleId={id}
                    def={getDurationEligibilityFieldDef(id)}
                    overrides={overrides}
                    productForView={productForView}
                    onOverrideChange={onOverrideChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      );
    }
    if (activeTab === "core-benefits") {
      return (
        <>
          <h2 className="psc-field-section-title psc-config-main-lead-title">{activeDef.label}</h2>
          <CoreBenefitsRidersPanel items={coreItems} onItemsChange={onCoreBenefitsItemsChange} />
        </>
      );
    }
    if (activeTab === "riders") {
      return (
        <>
          <h2 className="psc-field-section-title psc-config-main-lead-title">{activeDef.label}</h2>
          <ProductStudioRidersPanel
            productId={productForView.id}
            productCurrency={productForView.productCurrency}
            riders={ridersRaw}
            onRidersChange={onRidersChange}
          />
        </>
      );
    }
    if (activeTab === "pricing") {
      return (
        <>
          <h2 className="psc-field-section-title psc-config-main-lead-title">{activeDef.label}</h2>
          <ProductStudioPricingPanel product={productForView} pricing={pricingRaw} onPricingChange={onPricingChange} />
        </>
      );
    }
    if (activeTab === "charges") {
      return (
        <>
          <h2 className="psc-field-section-title psc-config-main-lead-title">{activeDef.label}</h2>
          <ProductStudioChargesPanel charges={chargesRaw} onChargesChange={onChargesChange} />
        </>
      );
    }
    if (activeTab === "funds") {
      return (
        <>
          <h2 className="psc-field-section-title psc-config-main-lead-title">{activeDef.label}</h2>
          <ProductStudioFundsPanel items={fundsItems} onItemsChange={onFundsChange} />
        </>
      );
    }
    if (activeTab === "policy-servicing") {
      return (
        <>
          <h2 className="psc-field-section-title psc-config-main-lead-title">{activeDef.label}</h2>
          <ProductStudioPolicyServicingPanel policyServicing={policyServicingRaw} onPolicyServicingChange={onPolicyServicingChange} />
        </>
      );
    }
    return (
      <div className="psc-config-placeholder">
        <h2 className="psc-field-section-title">{activeDef?.label}</h2>
        <p>Coming soon.</p>
      </div>
    );
  })();

  return (
    <div className="psc-config-view-layout">
      <nav className="psc-config-sidebar" aria-label="Configuration sections">
        {VIEW_CONFIG_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`psc-config-tab ${tab.id === activeTab ? "is-active" : ""} ${tab.ready ? "" : "is-placeholder"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="psc-config-tab-label">{tab.label}</span>
            {!tab.ready ? <span className="psc-config-tab-badge">Soon</span> : null}
          </button>
        ))}
      </nav>

      <div className="psc-config-main">
        {mainContent}
      </div>
    </div>
  );
}

function persistProductDraft(draft, navigate) {
  if (!draft) {
    return false;
  }
  const name = draft.productName?.trim();
  const code = draft.productCode?.trim();
  if (!name || !code) {
    window.alert("Product name and Product code are required.");
    return false;
  }
  const list = loadProductCatalog();
  const c = code.trim().toLowerCase();
  if (hasProductCodeConflictWithOthers(list, draft.id, c)) {
    window.alert("Product code must be unique.");
    return false;
  }
  const next = applyCatalogDraft(list, draft);
  saveProductCatalog(next);
  navigate("/underwriter/product-studio");
  return true;
}

function ProductStudioNewProductPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => defaultProductRecord());

  const patchDraft = useCallback((key, v) => {
    setDraft((d) => (d ? { ...d, [key]: v } : d));
  }, []);

  const patchCoreBenefitsItems = useCallback((items) => {
    setDraft((d) => mergeCoreBenefitsItemsIntoDraft(d, items));
  }, []);

  const save = useCallback(() => {
    persistProductDraft(draft, navigate);
  }, [draft, navigate]);

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Products"
          eyebrow="Underwriter portal"
          onBack={() => navigate("/underwriter/product-studio")}
          title="New product"
        />
      </header>

      <section className="psc-form-card">
        {FIELD_SECTIONS.map((section) => (
          <div key={section.title} className="psc-field-section">
            <h2 className="psc-field-section-title">{section.title}</h2>
            <div className="psc-field-grid">
              {section.fields.map((def) => (
                <FormField key={def.key} def={def} value={draft[def.key]} onChange={(v) => patchDraft(def.key, v)} />
              ))}
            </div>
          </div>
        ))}
        <div className="psc-field-section psc-core-benefits-embed">
          <h2 className="psc-field-section-title">Core benefits & riders</h2>
          <CoreBenefitsRidersPanel
            items={draft.productConfiguration?.coreBenefitsAndRiders?.items ?? []}
            onItemsChange={patchCoreBenefitsItems}
          />
        </div>
        <div className="psc-form-actions">
          <button className="primary-button" type="button" onClick={save}>
            Save product
          </button>
        </div>
      </section>
    </main>
  );
}

function ProductStudioEditProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      return;
    }
    setDraft({ ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() });
    setNotFound(false);
  }, [productId]);

  const patchDraft = useCallback((key, v) => {
    setDraft((d) => (d ? { ...d, [key]: v } : d));
  }, []);

  const patchCoreBenefitsItems = useCallback((items) => {
    setDraft((d) => mergeCoreBenefitsItemsIntoDraft(d, items));
  }, []);

  const save = useCallback(() => {
    persistProductDraft(draft, navigate);
  }, [draft, navigate]);

  const title = useMemo(() => {
    const display = draft?.productName?.trim() || draft?.productCode || "…";
    return `Edit product — ${display}`;
  }, [draft]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Products"
            eyebrow="Underwriter portal"
            onBack={() => navigate("/underwriter/product-studio")}
            title="Product not found"
          />
        </header>
      </main>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Products"
          eyebrow="Underwriter portal"
          onBack={() => navigate("/underwriter/product-studio")}
          title={title}
        />
      </header>

      <section className="psc-form-card">
        {FIELD_SECTIONS.map((section) => (
          <div key={section.title} className="psc-field-section">
            <h2 className="psc-field-section-title">{section.title}</h2>
            <div className="psc-field-grid">
              {section.fields.map((def) => (
                <FormField key={def.key} def={def} value={draft[def.key]} onChange={(v) => patchDraft(def.key, v)} />
              ))}
            </div>
          </div>
        ))}
        <div className="psc-field-section psc-core-benefits-embed">
          <h2 className="psc-field-section-title">Core benefits & riders</h2>
          <CoreBenefitsRidersPanel
            items={draft.productConfiguration?.coreBenefitsAndRiders?.items ?? []}
            onItemsChange={patchCoreBenefitsItems}
          />
        </div>
        <div className="psc-form-actions">
          <button className="primary-button" type="button" onClick={save}>
            Save product
          </button>
        </div>
      </section>
    </main>
  );
}

function ProductStudioViewDetailsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      return;
    }
    setDraft({ ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() });
    setNotFound(false);
  }, [productId]);

  const patchDurationOverride = useCallback((ruleId, value) => {
    setDraft((d) => {
      if (!d) {
        return d;
      }
      const pc = d.productConfiguration || defaultProductConfiguration();
      const prev = pc.durationEligibility?.overrides || {};
      const next = { ...prev };
      if (value.trim() === "") {
        delete next[ruleId];
      } else {
        next[ruleId] = value;
      }
      return {
        ...d,
        productConfiguration: {
          ...pc,
          durationEligibility: { overrides: next },
        },
      };
    });
  }, []);

  const patchCoreBenefitsItems = useCallback((items) => {
    setDraft((d) => mergeCoreBenefitsItemsIntoDraft(d, items));
  }, []);

  const patchRiders = useCallback((nextRiders) => {
    setDraft((d) => mergeRidersIntoDraft(d, nextRiders));
  }, []);

  const patchPricing = useCallback((nextPricing) => {
    setDraft((d) => mergePricingIntoDraft(d, nextPricing));
  }, []);

  const patchCharges = useCallback((nextCharges) => {
    setDraft((d) => mergeChargesIntoDraft(d, nextCharges));
  }, []);

  const patchFunds = useCallback((nextItems) => {
    setDraft((d) => mergeFundsIntoDraft(d, nextItems));
  }, []);

  const patchPolicyServicing = useCallback((next) => {
    setDraft((d) => mergePolicyServicingIntoDraft(d, next));
  }, []);

  const save = useCallback(() => {
    persistProductDraft(draft, navigate);
  }, [draft, navigate]);

  const productDisplayName = useMemo(() => {
    return draft?.productName?.trim() || draft?.productCode?.trim() || "Untitled product";
  }, [draft]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Products"
            eyebrow="Underwriter portal"
            onBack={() => navigate("/underwriter/product-studio")}
            title="Product not found"
          />
        </header>
      </main>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Products"
          eyebrow="Underwriter portal"
          onBack={() => navigate("/underwriter/product-studio")}
          title="Product Configuration"
          subtitle={<p>{productDisplayName}</p>}
        />
      </header>

      <section className="psc-form-card">
        <ProductStudioConfigurationPanel
          product={draft}
          onOverrideChange={patchDurationOverride}
          onCoreBenefitsItemsChange={patchCoreBenefitsItems}
          onRidersChange={patchRiders}
          onPricingChange={patchPricing}
          onChargesChange={patchCharges}
          onFundsChange={patchFunds}
          onPolicyServicingChange={patchPolicyServicing}
          onSaveProduct={save}
        />
      </section>
    </main>
  );
}

/** Nested routes: index = catalogue, new = create, :id = view details (configuration), :id/edit = edit basics. */
export function ProductStudioLayout() {
  return (
    <Routes>
      <Route index element={<ProductStudioListPage />} />
      <Route path="new" element={<ProductStudioNewProductPage />} />
      <Route path=":productId/riders/edit/:kind/:riderId" element={<ProductStudioRiderFormPage />} />
      <Route path=":productId/edit" element={<ProductStudioEditProductPage />} />
      <Route path=":productId" element={<ProductStudioViewDetailsPage />} />
    </Routes>
  );
}
