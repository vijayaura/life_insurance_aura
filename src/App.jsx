import { useEffect, useMemo, useRef, useState } from "react";

const countryMaster = [
  "United Arab Emirates",
  "India",
  "Pakistan",
  "Philippines",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Barbados",
];

const dropdownMetadata = {
  gender: {
    label: "Gender",
    options: ["Male", "Female"],
  },
  smoker_status: {
    label: "Smoker Status",
    options: ["Yes", "No"],
  },
  country: {
    label: "Country",
    source: "countryMaster",
    async: true,
    adminConfigurable: true,
    options: countryMaster,
  },
  currency: {
    label: "Currency",
    options: ["AED", "USD"],
  },
  premium_frequency: {
    label: "Premium Frequency",
    options: ["Monthly", "Quarterly", "Half-Yearly", "Annual"],
    multiplier: {
      Monthly: 12,
      Quarterly: 4,
      "Half-Yearly": 2,
      Annual: 1,
    },
  },
  growth_rate_assumption: {
    label: "Growth Rate Assumption",
    options: ["0%", "3%", "10%"],
  },
  projection_scenario: {
    label: "Projection Scenario",
    options: ["Conservative (0%)", "Moderate (3%)", "Aggressive (10%)"],
  },
  benefit_type: {
    label: "Benefit Type",
    options: [
      "Family Takaful Benefit (with TI)",
      "Accidental Death Benefit (ADB)",
      "Total Permanent Disability (TPD)",
      "Waiver of Contribution (WOC)",
      "Critical Illness (CI)",
      "Family Income Benefit (FIB)",
      "Hospital Cash Benefit (HCB)",
      "Accidental Total or Partial Permanent Disability (PPD)",
    ],
  },
};

const benefitConfigurations = {
  "Family Takaful Benefit (with TI)": {
    riderName: "Family Takaful Benefit",
    valueLabel: "Family Takaful Benefit Sum Assured",
    defaultValue: "1000000",
  },
  "Accidental Death Benefit (ADB)": {
    riderName: "Accidental Death Benefit",
    valueLabel: "ADB Sum Assured",
    defaultValue: "500000",
  },
  "Total Permanent Disability (TPD)": {
    riderName: "Total Permanent Disability",
    valueLabel: "TPD Sum Assured",
    defaultValue: "500000",
  },
  "Waiver of Contribution (WOC)": {
    riderName: "Waiver of Contribution",
    hasApplicability: true,
    defaultApplicability: "Applicable",
    hasProtectedContribution: true,
    protectedContributionTerm: "20",
    protectedContributionPercent: "0%",
  },
  "Critical Illness (CI)": {
    riderName: "Critical Illness",
    valueLabel: "CI Sum Assured",
    defaultValue: "500000",
  },
  "Family Income Benefit (FIB)": {
    riderName: "Family Income Benefit",
    valueLabel: "Family Income Benefit",
    defaultValue: "5000",
    hasFibTerm: true,
    fibTerm: "20",
  },
  "Hospital Cash Benefit (HCB)": {
    riderName: "Hospital Cash Benefit",
    valueLabel: "Hospital Cash Benefit",
    defaultValue: "500",
  },
  "Accidental Total or Partial Permanent Disability (PPD)": {
    riderName: "Accidental Total or Partial Permanent Disability",
    valueLabel: "PPD Sum Assured",
    defaultValue: "500000",
  },
};

const products = {
  "SecureLife Protector": {
    minAge: 18,
    maxAge: 65,
    minPremium: 500,
    maxPremium: 100000,
    currencies: ["AED", "USD"],
    smokerEligible: true,
    jointLifeEligible: true,
    restrictedResidencies: ["Afghanistan"],
  },
  "FutureWealth Life": {
    minAge: 21,
    maxAge: 60,
    minPremium: 1000,
    maxPremium: 75000,
    currencies: ["AED"],
    smokerEligible: false,
    jointLifeEligible: true,
    restrictedResidencies: ["Afghanistan", "Algeria"],
  },
  "Takaful Family Shield": {
    minAge: 18,
    maxAge: 55,
    minPremium: 750,
    maxPremium: 50000,
    currencies: ["AED", "USD"],
    smokerEligible: true,
    jointLifeEligible: false,
    restrictedResidencies: ["Afghanistan", "Pakistan"],
  },
};

const initialQuotes = [
  {
    id: "Q-1047",
    customer: "Aarav Mehta",
    product: "SecureLife Protector",
    premium: "AED 24,000",
    status: "Underwriter Review",
    updated: "Today",
  },
  {
    id: "Q-1046",
    customer: "Fatima Khan",
    product: "Takaful Family Shield",
    premium: "USD 9,600",
    status: "Illustration Ready",
    updated: "Yesterday",
  },
  {
    id: "P-8832",
    customer: "Lina Santos",
    product: "FutureWealth Life",
    premium: "AED 18,000",
    status: "Policy Issued",
    updated: "2 days ago",
  },
];

const blankLife = {
  full_name: "",
  dob: "",
  gender: "",
  smoker_status: "",
  residency_country: "",
  nationality: "",
  birth_country: "",
};

const blankPolicy = {
  product_name: "SecureLife Protector",
  currency: "AED",
  premium_frequency: "Monthly",
  contribution_amount: "",
  contribution_term: "10",
  plan_term: "20",
  growth_rate_assumption: "3%",
  projection_scenario: "Moderate (3%)",
};

const blankRider = {
  benefit_type: "Family Takaful Benefit (with TI)",
  rider_name: "",
  benefit_value: "",
  applicability: "Applicable",
  fib_term: "",
  protected_contribution_term: "20",
  protected_contribution_percent: "0%",
  rider_sum_assured: "",
  rider_premium: "",
  effective_date: "",
};

const uaeMockFirstLife = {
  full_name: "Omar Al Mansoori",
  dob: "1986-04-18",
  gender: "Male",
  smoker_status: "No",
  residency_country: "United Arab Emirates",
  nationality: "United Arab Emirates",
  birth_country: "United Arab Emirates",
};

const uaeMockSecondLife = {
  full_name: "Aisha Al Mansoori",
  dob: "1989-09-12",
  gender: "Female",
  smoker_status: "No",
  residency_country: "United Arab Emirates",
  nationality: "United Arab Emirates",
  birth_country: "United Arab Emirates",
};

const uaeMockPolicy = {
  product_name: "SecureLife Protector",
  currency: "AED",
  premium_frequency: "Monthly",
  contribution_amount: "2500",
  contribution_term: "10",
  plan_term: "20",
  growth_rate_assumption: "3%",
  projection_scenario: "Moderate (3%)",
};

const uaeMockRider = {
  benefit_type: "Family Takaful Benefit (with TI)",
  rider_name: "Family Takaful Protection",
  benefit_value: "1000000",
  applicability: "Applicable",
  fib_term: "",
  protected_contribution_term: "20",
  protected_contribution_percent: "0%",
  rider_sum_assured: "500000",
  rider_premium: "185",
  effective_date: "2026-06-01",
};

const mockSupportingDocuments = [
  { id: "doc-emirates-id", name: "Emirates ID Copy", category: "Identity", required: true, status: "Uploaded", fileName: "omar-emirates-id.pdf" },
  { id: "doc-passport", name: "Passport Copy", category: "Identity", required: true, status: "Uploaded", fileName: "passport-copy.pdf" },
  { id: "doc-visa", name: "UAE Residence Visa", category: "Residency", required: true, status: "Pending", fileName: "" },
  { id: "doc-income", name: "Salary Certificate / Income Proof", category: "Financial", required: true, status: "Uploaded", fileName: "salary-certificate.pdf" },
  { id: "doc-bank", name: "Bank Statement - Last 3 Months", category: "Financial", required: false, status: "Uploaded", fileName: "enbd-statement.pdf" },
  { id: "doc-medical", name: "Medical Examination Report", category: "Medical", required: false, status: "Not Required", fileName: "" },
  { id: "doc-kyc", name: "KYC / Source of Funds Declaration", category: "Compliance", required: true, status: "Uploaded", fileName: "kyc-sof-declaration.pdf" },
  { id: "doc-illustration", name: "Signed Illustration", category: "Proposal", required: true, status: "Pending", fileName: "" },
];

function createDefaultBenefitRider(benefitType) {
  const config = benefitConfigurations[benefitType];

  return {
    ...blankRider,
    benefit_type: benefitType,
    rider_name: config.riderName,
    benefit_value: config.defaultValue || "",
    applicability: config.defaultApplicability || "Applicable",
    fib_term: config.fibTerm || "",
    protected_contribution_term: config.protectedContributionTerm || "20",
    protected_contribution_percent: config.protectedContributionPercent || "0%",
    rider_premium: benefitType === "Family Takaful Benefit (with TI)" ? "185" : "",
    effective_date: "2026-06-01",
  };
}

function calculateAge(dob) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Number.isNaN(age) ? "" : age;
}

function formatCurrency(value, currency) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-AE", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getAnnualizedContribution(policy) {
  const frequencyMultiplier = dropdownMetadata.premium_frequency.multiplier[policy.premium_frequency] || 1;
  return Number(policy.contribution_amount || 0) * frequencyMultiplier;
}

function buildIllustrationRows(policy, riders, growthRate) {
  const annualContribution = getAnnualizedContribution(policy);
  const planTerm = Number(policy.plan_term || 20);
  const takafulBenefit = Number(riders[0]?.benefit_value || riders[0]?.rider_sum_assured || 1000000);

  return Array.from({ length: planTerm }, (_, index) => {
    const year = index + 1;
    const contributionPaid = annualContribution * year;
    const fundValue = contributionPaid * (0.62 + growthRate * 1.8) * Math.pow(1 + growthRate, year / 2);
    const encashmentCharge = year <= 5 ? annualContribution * 0.11 : annualContribution * 0.01;
    const encashmentValue = Math.max(fundValue - encashmentCharge, 0);
    const takafulDonation = 1500 + year * 128;
    const netCharges = Math.max(contributionPaid - fundValue, 100);

    return {
      year,
      contributionPaid,
      fundValue,
      encashmentCharge,
      encashmentValue,
      takafulDonation,
      takafulBenefit,
      amountInvestedPercent: Math.round((fundValue / contributionPaid) * 100),
      netCharges,
      netChargesPercent: Math.round((netCharges / contributionPaid) * 100),
    };
  });
}

function createProposalFromLife(life, role, policy) {
  return {
    id: role === "First Life" ? "proposal-first-life" : "proposal-second-life",
    role,
    completed: false,
    full_name: life.full_name,
    dob: life.dob,
    gender: life.gender,
    residency_country: life.residency_country,
    nationality: life.nationality,
    birth_country: life.birth_country,
    product_name: policy.product_name,
    currency: policy.currency,
    premium_frequency: policy.premium_frequency,
    contribution_amount: policy.contribution_amount,
    id_passport_no: role === "First Life" ? "E784198612345678" : "E784198976543210",
    mobile_no: role === "First Life" ? "+971 50 123 4567" : "+971 55 987 6543",
    email: role === "First Life" ? "omar.almansoori@example.ae" : "aisha.almansoori@example.ae",
    address: "Downtown Dubai, Dubai, United Arab Emirates",
    relationship_to_plan_holder: role === "First Life" ? "Same as First Covered Member" : "Spouse",
    marital_status: "Married",
    nature_of_business: role === "First Life" ? "Trading and advisory services" : "Financial services",
    employer_name_address: role === "First Life" ? "Al Mansoori Holdings, Dubai" : "Salama Finance, Dubai",
    exact_daily_duties: role === "First Life" ? "Business management and client meetings" : "Financial planning and reporting",
    apartment_no: "1204",
    building_no: "BLD-18",
    street_name: "Sheikh Mohammed bin Rashid Boulevard",
    city: "Dubai",
    country: "United Arab Emirates",
    po_box: "120214",
    home_office_tel: "+971 4 407 9999",
    fax_no: "+971 4 357 7007",
    home_country_address: "Dubai, United Arab Emirates",
    occupation: role === "First Life" ? "Business Owner" : "Finance Manager",
    annual_income: role === "First Life" ? "720000" : "540000",
    income_last_year: role === "First Life" ? "720000" : "540000",
    income_second_last_year: role === "First Life" ? "680000" : "510000",
    income_third_last_year: role === "First Life" ? "640000" : "480000",
    source_of_funds: "Salary and business income",
    payment_method: "Direct Debit",
    investment_strategy_1: "Salama Balanced Fund",
    investment_percentage_1: "100",
    bank_iban: "AE070331234567890123456",
    bank_name: "Emirates NBD",
    cash_assets: "250000",
    shares_bonds: "400000",
    real_estate: "2500000",
    liabilities: "350000",
    other_insurance_company: "None",
    other_insurance_sum_covered: "0",
    beneficiary_name: role === "First Life" ? "Aisha Al Mansoori" : "Omar Al Mansoori",
    beneficiary_relationship: role === "First Life" ? "Spouse" : "Spouse",
    beneficiary_share: "100",
    height_cm: role === "First Life" ? "178" : "165",
    weight_kg: role === "First Life" ? "82" : "61",
    medical_impairment: "No",
    respiratory_disorder: "No",
    genitourinary_disorder: "No",
    digestive_disorder: "No",
    brain_or_mental_disorder: "No",
    diabetes_or_blood_disorder: "No",
    unexplained_symptoms: "No",
    circulatory_disorder: "No",
    other_illness: "No",
    hospital_admission: "No",
    blood_test_advice: "No",
    routine_exam: "No",
    disability_benefit: "No",
    insurance_declined: "No",
    hazardous_pursuits: "No",
    pregnancy: role === "Second Life" ? "No" : "N/A",
    medical_details: "",
    us_person: "No",
    tin_ssn: "",
    tax_resident_other_country: "No",
    tax_residence_country_1: "",
    tax_tin_1: "",
    personal_data_consent: "Yes",
    sms_consent: "Yes",
    email_declaration: "Yes",
    signature_city: "Dubai",
    signature_date: "2026-06-01",
  };
}

function AsyncSearchableSelect({ label, value, onChange, metadata, placeholder = "Search and select" }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const comboboxRef = useRef(null);

  const options = useMemo(() => {
    const filteredOptions = metadata.options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase())
    );

    return metadata.async ? filteredOptions.slice(0, 8) : filteredOptions;
  }, [metadata, query]);

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setIsOpen(true);

    if (metadata.async) {
      setLoading(true);
      window.setTimeout(() => setLoading(false), 250);
    }
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!comboboxRef.current?.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <label className="field">
      <span>{label}</span>
      <div className="combobox" ref={comboboxRef}>
        <input
          value={isOpen ? query : value}
          placeholder={placeholder}
          onChange={handleQueryChange}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
        />
        <button
          type="button"
          className="combobox-chevron"
          aria-label={`Toggle ${label} options`}
          onClick={() => {
            setQuery("");
            setIsOpen((current) => !current);
          }}
        >
          <span />
        </button>
        {isOpen && (
          <div className="options">
            {loading && <div className="option muted">Loading master data...</div>}
            {!loading &&
              options.map((option) => (
                <button
                  type="button"
                  className="option"
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setQuery("");
                    setIsOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            {!loading && options.length === 0 && <div className="option muted">No matches</div>}
          </div>
        )}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

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

function SliderField({ label, value, min, max, step = 1, displayValue, minLabel, maxLabel, onChange }) {
  return (
    <label className="field slider-field">
      <span>{label}</span>
      <div className="slider-value">{displayValue ?? value}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="slider-range">
        <small>{minLabel ?? min}</small>
        <small>{maxLabel ?? max}</small>
      </div>
    </label>
  );
}

function LifeForm({ title, life, onChange, optional = false, secondLifeSelection, onSecondLifeSelectionChange }) {
  const age = calculateAge(life.dob);
  const showSecondLifeSelection = Boolean(onSecondLifeSelectionChange);

  function update(field, value) {
    onChange({ ...life, [field]: value });
  }

  return (
    <section className="form-card">
      <div className="section-heading">
        <h3>{title}</h3>
        {optional && <span className="pill subtle">Optional</span>}
      </div>
      <div className="form-grid">
        <TextField label="Full Name" value={life.full_name} onChange={(value) => update("full_name", value)} />
        <TextField label="Date of Birth" type="date" value={life.dob} onChange={(value) => update("dob", value)} />
        <TextField label="Age" value={age} readOnly onChange={() => {}} />
        <SelectField
          label="Gender"
          value={life.gender}
          options={dropdownMetadata.gender.options}
          onChange={(value) => update("gender", value)}
        />
        <SelectField
          label="Smoker Status"
          value={life.smoker_status}
          options={dropdownMetadata.smoker_status.options}
          onChange={(value) => update("smoker_status", value)}
        />
        <AsyncSearchableSelect
          label="Residency Country"
          value={life.residency_country}
          metadata={dropdownMetadata.country}
          onChange={(value) => update("residency_country", value)}
        />
        <AsyncSearchableSelect
          label="Nationality"
          value={life.nationality}
          metadata={dropdownMetadata.country}
          onChange={(value) => update("nationality", value)}
        />
        <AsyncSearchableSelect
          label="Birth Country"
          value={life.birth_country}
          metadata={dropdownMetadata.country}
          onChange={(value) => update("birth_country", value)}
        />
        {showSecondLifeSelection && (
          <SelectField
            label="Add Second Life?"
            value={secondLifeSelection}
            options={["No", "Yes"]}
            onChange={onSecondLifeSelectionChange}
          />
        )}
      </div>
    </section>
  );
}

function validateQuote(firstLife, secondLife, policy) {
  const validationMessages = [];
  const product = products[policy.product_name];
  const lives = [firstLife, secondLife].filter((life) => life.full_name || life.dob);
  const contribution = Number(policy.contribution_amount || 0);

  lives.forEach((life, index) => {
    const label = index === 0 ? "First Life" : "Second Life";
    const age = calculateAge(life.dob);

    if (life.dob && new Date(life.dob) > new Date()) {
      validationMessages.push(`${label}: DOB cannot be a future date.`);
    }

    if (age !== "" && (age < product.minAge || age > product.maxAge)) {
      validationMessages.push(`${label}: Age must be between ${product.minAge} and ${product.maxAge}.`);
    }

    if (!product.smokerEligible && life.smoker_status === "Yes") {
      validationMessages.push(`${label}: Smokers are restricted for ${policy.product_name}.`);
    }

    if (product.restrictedResidencies.includes(life.residency_country)) {
      validationMessages.push(`${label}: Residency is restricted for this product.`);
    }
  });

  if (secondLife.full_name && !product.jointLifeEligible) {
    validationMessages.push(`${policy.product_name} is not eligible for joint-life quotes.`);
  }

  if (contribution && contribution < product.minPremium) {
    validationMessages.push(`Minimum contribution is ${formatCurrency(product.minPremium, policy.currency)}.`);
  }

  if (contribution && contribution > product.maxPremium) {
    validationMessages.push(`Maximum contribution is ${formatCurrency(product.maxPremium, policy.currency)}.`);
  }

  if (Number(policy.contribution_term) > Number(policy.plan_term)) {
    validationMessages.push("Contribution term must be less than or equal to plan term.");
  }

  if (!product.currencies.includes(policy.currency)) {
    validationMessages.push(`${policy.currency} is not eligible for ${policy.product_name}.`);
  }

  return validationMessages;
}

function PolicyDetails({ policy, onChange }) {
  const product = products[policy.product_name];
  const frequencyMultiplier = dropdownMetadata.premium_frequency.multiplier[policy.premium_frequency] || 1;
  const annualizedContribution = Number(policy.contribution_amount || 0) * frequencyMultiplier;

  function update(field, value) {
    const nextPolicy = { ...policy, [field]: value };

    if (field === "growth_rate_assumption") {
      const scenario = dropdownMetadata.projection_scenario.options.find((option) => option.includes(value));
      nextPolicy.projection_scenario = scenario || nextPolicy.projection_scenario;
    }

    if (field === "contribution_term" && Number(value) > Number(nextPolicy.plan_term)) {
      nextPolicy.plan_term = value;
    }

    onChange(nextPolicy);
  }

  return (
    <section className="form-card">
      <div className="section-heading">
        <h3>Step 2 - Policy Details</h3>
        <span className="pill">{product.minAge}-{product.maxAge} entry age</span>
      </div>
      <div className="policy-details-layout">
        <div className="policy-select-grid">
        <SelectField
          label="Product Name"
          value={policy.product_name}
          options={Object.keys(products)}
          onChange={(value) => update("product_name", value)}
        />
        <SelectField
          label="Currency"
          value={policy.currency}
          options={dropdownMetadata.currency.options}
          onChange={(value) => update("currency", value)}
        />
        <SelectField
          label="Premium Frequency"
          value={policy.premium_frequency}
          options={dropdownMetadata.premium_frequency.options}
          onChange={(value) => update("premium_frequency", value)}
        />
        <div className="policy-grid-spacer" aria-hidden="true" />
        </div>
        <div className="policy-slider-grid">
        <SliderField
          label="Contribution Amount"
          min={product.minPremium}
          max={product.maxPremium}
          step={500}
          value={policy.contribution_amount}
          displayValue={formatCurrency(policy.contribution_amount, policy.currency)}
          minLabel={formatCurrency(product.minPremium, policy.currency)}
          maxLabel={formatCurrency(product.maxPremium, policy.currency)}
          onChange={(value) => update("contribution_amount", value)}
        />
        <div className="field calculated-field">
          <span>Annualized Contribution</span>
          <strong>{formatCurrency(annualizedContribution, policy.currency)}</strong>
          <small>Calculated from contribution amount and frequency</small>
        </div>
        <SliderField
          label="Contribution Term (in years)"
          min={5}
          max={30}
          value={policy.contribution_term}
          displayValue={`${policy.contribution_term} years`}
          minLabel="5 years"
          maxLabel="30 years"
          onChange={(value) => update("contribution_term", value)}
        />
        <SliderField
          label="Plan Term (in years)"
          min={Number(policy.contribution_term)}
          max={40}
          value={policy.plan_term}
          displayValue={`${policy.plan_term} years`}
          minLabel={`${policy.contribution_term} years`}
          maxLabel="40 years"
          onChange={(value) => update("plan_term", value)}
        />
        </div>
        <div className="policy-extra-grid">
        <SelectField
          label="Growth Rate Assumption"
          value={policy.growth_rate_assumption}
          options={dropdownMetadata.growth_rate_assumption.options}
          onChange={(value) => update("growth_rate_assumption", value)}
        />
        <SelectField
          label="Projection Scenario"
          value={policy.projection_scenario}
          options={dropdownMetadata.projection_scenario.options}
          onChange={(value) => update("projection_scenario", value)}
        />
        </div>
      </div>
    </section>
  );
}

function RiderConfiguration({ riders, onChange }) {
  function updateRider(benefitType, field, value) {
    onChange(
      riders.map((rider) => (rider.benefit_type === benefitType ? { ...rider, [field]: value } : rider))
    );
  }

  return (
    <section className="form-card">
      <div className="section-heading">
        <h3>Step 3 - Rider / Benefit Configuration</h3>
        <span className="pill subtle">All benefits shown</span>
      </div>
      <div className="benefit-list">
      {riders.map((rider) => {
        const selectedBenefit = benefitConfigurations[rider.benefit_type];

        return (
          <div className="rider-card" key={rider.benefit_type}>
            <div className="section-heading">
              <div>
                <strong>{selectedBenefit.riderName}</strong>
                <small>{rider.benefit_type}</small>
              </div>
            </div>
            <div className="form-grid">
              {selectedBenefit?.valueLabel && (
                <TextField
                  label={selectedBenefit.valueLabel}
                  type="number"
                  value={rider.benefit_value}
                  onChange={(value) => updateRider(rider.benefit_type, "benefit_value", value)}
                />
              )}
              {selectedBenefit?.hasApplicability && (
                <SelectField
                  label="Waiver of Contribution"
                  value={rider.applicability}
                  options={["Applicable", "Not Applicable"]}
                  onChange={(value) => updateRider(rider.benefit_type, "applicability", value)}
                />
              )}
              {selectedBenefit?.hasFibTerm && (
                <TextField
                  label="FIB Term"
                  type="number"
                  value={rider.fib_term}
                  onChange={(value) => updateRider(rider.benefit_type, "fib_term", value)}
                />
              )}
              {selectedBenefit?.hasProtectedContribution && (
                <>
                  <TextField
                    label="Protected Contribution Term"
                    type="number"
                    value={rider.protected_contribution_term}
                    onChange={(value) => updateRider(rider.benefit_type, "protected_contribution_term", value)}
                  />
                  <TextField
                    label="Protected Contribution Percent"
                    value={rider.protected_contribution_percent}
                    onChange={(value) => updateRider(rider.benefit_type, "protected_contribution_percent", value)}
                  />
                </>
              )}
              <TextField
                label="Rider SI"
                type="number"
                value={rider.rider_premium}
                onChange={(value) => updateRider(rider.benefit_type, "rider_premium", value)}
              />
            </div>
          </div>
        );
      })}
      </div>
    </section>
  );
}

function IllustrationStep({ policy, riders }) {
  const [activeIllustrationTab, setActiveIllustrationTab] = useState("illustrative");
  const growthRate = Number(policy.growth_rate_assumption.replace("%", "")) / 100;
  const rows = buildIllustrationRows(policy, riders, growthRate);
  const chartRows = rows.filter((row) => row.year <= 20);
  const tabs = [
    { id: "illustrative", label: `Illustrative Values @ ${policy.growth_rate_assumption} Growth` },
    { id: "encashment", label: "Encashment Details" },
    { id: "charges", label: "Charges" },
    { id: "graph", label: "Graph" },
  ];

  return (
    <section className="form-card illustration-step">
      <div className="section-heading">
        <div>
          <h3>Step 4 - Illustrations</h3>
          <p>Projection values update from contribution amount, plan term, growth rate, and selected benefits.</p>
        </div>
      </div>

      <div className="illustration-tabs" role="tablist" aria-label="Illustration tabs">
        {tabs.map((tab) => (
          <button
            className={activeIllustrationTab === tab.id ? "active" : ""}
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeIllustrationTab === tab.id}
            onClick={() => setActiveIllustrationTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeIllustrationTab === "illustrative" && (
        <div className="illustration-table">
          <div className="illustration-table-title">Illustrative Values @ {policy.growth_rate_assumption} Growth</div>
          <div className="illustration-row table-head">
            <span>End of Plan Year</span>
            <span>Contribution Paid</span>
            <span>Fund Value</span>
            <span>Encashment Value</span>
            <span>Takaful Donation</span>
            <span>Takaful Benefit</span>
          </div>
          {rows.map((row) => (
            <div className="illustration-row" key={row.year}>
              <span>{row.year}</span>
              <span>{formatNumber(row.contributionPaid)}</span>
              <span>{formatNumber(row.fundValue)}</span>
              <span>{formatNumber(row.encashmentValue)}</span>
              <span>{formatNumber(row.takafulDonation)}</span>
              <span>{formatNumber(row.takafulBenefit)}</span>
            </div>
          ))}
        </div>
      )}

      {activeIllustrationTab === "encashment" && (
        <div className="illustration-table encashment-table">
          <div className="illustration-table-title">Encashment Details @ {policy.growth_rate_assumption} Growth</div>
          <div className="illustration-row encashment-row table-head">
            <span>End of Plan Year</span>
            <span>Encashment Rate</span>
            <span>Encashment Charge</span>
            <span>Encashment Value</span>
          </div>
          {rows.map((row) => (
            <div className="illustration-row encashment-row" key={row.year}>
              <span>{row.year}</span>
              <span>{row.year <= 5 ? "11%" : "1%"}</span>
              <span>{formatNumber(row.encashmentCharge)}</span>
              <span>{formatNumber(row.encashmentValue)}</span>
            </div>
          ))}
        </div>
      )}

      {activeIllustrationTab === "charges" && (
        <div className="illustration-table charges-table">
          <div className="illustration-table-title">Charges Summary @ {policy.growth_rate_assumption} Growth</div>
          <div className="illustration-row charges-row table-head">
            <span>End of Plan Year</span>
            <span>Contribution Paid</span>
            <span>Fund Value</span>
            <span>Amount Invested %</span>
            <span>Net Charges %</span>
          </div>
          {rows.map((row) => (
            <div className="illustration-row charges-row" key={row.year}>
              <span>{row.year}</span>
              <span>{formatNumber(row.contributionPaid)}</span>
              <span>{formatNumber(row.fundValue)}</span>
              <span>{row.amountInvestedPercent}%</span>
              <span>{row.netChargesPercent}%</span>
            </div>
          ))}
        </div>
      )}

      {activeIllustrationTab === "graph" && (
        <div className="projection-chart-card">
          {(() => {
            const maxValue = Math.max(...chartRows.map((item) => item.fundValue));
            const axisMax = Math.ceil(maxValue / 50000) * 50000;
            const ticks = [axisMax, axisMax * 0.75, axisMax * 0.5, axisMax * 0.25, 0];

            return (
              <>
          <div className="projection-chart-header">
            <div>
              <h4>Projection Graph</h4>
              <p>Contribution paid, fund value, and total charges by end of plan year.</p>
            </div>
            <span className="pill subtle">{policy.growth_rate_assumption} growth</span>
          </div>
          <div className="projection-chart-shell">
            <div className="y-axis-title">Amount</div>
            <div className="y-axis-scale">
              {ticks.map((tick) => (
                <span key={tick}>{formatNumber(tick)}</span>
              ))}
            </div>
            <div className="projection-chart">
              {chartRows.map((row) => (
                  <div className="projection-chart-group" key={row.year}>
                    <span title={`Contribution ${formatNumber(row.contributionPaid)}`} style={{ height: `${(row.contributionPaid / axisMax) * 180}px` }} />
                    <span title={`Fund ${formatNumber(row.fundValue)}`} style={{ height: `${(row.fundValue / axisMax) * 180}px` }} />
                    <span title={`Charges ${formatNumber(row.netCharges)}`} style={{ height: `${Math.max((row.netCharges / axisMax) * 180, 4)}px` }} />
                    <small>{row.year}</small>
                  </div>
                ))}
            </div>
            <div className="x-axis-title">End of Plan Year</div>
          </div>
          <div className="projection-legend">
            <span><i className="legend-contribution" />Contribution Paid</span>
            <span><i className="legend-fund" />Fund Value</span>
            <span><i className="legend-charges" />Total Charges</span>
          </div>
              </>
            );
          })()}
        </div>
      )}
    </section>
  );
}

function ProposalStep({ firstLife, secondLife, secondLifeSelection, policy }) {
  const [selectedProposalId, setSelectedProposalId] = useState("proposal-first-life");
  const [proposalForms, setProposalForms] = useState(() => {
    const proposals = [createProposalFromLife(firstLife, "First Life", policy)];

    if (secondLifeSelection === "Yes") {
      proposals.push(createProposalFromLife(secondLife, "Second Life", policy));
    }

    return proposals;
  });

  const selectedProposal = proposalForms.find((proposal) => proposal.id === selectedProposalId) || proposalForms[0];

  function updateProposal(id, field, value) {
    setProposalForms((current) =>
      current.map((proposal) =>
        proposal.id === id ? { ...proposal, [field]: value, completed: false } : proposal
      )
    );
  }

  function completeProposal(id) {
    setProposalForms((current) =>
      current.map((proposal) => (proposal.id === id ? { ...proposal, completed: true } : proposal))
    );
  }

  function downloadProposal(proposal) {
    const lines = Object.entries(proposal).map(([key, value]) => `${key}: ${value}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${proposal.full_name.replaceAll(" ", "-").toLowerCase()}-proposal.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderProposalField(field) {
    if (field.type === "textarea") {
      return (
        <label className="field proposal-field-wide" key={field.name}>
          <span>{field.label}</span>
          <textarea
            value={selectedProposal[field.name] || ""}
            onChange={(event) => updateProposal(selectedProposal.id, field.name, event.target.value)}
          />
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <SelectField
          key={field.name}
          label={field.label}
          value={selectedProposal[field.name] || ""}
          options={field.options}
          onChange={(value) => updateProposal(selectedProposal.id, field.name, value)}
        />
      );
    }

    return (
      <TextField
        key={field.name}
        label={field.label}
        type={field.type || "text"}
        value={selectedProposal[field.name] || ""}
        readOnly={field.readOnly}
        onChange={(value) => updateProposal(selectedProposal.id, field.name, value)}
      />
    );
  }

  function getProposalSubsectionTitle(sectionTitle, field) {
    if (field.name.includes("beneficiary")) return "Beneficiary Details";
    if (field.name.includes("guardian")) return "Minor Beneficiary Guardian";
    if (field.name.includes("father") || field.name.includes("mother") || field.name.includes("spouse") || field.name.includes("brother") || field.name.includes("sister") || field.name.includes("children")) return "Family Health History";
    if (field.name.includes("second_member")) return "Second Covered Member";
    if (field.name.includes("first_member")) return "First Covered Member";
    if (field.name.includes("plan_holder")) return "Plan Holder";
    if (field.name.startsWith("investment_")) return "Fund Allocation";
    if (field.name.startsWith("tax_")) return "Tax Residency";
    if (field.name.startsWith("us_") || field.name === "tin_ssn") return "United States Person Details";
    if (field.name.startsWith("payment_mode")) return "Payment Mode";
    if (field.name.startsWith("payment_method")) return "Payment Method";
    if (field.name.includes("source_funds") || field.name.includes("bank")) return "Banking and Source of Funds";
    if (field.name.includes("income")) return "Income";
    if (field.name.includes("assets") || ["cash_assets", "shares_bonds", "real_estate"].includes(field.name)) return "Assets";
    if (field.name.includes("liabilities") || field.name.includes("loans") || field.name.includes("debts") || field.name.includes("mortgages") || field.name.includes("payable")) return "Liabilities";
    if (field.name.includes("insurance")) return "Existing Insurance";
    if (field.name.includes("signature") || field.name.includes("signed") || field.name.includes("representative")) return "Signatures and Representative Details";

    if (sectionTitle.includes("Covered Member")) {
      if (["nature_of_business", "employer_name_address", "exact_daily_duties", "occupation"].includes(field.name)) return "Employment and Occupation";
      return "Identity and Residency";
    }

    if (sectionTitle.includes("Correspondence")) {
      if (["address", "home_country_address"].includes(field.name)) return "Address Details";
      if (["home_office_tel", "fax_no", "mobile_no", "email"].includes(field.name)) return "Contact Details";
      return "Correspondence Address";
    }

    if (sectionTitle.includes("FATCA")) return "Self-Certification";
    if (sectionTitle.includes("Benefit")) return "Plan Benefits";
    if (sectionTitle.includes("Contribution")) return "Contribution Funding";
    if (sectionTitle.includes("Income")) return "Income for Last 3 Years";
    if (sectionTitle.includes("Medical")) {
      if (["height_cm", "weight_kg"].includes(field.name)) return "Physical Measurements";
      if (["smoking_status_proposal", "smoking_quantity", "alcohol_status", "alcohol_units", "hazardous_pursuits", "pregnancy"].includes(field.name)) return "Lifestyle and Special Conditions";
      if (field.name.includes("details")) return "Medical Details";
      return "Medical Questions";
    }
    if (sectionTitle.includes("Declaration")) return "Declarations and Consents";

    return "Details";
  }

  function isVerticalProposalGroup(sectionTitle, groupTitle) {
    return (
      sectionTitle.includes("FATCA") ||
      sectionTitle.includes("Medical") ||
      sectionTitle.includes("Declaration") ||
      groupTitle.includes("Family Health") ||
      groupTitle.includes("Beneficiary") ||
      groupTitle.includes("Guardian") ||
      groupTitle.includes("Existing Insurance")
    );
  }

  function renderProposalSection(section) {
    const groupedFields = section.fields.reduce((groups, field) => {
      const groupTitle = getProposalSubsectionTitle(section.title, field);
      return { ...groups, [groupTitle]: [...(groups[groupTitle] || []), field] };
    }, {});

    return (
      <section className="proposal-section-card" key={section.title}>
        <h5>{section.title}</h5>
        <div className="proposal-subsection-list">
          {Object.entries(groupedFields).map(([groupTitle, fields]) => (
            <div
              className={`proposal-subsection ${isVerticalProposalGroup(section.title, groupTitle) ? "vertical-table" : ""}`}
              key={`${section.title}-${groupTitle}`}
            >
              <h6>{groupTitle}</h6>
              <div className="form-grid proposal-section-grid">
                {fields.map(renderProposalField)}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const yesNoOptions = ["No", "Yes"];
  const relationshipOptions = ["Self", "Spouse", "Child", "Parent", "Sibling", "Business Partner", "Other"];
  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const residencyOptions = ["United Arab Emirates", "GCC Resident", "Non Resident"];
  const occupationOptions = ["Business Owner", "Finance Manager", "Salaried Employee", "Self Employed", "Professional", "Homemaker", "Student", "Retired", "Other"];
  const reasonForCoverOptions = ["Protection", "Savings", "Education", "Retirement", "Mortgage Protection", "Business Protection", "Estate Planning", "Other"];
  const paymentMethodOptions = ["Standing Instruction", "Demand Draft", "Cheque", "Telegraphic Transfer", "Credit Card", "Direct Debit"];
  const sourceOfFundsOptions = ["Salary", "Business Income", "Savings", "Investment Income", "Sale of Property", "Inheritance", "Gift", "Other"];
  const bankOptions = ["Emirates NBD", "First Abu Dhabi Bank", "Abu Dhabi Commercial Bank", "Dubai Islamic Bank", "Mashreq Bank", "HSBC UAE", "Other"];
  const investmentOptions = ["Salama Balanced Fund", "Salama Growth Fund", "Salama Conservative Fund", "Global Equity Fund", "Sukuk Fund", "Money Market Fund", "Other"];
  const healthOptions = ["Good", "Fair", "Poor", "Deceased", "N/A"];
  const insuranceRatingOptions = ["Standard", "Rated Up", "Postponed", "Declined", "Not Applicable"];
  const proposalSections = [
    {
      title: "Section 1.1 / 1.2 - Covered Member Details",
      fields: [
        { name: "covered_member_option", label: "Details of Covered Member (as shown in identification document)", type: "select", options: ["First Covered Member", "Second Covered Member", "Plan Holder"] },
        { name: "full_name", label: "Full Name" },
        { name: "gender", label: "Gender", type: "select", options: dropdownMetadata.gender.options },
        { name: "marital_status", label: "Marital Status", type: "select", options: maritalStatusOptions },
        { name: "nationality", label: "Nationality / Permanent Residency", type: "select", options: countryMaster },
        { name: "id_passport_no", label: "ID / Passport No." },
        { name: "dob", label: "Date of Birth", type: "date" },
        { name: "birth_country", label: "Birth Country", type: "select", options: countryMaster },
        { name: "residency_country", label: "Residency", type: "select", options: residencyOptions },
        { name: "nature_of_business", label: "Nature of Business" },
        { name: "employer_name_address", label: "Employer Name & Address" },
        { name: "po_box", label: "P.O. Box" },
        { name: "exact_daily_duties", label: "Exact Daily Duties" },
        { name: "occupation", label: "Occupation", type: "select", options: occupationOptions },
      ],
    },
    {
      title: "Section 1.3 - Plan Holder Details",
      fields: [
        { name: "plan_holder_option", label: "Select Relevant Option", type: "select", options: ["Same as First Covered Member", "Same as Second Covered Member", "Other"] },
        { name: "relationship_to_plan_holder", label: "Relationship to Plan Holder", type: "select", options: relationshipOptions },
        { name: "relationship_to_first_member", label: "Relationship of First Covered Member to Plan Holder", type: "select", options: relationshipOptions },
        { name: "relationship_to_second_member", label: "Relationship of Second Covered Member to Plan Holder", type: "select", options: relationshipOptions },
        { name: "product_name", label: "Plan Name", readOnly: true },
        { name: "currency", label: "Plan Currency", readOnly: true },
        { name: "premium_frequency", label: "Payment Mode", readOnly: true },
        { name: "plan_term", label: "Plan Term", readOnly: true },
        { name: "contribution_payment_term", label: "Contribution Payment Term", readOnly: true },
        { name: "contribution_amount", label: "Contribution Amount", readOnly: true },
      ],
    },
    {
      title: "Correspondence Address",
      fields: [
        { name: "apartment_no", label: "Apartment / House No." },
        { name: "building_no", label: "Building No." },
        { name: "street_name", label: "Street Name" },
        { name: "city", label: "City", type: "select", options: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Other"] },
        { name: "country", label: "Country", type: "select", options: countryMaster },
        { name: "po_box", label: "P.O. Box" },
        { name: "home_office_tel", label: "Home / Office Tel. No." },
        { name: "fax_no", label: "Fax No." },
        { name: "mobile_no", label: "Mobile No." },
        { name: "email", label: "Email", type: "email" },
        { name: "address", label: "Full Correspondence Address", type: "textarea" },
        { name: "home_country_address", label: "Home Country Address", type: "textarea" },
      ],
    },
    {
      title: "Section 1.4 - FATCA / CRS Self-Certification",
      fields: [
        { name: "individual_plan_holder", label: "If individual, complete section 1.5", type: "select", options: ["Yes", "No"] },
        { name: "joint_life_plan", label: "For Joint Life Plans, separate form required for each Plan Holder", type: "select", options: ["Acknowledged", "Not Applicable"] },
        { name: "us_person", label: "Are you a United States person?", type: "select", options: yesNoOptions },
        { name: "us_citizen_or_resident", label: "A citizen or resident of the United States?", type: "select", options: yesNoOptions },
        { name: "us_partnership_or_corporation", label: "A United States partnership / corporation?", type: "select", options: yesNoOptions },
        { name: "us_estate", label: "An estate that constitutes a United States estate?", type: "select", options: yesNoOptions },
        { name: "us_trust", label: "A trust with US court supervision / US controlling persons?", type: "select", options: yesNoOptions },
        { name: "tin_ssn", label: "TIN / SSN" },
        { name: "tax_resident_other_country", label: "Tax resident in another country?", type: "select", options: yesNoOptions },
        { name: "tax_residence_country_1", label: "Country / Jurisdiction of Tax Residence", type: "select", options: countryMaster },
        { name: "tax_tin_1", label: "TIN / SSN or reason unavailable" },
        { name: "tax_residence_country_2", label: "Country / Jurisdiction of Tax Residence 2", type: "select", options: countryMaster },
        { name: "tax_tin_2", label: "TIN / SSN or reason unavailable 2" },
        { name: "tax_residence_country_3", label: "Country / Jurisdiction of Tax Residence 3", type: "select", options: countryMaster },
        { name: "tax_tin_3", label: "TIN / SSN or reason unavailable 3" },
      ],
    },
    {
      title: "Section 2 - Benefit Details",
      fields: [
        { name: "first_member_reason_for_cover", label: "First Covered Member - Reason for Cover", type: "select", options: reasonForCoverOptions },
        { name: "second_member_reason_for_cover", label: "Second Covered Member - Reason for Cover", type: "select", options: reasonForCoverOptions },
        { name: "reason_for_cover", label: "Reason for Cover", type: "select", options: reasonForCoverOptions },
        { name: "mandatory_benefit_amount", label: "Mandatory Family Takaful Benefit Amount" },
        { name: "optional_ptd_amount", label: "Permanent Total Disability Benefit Amount" },
        { name: "optional_adb_amount", label: "Accidental Death Benefit Amount" },
        { name: "optional_ci_amount", label: "Critical Illness Benefit Amount" },
        { name: "optional_ppd_amount", label: "Accidental Total or Partial Permanent Disability Amount" },
        { name: "optional_hcb_amount", label: "Hospital Cash Benefit Amount" },
        { name: "optional_fib_amount", label: "Monthly Family Income Benefit Amount" },
        { name: "optional_fib_term", label: "Monthly Family Income Benefit Term" },
        { name: "optional_woc", label: "Waiver of Contribution", type: "select", options: ["Applicable", "Not Applicable"] },
        { name: "second_optional_ptd_amount", label: "Second Covered Member - Permanent Total Disability Amount" },
        { name: "second_optional_adb_amount", label: "Second Covered Member - Accidental Death Benefit Amount" },
        { name: "second_optional_ci_amount", label: "Second Covered Member - Critical Illness Benefit Amount" },
        { name: "second_optional_ppd_amount", label: "Second Covered Member - Accidental Total or Partial Permanent Disability Amount" },
        { name: "second_optional_hcb_amount", label: "Second Covered Member - Hospital Cash Benefit Amount" },
        { name: "second_optional_fib_amount", label: "Second Covered Member - Monthly Family Income Benefit Amount" },
        { name: "second_optional_fib_term", label: "Second Covered Member - Monthly Family Income Benefit Term" },
        { name: "second_optional_woc", label: "Second Covered Member - Waiver of Contribution", type: "select", options: ["Applicable", "Not Applicable"] },
      ],
    },
    {
      title: "Section 3 - Contribution Details",
      fields: [
        { name: "payment_mode_monthly", label: "Payment Mode - Monthly", type: "select", options: ["No", "Yes"] },
        { name: "payment_mode_quarterly", label: "Payment Mode - Quarterly", type: "select", options: ["No", "Yes"] },
        { name: "payment_mode_semiannual", label: "Payment Mode - Semiannual", type: "select", options: ["No", "Yes"] },
        { name: "payment_mode_annual", label: "Payment Mode - Annual", type: "select", options: ["No", "Yes"] },
        { name: "payment_mode_single", label: "Payment Mode - Single", type: "select", options: ["No", "Yes"] },
        { name: "payment_method", label: "Payment Method", type: "select", options: paymentMethodOptions },
        { name: "payment_method_standing_instruction", label: "Payment Method - Standing Instruction", type: "select", options: yesNoOptions },
        { name: "payment_method_demand_draft", label: "Payment Method - Demand Draft", type: "select", options: yesNoOptions },
        { name: "payment_method_cheque", label: "Payment Method - Cheque", type: "select", options: yesNoOptions },
        { name: "payment_method_telegraphic_transfer", label: "Payment Method - Telegraphic Transfer", type: "select", options: yesNoOptions },
        { name: "payment_method_credit_card", label: "Payment Method - Credit Card", type: "select", options: yesNoOptions },
        { name: "source_of_funds", label: "Source of Funds to be Paid as Contribution", type: "select", options: sourceOfFundsOptions },
        { name: "bank_name", label: "Bank Name(s)", type: "select", options: bankOptions },
        { name: "bank_iban", label: "Bank IBAN(s)" },
      ],
    },
    {
      title: "Section 4 - Investment Details",
      fields: [
        { name: "investment_strategy_1", label: "Fund(s) / Strategy(ies)", type: "select", options: investmentOptions },
        { name: "investment_percentage_1", label: "Percentage (%)", type: "number" },
        { name: "investment_strategy_2", label: "Fund / Strategy 2", type: "select", options: investmentOptions },
        { name: "investment_percentage_2", label: "Percentage 2 (%)", type: "number" },
        { name: "investment_strategy_3", label: "Fund / Strategy 3", type: "select", options: investmentOptions },
        { name: "investment_percentage_3", label: "Percentage 3 (%)", type: "number" },
        { name: "investment_strategy_4", label: "Fund / Strategy 4", type: "select", options: investmentOptions },
        { name: "investment_percentage_4", label: "Percentage 4 (%)", type: "number" },
        { name: "investment_strategy_5", label: "Fund / Strategy 5", type: "select", options: investmentOptions },
        { name: "investment_percentage_5", label: "Percentage 5 (%)", type: "number" },
        { name: "investment_strategy_6", label: "Fund / Strategy 6", type: "select", options: investmentOptions },
        { name: "investment_percentage_6", label: "Percentage 6 (%)", type: "number" },
        { name: "investment_strategy_7", label: "Fund / Strategy 7", type: "select", options: investmentOptions },
        { name: "investment_percentage_7", label: "Percentage 7 (%)", type: "number" },
        { name: "investment_strategy_8", label: "Fund / Strategy 8", type: "select", options: investmentOptions },
        { name: "investment_percentage_8", label: "Percentage 8 (%)", type: "number" },
        { name: "investment_strategy_9", label: "Fund / Strategy 9", type: "select", options: investmentOptions },
        { name: "investment_percentage_9", label: "Percentage 9 (%)", type: "number" },
        { name: "investment_strategy_10", label: "Fund / Strategy 10", type: "select", options: investmentOptions },
        { name: "investment_percentage_10", label: "Percentage 10 (%)", type: "number" },
      ],
    },
    {
      title: "Section 5 - Bank and Source of Funds Details",
      fields: [
        { name: "first_member_bank_1", label: "First Covered Member - Bank 1", type: "select", options: bankOptions },
        { name: "first_member_bank_iban_1", label: "First Covered Member - Bank IBAN 1" },
        { name: "first_member_source_funds_1", label: "First Covered Member - Source of Funds 1", type: "select", options: sourceOfFundsOptions },
        { name: "first_member_bank_2", label: "First Covered Member - Bank 2", type: "select", options: bankOptions },
        { name: "first_member_bank_iban_2", label: "First Covered Member - Bank IBAN 2" },
        { name: "first_member_source_funds_2", label: "First Covered Member - Source of Funds 2", type: "select", options: sourceOfFundsOptions },
        { name: "second_member_bank_1", label: "Second Covered Member - Bank 1", type: "select", options: bankOptions },
        { name: "second_member_bank_iban_1", label: "Second Covered Member - Bank IBAN 1" },
        { name: "second_member_source_funds_1", label: "Second Covered Member - Source of Funds 1", type: "select", options: sourceOfFundsOptions },
        { name: "second_member_bank_2", label: "Second Covered Member - Bank 2", type: "select", options: bankOptions },
        { name: "second_member_bank_iban_2", label: "Second Covered Member - Bank IBAN 2" },
        { name: "second_member_source_funds_2", label: "Second Covered Member - Source of Funds 2", type: "select", options: sourceOfFundsOptions },
        { name: "plan_holder_bank_1", label: "Plan Holder - Bank 1", type: "select", options: bankOptions },
        { name: "plan_holder_bank_iban_1", label: "Plan Holder - Bank IBAN 1" },
        { name: "plan_holder_source_funds_1", label: "Plan Holder - Source of Funds 1", type: "select", options: sourceOfFundsOptions },
        { name: "plan_holder_bank_2", label: "Plan Holder - Bank 2", type: "select", options: bankOptions },
        { name: "plan_holder_bank_iban_2", label: "Plan Holder - Bank IBAN 2" },
        { name: "plan_holder_source_funds_2", label: "Plan Holder - Source of Funds 2", type: "select", options: sourceOfFundsOptions },
      ],
    },
    {
      title: "Section 6 - Income for Last 3 Years",
      fields: [
        { name: "income_last_year", label: "Year 1 / Last Year Income", type: "number" },
        { name: "income_second_last_year", label: "Year 2 / 2nd Last Year Income", type: "number" },
        { name: "income_third_last_year", label: "Year 3 / 3rd Last Year Income", type: "number" },
        { name: "annual_income", label: "Current Annual Income", type: "number" },
      ],
    },
    {
      title: "Sections 7 and 8 - Assets, Liabilities, Existing Insurance",
      fields: [
        { name: "cash_assets", label: "Cash", type: "number" },
        { name: "shares_bonds", label: "Shares and Bonds", type: "number" },
        { name: "real_estate", label: "Real Estate", type: "number" },
        { name: "other_assets", label: "Other Assets", type: "number" },
        { name: "assets_total", label: "Total Assets", type: "number" },
        { name: "liabilities", label: "Liabilities", type: "number" },
        { name: "loans_debts", label: "Loans / Debts", type: "number" },
        { name: "accounts_payable", label: "Accounts Payable", type: "number" },
        { name: "mortgages_property", label: "Mortgages on Property", type: "number" },
        { name: "other_loans", label: "Other Loans", type: "number" },
        { name: "liabilities_total", label: "Total Liabilities", type: "number" },
        { name: "other_insurance_company", label: "Other Life Insurance Company Name" },
        { name: "other_insurance_plan_no", label: "Other Insurance Plan Number" },
        { name: "other_insurance_year", label: "Year of Issuance" },
        { name: "other_insurance_sum_covered", label: "Sum Covered Amount", type: "number" },
        { name: "other_insurance_contribution", label: "Contribution Amount", type: "number" },
        { name: "other_insurance_rating", label: "Standard or Rated Up", type: "select", options: insuranceRatingOptions },
      ],
    },
    {
      title: "Sections 9 and 10 - Family History and Beneficiaries",
      fields: [
        { name: "father_number", label: "Father - No(s)" },
        { name: "father_health", label: "Father - Current Age / State of Health", type: "select", options: healthOptions },
        { name: "father_death", label: "Father - Age at Death / Cause of Death" },
        { name: "mother_number", label: "Mother - No(s)" },
        { name: "mother_health", label: "Mother - Current Age / State of Health", type: "select", options: healthOptions },
        { name: "mother_death", label: "Mother - Age at Death / Cause of Death" },
        { name: "spouse_number", label: "Spouse(s) - No(s)" },
        { name: "spouse_health", label: "Spouse(s) - Current Age / State of Health", type: "select", options: healthOptions },
        { name: "spouse_death", label: "Spouse(s) - Age at Death / Cause of Death" },
        { name: "brother_number", label: "Brother(s) - No(s)" },
        { name: "brother_health", label: "Brother(s) - Current Age / State of Health", type: "select", options: healthOptions },
        { name: "brother_death", label: "Brother(s) - Age at Death / Cause of Death" },
        { name: "sister_number", label: "Sister(s) - No(s)" },
        { name: "sister_health", label: "Sister(s) - Current Age / State of Health", type: "select", options: healthOptions },
        { name: "sister_death", label: "Sister(s) - Age at Death / Cause of Death" },
        { name: "children_number", label: "Children - No(s)" },
        { name: "children_health", label: "Children - Current Age / State of Health", type: "select", options: healthOptions },
        { name: "children_death", label: "Children - Age at Death / Cause of Death" },
        { name: "beneficiary_name", label: "Beneficiary 1 - Full Name" },
        { name: "beneficiary_relationship", label: "Beneficiary 1 - Relationship to Covered Member", type: "select", options: relationshipOptions },
        { name: "beneficiary_dob_age", label: "Beneficiary 1 - Date of Birth / Age" },
        { name: "beneficiary_id_passport", label: "Beneficiary 1 - ID / Passport No." },
        { name: "beneficiary_nationality", label: "Beneficiary 1 - Nationality", type: "select", options: countryMaster },
        { name: "beneficiary_share", label: "Beneficiary 1 - Percent Share (%)", type: "number" },
        { name: "beneficiary_2_name", label: "Beneficiary 2 - Full Name" },
        { name: "beneficiary_2_relationship", label: "Beneficiary 2 - Relationship to Covered Member", type: "select", options: relationshipOptions },
        { name: "beneficiary_2_share", label: "Beneficiary 2 - Percent Share (%)", type: "number" },
        { name: "beneficiary_3_name", label: "Beneficiary 3 - Full Name" },
        { name: "beneficiary_3_relationship", label: "Beneficiary 3 - Relationship to Covered Member", type: "select", options: relationshipOptions },
        { name: "beneficiary_3_share", label: "Beneficiary 3 - Percent Share (%)", type: "number" },
        { name: "minor_guardian_name", label: "Guardian Full Name if Beneficiary is Minor" },
        { name: "minor_guardian_age", label: "Guardian Age" },
        { name: "minor_guardian_id", label: "Guardian ID / Passport No." },
        { name: "minor_guardian_nationality", label: "Guardian Nationality", type: "select", options: countryMaster },
        { name: "minor_guardian_relationship", label: "Relationship to Beneficiary", type: "select", options: relationshipOptions },
      ],
    },
    {
      title: "Section 11 - Medical and Lifestyle Details",
      fields: [
        { name: "height_cm", label: "Height (CMS)", type: "number" },
        { name: "weight_kg", label: "Weight (KGS)", type: "number" },
        { name: "medical_impairment", label: "Free from impairment/deformities?", type: "select", options: ["No", "Yes"] },
        { name: "respiratory_disorder", label: "Disease of respiratory system (tuberculosis, asthma, persistent cough, pneumonia, COVID-19)?", type: "select", options: ["No", "Yes"] },
        { name: "genitourinary_disorder", label: "Disease of genitourinary system (kidneys, urinary/genital organs, renal stones, venereal disease)?", type: "select", options: ["No", "Yes"] },
        { name: "digestive_disorder", label: "Disease of gastro-intestinal system (digestive disorders, gastric/duodenal ulcer, hepatitis B/other liver disease or gall bladder)?", type: "select", options: ["No", "Yes"] },
        { name: "brain_or_mental_disorder", label: "Disease of brain, nervous system or mental disorder (fainting, blackouts, fits, recurrent headaches, paralysis)?", type: "select", options: ["No", "Yes"] },
        { name: "diabetes_or_blood_disorder", label: "Diabetes, cancer, disease of blood, glands, spleen, ears, eyes or skin?", type: "select", options: ["No", "Yes"] },
        { name: "unexplained_symptoms", label: "Unexplained night sweats, loss of weight, fever, chronic/recurrent diarrhoea, unexpected infections or swollen glands?", type: "select", options: ["No", "Yes"] },
        { name: "circulatory_disorder", label: "Disease of circulatory system (heart trouble, rheumatic fever, high blood pressure, veins/arteries)?", type: "select", options: ["No", "Yes"] },
        { name: "bone_joint_disorder", label: "Disease/disorder of muscles, bones, joints, limbs or spine (arthritis, rheumatism, slipped discs, paralysis)?", type: "select", options: ["No", "Yes"] },
        { name: "other_illness", label: "Any other illness?", type: "select", options: ["No", "Yes"] },
        { name: "hospital_admission", label: "Hospital admission / surgery advised?", type: "select", options: ["No", "Yes"] },
        { name: "blood_test_advice", label: "Blood test for AIDS / AIDS-related condition?", type: "select", options: ["No", "Yes"] },
        { name: "routine_exam", label: "Physical exam or tests in past 5 years?", type: "select", options: ["No", "Yes"] },
        { name: "disability_benefit", label: "Receiving disability benefit?", type: "select", options: ["No", "Yes"] },
        { name: "insurance_declined", label: "Insurance declined/postponed/special terms?", type: "select", options: ["No", "Yes"] },
        { name: "smoking_status_proposal", label: "Smoked any form of tobacco in last 12 months?", type: "select", options: ["No", "Yes"] },
        { name: "smoking_quantity", label: "If yes, how many per day?" },
        { name: "alcohol_status", label: "Drink alcoholic beverages?", type: "select", options: ["No", "Yes"] },
        { name: "alcohol_units", label: "If yes, number of units per day" },
        { name: "hazardous_pursuits", label: "Hazardous pursuits / aviation?", type: "select", options: ["No", "Yes"] },
        { name: "pregnancy", label: "Female applicant pregnant?", type: "select", options: ["N/A", "No", "Yes"] },
        { name: "pregnancy_complications", label: "Pregnancy/gynaecological complications?", type: "select", options: ["N/A", "No", "Yes"] },
        { name: "medical_details", label: "Medical Details / Additional Notes", type: "textarea" },
      ],
    },
    {
      title: "Sections 12 and 13 - Declarations and Signatures",
      fields: [
        { name: "personal_data_consent", label: "Personal Data Consent", type: "select", options: ["Yes", "No"] },
        { name: "sms_consent", label: "SMS Consent", type: "select", options: ["Yes", "No"] },
        { name: "email_declaration", label: "Email Declaration", type: "select", options: ["Yes", "No"] },
        { name: "takaful_membership_acknowledgement", label: "Takaful Membership Subscription Acknowledgement", type: "select", options: ["Acknowledged", "Not Acknowledged"] },
        { name: "first_member_signature", label: "Signature of First Covered Member" },
        { name: "second_member_signature", label: "Signature of Second Covered Member" },
        { name: "plan_holder_signature", label: "Signature of Plan Holder" },
        { name: "authorized_signatory", label: "Authorized Signatory (for and on behalf of Operator)" },
        { name: "signature_city", label: "City / Emirate", type: "select", options: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Other"] },
        { name: "signature_date", label: "Date", type: "date" },
        { name: "representative_name", label: "Distribution Channel Representative Name" },
        { name: "representative_code", label: "Representative Code" },
        { name: "representative_branch", label: "Emirate / Branch", type: "select", options: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Other"] },
        { name: "representative_signature", label: "Representative Signature" },
        { name: "representative_date", label: "Representative Date", type: "date" },
        { name: "deal_received_by", label: "Deal received by" },
        { name: "deal_referred_by_department", label: "Deal referred by Department / Branch" },
      ],
    },
  ];

  return (
    <section className="form-card proposal-step">
      <div className="section-heading">
        <div>
          <h3>Step 5 - Proposal Forms</h3>
          <p>Complete one proposal form for each selected life assured.</p>
        </div>
      </div>

      <div className="proposal-layout">
        <aside className="proposal-list">
          {proposalForms.map((proposal) => (
            <button
              className={selectedProposal.id === proposal.id ? "active" : ""}
              key={proposal.id}
              type="button"
              onClick={() => setSelectedProposalId(proposal.id)}
            >
              <div>
                <strong>{proposal.role}</strong>
                <span>{proposal.full_name}</span>
              </div>
              <em className={proposal.completed ? "completed" : ""}>
                {proposal.completed ? "Completed" : "Pending"}
              </em>
              {proposal.completed && (
                <span
                  className="download-link"
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    downloadProposal(proposal);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") downloadProposal(proposal);
                  }}
                >
                  Download
                </span>
              )}
            </button>
          ))}
        </aside>

        <div className="proposal-form">
          <div className="proposal-form-heading">
            <div>
              <h4>{selectedProposal.role} Proposal</h4>
              <p>Prefilled from life assured and policy details. Complete the remaining proposal information.</p>
            </div>
            <span className={`proposal-status ${selectedProposal.completed ? "completed" : ""}`}>
              {selectedProposal.completed ? "Completed" : "Pending"}
            </span>
          </div>

          <div className="proposal-section-list">
            {proposalSections.map(renderProposalSection)}
          </div>

          <div className="step-actions">
            <button className="secondary-button" type="button" onClick={() => downloadProposal(selectedProposal)} disabled={!selectedProposal.completed}>
              Download Proposal
            </button>
            <button className="primary-button" type="button" onClick={() => completeProposal(selectedProposal.id)}>
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportingDocumentsStep({ documents, onChange }) {
  const requiredDocuments = documents.filter((document) => document.required);
  const optionalDocuments = documents.filter((document) => !document.required);
  const pendingRequired = requiredDocuments.filter((document) => document.status !== "Uploaded").length;

  function updateDocument(id, updates) {
    onChange((current) =>
      current.map((document) => (document.id === id ? { ...document, ...updates } : document))
    );
  }

  function attachMockDocument(id) {
    updateDocument(id, {
      status: "Uploaded",
      fileName: `${id.replace("doc-", "")}-uploaded.pdf`,
    });
  }

  function addMoreDocument() {
    const nextIndex = documents.length + 1;
    onChange((current) => [
      ...current,
      {
        id: `doc-additional-${nextIndex}`,
        name: `Additional Supporting Document ${nextIndex}`,
        category: "Additional",
        required: false,
        status: "Uploaded",
        fileName: `additional-document-${nextIndex}.pdf`,
      },
    ]);
  }

  function renderDocumentCard(document) {
    return (
      <article className="document-card" key={document.id}>
        <div>
          <span className={`document-tag ${document.required ? "mandatory" : ""}`}>
            {document.required ? "Mandatory" : "Optional"}
          </span>
          <h4>{document.name}</h4>
          <p>{document.category}</p>
          <small>{document.fileName || "No document attached yet"}</small>
        </div>
        <div className="document-actions">
          <span className={`proposal-status ${document.status === "Uploaded" ? "completed" : ""}`}>
            {document.status}
          </span>
          <button className="secondary-button" type="button" onClick={() => attachMockDocument(document.id)}>
            {document.status === "Uploaded" ? "Replace" : "Attach"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <section className="form-card document-step">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Step 6</p>
          <h3>Supporting Documents</h3>
          <p>Attach mandatory and optional documents required before payment and policy issuance.</p>
        </div>
        <button className="primary-button" type="button" onClick={addMoreDocument}>
          Attach More Documents
        </button>
      </div>

      <div className="document-summary">
        <div>
          <span>Mandatory Documents</span>
          <strong>{requiredDocuments.length}</strong>
        </div>
        <div>
          <span>Pending Mandatory</span>
          <strong>{pendingRequired}</strong>
        </div>
        <div>
          <span>Optional Documents</span>
          <strong>{optionalDocuments.length}</strong>
        </div>
      </div>

      <div className="document-section">
        <h4>Mandatory Documents List</h4>
        <div className="document-list">{requiredDocuments.map(renderDocumentCard)}</div>
      </div>

      <div className="document-section">
        <h4>Optional Documents List</h4>
        <div className="document-list">{optionalDocuments.map(renderDocumentCard)}</div>
      </div>
    </section>
  );
}

function PaymentStep({ policy, paymentDetails, onPaymentChange, paymentConfirmed, onConfirmPayment }) {
  const amountDue = Number(policy.contribution_amount || 0);
  const annualizedContribution = getAnnualizedContribution(policy);

  return (
    <section className="form-card payment-step">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Step 7</p>
          <h3>Payment</h3>
          <p>Collect the initial contribution and confirm payment before policy issuance.</p>
        </div>
        <span className={`proposal-status ${paymentConfirmed ? "completed" : ""}`}>
          {paymentConfirmed ? "Payment Confirmed" : "Awaiting Payment"}
        </span>
      </div>

      <div className="payment-layout">
        <div className="payment-summary-card">
          <h4>Payment Summary</h4>
          <div className="summary-table">
            <div><span>Product</span><strong>{policy.product_name}</strong></div>
            <div><span>Currency</span><strong>{policy.currency}</strong></div>
            <div><span>Premium Frequency</span><strong>{policy.premium_frequency}</strong></div>
            <div><span>Amount Due Now</span><strong>{formatCurrency(amountDue, policy.currency)}</strong></div>
            <div><span>Annualized Contribution</span><strong>{formatCurrency(annualizedContribution, policy.currency)}</strong></div>
            <div><span>Payment Status</span><strong>{paymentConfirmed ? "Received" : "Pending"}</strong></div>
          </div>
        </div>

        <div className="payment-form-card">
          <h4>Payment Details</h4>
          <div className="form-grid proposal-section-grid">
            <SelectField
              label="Payment Method"
              value={paymentDetails.method}
              options={["Credit Card", "Direct Debit", "Bank Transfer", "Cheque"]}
              onChange={(value) => onPaymentChange({ ...paymentDetails, method: value })}
            />
            <TextField
              label="Payer Name"
              value={paymentDetails.payerName}
              onChange={(value) => onPaymentChange({ ...paymentDetails, payerName: value })}
            />
            <SelectField
              label="Bank Name"
              value={paymentDetails.bankName}
              options={["Emirates NBD", "First Abu Dhabi Bank", "ADCB", "Dubai Islamic Bank", "Mashreq Bank"]}
              onChange={(value) => onPaymentChange({ ...paymentDetails, bankName: value })}
            />
            <TextField
              label="Payment Reference"
              value={paymentDetails.reference}
              onChange={(value) => onPaymentChange({ ...paymentDetails, reference: value })}
            />
            <TextField
              label="Receipt Email"
              type="email"
              value={paymentDetails.receiptEmail}
              onChange={(value) => onPaymentChange({ ...paymentDetails, receiptEmail: value })}
            />
            <TextField
              label="Authorization Code"
              value={paymentDetails.authorizationCode}
              onChange={(value) => onPaymentChange({ ...paymentDetails, authorizationCode: value })}
            />
          </div>

          <button className="primary-button" type="button" onClick={onConfirmPayment}>
            Confirm Payment
          </button>
        </div>
      </div>
    </section>
  );
}

function PolicyIssuedStep({ firstLife, secondLife, secondLifeSelection, policy, riders, documents, paymentDetails }) {
  const annualizedContribution = getAnnualizedContribution(policy);
  const uploadedDocuments = documents.filter((document) => document.status === "Uploaded");
  const policyNumber = "POL-UAE-2026-004281";
  const issueDate = new Date().toLocaleDateString("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  function downloadIssuedDocument(documentType) {
    const lines = [
      `${documentType}`,
      `Policy Number: ${policyNumber}`,
      `Policy Holder: ${firstLife.full_name}`,
      `Product: ${policy.product_name}`,
      `Issue Date: ${issueDate}`,
      `Initial Contribution: ${formatCurrency(policy.contribution_amount, policy.currency)}`,
      `Annualized Contribution: ${formatCurrency(annualizedContribution, policy.currency)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentType.toLowerCase().replaceAll(" ", "-")}-${policyNumber.toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="form-card success-step">
      <div className="success-hero">
        <div>
          <span>Policy Issued Successfully</span>
          <h3>{policyNumber}</h3>
          <p>All proposal, document, and payment steps are complete. The policy is active from the issue date below.</p>
        </div>
        <div className="issued-download-actions">
          <button className="secondary-button" type="button" onClick={() => downloadIssuedDocument("Policy Documents")}>
            Download Policy Documents
          </button>
          <button className="secondary-button" type="button" onClick={() => downloadIssuedDocument("Illustration Documents")}>
            Download Illustration Documents
          </button>
        </div>
      </div>

      <div className="issued-summary-grid">
        <article>
          <h4>Policy Details</h4>
          <div className="summary-table">
            <div><span>Policy Number</span><strong>{policyNumber}</strong></div>
            <div><span>Status</span><strong>Issued</strong></div>
            <div><span>Issue Date</span><strong>{issueDate}</strong></div>
            <div><span>Product Name</span><strong>{policy.product_name}</strong></div>
            <div><span>Plan Term</span><strong>{policy.plan_term} years</strong></div>
            <div><span>Contribution Term</span><strong>{policy.contribution_term} years</strong></div>
          </div>
        </article>

        <article>
          <h4>Contribution Details</h4>
          <div className="summary-table">
            <div><span>Currency</span><strong>{policy.currency}</strong></div>
            <div><span>Frequency</span><strong>{policy.premium_frequency}</strong></div>
            <div><span>Initial Contribution</span><strong>{formatCurrency(policy.contribution_amount, policy.currency)}</strong></div>
            <div><span>Annualized Contribution</span><strong>{formatCurrency(annualizedContribution, policy.currency)}</strong></div>
            <div><span>Payment Method</span><strong>{paymentDetails.method}</strong></div>
            <div><span>Payment Reference</span><strong>{paymentDetails.reference}</strong></div>
          </div>
        </article>

        <article>
          <h4>Life Assured Details</h4>
          <div className="summary-table">
            <div><span>First Life</span><strong>{firstLife.full_name}</strong></div>
            <div><span>Age / Gender</span><strong>{calculateAge(firstLife.dob)} / {firstLife.gender}</strong></div>
            <div><span>Nationality</span><strong>{firstLife.nationality}</strong></div>
            <div><span>Second Life</span><strong>{secondLifeSelection === "Yes" ? secondLife.full_name : "Not Applicable"}</strong></div>
            <div><span>Residency</span><strong>{firstLife.residency_country}</strong></div>
            <div><span>Smoker Status</span><strong>{firstLife.smoker_status}</strong></div>
          </div>
        </article>

        <article>
          <h4>Benefits and Documents</h4>
          <div className="summary-table">
            <div><span>Benefits Configured</span><strong>{riders.length}</strong></div>
            <div><span>Main Benefit SI</span><strong>{formatCurrency(riders[0]?.benefit_value || 0, policy.currency)}</strong></div>
            <div><span>Documents Uploaded</span><strong>{uploadedDocuments.length} / {documents.length}</strong></div>
            <div><span>Underwriting Decision</span><strong>Standard Accepted</strong></div>
            <div><span>Servicing Branch</span><strong>Dubai</strong></div>
            <div><span>Distributor</span><strong>Aura Wealth Distribution</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

function LoginPage({ portal, onLogin }) {
  const isDistributor = portal === "distributor";
  const portalTitle = isDistributor ? "Distributor Portal" : "Underwriter Portal";
  const helperText = isDistributor
    ? "Access quote creation, illustrations, policy pipeline, and distributor performance metrics."
    : "Access underwriting referrals, risk review, evidence tracking, and decision capture.";
  const [credentials, setCredentials] = useState({
    email: isDistributor ? "distributor@life.test" : "underwriter@life.test",
    password: "prototype",
  });

  function updateCredential(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="login-page">
      <section className={`login-card ${isDistributor ? "" : "underwriter-login"}`}>
        <div>
          <p className="eyebrow">{isDistributor ? "Distributor access" : "Underwriter access"}</p>
          <h1>
            {portalTitle}
            <span>Login</span>
          </h1>
          <p>{helperText}</p>
        </div>

        <div className="login-form">
          <TextField
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(value) => updateCredential("email", value)}
          />
          <TextField
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(value) => updateCredential("password", value)}
          />
          <button className="primary-button" type="button" onClick={onLogin}>
            Login to {isDistributor ? "Distributor" : "Underwriter"} Portal
          </button>
        </div>
      </section>
    </main>
  );
}

function QuoteApplicationPage({ onBack }) {
  const [firstLife, setFirstLife] = useState(uaeMockFirstLife);
  const [secondLife, setSecondLife] = useState(uaeMockSecondLife);
  const [secondLifeSelection, setSecondLifeSelection] = useState("Yes");
  const [policy, setPolicy] = useState(uaeMockPolicy);
  const [riders, setRiders] = useState(() =>
    dropdownMetadata.benefit_type.options.map((benefitType) =>
      benefitType === uaeMockRider.benefit_type ? uaeMockRider : createDefaultBenefitRider(benefitType)
    )
  );
  const [supportingDocuments, setSupportingDocuments] = useState(mockSupportingDocuments);
  const [paymentDetails, setPaymentDetails] = useState({
    method: "Credit Card",
    payerName: "Omar Al Mansoori",
    bankName: "Emirates NBD",
    reference: "PAY-2026-004281",
    receiptEmail: "omar.almansoori@example.ae",
    authorizationCode: "AUTH-582914",
  });
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [warningMessages, setWarningMessages] = useState([]);
  const validationMessages = validateQuote(firstLife, secondLife, policy);
  const missingMandatoryDocuments = supportingDocuments.filter(
    (document) => document.required && document.status !== "Uploaded"
  );
  const steps = [
    { number: "1", title: "Life Assured", description: "Customer details" },
    { number: "2", title: "Policy Details", description: "Product and premium" },
    { number: "3", title: "Riders", description: "Benefits and loadings" },
    { number: "4", title: "Illustrations", description: "Values and graph" },
    { number: "5", title: "Proposals", description: "Forms and downloads" },
    { number: "6", title: "Documents", description: "Mandatory and optional" },
    { number: "7", title: "Payment", description: "Collect contribution" },
    { number: "8", title: "Issued", description: "Policy summary" },
  ];

  function updateSecondLifeSelection(value) {
    setSecondLifeSelection(value);

    if (value !== "Yes") {
      setSecondLife(blankLife);
    }
  }

  function navigateToStep(stepNumber) {
    if (stepNumber > activeStep && validationMessages.length > 0) {
      setWarningMessages(validationMessages);
      return;
    }

    if (stepNumber > 6 && missingMandatoryDocuments.length > 0) {
      setWarningMessages(
        missingMandatoryDocuments.map((document) => `${document.name} is mandatory and must be uploaded.`)
      );
      return;
    }

    if (stepNumber > 7 && !paymentConfirmed) {
      setWarningMessages(["Please confirm payment before issuing the policy."]);
      return;
    }

    setActiveStep(stepNumber);
  }

  return (
    <main className="portal quote-page">
      <section className="quote-builder">
        <div className="section-heading sticky-heading">
          <div>
            <p className="eyebrow">New quote</p>
            <h2>Life Insurance Application</h2>
          </div>
          <button className="secondary-button" type="button" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>

        <nav className="application-stepper" aria-label="Application steps">
          {steps.map((step) => (
            <button
              className={`stepper-item ${activeStep === Number(step.number) ? "active" : ""}`}
              key={step.number}
              type="button"
              onClick={() => navigateToStep(Number(step.number))}
            >
              <span>{step.number}</span>
              <div>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </div>
            </button>
          ))}
        </nav>

        {activeStep === 1 && (
          <>
            <LifeForm
              title="Step 1 - Customer / Life Assured Details: First Life"
              life={firstLife}
              onChange={setFirstLife}
              secondLifeSelection={secondLifeSelection}
              onSecondLifeSelectionChange={updateSecondLifeSelection}
            />
            {secondLifeSelection === "Yes" && (
              <LifeForm title="Second Life Details" life={secondLife} onChange={setSecondLife} optional />
            )}
          </>
        )}
        {activeStep === 2 && <PolicyDetails policy={policy} onChange={setPolicy} />}
        {activeStep === 3 && <RiderConfiguration riders={riders} onChange={setRiders} />}
        {activeStep === 4 && <IllustrationStep policy={policy} riders={riders} />}
        {activeStep === 5 && (
          <ProposalStep
            firstLife={firstLife}
            secondLife={secondLife}
            secondLifeSelection={secondLifeSelection}
            policy={policy}
          />
        )}
        {activeStep === 6 && (
          <SupportingDocumentsStep documents={supportingDocuments} onChange={setSupportingDocuments} />
        )}
        {activeStep === 7 && (
          <PaymentStep
            policy={policy}
            paymentDetails={paymentDetails}
            onPaymentChange={setPaymentDetails}
            paymentConfirmed={paymentConfirmed}
            onConfirmPayment={() => setPaymentConfirmed(true)}
          />
        )}
        {activeStep === 8 && (
          <PolicyIssuedStep
            firstLife={firstLife}
            secondLife={secondLife}
            secondLifeSelection={secondLifeSelection}
            policy={policy}
            riders={riders}
            documents={supportingDocuments}
            paymentDetails={paymentDetails}
          />
        )}

        <div className="step-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={activeStep === 1}
            onClick={() => navigateToStep(activeStep - 1)}
          >
            Previous
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={activeStep === steps.length}
            onClick={() => navigateToStep(activeStep + 1)}
          >
            Next
          </button>
        </div>

        {warningMessages.length > 0 && (
          <div className="modal-backdrop" role="presentation">
            <div className="warning-modal" role="alertdialog" aria-modal="true" aria-labelledby="warning-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Warning</p>
                  <h3 id="warning-title">Please resolve these validations</h3>
                </div>
                <button className="link-button" type="button" onClick={() => setWarningMessages([])}>
                  Close
                </button>
              </div>
              <ul>
                {warningMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
              <button className="primary-button" type="button" onClick={() => setWarningMessages([])}>
                Got it
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function MetricBarChart({ data }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const max = Math.max(...data);

  return (
    <div className="bar-chart" role="img" aria-label="Daily metric values">
      {data.map((value, index) => (
        <div className="bar-chart-item" key={`${days[index]}-${value}`}>
          <small>{value}</small>
          <span style={{ height: `${Math.max((value / max) * 58, 8)}px` }} />
          <em>{days[index]}</em>
        </div>
      ))}
    </div>
  );
}

function DetailsTable({ rows }) {
  return (
    <div className="detail-table">
      {rows.map((row) => (
        <div key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value || "Not specified"}</strong>
        </div>
      ))}
    </div>
  );
}

function DashboardDetailsPage({ item, type, onBack }) {
  const annualizedContribution = getAnnualizedContribution(uaeMockPolicy);
  const defaultRiders = dropdownMetadata.benefit_type.options.map((benefitType) =>
    benefitType === uaeMockRider.benefit_type ? uaeMockRider : createDefaultBenefitRider(benefitType)
  );
  const uploadedDocuments = mockSupportingDocuments.filter((document) => document.status === "Uploaded");
  const detailSteps = [
    { number: "1", title: "Life Assured", description: "Customer details" },
    { number: "2", title: "Policy Details", description: "Product and premium" },
    { number: "3", title: "Riders", description: "Benefits and loadings" },
    { number: "4", title: "Illustrations", description: "Values and graph" },
    { number: "5", title: "Proposals", description: "Forms and downloads" },
    { number: "6", title: "Documents", description: "Mandatory and optional" },
    { number: "7", title: "Payment", description: "Collect contribution" },
    { number: "8", title: "Issued", description: "Policy summary" },
  ];
  const activeDetailStep = type === "policy" ? 8 : type === "referral" ? 6 : item.status === "Illustration Ready" ? 4 : 5;
  const pageTitle = type === "policy" ? "Policy Details" : type === "referral" ? "Referral Details" : "Quote Details";
  const recordLabel = type === "policy" ? "Policy" : type === "referral" ? "Referral" : "Quote";

  return (
    <main className="portal details-page">
      <section className="detail-progress-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{recordLabel} workspace</p>
            <h2>{pageTitle}</h2>
            <p>{item.id} - {item.customer}</p>
          </div>
          <button className="secondary-button" type="button" onClick={onBack}>
            Back to Workspace
          </button>
        </div>

        <nav className="application-stepper detail-stepper" aria-label={`${recordLabel} progress steps`}>
          {detailSteps.map((step) => {
            const stepNumber = Number(step.number);
            const isCompleted = stepNumber < activeDetailStep;
            const isActive = stepNumber === activeDetailStep;

            return (
              <button
                className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                key={step.number}
                type="button"
                disabled
              >
                <span>{isCompleted ? "✓" : step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <small>{isCompleted ? "Completed" : step.description}</small>
                </div>
              </button>
            );
          })}
        </nav>
      </section>

      <section className="detail-section-card">
        <h3>{recordLabel} Information</h3>
        <DetailsTable
          rows={[
            { label: `${recordLabel} Reference`, value: item.id },
            { label: "Current Status", value: item.status },
            { label: "Last Updated", value: item.updated },
            { label: "Distributor", value: "Aura Wealth Distribution" },
            { label: "Channel", value: "Distributor Portal" },
            { label: "Servicing Branch", value: "Dubai" },
          ]}
        />
      </section>

      <section className="detail-section-card">
        <h3>Customer / Life Assured Information</h3>
        <DetailsTable
          rows={[
            { label: "First Life Full Name", value: uaeMockFirstLife.full_name },
            { label: "Date of Birth", value: uaeMockFirstLife.dob },
            { label: "Age", value: calculateAge(uaeMockFirstLife.dob) },
            { label: "Gender", value: uaeMockFirstLife.gender },
            { label: "Smoker Status", value: uaeMockFirstLife.smoker_status },
            { label: "Residency Country", value: uaeMockFirstLife.residency_country },
            { label: "Nationality", value: uaeMockFirstLife.nationality },
            { label: "Second Life Full Name", value: uaeMockSecondLife.full_name },
            { label: "Second Life DOB / Age", value: `${uaeMockSecondLife.dob} / ${calculateAge(uaeMockSecondLife.dob)}` },
          ]}
        />
      </section>

      <section className="detail-section-card">
        <h3>Policy and Contribution Details</h3>
        <DetailsTable
          rows={[
            { label: "Product Name", value: uaeMockPolicy.product_name },
            { label: "Currency", value: uaeMockPolicy.currency },
            { label: "Premium Frequency", value: uaeMockPolicy.premium_frequency },
            { label: "Contribution Amount", value: formatCurrency(uaeMockPolicy.contribution_amount, uaeMockPolicy.currency) },
            { label: "Annualized Contribution", value: formatCurrency(annualizedContribution, uaeMockPolicy.currency) },
            { label: "Contribution Term", value: `${uaeMockPolicy.contribution_term} years` },
            { label: "Plan Term", value: `${uaeMockPolicy.plan_term} years` },
            { label: "Projection Scenario", value: uaeMockPolicy.projection_scenario },
            { label: "Growth Rate Assumption", value: uaeMockPolicy.growth_rate_assumption },
          ]}
        />
      </section>

      <section className="detail-section-card">
        <h3>Benefit / Rider Details</h3>
        <div className="detail-benefit-list">
          {defaultRiders.map((rider) => (
            <div className="detail-benefit-row" key={rider.benefit_type}>
              <strong>{rider.rider_name}</strong>
              <span>{rider.applicability}</span>
              <span>SI: {formatCurrency(rider.benefit_value || rider.rider_sum_assured || 0, uaeMockPolicy.currency)}</span>
              <span>{rider.protected_contribution_term ? `Protected Term: ${rider.protected_contribution_term}` : "Standard"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section-card">
        <h3>Documents and Payment</h3>
        <DetailsTable
          rows={[
            { label: "Mandatory Documents", value: mockSupportingDocuments.filter((document) => document.required).length },
            { label: "Uploaded Documents", value: `${uploadedDocuments.length} / ${mockSupportingDocuments.length}` },
            { label: "Pending Documents", value: mockSupportingDocuments.filter((document) => document.status !== "Uploaded").length },
            { label: "Payment Method", value: "Credit Card" },
            { label: "Payment Reference", value: type === "policy" ? "PAY-2026-004281" : "Pending issuance" },
            { label: "Initial Payment Status", value: type === "policy" ? "Received" : "Pending" },
          ]}
        />
      </section>

      <section className="detail-section-card">
        <h3>{type === "referral" ? "Referral / Underwriting Details" : "Processing Details"}</h3>
        <DetailsTable
          rows={[
            { label: "Underwriting Status", value: item.status.includes("Underwriter") ? "Underwriter Review" : "Not referred" },
            { label: "Risk Category", value: type === "referral" ? "Medium" : "Standard" },
            { label: "Decision", value: type === "policy" ? "Standard Accepted" : "Pending" },
            { label: "Evidence Requirement", value: type === "referral" ? "Medical evidence and residency confirmation" : "Standard KYC and signed illustration" },
            { label: "SLA", value: type === "referral" ? "1.8 days average" : "Within target" },
            { label: "Next Action", value: type === "policy" ? "Policy servicing" : "Complete pending documents and submit" },
          ]}
        />
      </section>
    </main>
  );
}

function DistributorPortal({ onCreateQuote }) {
  const [activeDashboardTab, setActiveDashboardTab] = useState("quotes");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [workspaceStatusFilter, setWorkspaceStatusFilter] = useState("All statuses");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const metrics = [
    { label: "Active Quotes", value: "42", trend: "+12% this month", series: [25, 29, 31, 34, 36, 39, 42] },
    { label: "Policies Issued", value: "18", trend: "AED 2.4M cover", series: [8, 9, 11, 10, 14, 16, 18] },
    { label: "Pending UW", value: "7", trend: "Avg 1.8 days", series: [11, 10, 8, 9, 7, 8, 7] },
    { label: "Conversion", value: "31%", trend: "+4 pts", series: [22, 24, 25, 27, 26, 29, 31] },
  ];
  const dashboardTabs = [
    { id: "quotes", label: "Quotes" },
    { id: "policies", label: "Policies" },
    { id: "referrals", label: "Referrals" },
  ];
  const statusOptions = ["All statuses", ...new Set(initialQuotes.map((item) => item.status))];
  const tableItems = initialQuotes.filter((item) => {
    if (activeDashboardTab === "quotes") return item.id.startsWith("Q-");
    if (activeDashboardTab === "policies") return item.id.startsWith("P-");
    return item.status.includes("Underwriter");
  }).filter((item) => {
    const searchText = `${item.id} ${item.customer} ${item.product} ${item.status}`.toLowerCase();
    const matchesSearch = searchText.includes(workspaceSearch.toLowerCase());
    const matchesStatus = workspaceStatusFilter === "All statuses" || item.status === workspaceStatusFilter;

    return matchesSearch && matchesStatus;
  });
  const detailType = activeDashboardTab === "policies" ? "policy" : activeDashboardTab === "referrals" ? "referral" : "quote";

  if (selectedDetail) {
    return (
      <DashboardDetailsPage
        item={selectedDetail.item}
        type={selectedDetail.type}
        onBack={() => setSelectedDetail(null)}
      />
    );
  }

  return (
    <main className="portal">
      <div className="distributor-dashboard">
        <div className="distributor-main">
          <section className="dashboard-intro">
            <div>
              <p className="eyebrow">Distributor portal</p>
              <h1>Quote and policy workspace</h1>
              <p>Track pipeline performance, create illustrations, and prepare cases for underwriting.</p>
            </div>
            <button className="primary-button" type="button" onClick={onCreateQuote}>
              Create New Quote
            </button>
          </section>

          <section className="metric-row" aria-label="Distributor metrics">
            {metrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <div>
                  <span>{metric.label}</span>
                  <div className="metric-value-row">
                    <strong>{metric.value}</strong>
                    <small>{metric.trend}</small>
                  </div>
                </div>
                <MetricBarChart data={metric.series} />
              </article>
            ))}
          </section>

          <section className="panel">
            <div className="workspace-toolbar">
              <div className="dashboard-tabs" role="tablist" aria-label="Business workspace tabs">
                {dashboardTabs.map((tab) => (
                  <button
                    className={activeDashboardTab === tab.id ? "active" : ""}
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeDashboardTab === tab.id}
                    onClick={() => setActiveDashboardTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="workspace-controls">
                <label>
                  <span>Search</span>
                  <input
                    type="search"
                    placeholder="Search customer, ref, product"
                    value={workspaceSearch}
                    onChange={(event) => setWorkspaceSearch(event.target.value)}
                  />
                </label>
                <label>
                  <span>Filter</span>
                  <select
                    value={workspaceStatusFilter}
                    onChange={(event) => setWorkspaceStatusFilter(event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="table">
              <div className="table-row table-head">
                <span>Reference</span>
                <span>Customer</span>
                <span>Product</span>
                <span>Premium</span>
                <span>Status</span>
                <span>Updated</span>
                <span>Actions</span>
              </div>
              {tableItems.map((quote) => (
                <div className="table-row" key={quote.id}>
                  <span>{quote.id}</span>
                  <span>{quote.customer}</span>
                  <span>{quote.product}</span>
                  <span>{quote.premium}</span>
                  <span>
                    <span className="status-dot" />
                    {quote.status}
                  </span>
                  <span>{quote.updated}</span>
                  <span>
                    <button
                      className="table-action-button"
                      type="button"
                      onClick={() => setSelectedDetail({ item: quote, type: detailType })}
                    >
                      View Details
                    </button>
                  </span>
                </div>
              ))}
              {tableItems.length === 0 && <div className="empty-state">No records in this tab.</div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function UnderwriterPortal() {
  const cases = [
    {
      id: "UW-2103",
      applicant: "Aarav Mehta",
      product: "SecureLife Protector",
      risk: "Medium",
      checks: "Medical evidence pending",
    },
    {
      id: "UW-2102",
      applicant: "Fatima Khan",
      product: "Takaful Family Shield",
      risk: "High",
      checks: "Residency referral",
    },
    {
      id: "UW-2101",
      applicant: "Lina Santos",
      product: "FutureWealth Life",
      risk: "Low",
      checks: "Ready for decision",
    },
  ];

  return (
    <main className="portal">
      <div className="hero underwriter">
        <div>
          <p className="eyebrow">Underwriter portal</p>
          <h1>Risk review and decisions</h1>
          <p>Prioritize referrals, inspect validation flags, and record underwriting outcomes.</p>
        </div>
        <button className="primary-button" type="button">
          Open Work Queue
        </button>
      </div>

      <section className="metric-grid">
        <article className="metric-card">
          <span>Open Referrals</span>
          <strong>13</strong>
          <small>5 high priority</small>
        </article>
        <article className="metric-card">
          <span>Approved Today</span>
          <strong>6</strong>
          <small>2 with loadings</small>
        </article>
        <article className="metric-card">
          <span>SLA Breach Risk</span>
          <strong>3</strong>
          <small>Due in 4 hours</small>
        </article>
        <article className="metric-card">
          <span>Avg Decision Time</span>
          <strong>1.6d</strong>
          <small>-8% vs last week</small>
        </article>
      </section>

      <section className="panel split-panel">
        <div>
          <div className="section-heading">
            <h2>Underwriting Queue</h2>
            <span className="pill subtle">Risk sorted</span>
          </div>
          <div className="case-list">
            {cases.map((item) => (
              <article className="case-card" key={item.id}>
                <div>
                  <strong>{item.id}</strong>
                  <p>{item.applicant}</p>
                  <small>{item.product}</small>
                </div>
                <span className={`risk risk-${item.risk.toLowerCase()}`}>{item.risk}</span>
                <p>{item.checks}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="decision-panel">
          <h3>Decision Capture</h3>
          <label className="field">
            <span>Decision</span>
            <select defaultValue="Request Evidence">
              <option>Approve Standard</option>
              <option>Approve With Loading</option>
              <option>Postpone</option>
              <option>Decline</option>
              <option>Request Evidence</option>
            </select>
          </label>
          <label className="field">
            <span>Underwriting Notes</span>
            <textarea defaultValue="Awaiting medical report and residency confirmation." />
          </label>
          <button className="primary-button" type="button">
            Save Decision
          </button>
        </aside>
      </section>
    </main>
  );
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <span>Powered by</span>
      <img src="/aura-logo.png" alt="Aura" />
    </footer>
  );
}

export default function App() {
  const [activePortal, setActivePortal] = useState("distributor");
  const [authenticatedPortals, setAuthenticatedPortals] = useState({
    distributor: false,
    underwriter: false,
  });
  const [distributorPage, setDistributorPage] = useState("dashboard");

  function switchPortal(portal) {
    setActivePortal(portal);
    setDistributorPage("dashboard");
  }

  function loginToPortal() {
    setAuthenticatedPortals((current) => ({ ...current, [activePortal]: true }));
  }

  function logoutFromPortal() {
    setAuthenticatedPortals((current) => ({ ...current, [activePortal]: false }));
    setDistributorPage("dashboard");
  }

  const isAuthenticated = authenticatedPortals[activePortal];

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div>
          <img className="brand-logo" src="/salama-logo-transparent.png" alt="Salama" />
          <strong>Life Insurance</strong>
        </div>
        {!isAuthenticated && (
          <div className="portal-switcher">
            <button
              className={activePortal === "distributor" ? "active" : ""}
              type="button"
              onClick={() => switchPortal("distributor")}
            >
              Distributor Portal
            </button>
            <button
              className={activePortal === "underwriter" ? "active" : ""}
              type="button"
              onClick={() => switchPortal("underwriter")}
            >
              Underwriter Portal
            </button>
          </div>
        )}
        {isAuthenticated && (
          <button className="secondary-button nav-action" type="button" onClick={logoutFromPortal}>
            Logout
          </button>
        )}
      </nav>
      {!isAuthenticated && (
        <LoginPage key={activePortal} portal={activePortal} onLogin={loginToPortal} />
      )}
      {isAuthenticated && activePortal === "distributor" && distributorPage === "dashboard" && (
        <DistributorPortal onCreateQuote={() => setDistributorPage("newQuote")} />
      )}
      {isAuthenticated && activePortal === "distributor" && distributorPage === "newQuote" && (
        <QuoteApplicationPage onBack={() => setDistributorPage("dashboard")} />
      )}
      {isAuthenticated && activePortal === "underwriter" && <UnderwriterPortal />}
      <AppFooter />
    </div>
  );
}
