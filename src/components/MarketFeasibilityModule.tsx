import React from "react";
import { Users, Store, Tag, MapPin, CheckCircle2, Building, Layers } from "lucide-react";
import { FeasibilityDetails } from "../types";

interface MarketFeasibilityModuleProps {
  feasibility: FeasibilityDetails;
  locationName: string;
}

export const MarketFeasibilityModule: React.FC<MarketFeasibilityModuleProps> = ({
  feasibility,
  locationName,
}) => {
  const { market_reach, competitor_mapping, product_market_value } = feasibility;

  const compLevel = competitor_mapping.competition_level.value;
  const compBadgeColor =
    compLevel === "LOW"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : compLevel === "MODERATE"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-rose-100 text-rose-800 border-rose-300";

  return (
    <div className="bg-white rounded-3xl border border-[#DFE7D8] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8EEE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E5D38] flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Demographic & Competition Audit</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Verified · Maharashtra Dataset + Udyam
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D] mt-1">
            Hyper-Local Market Feasibility & Pricing Benchmarks
          </h2>
          <p className="text-xs text-[#526354] mt-0.5">
            Real demographic scale, competition saturation metrics, and official APMC agricultural price bands for {locationName}.
          </p>
        </div>
      </div>

      {/* Market Reach & Competitor Density 2-Col Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Market Reach & Customers */}
        <div className="bg-[#FAFDF9] p-5 rounded-2xl border border-[#E0EBDD] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4ECE1]">
            <span className="font-bold text-[#183921] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#1E5D38]" />
              <span>Reachable Customer Base</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              Modeled Estimate
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#142C1D]">
              ~{market_reach.reachable_customers.formatted}
            </span>
            <span className="text-xs text-[#586B5A]">households in 5-10km radius</span>
          </div>

          <p className="text-[11px] text-[#475C4A] bg-white p-2.5 rounded-xl border border-[#E0EBDD] font-mono leading-relaxed">
            {market_reach.reachable_customers.formula}
          </p>

          {/* Distribution Channels */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-[#627564] block mb-1.5">
              Primary Local Distribution Channels
            </span>
            <ul className="space-y-1 text-[#334636]">
              {market_reach.distribution_channels.channels.map((ch, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#1E5D38] font-bold">✓</span>
                  <span>{ch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Competitor Mapping */}
        <div className="bg-[#FAFDF9] p-5 rounded-2xl border border-[#E0EBDD] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4ECE1]">
            <span className="font-bold text-[#183921] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#1E5D38]" />
              <span>Competitor Saturation</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${compBadgeColor}`}>
              {compLevel} Competition
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-[#E0EBDD]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#637565] block uppercase font-semibold">
                  Registered Enterprises
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <span className="text-2xl font-bold text-[#142C1D]">
                {competitor_mapping.registered_businesses.value}
              </span>
              <span className="text-[10px] text-[#69796C] block mt-0.5">
                Udyam MSME Portal
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E0EBDD]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#637565] block uppercase font-semibold">
                  Competitor Density
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Modeled Estimate
                </span>
              </div>
              <span className="text-2xl font-bold text-[#1E5D38]">
                {competitor_mapping.density_per_1k_households.formatted}
              </span>
              <span className="text-[10px] text-[#69796C] block mt-0.5">
                Per 1,000 households
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E0EBDD] text-[11px] text-[#3E5241] leading-relaxed">
            <strong>Analyst Take:</strong> {competitor_mapping.competition_level.interpretation}
          </div>
        </div>
      </div>

      {/* Benchmark Pricing Table */}
      <div className="border border-[#E2EBDD] rounded-2xl overflow-hidden text-xs">
        <div className="bg-[#F8FAF5] px-4 py-3 border-b border-[#E2EBDD] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#1A3723]">
            <Tag className="w-4 h-4 text-[#1E5D38]" />
            <span>Official APMC & Local Market Price Benchmarks</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            Verified · AGMARKNET / e-NAM (15-Mar-2024)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F6EE] text-[10px] uppercase font-bold text-[#4B5E4F] border-b border-[#E2EBDD]">
                <th className="px-4 py-2.5">Product / Item</th>
                <th className="px-4 py-2.5">Unit</th>
                <th className="px-4 py-2.5">Price Range</th>
                <th className="px-4 py-2.5">Recommended Price</th>
                <th className="px-4 py-2.5">Benchmark Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF0E8] text-[11px]">
              {product_market_value.products.map((prod, idx) => (
                <tr key={idx} className="hover:bg-[#F9FCF8]">
                  <td className="px-4 py-2.5 font-bold text-[#142C1D]">
                    {prod.product_name}
                  </td>
                  <td className="px-4 py-2.5 text-[#5D7060]">Per {prod.unit}</td>
                  <td className="px-4 py-2.5 text-[#334637]">
                    ₹{prod.min_price} – ₹{prod.max_price}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-[#1E5D38]">
                    ₹{prod.recommended_price}
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-[#657767]">
                    {prod.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
