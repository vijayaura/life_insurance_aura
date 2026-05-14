/** Chevron control to the left of the page title (portal navigation). */
export function PageTitleWithBack({
  onBack,
  backAriaLabel = "Go back",
  eyebrow,
  title,
  subtitle,
  titleAs: TitleTag = "h1",
}) {
  return (
    <div className="page-title-with-back">
      <button type="button" className="page-back-btn" onClick={onBack} aria-label={backAriaLabel}>
        <span className="page-back-chevron" aria-hidden="true">
          ‹
        </span>
      </button>
      <div className="page-title-with-back-text">
        {eyebrow != null && eyebrow !== "" ? <p className="eyebrow">{eyebrow}</p> : null}
        <TitleTag>{title}</TitleTag>
        {subtitle}
      </div>
    </div>
  );
}
