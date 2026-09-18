export type BusinessCategory =
  | "Dairy"
  | "Textile"
  | "Grocery Retail"
  | "Food Processing"
  | "Small Manufacturing";

export interface LocationData {
  village: string;
  block: string;
  district: string;
  state: string;
  pincode?: string;
  provenance?: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  max_score: number;
  assessment?: string;
  detail?: string;
}

export interface EvidenceAuditItem {
  label: string;
  status: "VERIFIED" | "LIMITATION" | "VALIDATE" | "UNVERIFIED";
  icon: string;
}

export interface DecisionSnapshot {
  go_no_go: {
    score: number;
    name: string;
    meaning: string;
    supported_dimensions: DimensionScore[];
    data_classification: string;
  };
  credibility: {
    score: number;
    name: string;
    meaning: string;
    dimensions: DimensionScore[];
    evidence_audit: EvidenceAuditItem[];
    limitations: string[];
    data_classification: string;
    note: string;
  };
  note: string;
}

export interface ConsumerPurchasingPower {
  score: number;
  band: "Low" | "Moderate" | "Strong";
  label: string;
  consumer_base: string;
  affordability_evidence: string;
  demand_evidence: string;
  price_sensitivity: string;
  market_accessibility: string;
  category_observations: string;
  data_classification: string;
  limitations: string[];
}

export interface SchemeInfo {
  scheme_name: string;
  interest_rate_percent: number;
  tenure_years: number;
  moratorium_months: number;
  repayment_months: number;
  is_within_ceiling: boolean;
  tier: string;
  source: string;
}

export interface RepaymentMonth {
  month: number;
  repayment_installment_no?: number;
  phase: string;
  principal_paid: number;
  interest_paid: number;
  total_installment: number;
  remaining_balance: number;
}

export interface FinancialPlan {
  margin_capital: {
    value: number;
    formatted: string;
    tier: string;
    source: string;
  };
  project_cost: {
    value: number;
    formatted: string;
    tier: string;
    source: string;
  };
  loan_eligibility: {
    value: number;
    formatted: string;
    tier: string;
    source: string;
  };
  scheme: SchemeInfo;
  emi: {
    value: number;
    formatted: string;
    frequency: string;
    repayment_months: number;
    tier: string;
    source: string;
  };
  working_capital: {
    value: number;
    formatted: string;
    ratio_percent: number;
    tier: string;
    source: string;
  };
  repayment_schedule: RepaymentMonth[];
  calculation_status: string;
}

export interface ProductBenchmark {
  product_name: string;
  unit: string;
  min_price: number;
  max_price: number;
  recommended_price: number;
  tier: string;
  source: string;
}

export interface FeasibilityDetails {
  market_reach: {
    population: { value: number; formatted: string; tier: string; source: string };
    households: { value: number; formatted: string; tier: string; source: string };
    reachable_customers: { value: number; formatted: string; tier: string; formula: string };
    distribution_channels: { channels: string[]; tier: string };
  };
  competitor_mapping: {
    registered_businesses: { value: number; tier: string; source: string };
    density_per_1k_households: { value: number; formatted: string; tier: string };
    competition_level: { value: string; interpretation: string; tier: string };
  };
  product_market_value: {
    category: string;
    products: ProductBenchmark[];
    purchasing_power_context: {
      district_per_capita_income_inr: number;
      district_per_capita_formatted: string;
      rural_daily_wage_unskilled: string;
      rural_daily_wage_skilled: string;
      nearest_mandi_distance_km: number;
      tier: string;
    };
  };
  opportunity: {
    potential_opportunity: string;
    reasoning: string;
    suggested_niches: string[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  threats: Array<{
    threat: string;
    risk_level: string;
    explanation: string;
    mitigation: string;
  }>;
}

export interface RecommendationInfo {
  status: "RECOMMENDED" | "RECOMMENDED WITH MODIFICATIONS" | "HIGH RISK / RECONSIDER";
  status_tier: string;
  summary_explanation: string;
  key_reasons: string[];
  major_risks: string[];
  suggested_action: string;
  validation_checks: string[];
  quantitative_engine_check: {
    status: string;
    key_factors: string[];
    major_risks: string[];
    decision_basis: string;
  };
  narrative_tier: string;
}

export interface AssessmentReport {
  project: string;
  version: string;
  location: LocationData;
  input: {
    category: BusinessCategory;
    capital: number;
    capital_formatted: string;
    description: string;
    user_confidence: string;
  };
  decision_snapshot: DecisionSnapshot;
  recommendation: RecommendationInfo;
  hyper_local: {
    location_level: string;
    consumer_purchasing_power: ConsumerPurchasingPower;
  };
  financial_plan: FinancialPlan;
  feasibility: FeasibilityDetails;
}

export interface WhatIfResponse {
  current_financials: FinancialPlan;
  new_financials: FinancialPlan;
  deltas: {
    capital: number;
    capital_formatted: string;
    project_cost: number;
    project_cost_formatted: string;
    loan: number;
    loan_formatted: string;
    emi: number;
    emi_formatted: string;
    working_capital: number;
    working_capital_formatted: string;
    scheme_changed: boolean;
    previous_scheme: string;
    new_scheme: string;
    recalculated_go_no_go: number;
  };
  recalculated_scores: {
    go_no_go: { score: number; [key: string]: any };
    credibility: { score: number; [key: string]: any };
  };
  score_independence_explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "veya";
  text: string;
  timestamp: string;
}
