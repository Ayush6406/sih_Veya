import React from "react";
import { TrendingUp, Users, ShoppingCart, DollarSign, MapPin, AlertCircle, Sparkles } from "lucide-react";
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
              Modeled Estimate
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
            <span className="text-[10px] text-[#697E6E] uppercase font-semibold block">
              Purchasing Index
            </span>
            <span className="text-lg font-bold text-[#142C1D]">{score} / 100</span>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${bandBadgeColor}`}>
            {band} Band
          </span>
        </div>
      </div>

      {/* Grid of Key Purchasing Power Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Dimension 1: Consumer Base */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-1.5">
          <div className="flex items-center gap-2 text-[#193B23] font-bold">
            <Users className="w-4 h-4 text-[#1E5D38]" />
            <span>Target Consumer Base</span>
          </div>
          <p className="text-[#3B4F3F] leading-relaxed">{consumer_base}</p>
        </div>

        {/* Dimension 2: Affordability Evidence */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-1.5">
          <div className="flex items-center gap-2 text-[#193B23] font-bold">
            <DollarSign className="w-4 h-4 text-[#1E5D38]" />
            <span>Affordability Evidence</span>
          </div>
          <p className="text-[#3B4F3F] leading-relaxed">{affordability_evidence}</p>
        </div>

        {/* Dimension 3: Demand Evidence */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-1.5">
          <div className="flex items-center gap-2 text-[#193B23] font-bold">
            <ShoppingCart className="w-4 h-4 text-[#1E5D38]" />
            <span>Demand Frequency</span>
          </div>
          <p className="text-[#3B4F3F] leading-relaxed">{demand_evidence}</p>
        </div>

        {/* Dimension 4: Price Sensitivity */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-1.5">
          <div className="flex items-center gap-2 text-[#193B23] font-bold">
            <TrendingUp className="w-4 h-4 text-[#1E5D38]" />
            <span>Price Sensitivity</span>
          </div>
          <p className="text-[#3B4F3F] leading-relaxed">{price_sensitivity}</p>
        </div>

        {/* Dimension 5: Market Accessibility */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-1.5">
          <div className="flex items-center gap-2 text-[#193B23] font-bold">
            <MapPin className="w-4 h-4 text-[#1E5D38]" />
            <span>Market Accessibility</span>
          </div>
          <p className="text-[#3B4F3F] leading-relaxed">{market_accessibility}</p>
        </div>

        {/* Dimension 6: Category Observations */}
        <div className="bg-[#FAFDF8] p-4 rounded-2xl border border-[#E0EBDD] space-y-1.5">
          <div className="flex items-center gap-2 text-[#193B23] font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Key Sector Observation</span>
          </div>
          <p className="text-[#3B4F3F] leading-relaxed">{category_observations}</p>
        </div>
      </div>

      {/* District Baseline Benchmark Strip */}
      {districtContext && (
        <div className="bg-[#EDF5EC] rounded-2xl p-4 border border-[#CFE1CE] text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8E6D7] mb-2.5">
            <span className="font-bold text-[#184827] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>District Economic Baseline</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified
              </span>
            </span>
            <span className="text-[10px] text-[#556958] font-medium">DES Maharashtra 2023-24 DDP Indicators</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#2F4433]">
            <div>
              <span className="text-[10px] text-[#5E7262] block">Per Capita Annual Income</span>
              <span className="font-bold text-[#142C1D]">{districtContext.district_per_capita_formatted}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#5E7262] block">Daily Wage (Unskilled)</span>
              <span className="font-bold text-[#142C1D]">{districtContext.rural_daily_wage_unskilled} / day</span>
            </div>
            <div>
              <span className="text-[10px] text-[#5E7262] block">Daily Wage (Skilled)</span>
              <span className="font-bold text-[#142C1D]">{districtContext.rural_daily_wage_skilled} / day</span>
            </div>
            <div>
              <span className="text-[10px] text-[#5E7262] block">Nearest APMC Mandi</span>
              <span className="font-bold text-[#142C1D]">{districtContext.nearest_mandi_distance_km} km</span>
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
