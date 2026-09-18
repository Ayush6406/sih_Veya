import React from "react";
import { TrendingUp, Users, ShoppingCart, DollarSign, MapPin, AlertCircle, Sparkles, CheckCircle2, Bot, Calculator } from "lucide-react";
import { ConsumerPurchasingPower } from "../types";

interface PurchasingPowerModuleProps {
  purchasingPower: ConsumerPurchasingPower;
  districtContext?: {
    district_per_capita_formatted: string;
    rural_daily_wage_unskilled: string;
    rural_daily_wage_skilled: string;
    nearest_mandi_distance_km: number;
  };
}

export const PurchasingPowerModule: React.FC<PurchasingPowerModuleProps> = ({
  purchasingPower,
  districtContext,
}) => {
  const {
    band,
    score,
    consumer_base,
    affordability_evidence,
    demand_evidence,
    price_sensitivity,
    market_accessibility,
    category_observations,
    limitations,
  } = purchasingPower;

  const bandBadgeColor =
    band === "Strong"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : band === "Moderate"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-rose-100 text-rose-800 border-rose-300";

  return (
    <div className="bg-white rounded-3xl border border-[#DFE7D8] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8EEE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E5D38] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Hyper-Local Market Capacity</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              Estimate
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D] mt-1">
            Local Consumer Purchasing Power:{" "}
            <span className="text-[#1E5D38]">{band}</span>
          </h2>
          <p className="text-xs text-[#526354] mt-0.5">
            Evaluates rural household affordability, willingness to pay, and recurring cash flow capacity.
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3 bg-[#FAFDF9] p-2.5 rounded-2xl border border-[#D5E4D4]">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] text-[#697E6E] uppercase font-semibold">
                Purchasing Index
              </span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Estimate
              </span>
            </div>
            <span className="text-lg font-bold text-[#142C1D]">{score} / 100</span>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${bandBadgeColor}`}>
            {band} Band
          </span>
        </div>
      </div>

      {/* Provenance Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] text-[#556958] bg-[#F7FAF6] px-4 py-2.5 rounded-2xl border border-[#E2ECE0]">
        <span className="font-bold text-[#203E28] uppercase tracking-wider text-[10px]">
          Value Classifications:
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded font-bold uppercase text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Verified
          </span>
          <span>Official Maharashtra Dataset &amp; DES</span>
        </span>
        <span className="text-[#CCD7CB] hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded font-bold uppercase text-[9px] bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <Calculator className="w-2.5 h-2.5" />
            Estimate
          </span>
          <span>Demographic Ratios &amp; Catchment Models</span>
        </span>
        <span className="text-[#CCD7CB] hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded font-bold uppercase text-[9px] bg-purple-50 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
            <Bot className="w-2.5 h-2.5" />
            AI
          </span>
          <span>Qualitative Strategy Analysis</span>
        </span>
      </div>

      {/* Grid of Key Purchasing Power Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Dimension 1: Consumer Base (AI) */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-[#193B23] font-bold">
                <Users className="w-4 h-4 text-[#1E5D38]" />
                <span>Target Consumer Base</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 shrink-0">
                AI
              </span>
            </div>
            <p className="text-[#3B4F3F] leading-relaxed">{consumer_base}</p>
          </div>
          <div className="pt-2 border-t border-[#EDF3EC] flex items-center justify-between text-[10px] text-[#697E6F]">
            <span>Segmentation</span>
            <span className="text-purple-700 font-medium">AI Synthesized</span>
          </div>
        </div>

        {/* Dimension 2: Affordability Evidence (Estimate) */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-[#193B23] font-bold">
                <DollarSign className="w-4 h-4 text-[#1E5D38]" />
                <span>Affordability Evidence</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                Estimate
              </span>
            </div>
            <p className="text-[#3B4F3F] leading-relaxed">{affordability_evidence}</p>
          </div>
          <div className="pt-2 border-t border-[#EDF3EC] flex items-center justify-between text-[10px] text-[#697E6F]">
            <span>Wage-to-Price Ratio</span>
            <span className="text-blue-700 font-medium">Modeled Estimate</span>
          </div>
        </div>

        {/* Dimension 3: Demand Evidence (Estimate) */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-[#193B23] font-bold">
                <ShoppingCart className="w-4 h-4 text-[#1E5D38]" />
                <span>Demand Frequency</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                Estimate
              </span>
            </div>
            <p className="text-[#3B4F3F] leading-relaxed">{demand_evidence}</p>
          </div>
          <div className="pt-2 border-t border-[#EDF3EC] flex items-center justify-between text-[10px] text-[#697E6F]">
            <span>Consumption Velocity</span>
            <span className="text-blue-700 font-medium">Modeled Estimate</span>
          </div>
        </div>

        {/* Dimension 4: Price Sensitivity (AI) */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-[#193B23] font-bold">
                <TrendingUp className="w-4 h-4 text-[#1E5D38]" />
                <span>Price Sensitivity</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 shrink-0">
                AI
              </span>
            </div>
            <p className="text-[#3B4F3F] leading-relaxed">{price_sensitivity}</p>
          </div>
          <div className="pt-2 border-t border-[#EDF3EC] flex items-center justify-between text-[10px] text-[#697E6F]">
            <span>Elasticity Profile</span>
            <span className="text-purple-700 font-medium">AI Inferred</span>
          </div>
        </div>

        {/* Dimension 5: Market Accessibility (Estimate) */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-[#193B23] font-bold">
                <MapPin className="w-4 h-4 text-[#1E5D38]" />
                <span>Market Accessibility</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                Estimate
              </span>
            </div>
            <p className="text-[#3B4F3F] leading-relaxed">{market_accessibility}</p>
          </div>
          <div className="pt-2 border-t border-[#EDF3EC] flex items-center justify-between text-[10px] text-[#697E6F]">
            <span>Catchment Radius</span>
            <span className="text-blue-700 font-medium">Modeled Estimate</span>
          </div>
        </div>

        {/* Dimension 6: Category Observations (AI) */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-[#193B23] font-bold">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Key Sector Observation</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 shrink-0">
                AI
              </span>
            </div>
            <p className="text-[#3B4F3F] leading-relaxed">{category_observations}</p>
          </div>
          <div className="pt-2 border-t border-[#EDF3EC] flex items-center justify-between text-[10px] text-[#697E6F]">
            <span>Domain Analysis</span>
            <span className="text-purple-700 font-medium">AI Qualitative</span>
          </div>
        </div>
      </div>

      {/* District Baseline Benchmark Strip (Verified Government Records) */}
      {districtContext && (
        <div className="bg-[#EDF5EC] rounded-2xl p-4 sm:p-5 border border-[#CFE1CE] text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#D8E6D7]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#184827] uppercase tracking-wider text-[11px]">
                District Economic Baseline
              </span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified
              </span>
            </div>
            <span className="text-[10px] text-[#556958] font-medium">
              DES Maharashtra 2023-24 DDP Indicators
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#2F4433]">
            <div className="bg-white/70 p-3 rounded-xl border border-[#D5E4D4] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E7262] font-medium block">
                  Per Capita Income
                </span>
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <span className="font-bold text-[#142C1D] text-sm block">
                {districtContext.district_per_capita_formatted}
              </span>
              <span className="text-[9px] text-[#768A78] block">Annual District DDP</span>
            </div>

            <div className="bg-white/70 p-3 rounded-xl border border-[#D5E4D4] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E7262] font-medium block">
                  Daily Wage (Unskilled)
                </span>
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <span className="font-bold text-[#142C1D] text-sm block">
                {districtContext.rural_daily_wage_unskilled} / day
              </span>
              <span className="text-[9px] text-[#768A78] block">Statutory Rural Floor</span>
            </div>

            <div className="bg-white/70 p-3 rounded-xl border border-[#D5E4D4] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E7262] font-medium block">
                  Daily Wage (Skilled)
                </span>
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <span className="font-bold text-[#142C1D] text-sm block">
                {districtContext.rural_daily_wage_skilled} / day
              </span>
              <span className="text-[9px] text-[#768A78] block">Official Wage Schedule</span>
            </div>

            <div className="bg-white/70 p-3 rounded-xl border border-[#D5E4D4] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E7262] font-medium block">
                  Nearest APMC Mandi
                </span>
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <span className="font-bold text-[#142C1D] text-sm block">
                {districtContext.nearest_mandi_distance_km} km
              </span>
              <span className="text-[9px] text-[#768A78] block">Geo-Referenced Mandi</span>
            </div>
          </div>
        </div>
      )}

      {/* Limitations note */}
      {limitations && limitations.length > 0 && (
        <div className="flex items-start gap-2 text-[11px] text-[#69796C] pt-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Methodology Note:</strong> {limitations.join(" ")}
          </span>
        </div>
      )}
    </div>
  );
};
