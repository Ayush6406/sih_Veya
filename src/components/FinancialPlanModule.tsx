import React, { useState } from "react";
import { 
  IndianRupee, 
  ShieldCheck, 
  Calendar, 
  Percent, 
  Clock, 
  ArrowDownRight, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Layers
} from "lucide-react";
import { FinancialPlan } from "../types";

interface FinancialPlanModuleProps {
  financials: FinancialPlan;
}

export const FinancialPlanModule: React.FC<FinancialPlanModuleProps> = ({ financials }) => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const {
    margin_capital,
    project_cost,
    loan_eligibility,
    scheme,
    emi,
    working_capital,
    repayment_schedule,
  } = financials;

  return (
    <div className="bg-white rounded-3xl border border-[#DFE7D8] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8EEE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E5D38] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Concessional Financing Model</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              Modeled Estimate · Deterministic
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D] mt-1">
            Deterministic Concessional Financial Plan
          </h2>
          <p className="text-xs text-[#526354] mt-0.5">
            Structured strictly under National Scheduled Castes Finance & Development Corporation (NSFDC) and Mudra guidelines.
          </p>
        </div>

        {/* Matched Scheme Pill */}
        <div className="bg-[#FAFDF9] border border-[#D1E3D0] px-3.5 py-2 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E8F4E7] text-[#1E5D38] flex items-center justify-center font-bold text-sm">
            %
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#627564] block">
              Matched Scheme
            </span>
            <span className="text-xs font-bold text-[#142C1D]">
              {scheme.scheme_name}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Margin Capital */}
        <div className="bg-[#FAFDF9] p-4 rounded-2xl border border-[#DFE8DC] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#677969]">
              Your Margin Capital
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Verified
            </span>
          </div>
          <span className="text-xl font-bold text-[#142C1D] block">
            {margin_capital.formatted}
          </span>
          <span className="text-[10px] text-[#69796C] block">
            10% Promoter Contribution
          </span>
        </div>

        {/* Project Cost */}
        <div className="bg-[#FAFDF9] p-4 rounded-2xl border border-[#DFE8DC] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#677969]">
              Total Project Cost
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Modeled Estimate
            </span>
          </div>
          <span className="text-xl font-bold text-[#142C1D] block">
            {project_cost.formatted}
          </span>
          <span className="text-[10px] text-[#69796C] block">
            Formula: Margin ÷ 0.10
          </span>
        </div>

        {/* Loan Amount */}
        <div className="bg-[#FAFDF9] p-4 rounded-2xl border border-[#DFE8DC] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#677969]">
              Concessional Loan
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Modeled Estimate
            </span>
          </div>
          <span className="text-xl font-bold text-[#1E5D38] block">
            {loan_eligibility.formatted}
          </span>
          <span className="text-[10px] text-emerald-700 block">
            90% Credit Facility
          </span>
        </div>

        {/* Monthly EMI */}
        <div className="bg-[#FAFDF9] p-4 rounded-2xl border border-[#DFE8DC] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#677969]">
              Monthly Installment
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Modeled Estimate
            </span>
          </div>
          <span className="text-xl font-bold text-[#142C1D] block">
            {emi.formatted}
          </span>
          <span className="text-[10px] text-[#69796C] block">
            Post-grace amortized
          </span>
        </div>
      </div>

      {/* Concessional Scheme Terms Callout */}
      <div className="bg-[#F6FAF4] border border-[#D5E6D4] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4D2B] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#1E5D38]" />
            <span>Detailed Loan Terms & Grace Period Policy</span>
          </h4>
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Verified Scheme Norms
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-[#617463] block">Interest Rate</span>
            <span className="font-bold text-[#142C1D] text-sm">
              {scheme.interest_rate_percent}% p.a.
            </span>
            <span className="text-[10px] text-[#718274] block">Concessional fixed rate</span>
          </div>

          <div>
            <span className="text-[10px] text-[#617463] block">Total Tenure</span>
            <span className="font-bold text-[#142C1D] text-sm">
              {scheme.tenure_years} Years
            </span>
            <span className="text-[10px] text-[#718274] block">
              {scheme.tenure_years * 12} Total Months
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#617463] block">Moratorium (Grace)</span>
            <span className="font-bold text-amber-800 text-sm">
              {scheme.moratorium_months} Months
            </span>
            <span className="text-[10px] text-amber-700 block">
              ₹0 Principal during setup
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#617463] block">Working Capital Buffer</span>
            <span className="font-bold text-[#1E5D38] text-sm">
              {working_capital.formatted}
            </span>
            <span className="text-[10px] text-[#718274] block">
              {working_capital.ratio_percent}% of Project Cost
            </span>
          </div>
        </div>
      </div>

      {/* Repayment Amortization Schedule Preview */}
      <div className="border border-[#E2EBDD] rounded-2xl overflow-hidden text-xs">
        <div className="bg-[#F8FAF5] px-4 py-3 border-b border-[#E2EBDD] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#1A3723]">
            <Calendar className="w-4 h-4 text-[#1E5D38]" />
            <span>Repayment Amortization Schedule</span>
            <span className="text-[10px] font-normal text-[#586B5A]">
              ({scheme.moratorium_months} months grace + {scheme.repayment_months} active months)
            </span>
          </div>

          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-semibold text-[#1E5D38] hover:underline flex items-center gap-1"
          >
            <span>{showFullSchedule ? "Show First 6 Months" : "Show Full Schedule"}</span>
            {showFullSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F6EE] text-[10px] uppercase font-bold text-[#4B5E4F] border-b border-[#E2EBDD]">
                <th className="px-3.5 py-2">Month</th>
                <th className="px-3.5 py-2">Phase</th>
                <th className="px-3.5 py-2">Principal Paid</th>
                <th className="px-3.5 py-2">Interest Paid</th>
                <th className="px-3.5 py-2">Total Payment</th>
                <th className="px-3.5 py-2">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF0E8] text-[11px]">
              {(showFullSchedule ? repayment_schedule : repayment_schedule.slice(0, 6)).map((row) => {
                const isGrace = row.phase.includes("Moratorium");

                return (
                  <tr
                    key={row.month}
                    className={isGrace ? "bg-amber-50/40 text-amber-900" : "hover:bg-[#F9FCF8]"}
                  >
                    <td className="px-3.5 py-2 font-medium">Month {row.month}</td>
                    <td className="px-3.5 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isGrace ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {row.phase}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 font-medium">
                      ₹{Math.round(row.principal_paid).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2">
                      ₹{Math.round(row.interest_paid).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-[#142C1D]">
                      ₹{Math.round(row.total_installment).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2 font-medium">
                      ₹{Math.round(row.remaining_balance).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
