"""
main.py - CLI for VEYA (Venture Evaluation & Yield Advisory).

Hyper-Local Business Advisory and Financial Structuring Assistant.
Smart India Hackathon (SIH) Technical Proof-of-Concept.
"""

import os
import sys
import argparse
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

from data_loader import get_loader
from financial import calculate_financials, simulate_what_if, format_inr
from feasibility import FeasibilityEngine
from ai_engine import get_ai_engine
from report import generate_report

DIVIDER = "=" * 76
SUB_DIVIDER = "-" * 76

def print_header(location: Dict[str, Any], ai_engine, is_debug: bool = False):
    print()
    print(DIVIDER)
    print("             VEYA — HYPER-LOCAL ADVISORY ASSISTANT")
    print("       Venture Evaluation and Yield Advisory for Rural Micro-Entrepreneurs")
    print(DIVIDER)
    print(f"Location: {location.get('block')}, {location.get('district')}, {location.get('state')} (PIN: {location.get('pincode')})")
    print(f"Status:   Government-source static dataset  |  {ai_engine.get_mode_banner()}")
    if is_debug:
        prov = location.get("provenance", {})
        print(f"[DEBUG PROVENANCE] Source: {prov.get('source')} (Vintage: {prov.get('data_vintage')})")
    print(DIVIDER)
    print()

def print_decision_snapshot(go_no_go: Dict[str, Any], credibility: Dict[str, Any]):
    print(f"┌─ VEYA DECISION SNAPSHOT ─────────────────────────────────────────────┐")
    print(f"│ CARD 1: FINAL GO / NO-GO MODEL SCORE:  {go_no_go.get('score', 0):>3} / 100                     │")
    print(f"│  (How your business idea fares according to VEYA's analysis)         │")
    print(f"│                                                                      │")
    print(f"│ CARD 2: CREDIBILITY SCORE:             {credibility.get('score', 0):>3} / 100                     │")
    print(f"│  (How well VEYA was able to analyse your case using available data)  │")
    print(f"├──────────────────────────────────────────────────────────────────────┤")
    print(f"│ Note: These scores measure different things and should not be combined.│")
    print(f"└──────────────────────────────────────────────────────────────────────┘")
    print()

def print_purchasing_power(pp: Dict[str, Any]):
    print(f"┌─ LOCAL CONSUMER PURCHASING POWER [{pp.get('data_classification')}] ────────────────┐")
    print(f"│ Purchasing Power Band:  {pp.get('band'):<45}│")
    print(f"│ Consumer Base:          {pp.get('consumer_base'):<45}│")
    print(f"│ Affordability Evidence: {pp.get('affordability_evidence')[:45]:<45}│")
    print(f"│ Market Accessibility:   {pp.get('market_accessibility')[:45]:<45}│")
    print(f"└──────────────────────────────────────────────────────────────────────┘")
    print()

def run_orchestration(
    category: str,
    capital: float,
    description: str = "",
    is_demo: bool = False,
    is_debug: bool = False
):
    loader = get_loader()
    ai_engine = get_ai_engine()
    feasibility_engine = FeasibilityEngine(loader, ai_engine)
    location = loader.get_location()

    print_header(location, ai_engine, is_debug)

    # Step 1: Feasibility
    financials = calculate_financials(capital, category)
    feasibility_data = feasibility_engine.run_feasibility(category, financials, description)
    purchasing_power = feasibility_data.get("consumer_purchasing_power", {})

    # Dual Scores
    go_no_go = feasibility_engine.calculate_go_no_go_score(category, financials, feasibility_data, purchasing_power)
    credibility = feasibility_engine.calculate_credibility_score(category, location, {"description": description})

    print_decision_snapshot(go_no_go, credibility)
    print_purchasing_power(purchasing_power)

    # Step 2: Financial Plan
    print(f"┌─ STEP 2: CONCESSIONAL FINANCIAL PLAN ───────────────────────────────┐")
    print(f"│ Margin Equity (10%):     {financials['margin_capital']['formatted']:<16} [VERIFIED]           │")
    print(f"│ Total Project Cost:      {financials['project_cost']['formatted']:<16} [VERIFIED]           │")
    print(f"│ Concessional Loan (90%): {financials['loan_eligibility']['formatted']:<16} [VERIFIED]           │")
    print(f"│ Matched Scheme:          {financials['scheme']['scheme_name']:<16} [VERIFIED - NSFDC]   │")
    print(f"│ Concessional Interest:   {str(financials['scheme']['interest_rate_percent']) + '% p.a.':<16} [VERIFIED]           │")
    print(f"│ Monthly Repayment (EMI): {financials['emi']['formatted'] + ' / month':<16} [VERIFIED]           │")
    print(f"│ Working Capital Reserve: {financials['working_capital']['formatted']:<16} [VERIFIED]           │")
    print(f"└──────────────────────────────────────────────────────────────────────┘")
    print()

    # Step 3: Recommendation
    recommendation = feasibility_engine.evaluate_recommendation(
        category, feasibility_data, financials,
        go_no_go_score=go_no_go.get("score"),
        credibility_score=credibility.get("score")
    )

    print(f"┌─ FINAL RECOMMENDATION ───────────────────────────────────────────────┐")
    print(f"│ VERDICT: {recommendation['status']:<59}│")
    print(f"│ ACTION:  {recommendation['suggested_action'][:59]:<59}│")
    print(f"└──────────────────────────────────────────────────────────────────────┘")
    print()

    # Step 4: Export report
    scores = {"go_no_go": go_no_go, "credibility": credibility}
    input_meta = {
        "business_category": category,
        "capital": capital,
        "capital_formatted": format_inr(capital),
        "description": description
    }
    report_file = generate_report(location, input_meta, feasibility_data, financials, recommendation, scores=scores)
    print(f"Report exported to: {report_file}")

def main():
    parser = argparse.ArgumentParser(description="VEYA AI - Rural Business Advisory Assistant")
    parser.add_argument("--demo", action="store_true", help="Run automated demo")
    parser.add_argument("--debug", action="store_true", help="Debug mode")
    args = parser.parse_args()

    run_orchestration(
        category="Dairy",
        capital=100000.0,
        description="Fresh morning cow and buffalo milk delivery with paneer.",
        is_demo=True,
        is_debug=args.debug
    )

if __name__ == "__main__":
    main()
