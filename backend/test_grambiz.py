"""
test_grambiz.py - Comprehensive Unit Tests for GramBiz AI / VEYA.

Verifies:
- Project Cost (Capital / 0.10)
- Loan Eligibility (90% of Project Cost)
- Exact Scheme Routing at ₹1.40L Boundary (₹139,999 vs ₹140,000 vs ₹140,001)
- Concessional EMI & Moratorium schedule math
- Category-specific working capital multipliers
- Side-by-side What-If Simulator deltas & boundary crossings
- Edge cases: Zero capital, negative capital, >₹50L ceiling, invalid category, offline fallback
"""

import unittest
import math
from pathlib import Path

from financial import (
    calculate_project_cost,
    calculate_loan_eligibility,
    route_scheme,
    calculate_emi,
    generate_emi_schedule,
    estimate_working_capital,
    calculate_financials,
    simulate_what_if,
    SCHEME_THRESHOLD_INR,
    SCHEME_MAX_CEILING_INR
)
from data_loader import get_loader
from feasibility import FeasibilityEngine
from ai_engine import AIEngine

class TestFinancialEngine(unittest.TestCase):
    """Module 2 Deterministic Financial Engine Unit Tests."""

    def test_project_cost_and_loan_eligibility(self):
        cost = calculate_project_cost(100000.0)
        self.assertEqual(cost, 1000000.0)
        loan = calculate_loan_eligibility(cost)
        self.assertEqual(loan, 900000.0)
        self.assertAlmostEqual(cost * 0.10, 100000.0)

        cost_micro = calculate_project_cost(10000.0)
        self.assertEqual(cost_micro, 100000.0)
        loan_micro = calculate_loan_eligibility(cost_micro)
        self.assertEqual(loan_micro, 90000.0)

    def test_scheme_routing_exact_boundary(self):
        s_below = route_scheme(139999.0)
        self.assertEqual(s_below["scheme_name"], "Micro Finance Scheme")
        self.assertEqual(s_below["interest_rate_percent"], 6.5)
        self.assertEqual(s_below["tenure_years"], 3)
        self.assertEqual(s_below["moratorium_months"], 3)
        self.assertEqual(s_below["repayment_months"], 33)

        s_exact = route_scheme(140000.0)
        self.assertEqual(s_exact["scheme_name"], "Micro Finance Scheme")
        self.assertEqual(s_exact["interest_rate_percent"], 6.5)
        self.assertEqual(s_exact["tenure_years"], 3)
        self.assertEqual(s_exact["moratorium_months"], 3)
        self.assertEqual(s_exact["repayment_months"], 33)

        s_above = route_scheme(140001.0)
        self.assertEqual(s_above["scheme_name"], "Term Loan Scheme")
        self.assertEqual(s_above["interest_rate_percent"], 8.0)
        self.assertEqual(s_above["tenure_years"], 7)
        self.assertEqual(s_above["moratorium_months"], 6)
        self.assertEqual(s_above["repayment_months"], 78)

    def test_emi_and_moratorium_schedule_integrity(self):
        loan = 900000.0
        rate = 0.08
        years = 7
        moratorium = 6
        
        emi = calculate_emi(loan, rate, years, moratorium)
        self.assertGreater(emi, 0.0)
        self.assertAlmostEqual(emi, 14835.0, delta=5.0)

        schedule = generate_emi_schedule(loan, rate, years, moratorium)
        self.assertEqual(len(schedule), years * 12)

        for m in schedule[:moratorium]:
            self.assertEqual(m["principal_paid"], 0.0)
            self.assertEqual(m["phase"], "Moratorium (Grace Period)")
            self.assertEqual(m["remaining_balance"], loan)

        total_principal_repaid = sum(m["principal_paid"] for m in schedule[moratorium:])
        self.assertAlmostEqual(total_principal_repaid, loan, places=2)
        self.assertEqual(schedule[-1]["remaining_balance"], 0.0)

    def test_category_working_capital_multipliers(self):
        cost = 1000000.0
        wc_dairy = estimate_working_capital("Dairy", cost)
        self.assertEqual(wc_dairy["working_capital_amount"], 180000.0)
        self.assertEqual(wc_dairy["percentage"], 18.0)

        wc_grocery = estimate_working_capital("Grocery Retail", cost)
        self.assertEqual(wc_grocery["working_capital_amount"], 300000.0)
        self.assertEqual(wc_grocery["percentage"], 30.0)

        wc_textile = estimate_working_capital("Textile", cost)
        self.assertEqual(wc_textile["working_capital_amount"], 250000.0)
        self.assertEqual(wc_textile["percentage"], 25.0)

    def test_what_if_simulator_deltas(self):
        f_curr = calculate_financials(100000.0, "Dairy")
        sim = simulate_what_if(f_curr, 150000.0, "Dairy")

        deltas = sim["deltas"]
        self.assertEqual(deltas["capital"], 50000.0)
        self.assertEqual(deltas["project_cost"], 500000.0)
        self.assertEqual(deltas["loan"], 450000.0)
        self.assertFalse(deltas["scheme_changed"])

        f_small = calculate_financials(10000.0, "Dairy")
        sim_crossing = simulate_what_if(f_small, 20000.0, "Dairy")
        self.assertTrue(sim_crossing["deltas"]["scheme_changed"])
        self.assertEqual(sim_crossing["deltas"]["previous_scheme"], "Micro Finance Scheme")
        self.assertEqual(sim_crossing["deltas"]["new_scheme"], "Term Loan Scheme")

    def test_edge_cases_and_error_handling(self):
        with self.assertRaises(ValueError):
            calculate_project_cost(0.0)

        with self.assertRaises(ValueError):
            calculate_project_cost(-5000.0)

        f_large = calculate_financials(600000.0, "Dairy")
        self.assertFalse(f_large["scheme"]["is_within_ceiling"])
        self.assertEqual(f_large["project_cost"]["value"], 6000000.0)

class TestDataLoaderAndFeasibility(unittest.TestCase):
    def setUp(self):
        self.loader = get_loader()
        self.engine = FeasibilityEngine(self.loader)

    def test_data_loader_categories_and_location(self):
        categories = self.loader.get_categories()
        self.assertIn("Dairy", categories)
        self.assertIn("Textile", categories)
        self.assertIn("Grocery Retail", categories)
        self.assertIn("Food Processing", categories)
        self.assertIn("Small Manufacturing", categories)

        loc = self.loader.get_location()
        self.assertEqual(loc["block"], "Junnar")
        self.assertEqual(loc["district"], "Pune")
        self.assertEqual(loc["state"], "Maharashtra")

    def test_invalid_category_raises_key_error(self):
        with self.assertRaises(KeyError):
            self.loader.get_category_data("NonExistentBusiness")

    def test_data_loader_demo_census_dataset_and_metadata(self):
        self.assertEqual(self.loader.filepath.name, "demo_census_2011.json")
        census_meta = self.loader.get_census_metadata()
        self.assertTrue(bool(census_meta))
        
        title_stmt = census_meta.get("title_statement") or census_meta.get("document_description", {}).get("title_statement", {})
        self.assertEqual(title_stmt.get("idno"), "ORGI_PPT_2011_36")
        self.assertEqual(title_stmt.get("title"), "Rural Urban Distribution of Population")
        
        self.assertTrue(len(census_meta.get("resources", [])) >= 2)
        tags = [t.get("tag") for t in census_meta.get("tags", [])]
        self.assertIn("Census-2011", tags)
        
        demographics = self.loader.get_demographics()
        self.assertEqual(demographics.get("provenance", {}).get("catalog_idno"), "ORGI_PPT_2011_36")

    def test_feasibility_outputs_all_six_sections(self):
        fin = calculate_financials(100000.0, "Dairy")
        feasibility = self.engine.run_feasibility("Dairy", fin)

        self.assertIn("market_reach", feasibility)
        self.assertIn("competitor_mapping", feasibility)
        self.assertIn("product_market_value", feasibility)
        self.assertIn("opportunity_analysis", feasibility)
        self.assertIn("swot", feasibility)
        self.assertIn("threats", feasibility)
        self.assertIn("consumer_purchasing_power", feasibility)

        self.assertEqual(feasibility["market_reach"]["population"]["tier"], "VERIFIED")
        self.assertEqual(feasibility["market_reach"]["reachable_customers"]["tier"], "MODELED ESTIMATE")
        self.assertEqual(feasibility["competitor_mapping"]["registered_businesses"]["tier"], "VERIFIED")
        self.assertEqual(feasibility["competitor_mapping"]["competition_level"]["tier"], "MODELED ESTIMATE")
        self.assertEqual(feasibility["opportunity_analysis"]["tier"], "AI REASONING")
        self.assertEqual(feasibility["swot"]["tier"], "AI REASONING")

    def test_ai_engine_offline_fallback(self):
        engine = AIEngine(api_key="")
        self.assertFalse(engine.is_live)
        self.assertIn("DEMO MODE", engine.get_mode_banner())

    def test_recommendation_decisions(self):
        fin_low = calculate_financials(10000.0, "Dairy")
        feas_low = self.engine.run_feasibility("Dairy", fin_low)
        rec_low = self.engine.evaluate_recommendation("Dairy", feas_low, fin_low)
        self.assertEqual(rec_low["status"], "HIGH RISK / RECONSIDER")

        fin_high = calculate_financials(600000.0, "Dairy")
        feas_high = self.engine.run_feasibility("Dairy", fin_high)
        rec_high = self.engine.evaluate_recommendation("Dairy", feas_high, fin_high)
        self.assertEqual(rec_high["status"], "RECOMMENDED WITH MODIFICATIONS")

        fin_std = calculate_financials(100000.0, "Dairy")
        feas_std = self.engine.run_feasibility("Dairy", fin_std)
        rec_std = self.engine.evaluate_recommendation("Dairy", feas_std, fin_std)
        self.assertEqual(rec_std["status"], "RECOMMENDED")

        fin_groc = calculate_financials(100000.0, "Grocery Retail")
        feas_groc = self.engine.run_feasibility("Grocery Retail", fin_groc)
        rec_groc = self.engine.evaluate_recommendation("Grocery Retail", feas_groc, fin_groc)
        self.assertEqual(rec_groc["status"], "RECOMMENDED WITH MODIFICATIONS")

if __name__ == "__main__":
    unittest.main()
