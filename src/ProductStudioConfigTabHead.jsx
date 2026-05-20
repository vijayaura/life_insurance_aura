import { useRef } from "react";
import { downloadConfigTabTemplate } from "./productStudioConfigImportExport.js";

/**
 * Download template + upload file for a configuration tab (reusable in page header or tab content).
 */
export function ProductStudioConfigFileActions({ tabId, productCode, onUpload }) {
  const fileRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onUpload(file, String(reader.result ?? ""));
      } catch (err) {
        window.alert(err?.message || "Could not read file.");
      }
      e.target.value = "";
    };
    reader.onerror = () => {
      window.alert("Could not read file.");
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="psc-config-tab-file-actions">
      <button type="button" className="secondary-button" onClick={() => downloadConfigTabTemplate(tabId, productCode)}>
        Download template
      </button>
      <button type="button" className="secondary-button" onClick={() => fileRef.current?.click()}>
        Upload file
      </button>
      <input ref={fileRef} type="file" className="psc-config-file-input" accept=".csv,.json,text/csv,application/json" onChange={onFileChange} hidden />
    </div>
  );
}

/**
 * Shared tab header: title, optional trailing actions, download template, upload file.
 */
export function ProductStudioConfigTabHead({ title, tabId, productCode, onUpload, trailing = null, showTitle = true }) {
  return (
    <div className="psc-config-main-head">
      {showTitle ? <h2 className="psc-field-section-title psc-config-main-head-title">{title}</h2> : null}
      <div className="psc-config-main-head-actions">
        <ProductStudioConfigFileActions tabId={tabId} productCode={productCode} onUpload={onUpload} />
        {trailing}
      </div>
    </div>
  );
}
