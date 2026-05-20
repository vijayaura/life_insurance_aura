/** Suitability & Risk Assessment form — field keys, scoring, and defaults. */

export const SUITABILITY_EMPLOYMENT_OPTIONS = [
  "Employed",
  "Self Employed",
  "Business Owner",
  "Homemaker",
  "Student",
  "Retired",
  "Unemployed",
];

export const SUITABILITY_PRIORITY_OPTIONS = [
  { id: "family_protection", label: "Family Protection" },
  { id: "saving_future", label: "Saving for Future" },
  { id: "other", label: "Other (Please describe)" },
];

export const RISK_PROFILE_BANDS = [
  { min: 10, max: 19, level: "Low", characteristic: "Conservative — capital preservation is very important." },
  { min: 20, max: 29, level: "Low to Medium", characteristic: "Stable — willing to accept low to medium risk for modest growth." },
  { min: 30, max: 39, level: "Medium", characteristic: "Balanced — willing to accept a medium level of risk." },
  { min: 40, max: 49, level: "Medium to High", characteristic: "Growth — higher capital gain potential with higher risk." },
  { min: 50, max: 999, level: "High", characteristic: "Aggressive — significant capital gain with very high risk." },
];

/** @typedef {{ id: string, label: string, score: number }} RiskOption */

/** @type {{ id: string, section: string, label: string, multi?: boolean, options: RiskOption[] }[]} */
export const RISK_CLASSIFICATION_QUESTIONS = [
  {
    id: "experience",
    section: "I. Basic Information",
    label: "How many years of investment experience do you have? (Exclude savings account, fixed deposit, and foreign currency deposit)",
    options: [
      { id: "10+", label: "Over 10 years", score: 8 },
      { id: "7-10", label: "7 - 10 years", score: 6 },
      { id: "4-6", label: "4 - 6 years", score: 4 },
      { id: "1-3", label: "1 - 3 years", score: 2 },
      { id: "<1", label: "Less than 1 year", score: 1 },
    ],
  },
  {
    id: "products",
    section: "II. Investment Tenor",
    label: "Which of the following products have you previously invested in? (You may select more than 1 option)",
    multi: true,
    options: [
      { id: "crypto", label: "Crypto", score: 2 },
      { id: "mf", label: "Mutual Funds / Stocks / Bonds", score: 2 },
      { id: "deriv", label: "Derivatives / Structure Products / FX Trading (Margin/Leverage)", score: 2 },
      { id: "takaful", label: "Investment-Linked Takaful / Insurance Plans", score: 1 },
      { id: "deposits", label: "Savings Account / Fixed Deposits / Foreign Currency Deposit", score: 1 },
      { id: "none", label: "None", score: 0 },
    ],
  },
  {
    id: "withdrawal",
    section: "II. Investment Tenor",
    label: "When do you expect to start withdrawing your investment?",
    options: [
      { id: "20+", label: "Above 20 years", score: 7 },
      { id: "11-20", label: "11 - 20 years", score: 6 },
      { id: "6-10", label: "6 - 10 years", score: 4 },
      { id: "1-5", label: "1 - 5 years", score: 2 },
      { id: "<1", label: "Less than 1 year", score: 1 },
    ],
  },
  {
    id: "objective",
    section: "III. Investment Objective",
    label: "What is your current objective for investment?",
    options: [
      { id: "max", label: "Maximize capital growth as soon as possible", score: 5 },
      { id: "gradual", label: "Gradual long-term capital growth", score: 4 },
      { id: "balanced", label: "Stable, balanced income and capital growth", score: 3 },
      { id: "above", label: "Earn a return that is slightly above bank deposit", score: 2 },
      { id: "preserve", label: "Capital preservation with a return like the bank deposit rate", score: 1 },
    ],
  },
  {
    id: "attitude",
    section: "IV. Risk Tolerance",
    label: "Which statement best describes your attitude towards investment risk?",
    options: [
      { id: "max", label: "I never consider risks, as I aim to maximize returns", score: 5 },
      { id: "more", label: "I am willing to accept more risks, as I aim for more returns", score: 4 },
      { id: "balance", label: "I am trying to strike a balance between risks and returns", score: 3 },
      { id: "minor", label: "I will try to avoid risks, but minor ones are still acceptable", score: 2 },
      { id: "averse", label: "I am risk-averse and do not want to take any risks", score: 1 },
    ],
  },
  {
    id: "fluctuation",
    section: "IV. Risk Tolerance",
    label: "What level of annualized price fluctuation would you generally be comfortable with?",
    options: [
      { id: "20", label: "Between -20% or more and +20% or more", score: 8 },
      { id: "15", label: "Between -15% and +15%", score: 7 },
      { id: "10", label: "Between -10% and +10%", score: 5 },
      { id: "5", label: "Between -5% and +5%", score: 2 },
      { id: "0", label: "No price fluctuation", score: 1 },
    ],
  },
  {
    id: "income_portion",
    section: "V. Financial Circumstances",
    label: "What portion of your overall income is available for investment each month?",
    options: [
      { id: "50+", label: "50% or above", score: 5 },
      { id: "30-49", label: "30% - 49%", score: 3 },
      { id: "10-29", label: "10% - 29%", score: 2 },
      { id: "<10", label: "Less than 10%", score: 1 },
    ],
  },
  {
    id: "reserve",
    section: "V. Financial Circumstances",
    label: "How many months of household expenses could be covered by your reserve?",
    options: [
      { id: "12+", label: "More than 12 months", score: 5 },
      { id: "6-12", label: "6 - 12 months", score: 4 },
      { id: "3-6", label: "3 - 6 months", score: 3 },
      { id: "<3", label: "Less than 3 months", score: 2 },
      { id: "none", label: "None", score: 1 },
    ],
  },
  {
    id: "future_invest",
    section: "V. Financial Circumstances",
    label: "How do you expect your future monthly investable amount over the next five years?",
    options: [
      { id: "up-sharp", label: "Expect the monthly investable amount will increase sharply", score: 5 },
      { id: "up", label: "Expect the monthly investable amount will increase gradually", score: 4 },
      { id: "same", label: "Expect the monthly investable amount will remain unchanged", score: 2 },
      { id: "down", label: "Expect the monthly investable amount will decrease", score: 1 },
    ],
  },
];

function emptyMember() {
  return {
    employment_status: "",
    annual_income_occupation: "",
    other_income: "",
    total_annual_income: "",
    total_annual_expenses: "",
    disposable_income: "",
  };
}

function emptyProvisionRow() {
  return {
    insurance_co: "",
    policy_number: "",
    policy_type: "",
    current_status: "",
    annual_premium: "",
    start_date: "",
    end_date: "",
    covered_member: "",
    death_cover: "",
    ci_fib_cover: "",
  };
}

function emptyNeedRow() {
  return { required: "", existing: "", shortfall: "" };
}

function emptyNeedMemberCells() {
  return { self: emptyNeedRow(), spouse: emptyNeedRow() };
}

export function defaultSuitabilityAssessment() {
  return {
    self: emptyMember(),
    spouse: emptyMember(),
    priorities: { family_protection: false, saving_future: false, other: false, other_description: "" },
    provisions: [emptyProvisionRow(), emptyProvisionRow(), emptyProvisionRow()],
    needAnalysis: {
      growth_pct: "",
      family_protection: {
        capital_annual_income: emptyNeedMemberCells(),
        capital_clear_debt: emptyNeedMemberCells(),
        total_capital: emptyNeedMemberCells(),
        disposable_income: emptyNeedMemberCells(),
      },
      savings: {
        capital_maturity: emptyNeedMemberCells(),
        tenure: emptyNeedMemberCells(),
        disposable_income: emptyNeedMemberCells(),
      },
    },
    riskAnswers: Object.fromEntries(RISK_CLASSIFICATION_QUESTIONS.map((q) => [q.id, q.multi ? [] : ""])),
    consultant: { observations: "", name_signature: "", date: "" },
    disclaimer: {
      product_name: "",
      product_date: "",
      risk_rating: "",
    },
    declarationProducts: [{ product_name: "", payment_term_years: "", contribution_amount_frequency: "" }],
    signatures: {
      first_signature_date: "",
      second_signature_date: "",
    },
    completed: false,
  };
}

/**
 * @param {Record<string, string | string[]>} riskAnswers
 * @param {typeof RISK_CLASSIFICATION_QUESTIONS} questions
 */
export function ageRiskScoreFromDob(dob) {
  const age = calculateAgeFromDob(dob);
  if (age === "" || Number.isNaN(age)) {
    return 0;
  }
  if (age >= 18 && age <= 35) {
    return 5;
  }
  if (age >= 36 && age <= 50) {
    return 4;
  }
  if (age >= 51 && age <= 65) {
    return 2;
  }
  return 1;
}

export function computeRiskTotalScore(
  riskAnswers,
  questions = RISK_CLASSIFICATION_QUESTIONS,
  firstLifeDob = ""
) {
  let total = ageRiskScoreFromDob(firstLifeDob);
  for (const q of questions) {
    const answer = riskAnswers[q.id];
    if (q.multi && Array.isArray(answer)) {
      for (const optId of answer) {
        const opt = q.options.find((o) => o.id === optId);
        if (opt) {
          total += opt.score;
        }
      }
    } else if (typeof answer === "string" && answer) {
      const opt = q.options.find((o) => o.id === answer);
      if (opt) {
        total += opt.score;
      }
    }
  }
  return total;
}

export function riskProfileFromScore(total) {
  const band = RISK_PROFILE_BANDS.find((b) => total >= b.min && total <= b.max);
  return band ?? RISK_PROFILE_BANDS[RISK_PROFILE_BANDS.length - 1];
}

export function prefillSuitabilityFromLives(assessment, _firstLife, _secondLife, secondLifeSelection) {
  const next = { ...assessment, self: { ...assessment.self }, spouse: { ...assessment.spouse } };
  if (!next.self.employment_status) {
    next.self.employment_status = "Employed";
  }
  if (secondLifeSelection === "Yes" && !next.spouse.employment_status) {
    next.spouse.employment_status = "Employed";
  }
  return next;
}

function calculateAgeFromDob(dob) {
  if (!dob) {
    return "";
  }
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
