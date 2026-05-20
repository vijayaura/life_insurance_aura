/** Normalize a facet field to a string array (supports legacy single-string values). */
export function facetValuesList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  const s = String(value ?? "").trim();
  return s ? [s] : [];
}

export function facetKeyFromFacets(facets, facetKeys) {
  return facetKeys
    .map((k) => {
      const vals = [...facetValuesList(facets[k])].sort();
      return `${k}=${vals.join("\u001f")}`;
    })
    .join("|");
}

export function normalizeFacetObject(facets, facetKeys) {
  return Object.fromEntries(facetKeys.map((k) => [k, facetValuesList(facets[k])]));
}

export function defaultSegmentFilter(facetKeys) {
  return Object.fromEntries(facetKeys.map((k) => [k, []]));
}

export function segmentFilterIsActive(filter, facetKeys) {
  return facetKeys.some((k) => facetValuesList(filter[k]).length > 0);
}

/** Segment matches when each filtered dimension intersects the segment's selected values. */
export function scenarioMatchesSegmentFilter(facets, filter, facetKeys) {
  return facetKeys.every((k) => {
    const want = facetValuesList(filter[k]);
    if (!want.length) {
      return true;
    }
    const have = facetValuesList(facets[k]);
    return have.some((v) => want.includes(v));
  });
}

export function joinFacetLabels(values, separator = ", ") {
  const list = facetValuesList(values);
  return list.length ? list.join(separator) : "";
}

export function joinFacetShortLabels(values, shortFn, separator = "+") {
  const list = facetValuesList(values);
  if (!list.length) {
    return "—";
  }
  if (list.length === 1) {
    return shortFn(list[0]);
  }
  return list.map(shortFn).join(separator);
}
