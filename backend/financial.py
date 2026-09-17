"""
financial.py - Deterministic Financial Engine (Module 2) for GramBiz AI / VEYA.

Implements 100% deterministic mathematical calculations for:
- Project Cost = Margin Capital / 0.10
- Loan Eligibility = 90% of Project Cost
- Two-branch scheme routing at ₹1,40,000 threshold
- Reducing-balance monthly EMI calculation with moratorium adjustment
- Complete repayment schedule generation
- Category-specific working capital estimation
- Side-by-side What-If capital simulation

NO LLM logic is used in this module. All outputs are tagged [VERIFIED].
"""

import sys
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

from typing import Dict, Any, List, Optional
import math

# Scheme routing constants mandated by roadmap & problem statement
SCHEME_THRESHOLD_INR = 140000.0  # ₹1.40 Lakhs
SCHEME_MAX_CEILING_INR = 5000000.0  # ₹50 Lakhs (NSFDC upper ceiling)

MICRO_FINANCE_SCHEME = {
    "name": "Micro Finance Scheme",
    "interest_rate": 0.065,  # 6.5% p.a.
    "tenure_years": 3,
    "moratorium_months": 3,
    "source": "NSFDC Micro Credit Finance (MCF) Policy Guidelines"
}

TERM_LOAN_SCHEME = {
    "name": "Term Loan Scheme",
    "interest_rate": 0.08,  # 8.0% p.a.
    "tenure_years": 7,
    "moratorium_months": 6,
    "source": "NSFDC Term Loan Scheme Policy Guidelines"
}

# Working capital multiplier guidelines by category
CATEGORY_WORKING_CAPITAL_RATIOS = {
    "dairy": 0.18,
    "textile": 0.25,
    "grocery retail": 0.30,
    "food processing": 0.22,
    "small manufacturing": 0.25
}

def format_inr(number: float) -> str:
    """Format numbers into Indian Lakhs/Crores numbering system with rupee symbol."""
    neg = "-" if number < 0 else ""
    number = abs(number)
    int_part = int(round(number))
    s = str(int_part)
    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        rest = s[:-3]
        groups = []
        while len(rest) > 2:
            groups.append(rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.append(rest)
        groups.reverse()
        formatted = ",".join(groups) + "," + last3
    return f"{neg}₹{formatted}"

def calculate_project_cost(margin_capital: float) -> float:
    """
    Project Cost = Margin Capital / 0.10 (Since promoter margin is 10%).
    """
    if margin_capital <= 0:
        raise ValueError("Margin capital must be a positive number greater than 0.")
    return margin_capital / 0.10

def calculate_loan_eligibility(project_cost: float) -> float:
    """
    Loan Eligibility = 90% of Project Cost.
    """
    if project_cost <= 0:
        raise ValueError("Project cost must be greater than 0.")
    return project_cost * 0.90

def route_scheme(project_cost: float) -> Dict[str, Any]:
    """
    Route to applicable concessional scheme based on ₹1.40L threshold.
    - Project Cost <= ₹1.40L -> Micro Finance Scheme (6.5%, 3yr, 3mo moratorium)
    - Project Cost > ₹1.40L -> Term Loan Scheme (8.0%, 7yr, 6mo moratorium)
    """
    if project_cost <= SCHEME_THRESHOLD_INR:
        return {
            "scheme_name": MICRO_FINANCE_SCHEME["name"],
            "interest_rate_percent": MICRO_FINANCE_SCHEME["interest_rate"] * 100.0,
            "interest_rate_decimal": MICRO_FINANCE_SCHEME["interest_rate"],
            "tenure_years": MICRO_FINANCE_SCHEME["tenure_years"],
            "tenure_months": MICRO_FINANCE_SCHEME["tenure_years"] * 12,
            "moratorium_months": MICRO_FINANCE_SCHEME["moratorium_months"],
            "repayment_months": (MICRO_FINANCE_SCHEME["tenure_years"] * 12) - MICRO_FINANCE_SCHEME["moratorium_months"],
            "is_within_ceiling": True,
            "source": MICRO_FINANCE_SCHEME["source"]
        }
    else:
        is_within_ceiling = project_cost <= SCHEME_MAX_CEILING_INR
        return {
            "scheme_name": TERM_LOAN_SCHEME["name"],
            "interest_rate_percent": TERM_LOAN_SCHEME["interest_rate"] * 100.0,
            "interest_rate_decimal": TERM_LOAN_SCHEME["interest_rate"],
            "tenure_years": TERM_LOAN_SCHEME["tenure_years"],
            "tenure_months": TERM_LOAN_SCHEME["tenure_years"] * 12,
            "moratorium_months": TERM_LOAN_SCHEME["moratorium_months"],
            "repayment_months": (TERM_LOAN_SCHEME["tenure_years"] * 12) - TERM_LOAN_SCHEME["moratorium_months"],
            "is_within_ceiling": is_within_ceiling,
            "source": TERM_LOAN_SCHEME["source"]
        }

def calculate_emi(loan_amount: float, annual_rate: float, tenure_years: int, moratorium_months: int) -> float:
    """
    Calculate monthly EMI on reducing balance basis.
    Moratorium Assumption:
    Principal amortization begins after the initial moratorium_months grace period.
    The loan principal is amortized over the remaining active repayment months:
    n = (tenure_years * 12) - moratorium_months.
    Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    """
    if loan_amount <= 0:
        return 0.0
        
    total_months = tenure_years * 12
    repayment_months = total_months - moratorium_months
    if repayment_months <= 0:
        raise ValueError("Repayment period must be greater than moratorium period.")
        
    monthly_rate = annual_rate / 12.0
    if monthly_rate == 0:
        return loan_amount / repayment_months
        
    factor = math.pow(1.0 + monthly_rate, repayment_months)
    emi = loan_amount * monthly_rate * factor / (factor - 1.0)
    return round(emi, 2)

def generate_emi_schedule(loan_amount: float, annual_rate: float, tenure_years: int, moratorium_months: int) -> List[Dict[str, Any]]:
    """
    Generate month-by-month repayment schedule including moratorium and post-moratorium installments.
    """
    schedule = []
    total_months = tenure_years * 12
    monthly_rate = annual_rate / 12.0
    balance = float(loan_amount)
    
    # 1. Moratorium months: principal repayment deferred
    for month in range(1, moratorium_months + 1):
        schedule.append({
            "month": month,
            "phase": "Moratorium (Grace Period)",
            "principal_paid": 0.0,
            "interest_paid": 0.0,
            "total_installment": 0.0,
            "remaining_balance": round(balance, 2)
        })
        
    # 2. Amortization phase
    repayment_months = total_months - moratorium_months
    emi = calculate_emi(loan_amount, annual_rate, tenure_years, moratorium_months)
    
    for r_month in range(1, repayment_months + 1):
        calendar_month = moratorium_months + r_month
        interest_for_month = balance * monthly_rate
        
        if r_month == repayment_months:
            # Final month exact rounding adjustment
            already_repaid = sum(item["principal_paid"] for item in schedule[moratorium_months:])
            principal_for_month = round(loan_amount - already_repaid, 2)
            actual_payment = principal_for_month + interest_for_month
            balance = 0.0
        else:
            principal_for_month = emi - interest_for_month
            if principal_for_month > balance:
                principal_for_month = balance
                balance = 0.0
            else:
                balance -= principal_for_month
            actual_payment = emi
            
        schedule.append({
            "month": calendar_month,
            "repayment_installment_no": r_month,
            "phase": "Active Repayment",
            "principal_paid": round(principal_for_month, 2),
            "interest_paid": round(interest_for_month, 2),
            "total_installment": round(actual_payment, 2),
            "remaining_balance": max(0.0, round(balance, 2))
        })
        
    return schedule

def estimate_working_capital(business_category: str, project_cost: float) -> Dict[str, Any]:
    """
    Estimate working capital buffer based on standard sector norms.
    """
    key = business_category.lower().strip()
    ratio = CATEGORY_WORKING_CAPITAL_RATIOS.get(key, 0.20)
    working_capital_amount = round(project_cost * ratio, 2)
    return {
        "working_capital_amount": working_capital_amount,
        "ratio": ratio,
        "percentage": ratio * 100.0
    }

def calculate_financials(margin_capital: float, business_category: str) -> Dict[str, Any]:
    """
    Complete deterministic financial plan calculation.
    All fields tagged [VERIFIED] as pure formula outputs.
    """
    project_cost = calculate_project_cost(margin_capital)
    loan_eligibility = calculate_loan_eligibility(project_cost)
    scheme_info = route_scheme(project_cost)
    
    emi = calculate_emi(
        loan_amount=loan_eligibility,
        annual_rate=scheme_info["interest_rate_decimal"],
        tenure_years=scheme_info["tenure_years"],
        moratorium_months=scheme_info["moratorium_months"]
    )
    
    schedule = generate_emi_schedule(
        loan_amount=loan_eligibility,
        annual_rate=scheme_info["interest_rate_decimal"],
        tenure_years=scheme_info["tenure_years"],
        moratorium_months=scheme_info["moratorium_months"]
    )
    
    wc_info = estimate_working_capital(business_category, project_cost)
    
    return {
        "margin_capital": {
            "value": margin_capital,
            "formatted": format_inr(margin_capital),
            "tier": "VERIFIED",
            "source": "User Input (Promoter Equity 10%)"
        },
        "project_cost": {
            "value": project_cost,
            "formatted": format_inr(project_cost),
            "tier": "VERIFIED",
            "source": "Deterministic Formula (Margin Capital / 0.10)"
        },
        "loan_eligibility": {
            "value": loan_eligibility,
            "formatted": format_inr(loan_eligibility),
            "tier": "VERIFIED",
            "source": "Deterministic Formula (90% of Project Cost)"
        },
        "scheme": {
            "scheme_name": scheme_info["scheme_name"],
            "interest_rate_percent": scheme_info["interest_rate_percent"],
            "tenure_years": scheme_info["tenure_years"],
            "moratorium_months": scheme_info["moratorium_months"],
            "is_within_ceiling": scheme_info["is_within_ceiling"],
            "tier": "VERIFIED",
            "source": scheme_info["source"]
        },
        "emi": {
            "value": emi,
            "formatted": format_inr(emi),
            "frequency": "Monthly",
            "repayment_months": scheme_info["repayment_months"],
            "tier": "VERIFIED",
            "source": "Deterministic Reducing Balance Formula (Post-moratorium)"
        },
        "working_capital": {
            "value": wc_info["working_capital_amount"],
            "formatted": format_inr(wc_info["working_capital_amount"]),
            "ratio_percent": wc_info["percentage"],
            "tier": "VERIFIED",
            "source": f"Sector Guideline Multiplier ({wc_info['percentage']}% of Project Cost)"
        },
        "repayment_schedule": schedule,
        "calculation_status": "DETERMINISTIC"
    }

def simulate_what_if(current_financials: Dict[str, Any], new_margin_capital: float, business_category: str) -> Dict[str, Any]:
    """
    Run identical financial engine for what-if capital input and compute deltas.
    """
    new_financials = calculate_financials(new_margin_capital, business_category)
    
    curr_cap = current_financials["margin_capital"]["value"]
    curr_cost = current_financials["project_cost"]["value"]
    curr_loan = current_financials["loan_eligibility"]["value"]
    curr_emi = current_financials["emi"]["value"]
    curr_wc = current_financials["working_capital"]["value"]
    
    new_cap = new_financials["margin_capital"]["value"]
    new_cost = new_financials["project_cost"]["value"]
    new_loan = new_financials["loan_eligibility"]["value"]
    new_emi = new_financials["emi"]["value"]
    new_wc = new_financials["working_capital"]["value"]
    
    curr_scheme = current_financials["scheme"]["scheme_name"]
    new_scheme = new_financials["scheme"]["scheme_name"]
    
    return {
        "current": current_financials,
        "what_if": new_financials,
        "deltas": {
            "capital": round(new_cap - curr_cap, 2),
            "capital_formatted": ("+" if new_cap >= curr_cap else "") + format_inr(new_cap - curr_cap),
            "project_cost": round(new_cost - curr_cost, 2),
            "project_cost_formatted": ("+" if new_cost >= curr_cost else "") + format_inr(new_cost - curr_cost),
            "loan": round(new_loan - curr_loan, 2),
            "loan_formatted": ("+" if new_loan >= curr_loan else "") + format_inr(new_loan - curr_loan),
            "emi": round(new_emi - curr_emi, 2),
            "emi_formatted": ("+" if new_emi >= curr_emi else "") + format_inr(new_emi - curr_emi),
            "working_capital": round(new_wc - curr_wc, 2),
            "working_capital_formatted": ("+" if new_wc >= curr_wc else "") + format_inr(new_wc - curr_wc),
            "scheme_changed": curr_scheme != new_scheme,
            "previous_scheme": curr_scheme,
            "new_scheme": new_scheme
        }
    }
