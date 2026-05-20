import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  MEDICAL_UW_CHOICES,
  RIDER_PREMIUM_TYPE_CHOICES,
  RIDER_TERM_CHOICES,
  SUM_ASSURED_BASIS_CHOICES,
  YES_NO_EMPTY_CHOICES,
} from "./productStudioRiders.js";

function RuleField({ label, children }) {
  return (
    <label className="psc-field">
      <span className="psc-field-label">{label}</span>
      {children}
    </label>
  );
}

/**
 * Shared rider identity + rule fields for full page and dialog.
 * Matches Product Studio `psc-field-grid`: most cells are not `psc-field-wide` so
 * dialog containers get 2–3 columns (same pattern as Add benefit).
 *
 * @param {{ riderName: string, description: string, enabled?: boolean, readOnlyIdentity?: boolean, rules: object }} props.form
 * @param {(updater: (f: object) => object) => void} props.setForm
 * @param {(key: string, value: string) => void} props.patchRules
 * @param {string} props.currency
 * @param {"page" | "dialog"} props.variant — section title styling
 */
export function ProductStudioRiderFormFields({ form, setForm, patchRules, currency, variant = "page" }) {
  const r = form.rules;
  const SectionTitle = variant === "dialog" ? "h3" : "h2";
  const sectionTitleClass =
    variant === "dialog" ? "psc-field-section-title psc-core-benefits-subtitle" : "psc-field-section-title";

  return (
    <>
      <div className="psc-field-section">
        <SectionTitle className={sectionTitleClass}>Rider identity</SectionTitle>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Rider name</span>
            <input
              className="psc-input"
              type="text"
              value={form.riderName}
              disabled={Boolean(form.readOnlyIdentity)}
              onChange={(e) => setForm((f) => (f ? { ...f, riderName: e.target.value } : f))}
              placeholder="e.g. Extended CI rider"
            />
          </label>
          {!form.readOnlyIdentity ? (
            <div className="psc-field psc-rider-dialog-enabled-row">
              <span className="psc-field-label">Offered (enabled)</span>
              <label className="psc-rider-switch psc-rider-switch--inline-label">
                <input
                  type="checkbox"
                  className="psc-rider-switch-input"
                  checked={Boolean(form.enabled)}
                  onChange={(e) => setForm((f) => (f ? { ...f, enabled: e.target.checked } : f))}
                  aria-label="Offered on product"
                />
                <span className="psc-rider-switch-track" aria-hidden>
                  <span className="psc-rider-switch-thumb" />
                </span>
              </label>
            </div>
          ) : null}
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Description</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={form.description}
              disabled={Boolean(form.readOnlyIdentity)}
              onChange={(e) => setForm((f) => (f ? { ...f, description: e.target.value } : f))}
              placeholder="Short description for underwriters"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <SectionTitle className={sectionTitleClass}>Age rules</SectionTitle>
        <div className="psc-field-grid">
          <RuleField label="Minimum entry age">
            <input className="psc-input" type="text" inputMode="numeric" value={r.minEntryAge} onChange={(e) => patchRules("minEntryAge", e.target.value)} />
          </RuleField>
          <RuleField label="Maximum entry age">
            <input className="psc-input" type="text" inputMode="numeric" value={r.maxEntryAge} onChange={(e) => patchRules("maxEntryAge", e.target.value)} />
          </RuleField>
          <RuleField label="Maximum expiry age">
            <input className="psc-input" type="text" inputMode="numeric" value={r.maxExpiryAge} onChange={(e) => patchRules("maxExpiryAge", e.target.value)} />
          </RuleField>
        </div>
      </div>

      <div className="psc-field-section">
        <SectionTitle className={sectionTitleClass}>Sum assured</SectionTitle>
        <div className="psc-field-grid">
          <div className="psc-field">
            <span className="psc-field-label">Sum assured basis</span>
            <DropdownSelect
              variant="psc"
              value={r.sumAssuredBasis}
              onChange={(v) => patchRules("sumAssuredBasis", v)}
              options={SUM_ASSURED_BASIS_CHOICES}
              placeholder="Select"
            />
          </div>
          <RuleField label="Minimum rider SA">
            <input className="psc-input" type="text" value={r.minRiderSa} onChange={(e) => patchRules("minRiderSa", e.target.value)} />
          </RuleField>
          <RuleField label="Maximum rider SA">
            <input className="psc-input" type="text" value={r.maxRiderSa} onChange={(e) => patchRules("maxRiderSa", e.target.value)} />
          </RuleField>
          <div className="psc-field">
            <span className="psc-field-label">Cannot exceed base SA</span>
            <DropdownSelect
              variant="psc"
              value={r.cannotExceedBaseSa}
              onChange={(v) => patchRules("cannotExceedBaseSa", v)}
              options={YES_NO_EMPTY_CHOICES}
              placeholder="Select"
            />
          </div>
        </div>
      </div>

      <div className="psc-field-section">
        <SectionTitle className={sectionTitleClass}>Waiting & survival</SectionTitle>
        <div className="psc-field-grid">
          <RuleField label="Waiting period">
            <input className="psc-input" type="text" inputMode="numeric" value={r.waitingPeriodDays} onChange={(e) => patchRules("waitingPeriodDays", e.target.value)} />
          </RuleField>
          <RuleField label="Survival period">
            <input className="psc-input" type="text" value={r.survivalPeriodDays} onChange={(e) => patchRules("survivalPeriodDays", e.target.value)} />
          </RuleField>
        </div>
      </div>

      <div className="psc-field-section">
        <SectionTitle className={sectionTitleClass}>Underwriting & occupation</SectionTitle>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Allowed occupations</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={r.allowedOccupations}
              onChange={(e) => patchRules("allowedOccupations", e.target.value)}
              placeholder="e.g. Class 1–3 only"
            />
          </label>
          <div className="psc-field">
            <span className="psc-field-label">Requires medical UW</span>
            <DropdownSelect
              variant="psc"
              value={r.requiresMedicalUw}
              onChange={(v) => patchRules("requiresMedicalUw", v)}
              options={MEDICAL_UW_CHOICES}
              placeholder="Select"
            />
          </div>
          {r.requiresMedicalUw === "above_limit" ? (
            <RuleField label="Limit (describe)">
              <input className="psc-input" type="text" value={r.medicalUwLimit} onChange={(e) => patchRules("medicalUwLimit", e.target.value)} />
            </RuleField>
          ) : null}
        </div>
      </div>

      <div className="psc-field-section">
        <SectionTitle className={sectionTitleClass}>Premium, term & policy</SectionTitle>
        <div className="psc-field-grid">
          <div className="psc-field">
            <span className="psc-field-label">Rider premium type</span>
            <DropdownSelect
              variant="psc"
              value={r.riderPremiumType}
              onChange={(v) => patchRules("riderPremiumType", v)}
              options={RIDER_PREMIUM_TYPE_CHOICES}
              placeholder="Select"
            />
          </div>
          <div className="psc-field">
            <span className="psc-field-label">Rider term</span>
            <DropdownSelect variant="psc" value={r.riderTerm} onChange={(v) => patchRules("riderTerm", v)} options={RIDER_TERM_CHOICES} placeholder="Select" />
          </div>
          <div className="psc-field">
            <span className="psc-field-label">Cancellation allowed</span>
            <DropdownSelect
              variant="psc"
              value={r.cancellationAllowed}
              onChange={(v) => patchRules("cancellationAllowed", v)}
              options={YES_NO_EMPTY_CHOICES}
              placeholder="Select"
            />
          </div>
          <div className="psc-field">
            <span className="psc-field-label">Reinstatement allowed</span>
            <DropdownSelect
              variant="psc"
              value={r.reinstatementAllowed}
              onChange={(v) => patchRules("reinstatementAllowed", v)}
              options={YES_NO_EMPTY_CHOICES}
              placeholder="Select"
            />
          </div>
        </div>
      </div>
    </>
  );
}
