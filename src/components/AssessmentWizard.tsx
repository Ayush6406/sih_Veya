import React, { useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  DollarSign,
  TrendingUp,
  Shirt,
  Milk,
  ShoppingBag,
  UtensilsCrossed,
  Hammer,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { BusinessCategory, LocationData } from "../types";
import { MAHARASHTRA_DISTRICTS } from "../data/locationsData";

interface AssessmentWizardProps {
  onSubmit: (formData: {
    category: BusinessCategory;
    capital: number;
    location: {
      village: string;
      block: string;
      district: string;
      state: string;
      pincode?: string;
      provenance?: string;
    };
    description: string;
  }) => void;
  isLoading: boolean;
  savedScenario?: {
    category: BusinessCategory;
    capital: number;
    location: LocationData;
    description: string;
  } | null;
  resetTrigger?: number;
}

const CATEGORIES: Array<{
  id: BusinessCategory;
  name: string;
  icon: any;
  shortDesc: string;
  products: string;
  workingCapitalRatio: string;
  typicalMarket: string;
}> = [
  {
    id: "Dairy",
    name: "Dairy Farming & Milk Value-Add",
    icon: Milk,
    shortDesc: "Cattle rearing, fresh morning milk collection, doorstep delivery & fresh paneer processing.",
    products: "Fresh cow/buffalo milk, Paneer, Curd, Ghee",
    workingCapitalRatio: "18%",
    typicalMarket: "Village households, sweet shops, daily tea stalls",
  },
  {
    id: "Textile",
    name: "Textile, Tailoring & Garments",
    icon: Shirt,
    shortDesc: "Readymade garment stitching, tailoring boutique, school uniform supply & cotton saree trade.",
    products: "School uniforms, Bespoke tailoring, Cotton sarees",
    workingCapitalRatio: "25%",
    typicalMarket: "Village boutique, school contracts, weekly haats",
  },
  {
    id: "Grocery Retail",
    name: "Grocery Kirana Retail",
    icon: ShoppingBag,
    shortDesc: "Daily essentials, dry ration, packaged staples, personal hygiene items and household FMCG.",
    products: "Monthly ration family baskets, Edible oil, Sugar, FMCG",
    workingCapitalRatio: "30%",
    typicalMarket: "Main square walk-in store + phone doorstep delivery",
  },
  {
    id: "Food Processing",
    name: "Food Processing & Milling",
    icon: UtensilsCrossed,
    shortDesc: "Spice grinding mill (masala), tomato puree, multigrain flour milling (atta) and traditional pickles.",
    products: "Goda/Kolhapuri masala, Puree pouches, Multigrain flour",
    workingCapitalRatio: "22%",
    typicalMarket: "Local grocery stores, highway dhabas, tourist stops",
  },
  {
    id: "Small Manufacturing",
    name: "Small Fabrication & Works",
    icon: Hammer,
    shortDesc: "Fly ash / cement brick casting, agricultural implement repair, metal welding fabrication.",
    products: "Fly-ash bricks, Agri tool repair, Well lining rings",
    workingCapitalRatio: "25%",
    typicalMarket: "Rural housing builders (PMAY-G) & local farmers",
  },
];

const CAPITAL_PRESETS = [
  { label: "₹25,000", value: 25000, note: "Project: ₹2.5L" },
  { label: "₹50,000", value: 50000, note: "Project: ₹5.0L" },
  { label: "₹1,00,000", value: 100000, note: "Project: ₹10.0L" },
  { label: "₹1,50,000", value: 150000, note: "Project: ₹15.0L" },
  { label: "₹2,50,000", value: 250000, note: "Project: ₹25.0L" },
  { label: "₹5,00,000", value: 500000, note: "Project: ₹50.0L" },
];

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  onSubmit,
  isLoading,
  savedScenario,
  resetTrigger,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Force step 1 (Location) whenever resetTrigger fires
  React.useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setStep(1);
    }
  }, [resetTrigger]);

  // Location Selector State (LGD Hierarchy)
  const [selectedDistrictName, setSelectedDistrictName] = useState(
    savedScenario?.location?.district || "Pune"
  );
  const [selectedSubDistrictName, setSelectedSubDistrictName] = useState(
    savedScenario?.location?.block || "Junnar"
  );
  const [selectedVillageName, setSelectedVillageName] = useState(
    savedScenario?.location?.village || "Otur"
  );
  const [pincode, setPincode] = useState(
    savedScenario?.location?.pincode || "410502"
  );

  // Form State
  const [capital, setCapital] = useState<number>(
    savedScenario?.capital ?? 100000
  );
  const [category, setCategory] = useState<BusinessCategory>(
    savedScenario?.category || "Dairy"
  );
  const [description, setDescription] = useState(
    savedScenario?.description ??
      "Fresh morning cow and buffalo milk delivery to 40 nearby families with fresh paneer for village sweets."
  );

  // Sync state if savedScenario updates
  React.useEffect(() => {
    if (savedScenario) {
      if (savedScenario.location?.district) {
        setSelectedDistrictName(savedScenario.location.district);
      }
      if (savedScenario.location?.block) {
        setSelectedSubDistrictName(savedScenario.location.block);
      }
      if (savedScenario.location?.village) {
        setSelectedVillageName(savedScenario.location.village);
      }
      if (savedScenario.location?.pincode) {
        setPincode(savedScenario.location.pincode);
      }
      if (typeof savedScenario.capital === "number") {
        setCapital(savedScenario.capital);
      }
      if (savedScenario.category) {
        setCategory(savedScenario.category);
      }
      if (typeof savedScenario.description === "string") {
        setDescription(savedScenario.description);
      }
    }
  }, [savedScenario]);

  // Resolve active district & sub-district
  const currentDistrict = useMemo(() => {
    return (
      MAHARASHTRA_DISTRICTS.find((d) => d.name === selectedDistrictName) ||
      MAHARASHTRA_DISTRICTS[0]
    );
  }, [selectedDistrictName]);

  const currentSubDistrict = useMemo(() => {
    return (
      currentDistrict.sub_districts.find((s) => s.name === selectedSubDistrictName) ||
      currentDistrict.sub_districts[0]
    );
  }, [currentDistrict, selectedSubDistrictName]);

  const currentVillages = useMemo(() => {
    return currentSubDistrict.villages || [];
  }, [currentSubDistrict]);

  // Handle District Change
  const handleDistrictChange = (dName: string) => {
    setSelectedDistrictName(dName);
    const newDist = MAHARASHTRA_DISTRICTS.find((d) => d.name === dName) || MAHARASHTRA_DISTRICTS[0];
    const newSub = newDist.sub_districts[0];
    setSelectedSubDistrictName(newSub.name);
    const newVil = newSub.villages[0];
    if (newVil) {
      setSelectedVillageName(newVil.name);
      setPincode(newVil.pincode);
    }
  };

  // Handle Sub-District Change
  const handleSubDistrictChange = (sName: string) => {
    setSelectedSubDistrictName(sName);
    const newSub = currentDistrict.sub_districts.find((s) => s.name === sName);
    if (newSub && newSub.villages[0]) {
      setSelectedVillageName(newSub.villages[0].name);
      setPincode(newSub.villages[0].pincode);
    }
  };

  // Handle Village Change
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [customVillageName, setCustomVillageName] = useState("Unverified Remote Hamlet");

  const handleVillageChange = (vName: string) => {
    if (vName === "__custom__") {
      setIsCustomVillage(true);
      setSelectedVillageName(customVillageName || "Unverified Remote Hamlet");
      setPincode("");
    } else {
      setIsCustomVillage(false);
      setSelectedVillageName(vName);
      const match = currentVillages.find((v) => v.name === vName);
      if (match) {
        setPincode(match.pincode);
      }
    }
  };

  // Derived instant calculations
  const projectCost = capital / 0.1;
  const loanAmount = projectCost * 0.9;

  const getMatchedScheme = () => {
    if ((category === "Textile" || category === "Small Manufacturing") && projectCost <= 300000) {
      return {
        name: "PM Vishwakarma Scheme",
        interestRate: "5.0% p.a. (8% Subvention)",
        tenure: "3 Years (3mo grace)",
        subsidy: "₹15,000 Toolkit + 5% Concessional Rate",
      };
    }
    if (category === "Food Processing" && projectCost <= 3000000) {
      return {
        name: "PMFME (Micro Food Processing)",
        interestRate: "7.5% p.a.",
        tenure: "7 Years (6mo grace)",
        subsidy: "35% Credit-Linked Capital Subsidy (max ₹10L)",
      };
    }
    if (projectCost <= 150000) {
      return {
        name: "MUDRA (PMMY) Shishu/Kishore",
        interestRate: "6.5% p.a.",
        tenure: "3 Years (3mo grace)",
        subsidy: "100% Collateral-Free Credit Guarantee",
      };
    }
    return {
      name: "CMEGP (Chief Minister Employment Generation)",
      interestRate: "8.0% p.a.",
      tenure: "7 Years (6mo grace)",
      subsidy: "25% to 35% Margin Money Rural Subsidy",
    };
  };

  const schemeInfo = getMatchedScheme();

  const handleNext = () => {
    if (step < 4) setStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      category,
      capital,
      location: {
        village: selectedVillageName,
        block: currentSubDistrict.name,
        district: currentDistrict.name,
        state: "Maharashtra",
        pincode,
        provenance: "Maharashtra State Demographic Dataset & LGD Directory",
      },
      description,
    });
  };

  return (
    <div
      id="assessment-wizard"
      className="bg-white rounded-3xl border border-[#DFE7D8] shadow-lg shadow-black/5 overflow-hidden"
    >
      {/* Wizard Progress Bar */}
      <div className="bg-[#F6F9F2] px-6 py-4 border-b border-[#E3EBDD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1E5D38] text-white flex items-center justify-center text-xs font-bold">
            {step}
          </span>
          <span className="text-xs font-bold text-[#1D3624]">
            {step === 1 && "Step 1: Official Location & Demographics"}
            {step === 2 && "Step 2: Margin Capital & Scheme Routing"}
            {step === 3 && "Step 3: Business Category & Plan"}
            {step === 4 && "Step 4: Review & Run Feasibility"}
          </span>
          {savedScenario && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E5D38] bg-[#EAF5EC] px-2 py-0.5 rounded-full border border-[#CDE5CF]">
              Previous scenario loaded
            </span>
          )}
        </div>

        {/* Clickable Step Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { num: 1, name: "Location" },
            { num: 2, name: "Capital" },
            { num: 3, name: "Category" },
            { num: 4, name: "Review" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                step === item.num
                  ? "bg-[#1E5D38] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#4D6151] border border-[#D5DDD0]"
              }`}
            >
              <span>{item.num}.</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* ================= STEP 1: LOCATION ================= */}
        {step === 1 && (
          <div id="location-step-section" className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5D38] bg-[#EAF4E9] px-2 py-0.5 rounded-full border border-[#CCE2CC]">
                  OFFICIAL MAHARASHTRA DATASET
                </span>
                <span className="text-[10px] text-[#637667]">
                  LGD Codes &amp; Maharashtra Demographics
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D]">
                Where is your proposed business located?
              </h2>
              <p className="text-xs sm:text-sm text-[#546657] mt-1">
                Select your District and Tehsil. VEYA automatically binds verified Maharashtra state demographics, DES income indicators, and AGMARKNET APMC mandi price benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* District Select */}
              <div>
                <label className="block text-xs font-bold text-[#1C3623] mb-1.5">
                  District (LGD Directory)
                </label>
                <select
                  id="district-select"
                  value={selectedDistrictName}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-medium rounded-xl border border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8] text-[#142C1D]"
                >
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} (LGD: {d.lgd_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-District / Tehsil Select */}
              <div>
                <label className="block text-xs font-bold text-[#1C3623] mb-1.5">
                  Sub-District / Tehsil (LGD Directory)
                </label>
                <select
                  value={selectedSubDistrictName}
                  onChange={(e) => handleSubDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-medium rounded-xl border border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8] text-[#142C1D]"
                >
                  {currentDistrict.sub_districts.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} (LGD: {s.lgd_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Village / Gram Panchayat */}
              <div>
                <label className="block text-xs font-bold text-[#1C3623] mb-1.5">
                  Village / Gram Panchayat
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#1E5D38] absolute left-3 top-3" />
                  <select
                    value={isCustomVillage ? "__custom__" : selectedVillageName}
                    onChange={(e) => handleVillageChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8] text-[#142C1D]"
                  >
                    {currentVillages.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} {v.lgd_code ? `(LGD: ${v.lgd_code})` : ""}
                      </option>
                    ))}
                    <option value="__custom__">
                      ⚡ Other / Unverified Hamlet (Test Low Credibility)
                    </option>
                  </select>
                </div>
                {isCustomVillage && (
                  <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <label className="block text-[11px] font-semibold text-amber-900">
                      Specify Unverified Hamlet / Remote Pada Name:
                    </label>
                    <input
                      type="text"
                      value={customVillageName}
                      onChange={(e) => {
                        setCustomVillageName(e.target.value);
                        setSelectedVillageName(e.target.value);
                      }}
                      placeholder="e.g. Remote Unverified Hamlet 99"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white text-[#142C1D] focus:outline-none focus:border-amber-600 font-medium"
                    />
                    <p className="text-[10px] text-amber-700">
                      Official Maharashtra dataset &amp; LGD code will be absent. The Credibility Score will reflect unverified location coverage.
                    </p>
                  </div>
                )}
              </div>

              {/* State & Pincode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1C3623] mb-1.5">State</label>
                  <input
                    type="text"
                    readOnly
                    value="Maharashtra (27)"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#CCD8C8] bg-[#F2F5F0] text-[#445648] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C3623] mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8]"
                    placeholder="410502"
                  />
                </div>
              </div>
            </div>

            {/* Grounded Official Data Box */}
            <div className="bg-[#EDF5EC] border border-[#CFE1CE] rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-[#1B4D2C]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1E5D38]" />
                  <span>
                    Official Benchmark Baseline: {currentSubDistrict.name} Tehsil, {currentDistrict.name}
                  </span>
                </div>
                <span className="text-[10px] text-[#47604B] font-mono">
                  Census: {currentSubDistrict.census_code} • LGD: {currentSubDistrict.lgd_code}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[#334637]">
                <div>
                  <span className="block text-[10px] text-[#607364]">Tehsil Population (2011)</span>
                  <span className="font-bold text-[#142C1D]">
                    {currentSubDistrict.population_2011.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#607364]">Rural Households</span>
                  <span className="font-bold text-[#142C1D]">
                    {currentSubDistrict.households_2011.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#607364]">Rural Literacy Rate</span>
                  <span className="font-bold text-[#142C1D]">
                    {currentSubDistrict.rural_literacy_percent}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#607364]">Nearest APMC Mandi</span>
                  <span className="font-bold text-[#142C1D]">
                    {currentSubDistrict.nearest_mandi_km} km
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#D5E5D4] text-[#334637]">
                <div>
                  <span className="block text-[10px] text-[#607364]">District Per Capita DDP</span>
                  <span className="font-bold text-[#1E5D38]">
                    ₹{currentDistrict.per_capita_income_inr.toLocaleString()} / year
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#607364]">Daily Unskilled Wage</span>
                  <span className="font-bold text-[#142C1D]">
                    ₹{currentDistrict.unskilled_wage_inr} / day
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#607364]">Daily Skilled Wage</span>
                  <span className="font-bold text-[#142C1D]">
                    ₹{currentDistrict.skilled_wage_inr} / day
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CAPITAL ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5D38] bg-[#EAF4E9] px-2 py-0.5 rounded-full border border-[#CCE2CC]">
                  10:90 CONCESSIONAL CAPITAL MODEL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D]">
                How much margin money can you invest?
              </h2>
              <p className="text-xs sm:text-sm text-[#546657] mt-1">
                Under official schemes (PMEGP / CMEGP / PMFME / PM Vishwakarma / MUDRA), your contribution is exactly <strong>10%</strong>. The matched scheme finances the remaining <strong>90%</strong> as a low-interest concessional term loan.
              </p>
            </div>

            {/* Input & Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-[#1C3623] mb-2">
                Your Margin Capital (10% Promoter Contribution)
              </label>

              <div className="relative max-w-md">
                <span className="absolute left-3.5 top-3 text-base font-bold text-[#1E5D38]">₹</span>
                <input
                  type="number"
                  min="5000"
                  max="1000000"
                  step="5000"
                  value={capital}
                  onChange={(e) => setCapital(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-3 text-lg font-bold rounded-xl border-2 border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8] text-[#142C1D]"
                />
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 max-w-lg">
                {CAPITAL_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setCapital(preset.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      capital === preset.value
                        ? "bg-[#1E5D38] text-white border-[#1E5D38] shadow-sm"
                        : "bg-[#F7F9F5] text-[#203D26] border-[#D6E0D2] hover:bg-[#EDF3EA]"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span
                      className={`text-[10px] ${
                        capital === preset.value ? "text-emerald-200" : "text-[#627765]"
                      }`}
                    >
                      {preset.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Financing Summary */}
            <div className="bg-[#FAFDF9] border border-[#DFE8DC] rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E5D38] block">
                Instant Financing Structure
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#DFE8DC]">
                  <span className="text-[10px] uppercase font-semibold text-[#667A6A] block">
                    Total Project Outlay
                  </span>
                  <span className="text-lg font-bold text-[#142C1D]">
                    ₹{Math.round(projectCost).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#69796C] block mt-0.5">
                    100% Capital Outlay
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DFE8DC]">
                  <span className="text-[10px] uppercase font-semibold text-[#667A6A] block">
                    Govt Concessional Loan
                  </span>
                  <span className="text-lg font-bold text-[#1E5D38]">
                    ₹{Math.round(loanAmount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    90% of Project Cost
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DFE8DC]">
                  <span className="text-[10px] uppercase font-semibold text-[#667A6A] block">
                    Matched Official Scheme
                  </span>
                  <span className="text-sm font-bold text-[#142C1D] block truncate">
                    {schemeInfo.name}
                  </span>
                  <span className="text-[10px] text-[#4F6253] block mt-0.5">
                    {schemeInfo.interestRate} • {schemeInfo.tenure}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#556958] flex items-center gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-[#1E5D38] shrink-0" />
                <span>
                  <strong>Scheme Benefit:</strong> {schemeInfo.subsidy}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CATEGORY ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D]">
                Select your business category
              </h2>
              <p className="text-xs sm:text-sm text-[#546657] mt-1">
                VEYA binds category-specific crop linkages, 20th Livestock Census counts, Udyam MSME density, and AGMARKNET price bands.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                      isSelected
                        ? "bg-[#F3F8F2] border-[#1E5D38] shadow-sm"
                        : "bg-white border-[#E0E7DC] hover:border-[#CAD7C5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#1E5D38] text-white" : "bg-[#EDF5EC] text-[#1E5D38]"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#142C1D] truncate">{cat.name}</h4>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#1E5D38] text-white flex items-center justify-center text-[10px]">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#526354] mt-1 leading-relaxed">{cat.shortDesc}</p>

                        <div className="mt-2.5 pt-2 border-t border-[#E8EEE5] flex flex-wrap gap-x-3 text-[10px] text-[#4F6253]">
                          <span>
                            <strong>Working Capital:</strong> {cat.workingCapitalRatio}
                          </span>
                          <span>
                            <strong>Market:</strong> {cat.typicalMarket}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Specific Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1C3623]">
                  Describe your specific business idea or special advantage (Optional)
                </label>
                <span className="text-[10px] text-emerald-800 bg-[#EAF5EC] border border-[#C5E3CA] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Viability Dimension</span>
                </span>
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., We have access to 4 milking cows, refrigerated storage, and tie-ups with 2 sweet shops in the weekly market..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8] text-[#142C1D]"
              />
              <p className="text-[10px] text-[#637667] mt-1 leading-relaxed">
                <strong>Calculation + AI Research & Verification:</strong> The AI engine critically analyzes this description against rural purchasing power and operational reality. Sound advantages raise the Viability Dimension score; impossible pricing or scale will drastically reduce the Final Go/No-Go score.
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & CONFIRM ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D]">
                Confirm details before running analysis
              </h2>
              <p className="text-xs sm:text-sm text-[#546657] mt-1">
                VEYA will combine Maharashtra state demographics, DES 2023-24 economic indicators, Udyam MSME density, and AGMARKNET modal prices.
              </p>
            </div>

            <div className="bg-[#F8FAF6] border border-[#DCE5D8] rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#697A6B] uppercase font-semibold block">
                    Selected Category
                  </span>
                  <span className="text-base font-bold text-[#142C1D]">{category}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#697A6B] uppercase font-semibold block">
                    Your Margin Capital (10%)
                  </span>
                  <span className="text-base font-bold text-[#1E5D38]">
                    ₹{capital.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#697A6B] uppercase font-semibold block">
                    Location & Tehsil (LGD Hierarchy)
                  </span>
                  <span className="text-sm font-bold text-[#142C1D]">
                    {selectedVillageName}, {currentSubDistrict.name}, {currentDistrict.name} (Maharashtra)
                  </span>
                  <span className="text-[10px] text-[#556958] block">
                    LGD Sub-District: {currentSubDistrict.lgd_code} • Census: {currentSubDistrict.census_code}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#697A6B] uppercase font-semibold block">
                    Government Loan Entitlement (90%)
                  </span>
                  <span className="text-sm font-bold text-[#142C1D]">
                    ₹{Math.round(loanAmount).toLocaleString()} via {schemeInfo.name}
                  </span>
                  <span className="text-[10px] text-[#556958] block">{schemeInfo.interestRate}</span>
                </div>
              </div>

              {description && (
                <div className="pt-3 border-t border-[#E2EADA] text-xs">
                  <span className="text-[10px] text-[#697A6B] uppercase font-semibold block mb-0.5">
                    Entrepreneur's Proposal Notes
                  </span>
                  <p className="text-[#354839] italic">"{description}"</p>
                </div>
              )}
            </div>

            {/* Dual Score & Evaluation Expectation */}
            <div className="bg-[#EDF7EE] border border-[#C6DECA] rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-[#154627] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>What VEYA will generate for you:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[#384F3C]">
                <li>
                  <strong>Final Go / No-Go Model Score</strong> (Strictly commercial viability out of 100)
                </li>
                <li>
                  <strong>Credibility Score</strong> (Strictly evidence & data ground-truth reliability out of 100)
                </li>
                <li>
                  <strong>Local Consumer Purchasing Power</strong> analysis for {currentSubDistrict.name} Block
                </li>
                <li>
                  <strong>Deterministic Financial Schedule</strong> with reducing balance EMI and grace period
                </li>
                <li>
                  <strong>Official Provenance &amp; Limitations Audit</strong> citing Maharashtra Demographic Dataset, DES, Udyam &amp; AGMARKNET
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E3EBDD]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-[#CCD8C8] text-xs font-semibold text-[#29422F] hover:bg-[#F3F6ED] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#1E5D38] hover:bg-[#16472A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-[#1E5D38] hover:bg-[#16472A] text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-[#1E5D38]/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate VEYA Advisory Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
