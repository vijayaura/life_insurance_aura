/** Local catalog for Product Studio (underwriter). */

import { defaultProductConfiguration } from "./productStudioConfiguration.js";

export const PRODUCT_STUDIO_CATALOG_KEY = "life-insurance-product-studio-catalog-v2";

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Demo catalogue rows; optional `catalogDisplayVersions[]` holds per-version slices merged over the parent for list/edit. */
const CATALOG_VERSION_PERSIST_KEYS = [
  "productVersion",
  "productStatus",
  "effectiveDate",
  "expiryDate",
  "productCategory",
  "productType",
  "productCurrency",
  "distributionChannel",
  "targetSegment",
  "regulatoryJurisdiction",
  "takafulOrConventional",
  "policyAdminMode",
  "productConfiguration",
];

export const MOCK_PRODUCT_CATALOG = [
  {
    id: "psc-demo-aura",
    productName: "Aura Life Protect",
    productCode: "AURA-LP-01",
    productCategory: "Protection",
    productType: "Term",
    productCurrency: "AED",
    productStatus: "Published",
    productVersion: "V1.0",
    effectiveDate: "2024-01-01",
    expiryDate: "",
    distributionChannel: "Direct",
    targetSegment: "Individual",
    regulatoryJurisdiction: "UAE",
    takafulOrConventional: "Conventional",
    policyAdminMode: "Individual policy",
    /** Two sellable rows under one product: each has its own Edit / View details. */
    catalogDisplayVersions: [
      {
        id: "psc-demo-aura-ver-1",
        productVersion: "V1.0",
        productStatus: "Published",
        effectiveDate: "2024-01-01",
        expiryDate: "",
        productConfiguration: {
          durationEligibility: {
            overrides: {
              maxSumAssured: "AED 12,000,000 (select tiers)",
              minPremium: "AED 150 monthly",
            },
          },
        },
      },
      {
        id: "psc-demo-aura-ver-2",
        productVersion: "V2.0",
        productStatus: "Under Review",
        effectiveDate: "2026-07-01",
        expiryDate: "",
        productConfiguration: {
          durationEligibility: {
            overrides: {
              maxSumAssured: "AED 15,000,000 (select tiers)",
              minPremium: "AED 175 monthly",
            },
          },
        },
      },
    ],
  },
  {
    id: "psc-demo-family",
    productName: "Family Shield",
    productCode: "FAM-SH-02",
    productCategory: "Protection",
    productType: "Whole Life",
    productCurrency: "AED",
    productStatus: "Approved",
    productVersion: "V1.1",
    effectiveDate: "2023-06-15",
    expiryDate: "2028-06-14",
    distributionChannel: "Broker",
    targetSegment: "Mass Retail",
    regulatoryJurisdiction: "UAE",
    takafulOrConventional: "Takaful",
    policyAdminMode: "Individual policy",
    productConfiguration: {
      durationEligibility: {
        overrides: {
          policyTermOptions: "5, 10, 15, 20 years, to age 70",
          conversionAllowed: "Takaful conversion per Shariah board schedule",
        },
      },
    },
  },
  {
    id: "psc-demo-future",
    productName: "Future Builder",
    productCode: "FUT-BLD-03",
    productCategory: "Savings",
    productType: "ULIP",
    productCurrency: "USD",
    productStatus: "Under Review",
    productVersion: "V2.0",
    effectiveDate: "2025-04-01",
    expiryDate: "",
    distributionChannel: "Bank",
    targetSegment: "HNW",
    regulatoryJurisdiction: "KSA",
    takafulOrConventional: "Conventional",
    policyAdminMode: "Individual policy",
    productConfiguration: {
      durationEligibility: {
        overrides: {
          minSumAssured: "USD 25,000",
          residencyEligibility: "KSA / GCC / selected worldwide",
        },
      },
    },
  },
  {
    id: "psc-demo-group",
    productName: "Group Secure Life",
    productCode: "GRP-SL-04",
    productCategory: "Group Life",
    productType: "Term",
    productCurrency: "AED",
    productStatus: "Draft",
    productVersion: "V1.0",
    effectiveDate: "",
    expiryDate: "",
    distributionChannel: "Agent",
    targetSegment: "Group",
    regulatoryJurisdiction: "Oman",
    takafulOrConventional: "Conventional",
    policyAdminMode: "Group policy",
    productConfiguration: {
      durationEligibility: {
        overrides: {
          minEntryAge: "18 years (employee)",
          maxEntryAge: "69 years last birthday",
          renewalAllowed: "Annual group renewal",
        },
      },
    },
  },
];

export function defaultProductRecord() {
  return {
    id: uid(),
    productName: "",
    productCode: "",
    productCategory: "Protection",
    productType: "Term",
    productCurrency: "AED",
    productStatus: "Draft",
    productVersion: "V1.0",
    effectiveDate: "",
    expiryDate: "",
    distributionChannel: "Direct",
    targetSegment: "Individual",
    regulatoryJurisdiction: "UAE",
    takafulOrConventional: "Conventional",
    policyAdminMode: "Individual policy",
    productConfiguration: defaultProductConfiguration(),
  };
}

export function loadProductCatalog() {
  try {
    const raw = localStorage.getItem(PRODUCT_STUDIO_CATALOG_KEY);
    if (raw == null) {
      const seeded = MOCK_PRODUCT_CATALOG.map((p) => ({ ...p }));
      saveProductCatalog(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = MOCK_PRODUCT_CATALOG.map((p) => ({ ...p }));
      saveProductCatalog(seeded);
      return seeded;
    }
    if (parsed.length === 0) {
      const seeded = MOCK_PRODUCT_CATALOG.map((p) => ({ ...p }));
      saveProductCatalog(seeded);
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = MOCK_PRODUCT_CATALOG.map((p) => ({ ...p }));
    saveProductCatalog(seeded);
    return seeded;
  }
}

export function saveProductCatalog(products) {
  try {
    localStorage.setItem(PRODUCT_STUDIO_CATALOG_KEY, JSON.stringify(products));
  } catch {
    /* ignore quota */
  }
}

export function mergeCatalogVersion(parent, versionSlice) {
  const { catalogDisplayVersions: _v, ...base } = parent;
  return { ...base, ...versionSlice, id: versionSlice.id };
}

/** Rows to render in the list (one strip + actions each). */
export function catalogListRowSnapshots(parent) {
  const rows = parent.catalogDisplayVersions;
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((slice) => mergeCatalogVersion(parent, slice));
  }
  const { catalogDisplayVersions: _c, ...rest } = parent;
  return [rest];
}

export function resolveCatalogParentId(products, id) {
  for (const p of products) {
    if (p.id === id) {
      return p.id;
    }
    const rows = p.catalogDisplayVersions;
    if (Array.isArray(rows) && rows.some((r) => r.id === id)) {
      return p.id;
    }
  }
  return id;
}

export function findCatalogPlacement(products, id) {
  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    if (p.id === id) {
      return { kind: "parent", index: i };
    }
    const rows = p.catalogDisplayVersions;
    if (Array.isArray(rows)) {
      const vi = rows.findIndex((r) => r.id === id);
      if (vi >= 0) {
        return { kind: "version", parentIndex: i, versionIndex: vi };
      }
    }
  }
  return null;
}

export function sliceVersionPayloadFromDraft(_parentBase, draft) {
  const out = { id: draft.id };
  for (const k of CATALOG_VERSION_PERSIST_KEYS) {
    if (draft[k] !== undefined) {
      out[k] = draft[k];
    }
  }
  return out;
}

/** True if another catalogue row (outside the same parent product) already uses this code. */
export function hasProductCodeConflictWithOthers(list, draftId, code) {
  const c = (code || "").trim().toLowerCase();
  if (!c) {
    return false;
  }
  const selfParent = resolveCatalogParentId(list, draftId);
  for (const parent of list) {
    for (const row of catalogListRowSnapshots(parent)) {
      if (row.id === draftId) {
        continue;
      }
      if ((row.productCode || "").trim().toLowerCase() !== c) {
        continue;
      }
      const otherParent = resolveCatalogParentId(list, row.id);
      if (otherParent !== selfParent) {
        return true;
      }
    }
  }
  return false;
}

/** When saving a version row, these fields are written on the parent so identity stays in sync across versions. */
const CATALOG_PARENT_SHARED_FROM_VERSION_SAVE = ["productName", "productCode"];

export function applyCatalogDraft(list, draft) {
  const cfg = draft.productConfiguration || defaultProductConfiguration();
  const id = draft.id || uid();
  const row = { ...draft, id, productConfiguration: cfg };
  const place = findCatalogPlacement(list, id);

  if (!place) {
    const { catalogDisplayVersions: _cd, ...clean } = row;
    return [...list, clean];
  }

  if (place.kind === "parent") {
    return list.map((p, i) => {
      if (i !== place.index) {
        return p;
      }
      const { catalogDisplayVersions: _x, ...rest } = row;
      return { ...rest, catalogDisplayVersions: p.catalogDisplayVersions };
    });
  }

  return list.map((p, i) => {
    if (i !== place.parentIndex) {
      return p;
    }
    const vs = [...(p.catalogDisplayVersions || [])];
    const slice = sliceVersionPayloadFromDraft(p, row);
    vs[place.versionIndex] = { ...vs[place.versionIndex], ...slice };
    const nextParent = { ...p };
    for (const k of CATALOG_PARENT_SHARED_FROM_VERSION_SAVE) {
      if (row[k] !== undefined) {
        nextParent[k] = row[k];
      }
    }
    return { ...nextParent, catalogDisplayVersions: vs };
  });
}

export function findProductById(products, id) {
  for (const p of products) {
    if (p.id === id) {
      const { catalogDisplayVersions, ...rest } = p;
      return { ...rest };
    }
    const rows = p.catalogDisplayVersions;
    if (Array.isArray(rows)) {
      const slice = rows.find((r) => r.id === id);
      if (slice) {
        return mergeCatalogVersion(p, slice);
      }
    }
  }
  return null;
}
