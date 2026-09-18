import React from "react";
import { X, Download, FileText, Printer, Check, Copy } from "lucide-react";
import { AssessmentReport } from "../types";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AssessmentReport;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen) return null;

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `veya_report_${report.input.category.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadSummaryTxt = () => {
    const txt = `================================================================================
             VEYA — VENTURE EVALUATION YIELD ANALYSIS
================================================================================
BUSINESS:       ${report.input.category.toUpperCase()}
LOCATION:       ${report.location.village}, ${report.location.block}, ${report.location.district} (${report.location.state})
FINAL VERDICT:  ${report.recommendation.status}
--------------------------------------------------------------------------------
VEYA DUAL INDEPENDENT SCORES:
• Final Go / No-Go Model Score:   ${report.decision_snapshot.go_no_go.score} / 100
  (How your business idea fares according to VEYA's analysis)
• Credibility Score:             ${report.decision_snapshot.credibility.score} / 100
  (How well VEYA was able to analyse your case using available evidence)
  [Note: These scores measure different things and should not be combined]
--------------------------------------------------------------------------------
LOCAL CONSUMER PURCHASING POWER:
• Purchasing Power Band:          ${report.hyper_local.consumer_purchasing_power.band} [MODELED ESTIMATE]
• Target Consumer Base:           ${report.hyper_local.consumer_purchasing_power.consumer_base}
• Affordability Evidence:         ${report.hyper_local.consumer_purchasing_power.affordability_evidence}
--------------------------------------------------------------------------------
FINANCIAL STRUCTURING (100% Deterministic Concessional Scheme)
• Your Margin Capital (10%):      ${report.financial_plan.margin_capital.formatted} [VERIFIED]
• Total Project Cost:             ${report.financial_plan.project_cost.formatted} [VERIFIED]
• Concessional Govt Loan (90%):   ${report.financial_plan.loan_eligibility.formatted} [VERIFIED]
• Matched Concessional Scheme:    ${report.financial_plan.scheme.scheme_name} (${report.financial_plan.scheme.interest_rate_percent}% p.a.)
• Total Tenure & Grace Period:    ${report.financial_plan.scheme.tenure_years} Years (${report.financial_plan.scheme.moratorium_months} Months Grace Period)
• Monthly Repayment (EMI):        ${report.financial_plan.emi.formatted} / month [VERIFIED]
• Required Working Capital:       ${report.financial_plan.working_capital.formatted} [VERIFIED]
--------------------------------------------------------------------------------
MARKET & FEASIBILITY SNAPSHOT
• Local Reachable Customers:      ~${report.feasibility.market_reach.reachable_customers.formatted} households [MODELED]
• Competitor Density:             ${report.feasibility.competitor_mapping.density_per_1k_households.formatted} (${report.feasibility.competitor_mapping.competition_level.value} competition)
• Primary Prime Opportunity:      ${report.feasibility.opportunity.potential_opportunity}
--------------------------------------------------------------------------------
IMMEDIATE ACTION PLAN:
${report.recommendation.suggested_action}
================================================================================
`;
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `veya_summary_${report.input.category.toLowerCase().replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#DFE7D8] shadow-2xl max-w-lg w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8EEE5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F4E7] text-[#1E5D38] flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#142C1D]">
                Export Assessment Report
              </h3>
              <p className="text-xs text-[#526354]">
                Download official documentation for bank loan applications and committee reviews.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6F0] hover:bg-[#EAEFE6] text-[#4A5D4D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 text-xs">
          {/* Option 1: 1-Page Summary TXT */}
          <div
            onClick={downloadSummaryTxt}
            className="p-4 rounded-2xl border border-[#D8E6D6] bg-[#FAFDF9] hover:bg-[#F2F8F1] cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D0E0CE] text-[#1E5D38] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#142C1D]">
                  Executive Summary Card (veya_summary.txt)
                </h4>
                <p className="text-[#556957] text-[11px] mt-0.5">
                  1-page readable text card suitable for SMS, WhatsApp, and quick loan officer review.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#1E5D38] group-hover:translate-y-0.5 transition-transform" />
          </div>

          {/* Option 2: Full JSON Dataset */}
          <div
            onClick={downloadJSON}
            className="p-4 rounded-2xl border border-[#D8E6D6] bg-[#FAFDF9] hover:bg-[#F2F8F1] cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D0E0CE] text-[#1E5D38] flex items-center justify-center font-mono font-bold text-xs">
                JSON
              </div>
              <div>
                <h4 className="font-bold text-[#142C1D]">
                  Complete Machine-Readable Report (veya_report.json)
                </h4>
                <p className="text-[#556957] text-[11px] mt-0.5">
                  Complete structured object including demographic baseline, repayment table, and SWOT.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#1E5D38] group-hover:translate-y-0.5 transition-transform" />
          </div>

          {/* Option 3: Print / PDF */}
          <div
            onClick={handlePrint}
            className="p-4 rounded-2xl border border-[#D8E6D6] bg-[#FAFDF9] hover:bg-[#F2F8F1] cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D0E0CE] text-[#1E5D38] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#142C1D]">
                  Print Clean Advisory Document (PDF)
                </h4>
                <p className="text-[#556957] text-[11px] mt-0.5">
                  Formatted high-contrast print layout designed for district credit meetings.
                </p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-[#1E5D38]" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F0F4EC] text-[#29422F] hover:bg-[#E5ECE0] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
