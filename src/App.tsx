import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Sparkles, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  HelpCircle, 
  CheckCircle2, 
  Printer,
  ChevronRight,
  ShieldCheck,
  MapPin,
  ArrowUp
} from "lucide-react";

import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AssessmentWizard } from "./components/AssessmentWizard";
import { LoadingAnalysis } from "./components/LoadingAnalysis";
import { DecisionSnapshotCard } from "./components/DecisionSnapshotCard";
import { RecommendationBanner } from "./components/RecommendationBanner";
import { PurchasingPowerModule } from "./components/PurchasingPowerModule";
import { FinancialPlanModule } from "./components/FinancialPlanModule";
import { MarketFeasibilityModule } from "./components/MarketFeasibilityModule";
import { AIReasoningModule } from "./components/AIReasoningModule";
import { WhatIfSimulatorModal } from "./components/WhatIfSimulatorModal";
import { ChatAssistantModal } from "./components/ChatAssistantModal";
import { ExportReportModal } from "./components/ExportReportModal";
import { VeyaLogo } from "./components/VeyaLogo";

import { AssessmentReport, BusinessCategory, LocationData } from "./types";

export default function App() {
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState("Dairy");
  const [loadingLocation, setLoadingLocation] = useState("Junnar, Pune");

  // Modals
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Scroll to wizard
  const scrollToWizard = () => {
    const el = document.getElementById("assessment-wizard");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Run assessment
  const handleRunAssessment = async (data: {
    category: BusinessCategory;
    capital: number;
    location: LocationData;
    description: string;
  }) => {
    setLoadingCategory(data.category);
    setLoadingLocation(`${data.location.block || "Junnar"}, ${data.location.district || "Pune"}`);
    setIsLoading(true);

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to generate assessment");
      }

      const reportData: AssessmentReport = await res.json();
      setReport(reportData);

      // Smooth scroll to report
      setTimeout(() => {
        const reportEl = document.getElementById("advisory-report-view");
        if (reportEl) {
          reportEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    } catch (err) {
      console.error("Error generating assessment:", err);
      alert("Unable to generate assessment. Please check input parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load sample dairy analysis
  const handleLoadSample = () => {
    handleRunAssessment({
      category: "Dairy",
      capital: 100000,
      location: {
        village: "Otur Village",
        block: "Junnar",
        district: "Pune",
        state: "Maharashtra",
        pincode: "410502",
        provenance: "Census of India 2011 (ORGI_PPT_2011_36)",
      },
      description: "Fresh morning cow and buffalo milk delivery to 40 nearby families with fresh paneer for village sweets.",
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBF7] text-[#142C1D] font-sans flex flex-col selection:bg-[#1E5D38] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onNewAssessment={scrollToWizard}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenWhatIf={report ? () => setIsWhatIfOpen(true) : undefined}
        hasReport={Boolean(report)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onStartClick={scrollToWizard}
          onExploreSample={handleLoadSample}
        />

        {/* Input & Form Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <AssessmentWizard
              onSubmit={handleRunAssessment}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <LoadingAnalysis
              category={loadingCategory}
              location={loadingLocation}
            />
          </div>
        )}

        {/* ================= COMPLETE ADVISORY REPORT VIEW ================= */}
        {report && !isLoading && (
          <section id="advisory-report-view" className="bg-[#F8FAF5] border-t border-[#E1EADC] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Report Header Bar */}
              <div className="bg-white rounded-3xl border border-[#DFE7D8] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#1E5D38]">
                      Generated Advisory Assessment
                    </span>
                    <span className="text-[10px] text-[#69796C]">
                      • Vintage: 2026.1.0
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#142C1D]">
                    {report.input.category} Enterprise Plan
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#526455] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1E5D38]" />
                      <strong>{report.location.village}</strong>, {report.location.block}, {report.location.district}
                    </span>
                    <span>•</span>
                    <span>
                      Margin Capital: <strong className="text-[#142C1D]">{report.input.capital_formatted}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Project Outlay: <strong className="text-[#142C1D]">{report.financial_plan.project_cost.formatted}</strong>
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsWhatIfOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#EDF7EE] hover:bg-[#E0F0E2] text-[#1E5D38] border border-[#CDE1CF] flex items-center gap-1.5 transition-colors"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>What-If Simulator</span>
                  </button>

                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-[#F3F6ED] text-[#29402F] border border-[#CCD8C8] flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#1E5D38]" />
                    <span>Export & Print</span>
                  </button>

                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1E5D38] hover:bg-[#154628] text-white flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ask VEYA</span>
                  </button>
                </div>
              </div>

              {/* 1. DECISION SNAPSHOT (DUAL INDEPENDENT SCORES) */}
              <DecisionSnapshotCard snapshot={report.decision_snapshot} />

              {/* 2. FINAL RECOMMENDATION BANNER */}
              <RecommendationBanner
                recommendation={report.recommendation}
                onOpenWhatIf={() => setIsWhatIfOpen(true)}
              />

              {/* 3. LOCAL CONSUMER PURCHASING POWER */}
              <PurchasingPowerModule
                purchasingPower={report.hyper_local.consumer_purchasing_power}
                districtContext={{
                  district_per_capita_formatted: report.feasibility.product_market_value.purchasing_power_context.district_per_capita_formatted,
                  rural_daily_wage_unskilled: report.feasibility.product_market_value.purchasing_power_context.rural_daily_wage_unskilled,
                  rural_daily_wage_skilled: report.feasibility.product_market_value.purchasing_power_context.rural_daily_wage_skilled,
                  nearest_mandi_distance_km: report.feasibility.product_market_value.purchasing_power_context.nearest_mandi_distance_km,
                }}
              />

              {/* 4. DETERMINISTIC FINANCIAL PLAN (100% MATH ENGINE) */}
              <FinancialPlanModule financials={report.financial_plan} />

              {/* 5. HYPER-LOCAL MARKET FEASIBILITY & APMC BENCHMARKS */}
              <MarketFeasibilityModule
                feasibility={report.feasibility}
                locationName={`${report.location.block}, ${report.location.district}`}
              />

              {/* 6. AI REASONING (OPPORTUNITY, SWOT, THREATS) */}
              <AIReasoningModule
                opportunity={report.feasibility.opportunity}
                swot={report.feasibility.swot}
                threats={report.feasibility.threats}
                narrativeTier={report.recommendation.narrative_tier}
              />

              {/* Bottom Quick Return Bar */}
              <div className="pt-6 border-t border-[#DFE7D8] flex flex-wrap items-center justify-between gap-4 text-xs text-[#526354]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E5D38]" />
                  <span>
                    Official Demographic Baseline: Census 2011 (ORGI_PPT_2011_36) • Concessional NSFDC Schemes
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={scrollToWizard}
                    className="hover:underline text-[#1E5D38] font-semibold flex items-center gap-1"
                  >
                    <span>Run Another Scenario</span>
                    <ArrowUp className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8D8] py-8 text-xs text-[#586B5A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VeyaLogo size="sm" />
            <span className="text-[#657767]">— Venture Evaluation Yield Analysis</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Census 2011 Grounded</span>
            <span>Deterministic Financial Engine</span>
            <span>Gemini Qualitative Reasoning</span>
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}
      {report && (
        <>
          <WhatIfSimulatorModal
            isOpen={isWhatIfOpen}
            onClose={() => setIsWhatIfOpen(false)}
            currentFinancials={report.financial_plan}
            category={report.input.category}
            location={report.location}
            currentGoNoGoScore={report.decision_snapshot.go_no_go.score}
          />

          <ExportReportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            report={report}
          />
        </>
      )}

      <ChatAssistantModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        report={report}
      />
    </div>
  );
}
