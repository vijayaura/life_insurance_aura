import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { DropdownSelect } from "./DropdownSelect.jsx";
import { PageTitleWithBack } from "./PageTitleWithBack.jsx";
import {
  DURATION_ELIGIBILITY_CONFIG_TAB_IDS,
  DURATION_ELIGIBILITY_TABS_FIELD_SECTIONS,
  PRODUCT_COMPONENT_SECTION_ORDER,
  PRODUCT_DETAILS_DURATION_ELIGIBILITY_RULE_IDS,
  PRODUCT_DETAILS_DURATION_ELIGIBILITY_SECTION_TITLE,
  VIEW_CONFIG_TABS_INSIDE_DETAILS,
  defaultProductConfiguration,
  getDurationEligibilityFieldDef,
  getDurationEligibilityRuleLabel,
  parseDurationMultiselectValue,
  resolveDurationEligibilityDefault,
  serializeDurationMultiselectValue,
} from "./productStudioConfiguration.js";
import {
  BenefitChargeDetailPanel,
  BenefitChargeRateTablesPanel,
  BenefitChargesPanel,
  BenefitDetailExtensionPanel,
  BenefitFundDetailPanel,
  BenefitFundsPanel,
  BenefitRateTablesPanel,
  BenefitUnderwritingRulesPanel,
  BENEFIT_EDIT_EXTENSION_TABS,
  BENEFIT_RATE_TABLE_TABS,
} from "./ProductStudioBenefitExtensionPanels.jsx";
import { CoreBenefitsRidersPanel, CoreBenefitEditorFormBody } from "./ProductStudioCoreBenefitsPanel.jsx";
import { ProductStudioChargesPanel } from "./ProductStudioChargesPanel.jsx";
import { ProductStudioTableStructurePanel } from "./ProductStudioTableStructurePanel.jsx";
import { ProductStudioFundsPanel } from "./ProductStudioFundsPanel.jsx";
import { ProductStudioPolicyServicingPanel } from "./ProductStudioPolicyServicingPanel.jsx";
import { ProductStudioUnderwritingPanel } from "./ProductStudioUnderwritingPanel.jsx";
import { ProductStudioMedicalMatrixPanel } from "./ProductStudioMedicalMatrixPanel.jsx";
import { ProductStudioCommissionDistributionPanel } from "./ProductStudioCommissionDistributionPanel.jsx";
import { ProductStudioDocumentTemplatesPanel } from "./ProductStudioDocumentTemplatesPanel.jsx";
import { ProductStudioConfigTabHead, ProductStudioConfigFileActions } from "./ProductStudioConfigTabHead.jsx";
import { configUploadToPatch, parseConfigTabUpload } from "./productStudioConfigImportExport.js";
import { DEMO_FEES_LIST, getFeeCatalogEntry, normalizeChargesConfiguration } from "./productStudioCharges.js";
import { DEMO_FUNDS_LIST, normalizeFundsConfiguration } from "./productStudioFunds.js";
import { normalizePolicyServicingConfiguration } from "./productStudioPolicyServicing.js";
import { normalizeUnderwritingRulesConfiguration } from "./productStudioUnderwriting.js";
import { normalizeMedicalRequirementMatrixConfiguration } from "./productStudioMedicalMatrix.js";
import { normalizeCommissionDistributionConfiguration } from "./productStudioCommissionDistribution.js";
import { normalizeDocumentTemplatesConfiguration } from "./productStudioDocumentTemplates.js";
import { normalizeTableStructureDesign } from "./productStudioTableStructure.jsx";
import { normalizeRidersConfig } from "./productStudioRiders.js";
import { coreBenefitRowToForm, DEMO_CORE_BENEFIT_LIST } from "./productStudioCoreBenefits.js";
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
  uid,
} from "./productStudioStore.js";

/** Apply uploaded config file to patch handlers. On success callers may show a confirmation alert. */
function applyProductStudioConfigTabUpload(tabId, file, text, handlers) {
  const parsed = parseConfigTabUpload(tabId, text, file.name);
  const payload = configUploadToPatch(tabId, parsed);
  const {
    onOverrideChange,
    onCoreBenefitsItemsChange,
    onRidersChange,
    onTableStructureChange,
    onChargesChange,
    onFundsChange,
    onPolicyServicingChange,
    onUnderwritingRulesChange,
    onMedicalRequirementMatrixChange,
    onCommissionDistributionChange,
    onDocumentTemplatesChange,
  } = handlers;

  if (DURATION_ELIGIBILITY_CONFIG_TAB_IDS.includes(tabId) && payload.overrides) {
    Object.entries(payload.overrides).forEach(([ruleId, value]) => {
      onOverrideChange(ruleId, value);
    });
  } else if (tabId === "core-benefits" && payload.items) {
    onCoreBenefitsItemsChange(payload.items.map((row) => ({ ...row, id: uid() })));
  } else if (tabId === "riders") {
    onRidersChange(normalizeRidersConfig(payload));
  } else if (tabId === "table-structure-design") {
    onTableStructureChange(normalizeTableStructureDesign(payload));
  } else if (tabId === "charges" && payload.items) {
    onChargesChange(normalizeChargesConfiguration({ items: payload.items.map((row) => ({ ...row, id: uid() })) }));
  } else if (tabId === "funds" && payload.items) {
    onFundsChange(payload.items.map((row) => ({ ...row, id: uid() })));
  } else if (tabId === "policy-servicing" && payload.items) {
    onPolicyServicingChange(normalizePolicyServicingConfiguration({ items: payload.items.map((row) => ({ ...row, id: uid() })) }));
  } else if (tabId === "underwriting-rules" && payload.items) {
    onUnderwritingRulesChange(normalizeUnderwritingRulesConfiguration({ items: payload.items.map((row) => ({ ...row, id: uid() })) }));
  } else if (tabId === "medical-matrix" && payload.items) {
    onMedicalRequirementMatrixChange(normalizeMedicalRequirementMatrixConfiguration({ items: payload.items.map((row) => ({ ...row, id: uid() })) }));
  } else if (tabId === "commission-distribution") {
    onCommissionDistributionChange(normalizeCommissionDistributionConfiguration(payload));
  } else if (tabId === "document-templates" && payload.items) {
    onDocumentTemplatesChange(normalizeDocumentTemplatesConfiguration({ items: payload.items.map((row) => ({ ...row, id: uid() })) }));
  } else {
    throw new Error("Could not apply upload to this section.");
  }
}

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

function mergeTableStructureIntoDraft(draft, tableStructureDesign) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      tableStructureDesign: normalizeTableStructureDesign(tableStructureDesign),
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

function mergeUnderwritingRulesIntoDraft(draft, underwritingRules) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      underwritingRules: normalizeUnderwritingRulesConfiguration(underwritingRules),
    },
  };
}

function mergeMedicalRequirementMatrixIntoDraft(draft, medicalRequirementMatrix) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      medicalRequirementMatrix: normalizeMedicalRequirementMatrixConfiguration(medicalRequirementMatrix),
    },
  };
}

function mergeCommissionDistributionIntoDraft(draft, commissionDistribution) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      commissionDistribution: normalizeCommissionDistributionConfiguration(commissionDistribution),
    },
  };
}

function mergeDocumentTemplatesIntoDraft(draft, documentTemplates) {
  if (!draft) {
    return draft;
  }
  const pc = draft.productConfiguration || defaultProductConfiguration();
  return {
    ...draft,
    productConfiguration: {
      ...pc,
      documentTemplates: normalizeDocumentTemplatesConfiguration(documentTemplates),
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

function ProductDetailsSection({ headerTrailing = null, children }) {
  return (
    <div className="psc-product-details-block">
      <div className="psc-product-details-header">
        <h2 className="psc-product-details-title">Product details</h2>
        {headerTrailing ? <div className="psc-product-details-actions">{headerTrailing}</div> : null}
      </div>
      <div className="psc-product-details-body">{children}</div>
    </div>
  );
}

function ProductComponentCardIcon({ name }) {
  const svgProps = {
    className: "psc-component-card-icon-svg",
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "database":
      return (
        <svg {...svgProps}>
          <ellipse cx="12" cy="5.5" rx="8" ry="3" />
          <path d="M4 5.5v5c0 1.7 3.5 3 8 3s8-1.3 8-3v-5" />
          <path d="M4 10.5v5c0 1.7 3.5 3 8 3s8-1.3 8-3v-5" />
        </svg>
      );
    case "flow":
      return (
        <svg {...svgProps}>
          <circle cx="6" cy="6" r="2.25" />
          <circle cx="18" cy="6" r="2.25" />
          <circle cx="12" cy="18" r="2.25" />
          <path d="M7.5 7.5l3 3m3 0l3-3M12 10.5V15" />
        </svg>
      );
    case "key":
      return (
        <svg {...svgProps}>
          <circle cx="8" cy="14" r="3.25" />
          <path d="M10.5 11.5L17 5M20 5v0" />
          <path d="M15 5h5v4" />
        </svg>
      );
    case "gear":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...svgProps}>
          <path d="M12 3L5 6v6c0 5 4 8 7 9 3-1 7-4 7-9V6l-7-3z" />
        </svg>
      );
    case "target":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chart":
      return (
        <svg {...svgProps}>
          <path d="M4 18V6M8 18v-7M12 18V9M16 18v-4M20 18v-8" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...svgProps}>
          <path d="M4 8h4M10 8h10M8 8v5M4 16h8M14 16h6M17 16v-5" />
        </svg>
      );
    case "medical":
      return (
        <svg {...svgProps}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "bell":
      return (
        <svg {...svgProps}>
          <path d="M14 18a2 2 0 11-4 0M8 6a4 4 0 018 0c0 5 2 5 3 6H5c1-1 3-1 3-6z" />
        </svg>
      );
    case "layers":
      return (
        <svg {...svgProps}>
          <path d="M12 3L2 8l10 5 10-5-10-5z" />
          <path d="M2 13l10 5 10-5M2 18l10 5 10-5" />
        </svg>
      );
    case "document":
    default:
      return (
        <svg {...svgProps}>
          <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M14 3v5h5M9 12h6M9 16h6" />
        </svg>
      );
  }
}

function ProductStudioComponentsCardGrid({ productId }) {
  const navigate = useNavigate();
  const base = `/underwriter/product-studio/${encodeURIComponent(productId)}`;

  const sections = useMemo(() => {
    const byCat = new Map();
    for (const tab of VIEW_CONFIG_TABS_INSIDE_DETAILS) {
      const cat = tab.category || "Other";
      if (!byCat.has(cat)) {
        byCat.set(cat, []);
      }
      byCat.get(cat).push(tab);
    }
    const ordered = [];
    for (const title of PRODUCT_COMPONENT_SECTION_ORDER) {
      if (byCat.has(title)) {
        ordered.push({ title, cards: byCat.get(title) });
        byCat.delete(title);
      }
    }
    for (const [title, cards] of byCat) {
      ordered.push({ title, cards });
    }
    return ordered;
  }, []);

  return (
    <div className="psc-components-hub">
      {sections.map(({ title, cards }) => (
        <div key={title} className="psc-component-section">
          <div className="psc-component-section-inner">
            <h3 className="psc-component-section-title">{title}</h3>
            <div className="psc-component-section-cards">
              {cards.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`psc-component-card ${tab.ready ? "" : "is-placeholder"}`}
                  disabled={!tab.ready}
                  onClick={() => navigate(`${base}/components/${encodeURIComponent(tab.id)}`)}
                >
                  <span
                    className={`psc-component-card-icon-wrap psc-component-card-icon-wrap--${tab.icon || "document"}`}
                  >
                    <ProductComponentCardIcon name={tab.icon} />
                  </span>
                  <span className="psc-component-card-label">{tab.label}</span>
                  <span className="psc-component-card-action" aria-hidden>
                    <svg
                      className="psc-component-card-action-svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 3h7v7M10 14L21 3M18 13v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7"
                      />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
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

function ProductDurationEligibilityDetailsSection({ productForView, overrides, onOverrideChange }) {
  return (
    <div className="psc-field-section">
      <h2 className="psc-field-section-title">{PRODUCT_DETAILS_DURATION_ELIGIBILITY_SECTION_TITLE}</h2>
      <div className="psc-field-grid">
        {PRODUCT_DETAILS_DURATION_ELIGIBILITY_RULE_IDS.map((id) => (
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
          backAriaLabel="Market admin dashboard"
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
                      const openDetails = () => navigate(`/underwriter/product-studio/${idPath}`);
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
                              <button type="button" className="primary-button psc-product-card-view" onClick={openDetails}>
                                Edit details
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
  onTableStructureChange = () => {},
  onChargesChange = () => {},
  onFundsChange = () => {},
  onPolicyServicingChange = () => {},
  onUnderwritingRulesChange = () => {},
  onMedicalRequirementMatrixChange = () => {},
  onCommissionDistributionChange = () => {},
  onDocumentTemplatesChange = () => {},
  tabs = VIEW_CONFIG_TABS_INSIDE_DETAILS,
  sidebarAriaLabel = "Configuration sections",
  configurationLayout = "sidebar",
  /** When set, render only this tab full-width (no sidebar) — used on dedicated component pages. */
  singleTabId = null,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "duration-eligibility");

  const productForView = useMemo(
    () => ({
      ...product,
      productConfiguration: product?.productConfiguration || defaultProductConfiguration(),
    }),
    [product],
  );

  const overrides = productForView.productConfiguration?.durationEligibility?.overrides || {};
  const coreItems = productForView.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
  const ridersRaw = productForView.productConfiguration?.riders;
  const tableStructureRaw = productForView.productConfiguration?.tableStructureDesign;
  const chargesRaw = productForView.productConfiguration?.charges;
  const fundsItems = productForView.productConfiguration?.funds?.items ?? [];
  const policyServicingRaw = productForView.productConfiguration?.policyServicing;
  const underwritingRulesRaw = productForView.productConfiguration?.underwritingRules;
  const medicalRequirementMatrixRaw = productForView.productConfiguration?.medicalRequirementMatrix;
  const commissionDistributionRaw = productForView.productConfiguration?.commissionDistribution;
  const documentTemplatesRaw = productForView.productConfiguration?.documentTemplates;

  const productCodeForTemplate = productForView.productCode || productForView.id || "product";

  const handleConfigUpload = useCallback(
    (tabId, file, text) => {
      try {
        applyProductStudioConfigTabUpload(tabId, file, text, {
          onOverrideChange,
          onCoreBenefitsItemsChange,
          onRidersChange,
          onTableStructureChange,
          onChargesChange,
          onFundsChange,
          onPolicyServicingChange,
          onUnderwritingRulesChange,
          onMedicalRequirementMatrixChange,
          onCommissionDistributionChange,
          onDocumentTemplatesChange,
        });
        window.alert("File uploaded. Review the values and save the product when ready.");
      } catch (err) {
        window.alert(err?.message || "Upload failed.");
      }
    },
    [
      onOverrideChange,
      onCoreBenefitsItemsChange,
      onRidersChange,
      onTableStructureChange,
      onChargesChange,
      onFundsChange,
      onPolicyServicingChange,
      onUnderwritingRulesChange,
      onMedicalRequirementMatrixChange,
      onCommissionDistributionChange,
      onDocumentTemplatesChange,
    ],
  );

  function renderTabBody(tabId) {
    const tabDef = tabs.find((t) => t.id === tabId) || tabs[0];
    const headProps = {
      title: tabDef.label,
      tabId,
      productCode: productCodeForTemplate,
      onUpload: (file, text) => handleConfigUpload(tabId, file, text),
    };
    const configTabHead = singleTabId ? null : <ProductStudioConfigTabHead {...headProps} />;
    if (DURATION_ELIGIBILITY_CONFIG_TAB_IDS.includes(tabId)) {
      const sections = DURATION_ELIGIBILITY_TABS_FIELD_SECTIONS[tabId] || [];
      return (
        <>
          {configTabHead}
          {sections.map((section) => (
            <div key={section.title} className="psc-field-section">
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
    if (tabId === "core-benefits") {
      return (
        <>
          {configTabHead}
          <CoreBenefitsRidersPanel items={coreItems} onItemsChange={onCoreBenefitsItemsChange} />
        </>
      );
    }
    if (tabId === "riders") {
      return (
        <>
          {configTabHead}
          <ProductStudioRidersPanel
            productId={productForView.id}
            productCurrency={productForView.productCurrency}
            riders={ridersRaw}
            onRidersChange={onRidersChange}
          />
        </>
      );
    }
    if (tabId === "table-structure-design") {
      return (
        <>
          {configTabHead}
          <ProductStudioTableStructurePanel
            tableStructure={tableStructureRaw}
            onTableStructureChange={onTableStructureChange}
          />
        </>
      );
    }
    if (tabId === "charges") {
      return (
        <>
          {configTabHead}
          <ProductStudioChargesPanel charges={chargesRaw} onChargesChange={onChargesChange} />
        </>
      );
    }
    if (tabId === "funds") {
      return (
        <>
          {configTabHead}
          <ProductStudioFundsPanel items={fundsItems} onItemsChange={onFundsChange} />
        </>
      );
    }
    if (tabId === "policy-servicing") {
      return (
        <>
          {configTabHead}
          <ProductStudioPolicyServicingPanel policyServicing={policyServicingRaw} onPolicyServicingChange={onPolicyServicingChange} />
        </>
      );
    }
    if (tabId === "underwriting-rules") {
      return (
        <>
          {configTabHead}
          <ProductStudioUnderwritingPanel
            underwritingRules={underwritingRulesRaw}
            onUnderwritingRulesChange={onUnderwritingRulesChange}
          />
        </>
      );
    }
    if (tabId === "medical-matrix") {
      return (
        <>
          {configTabHead}
          <ProductStudioMedicalMatrixPanel
            medicalRequirementMatrix={medicalRequirementMatrixRaw}
            onMedicalRequirementMatrixChange={onMedicalRequirementMatrixChange}
          />
        </>
      );
    }
    if (tabId === "commission-distribution") {
      return (
        <>
          {configTabHead}
          <ProductStudioCommissionDistributionPanel
            commissionDistribution={commissionDistributionRaw}
            onCommissionDistributionChange={onCommissionDistributionChange}
          />
        </>
      );
    }
    if (tabId === "document-templates") {
      return (
        <>
          {configTabHead}
          <ProductStudioDocumentTemplatesPanel
            documentTemplates={documentTemplatesRaw}
            onDocumentTemplatesChange={onDocumentTemplatesChange}
          />
        </>
      );
    }
    return (
      <div className="psc-config-placeholder">
        <h2 className="psc-field-section-title">{tabDef?.label}</h2>
        <p>Coming soon.</p>
      </div>
    );
  }

  if (singleTabId) {
    const known = tabs.some((t) => t.id === singleTabId);
    if (!known) {
      return (
        <div className="psc-config-placeholder">
          <h2 className="psc-field-section-title">Component not found</h2>
          <p>This product component is not available.</p>
        </div>
      );
    }
    return (
      <div className="psc-config-view-layout psc-config-view-layout--stacked psc-config-view-layout--single-tab">
        <div className="psc-config-main">{renderTabBody(singleTabId)}</div>
      </div>
    );
  }

  if (configurationLayout === "stacked") {
    return (
      <div className="psc-config-view-layout psc-config-view-layout--stacked">
        <div className="psc-config-main psc-config-main--stacked">
          {tabs.map((tab) => (
            <section key={tab.id} className="psc-config-stacked-section">
              {renderTabBody(tab.id)}
            </section>
          ))}
        </div>
      </div>
    );
  }

  const mainContent = renderTabBody(activeTab);

  return (
    <div className="psc-config-view-layout">
      <nav className="psc-config-sidebar" aria-label={sidebarAriaLabel}>
        {tabs.map((tab) => (
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

      <div className="psc-config-main">{mainContent}</div>
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

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Products"
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
        <ProductDurationEligibilityDetailsSection
          productForView={{
            ...draft,
            productConfiguration: draft.productConfiguration || defaultProductConfiguration(),
          }}
          overrides={draft.productConfiguration?.durationEligibility?.overrides || {}}
          onOverrideChange={patchDurationOverride}
        />
        <div className="psc-field-section psc-core-benefits-embed">
          <h2 className="psc-field-section-title">Core benefits & riders</h2>
          <CoreBenefitsRidersPanel
            items={draft.productConfiguration?.coreBenefitsAndRiders?.items ?? []}
            onItemsChange={patchCoreBenefitsItems}
          />
        </div>
      </section>
    </main>
  );
}

function ProductStudioComponentPage() {
  const navigate = useNavigate();
  const { productId, componentId } = useParams();
  const tabDef = useMemo(() => VIEW_CONFIG_TABS_INSIDE_DETAILS.find((t) => t.id === componentId), [componentId]);
  const tabUsable = Boolean(tabDef?.ready);

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

  const patchTableStructure = useCallback((nextTableStructure) => {
    setDraft((d) => mergeTableStructureIntoDraft(d, nextTableStructure));
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

  const patchUnderwritingRules = useCallback((next) => {
    setDraft((d) => mergeUnderwritingRulesIntoDraft(d, next));
  }, []);

  const patchMedicalRequirementMatrix = useCallback((next) => {
    setDraft((d) => mergeMedicalRequirementMatrixIntoDraft(d, next));
  }, []);

  const patchCommissionDistribution = useCallback((next) => {
    setDraft((d) => mergeCommissionDistributionIntoDraft(d, next));
  }, []);

  const patchDocumentTemplates = useCallback((next) => {
    setDraft((d) => mergeDocumentTemplatesIntoDraft(d, next));
  }, []);

  const onComponentConfigUpload = useCallback(
    (file, text) => {
      try {
        applyProductStudioConfigTabUpload(componentId, file, text, {
          onOverrideChange: patchDurationOverride,
          onCoreBenefitsItemsChange: patchCoreBenefitsItems,
          onRidersChange: patchRiders,
          onTableStructureChange: patchTableStructure,
          onChargesChange: patchCharges,
          onFundsChange: patchFunds,
          onPolicyServicingChange: patchPolicyServicing,
          onUnderwritingRulesChange: patchUnderwritingRules,
          onMedicalRequirementMatrixChange: patchMedicalRequirementMatrix,
          onCommissionDistributionChange: patchCommissionDistribution,
          onDocumentTemplatesChange: patchDocumentTemplates,
        });
        window.alert("File uploaded into this section. Open the product page and use Save product to persist changes.");
      } catch (err) {
        window.alert(err?.message || "Upload failed.");
      }
    },
    [
      componentId,
      patchDurationOverride,
      patchCoreBenefitsItems,
      patchRiders,
      patchTableStructure,
      patchCharges,
      patchFunds,
      patchPolicyServicing,
      patchUnderwritingRules,
      patchMedicalRequirementMatrix,
      patchCommissionDistribution,
      patchDocumentTemplates,
    ],
  );

  const productBase = `/underwriter/product-studio/${encodeURIComponent(productId)}`;
  const productCodeForTemplates = draft?.productCode?.trim() || draft?.id || "product";

  if (!tabUsable) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Product"
            onBack={() => navigate(productBase)}
            title="Component not found"
          />
        </header>
        <section className="psc-form-card">
          <p className="psc-config-placeholder-desc">This product component does not exist or is not available yet.</p>
        </section>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Products"
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
          backAriaLabel="Product"
          onBack={() => navigate(productBase)}
          title={tabDef.label}
        />
        <div className="psc-header-actions psc-header-actions--config-files">
          <ProductStudioConfigFileActions
            tabId={componentId}
            productCode={productCodeForTemplates}
            onUpload={onComponentConfigUpload}
          />
        </div>
      </header>

      <section className="psc-form-card psc-form-card--component-tool">
        <ProductStudioConfigurationPanel
          key={`component-${componentId}`}
          tabs={VIEW_CONFIG_TABS_INSIDE_DETAILS}
          sidebarAriaLabel="Product component"
          product={draft}
          singleTabId={componentId}
          onOverrideChange={patchDurationOverride}
          onCoreBenefitsItemsChange={patchCoreBenefitsItems}
          onRidersChange={patchRiders}
          onTableStructureChange={patchTableStructure}
          onChargesChange={patchCharges}
          onFundsChange={patchFunds}
          onPolicyServicingChange={patchPolicyServicing}
          onUnderwritingRulesChange={patchUnderwritingRules}
          onMedicalRequirementMatrixChange={patchMedicalRequirementMatrix}
          onCommissionDistributionChange={patchCommissionDistribution}
          onDocumentTemplatesChange={patchDocumentTemplates}
        />
      </section>
    </main>
  );
}

function ProductStudioBenefitEditPage() {
  const navigate = useNavigate();
  const { productId, benefitId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);
  const [benefitExtensionTab, setBenefitExtensionTab] = useState("");

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  useEffect(() => {
    setBenefitExtensionTab(BENEFIT_EDIT_EXTENSION_TABS[0]?.id ?? "");
  }, [benefitId]);

  const patchBenefitField = useCallback(
    (key, v) => {
      setDraft((d) => {
        if (!d) {
          return d;
        }
        const pc = d.productConfiguration || defaultProductConfiguration();
        const prevItems = pc.coreBenefitsAndRiders?.items ?? [];
        const nextItems = prevItems.map((b) => (b.id === benefitId ? { ...b, [key]: v } : b));
        return mergeCoreBenefitsItemsIntoDraft(d, nextItems);
      });
    },
    [benefitId],
  );

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const form = useMemo(() => coreBenefitRowToForm(benefitRow), [benefitRow]);

  const pageTitle = useMemo(() => {
    const name = form.benefitName?.trim() || "…";
    return `Edit benefit — ${name}`;
  }, [form.benefitName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Products"
            onBack={() => navigate("/underwriter/product-studio")}
            title="Product not found"
          />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Product"
            onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)}
            title="Benefit not found"
          />
        </header>
      </main>
    );
  }

  if (!draft || !benefitRow) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack
          backAriaLabel="Product"
          onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)}
          title={pageTitle}
        />
      </header>

      <section className="psc-form-card">
        <CoreBenefitEditorFormBody form={form} patchForm={patchBenefitField} />
        <BenefitDetailExtensionPanel
          key={benefitId}
          activeTab={benefitExtensionTab}
          onTabChange={setBenefitExtensionTab}
          rateTablesPath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/rate-tables`}
          chargeRateTablesPath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/charge-rate-tables`}
          chargesPath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/charges`}
          fundsPath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/funds`}
          underwritingRulesPath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/underwriting-rules`}
        />
      </section>
    </main>
  );
}

function ProductStudioBenefitRateTablesPage() {
  const navigate = useNavigate();
  const { productId, benefitId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);
  const [rateTableTab, setRateTableTab] = useState(BENEFIT_RATE_TABLE_TABS[0].id);

  const benefitEditPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/edit`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  useEffect(() => {
    setRateTableTab(BENEFIT_RATE_TABLE_TABS[0].id);
  }, [benefitId]);

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const pageTitle = useMemo(() => {
    const name = benefitRow?.benefitName?.trim() || "…";
    return `Rate tables — ${name}`;
  }, [benefitRow?.benefitName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  const tableStructureRaw = draft?.productConfiguration?.tableStructureDesign;

  if (!draft || !benefitRow) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Edit benefit" onBack={() => navigate(benefitEditPath)} title={pageTitle} />
      </header>

      <section className="psc-form-card">
        <BenefitRateTablesPanel activeTab={rateTableTab} onTabChange={setRateTableTab} tableStructure={tableStructureRaw} />
      </section>
    </main>
  );
}

function ProductStudioBenefitChargeRateTablesPage() {
  const navigate = useNavigate();
  const { productId, benefitId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);

  const benefitEditPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/edit`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const pageTitle = useMemo(() => {
    const name = benefitRow?.benefitName?.trim() || "…";
    return `Charge rate tables — ${name}`;
  }, [benefitRow?.benefitName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  const tableStructureRaw = draft?.productConfiguration?.tableStructureDesign;

  if (!draft || !benefitRow) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Edit benefit" onBack={() => navigate(benefitEditPath)} title={pageTitle} />
      </header>

      <section className="psc-form-card">
        <BenefitChargeRateTablesPanel tableStructure={tableStructureRaw} />
      </section>
    </main>
  );
}

function ProductStudioBenefitUnderwritingRulesPage() {
  const navigate = useNavigate();
  const { productId, benefitId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);

  const benefitEditPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/edit`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  const patchUnderwritingRules = useCallback((next) => {
    setDraft((d) => mergeUnderwritingRulesIntoDraft(d, next));
  }, []);

  const onUnderwritingRulesUpload = useCallback(
    (file, text) => {
      try {
        applyProductStudioConfigTabUpload("underwriting-rules", file, text, {
          onUnderwritingRulesChange: patchUnderwritingRules,
        });
      } catch (err) {
        window.alert(err?.message || "Upload failed.");
      }
    },
    [patchUnderwritingRules],
  );

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const pageTitle = useMemo(() => {
    const name = benefitRow?.benefitName?.trim() || "…";
    return `Underwriting rules — ${name}`;
  }, [benefitRow?.benefitName]);

  const underwritingRulesRaw = draft?.productConfiguration?.underwritingRules;
  const productCodeForTemplates = draft?.productCode?.trim() || draft?.id || "product";

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  if (!draft || !benefitRow) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Edit benefit" onBack={() => navigate(benefitEditPath)} title={pageTitle} />
        <div className="psc-header-actions psc-header-actions--config-files">
          <ProductStudioConfigFileActions
            tabId="underwriting-rules"
            productCode={productCodeForTemplates}
            onUpload={onUnderwritingRulesUpload}
          />
        </div>
      </header>

      <section className="psc-form-card psc-form-card--component-tool">
        <BenefitUnderwritingRulesPanel
          underwritingRules={underwritingRulesRaw}
          onUnderwritingRulesChange={patchUnderwritingRules}
        />
      </section>
    </main>
  );
}

function ProductStudioBenefitChargesPage() {
  const navigate = useNavigate();
  const { productId, benefitId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);
  const benefitEditPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/edit`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  const patchCharges = useCallback((nextCharges) => {
    setDraft((d) => mergeChargesIntoDraft(d, nextCharges));
  }, []);

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const chargesRaw = draft?.productConfiguration?.charges;

  const pageTitle = useMemo(() => {
    const name = benefitRow?.benefitName?.trim() || "…";
    return `Charges — ${name}`;
  }, [benefitRow?.benefitName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  if (!draft || !benefitRow) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Edit benefit" onBack={() => navigate(benefitEditPath)} title={pageTitle} />
      </header>

      <section className="psc-form-card">
        <BenefitChargesPanel
          charges={chargesRaw}
          onChargesChange={patchCharges}
          chargeDetailBasePath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/charges`}
        />
      </section>
    </main>
  );
}

function ProductStudioBenefitChargeDetailPage() {
  const navigate = useNavigate();
  const { productId, benefitId, chargeId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);

  const chargesPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/charges`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const patchCharges = useCallback((nextCharges) => {
    setDraft((d) => mergeChargesIntoDraft(d, nextCharges));
  }, []);

  const chargesRaw = draft?.productConfiguration?.charges;

  const chargeRow = useMemo(() => {
    const items = normalizeChargesConfiguration(chargesRaw).items;
    const displayList = items.length > 0 ? items : DEMO_FEES_LIST;
    return displayList.find((x) => x.id === chargeId);
  }, [chargeId, chargesRaw]);

  const pageTitle = useMemo(() => {
    if (!chargeRow) {
      return "Charge details";
    }
    if (chargeRow.chargeTypeId === "custom" && chargeRow.customChargeName) {
      return `Charge details — ${chargeRow.customChargeName}`;
    }
    const cat = getFeeCatalogEntry(chargeRow.chargeTypeId);
    return `Charge details — ${cat?.chargeName || "Fee"}`;
  }, [chargeRow]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  if (!draft || !benefitRow) {
    return null;
  }

  if (!chargeRow) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Charges" onBack={() => navigate(chargesPath)} title="Charge not found" />
        </header>
      </main>
    );
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Charges" onBack={() => navigate(chargesPath)} title={pageTitle} />
      </header>

      <section className="psc-form-card">
        <BenefitChargeDetailPanel chargeId={chargeId} charges={chargesRaw} onChargesChange={patchCharges} />
      </section>
    </main>
  );
}

function ProductStudioBenefitFundsPage() {
  const navigate = useNavigate();
  const { productId, benefitId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);
  const benefitEditPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/edit`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  const patchFunds = useCallback((nextItems) => {
    setDraft((d) => mergeFundsIntoDraft(d, nextItems));
  }, []);

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const fundsItems = draft?.productConfiguration?.funds?.items ?? [];

  const pageTitle = useMemo(() => {
    const name = benefitRow?.benefitName?.trim() || "…";
    return `Funds & Investments — ${name}`;
  }, [benefitRow?.benefitName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  if (!draft || !benefitRow) {
    return null;
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Edit benefit" onBack={() => navigate(benefitEditPath)} title={pageTitle} />
      </header>

      <section className="psc-form-card">
        <BenefitFundsPanel
          fundsItems={fundsItems}
          onFundsChange={patchFunds}
          fundGrowthRateBasePath={`/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/funds`}
        />
      </section>
    </main>
  );
}

function ProductStudioBenefitFundGrowthRatePage() {
  const navigate = useNavigate();
  const { productId, benefitId, fundId } = useParams();
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [benefitNotFound, setBenefitNotFound] = useState(false);

  const benefitEditPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/edit`;
  const fundsPath = `/underwriter/product-studio/${encodeURIComponent(productId)}/benefits/${encodeURIComponent(benefitId)}/funds`;

  useEffect(() => {
    const list = loadProductCatalog();
    const found = findProductById(list, productId);
    if (!found) {
      setNotFound(true);
      setDraft(null);
      setBenefitNotFound(false);
      return;
    }
    let d = { ...found, productConfiguration: found.productConfiguration || defaultProductConfiguration() };
    const items = d.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    setBenefitNotFound(false);
    if (!items.some((b) => b.id === benefitId)) {
      const demo = DEMO_CORE_BENEFIT_LIST.find((b) => b.id === benefitId);
      if (demo) {
        d = mergeCoreBenefitsItemsIntoDraft(d, [...items, { ...demo }]);
      } else {
        setBenefitNotFound(true);
      }
    }
    setDraft(d);
    setNotFound(false);
  }, [productId, benefitId]);

  const benefitRow = useMemo(() => {
    const items = draft?.productConfiguration?.coreBenefitsAndRiders?.items ?? [];
    return items.find((b) => b.id === benefitId);
  }, [draft, benefitId]);

  const fundRow = useMemo(() => {
    const saved = normalizeFundsConfiguration({ items: draft?.productConfiguration?.funds?.items ?? [] }).items;
    const displayList = saved.length > 0 ? saved : DEMO_FUNDS_LIST;
    return displayList.find((f) => f.id === fundId);
  }, [draft, fundId]);

  const patchFunds = useCallback((nextItems) => {
    setDraft((d) => mergeFundsIntoDraft(d, nextItems));
  }, []);

  const fundsItems = draft?.productConfiguration?.funds?.items ?? [];
  const tableStructureRaw = draft?.productConfiguration?.tableStructureDesign;

  const pageTitle = useMemo(() => {
    const fundName = fundRow?.fundName?.trim() || "…";
    return `Fund details — ${fundName}`;
  }, [fundRow?.fundName]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Products" onBack={() => navigate("/underwriter/product-studio")} title="Product not found" />
        </header>
      </main>
    );
  }

  if (benefitNotFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Product" onBack={() => navigate(`/underwriter/product-studio/${encodeURIComponent(productId)}`)} title="Benefit not found" />
        </header>
      </main>
    );
  }

  if (!draft || !benefitRow) {
    return null;
  }

  if (!fundRow) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack backAriaLabel="Funds & Investments" onBack={() => navigate(fundsPath)} title="Fund not found" />
        </header>
      </main>
    );
  }

  return (
    <main className="portal psc-page psc-form-page">
      <header className="psc-header">
        <PageTitleWithBack backAriaLabel="Funds & Investments" onBack={() => navigate(fundsPath)} title={pageTitle} />
      </header>

      <section className="psc-form-card">
        <BenefitFundDetailPanel
          fundId={fundId}
          fundsItems={fundsItems}
          onFundsChange={patchFunds}
          tableStructure={tableStructureRaw}
        />
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

  const patchDraft = useCallback((key, v) => {
    setDraft((d) => (d ? { ...d, [key]: v } : d));
  }, []);

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

  const patchTableStructure = useCallback((nextTableStructure) => {
    setDraft((d) => mergeTableStructureIntoDraft(d, nextTableStructure));
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

  const patchUnderwritingRules = useCallback((next) => {
    setDraft((d) => mergeUnderwritingRulesIntoDraft(d, next));
  }, []);

  const patchMedicalRequirementMatrix = useCallback((next) => {
    setDraft((d) => mergeMedicalRequirementMatrixIntoDraft(d, next));
  }, []);

  const patchCommissionDistribution = useCallback((next) => {
    setDraft((d) => mergeCommissionDistributionIntoDraft(d, next));
  }, []);

  const patchDocumentTemplates = useCallback((next) => {
    setDraft((d) => mergeDocumentTemplatesIntoDraft(d, next));
  }, []);

  const save = useCallback(() => {
    persistProductDraft(draft, navigate);
  }, [draft, navigate]);

  const pageTitle = useMemo(() => {
    const display = draft?.productName?.trim() || draft?.productCode || "…";
    return `Edit product — ${display}`;
  }, [draft]);

  if (notFound) {
    return (
      <main className="portal psc-page psc-form-page">
        <header className="psc-header">
          <PageTitleWithBack
            backAriaLabel="Products"
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
          onBack={() => navigate("/underwriter/product-studio")}
          title={pageTitle}
        />
      </header>

      <section className="psc-form-card">
        <ProductDetailsSection
          headerTrailing={
            <button className="primary-button" type="button" onClick={save}>
              Save product
            </button>
          }
        >
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
          <ProductDurationEligibilityDetailsSection
            productForView={{
              ...draft,
              productConfiguration: draft.productConfiguration || defaultProductConfiguration(),
            }}
            overrides={draft.productConfiguration?.durationEligibility?.overrides || {}}
            onOverrideChange={patchDurationOverride}
          />
          <div className="psc-product-components">
            <h2 className="psc-product-components-title">Product components</h2>
            <ProductStudioComponentsCardGrid productId={productId} />
          </div>
        </ProductDetailsSection>
        <div className="psc-field-section psc-core-benefits-embed">
          <h2 className="psc-field-section-title">Core benefits & riders</h2>
          <CoreBenefitsRidersPanel
            items={draft.productConfiguration?.coreBenefitsAndRiders?.items ?? []}
            onItemsChange={patchCoreBenefitsItems}
            benefitEditBasePath={`/underwriter/product-studio/${encodeURIComponent(productId)}`}
          />
        </div>
      </section>
    </main>
  );
}

/** Nested routes: index = catalogue, new = create, :id = edit details (basics + configuration). */
export function ProductStudioLayout() {
  return (
    <Routes>
      <Route index element={<ProductStudioListPage />} />
      <Route path="new" element={<ProductStudioNewProductPage />} />
      <Route path=":productId/benefits/:benefitId/edit" element={<ProductStudioBenefitEditPage />} />
      <Route path=":productId/benefits/:benefitId/rate-tables" element={<ProductStudioBenefitRateTablesPage />} />
      <Route path=":productId/benefits/:benefitId/charge-rate-tables" element={<ProductStudioBenefitChargeRateTablesPage />} />
      <Route path=":productId/benefits/:benefitId/charges/:chargeId" element={<ProductStudioBenefitChargeDetailPage />} />
      <Route path=":productId/benefits/:benefitId/charges" element={<ProductStudioBenefitChargesPage />} />
      <Route path=":productId/benefits/:benefitId/funds/:fundId/growth-rate" element={<ProductStudioBenefitFundGrowthRatePage />} />
      <Route path=":productId/benefits/:benefitId/funds" element={<ProductStudioBenefitFundsPage />} />
      <Route path=":productId/benefits/:benefitId/underwriting-rules" element={<ProductStudioBenefitUnderwritingRulesPage />} />
      <Route path=":productId/riders/edit/:kind/:riderId" element={<ProductStudioRiderFormPage />} />
      <Route path=":productId/components/:componentId" element={<ProductStudioComponentPage />} />
      <Route path=":productId/edit" element={<ProductStudioLegacyEditRedirect />} />
      <Route path=":productId" element={<ProductStudioViewDetailsPage />} />
    </Routes>
  );
}

/** Old links used `/edit` for basics-only; that flow now lives on the main product page. */
function ProductStudioLegacyEditRedirect() {
  const { productId } = useParams();
  return <Navigate to={`/underwriter/product-studio/${encodeURIComponent(productId)}`} replace />;
}
