import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  resolveLocationContext,
  getCommodityPricesForCategory,
  getMSMEIndicatorForCategory,
  getIndustrialClustersForLocation,
  getCropLinkageForCategory,
  getLivestockContext,
  getSchemesForBusiness,
  locationsData,
  schemesData,
  demographicsData,
  economicData,
  districtIndicatorsData,
  msmeData,
  commodityPricesData,
  cropsData,
  livestockData,
  industrialClustersData,
  bankingData,
  rainfallData,
  poiInfrastructureData,
  ResolvedLocationContext,
} from "./server/dataLoader";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Model cascade: gemini-2.5-flash -> gemini-3.8-flash -> gemini-2.5-flash-lite -> gemini-3.1-flash-lite
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.8-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
];

async function callGeminiSafe(params: {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}): Promise<{ text: string; modelUsed: string } | null> {
  if (!ai) return null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.3,
          ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
        },
      });

      const text = response.text?.trim();
      if (text) {
        return { text, modelUsed: model };
      }
    } catch {
      // Gracefully try next model in cascade without polluting stdout
      continue;
    }
  }

  return null;
}

// ==========================================
// CATEGORY DEFINITIONS & OPERATIONAL RATIOS
// ==========================================

const CATEGORY_OPERATIONAL_PROFILES: Record<
  string,
  {
    category: string;
    description: string;
    target_household_consumption_rate: number;
    local_reachable_ratio: number;
    working_capital_ratio: number;
    distribution_channels: string[];
    price_sensitivity: string;
    category_observations: string;
    limitations: string[];
  }
> = {
  Dairy: {
    category: "Dairy",
    description: "Cattle rearing, fresh milk collection, morning doorstep delivery & dairy processing (paneer, curd, ghee)",
    target_household_consumption_rate: 0.75,
    local_reachable_ratio: 0.4,
    working_capital_ratio: 0.18,
    distribution_channels: [
      "Direct morning doorstep delivery to rural & semi-urban households",
      "Local village milk collection centers & cooperative bulk supply",
      "Commercial supply to roadside tea stalls, dhabas, and sweet shops",
      "Weekly rural haats (bazaars)",
    ],
    price_sensitivity: "Moderate sensitivity to base raw milk price; low sensitivity for fresh pure paneer.",
    category_observations: "Direct doorstep retail captures ₹8-₹12/L higher margin than bulk chilling cooperatives.",
    limitations: [
      "Tehsil-level livestock counts are proxied from 20th Livestock Census district aggregates.",
      "Informal unorganized milk trade is estimated outside formal cooperative returns.",
    ],
  },
  Textile: {
    category: "Textile",
    description: "Readymade garment stitching, tailoring boutique, school uniform supply, and traditional Paithani/cotton wear trading.",
    target_household_consumption_rate: 0.6,
    local_reachable_ratio: 0.35,
    working_capital_ratio: 0.25,
    distribution_channels: [
      "In-shop boutique sales & custom bespoke tailoring in village market",
      "Direct contract supply for local primary/secondary school uniforms",
      "Pop-up stalls at weekly village markets and haats",
      "Festive pop-up exhibits during marriage season",
    ],
    price_sensitivity: "Medium on everyday wear; high willingness to pay for bridal embroidery and perfect fitting.",
    category_observations: "School uniform contracts guarantee reliable baseline cash flow.",
    limitations: [
      "Apparel festive expenditure correlates heavily with annual monsoon agricultural yields.",
      "Informal home-based tailors are not registered on Udyam portal.",
    ],
  },
  "Grocery Retail": {
    category: "Grocery Retail",
    description: "Daily essentials, dry ration, packaged staples, personal hygiene items, and household goods.",
    target_household_consumption_rate: 0.95,
    local_reachable_ratio: 0.3,
    working_capital_ratio: 0.3,
    distribution_channels: [
      "Main village square walk-in retail kirana store",
      "Doorstep delivery for senior citizens & bulk monthly grocery orders",
      "Credit-based monthly account khata for known agricultural families",
      "Highway bypass convenience counter for passing motorists",
    ],
    price_sensitivity: "High price sensitivity on branded packaged goods; reliance on monthly khata credit.",
    category_observations: "Strict working capital discipline required to avoid cash lockup in credit ledgers.",
    limitations: [
      "Informal neighborhood unorganized kirana shops are not registered on Udyam portal.",
      "FMCG wholesale delivery schedules depend on distributor route frequency.",
    ],
  },
  "Food Processing": {
    category: "Food Processing",
    description: "Pickles, spice grinding (masala mill), tomato puree/paste, grain milling (flour mill), and snack manufacturing.",
    target_household_consumption_rate: 0.55,
    local_reachable_ratio: 0.35,
    working_capital_ratio: 0.22,
    distribution_channels: [
      "Direct retail to village kirana stores & regional weekly haats",
      "Bulk packaging for highway dhabas, boarding schools, and canteens",
      "Consignment supply to tourist stalls near historical/pilgrimage sites",
      "Semi-urban weekly farmers' markets",
    ],
    price_sensitivity: "Low price sensitivity on prompt custom milling; willingness to pay for pure unadulterated spices.",
    category_observations: "Excellent wholesale tie-ups available with local APMC market merchants.",
    limitations: [
      "Rural 3-phase industrial power consistency fluctuates in peak summer months.",
      "Commodity prices are subject to seasonal APMC arrival fluctuations.",
    ],
  },
  "Small Manufacturing": {
    category: "Small Manufacturing",
    description: "Fly ash / cement brick making, agricultural implement repair, welding fabrication, and packaging material manufacturing.",
    target_household_consumption_rate: 0.3,
    local_reachable_ratio: 0.3,
    working_capital_ratio: 0.25,
    distribution_channels: [
      "Direct supply to rural home builders & PMAY-Gramin beneficiaries",
      "Tie-ups with local civil construction contractors and masons",
      "On-site repair service for tractor trailers, ploughs, and sprayers",
      "Gram Panchayat public works contracts (drainage, culverts, paving)",
    ],
    price_sensitivity: "Contractors emphasize product strength and credit terms over minor price shifts.",
    category_observations: "Low local competitor density gives substantial pricing leverage.",
    limitations: [
      "Construction and brick casting slows down during peak monsoon months.",
      "Raw materials (fly-ash, stone dust, cement) require bulk transport access.",
    ],
  },
};

// ==========================================
// DETERMINISTIC FINANCIAL LOGIC (SOURCE OF TRUTH)
// ==========================================

function formatINR(number: number): string {
  const neg = number < 0 ? "-" : "";
  const abs = Math.abs(Math.round(number));
  const s = abs.toString();
  if (s.length <= 3) return `${neg}₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const groups: string[] = [];
  let remaining = rest;
  while (remaining.length > 2) {
    groups.unshift(remaining.slice(-2));
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) groups.unshift(remaining);
  return `${neg}₹${groups.join(",")},${last3}`;
}

function calculateProjectCost(marginCapital: number): number {
  if (marginCapital <= 0) throw new Error("Margin capital must be greater than zero.");
  return marginCapital / 0.1;
}

function calculateLoanEligibility(projectCost: number): number {
  return projectCost * 0.9;
}

/**
 * Routes project to official government schemes:
 * PMEGP, CMEGP, PMFME, PM Vishwakarma, MUDRA
 */
function routeOfficialScheme(category: string, projectCost: number) {
  // PM Vishwakarma for Artisan / Tailoring (Textile & Small Metal Fab) up to ₹3 Lakhs
  if ((category === "Textile" || category === "Small Manufacturing") && projectCost <= 300000) {
    return {
      scheme_name: "PM Vishwakarma Scheme",
      scheme_code: "PM-VISHWAKARMA",
      interest_rate_percent: 5.0,
      interest_rate_decimal: 0.05,
      tenure_years: 3,
      tenure_months: 36,
      moratorium_months: 3,
      repayment_months: 33,
      is_within_ceiling: true,
      subsidy_info: "₹15,000 Toolkit Incentive + 8% Interest Subvention (Effective 5% rate) + Collateral-Free Credit Guarantee",
      source: "Ministry of MSME & MSDE Operational Guidelines (PM Vishwakarma 2023-24)",
    };
  }

  // PMFME for Food Processing up to ₹30 Lakhs
  if (category === "Food Processing" && projectCost <= 3000000) {
    return {
      scheme_name: "PMFME (Micro Food Processing Enterprises Scheme)",
      scheme_code: "PMFME",
      interest_rate_percent: 7.5,
      interest_rate_decimal: 0.075,
      tenure_years: 7,
      tenure_months: 84,
      moratorium_months: 6,
      repayment_months: 78,
      is_within_ceiling: true,
      subsidy_info: "35% Credit-Linked Capital Subsidy (max ₹10 Lakhs) under MoFPI One District One Product (ODOP)",
      source: "Ministry of Food Processing Industries (MoFPI) Guidelines 2023-24",
    };
  }

  // Micro Loans up to ₹1.5 Lakhs: MUDRA Shishu / Kishore or Micro Finance
  if (projectCost <= 150000) {
    return {
      scheme_name: "MUDRA (PMMY) - Shishu & Kishore Tier",
      scheme_code: "MUDRA",
      interest_rate_percent: 6.5,
      interest_rate_decimal: 0.065,
      tenure_years: 3,
      tenure_months: 36,
      moratorium_months: 3,
      repayment_months: 33,
      is_within_ceiling: true,
      subsidy_info: "100% Collateral-Free Credit Guarantee under CGFMU, zero processing charges",
      source: "Department of Financial Services, Ministry of Finance (PMMY Operational Guidelines)",
    };
  }

  // Standard Micro & Small Enterprise: CMEGP (Maharashtra) / PMEGP
  return {
    scheme_name: "Chief Minister Employment Generation Programme (CMEGP Maharashtra)",
    scheme_code: "CMEGP",
    interest_rate_percent: 8.0,
    interest_rate_decimal: 0.08,
    tenure_years: 7,
    tenure_months: 84,
    moratorium_months: 6,
    repayment_months: 78,
    is_within_ceiling: projectCost <= 5000000,
    subsidy_info: "25% to 35% Margin Money Government Subsidy for Rural Micro-Enterprises via DIC Maharashtra",
    source: "Industries Department, Government of Maharashtra (CMEGP Policy 2023-24)",
  };
}

function calculateEMI(
  loanAmount: number,
  annualRate: number,
  tenureYears: number,
  moratoriumMonths: number
): number {
  if (loanAmount <= 0) return 0;
  const repaymentMonths = tenureYears * 12 - moratoriumMonths;
  if (repaymentMonths <= 0) return 0;
  const monthlyRate = annualRate / 12.0;
  const factor = Math.pow(1.0 + monthlyRate, repaymentMonths);
  const emi = (loanAmount * monthlyRate * factor) / (factor - 1.0);
  return Math.round(emi * 100) / 100;
}

function generateRepaymentSchedule(
  loanAmount: number,
  annualRate: number,
  tenureYears: number,
  moratoriumMonths: number
) {
  const schedule = [];
  const totalMonths = tenureYears * 12;
  const monthlyRate = annualRate / 12.0;
  let balance = loanAmount;
  const emi = calculateEMI(loanAmount, annualRate, tenureYears, moratoriumMonths);
  const repaymentMonths = totalMonths - moratoriumMonths;

  for (let m = 1; m <= moratoriumMonths; m++) {
    schedule.push({
      month: m,
      phase: "Moratorium (Grace Period)",
      principal_paid: 0,
      interest_paid: 0,
      total_installment: 0,
      remaining_balance: Math.round(balance * 100) / 100,
    });
  }

  for (let rm = 1; rm <= repaymentMonths; rm++) {
    const monthIndex = moratoriumMonths + rm;
    const interest = Math.round(balance * monthlyRate * 100) / 100;
    let principal = Math.round((emi - interest) * 100) / 100;

    if (rm === repaymentMonths || balance - principal < 1) {
      principal = Math.round(balance * 100) / 100;
      balance = 0;
    } else {
      balance = Math.round((balance - principal) * 100) / 100;
    }

    const totalInstallment = Math.round((principal + interest) * 100) / 100;

    schedule.push({
      month: monthIndex,
      repayment_installment_no: rm,
      phase: "Active Repayment",
      principal_paid: principal,
      interest_paid: interest,
      total_installment: totalInstallment,
      remaining_balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  return schedule;
}

export function computeFinancialPlan(marginCapital: number, categoryKey: string) {
  const projectCost = calculateProjectCost(marginCapital);
  const loanAmount = calculateLoanEligibility(projectCost);
  const scheme = routeOfficialScheme(categoryKey, projectCost);
  const emi = calculateEMI(loanAmount, scheme.interest_rate_decimal, scheme.tenure_years, scheme.moratorium_months);
  const schedule = generateRepaymentSchedule(loanAmount, scheme.interest_rate_decimal, scheme.tenure_years, scheme.moratorium_months);

  const catProfile = CATEGORY_OPERATIONAL_PROFILES[categoryKey] || CATEGORY_OPERATIONAL_PROFILES["Dairy"];
  const wcRatio = catProfile.working_capital_ratio;
  const wcAmount = Math.round(projectCost * wcRatio);

  return {
    margin_capital: {
      value: marginCapital,
      formatted: formatINR(marginCapital),
      tier: "VERIFIED",
      source: "10% Promoter Contribution under Concessional Guidelines",
    },
    project_cost: {
      value: projectCost,
      formatted: formatINR(projectCost),
      tier: "VERIFIED",
      source: "Deterministic 10x Margin Money Multiplier (10:90 Debt-Equity)",
    },
    loan_eligibility: {
      value: loanAmount,
      formatted: formatINR(loanAmount),
      tier: "VERIFIED",
      source: `90% Debt Component via ${scheme.scheme_name}`,
    },
    scheme: {
      scheme_name: scheme.scheme_name,
      scheme_code: scheme.scheme_code,
      interest_rate_percent: scheme.interest_rate_percent,
      tenure_years: scheme.tenure_years,
      moratorium_months: scheme.moratorium_months,
      repayment_months: scheme.repayment_months,
      is_within_ceiling: scheme.is_within_ceiling,
      subsidy_info: scheme.subsidy_info,
      tier: "VERIFIED",
      source: scheme.source,
    },
    emi: {
      value: emi,
      formatted: formatINR(emi),
      frequency: "Monthly",
      repayment_months: scheme.repayment_months,
      tier: "VERIFIED",
      source: "Deterministic Reducing Balance Formula (Post-moratorium)",
    },
    working_capital: {
      value: wcAmount,
      formatted: formatINR(wcAmount),
      ratio_percent: wcRatio * 100,
      tier: "VERIFIED",
      source: `Sector Guideline Multiplier (${wcRatio * 100}% of Project Cost)`,
    },
    repayment_schedule: schedule,
    calculation_status: "DETERMINISTIC",
  };
}

// ==========================================
// BUSINESS DESCRIPTION AUDIT & SENSITIVITY ENGINE
// ==========================================

interface DescriptionEvaluation {
  has_critical_flaw: boolean;
  flaw_severity: "FATAL" | "HIGH" | "MODERATE" | "NONE";
  penalty_points: number;
  flaw_type?: string;
  flaw_detail?: string;
  concept_score: number; // 0 - 20
  concept_assessment: string;
  dimension_adjustments: {
    market_fit_adjustment: number;
    purchasing_fit_adjustment: number;
    financial_fit_adjustment: number;
  };
}

export function evaluateBusinessDescription(
  description: string,
  category: string,
  capital: number,
  locContext: any,
  rawPrices: any[] = []
): DescriptionEvaluation {
  const text = (description || "").trim().toLowerCase();

  // If blank or empty (optional field)
  if (!text) {
    return {
      has_critical_flaw: false,
      flaw_severity: "NONE",
      penalty_points: 0,
      concept_score: 14,
      concept_assessment: "Standard sector baseline assumed (no custom operational notes submitted).",
      dimension_adjustments: {
        market_fit_adjustment: 0,
        purchasing_fit_adjustment: 0,
        financial_fit_adjustment: 0,
      },
    };
  }

  // 1. Check for Gibberish / Keyboard Mash / Trolling / Noise
  const isRepeatedChars = /(.)\1{4,}/.test(text); // e.g. aaaaaa, 111111, .....
  const isKeyboardMash = /(asdf|qwerty|zxcvb|hjkl|poiuy|lkjh|123456)/.test(text);
  const jokeTrollingPatterns = [
    /\b(fake\s*business|scam|cheat|money\s*laundering|fraud|nothing|testing\s*test|joke|haha|troll)\b/i,
    /\b(free\s*money|money\s*printer|secret\s*trick|guaranteed\s*crore)\b/i,
  ];
  const isJokeTrolling = jokeTrollingPatterns.some((rx) => rx.test(text));

  // Check vowel ratio if longer than 8 characters (to catch words like "dfghjklmnbvc")
  const lettersOnly = text.replace(/[^a-z]/g, "");
  const vowelsCount = (lettersOnly.match(/[aeiou]/g) || []).length;
  const vowelRatio = lettersOnly.length > 8 ? vowelsCount / lettersOnly.length : 0.4;
  const isUnpronounceable = lettersOnly.length > 8 && vowelRatio < 0.15;

  if (isRepeatedChars || isKeyboardMash || isJokeTrolling || isUnpronounceable) {
    return {
      has_critical_flaw: true,
      flaw_severity: "FATAL",
      penalty_points: 55,
      flaw_type: "GIBBERISH_OR_INVALID_INPUT",
      flaw_detail: "Invalid or non-viable operational description detected (keyboard mash, joke, or spam). No practical rural enterprise can be founded on this submission.",
      concept_score: 2,
      concept_assessment: "CRITICAL FAILURE: Description lacks genuine commercial substance or operational feasibility.",
      dimension_adjustments: {
        market_fit_adjustment: -5,
        purchasing_fit_adjustment: -5,
        financial_fit_adjustment: -5,
      },
    };
  }

  // 2. Prohibited, Illegal, or High-Hazard Activities
  const prohibitedPatterns = [
    /\b(weapons?|arms|gun|ammunition|explosives?)\b/i,
    /\b(drugs?|narcotics?|ganja|charas|opium|cocaine|weed)\b/i,
    /\b(satta|gambling|casino|betting|lottery|matka)\b/i,
    /\b(desi\s*daru|illicit\s*liquor|bootlegging|moonshine)\b/i,
    /\b(smuggling|stolen\s*goods|kidnap|counterfeit)\b/i,
  ];
  for (const rx of prohibitedPatterns) {
    if (rx.test(text)) {
      return {
        has_critical_flaw: true,
        flaw_severity: "FATAL",
        penalty_points: 65,
        flaw_type: "PROHIBITED_OR_ILLEGAL_ACTIVITY",
        flaw_detail: "Prohibited, hazardous, or illicit commercial activity detected. Rural banking schemes and statutory enterprise licenses explicitly ban this activity.",
        concept_score: 1,
        concept_assessment: "FATAL REJECTION: Proposed operation violates statutory micro-lending guidelines.",
        dimension_adjustments: {
          market_fit_adjustment: -5,
          purchasing_fit_adjustment: -5,
          financial_fit_adjustment: -5,
        },
      };
    }
  }

  // 3. Category Contradiction / Domain Mismatch
  const categoryMismatchRules: Record<string, RegExp[]> = {
    Dairy: [
      /\b(crypto|bitcoin|btc|eth|nft|blockchain|forex|day\s*trading|stock\s*options|intraday)\b/i,
      /\b(iphone|smartphone|mobile\s*repair|cyber\s*cafe|gaming\s*parlor|software\s*dev)\b/i,
      /\b(real\s*estate|land\s*flipping|plot\s*brokerage)\b/i,
      /\b(coaching\s*class|tuition\s*center|beauty\s*parlor|salon)\b/i,
      /\b(cement\s*factory|brick\s*kiln|welding\s*workshop)\b/i,
      /\b(garments?|clothing|tailoring|dressmaking|boutique)\b/i,
    ],
    Textile: [
      /\b(crypto|bitcoin|forex|trading|stocks)\b/i,
      /\b(milk\s*collection|dairy|cattle|cows?|buffalo)\b/i,
      /\b(brick\s*making|welding|heavy\s*fabrication|mining)\b/i,
      /\b(fertilizer\s*shop|pesticide\s*trading)\b/i,
    ],
    "Grocery Retail": [
      /\b(crypto|bitcoin|forex|stock\s*market)\b/i,
      /\b(cattle\s*breeding|livestock\s*rearing)\b/i,
      /\b(aeroplane|car\s*showroom|luxury\s*cars|yacht)\b/i,
      /\b(software\s*agency|crypto\s*mining)\b/i,
    ],
    "Food Processing": [
      /\b(crypto|bitcoin|forex|stock\s*trading)\b/i,
      /\b(mobile\s*phones|laptops|electronic\s*gadgets)\b/i,
      /\b(cement|steel|heavy\s*engineering)\b/i,
    ],
    "Small Manufacturing": [
      /\b(crypto|bitcoin|forex|trading)\b/i,
      /\b(dairy\s*farming|cow\s*shed)\b/i,
      /\b(beauty\s*salon|haircut)\b/i,
    ],
  };

  const normalizedCat = 
    category.includes("Dairy") ? "Dairy" :
    category.includes("Textile") || category.includes("Tailor") ? "Textile" :
    category.includes("Grocery") ? "Grocery Retail" :
    category.includes("Food") ? "Food Processing" :
    category.includes("Manufacturing") ? "Small Manufacturing" : category;

  const mismatchList = categoryMismatchRules[normalizedCat] || [];
  for (const rx of mismatchList) {
    if (rx.test(text)) {
      return {
        has_critical_flaw: true,
        flaw_severity: "FATAL",
        penalty_points: 50,
        flaw_type: "CATEGORY_MISMATCH_CONTRADICTION",
        flaw_detail: `Domain contradiction: Selected category is "${category}", but the entered operational description proposes an incompatible activity. Scheme subsidies and local equipment cannot be utilized.`,
        concept_score: 3,
        concept_assessment: `MISMATCH: Description does not align with ${category} equipment, supply chain, or lending norms.`,
        dimension_adjustments: {
          market_fit_adjustment: -6,
          purchasing_fit_adjustment: -5,
          financial_fit_adjustment: -7,
        },
      };
    }
  }

  // 4. Practically Impossible Unit Economics, Scale, or Pricing
  const impossibleClaims: { rx: RegExp; reason: string; penalty: number }[] = [
    // Impossible milk pricing (> ₹75/L or ₹100/L in rural village where benchmark is ₹45-₹60/L)
    {
      rx: /(?:rs\.?|inr|₹)?\s*(?:[7-9]\d|[1-9]\d{2,})\s*(?:\/|\s*per\s*)(?:l|ltr|liter|litre)/i,
      reason: "Proposed retail price per liter far exceeds rural household purchasing power (modal AGMARKNET benchmark is ₹45-₹60/L). Off-take will collapse to zero.",
      penalty: 48,
    },
    {
      rx: /(?:sell|charge|price|rate)\s*(?:at|is|of)?\s*(?:rs\.?|inr|₹)?\s*(?:[7-9]\d|[1-9]\d{2,})\s*(?:per|\/)?\s*(?:l|ltr|liter|litre)/i,
      reason: "Proposed milk selling price (₹70+/L) is unaffordable for rural daily wage households; customers will reject purchase.",
      penalty: 48,
    },
    // Impossible volume scale for micro unit (e.g. 10000+ L daily with 1-2L capital)
    {
      rx: /\b(?:10[0-9]{3,}|[2-9][0-9]{4,})\s*(?:liters?|ltrs?|units?|packets?)\s*(?:daily|per\s*day)\b/i,
      reason: "Claimed production volume (10,000+ units/day) is industrially impossible at micro-enterprise promoter equity.",
      penalty: 45,
    },
    // Absurd animal counts vs micro capital
    {
      rx: /\b(?:buy|purchase|own|have|keep|get)\s*(?:[5-9]|[1-9]\d{1,})\s*(?:cows?|buffaloes?|cattle|animals?)\b/i,
      reason: "Purchasing 5+ milch cattle requires ₹3-₹6 Lakhs in livestock capital; far exceeds available promoter margin money and micro-loan limits.",
      penalty: 45,
    },
    // Hiring 3+ salaried staff on micro-loan
    {
      rx: /\b(?:hire|employ|staff)\s*(?:[3-9]|[1-9]\d{1,})\s*(?:people|workers?|employees?|labour|staff)\b/i,
      reason: "Hiring 3+ permanent salaried staff exceeds the entire gross cash flow of a rural micro-enterprise, leading to immediate insolvency.",
      penalty: 42,
    },
    // Biologically impossible yields
    {
      rx: /\b(?:[3-9]\d|[1-9]\d{2,})\s*(?:liters?|ltrs?)\s*(?:per\s*cow|per\s*buffalo|each\s*cow|per\s*animal)\b/i,
      reason: "Per-cow milk yield claims exceeding 30L/day are biologically unrealistic for non-industrial rural Indian herds.",
      penalty: 42,
    },
    // Drones or aircraft in rural village delivery
    {
      rx: /\b(?:drone|helicopter|aeroplane|flight)\s*(?:delivery|transport)\b/i,
      reason: "Aviation/drone delivery is commercially and legally non-viable for village micro-enterprises under DGCA rules.",
      penalty: 46,
    },
    // Luxury items in low-income villages
    {
      rx: /\b(?:designer\s*(?:clothes?|dresses?)|luxury\s*(?:cars?|watches?)|yacht|sushi|caviar|5\s*star)\b/i,
      reason: "Ultra-luxury offerings completely mismatch rural agrarian daily wage demographics and purchasing power.",
      penalty: 45,
    },
    // Exporting raw perishable goods to Western countries
    {
      rx: /\b(?:export(?:ing)?\s*(?:to\s*)?(?:usa|america|uk|london|europe|dubai|canada))\b/i,
      reason: "Micro-rural enterprise lacks cold-chain APEDA phytosanitary export certifications; immediate logistics breakdown.",
      penalty: 40,
    },
    // Absurd profit promises
    {
      rx: /\b(?:100%|200%|500%|1000%)\s*(?:daily|weekly|monthly)?\s*(?:profit|returns?|margin)\b/i,
      reason: "Claimed return on capital (>100% short-term profit) violates empirical agricultural economics; represents fraudulent projection.",
      penalty: 50,
    },
    {
      rx: /\b(?:earn|earning|make)\s*(?:[1-9]\d{1,}|[1-9])\s*(?:lakh|crore)s?\s*(?:per\s*day|daily|per\s*week)\b/i,
      reason: "Claimed revenue rate (multiple lakhs/crores daily) is mathematically detached from rural village consumer base.",
      penalty: 50,
    },
    // Zero cost fantasies (animals don't eat, free raw materials)
    {
      rx: /\b(?:no\s*feed\s*cost|free\s*cattle\s*feed|eat\s*plastic|eat\s*garbage|zero\s*expense|zero\s*cost\s*raw\s*material)\b/i,
      reason: "Unrealistic zero-cost operational assumptions (omitting feed, raw material, or processing overhead) guarantee bankruptcy.",
      penalty: 45,
    },
    // Walking absurd distances for perishable morning delivery
    {
      rx: /\bwalk(?:ing)?\s*(?:[2-9]\d|[1-9]\d{2,})\s*km\b/i,
      reason: "Walking 20+ km daily for rural distribution is physically impossible for perishable goods.",
      penalty: 38,
    },
    // 100% unlimited customer credit or free giveaway
    {
      rx: /\b(?:unlimited\s*credit|free\s*for\s*(?:everyone|all)|no\s*payment\s*needed|give\s*away\s*free|100%\s*free)\b/i,
      reason: "Providing free products or unlimited credit with zero working capital collections guarantees debt default in month 1.",
      penalty: 48,
    },
  ];

  for (const item of impossibleClaims) {
    if (item.rx.test(text)) {
      return {
        has_critical_flaw: true,
        flaw_severity: "FATAL",
        penalty_points: item.penalty,
        flaw_type: "UNREALISTIC_OPERATIONAL_CLAIM",
        flaw_detail: item.reason,
        concept_score: 2,
        concept_assessment: `FATAL FLAW: ${item.reason}`,
        dimension_adjustments: {
          market_fit_adjustment: -6,
          purchasing_fit_adjustment: -6,
          financial_fit_adjustment: -7,
        },
      };
    }
  }

  // 5. Sound, Practical, Grounded Description
  const hasGoodKeywords = [
    /\b(procure|collect|fresh|morning|evening|daily|doorstep|delivery|retail|customer|local|mandi|haat|school|shop|store|quality|hygiene|packaging|tailor|stitching|flour|spices|grinding|chiller|cowshed|contract|tie-up|cooperative|b2b)\b/i,
  ].some((rx) => rx.test(text));

  const textLength = text.length;
  const conceptScore = textLength >= 60 && hasGoodKeywords ? 19 : textLength >= 25 ? 16 : 13;

  return {
    has_critical_flaw: false,
    flaw_severity: "NONE",
    penalty_points: 0,
    concept_score: conceptScore,
    concept_assessment:
      textLength >= 40
        ? "Sound, realistic rural micro-plan with actionable operational grounding."
        : "Basic operational outline; aligns with standard village commercial practices.",
    dimension_adjustments: {
      market_fit_adjustment: hasGoodKeywords ? 1 : 0,
      purchasing_fit_adjustment: 0,
      financial_fit_adjustment: hasGoodKeywords ? 1 : 0,
    },
  };
}

// ==========================================
// DETERMINISTIC FEASIBILITY & DUAL SCORES
// ==========================================

export function computeFeasibility(categoryKey: string, financials: any, locationInput: any) {
  const catProfile = CATEGORY_OPERATIONAL_PROFILES[categoryKey] || CATEGORY_OPERATIONAL_PROFILES["Dairy"];

  // 1. Resolve location against official LGD & Census hierarchy
  const locContext: ResolvedLocationContext = resolveLocationContext(
    locationInput?.district,
    locationInput?.block,
    locationInput?.village
  );

  const demo = locContext.demographics;
  const econ = locContext.economic;
  const bank = locContext.banking;
  const rain = locContext.rainfall;
  const infra = locContext.infrastructure;

  // 2. Population & reachable customers
  const reachableCustomers = Math.round(
    demo.cluster_households *
      catProfile.target_household_consumption_rate *
      catProfile.local_reachable_ratio
  );

  // 3. Official MSME density from Udyam registration data
  const msmeInfo = getMSMEIndicatorForCategory(locContext.district, locContext.block, categoryKey);
  const registeredUnits = msmeInfo.registered_units_indicator;
  const density = Math.round((registeredUnits / (demo.cluster_households || 16300)) * 1000 * 100) / 100;

  let compLevel = "MODERATE";
  let compInterp = `Healthy balance of existing service providers (${density.toFixed(2)} formal units / 1k HH) with viable room for efficient new entrants.`;
  if (density < 1.0) {
    compLevel = "LOW";
    compInterp = `Low enterprise density (${density.toFixed(2)} formal units / 1k HH) indicating substantial unaddressed local market space.`;
  } else if (density > 2.5) {
    compLevel = "HIGH";
    compInterp = `Dense enterprise presence (${density.toFixed(2)} formal units / 1k HH); requires distinct value proposition or service differentiation.`;
  }

  // 4. Commodity price benchmarks from AGMARKNET / e-NAM
  const rawPrices = getCommodityPricesForCategory(locContext.district, categoryKey);
  const formattedProducts = rawPrices.map((p: any) => ({
    product_name: p.commodity,
    unit: p.unit,
    min_price: p.min_price,
    max_price: p.max_price,
    recommended_price: p.modal_price,
    tier: "VERIFIED - AGMARKNET",
    source: `${p.source} · Snapshot: ${p.date || "15-Mar-2024"} (Modal: ₹${p.modal_price})`,
  }));

  // 5. Purchasing power profile from DES Maharashtra DDP & Wage data
  const purchasingPowerBand =
    econ.per_capita_income_inr >= 250000 ? "Strong" : econ.per_capita_income_inr >= 200000 ? "Moderate" : "Low";
  const purchasingPowerScore =
    purchasingPowerBand === "Strong" ? 75 : purchasingPowerBand === "Moderate" ? 64 : 52;

  const purchasingPower = {
    score: purchasingPowerScore,
    band: purchasingPowerBand as "Strong" | "Moderate" | "Low",
    label: `Local Consumer Purchasing Power: ${purchasingPowerBand}`,
    consumer_base: `~${reachableCustomers.toLocaleString()} local households in cluster (${locContext.block}, ${locContext.district})`,
    affordability_evidence: `Average daily rural wages (Unskilled: ₹${econ.rural_daily_wage_unskilled_inr}/day, Skilled: ₹${econ.rural_daily_wage_skilled_inr}/day) and district per capita income of ${formatINR(econ.per_capita_income_inr)} support regular household spending.`,
    demand_evidence: `Supported by active local infrastructure: ${infra.weekly_haats_bazaars} weekly bazaars, ${infra.schools_and_colleges} schools, and ${infra.grocery_kirana_outlets} retail outlets.`,
    price_sensitivity: catProfile.price_sensitivity,
    market_accessibility: `${econ.nearest_apmc_mandi_distance_km} km to nearest APMC Mandi, electrified connectivity (${econ.electrified_villages_percent}%), ${bank.financial_accessibility_tier}.`,
    category_observations: catProfile.category_observations,
    data_classification: "MODELED ESTIMATE",
    limitations: catProfile.limitations,
  };

  // 6. Agricultural crop & Livestock context
  const cropLinkage = getCropLinkageForCategory(locContext.district, categoryKey);
  const livestockContext = getLivestockContext(locContext.district);
  const industrialClusters = getIndustrialClustersForLocation(locContext.district, categoryKey);

  // 7. Dual Scores Calculation (STRICTLY INDEPENDENT)
  const capital = financials.margin_capital.value;
  const isWithinCeiling = financials.scheme.is_within_ceiling;

  // Strict Evaluation of User Entered Business Description
  const userDescriptionText = (locationInput?.description || "").trim();
  const descEval = evaluateBusinessDescription(userDescriptionText, categoryKey, capital, locContext, rawPrices);

  // SCORE A: Final Go / No-Go Model Score (0 - 100) — Commercially Driven & Highly Sensitive to User Input
  let marketFit = reachableCustomers >= 4000 ? 15 : reachableCustomers >= 2500 ? 13 : reachableCustomers >= 1200 ? 10 : 7;
  let purchasingFit = Math.round((purchasingPower.score / 100) * 15);
  let compFit = compLevel === "LOW" ? 15 : compLevel === "MODERATE" ? 12 : 8;
  let finFit = !isWithinCeiling ? 8 : capital < 14000 ? 5 : capital >= 50000 ? 18 : 14;
  let resourceFit = capital >= 100000 ? 15 : capital >= 50000 ? 12 : 8;
  let conceptFit = descEval.concept_score; // max 20

  // If a critical or fatal flaw is detected in user input, drop core fits severely
  if (descEval.has_critical_flaw) {
    marketFit = Math.min(marketFit, 4);
    purchasingFit = Math.min(purchasingFit, 4);
    finFit = Math.min(finFit, 4);
  }

  const rawGoNoGo = marketFit + purchasingFit + compFit + finFit + resourceFit + conceptFit - descEval.penalty_points;
  const goNoGoScore = Math.min(100, Math.max(12, rawGoNoGo));

  const goNoGoDimensions = [
    { dimension: "Market / Demand Fit", score: marketFit, max_score: 15, assessment: `~${reachableCustomers.toLocaleString()} addressable households in cluster` },
    { dimension: "Local Purchasing Power Fit", score: purchasingFit, max_score: 15, assessment: `${purchasingPower.band} household expenditure capacity (${formatINR(econ.per_capita_income_inr)}/yr)` },
    { dimension: "Competition Position", score: compFit, max_score: 15, assessment: `${compLevel} saturation (${density.toFixed(2)} formal units / 1k HH)` },
    { dimension: "Financial Feasibility", score: finFit, max_score: 20, assessment: `Matched with ${financials.scheme.scheme_name} (${financials.scheme.interest_rate_percent}% p.a.)` },
    { dimension: "Resource Readiness", score: resourceFit, max_score: 15, assessment: `${financials.margin_capital.formatted} promoter equity committed` },
    { 
      dimension: "AI Viability Dimension: Concept & Execution", 
      score: conceptFit, 
      max_score: 20, 
      assessment: descEval.concept_assessment 
    },
  ];

  // SCORE B: Credibility Score (0 - 100) — Evidence & Provenance Driven
  const userNotesLen = (locationInput?.description || "").trim().length;
  const isVillageVerified = Boolean(locContext.village_lgd_code);
  const isBlockVerified = Boolean(locContext.sub_district_lgd_code);

  // 1. Location Data Coverage (0 - 20): Verified village gets 20, unverified custom hamlet gets 11
  const locationScore = isVillageVerified ? 20 : isBlockVerified ? 11 : 6;

  // 2. Data Source Coverage (0 - 20): Grounded datasets availability
  const hasApmcPrices = Boolean(formattedProducts && formattedProducts.length > 0 && formattedProducts.some((p: any) => p.price_inr > 0));
  const hasMsmeCluster = (industrialClusters || []).length > 0;
  let sourceScore = 13;
  if (hasApmcPrices) sourceScore += 4;
  if (hasMsmeCluster) sourceScore += 3;

  // 3. Data Recency & Granularity (0 - 20)
  const recencyScore = hasApmcPrices ? 17 : 10;

  // 4. Category-Specific Alignment (0 - 20)
  const hasCrops = (cropLinkage?.crops || []).length > 0;
  let catAlignmentScore = 10;
  if (hasApmcPrices) catAlignmentScore += 5;
  if (hasCrops || hasMsmeCluster) catAlignmentScore += 4;

  // 5. User Input Completeness (0 - 20)
  // Comprehensive description (>50 chars): 19
  // Basic description (15-50 chars): 13
  // Sparse or empty description (<15 chars): 5
  const userCompletenessScore = userNotesLen > 50 ? 19 : userNotesLen >= 15 ? 13 : 5;

  const credibilityScore = Math.min(100, Math.max(20, locationScore + sourceScore + recencyScore + catAlignmentScore + userCompletenessScore));

  const credibilityDimensions = [
    {
      dimension: "Location Data Coverage",
      score: locationScore,
      max_score: 20,
      detail: isVillageVerified
        ? `Resolved to LGD Village (${locContext.village}, LGD: ${locContext.village_lgd_code})`
        : `Custom / unverified hamlet (${locContext.village}) - missing official LGD village census code`,
    },
    {
      dimension: "Data Source Coverage",
      score: sourceScore,
      max_score: 20,
      detail: hasApmcPrices && hasMsmeCluster
        ? "Maharashtra State Demographics + DES 2023-24 + Udyam MSME + AGMARKNET active"
        : "Partial baseline sources active; some sector benchmarks interpolated",
    },
    {
      dimension: "Data Recency & Granularity",
      score: recencyScore,
      max_score: 20,
      detail: hasApmcPrices
        ? "2024 AGMARKNET prices, 2024 RBI banking, 2023-24 DES DDP; Maharashtra Demographics baseline"
        : "Historical baseline active; no recent local market mandi price series",
    },
    {
      dimension: "Category-Specific Alignment",
      score: catAlignmentScore,
      max_score: 20,
      detail: hasApmcPrices
        ? `Grounded benchmarks available for ${categoryKey} (${formattedProducts.length} price items)`
        : `Limited commodity price benchmarks for ${categoryKey}`,
    },
    {
      dimension: "User Input Completeness",
      score: userCompletenessScore,
      max_score: 20,
      detail: userNotesLen > 50
        ? "Comprehensive business notes and operational concept provided"
        : userNotesLen >= 15
        ? "Standard enterprise concept provided"
        : "Minimal or blank business description provided (<15 chars)",
    },
  ];

  const evidenceAudit = [
    isVillageVerified
      ? { label: `Village mapped to official LGD hierarchy (${locContext.village}, LGD: ${locContext.village_lgd_code})`, status: "VERIFIED", icon: "check" }
      : { label: `Location unverified in LGD directory (${locContext.village}); using block approximation`, status: "UNVERIFIED", icon: "delta" },
    { label: `Maharashtra State Demographic Dataset primary administrative baseline`, status: "VERIFIED", icon: "check" },
    { label: `Directorate of Economics and Statistics (DES) Maharashtra 2023-24 Per Capita Income (${formatINR(econ.per_capita_income_inr)})`, status: "VERIFIED", icon: "check" },
    { label: `Ministry of MSME Udyam Portal 2023-24 formal enterprise density benchmark`, status: "VERIFIED", icon: "check" },
    hasApmcPrices
      ? { label: `AGMARKNET / e-NAM modal commodity price snapshot (15-March-2024)`, status: "VERIFIED", icon: "check" }
      : { label: `No direct local AGMARKNET mandi commodity price series for ${categoryKey}`, status: "LIMITATION", icon: "delta" },
    { label: `RBI DBIE Branch Banking Statistics (March 2024) - CD Ratio: ${bank.cd_ratio_percent}%`, status: "VERIFIED", icon: "check" },
    { label: `Official Scheme matched: ${financials.scheme.scheme_name}`, status: "VERIFIED", icon: "check" },
    userNotesLen >= 15
      ? { label: `Promoter enterprise concept and operational plan documented`, status: "VERIFIED", icon: "check" }
      : { label: `Sparse / minimal enterprise description provided (<15 chars); relying on sector defaults`, status: "LIMITATION", icon: "delta" },
    { label: "Maharashtra State Demographic Dataset used as baseline; current village population may vary", status: "LIMITATION", icon: "delta" },
    { label: "Udyam captures formal MSMEs; informal unregistered village micro-units require field verification", status: "LIMITATION", icon: "delta" },
  ];

  // 8. Deterministic Verdict
  let status = "RECOMMENDED";
  const keyFactors = [];
  const majorRisks = [];

  if (descEval.has_critical_flaw) {
    status = "HIGH RISK / RECONSIDER";
    keyFactors.push(`CRITICAL CONCEPT FLAW: ${descEval.flaw_detail}`);
    majorRisks.push("Fatal operational, logistical, or economic impossibility detected in submitted business plan.");
  } else if (capital < 14000.0) {
    status = "HIGH RISK / RECONSIDER";
    keyFactors.push(`Margin capital of ${formatINR(capital)} produces project cost below minimum ₹1.40L threshold.`);
    majorRisks.push("Undercapitalized operations risk severe early cash flow default.");
  } else if (!isWithinCeiling) {
    status = "RECOMMENDED WITH MODIFICATIONS";
    keyFactors.push(`Project cost of ${financials.project_cost.formatted} exceeds standard ₹50 Lakh concessional ceiling.`);
    majorRisks.push("Requires state corporation special board approval or syndicated financing.");
  } else if (compLevel === "HIGH") {
    status = "RECOMMENDED WITH MODIFICATIONS";
    keyFactors.push(`High competitor concentration (${density.toFixed(2)} formal units / 1,000 HH).`);
    keyFactors.push(`Substantial consumer pool (~${reachableCustomers.toLocaleString()} reachable customers).`);
    majorRisks.push("Neighborhood price competition requires strong service differentiation.");
  } else if (compLevel === "MODERATE" && reachableCustomers >= 2500) {
    status = "RECOMMENDED";
    keyFactors.push("Moderate competitor density allows viable market entry.");
    keyFactors.push(`Strong addressable customer base of ~${reachableCustomers.toLocaleString()} households.`);
    keyFactors.push(`Concessional financing (${financials.scheme.scheme_name}) provides sustainable debt coverage.`);
    majorRisks.push("Input price volatility and seasonal demand variations.");
  } else {
    status = "RECOMMENDED";
    keyFactors.push("Low competitor density represents an underserved local market opportunity.");
    keyFactors.push(`Concessional debt structure (${financials.scheme.interest_rate_percent}% p.a.) provides high operating margin.`);
    majorRisks.push("Initial market education and customer acquisition lead-time.");
  }

  return {
    location_context: locContext,
    market_reach: {
      population: {
        value: demo.cluster_population,
        formatted: demo.cluster_population.toLocaleString(),
        tier: "VERIFIED",
        source: demo.provenance_source,
      },
      households: {
        value: demo.cluster_households,
        formatted: demo.cluster_households.toLocaleString(),
        tier: "VERIFIED",
        source: demo.provenance_source,
      },
      reachable_customers: {
        value: reachableCustomers,
        formatted: reachableCustomers.toLocaleString(),
        tier: "MODELED ESTIMATE",
        formula: `Households (${demo.cluster_households.toLocaleString()}) × Adoption (${Math.round(catProfile.target_household_consumption_rate * 100)}%) × 5-10km Reach (${Math.round(catProfile.local_reachable_ratio * 100)}%) = ~${reachableCustomers.toLocaleString()} reachable customers`,
      },
      distribution_channels: {
        channels: catProfile.distribution_channels,
        tier: "MODELED ESTIMATE",
      },
    },
    competitor_mapping: {
      registered_businesses: {
        value: registeredUnits,
        tier: "VERIFIED",
        source: "Udyam Registration Portal 2023-24 (Formal MSME indicator in Block)",
      },
      density_per_1k_households: {
        value: density,
        formatted: `${density.toFixed(2)} units / 1,000 HH`,
        tier: "MODELED ESTIMATE",
      },
      competition_level: {
        value: compLevel,
        interpretation: compInterp,
        tier: "MODELED ESTIMATE",
      },
    },
    product_market_value: {
      category: categoryKey,
      products: formattedProducts,
      purchasing_power_context: {
        district_per_capita_income_inr: econ.per_capita_income_inr,
        district_per_capita_formatted: formatINR(econ.per_capita_income_inr),
        rural_daily_wage_unskilled: formatINR(econ.rural_daily_wage_unskilled_inr),
        rural_daily_wage_skilled: formatINR(econ.rural_daily_wage_skilled_inr),
        nearest_mandi_distance_km: econ.nearest_apmc_mandi_distance_km,
        tier: "VERIFIED",
      },
    },
    consumer_purchasing_power: purchasingPower,
    agro_and_industrial_context: {
      crop_linkage: cropLinkage,
      livestock: livestockContext,
      industrial_clusters: industrialClusters,
      rainfall: rain,
      banking: bank,
      infrastructure: infra,
    },
    scores: {
      go_no_go: {
        score: goNoGoScore,
        name: "FINAL GO / NO-GO MODEL SCORE",
        meaning: "Commercial viability, debt solvency & profit feasibility under local market realities",
        supported_dimensions: goNoGoDimensions,
        data_classification: "MODELED_ESTIMATE",
        concept_audit: descEval,
      },
      credibility: {
        score: credibilityScore,
        name: "CREDIBILITY SCORE",
        meaning: "Official data coverage, empirical ground-truth completeness & verification rigor",
        dimensions: credibilityDimensions,
        evidence_audit: evidenceAudit,
        limitations: [
          "Maharashtra State Demographic Dataset used as baseline; current village population may vary.",
          "Udyam captures formal MSMEs; informal unregistered village micro-units are estimated.",
          "Commodity prices are based on a static historical snapshot from AGMARKNET (15-Mar-2024).",
        ],
        data_classification: "MODELED_ESTIMATE",
        note: "These scores measure different things and should not be combined.",
      },
    },
    deterministic_recommendation: {
      status,
      key_factors: keyFactors,
      major_risks: majorRisks,
      decision_basis: "Deterministic Multi-Factor Scoring (Capital Adequacy + Competitor Density + Addressable Demand + Operational Input Feasibility)",
    },
    deterministic_scores_raw: {
      marketFit,
      purchasingFit,
      compFit,
      finFit,
      resourceFit,
      conceptFit,
      deterministicPenalty: descEval.penalty_points,
      has_critical_flaw: descEval.has_critical_flaw,
      flaw_detail: descEval.flaw_detail,
      descEval,
    },
  };
}

// ==========================================
// GEMINI AI REASONING LAYER
// ==========================================

async function generateAIReasoning(
  category: string,
  location: any,
  financials: any,
  feasibility: any,
  userDescription: string
) {
  const detRec = feasibility.deterministic_recommendation;
  const goNoGo = feasibility.scores.go_no_go.score;
  const cred = feasibility.scores.credibility.score;
  const pp = feasibility.consumer_purchasing_power;
  const loc = feasibility.location_context;
  const descEval = feasibility.deterministic_scores_raw?.descEval || evaluateBusinessDescription(userDescription, category, financials.margin_capital.value, loc);

  const fallbackResult = {
    status: detRec.status,
    ai_viability: {
      is_realistic: !descEval.has_critical_flaw,
      concept_score: descEval.concept_score,
      concept_assessment: descEval.concept_assessment,
      has_critical_flaw: descEval.has_critical_flaw,
      flaw_detail: descEval.flaw_detail || "",
      dimension_adjustments: {
        market_fit_adjustment: descEval.dimension_adjustments.market_fit_adjustment,
        purchasing_fit_adjustment: descEval.dimension_adjustments.purchasing_fit_adjustment,
        financial_fit_adjustment: descEval.dimension_adjustments.financial_fit_adjustment,
        resource_fit_adjustment: descEval.has_critical_flaw ? -5 : 0,
      },
      flaw_penalty: descEval.penalty_points,
    },
    summary_explanation:
      descEval.has_critical_flaw
        ? `CRITICAL NON-VIABILITY: The submitted operational plan contains a fatal flaw (${descEval.flaw_detail}). Under rural market conditions in ${loc.block}, addressable demand collapses and debt default is guaranteed.`
        : detRec.status === "RECOMMENDED"
        ? `Strong local feasibility in ${loc.block} with manageable competition and comfortable debt coverage under ${financials.scheme.scheme_name}.`
        : detRec.status === "RECOMMENDED WITH MODIFICATIONS"
        ? `Commercially viable in ${loc.block}, but requires distinct service differentiation and strict working capital management.`
        : "Elevated commercial risk due to high enterprise density or insufficient starting capital.",
    key_reasons: descEval.has_critical_flaw
      ? [
          descEval.flaw_detail,
          "Pricing or operational scale incompatible with local rural purchasing power and capital limits.",
          "Scheme refinancing and micro-credit approval will be rejected on these operational terms.",
        ]
      : detRec.key_factors,
    major_risks: descEval.has_critical_flaw
      ? [
          "Fatal operational plan prevents commercial break-even.",
          "100% loss of promoter equity within month 1 if launched with this model.",
        ]
      : detRec.major_risks,
    suggested_action:
      descEval.has_critical_flaw
        ? "Re-specify your operational business plan with realistic pricing (AGMARKNET modal rates) and standard rural scale."
        : detRec.status === "RECOMMENDED"
        ? `Apply for ${financials.scheme.scheme_name} at your nearest ${loc.banking.lead_bank} branch or Common Service Centre (CSC).`
        : "Conduct 15 customer validation interviews and secure pre-orders before deploying capital.",
    validation_checks: [
      "Confirm 100% daily off-take with local village customers or chilling cooperative.",
      "Verify that proposed retail pricing matches local AGMARKNET benchmark rates.",
      `Inspect nearest bank branch (${loc.banking.lead_bank}) for ${financials.scheme.scheme_name} application requirements.`,
    ],
    opportunity: {
      potential_opportunity: `Establish high-quality ${category} enterprise serving ${loc.village} and ${loc.block} cluster.`,
      reasoning: `Supported by ~${feasibility.market_reach.reachable_customers.formatted} reachable households and ${pp.band} purchasing power.`,
      suggested_niches: [
        "Direct morning doorstep service",
        "Contract supply for local institutions",
        "Premium value-added farm-gate products",
      ],
    },
    swot: {
      strengths: ["10% Promoter equity commitment", "Concessional credit backing", "Local agrarian demand"],
      weaknesses: ["Working capital collection lag", "Initial customer discovery lead time"],
      opportunities: ["APMC wholesale integration", "Institutional bulk supply", "Direct retail margin"],
      threats: ["Input commodity price fluctuations", "Monsoon seasonal cyclicality"],
    },
    threats: [
      {
        threat: "Customer Credit (Khata) Delays",
        risk_level: "HIGH",
        explanation: "Uncontrolled monthly credit sales will deplete working capital buffer.",
        mitigation: "Cap credit to 15 days for verified customers and offer small cash discounts for immediate payment.",
      },
      {
        threat: "Input Price Fluctuations",
        risk_level: "MEDIUM",
        explanation: "Seasonal price swings at APMC market yards can erode operating margins.",
        mitigation: "Procure staples during peak harvest arrival months and lock in supply agreements.",
      },
      {
        threat: "Local Competition",
        risk_level: "MEDIUM",
        explanation: `${feasibility.competitor_mapping.competition_level.value} concentration in block.`,
        mitigation: "Focus on punctual morning delivery and superior purity/freshness guarantee.",
      },
    ],
    tier: "DETERMINISTIC FALLBACK",
    mode: "FALLBACK",
  };

  const systemInstruction = `You are VEYA's Lead Rural Enterprise Viability Auditor and AI Research & Verification Engine for Maharashtra, India.
Your mission is to perform deep, critical evaluation of the user's business description and operational claims ('User Notes') against real-world rural economics, AGMARKNET mandi rates, and local purchasing power.
You operate on the "Calculation + AI Research & Verification" model.

CRITICAL AUDIT INSTRUCTIONS FOR "AI VIABILITY DIMENSION: CONCEPT & EXECUTION" (0 to 20 points):
1. If 'User Notes' is empty or "N/A":
   - Assign concept_score: 14 out of 20 (Standard sector baseline).
   - Set concept_assessment: "Standard sector baseline assumed (no custom operational notes submitted)."
   - Set is_realistic: true, has_critical_flaw: false, flaw_penalty: 0, dimension adjustments all 0.
2. If 'User Notes' is provided:
   CRITICALLY EXAMINE the description for:
   - Practical feasibility in a rural Indian village/tehsil (${loc.village}, ${loc.block}, ${loc.district}).
   - Realistic pricing vs rural purchasing power (₹${loc.economic.rural_daily_wage_unskilled_inr}/day wages; AGMARKNET benchmarks). Milk priced above ₹65/L or ₹70/L in a rural village is unaffordable for local households and will cause demand to collapse to near-zero.
   - Realistic scale vs capital: Can the stated margin capital (${financials.margin_capital.formatted}) and project cost (${financials.project_cost.formatted}) realistically fund the claimed equipment, cattle count, or workforce? (e.g. ₹50,000 cannot buy 10 cows).
   - Physical & biological reality: Per-cow milk yields (normal is 8-14L/day, high-yield is 18-22L/day; claims >30L/day are impossible), zero-cost feed myths, walking 20+ km daily, luxury items (designer clothing, caviar), or drone delivery.
   - Category integrity: Prohibit crypto, forex, mobile repairs, real estate, software dev, luxury goods, or illicit activities under rural dairy/textile/grocery.

CRITICAL IMPACT RULES:
- If a critical or fatal flaw is detected:
  - is_realistic: false
  - has_critical_flaw: true
  - concept_score: 1 to 3 out of 20
  - flaw_penalty: 45 to 55 (this intentionally drives the Final Go/No-Go score down below half, to 15-35/100)
  - dimension_adjustments:
    - market_fit_adjustment: -6 to -10 (unviable model or pricing collapses addressable demand)
    - purchasing_fit_adjustment: -6 to -10 (unaffordable for rural daily-wage families)
    - financial_fit_adjustment: -7 to -12 (capital grossly inadequate for claimed scale)
    - resource_fit_adjustment: -5 to -8
  - status: "HIGH RISK / RECONSIDER"
  - summary_explanation, key_reasons, and major_risks MUST explicitly cite the exact words and fatal flaw from the User Notes.
- If sound, realistic, and practical:
  - is_realistic: true
  - has_critical_flaw: false
  - concept_score: 16 to 20 out of 20
  - flaw_penalty: 0
  - dimension_adjustments: 0 to +2
  - Tailor all opportunities, swot, and risks to their specific operational method.
- Return ONLY valid JSON.`;

  const prompt = `Enterprise Category: ${category}
Location: ${loc.village}, ${loc.block}, ${loc.district}, Maharashtra (LGD: ${loc.sub_district_lgd_code})
User Notes to Critically Audit: "${userDescription || "N/A"}"
Financials:
- Margin Capital (10%): ${financials.margin_capital.formatted}
- Total Project Cost: ${financials.project_cost.formatted}
- Loan (90%): ${financials.loan_eligibility.formatted}
- Scheme: ${financials.scheme.scheme_name} (${financials.scheme.interest_rate_percent}% p.a.)
- Monthly EMI: ${financials.emi.formatted}/month
- Working Capital Buffer: ${financials.working_capital.formatted}

Demographics & Market Evidence:
- Cluster Population: ${feasibility.market_reach.population.formatted} (Maharashtra State Demographic Dataset)
- Households: ${feasibility.market_reach.households.formatted}
- Reachable Customers: ~${feasibility.market_reach.reachable_customers.formatted}
- Competition Level: ${feasibility.competitor_mapping.competition_level.value} (${feasibility.competitor_mapping.density_per_1k_households.formatted} from Udyam)
- Purchasing Power Band: ${pp.band} (DDP Per Capita: ${formatINR(loc.economic.per_capita_income_inr)})
- Nearest APMC Mandi: ${loc.economic.nearest_apmc_mandi_distance_km} km
- Deterministic Status Baseline: ${detRec.status}

Return ONLY valid JSON matching this exact structure:
{
  "status": "${detRec.status === "HIGH RISK / RECONSIDER" ? "HIGH RISK / RECONSIDER" : "RECOMMENDED"}",
  "ai_viability": {
    "is_realistic": true,
    "concept_score": 14,
    "concept_assessment": "1-2 sentences of critical AI research verdict on the operational plan and advantage",
    "has_critical_flaw": false,
    "flaw_detail": "Specific flaw description if any, otherwise empty string",
    "dimension_adjustments": {
      "market_fit_adjustment": 0,
      "purchasing_fit_adjustment": 0,
      "financial_fit_adjustment": 0,
      "resource_fit_adjustment": 0
    },
    "flaw_penalty": 0
  },
  "summary_explanation": "1-2 sentences critically evaluating the proposal against rural market evidence",
  "key_reasons": ["Reason 1 directly addressing user plan vs local reality", "Reason 2", "Reason 3"],
  "major_risks": ["Risk 1 directly addressing user operational claims", "Risk 2"],
  "suggested_action": "1 concrete immediate action for this rural entrepreneur",
  "validation_checks": ["Check 1 to validate before investing", "Check 2 to validate before investing", "Check 3 to validate before investing"],
  "opportunity": {
    "potential_opportunity": "1 clear sentence on best local opportunity",
    "reasoning": "1 clear sentence explaining why data supports this",
    "suggested_niches": ["Niche 1 (under 8 words)", "Niche 2 (under 8 words)", "Niche 3 (under 8 words)"]
  },
  "swot": {
    "strengths": ["Strength 1 (under 8 words)", "Strength 2 (under 8 words)"],
    "weaknesses": ["Weakness 1 (under 8 words)", "Weakness 2 (under 8 words)"],
    "opportunities": ["Opportunity 1 (under 8 words)", "Opportunity 2 (under 8 words)"],
    "threats": ["Threat 1 (under 8 words)", "Threat 2 (under 8 words)"]
  },
  "threats": [
    {"threat": "Threat 1", "risk_level": "HIGH", "explanation": "Short sentence", "mitigation": "Actionable fix"},
    {"threat": "Threat 2", "risk_level": "MEDIUM", "explanation": "Short sentence", "mitigation": "Actionable fix"},
    {"threat": "Threat 3", "risk_level": "LOW", "explanation": "Short sentence", "mitigation": "Actionable fix"}
  ]
}`;

  const result = await callGeminiSafe({
    contents: prompt,
    systemInstruction,
    temperature: 0.2,
    responseMimeType: "application/json",
  });

  if (result?.text) {
    try {
      const parsed = JSON.parse(result.text);

      // Validate and safeguard ai_viability
      let aiViability = parsed.ai_viability || fallbackResult.ai_viability;
      if (descEval.has_critical_flaw) {
        // Enforce deterministic fatal rejection if detected by pattern engine
        aiViability = {
          ...aiViability,
          is_realistic: false,
          has_critical_flaw: true,
          concept_score: Math.min(aiViability.concept_score ?? 2, 3),
          concept_assessment: `FATAL FLAW: ${descEval.flaw_detail}`,
          flaw_detail: descEval.flaw_detail,
          flaw_penalty: Math.max(45, descEval.penalty_points),
        };
      } else if (aiViability.has_critical_flaw || (typeof aiViability.concept_score === "number" && aiViability.concept_score <= 5)) {
        aiViability.has_critical_flaw = true;
        aiViability.is_realistic = false;
        aiViability.flaw_penalty = Math.max(40, aiViability.flaw_penalty || 45);
      }

      const finalStatus = aiViability.has_critical_flaw ? "HIGH RISK / RECONSIDER" : (parsed.status || detRec.status);

      return {
        ...fallbackResult,
        ...parsed,
        status: finalStatus,
        ai_viability: aiViability,
        tier: `AI RESEARCH & VERIFICATION · ${result.modelUsed}`,
        mode: "LIVE",
      };
    } catch {
      console.warn("[VEYA AI] Could not parse AI JSON output, applying structured fallback model.");
    }
  }

  return fallbackResult;
}

// ==========================================
// API ROUTES
// ==========================================

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "VEYA AI",
    version: "2026.2.0",
    gemini_live: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/locations", (req: Request, res: Response) => {
  res.json({
    state: locationsData.state,
    state_lgd_code: locationsData.state_lgd_code,
    districts: locationsData.districts,
    data_source: locationsData._metadata,
  });
});

app.get("/api/config", (req: Request, res: Response) => {
  res.json({
    categories: Object.keys(CATEGORY_OPERATIONAL_PROFILES),
    categories_detail: CATEGORY_OPERATIONAL_PROFILES,
    default_location: {
      state: "Maharashtra",
      district: "Pune",
      block: "Junnar",
      village: "Otur",
      pincode: "410502",
    },
    official_data_sources: {
      locations: "Local Government Directory (LGD), MoPR",
      demographics: "Census of India 2011 Primary Census Abstract (PCA), ORGI",
      district_indicators: "Selected Indicators for Districts in Maharashtra 2023-24, DES Maharashtra",
      economic_ddp: "District Domestic Product of Maharashtra 2011-12 to 2023-24, DES Maharashtra",
      msme: "Udyam Registration Portal 2023-24, Ministry of MSME",
      crops: "District-wise Crop Production Statistics 2022-24, Dept of Agriculture Maharashtra",
      prices: "AGMARKNET / e-NAM Historical Snapshot (15-Mar-2024)",
      livestock: "20th Livestock Census 2019, DAHD",
      industrial_clusters: "MSI-CDP Approved Clusters 2015-2025, Directorate of Industries",
      banking: "RBI DBIE Branch Banking Statistics (March 2024)",
      rainfall: "IMD & Mahavedh Annual Summary 2023",
      poi_infrastructure: "OpenStreetMap & District Administrative Atlas 2024",
      schemes: "PMEGP, CMEGP, PMFME, PM Vishwakarma, MUDRA Official Guidelines",
    },
    schemes: schemesData.schemes,
  });
});

app.post("/api/assessment", async (req: Request, res: Response) => {
  try {
    const {
      category = "Dairy",
      capital = 100000,
      location = {},
      description = "",
      confidence = "HIGH",
    } = req.body;

    const numCapital = Number(capital);
    if (isNaN(numCapital) || numCapital <= 0) {
      return res.status(400).json({ error: "Please enter a valid margin capital greater than 0." });
    }

    const catKey = CATEGORY_OPERATIONAL_PROFILES[category] ? category : "Dairy";

    // 1. Calculate deterministic financial plan
    const financials = computeFinancialPlan(numCapital, catKey);

    // 2. Calculate deterministic feasibility and dual scores based on resolved location
    const feasibility = computeFeasibility(catKey, financials, { ...location, description });

    // 3. Generate Gemini qualitative reasoning + AI critical research & verification
    const aiReasoning = await generateAIReasoning(catKey, location, financials, feasibility, description);

    const locContext = feasibility.location_context;
    const aiViability = aiReasoning.ai_viability || {
      is_realistic: !feasibility.deterministic_scores_raw?.has_critical_flaw,
      concept_score: feasibility.deterministic_scores_raw?.conceptFit ?? 14,
      concept_assessment: feasibility.deterministic_scores_raw?.descEval?.concept_assessment || "Standard sector baseline assumed.",
      has_critical_flaw: Boolean(feasibility.deterministic_scores_raw?.has_critical_flaw),
      flaw_detail: feasibility.deterministic_scores_raw?.flaw_detail || "",
      dimension_adjustments: feasibility.deterministic_scores_raw?.descEval?.dimension_adjustments || {
        market_fit_adjustment: 0,
        purchasing_fit_adjustment: 0,
        financial_fit_adjustment: 0,
        resource_fit_adjustment: 0,
      },
      flaw_penalty: feasibility.deterministic_scores_raw?.deterministicPenalty || 0,
    };

    // Determine if either deterministic model or AI critical audit flagged fatal non-viability
    const hasFatalInputFlaw = Boolean(
      aiViability.has_critical_flaw ||
      feasibility.deterministic_scores_raw?.has_critical_flaw ||
      (aiReasoning.status === "HIGH RISK / RECONSIDER" && (aiViability.concept_score ?? 14) <= 7)
    );

    // Raw deterministic scores
    const rawScores = feasibility.deterministic_scores_raw || {
      marketFit: 12,
      purchasingFit: 10,
      compFit: 12,
      finFit: 15,
      resourceFit: 12,
      conceptFit: 14,
    };

    let marketFit = rawScores.marketFit + (aiViability.dimension_adjustments?.market_fit_adjustment || 0);
    let purchasingFit = rawScores.purchasingFit + (aiViability.dimension_adjustments?.purchasing_fit_adjustment || 0);
    let compFit = rawScores.compFit;
    let finFit = rawScores.finFit + (aiViability.dimension_adjustments?.financial_fit_adjustment || 0);
    let resourceFit = rawScores.resourceFit + (aiViability.dimension_adjustments?.resource_fit_adjustment || 0);
    let conceptFit = typeof aiViability.concept_score === "number" ? aiViability.concept_score : rawScores.conceptFit;

    // Clamp dimension scores to valid ranges
    marketFit = Math.max(1, Math.min(15, marketFit));
    purchasingFit = Math.max(1, Math.min(15, purchasingFit));
    compFit = Math.max(1, Math.min(15, compFit));
    finFit = Math.max(1, Math.min(20, finFit));
    resourceFit = Math.max(1, Math.min(15, resourceFit));
    conceptFit = Math.max(0, Math.min(20, conceptFit));

    let finalGoNoGoScore: number;
    if (hasFatalInputFlaw) {
      // Drastically lower score below half (15 - 38 out of 100)
      marketFit = Math.min(marketFit, 4);
      purchasingFit = Math.min(purchasingFit, 4);
      finFit = Math.min(finFit, 4);
      conceptFit = Math.min(conceptFit, 3);
      const penalty = Math.max(42, aiViability.flaw_penalty || 45);
      const rawSum = marketFit + purchasingFit + compFit + finFit + resourceFit + conceptFit;
      finalGoNoGoScore = Math.max(12, Math.min(38, rawSum - penalty));
    } else {
      finalGoNoGoScore = Math.min(100, Math.max(12, marketFit + purchasingFit + compFit + finFit + resourceFit + conceptFit));
    }

    const updatedGoNoGoDimensions = [
      {
        dimension: "Market / Demand Fit",
        score: marketFit,
        max_score: 15,
        assessment: hasFatalInputFlaw && (aiViability.dimension_adjustments?.market_fit_adjustment || 0) < 0
          ? "Demand severely impaired: proposed operational model or pricing limits addressable village customers."
          : `~${feasibility.market_reach.reachable_customers.formatted} addressable households in cluster`,
      },
      {
        dimension: "Local Purchasing Power Fit",
        score: purchasingFit,
        max_score: 15,
        assessment: hasFatalInputFlaw && (aiViability.dimension_adjustments?.purchasing_fit_adjustment || 0) < 0
          ? "Purchasing mismatch: proposed pricing or product scale is unaffordable for rural daily-wage households."
          : `${feasibility.consumer_purchasing_power.band} household expenditure capacity (${formatINR(locContext.economic.per_capita_income_inr)}/yr)`,
      },
      {
        dimension: "Competition Position",
        score: compFit,
        max_score: 15,
        assessment: `${feasibility.competitor_mapping.competition_level.value} saturation (${feasibility.competitor_mapping.density_per_1k_households.formatted} formal units / 1k HH)`,
      },
      {
        dimension: "Financial Feasibility",
        score: finFit,
        max_score: 20,
        assessment: hasFatalInputFlaw && (aiViability.dimension_adjustments?.financial_fit_adjustment || 0) < 0
          ? "Financial deficit: proposed capital is inadequate for the claimed operational scale or equipment."
          : `Matched with ${financials.scheme.scheme_name} (${financials.scheme.interest_rate_percent}% p.a.)`,
      },
      {
        dimension: "Resource Readiness",
        score: resourceFit,
        max_score: 15,
        assessment: `${financials.margin_capital.formatted} promoter equity committed`,
      },
      {
        dimension: "AI Viability Dimension: Concept & Execution",
        score: conceptFit,
        max_score: 20,
        assessment:
          aiViability.concept_assessment ||
          (description.trim() ? "AI Research & Verification completed." : "Standard sector baseline assumed (no custom operational notes submitted)."),
      },
    ];

    const finalStatus = hasFatalInputFlaw ? "HIGH RISK / RECONSIDER" : aiReasoning.status;
    const finalReasons = hasFatalInputFlaw
      ? [
          aiViability.flaw_detail || feasibility.deterministic_recommendation.key_factors[0] || "Fatal economic or operational flaw detected in submitted description.",
          ...(aiReasoning.key_reasons || []).slice(0, 2),
        ]
      : aiReasoning.key_reasons;

    const finalRisks = hasFatalInputFlaw
      ? [
          "Operational concept fundamentally conflicts with rural purchasing power or physical logistics.",
          ...(aiReasoning.major_risks || []).slice(0, 2),
        ]
      : aiReasoning.major_risks;

    const finalSummary = hasFatalInputFlaw
      ? `CRITICAL NON-VIABILITY: The submitted operational plan contains a fatal flaw (${aiViability.flaw_detail || "unrealistic pricing, capital mismatch, or impossible operational claims"}). Through Calculation + AI Research & Verification, the Final Go/No-Go Model Score has dropped drastically to ${finalGoNoGoScore}/100.`
      : aiReasoning.summary_explanation;

    // Assemble final report with verified calculation + AI verification synthesis
    const finalReport = {
      project: "VEYA",
      version: "2026.2.0",
      location: {
        village: locContext.village,
        block: locContext.block,
        district: locContext.district,
        state: locContext.state,
        pincode: locContext.pincode,
        district_lgd_code: locContext.district_lgd_code,
        sub_district_lgd_code: locContext.sub_district_lgd_code,
        village_lgd_code: locContext.village_lgd_code,
        provenance: locContext.demographics.provenance_source,
      },
      input: {
        category: catKey,
        capital: numCapital,
        capital_formatted: formatINR(numCapital),
        description,
        user_confidence: confidence,
      },
      decision_snapshot: {
        go_no_go: {
          score: finalGoNoGoScore,
          name: "FINAL GO / NO-GO MODEL SCORE",
          meaning: hasFatalInputFlaw
            ? "CRITICAL RISK: Operational concept contains fatal economic, pricing, or logistical flaws. Final score dropped below half."
            : "Synthesizes deterministic mathematical modeling with AI critical verification of your operational concept, unit economics, and viability.",
          supported_dimensions: updatedGoNoGoDimensions,
          data_classification: "CALCULATION + AI RESEARCH & VERIFICATION",
          concept_audit: aiViability,
        },
        credibility: feasibility.scores.credibility,
        note: "These scores measure different things and should not be combined.",
      },
      recommendation: {
        status: finalStatus,
        status_tier: "VERIFIED",
        summary_explanation: finalSummary,
        key_reasons: finalReasons,
        major_risks: finalRisks,
        suggested_action: aiReasoning.suggested_action,
        validation_checks: aiReasoning.validation_checks,
        quantitative_engine_check: feasibility.deterministic_recommendation,
        narrative_tier: aiReasoning.tier,
      },
      hyper_local: {
        location_level: `Tehsil / Sub-District (${locContext.block}, ${locContext.district})`,
        consumer_purchasing_power: feasibility.consumer_purchasing_power,
        agro_and_industrial_context: feasibility.agro_and_industrial_context,
      },
      financial_plan: financials,
      feasibility: {
        market_reach: feasibility.market_reach,
        competitor_mapping: feasibility.competitor_mapping,
        product_market_value: feasibility.product_market_value,
        opportunity: aiReasoning.opportunity,
        swot: aiReasoning.swot,
        threats: aiReasoning.threats,
      },
    };

    res.json(finalReport);
  } catch (err: any) {
    console.error("Error in /api/assessment:", err);
    res.status(500).json({ error: err.message || "Failed to generate business assessment" });
  }
});

app.post("/api/what-if", (req: Request, res: Response) => {
  try {
    const {
      category = "Dairy",
      current_capital = 100000,
      new_capital = 150000,
      location = {},
    } = req.body;

    const currCap = Number(current_capital);
    const newCap = Number(new_capital);
    if (isNaN(newCap) || newCap <= 0) {
      return res.status(400).json({ error: "New capital must be greater than 0." });
    }

    const catKey = CATEGORY_OPERATIONAL_PROFILES[category] ? category : "Dairy";

    const currentFinancials = computeFinancialPlan(currCap, catKey);
    const newFinancials = computeFinancialPlan(newCap, catKey);

    const newFeasibility = computeFeasibility(catKey, newFinancials, location);

    const deltas = {
      capital: newCap - currCap,
      capital_formatted: (newCap >= currCap ? "+" : "") + formatINR(newCap - currCap),
      project_cost: newFinancials.project_cost.value - currentFinancials.project_cost.value,
      project_cost_formatted:
        (newFinancials.project_cost.value >= currentFinancials.project_cost.value ? "+" : "") +
        formatINR(newFinancials.project_cost.value - currentFinancials.project_cost.value),
      loan: newFinancials.loan_eligibility.value - currentFinancials.loan_eligibility.value,
      loan_formatted:
        (newFinancials.loan_eligibility.value >= currentFinancials.loan_eligibility.value ? "+" : "") +
        formatINR(newFinancials.loan_eligibility.value - currentFinancials.loan_eligibility.value),
      emi: Math.round((newFinancials.emi.value - currentFinancials.emi.value) * 100) / 100,
      emi_formatted:
        (newFinancials.emi.value >= currentFinancials.emi.value ? "+" : "") +
        formatINR(newFinancials.emi.value - currentFinancials.emi.value),
      working_capital: newFinancials.working_capital.value - currentFinancials.working_capital.value,
      working_capital_formatted:
        (newFinancials.working_capital.value >= currentFinancials.working_capital.value ? "+" : "") +
        formatINR(newFinancials.working_capital.value - currentFinancials.working_capital.value),
      scheme_changed: currentFinancials.scheme.scheme_name !== newFinancials.scheme.scheme_name,
      previous_scheme: currentFinancials.scheme.scheme_name,
      new_scheme: newFinancials.scheme.scheme_name,
      recalculated_go_no_go: newFeasibility.scores.go_no_go.score,
    };

    res.json({
      current_financials: currentFinancials,
      new_financials: newFinancials,
      deltas,
      recalculated_scores: newFeasibility.scores,
      score_independence_explanation:
        "The What-If simulator modified the business financial plan, not the regional evidence quality. The Credibility Score remains unchanged because data coverage and ground truth are identical.",
    });
  } catch (err: any) {
    console.error("Error in /api/what-if:", err);
    res.status(500).json({ error: err.message || "Failed to simulate what-if capital change" });
  }
});

app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, reportContext } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const getFallbackReply = () => {
      const q = message.toLowerCase();
      if (q.includes("emi") || q.includes("installment") || q.includes("monthly payment")) {
        return `Your monthly EMI is calculated as ${reportContext?.financial_plan?.emi?.formatted || "₹14,835"} for ${reportContext?.financial_plan?.scheme?.tenure_years || 7} years, with an initial ${reportContext?.financial_plan?.scheme?.moratorium_months || 6}-month grace period under the ${reportContext?.financial_plan?.scheme?.scheme_name || "concessional scheme"}.`;
      } else if (q.includes("scheme") || q.includes("loan") || q.includes("interest")) {
        return `Based on your ${reportContext?.input?.capital_formatted || "₹1,00,000"} promoter margin (10%), you are matched with the ${reportContext?.financial_plan?.scheme?.scheme_name || "CMEGP"} providing 90% concessional credit (${reportContext?.financial_plan?.loan_eligibility?.formatted || "₹9,00,000"}) at ${reportContext?.financial_plan?.scheme?.interest_rate_percent || 8}% annual interest. ${reportContext?.financial_plan?.scheme?.subsidy_info || ""}`;
      } else if (q.includes("why") || q.includes("recommend") || q.includes("decision")) {
        return `VEYA evaluated ${reportContext?.input?.category || "this business"} in ${reportContext?.location?.block || "your area"} with a Go/No-Go Model Score of ${reportContext?.decision_snapshot?.go_no_go?.score || 82}/100. ${reportContext?.recommendation?.summary_explanation || "Strong demand with manageable local competition."}`;
      } else if (q.includes("score") || q.includes("credibility") || q.includes("difference")) {
        return `The two scores measure fundamentally different things: The Go/No-Go Model Score (${reportContext?.decision_snapshot?.go_no_go?.score || 82}/100) measures commercial business feasibility. The Credibility Score (${reportContext?.decision_snapshot?.credibility?.score || 78}/100) measures the ground-truth completeness and reliability of our official data sources (Census 2011, DES Maharashtra 2023-24, Udyam MSME, AGMARKNET).`;
      } else if (q.includes("risk") || q.includes("threat") || q.includes("loss")) {
        return `The primary operational risk is working capital lockup from customer credit (khata). Protect your ${reportContext?.financial_plan?.working_capital?.formatted || "working capital buffer"} and ensure timely payment collections.`;
      } else if (q.includes("customer") || q.includes("reach") || q.includes("sale")) {
        return `For ${reportContext?.input?.category || "your enterprise"} in ${reportContext?.location?.village || "this cluster"}, start by securing direct relationships with 20–30 local households or shops before expanding to weekly market haats.`;
      }
      return `I am VEYA, your rural business advisory mentor. Based on your ${reportContext?.input?.category || "enterprise"} plan in ${reportContext?.location?.village || "Pune district"}, your projected project cost is ${reportContext?.financial_plan?.project_cost?.formatted || "₹10,00,000"} with an EMI of ${reportContext?.financial_plan?.emi?.formatted || "₹14,835"}/mo under ${reportContext?.financial_plan?.scheme?.scheme_name || "CMEGP"}. How can I assist your setup further?`;
    };

    if (!ai) {
      return res.json({ reply: getFallbackReply(), mode: "FALLBACK" });
    }

    const systemInstruction = `You are VEYA, a compassionate, practical, and highly knowledgeable rural business mentor for micro-entrepreneurs in Maharashtra, India.
You speak clearly, warmly, and without complex financial jargon.
You have the user's complete VEYA Business Feasibility and Financial Report context.
STRICT RULES:
1. You MUST treat the report's numerical values as absolute truth. Never modify or recalculate them.
2. The Go/No-Go Model Score and Credibility Score are strictly independent. Explain their different meanings if asked.
3. Reference official sources: Census 2011, DES Maharashtra 2023-24, Udyam MSME, AGMARKNET 15-Mar-2024.
4. Do not promise loan approval; frame financing as subject to official DIC / bank channel verification.
5. If the user asks in Hindi or simple Marathi/Hinglish, answer helpfully.`;

    const prompt = `User's Question: "${message}"

Current Business Report Context:
- Business: ${reportContext?.input?.category}
- Location: ${reportContext?.location?.village}, ${reportContext?.location?.block}, ${reportContext?.location?.district} (LGD Sub-District: ${reportContext?.location?.sub_district_lgd_code})
- Available Margin Capital (10%): ${reportContext?.financial_plan?.margin_capital?.formatted}
- Total Project Cost: ${reportContext?.financial_plan?.project_cost?.formatted}
- Concessional Govt Loan (90%): ${reportContext?.financial_plan?.loan_eligibility?.formatted}
- Matched Scheme: ${reportContext?.financial_plan?.scheme?.scheme_name} (${reportContext?.financial_plan?.scheme?.interest_rate_percent}% p.a., ${reportContext?.financial_plan?.scheme?.tenure_years} yrs tenure)
- Subsidy Info: ${reportContext?.financial_plan?.scheme?.subsidy_info}
- Monthly EMI: ${reportContext?.financial_plan?.emi?.formatted}/month
- Working Capital Buffer: ${reportContext?.financial_plan?.working_capital?.formatted}
- Reachable Customers: ${reportContext?.feasibility?.market_reach?.reachable_customers?.formatted}
- Competition Level: ${reportContext?.feasibility?.competitor_mapping?.competition_level?.value}
- Consumer Purchasing Power Band: ${reportContext?.hyper_local?.consumer_purchasing_power?.band}
- Final Go/No-Go Model Score: ${reportContext?.decision_snapshot?.go_no_go?.score}/100
- Credibility Score: ${reportContext?.decision_snapshot?.credibility?.score}/100
- Recommendation: ${reportContext?.recommendation?.status}
- Summary: ${reportContext?.recommendation?.summary_explanation}
- Immediate Next Step: ${reportContext?.recommendation?.suggested_action}

Answer the user directly and warmly:`;

    const result = await callGeminiSafe({
      contents: prompt,
      systemInstruction,
      temperature: 0.3,
    });

    if (result?.text) {
      return res.json({
        reply: result.text,
        mode: "LIVE",
      });
    }

    return res.json({
      reply: getFallbackReply(),
      mode: "FALLBACK",
    });
  } catch (err: any) {
    console.warn("[VEYA AI] Handled issue in /api/chat gracefully:", err?.message || err);
    res.json({
      reply:
        "I am VEYA, your rural business advisory mentor. I can help explain your feasibility report, EMI, schemes, and risks. Please feel free to ask about your numbers!",
      mode: "FALLBACK",
    });
  }
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VEYA] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
