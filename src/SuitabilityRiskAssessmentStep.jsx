import { useMemo } from "react";
import { DropdownSelect } from "./DropdownSelect";
import {
  RISK_CLASSIFICATION_QUESTIONS,
  RISK_PROFILE_BANDS,
  SUITABILITY_EMPLOYMENT_OPTIONS,
  SUITABILITY_PRIORITY_OPTIONS,
  computeRiskTotalScore,
  riskProfileFromScore,
} from "./suitabilityRiskAssessment";

function TextField({ label, value, onChange, type = "text", readOnly = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <DropdownSelect
        value={value ?? ""}
        onChange={onChange}
        options={options}
        placeholder="Select"
        emptyOptionLabel="Select"
      />
    </label>
  );
}

function DualMemberRow({ label, selfValue, spouseValue, onSelfChange, onSpouseChange, showSpouse, type = "text" }) {
  return (
    <div className="suitability-dual-row">
      <span className="suitability-dual-label">{label}</span>
      <label className="field">
        <span>Self</span>
        <input type={type} value={selfValue} onChange={(e) => onSelfChange(e.target.value)} />
      </label>
      {showSpouse && (
        <label className="field">
          <span>Spouse</span>
          <input type={type} value={spouseValue} onChange={(e) => onSpouseChange(e.target.value)} />
        </label>
      )}
    </div>
  );
}

function DualMemberSelect({ label, selfValue, spouseValue, onSelfChange, onSpouseChange, showSpouse, options }) {
  return (
    <div className="suitability-dual-row">
      <span className="suitability-dual-label">{label}</span>
      <label className="field">
        <span>Self</span>
        <DropdownSelect value={selfValue ?? ""} onChange={onSelfChange} options={options} placeholder="Select" />
      </label>
      {showSpouse && (
        <label className="field">
          <span>Spouse</span>
          <DropdownSelect value={spouseValue ?? ""} onChange={onSpouseChange} options={options} placeholder="Select" />
        </label>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <article className="proposal-section-card">
      <h5>{title}</h5>
      {children}
    </article>
  );
}

function ScoredQuestion({ question, value, onChange }) {
  if (question.multi) {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="suitability-scored-question">
        <p className="suitability-question-label">{question.label}</p>
        <div className="suitability-scored-options">
          {question.options.map((opt) => (
            <label key={opt.id} className="suitability-scored-option">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected.filter((id) => id !== "none"), opt.id]);
                  } else {
                    onChange(selected.filter((id) => id !== opt.id));
                  }
                }}
              />
              <span>{opt.label}</span>
              <em>Score: {opt.score}</em>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="suitability-scored-question">
      <p className="suitability-question-label">{question.label}</p>
      <div className="suitability-scored-options">
        {question.options.map((opt) => (
          <label key={opt.id} className="suitability-scored-option">
            <input
              type="radio"
              name={`risk-${question.id}`}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
            />
            <span>{opt.label}</span>
            <em>Score: {opt.score}</em>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SuitabilityRiskAssessmentStep({
  assessment,
  onChange,
  firstLife,
  secondLife,
  secondLifeSelection,
}) {
  const showSpouse = secondLifeSelection === "Yes";
  const totalScore = useMemo(
    () => computeRiskTotalScore(assessment.riskAnswers, RISK_CLASSIFICATION_QUESTIONS, firstLife.dob),
    [assessment.riskAnswers, firstLife.dob]
  );
  const riskProfile = useMemo(() => riskProfileFromScore(totalScore), [totalScore]);

  function update(patch) {
    onChange({ ...assessment, ...patch });
  }

  function updateMember(member, patch) {
    onChange({ ...assessment, [member]: { ...assessment[member], ...patch } });
  }

  function updateProvision(index, field, value) {
    const provisions = assessment.provisions.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChange({ ...assessment, provisions });
  }

  function updateRiskAnswer(id, value) {
    onChange({
      ...assessment,
      riskAnswers: { ...assessment.riskAnswers, [id]: value },
    });
  }

  const riskBySection = useMemo(() => {
    const map = new Map();
    for (const q of RISK_CLASSIFICATION_QUESTIONS) {
      if (!map.has(q.section)) {
        map.set(q.section, []);
      }
      map.get(q.section).push(q);
    }
    return map;
  }, []);

  const memberSummary = [
    {
      key: "self",
      title: "Self",
      name: assessment.self.full_name || firstLife.full_name || "Self",
      status: assessment.completed ? "Completed" : "In progress",
    },
    ...(showSpouse
      ? [
          {
            key: "spouse",
            title: "Spouse",
            name: assessment.spouse.full_name || secondLife.full_name || "Spouse",
            status: assessment.completed ? "Completed" : "In progress",
          },
        ]
      : []),
  ];

  return (
    <section className="form-card proposal-step suitability-step">
      <div className="section-heading">
        <h3>Suitability &amp; Risk Assessment</h3>
      </div>

      <div className="proposal-layout">
        <aside className="proposal-list" aria-label="Assessment members">
          {memberSummary.map((member) => (
            <div className="proposal-list-item" key={member.key}>
              <strong>{member.title}</strong>
              <span>{member.name}</span>
              <em className={assessment.completed ? "completed" : ""}>{member.status}</em>
            </div>
          ))}
          <div className="proposal-list-item muted">
            <strong>Total risk score</strong>
            <span>{totalScore || "—"}</span>
            <em>{riskProfile.level}</em>
          </div>
        </aside>

        <div className="proposal-form">
          <div className="proposal-form-heading">
            <div>
              <h4>Suitability &amp; Risk Assessment Form</h4>
              <p>Salama — client profiling, need analysis, and risk classification.</p>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() => update({ completed: !assessment.completed })}
            >
              {assessment.completed ? "Mark in progress" : "Mark complete"}
            </button>
          </div>

          <div className="proposal-section-list">
            <SectionCard title="Section 1: Employment Status">
              <p className="suitability-intro">
                Names and ages for Self{showSpouse ? " and Spouse" : ""} are captured on the Life Assured step.
              </p>
              <DualMemberSelect
                label="Employment Status"
                selfValue={assessment.self.employment_status}
                spouseValue={assessment.spouse.employment_status}
                onSelfChange={(v) => updateMember("self", { employment_status: v })}
                onSpouseChange={(v) => updateMember("spouse", { employment_status: v })}
                showSpouse={showSpouse}
                options={SUITABILITY_EMPLOYMENT_OPTIONS}
              />
            </SectionCard>

            <SectionCard title="Section 2: Income and Affordability">
              <div className="proposal-subsection-list">
                {[
                  { key: "annual_income_occupation", label: "A. Annual Income from Occupation" },
                  { key: "other_income", label: "B. Other Income" },
                  { key: "total_annual_income", label: "C. Total Annual Income (C=A+B)" },
                  { key: "total_annual_expenses", label: "D. Total Annual Expenses including any Liabilities" },
                  { key: "disposable_income", label: "E. Disposable Income (E=C-D)" },
                ].map((row) => (
                  <DualMemberRow
                    key={row.key}
                    label={row.label}
                    selfValue={assessment.self[row.key]}
                    spouseValue={assessment.spouse[row.key]}
                    onSelfChange={(v) => updateMember("self", { [row.key]: v })}
                    onSpouseChange={(v) => updateMember("spouse", { [row.key]: v })}
                    showSpouse={showSpouse}
                    type="number"
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Section 3: Current Provisions">
              <div className="suitability-table-wrap">
                <table className="suitability-table">
                  <thead>
                    <tr>
                      <th>Insurance Co</th>
                      <th>Policy Number</th>
                      <th>Policy Type</th>
                      <th>Current Status</th>
                      <th>Annual Premium (AED)</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Covered Member</th>
                      <th>Death Cover (AED)</th>
                      <th>CI &amp;/or FIB cover (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.provisions.map((row, index) => (
                      <tr key={index}>
                        {[
                          "insurance_co",
                          "policy_number",
                          "policy_type",
                          "current_status",
                          "annual_premium",
                          "start_date",
                          "end_date",
                          "covered_member",
                          "death_cover",
                          "ci_fib_cover",
                        ].map((field) => (
                          <td key={field}>
                            <input
                              value={row[field]}
                              onChange={(e) => updateProvision(index, field, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Section 4: Your Priorities">
              <p className="suitability-intro">
                The questions below help appraise risk aptitude, financial means, and investment objectives before
                selecting appropriate benefits.
              </p>
              <div className="suitability-priorities">
                {SUITABILITY_PRIORITY_OPTIONS.map((opt) => (
                  <label key={opt.id} className="suitability-priority-option">
                    <input
                      type="checkbox"
                      checked={Boolean(assessment.priorities[opt.id])}
                      onChange={(e) =>
                        update({
                          priorities: { ...assessment.priorities, [opt.id]: e.target.checked },
                        })
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
                {assessment.priorities.other && (
                  <TextField
                    label="Other — please describe"
                    value={assessment.priorities.other_description}
                    onChange={(v) =>
                      update({
                        priorities: { ...assessment.priorities, other_description: v },
                      })
                    }
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard title="Section 5: Need Analysis and Suitability (AED)">
              <TextField
                label="Growth (%) assumption to generate annual income"
                value={assessment.needAnalysis.growth_pct}
                onChange={(v) =>
                  update({
                    needAnalysis: { ...assessment.needAnalysis, growth_pct: v },
                  })
                }
              />
              <NeedAnalysisTable
                title="Family Protection"
                rows={[
                  { key: "capital_annual_income", label: "Capital required to generate annual income" },
                  { key: "capital_clear_debt", label: "Income required to clear outstanding" },
                  { key: "total_capital", label: "Total Capital required as Family Takaful Benefit" },
                  { key: "disposable_income", label: "Disposable Income for Family Protection (max 30%)" },
                ]}
                section="family_protection"
                data={assessment.needAnalysis}
                showSpouse={showSpouse}
                onChange={(na) => update({ needAnalysis: na })}
              />
              <p className="suitability-guide-row">
                <strong>Family Takaful Benefit Guide:</strong> Age 18–35: up to 25× income; 36–45: 20×; 46–50: 15×;
                51–65: 10×; 65+: 3× annual income.
              </p>
              <NeedAnalysisTable
                title="Savings"
                rows={[
                  { key: "capital_maturity", label: "Capital Required at Maturity" },
                  { key: "tenure", label: "Tenure for Savings" },
                  { key: "disposable_income", label: "Disposable Income for Savings (max 30%)" },
                ]}
                section="savings"
                data={assessment.needAnalysis}
                showSpouse={showSpouse}
                onChange={(na) => update({ needAnalysis: na })}
              />
            </SectionCard>

            <SectionCard title="Section 6: Risk Classification">
              <p className="suitability-intro">
                Age scoring uses the first life assured date of birth from Life Assured.
              </p>
              {[...riskBySection.entries()].map(([sectionTitle, questions]) => (
                <div className="proposal-subsection" key={sectionTitle}>
                  <h6>{sectionTitle}</h6>
                  {questions.map((q) => (
                    <ScoredQuestion
                      key={q.id}
                      question={q}
                      value={assessment.riskAnswers[q.id]}
                      onChange={(v) => updateRiskAnswer(q.id, v)}
                    />
                  ))}
                </div>
              ))}
              <div className="suitability-total-score">
                <strong>Total Score:</strong> <span>{totalScore}</span>
              </div>
            </SectionCard>

            <SectionCard title="Risk Profile Analysis">
              <div className="suitability-table-wrap">
                <table className="suitability-table suitability-profile-table">
                  <thead>
                    <tr>
                      <th>Total Score</th>
                      {RISK_PROFILE_BANDS.map((b) => (
                        <th key={b.level}>
                          {b.min}–{b.max === 999 ? "+" : b.max}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th>Risk Tolerance Level</th>
                      {RISK_PROFILE_BANDS.map((b) => (
                        <th key={b.level}>{b.level}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Investor Characteristic</td>
                      {RISK_PROFILE_BANDS.map((b) => (
                        <td key={b.level}>{b.characteristic}</td>
                      ))}
                    </tr>
                    <tr className="suitability-profile-result">
                      <td colSpan={RISK_PROFILE_BANDS.length + 1}>
                        <strong>Your assessed profile:</strong> {riskProfile.level} — {riskProfile.characteristic}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="suitability-note">
                If you opt out or deviate from the Suitability &amp; Risk Assessment process, you must indicate
                reasons in writing. We may reject your application if you opt out of the Risk Profile
                Questionnaire.
              </p>
            </SectionCard>

            <SectionCard title="Witnessed by Financial Consultant / Takaful Specialist">
              <label className="field">
                <span>Observations made during profiling process</span>
                <textarea
                  value={assessment.consultant.observations}
                  onChange={(e) =>
                    update({ consultant: { ...assessment.consultant, observations: e.target.value } })
                  }
                  rows={4}
                />
              </label>
              <div className="form-grid proposal-section-grid">
                <TextField
                  label="Name and signature of Financial Consultant / Takaful Specialist"
                  value={assessment.consultant.name_signature}
                  onChange={(v) => update({ consultant: { ...assessment.consultant, name_signature: v } })}
                />
                <TextField
                  label="Date (DD/MM/YYYY)"
                  value={assessment.consultant.date}
                  onChange={(v) => update({ consultant: { ...assessment.consultant, date: v } })}
                />
              </div>
            </SectionCard>

            <SectionCard title="Suitability &amp; Risk Assessment Form Disclaimer">
              <p className="suitability-intro">
                Dear {firstLife.full_name || "Plan Holder"}
              </p>
              <div className="form-grid">
                <TextField
                  label="Product name"
                  value={assessment.disclaimer.product_name}
                  onChange={(v) => update({ disclaimer: { ...assessment.disclaimer, product_name: v } })}
                />
                <TextField
                  label="Product date"
                  value={assessment.disclaimer.product_date}
                  onChange={(v) => update({ disclaimer: { ...assessment.disclaimer, product_date: v } })}
                />
                <TextField
                  label="Risk rating (e.g. Low, Medium, High)"
                  value={assessment.disclaimer.risk_rating}
                  onChange={(v) => update({ disclaimer: { ...assessment.disclaimer, risk_rating: v } })}
                />
              </div>
              <div className="suitability-disclaimer-text">
                <p>
                  I confirm my intent to choose the specified Takaful fund options and acknowledge that entering
                  into this transaction may result in a suitability mismatch between my risk profile and the
                  product risk rating.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Section 7: Declaration and Acknowledgement">
              <div className="suitability-disclaimer-text">
                <ul>
                  <li>All answers are true and accurate based on current financial circumstances.</li>
                  <li>I agree with the assessed approach towards risk and investments.</li>
                  <li>Risks have been explained; I understand potential capital loss.</li>
                  <li>Past performance does not guarantee future results.</li>
                  <li>This form does not constitute investment advice or a recommendation.</li>
                  <li>Product and fund selection is at my sole discretion.</li>
                </ul>
              </div>
              <div className="suitability-table-wrap">
                <table className="suitability-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Payment Term (Years)</th>
                      <th>Contribution Amount (AED/USD) &amp; Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.declarationProducts.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            value={row.product_name}
                            onChange={(e) => {
                              const declarationProducts = assessment.declarationProducts.map((r, i) =>
                                i === index ? { ...r, product_name: e.target.value } : r
                              );
                              update({ declarationProducts });
                            }}
                          />
                        </td>
                        <td>
                          <input
                            value={row.payment_term_years}
                            onChange={(e) => {
                              const declarationProducts = assessment.declarationProducts.map((r, i) =>
                                i === index ? { ...r, payment_term_years: e.target.value } : r
                              );
                              update({ declarationProducts });
                            }}
                          />
                        </td>
                        <td>
                          <input
                            value={row.contribution_amount_frequency}
                            onChange={(e) => {
                              const declarationProducts = assessment.declarationProducts.map((r, i) =>
                                i === index
                                  ? { ...r, contribution_amount_frequency: e.target.value }
                                  : r
                              );
                              update({ declarationProducts });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="suitability-signatures">
                <div className="suitability-signature-block">
                  <h6>Signature of First Covered Member / Plan Holder</h6>
                  <div className="suitability-signature-pad" aria-hidden />
                  <TextField
                    label="Date (DD/MM/YYYY)"
                    value={assessment.signatures.first_signature_date}
                    onChange={(v) =>
                      update({ signatures: { ...assessment.signatures, first_signature_date: v } })
                    }
                  />
                </div>
                {showSpouse && (
                  <div className="suitability-signature-block">
                    <h6>Signature of Second Covered Member (if any)</h6>
                    <div className="suitability-signature-pad" aria-hidden />
                    <TextField
                      label="Date (DD/MM/YYYY)"
                      value={assessment.signatures.second_signature_date}
                      onChange={(v) =>
                        update({ signatures: { ...assessment.signatures, second_signature_date: v } })
                      }
                    />
                  </div>
                )}
              </div>
              <p className="suitability-note">
                Complete a separate Suitability &amp; Risk Assessment Form for each investment-linked takaful product
                selected. Inform your broker if information changes materially before policy issue.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function NeedAnalysisTable({ title, rows, section, data, showSpouse, onChange }) {
  const members = showSpouse ? ["self", "spouse"] : ["self"];

  function setCell(rowKey, member, field, value) {
    const row = data[section][rowKey];
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [rowKey]: {
          ...row,
          [member]: { ...row[member], [field]: value },
        },
      },
    });
  }

  return (
    <div className="proposal-subsection vertical-table">
      <h6>{title}</h6>
      <div className="suitability-table-wrap">
        <table className="suitability-table suitability-need-table">
          <thead>
            <tr>
              <th />
              {members.flatMap((member) =>
                ["Required", "Existing", "Shortfall"].map((col) => (
                  <th key={`${member}-${col}`}>
                    {member === "self" ? "Self" : "Spouse"} — {col}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowDef) => (
              <tr key={rowDef.key}>
                <td>{rowDef.label}</td>
                {members.flatMap((member) =>
                  ["required", "existing", "shortfall"].map((field) => (
                    <td key={`${rowDef.key}-${member}-${field}`}>
                      <input
                        value={data[section][rowDef.key][member][field]}
                        onChange={(e) => setCell(rowDef.key, member, field, e.target.value)}
                      />
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
