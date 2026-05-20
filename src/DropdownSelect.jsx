import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

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
 * Custom dropdown (no native `<select>` menu). White panel, padded chevron, fixed positioning via portal.
 *
 * @param {{
 *   value?: string,
 *   onChange: (value: string) => void,
 *   options: string[] | { value: string, label: string }[],
 *   placeholder?: string,
 *   emptyOptionLabel?: string,
 *   disabled?: boolean,
 *   id?: string,
 *   "aria-label"?: string,
 *   variant?: "default" | "psc" | "compact",
 *   className?: string,
 * }} props
 */
export function DropdownSelect({
  value = "",
  onChange,
  options,
  placeholder = "Select",
  emptyOptionLabel,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  variant = "default",
  className = "",
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const triggerId = id ?? `${uid}-trigger`;

  const v = value == null ? "" : String(value);
  const selected = normalized.find((o) => o.value === v);
  const display = selected ? selected.label : v === "" ? placeholder : v;

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
      const maxH = Math.min(320, Math.max(120, spaceBelow));
      setPanelStyle({
        position: "fixed",
        left: `${r.left}px`,
        top: `${r.bottom + 4}px`,
        width: `${r.width}px`,
        maxHeight: `${maxH}px`,
        /* Above Product Studio modals (.psc-benefit-dialog-backdrop is 10080) */
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
  }, [open]);

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

  const rootClass = ["dd", variant !== "default" ? `dd--${variant}` : "", className].filter(Boolean).join(" ");

  const panel = open && panelStyle && (
    <div
      ref={panelRef}
      className="dd-panel"
      id={listboxId}
      role="listbox"
      style={panelStyle}
    >
      {emptyOptionLabel != null && (
        <button
          type="button"
          role="option"
          aria-selected={v === ""}
          className={`dd-option ${v === "" ? "is-active" : ""}`}
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
        >
          {emptyOptionLabel}
        </button>
      )}
      {normalized.map((opt, idx) => (
        <button
          key={opt.value === "" ? `opt-empty-${idx}-${opt.label}` : opt.value}
          type="button"
          role="option"
          aria-selected={opt.value === v}
          className={`dd-option ${opt.value === v ? "is-active" : ""}`}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        className="dd-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => {
          if (!disabled) {
            setOpen((o) => !o);
          }
        }}
      >
        <span className={`dd-trigger-label ${v === "" ? "is-placeholder" : ""}`}>{display}</span>
        <span className="dd-trigger-chevron" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
