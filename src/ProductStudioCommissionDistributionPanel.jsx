import { useCallback, useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect.jsx";
import {
  CHANNEL_SPECIFIC_OPTIONS,
  COMMISSION_BASED_ON_OPTIONS,
  COMMISSION_TYPE_CATALOG,
  RIDER_COMMISSION_OPTIONS,
  normalizeCommissionDistributionConfiguration,
} from "./productStudioCommissionDistribution.js";

/**
 * @param {unknown} commissionDistribution
 * @param {(next: object) => void} onCommissionDistributionChange
 */
export function ProductStudioCommissionDistributionPanel({ commissionDistribution, onCommissionDistributionChange }) {
  const cfg = useMemo(() => normalizeCommissionDistributionConfiguration(commissionDistribution), [commissionDistribution]);

  const emit = useCallback(
    (next) => {
      onCommissionDistributionChange(normalizeCommissionDistributionConfiguration(next));
    },
    [onCommissionDistributionChange],
  );

  const patch = useCallback(
    (key, value) => {
      emit({ ...cfg, [key]: value });
    },
    [cfg, emit],
  );

  return (
    <div className="psc-charges-panel">
      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Commission types</h3>
        <div className="psc-commission-type-table-wrap">
          <table className="psc-commission-type-table">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_TYPE_CATALOG.map((row) => (
                <tr key={row.id}>
                  <td>{row.typeLabel}</td>
                  <td>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Rates & renewal</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Year 1 commission</span>
            <input
              className="psc-input"
              type="text"
              value={cfg.year1Commission}
              onChange={(e) => patch("year1Commission", e.target.value)}
              placeholder="e.g. 30% of annualized premium"
            />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Year 2 commission</span>
            <input className="psc-input" type="text" value={cfg.year2Commission} onChange={(e) => patch("year2Commission", e.target.value)} placeholder="e.g. 10%" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Renewal commission</span>
            <input
              className="psc-input"
              type="text"
              value={cfg.renewalCommission}
              onChange={(e) => patch("renewalCommission", e.target.value)}
              placeholder="e.g. 5% from year 3 onward"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Clawback</h3>
        <div className="psc-field-grid">
          <label className="psc-field">
            <span className="psc-field-label">Clawback period</span>
            <input className="psc-input" type="text" value={cfg.clawbackPeriod} onChange={(e) => patch("clawbackPeriod", e.target.value)} placeholder="e.g. 24 months" />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Clawback basis</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={2}
              value={cfg.clawbackBasis}
              onChange={(e) => patch("clawbackBasis", e.target.value)}
              placeholder="e.g. 100% if lapse in year 1, 50% if lapse in year 2"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Basis & riders</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Commission based on</span>
            <DropdownSelect
              variant="psc"
              value={cfg.commissionBasedOn}
              onChange={(v) => patch("commissionBasedOn", v)}
              options={COMMISSION_BASED_ON_OPTIONS}
              placeholder="Select"
            />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Rider commission</span>
            <DropdownSelect
              variant="psc"
              value={cfg.riderCommission}
              onChange={(v) => patch("riderCommission", v)}
              options={RIDER_COMMISSION_OPTIONS}
              placeholder="Select"
            />
          </label>
        </div>
      </div>

      <div className="psc-field-section">
        <h3 className="psc-field-section-title psc-core-benefits-subtitle">Channel</h3>
        <div className="psc-field-grid">
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Channel-specific</span>
            <DropdownSelect
              variant="psc"
              value={cfg.channelSpecific}
              onChange={(v) => patch("channelSpecific", v)}
              options={CHANNEL_SPECIFIC_OPTIONS}
              placeholder="Select"
            />
          </label>
          <label className="psc-field psc-field-wide">
            <span className="psc-field-label">Notes</span>
            <textarea
              className="psc-input psc-textarea psc-textarea--compact"
              rows={3}
              value={cfg.commissionNotes}
              onChange={(e) => patch("commissionNotes", e.target.value)}
              placeholder=""
            />
          </label>
        </div>
      </div>
    </div>
  );
}
