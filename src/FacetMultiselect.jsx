import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { facetValuesList } from "./productStudioRateSegmentFacets.js";

function normalizeOptions(options) {
  if (!options || options.length === 0) {
    return [];
  }
  const first = options[0];
  if (typeof first === "object" && first !== null && "value" in first && "label" in first) {
    return options.map((o) => ({ value: String(o.value), label: String(o.label) }));
  }
  return options.map((s) => ({ value: String(s), label: String(s) }));
}

/**
 * Multiselect for rate-table segment facets (chips + checklist panel).
 *
 * @param {{
 *   options: string[] | { value: string, label: string }[],
 *   selected: string[],
 *   onSelectedChange: (values: string[]) => void,
 *   placeholder?: string,
 *   ariaLabel?: string,
 *   widePanel?: boolean,
 * }} props
 */
export function FacetMultiselect({
  options,
  selected,
  onSelectedChange,
  placeholder = "Select one or more",
  ariaLabel,
  widePanel = false,
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const optionValues = useMemo(() => normalized.map((o) => o.value), [normalized]);
  const labelByValue = useMemo(() => Object.fromEntries(normalized.map((o) => [o.value, o.label])), [normalized]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const uid = useId();
  const listboxId = `${uid}-ms-list`;
  const triggerId = `${uid}-ms-trigger`;

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
        zIndex: 10100,
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
    (value) => {
      if (selectedSet.has(value)) {
        onSelectedChange(selected.filter((s) => s !== value));
      } else {
        onSelectedChange([...selected, value]);
      }
    },
    [onSelectedChange, selected, selectedSet],
  );

  const removeChip = useCallback(
    (e, value) => {
      e.stopPropagation();
      onSelectedChange(selected.filter((s) => s !== value));
    },
    [onSelectedChange, selected],
  );

  const panel =
    open &&
    panelStyle && (
      <div ref={panelRef} className="psc-ms-panel" id={listboxId} role="listbox" aria-multiselectable="true" style={panelStyle}>
        {normalized.map((opt) => {
          const isOn = selectedSet.has(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isOn}
              className={`psc-ms-option ${isOn ? "is-on" : ""}`}
              onClick={() => toggle(opt.value)}
            >
              <span className="psc-ms-option-check" aria-hidden>
                {isOn ? "✓" : ""}
              </span>
              <span className="psc-ms-option-body">
                <span className="psc-ms-option-title">{opt.label}</span>
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
            selected.map((value) => (
              <span key={value} className={`psc-ms-chip ${optionValues.includes(value) ? "" : "is-custom"}`}>
                <span className="psc-ms-chip-text">{labelByValue[value] ?? value}</span>
                <button
                  type="button"
                  className="psc-ms-chip-remove"
                  aria-label={`Remove ${labelByValue[value] ?? value}`}
                  onClick={(e) => removeChip(e, value)}
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

/**
 * @param {{
 *   label: string,
 *   facetKey: string,
 *   facets: object,
 *   onPatch: (key: string, values: string[]) => void,
 *   options: string[] | { value: string, label: string }[],
 *   filterMode?: boolean,
 *   ariaLabel?: string,
 * }} props
 */
export function FacetMultiselectField({ label, facetKey, facets, onPatch, options, filterMode = false, ariaLabel }) {
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      <FacetMultiselect
        options={options}
        selected={facetValuesList(facets[facetKey])}
        onSelectedChange={(values) => onPatch(facetKey, values)}
        placeholder={filterMode ? "All" : "Select one or more"}
        ariaLabel={ariaLabel ?? label}
      />
    </label>
  );
}
