import { facetKeyFromFacets, normalizeFacetObject } from "./productStudioRateSegmentFacets.js";
import { RATE_TABLE_CATALOG, RATE_TABLE_BY_ID } from "./productStudioRateTableCatalog.js";

/**
 * @returns {{ tables: Record<string, { enabledFacetKeys: string[] }> }}
 */
export function defaultTableStructureDesign() {
  return {
    tables: Object.fromEntries(
      RATE_TABLE_CATALOG.map((t) => [t.id, { enabledFacetKeys: [...t.defaultEnabledKeys] }]),
    ),
  };
}

/**
 * @param {unknown} raw
 * @returns {{ tables: Record<string, { enabledFacetKeys: string[] }> }}
 */
export function normalizeTableStructureDesign(raw) {
  const defaults = defaultTableStructureDesign();
  const tablesIn = raw?.tables && typeof raw.tables === "object" ? raw.tables : {};
  const tables = { ...defaults.tables };

  for (const def of RATE_TABLE_CATALOG) {
    const entry = tablesIn[def.id];
    const allowed = new Set(def.variables.map((v) => v.key));
    let enabled = Array.isArray(entry?.enabledFacetKeys) ? entry.enabledFacetKeys : def.defaultEnabledKeys;
    enabled = enabled.map((k) => String(k).trim()).filter((k) => allowed.has(k));
    if (!enabled.length) {
      enabled = [...def.defaultEnabledKeys];
    }
    tables[def.id] = { enabledFacetKeys: enabled };
  }

  return { tables };
}

/**
 * @param {string} tableId
 * @param {unknown} tableStructure
 * @returns {string[]}
 */
export function getEnabledFacetKeys(tableId, tableStructure) {
  const def = RATE_TABLE_BY_ID[tableId];
  if (!def) {
    return [];
  }
  const normalized = normalizeTableStructureDesign(tableStructure);
  return normalized.tables[tableId]?.enabledFacetKeys ?? def.defaultEnabledKeys;
}

/**
 * Apply product table-structure limits to a rate segment table config.
 * @param {object} baseConfig
 * @param {string} tableId
 * @param {unknown} tableStructure
 * @param {import("react").ComponentType<{ facets: object, onPatch: Function, filterMode?: boolean, enabledFacetKeys?: string[] }>} FacetFieldsComponent
 */
export function applyTableStructureToRateConfig(baseConfig, tableId, tableStructure, FacetFieldsComponent) {
  const enabledFacetKeys = getEnabledFacetKeys(tableId, tableStructure);
  const allKeys = baseConfig.facetKeys ?? enabledFacetKeys;

  function WrappedFacetFields(props) {
    return <FacetFieldsComponent {...props} enabledFacetKeys={enabledFacetKeys} />;
  }

  return {
    ...baseConfig,
    facetKeys: enabledFacetKeys,
    allFacetKeys: allKeys,
    FacetFields: WrappedFacetFields,
    facetKey: (facets) => facetKeyFromFacets(facets, enabledFacetKeys),
    defaultFacets: () => {
      const full = baseConfig.defaultFacets();
      return normalizeFacetObject(full, enabledFacetKeys);
    },
  };
}
