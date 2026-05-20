import { useCallback, useMemo } from "react";
import { RATE_TABLE_CATALOG } from "./productStudioRateTableCatalog.js";
import { normalizeTableStructureDesign } from "./productStudioTableStructure.jsx";

/**
 * @param {{
 *   tableStructure: unknown,
 *   onTableStructureChange: (next: object) => void,
 * }} props
 */
export function ProductStudioTableStructurePanel({ tableStructure, onTableStructureChange }) {
  const design = useMemo(() => normalizeTableStructureDesign(tableStructure), [tableStructure]);

  const patchEnabledKeys = useCallback(
    (tableId, enabledFacetKeys) => {
      onTableStructureChange({
        ...design,
        tables: {
          ...design.tables,
          [tableId]: { enabledFacetKeys },
        },
      });
    },
    [design, onTableStructureChange],
  );

  const toggleVariable = useCallback(
    (tableId, variableKey, checked) => {
      const def = RATE_TABLE_CATALOG.find((t) => t.id === tableId);
      if (!def) {
        return;
      }
      const current = design.tables[tableId]?.enabledFacetKeys ?? [];
      const next = checked
        ? [...new Set([...current, variableKey])]
        : current.filter((k) => k !== variableKey);
      if (!next.length) {
        window.alert("At least one variable must remain enabled for segment dropdowns.");
        return;
      }
      patchEnabledKeys(tableId, next);
    },
    [design.tables, patchEnabledKeys],
  );

  const selectAll = useCallback(
    (tableId) => {
      const def = RATE_TABLE_CATALOG.find((t) => t.id === tableId);
      if (def) {
        patchEnabledKeys(tableId, def.variables.map((v) => v.key));
      }
    },
    [patchEnabledKeys],
  );

  const clearToMinimum = useCallback(
    (tableId) => {
      const def = RATE_TABLE_CATALOG.find((t) => t.id === tableId);
      if (def?.variables[0]) {
        patchEnabledKeys(tableId, [def.variables[0].key]);
      }
    },
    [patchEnabledKeys],
  );

  return (
    <div className="psc-table-structure-panel">
      <ul className="psc-benefit-cards psc-table-structure-list" role="list">
        {RATE_TABLE_CATALOG.map((table) => {
          const enabled = design.tables[table.id]?.enabledFacetKeys ?? table.defaultEnabledKeys;
          const enabledSet = new Set(enabled);

          return (
            <li key={table.id} className="psc-benefit-card psc-table-structure-card">
              <div className="psc-benefit-card-body">
                <div className="psc-benefit-card-lead">
                  <p className="psc-benefit-card-name">{table.label}</p>
                </div>
                <div className="psc-table-structure-vars">
                  <div className="psc-table-structure-vars-head">
                    <span className="psc-field-label">Variables for segment dropdowns</span>
                    <div className="psc-table-structure-vars-actions">
                      <button type="button" className="psc-card-action" onClick={() => selectAll(table.id)}>
                        Select all
                      </button>
                      <button type="button" className="psc-card-action" onClick={() => clearToMinimum(table.id)}>
                        Clear to one
                      </button>
                    </div>
                  </div>
                  <ul className="psc-table-structure-var-grid" role="list">
                    {table.variables.map((variable) => {
                      const isOn = enabledSet.has(variable.key);
                      return (
                        <li key={variable.key} className={`psc-table-structure-var${isOn ? " is-enabled" : ""}`}>
                          <label className="psc-table-structure-var-label">
                            <input
                              type="checkbox"
                              checked={isOn}
                              onChange={(e) => toggleVariable(table.id, variable.key, e.target.checked)}
                            />
                            <span className="psc-table-structure-var-text">
                              <strong>{variable.label}</strong>
                              <code className="psc-table-structure-var-key">{variable.key}</code>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
