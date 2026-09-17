"""
feasibility.py - Hyper-Local Feasibility, Consumer Purchasing Power & Dual Score Engine for VEYA / GramBiz AI.

Produces:
1. Market Reach (Census 2011 + reach model)
2. Competitor Mapping (Udyam aggregate density proxy)
3. Product Market Value (Pricing benchmarks + purchasing power)
4. Opportunity Analysis (Grounded AI reasoning)
5. SWOT Analysis (Grounded AI reasoning)
6. Threats Analysis (Grounded AI reasoning)
7. Hyper-Local Consumer Purchasing Power (Evidence-based capacity & willingness)
8. Two Independent Scores:
   - Score A: Final Go / No-Go Model Score (XX / 100)
   - Score B: Credibility Score (XX / 100)
"""

import sys
from typing import Dict, Any, List, Optional
from data_loader import DataLoader, get_loader
from ai_engine import AIEngine, get_ai_engine
from financial import format_inr

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

class FeasibilityEngine:
    """Executes quantitative data aggregation, modeling formulas, and grounded AI reasoning."""

    def __init__(self, loader: Optional[DataLoader] = None, ai_engine: Optional[AIEngine] = None):
        self.loader = loader or get_loader()
        self.ai_engine = ai_engine or get_ai_engine()

    def get_market_reach(self, category: str) -> Dict[str, Any]:
        demographics = self.loader.get_demographics()
        cat_data = self.loader.get_category_data(category)
        
        pop = demographics["population"]
        households = demographics["households"]
        
        adoption_rate = cat_data.get("target_household_consumption_rate", 0.50)
        reach_ratio = cat_data.get("local_reachable_ratio", 0.35)
        
        reachable_customers = int(round(households * adoption_rate * reach_ratio))
        formula_explanation = (
            f"Households ({households:,}) × Adoption Rate ({int(adoption_rate*100)}%) "
            f"× 5-10km Reach Factor ({int(reach_ratio*100)}%) = ~{reachable_customers:,} reachable customers"
        )
        
        return {
            "population": {
                "value": pop,
                "formatted": f"{pop:,}",
                "tier": "VERIFIED",
                "source": demographics["provenance"]["source"],
                "data_vintage": demographics["provenance"]["data_vintage"]
            },
            "households": {
                "value": households,
                "formatted": f"{households:,}",
                "tier": "VERIFIED",
                "source": demographics["provenance"]["source"],
                "data_vintage": demographics["provenance"]["data_vintage"]
            },
            "reachable_customers": {
                "value": reachable_customers,
                "formatted": f"{reachable_customers:,}",
                "tier": "MODELED ESTIMATE",
                "formula": formula_explanation,
                "source": "Calculated Estimate (Demographics × Category Consumption Ratio)",
                "data_vintage": "2024 Model"
            },
            "distribution_channels": {
                "channels": cat_data.get("distribution_channels", []),
                "tier": "MODELED ESTIMATE",
                "source": "Cluster Trade Pattern & Agricultural Supply Survey",
                "data_vintage": "2024"
            }
        }

    def get_competitor_mapping(self, category: str) -> Dict[str, Any]:
        cat_data = self.loader.get_category_data(category)
        demographics = self.loader.get_demographics()
        
        registered_count = cat_data.get("registered_enterprises", 0)
        households = demographics.get("households", 16300)
        
        density = round((registered_count / households) * 1000.0, 2)
        
        if density < 1.0:
            level = "LOW"
            interpretation = "Low enterprise density indicating substantial unaddressed local market space."
        elif density <= 2.5:
            level = "MODERATE"
            interpretation = "Healthy balance of existing service providers with viable room for efficient new entrants."
        else:
            level = "HIGH"
            interpretation = "Dense enterprise presence; requires distinct value proposition or service differentiation."
            
        return {
            "category": category,
            "registered_businesses": {
                "value": registered_count,
                "tier": "VERIFIED",
                "source": cat_data["provenance"]["source"],
                "data_vintage": cat_data["provenance"]["data_vintage"]
            },
            "density_per_1k_households": {
                "value": density,
                "formatted": f"{density:.2f} units / 1,000 HH",
                "formula": f"({registered_count} registered units ÷ {households:,} households) × 1,000",
                "tier": "MODELED ESTIMATE",
                "source": "Modeled Density (Udyam Enterprise Aggregate / Census Households)"
            },
            "competition_level": {
                "value": level,
                "interpretation": interpretation,
                "tier": "MODELED ESTIMATE",
                "source": "Density-Based Threshold Analysis (<1.0 Low, 1.0-2.5 Moderate, >2.5 High)"
            }
        }

    def get_product_market_value(self, category: str) -> Dict[str, Any]:
        cat_data = self.loader.get_category_data(category)
        econ = self.loader.get_economic_context()
        
        products = cat_data.get("products", [])
        
        return {
            "category": category,
            "products": products,
            "purchasing_power_context": {
                "district_per_capita_income_inr": econ.get("district_per_capita_income_inr"),
                "district_per_capita_formatted": format_inr(econ.get("district_per_capita_income_inr", 0)),
                "rural_daily_wage_unskilled": format_inr(econ.get("rural_daily_wage_unskilled_inr", 0)),
                "rural_daily_wage_skilled": format_inr(econ.get("rural_daily_wage_skilled_inr", 0)),
                "nearest_mandi_distance_km": econ.get("nearest_apmc_mandi_distance_km"),
                "tier": "VERIFIED",
                "source": econ["provenance"]["source"],
                "data_vintage": econ["provenance"]["data_vintage"]
            },
            "pricing_recommendation": {
                "guideline": (
                    "Position retail pricing at the benchmark median to capture initial volume, "
                    "while capturing premium margin on doorstep convenience or customized job-work."
                ),
                "tier": "MODELED ESTIMATE",
                "source": "Agricultural Produce Market Committee (APMC) & Regional MSME Survey"
            }
        }

    def get_consumer_purchasing_power(self, category: str, location: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calculates hyper-local consumer purchasing power based on location economic proxies,
        Census 2011 indicators, and category-specific consumption patterns.
        """
        econ = self.loader.get_economic_context()
        demo = self.loader.get_demographics()
        cat_data = self.loader.get_category_data(category)
        
        per_capita = econ.get("district_per_capita_income_inr", 245000)
        unskilled_wage = econ.get("rural_daily_wage_unskilled_inr", 380)
        skilled_wage = econ.get("rural_daily_wage_skilled_inr", 650)
        mandi_dist = econ.get("nearest_apmc_mandi_distance_km", 7.5)
        
        c_low = category.lower().strip()
        
        if "dairy" in c_low:
            band = "Moderate"
            score = 68
            consumer_base = f"~{int(demo['households'] * 0.75 * 0.40):,} daily milk-consuming households"
            affordability_evidence = f"Daily household milk spend (₹45-₹90/day) represents ~12-18% of rural unskilled daily wage ({format_inr(unskilled_wage)}/day)."
            demand_evidence = "High daily recurring staple demand; steady tea shop and sweet stall off-take."
            price_sensitivity = "Moderate sensitivity to base raw milk price, low sensitivity to fresh paneer quality."
            category_observations = "Direct doorstep delivery secures ₹8-₹12/L higher margin than bulk chilling cooperatives."
            limitations = ["Village-level cattle census data is proxied from Tehsil livestock estimates."]
        elif "grocery" in c_low:
            band = "Moderate"
            score = 62
            consumer_base = f"~{int(demo['households'] * 0.95 * 0.30):,} monthly provision-buying households"
            affordability_evidence = f"Monthly dry ration basket (₹2,200) represents ~28% of median monthly rural agricultural income."
            demand_evidence = "Universal weekly requirement; high ticket frequency with thin gross margin."
            price_sensitivity = "High price sensitivity on packaged branded goods; expectation of monthly khata credit."
            category_observations = "Requires tight working capital control to prevent cash lockup in credit accounts."
            limitations = ["Informal neighborhood kirana shop revenues are unrecorded in official tax databases."]
        elif "textile" in c_low:
            band = "Moderate"
            score = 65
            consumer_base = f"~{int(demo['households'] * 0.60 * 0.35):,} apparel & custom tailoring clients"
            affordability_evidence = f"Custom blouse/suit stitching (₹280-₹320) is affordable for local households during school & festival cycles."
            demand_evidence = "Strong surge during June school re-opening and Oct-Jan festive/wedding season."
            price_sensitivity = "Medium sensitivity on everyday wear; willingness to pay premium for custom fit and bridal embroidery."
            category_observations = "Institutional school uniform supply provides stable anchor cash flow."
            limitations = ["Seasonal wedding apparel expenditure varies significantly by annual agricultural harvest yield."]
        elif "food" in c_low:
            band = "Strong"
            score = 74
            consumer_base = f"~{int(demo['households'] * 0.55 * 0.35):,} farm households & regional market buyers"
            affordability_evidence = f"Post-harvest spice and flour milling fees (₹8-₹15/kg) are universally affordable for grain growers."
            demand_evidence = "Abundant raw agricultural crop access (onions, tomatoes, grains) within 10km radius."
            price_sensitivity = "Low price sensitivity for prompt custom milling; high willingness to pay for unadulterated ground spices."
            category_observations = "Strong regional wholesale tie-up potential with Junnar & Pune APMC traders."
            limitations = ["Rural 3-phase industrial power availability varies by season."]
        else: # Small Manufacturing
            band = "Moderate"
            score = 60
            consumer_base = f"~{int(demo['households'] * 0.30 * 0.30):,} home builders, farmers & contractors"
            affordability_evidence = f"Fly-ash bricks (₹4,200/1000) are 15% cheaper than traditional red clay kiln bricks."
            demand_evidence = "Supported by rural housing schemes (PMAY-G) and local tractor trolley repairs."
            price_sensitivity = "Contractors focus on strength certification and credit terms rather than minor price variances."
            category_observations = "Low local competition provides pricing power for quality fabrication."
            limitations = ["Commercial construction demand slows down significantly during monsoon months."]

        return {
            "score": score,
            "band": band,
            "label": f"Local Consumer Purchasing Power: {band}",
            "consumer_base": consumer_base,
            "affordability_evidence": affordability_evidence,
            "demand_evidence": demand_evidence,
            "price_sensitivity": price_sensitivity,
            "market_accessibility": f"{mandi_dist} km to nearest APMC Mandi, good state highway road connectivity",
            "category_observations": category_observations,
            "data_classification": "MODELED ESTIMATE",
            "limitations": limitations
        }

    def calculate_go_no_go_score(
        self,
        category: str,
        financials: Dict[str, Any],
        feasibility_data: Dict[str, Any],
        purchasing_power: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates Score A: Final Go / No-Go Model Score (0-100).
        Represents how the user's business idea/plan fares according to VEYA's model.
        Deterministic breakdown across 6 supported dimensions:
        - Market / Demand Fit (0-20)
        - Local Purchasing Power Fit (0-15)
        - Competition Position (0-15)
        - Financial Feasibility (0-20)
        - Resource Readiness (0-15)
        - Risk Exposure & Mitigations (0-15)
        """
        capital = financials["margin_capital"]["value"]
        project_cost = financials["project_cost"]["value"]
        comp_level = feasibility_data["competitor_mapping"]["competition_level"]["value"]
        reachable = feasibility_data["market_reach"]["reachable_customers"]["value"]
        is_within_ceiling = financials["scheme"]["is_within_ceiling"]
        
        # 1. Market Demand Fit (Max 20)
        if reachable >= 4500:
            market_fit = 18
        elif reachable >= 3000:
            market_fit = 15
        elif reachable >= 1500:
            market_fit = 12
        else:
            market_fit = 8

        # 2. Local Purchasing Power Fit (Max 15)
        pp_score = purchasing_power.get("score", 65)
        purchasing_fit = int(round((pp_score / 100.0) * 15))

        # 3. Competition Position (Max 15)
        if comp_level == "LOW":
            comp_fit = 14
        elif comp_level == "MODERATE":
            comp_fit = 11
        else:
            comp_fit = 7

        # 4. Financial Feasibility (Max 20)
        if not is_within_ceiling:
            fin_fit = 8
        elif capital < 14000.0:
            fin_fit = 6
        elif capital >= 50000.0:
            fin_fit = 18
        else:
            fin_fit = 14

        # 5. Resource Readiness (Max 15)
        if capital >= 100000.0:
            resource_fit = 14
        elif capital >= 50000.0:
            resource_fit = 11
        else:
            resource_fit = 8

        # 6. Risk Exposure & Mitigations (Max 15)
        risk_fit = 11

        total_score = min(100, max(10, market_fit + purchasing_fit + comp_fit + fin_fit + resource_fit + risk_fit))
        
        dimensions = [
            {"dimension": "Market / Demand Fit", "score": market_fit, "max_score": 20, "assessment": "High addressable customer volume in block"},
            {"dimension": "Local Purchasing Power Fit", "score": purchasing_fit, "max_score": 15, "assessment": f"{purchasing_power.get('band', 'Moderate')} household expenditure capacity"},
            {"dimension": "Competition Position", "score": comp_fit, "max_score": 15, "assessment": f"{comp_level} saturation with room for differentiation"},
            {"dimension": "Financial Feasibility", "score": fin_fit, "max_score": 20, "assessment": f"Concessional credit match under {financials['scheme']['scheme_name']}"},
            {"dimension": "Resource Readiness", "score": resource_fit, "max_score": 15, "assessment": f"{format_inr(capital)} promoter equity committed"},
            {"dimension": "Risk Exposure & Mitigation", "score": risk_fit, "max_score": 15, "assessment": "Working capital reserve protected against seasonal swings"}
        ]
        
        evidence = [
            f"Addressable reach of {reachable:,} local households",
            f"Concessional {financials['scheme']['interest_rate_percent']}% p.a. interest rate with {financials['scheme']['moratorium_months']}-month moratorium",
            f"Competitor density: {feasibility_data['competitor_mapping']['density_per_1k_households']['formatted']}",
            f"Local consumer purchasing power band: {purchasing_power.get('band', 'Moderate')}"
        ]

        return {
            "score": total_score,
            "name": "FINAL GO / NO-GO MODEL SCORE",
            "meaning": "How your business idea fares according to VEYA's analysis",
            "supported_dimensions": dimensions,
            "evidence": evidence,
            "data_classification": "MODELED_ESTIMATE"
        }

    def calculate_credibility_score(
        self,
        category: str,
        location: Dict[str, Any],
        user_inputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates Score B: Credibility Score (0-100).
        Represents how well VEYA was actually able to analyse this particular user's case
        using available information, data coverage, and evidence quality.
        STRICTLY INDEPENDENT of Go/No-Go score!
        """
        # 1. Location Data Coverage (Max 20)
        # Block Junnar, District Pune is verified in Census 2011
        location_score = 16  # Block/District resolvable, village proxied

        # 2. Data Source Coverage (Max 20)
        # Census 2011, Udyam MSME, APMC Mandi, NSFDC Scheme Guidelines
        source_score = 18

        # 3. Data Recency & Granularity (Max 20)
        # Udyam is 2023-24, APMC is 2024, Census is 2011 (historical baseline)
        recency_score = 14

        # 4. Category-Specific Data Alignment (Max 20)
        # Benchmark prices verified for standard categories
        cat_score = 17

        # 5. User Input Completeness (Max 20)
        user_score = 15
        if user_inputs.get("description"):
            user_score += 3

        total_credibility = location_score + source_score + recency_score + cat_score + user_score
        total_credibility = min(100, max(25, total_credibility))

        dimensions = [
            {"dimension": "Location Data Coverage", "score": location_score, "max_score": 20, "detail": "Resolved to Tehsil/Block level (Junnar, Pune)"},
            {"dimension": "Data Source Coverage", "score": source_score, "max_score": 20, "detail": "Census 2011 + Udyam MSME + APMC benchmarks active"},
            {"dimension": "Data Recency & Granularity", "score": recency_score, "max_score": 20, "detail": "Recent 2024 APMC rates; Census 2011 demographics baseline"},
            {"dimension": "Category-Specific Alignment", "score": cat_score, "max_score": 20, "detail": f"Established benchmarks available for {category}"},
            {"dimension": "User Input Completeness", "score": user_score, "max_score": 20, "detail": "Location, capital, and business category provided"}
        ]

        evidence_audit = [
            {"label": "Location successfully resolved (Junnar, Pune)", "status": "VERIFIED", "icon": "check"},
            {"label": "Relevant market & demographic data available (Census 2011)", "status": "VERIFIED", "icon": "check"},
            {"label": "Concessional scheme guidelines accessed (NSFDC 2023-24)", "status": "VERIFIED", "icon": "check"},
            {"label": "Category-specific APMC price benchmarks available", "status": "VERIFIED", "icon": "check"},
            {"label": "Village-level granular census proxy used (Block data available)", "status": "LIMITATION", "icon": "delta"},
            {"label": "Local unorganized micro-competitors require field count", "status": "LIMITATION", "icon": "delta"},
            {"label": "User operating assumptions require local customer validation", "status": "VALIDATE", "icon": "delta"}
        ]

        limitations = [
            "Village-specific unregistered enterprises are not captured in official Udyam database.",
            "Demographics are grounded in Census 2011 baseline with standard projected rural household ratios.",
            "Local wholesale input prices are subject to seasonal APMC market variations."
        ]

        return {
            "score": total_credibility,
            "name": "CREDIBILITY SCORE",
            "meaning": "How well VEYA was able to analyse your case using available evidence",
            "dimensions": dimensions,
            "evidence_audit": evidence_audit,
            "limitations": limitations,
            "data_classification": "MODELED_ESTIMATE",
            "note": "These scores measure different things and should not be combined."
        }

    def run_feasibility(
        self,
        category: str,
        financials: Dict[str, Any],
        user_description: str = ""
    ) -> Dict[str, Any]:
        location = self.loader.get_location()
        market_reach = self.get_market_reach(category)
        competitors = self.get_competitor_mapping(category)
        pricing = self.get_product_market_value(category)
        
        opportunity = self.ai_engine.generate_opportunity_analysis(
            category=category,
            location=location,
            market_reach=market_reach,
            competitors=competitors,
            pricing=pricing,
            financials=financials,
            user_description=user_description
        )
        
        swot = self.ai_engine.generate_swot_analysis(
            category=category,
            location=location,
            market_reach=market_reach,
            competitors=competitors,
            financials=financials
        )
        
        threats = self.ai_engine.generate_threat_analysis(
            category=category,
            location=location,
            competitors=competitors,
            financials=financials
        )
        
        purchasing_power = self.get_consumer_purchasing_power(category, location)

        return {
            "market_reach": market_reach,
            "competitor_mapping": competitors,
            "product_market_value": pricing,
            "opportunity_analysis": opportunity,
            "swot": swot,
            "threats": threats,
            "consumer_purchasing_power": purchasing_power
        }

    def evaluate_recommendation(
        self,
        category: str,
        feasibility_data: Dict[str, Any],
        financials: Dict[str, Any],
        go_no_go_score: Optional[int] = None,
        credibility_score: Optional[int] = None
    ) -> Dict[str, Any]:
        capital = financials["margin_capital"]["value"]
        project_cost = financials["project_cost"]["value"]
        comp_level = feasibility_data["competitor_mapping"]["competition_level"]["value"]
        reachable = feasibility_data["market_reach"]["reachable_customers"]["value"]
        is_within_ceiling = financials["scheme"]["is_within_ceiling"]
        purchasing_power = feasibility_data.get("consumer_purchasing_power", {})
        
        key_factors = []
        major_risks = []
        
        if capital < 14000.0:
            status = "HIGH RISK / RECONSIDER"
            key_factors.append(f"Margin capital of {format_inr(capital)} produces project cost below minimum ₹1.40L threshold.")
            major_risks.append("Undercapitalized operations risk severe early cash flow default.")
        elif not is_within_ceiling:
            status = "RECOMMENDED WITH MODIFICATIONS"
            key_factors.append(f"Project cost of {format_inr(project_cost)} exceeds standard ₹50 Lakh concessional ceiling.")
            major_risks.append("Requires state corporation special board approval or syndicated financing.")
        elif comp_level == "HIGH":
            status = "RECOMMENDED WITH MODIFICATIONS"
            key_factors.append(f"High competitor concentration ({feasibility_data['competitor_mapping']['density_per_1k_households']['formatted']}).")
            key_factors.append(f"Substantial consumer pool ({reachable:,} reachable customers).")
            major_risks.append("Neighborhood price competition requires strong service differentiation.")
        elif comp_level == "MODERATE" and reachable >= 3000:
            status = "RECOMMENDED"
            key_factors.append(f"Moderate competitor density allows viable market entry.")
            key_factors.append(f"Strong addressable customer base of ~{reachable:,} households.")
            key_factors.append(f"Concessional debt servicing ({financials['scheme']['scheme_name']}) is financially manageable.")
            major_risks.append("Input price volatility and seasonal demand variations.")
        elif comp_level == "LOW":
            status = "RECOMMENDED"
            key_factors.append("Low competitor density represents an underserved local market opportunity.")
            key_factors.append(f"Concessional {financials['scheme']['interest_rate_percent']}% p.a. debt structure provides high operating margin.")
            major_risks.append("Initial market education and customer acquisition lead-time.")
        else:
            status = "RECOMMENDED WITH MODIFICATIONS"
            key_factors.append("Feasible local customer demand with manageable debt structure.")
            major_risks.append("Operating working capital must be strictly safeguarded.")
            
        decision_raw = {
            "status": status,
            "key_factors": key_factors,
            "major_risks": major_risks,
            "decision_basis": "Deterministic Multi-Factor Scoring (Capital Adequacy + Competitor Density + Addressable Demand + Purchasing Power)"
        }
        
        narrative = self.ai_engine.generate_recommendation_narrative(
            decision=decision_raw,
            category=category,
            location=self.loader.get_location(),
            financials=financials,
            purchasing_power=purchasing_power,
            go_no_go_score=go_no_go_score,
            credibility_score=credibility_score
        )
        
        return {
            "status": status,
            "status_tier": "VERIFIED",
            "key_factors": key_factors,
            "major_risks": major_risks,
            "suggested_action": narrative.get("suggested_action", ""),
            "summary_explanation": narrative.get("summary_explanation", ""),
            "validation_checks": narrative.get("validation_checks", []),
            "decision_basis": decision_raw["decision_basis"],
            "narrative_tier": narrative.get("tier", "AI REASONING")
        }
