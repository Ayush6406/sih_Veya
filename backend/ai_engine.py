"""
ai_engine.py - Qualitative Reasoning & AI Engine for VEYA / GramBiz AI.

Designed for clarity, simplicity, and low cognitive load:
- LLM is used ONLY for qualitative synthesis, opportunity analysis, SWOT, and threat reasoning.
- LLM NEVER performs numerical calculations or financial arithmetic.
- Produces crisp, human-readable insights tailored for first-time rural entrepreneurs.
- Falls back to [AI ENGINE: DEMO MODE] when no API key is set.
- Every generated output carries [AI REASONING].
"""

import os
import sys
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

DEMO_MODE_BANNER = "[AI ENGINE: DEMO MODE]"
LIVE_MODE_BANNER = "[AI ENGINE: LIVE GEMINI API]"

class AIEngine:
    """Orchestrates AI reasoning over grounded quantitative context."""

    def __init__(self, api_key: Optional[str] = None):
        if api_key is not None:
            self.api_key = api_key.strip()
        else:
            self.api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        self.is_live = bool(self.api_key)
        
    def get_mode_banner(self) -> str:
        return LIVE_MODE_BANNER if self.is_live else DEMO_MODE_BANNER

    def generate_opportunity_analysis(
        self,
        category: str,
        location: Dict[str, Any],
        market_reach: Dict[str, Any],
        competitors: Dict[str, Any],
        pricing: Dict[str, Any],
        financials: Dict[str, Any],
        user_description: str = ""
    ) -> Dict[str, Any]:
        """Generate concise opportunity analysis and top 3 niches."""
        if self.is_live:
            prompt = f"""
You are a qualitative reasoning layer over deterministic VEYA analysis.
Act as a rural business mentor for VEYA. Keep your response extremely concise, practical, and punchy.
Category: {category} in {location.get('block')}, {location.get('district')}.
Customers: ~{market_reach.get('reachable_customers', {}).get('value')}, Competition: {competitors.get('competition_level', {}).get('value')}.
Capital: {financials.get('margin_capital', {}).get('formatted')}, Project: {financials.get('project_cost', {}).get('formatted')}.

Return ONLY valid JSON:
{{
  "potential_opportunity": "1 single clear sentence summarizing the best local opportunity",
  "reasoning": "1 single clear sentence explaining why the data supports this",
  "suggested_niches": ["Niche 1 (under 8 words)", "Niche 2 (under 8 words)", "Niche 3 (under 8 words)"]
}}
"""
            result = self._call_gemini_json(prompt)
            if result and "potential_opportunity" in result and "reasoning" in result:
                return {
                    "potential_opportunity": result["potential_opportunity"],
                    "reasoning": result["reasoning"],
                    "suggested_niches": result.get("suggested_niches", [])[:3],
                    "tier": "AI REASONING",
                    "mode": "LIVE"
                }

        return self._template_opportunity(category, location, market_reach, competitors)

    def generate_swot_analysis(
        self,
        category: str,
        location: Dict[str, Any],
        market_reach: Dict[str, Any],
        competitors: Dict[str, Any],
        financials: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate punchy 2-item SWOT quadrant."""
        if self.is_live:
            prompt = f"""
Provide a crisp, easy-to-understand SWOT for {category} in {location.get('block')}.
Competition: {competitors.get('competition_level', {}).get('value')}, Loan: {financials.get('loan_eligibility', {}).get('formatted')} at {financials.get('scheme', {}).get('interest_rate_percent')}%.
Keep each point under 10 words.
Return ONLY valid JSON:
{{
  "strengths": ["Item 1", "Item 2"],
  "weaknesses": ["Item 1", "Item 2"],
  "opportunities": ["Item 1", "Item 2"],
  "threats": ["Item 1", "Item 2"]
}}
"""
            result = self._call_gemini_json(prompt)
            if result and all(k in result for k in ("strengths", "weaknesses", "opportunities", "threats")):
                return {
                    "strengths": result["strengths"][:2],
                    "weaknesses": result["weaknesses"][:2],
                    "opportunities": result["opportunities"][:2],
                    "threats": result["threats"][:2],
                    "tier": "AI REASONING",
                    "mode": "LIVE"
                }

        return self._template_swot(category, competitors, financials)

    def generate_threat_analysis(
        self,
        category: str,
        location: Dict[str, Any],
        competitors: Dict[str, Any],
        financials: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate top 3 critical threats with 1-line practical mitigations."""
        if self.is_live:
            prompt = f"""
List the top 3 practical threats and 1-line mitigations for {category} in {location.get('block')}.
Return ONLY valid JSON:
{{
  "threats": [
    {{"threat": "Threat Name", "risk_level": "LOW|MEDIUM|HIGH", "explanation": "1 short sentence", "mitigation": "1 actionable sentence"}}
  ]
}}
"""
            result = self._call_gemini_json(prompt)
            if result and isinstance(result.get("threats"), list):
                return result["threats"][:3]

        return self._template_threats(category, competitors, financials)

    def generate_recommendation_narrative(
        self,
        decision: Dict[str, Any],
        category: str,
        location: Dict[str, Any],
        financials: Dict[str, Any],
        purchasing_power: Optional[Dict[str, Any]] = None,
        go_no_go_score: Optional[int] = None,
        credibility_score: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate concise next steps and 1-sentence rationale with Gemini when available."""
        status = decision["status"]
        wc_fmt = financials.get("working_capital", {}).get("formatted", "₹1,80,000")
        scheme = financials.get("scheme", {}).get("scheme_name", "Concessional Scheme")

        if self.is_live:
            prompt = f"""
You are a qualitative reasoning layer over deterministic VEYA analysis.
The Final Go/No-Go Model Score measures how the user's business idea fares according to VEYA's model.
The Credibility Score independently measures how well VEYA was able to analyse this particular case using available evidence.
Never merge, modify, recalculate, or reinterpret these numerical scores.
Do not treat a low Credibility Score as evidence that the business is bad.
Do not treat a high Credibility Score as evidence that the business will succeed.
Use the supplied Consumer Purchasing Power values and evidence exactly as provided.
Do not invent local income, demand, prices, competitors, consumers, schemes or financial values.

Context:
Category: {category} in {location.get('block')}, {location.get('district')}
Margin Capital: {financials.get('margin_capital', {}).get('formatted')}
Project Cost: {financials.get('project_cost', {}).get('formatted')}
Scheme: {scheme} ({financials.get('scheme', {}).get('interest_rate_percent')}% p.a.)
Working Capital: {wc_fmt}
Go/No-Go Score: {go_no_go_score}/100
Credibility Score: {credibility_score}/100
Deterministic Status: {status}
Purchasing Power Band: {purchasing_power.get('band') if purchasing_power else 'Moderate'}

Return ONLY valid JSON:
{{
  "status": "{status}",
  "summary_explanation": "1-2 sentences explaining why the plan received this recommendation based on evidence",
  "key_reasons": ["Reason 1", "Reason 2", "Reason 3"],
  "major_risks": ["Risk 1", "Risk 2"],
  "suggested_action": "1 concrete immediate next action for this rural entrepreneur",
  "validation_checks": ["Check 1 to validate before investing", "Check 2 to validate before investing"]
}}
"""
            result = self._call_gemini_json(prompt)
            if result and "summary_explanation" in result:
                return {
                    "status": result.get("status", status),
                    "summary_explanation": result.get("summary_explanation", ""),
                    "key_reasons": result.get("key_reasons", decision.get("key_factors", [])),
                    "major_risks": result.get("major_risks", decision.get("major_risks", [])),
                    "suggested_action": result.get("suggested_action", ""),
                    "validation_checks": result.get("validation_checks", [
                        "Validate local village price willingness with 10 test buyers",
                        "Confirm electricity reliability and water availability at site"
                    ]),
                    "tier": "AI REASONING · GEMINI",
                    "mode": "LIVE"
                }

        # Deterministic fallback
        if status == "RECOMMENDED":
            action = f"Apply under {scheme} via district channel; keep {wc_fmt} reserved for operating cash flow."
            summary = f"Strong local feasibility with manageable competition and comfortable debt coverage."
        elif status == "RECOMMENDED WITH MODIFICATIONS":
            action = f"Start with phased capacity to conserve capital; reserve {wc_fmt} for working capital."
            summary = f"Commercially viable, but requires distinct service differentiation due to local competition."
        else:
            action = f"Consult local District Industries Centre (DIC) to restructure project scale or select a lower-competition category."
            summary = f"Elevated commercial risk due to high local enterprise density or insufficient starting capital."

        return {
            "status": status,
            "suggested_action": action,
            "summary_explanation": summary,
            "key_reasons": decision.get("key_factors", []),
            "major_risks": decision.get("major_risks", []),
            "validation_checks": [
                "Verify actual doorstep demand with 15 local village families",
                "Check APMC Mandi price fluctuations for past 3 months",
                "Confirm eligibility documents for concessional credit channel"
            ],
            "tier": "DETERMINISTIC FALLBACK",
            "mode": "DEMO"
        }

    def _call_gemini_json(self, prompt: str) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return None
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    return json.loads(text)
        except Exception:
            return None
        return None

    def _template_opportunity(self, category, location, market_reach, competitors):
        c_low = category.lower().strip()
        comp = competitors.get("competition_level", {}).get("value", "MODERATE")
        reach = market_reach.get("reachable_customers", {}).get("value", 4890)
        block = location.get("block", "Junnar")

        if "dairy" in c_low:
            return {
                "potential_opportunity": "Morning doorstep milk subscription & fresh paneer supply to village tea stalls.",
                "reasoning": f"Competition is {comp} with ~{reach:,} local households; direct retail adds ₹8-₹12/L margin over bulk collection.",
                "suggested_niches": [
                    "Early morning direct-to-home pure milk subscription",
                    "Daily fresh paneer supply for local tea stalls & weddings",
                    "A2 Gir cow milk for premium health-conscious buyers"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        elif "textile" in c_low:
            return {
                "potential_opportunity": "School uniform bulk contracting combined with custom bridal blouse stitching.",
                "reasoning": f"With {comp} competition, institutional uniform contracts provide steady guaranteed cash flow.",
                "suggested_niches": [
                    "Annual school uniform supply with advance deposits",
                    "Custom ladies blouse stitching with fast 48-hour delivery",
                    "Cotton daily wear stalls at weekly village haats"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        elif "grocery" in c_low:
            return {
                "potential_opportunity": "Phone/WhatsApp order home delivery and monthly agricultural ration kits.",
                "reasoning": f"Competition is {comp}; convenient doorstep delivery builds customer loyalty against established grocers.",
                "suggested_niches": [
                    "Pre-packed monthly household ration kits for farm families",
                    "Free doorstep delivery within 3km for phone/WhatsApp orders",
                    "Harvest-season bulk staple packages for agricultural labour"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        elif "food" in c_low:
            return {
                "potential_opportunity": "Hygienic stone-ground spice blending and custom grain milling job-work.",
                "reasoning": f"Competition is {comp} ({competitors.get('registered_businesses', {}).get('value', 14)} units); post-harvest spice milling demand is strong.",
                "suggested_niches": [
                    "Custom stone-ground chilli and turmeric post-harvest milling",
                    "Packaged 250g pure spices for local village kirana stores",
                    "Fresh multigrain flour milling (wheat, jowar, bajra)"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        else:  # Small Manufacturing
            return {
                "potential_opportunity": "Fly-ash bricks for rural housing (PMAY-G) and mobile agri implement welding.",
                "reasoning": f"Only {competitors.get('registered_businesses', {}).get('value', 8)} units recorded ({comp} competition); rural construction demand is growing.",
                "suggested_niches": [
                    "High-strength fly-ash bricks for rural housing schemes",
                    "On-site repair and welding for tractor trolleys & farm tools",
                    "Pre-cast cement well lining rings and irrigation slabs"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }

    def _template_swot(self, category, competitors, financials):
        c_low = category.lower().strip()
        scheme = financials.get("scheme", {}).get("scheme_name", "Concessional Scheme")
        rate = financials.get("scheme", {}).get("interest_rate_percent", 8.0)

        if "dairy" in c_low:
            return {
                "strengths": [
                    "Daily cash inflow providing immediate liquidity",
                    f"Low {rate}% interest rate under {scheme}"
                ],
                "weaknesses": [
                    "Livestock health requires strict veterinary care",
                    "Milk is perishable and requires same-day sale/cooling"
                ],
                "opportunities": [
                    "Value-addition into paneer and curd (+30% profit margin)",
                    "Direct supply agreements with local tea stalls and dhabas"
                ],
                "threats": [
                    "Summer dry fodder price spikes",
                    "Over-reliance on a single cooperative collection center"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        elif "textile" in c_low:
            return {
                "strengths": [
                    "High customization margin on tailored ethnic apparel",
                    "Non-perishable inventory with minimal spoilage"
                ],
                "weaknesses": [
                    "Revenue peaks seasonally around school admissions & festivals",
                    "High dependence on skilled tailoring hands"
                ],
                "opportunities": [
                    "Annual uniform supply contracts with local schools",
                    "Festival popup stalls at weekly rural haats"
                ],
                "threats": [
                    "Cheap factory readymade garments shipped from cities",
                    "Delayed customer payments for custom tailoring orders"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        elif "grocery" in c_low:
            return {
                "strengths": [
                    "Essential daily recurring demand for household food staples",
                    "Fast inventory turnover with frequent repeat visits"
                ],
                "weaknesses": [
                    "Thin profit margins (8-15%) on standard branded FMCG",
                    "Customer expectation of monthly credit ledgers (Khata)"
                ],
                "opportunities": [
                    "Direct farm sourcing of grains to capture wholesale margins",
                    "WhatsApp-assisted doorstep ordering for village homes"
                ],
                "threats": [
                    "Dense neighborhood shop competition",
                    "Cash flow lockup from unpaid customer credit accounts"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        elif "food" in c_low:
            return {
                "strengths": [
                    "Strong repeat customer loyalty for quality flour milling",
                    "Low competitor density in rural cluster"
                ],
                "weaknesses": [
                    "Dependence on stable 3-phase rural electricity supply",
                    "FSSAI food hygiene and dust extraction compliance"
                ],
                "opportunities": [
                    "Branded packaged spices for village grocery shops",
                    "Job-work grain processing during peak harvest seasons"
                ],
                "threats": [
                    "Unscheduled rural power outages during milling shifts",
                    "Sharp seasonal spikes in raw spice commodity costs"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }
        else:  # Small Manufacturing
            return {
                "strengths": [
                    "Very low competitor density in local block",
                    "High order ticket size for construction and fabrication"
                ],
                "weaknesses": [
                    "Requires higher initial machinery investment",
                    "Lumpy revenue cycles tied to construction and harvest"
                ],
                "opportunities": [
                    "Bulk brick supply for government rural housing (PMAY-G)",
                    "Harvest season agricultural machinery repair services"
                ],
                "threats": [
                    "Raw material price swings in steel and cement",
                    "Monsoon season slowdown in outdoor construction"
                ],
                "tier": "AI REASONING",
                "mode": "DEMO"
            }

    def _template_threats(self, category, competitors, financials):
        c_low = category.lower().strip()
        wc = financials.get("working_capital", {}).get("formatted", "₹1,80,000")

        if "dairy" in c_low:
            return [
                {
                    "threat": "Single Buyer Dependency",
                    "risk_level": "HIGH",
                    "explanation": "Selling all milk to one dairy center risks delayed payouts and price cuts.",
                    "mitigation": "Sell at least 40-50% directly to households and local tea stalls.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Feed Cost Inflation",
                    "risk_level": "MEDIUM",
                    "explanation": "Fodder prices rise sharply during summer, increasing per-litre cost.",
                    "mitigation": "Store green silage and arrange advance fodder purchases with local farms.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Veterinary & Health Risk",
                    "risk_level": "MEDIUM",
                    "explanation": "Unforeseen cattle illness can quickly disrupt daily milk yield.",
                    "mitigation": f"Enroll cattle in government livestock insurance and protect {wc} working capital.",
                    "tier": "AI REASONING"
                }
            ]
        elif "textile" in c_low:
            return [
                {
                    "threat": "Readymade Competition",
                    "risk_level": "HIGH",
                    "explanation": "Low-cost factory apparel creates price pressure on basic clothing.",
                    "mitigation": "Focus on custom fitting, blouse craftsmanship, and school uniforms.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Seasonal Revenue Swings",
                    "risk_level": "HIGH",
                    "explanation": "Demand concentrates around school re-openings and festive months.",
                    "mitigation": "Offer alteration job-work and year-round workwear uniforms in lean periods.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Institutional Payment Delays",
                    "risk_level": "MEDIUM",
                    "explanation": "Relying on one school for uniforms can lead to cash crunches if payments lag.",
                    "mitigation": "Contract with multiple institutions and mandate a 40% advance deposit.",
                    "tier": "AI REASONING"
                }
            ]
        elif "grocery" in c_low:
            return [
                {
                    "threat": "Customer Credit Default",
                    "risk_level": "HIGH",
                    "explanation": "Uncollected Khata credit given to village households freezes operating cash.",
                    "mitigation": "Cap credit limits at ₹1,500 per family and enforce strict monthly settlements.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Neighborhood Competition",
                    "risk_level": "HIGH",
                    "explanation": "Dense local shop presence makes walk-in customers price-sensitive.",
                    "mitigation": "Differentiate with WhatsApp doorstep delivery and fresher staple stock.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Deadweight Inventory",
                    "risk_level": "MEDIUM",
                    "explanation": "Capital locked in slow-moving novelty goods starves fast-moving provisions.",
                    "mitigation": "Allocate 80% of inventory funds strictly to fast-turnover daily staples.",
                    "tier": "AI REASONING"
                }
            ]
        elif "food" in c_low:
            return [
                {
                    "threat": "Rural Power Outages",
                    "risk_level": "MEDIUM",
                    "explanation": "Voltage drops and power cuts disrupt continuous grinding shifts.",
                    "mitigation": "Install heavy-duty motor phase protectors and schedule peak milling during stable hours.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Raw Spice Price Volatility",
                    "risk_level": "MEDIUM",
                    "explanation": "Dry chilli and turmeric prices surge if regional crop yields dip.",
                    "mitigation": "Purchase raw spices in bulk right at harvest when farm-gate prices are lowest.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Monsoon Moisture Damage",
                    "risk_level": "LOW",
                    "explanation": "Humidity during monsoon can spoil stored ground spices and flour.",
                    "mitigation": "Store milled goods in airtight food-grade moisture-sealed packaging.",
                    "tier": "AI REASONING"
                }
            ]
        else:  # Small Manufacturing
            return [
                {
                    "threat": "Raw Material Price Swings",
                    "risk_level": "HIGH",
                    "explanation": "Prices of structural steel, cement, and fly-ash fluctuate unpredictably.",
                    "mitigation": "Use cost-plus pricing contracts and secure distributor rate commitments.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Monsoon Construction Slowdown",
                    "risk_level": "HIGH",
                    "explanation": "Heavy rains pause brick curing and outdoor civil construction.",
                    "mitigation": "Stock cured bricks before monsoon and switch to workshop tool repairs in rainy months.",
                    "tier": "AI REASONING"
                },
                {
                    "threat": "Delayed Contractor Payouts",
                    "risk_level": "HIGH",
                    "explanation": "Civil contractors and panchayats frequently face 60-day administrative payout delays.",
                    "mitigation": "Mandate 35% advance deposits before casting and maintain direct private buyers.",
                    "tier": "AI REASONING"
                }
            ]

_engine_instance: Optional[AIEngine] = None

def get_ai_engine(api_key: Optional[str] = None) -> AIEngine:
    global _engine_instance
    if _engine_instance is None or api_key is not None:
        _engine_instance = AIEngine(api_key)
    return _engine_instance
