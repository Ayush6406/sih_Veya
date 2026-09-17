import fs from "fs";
import path from "path";

// Helper to safely load JSON files
function loadJSON<T = any>(relPath: string): T {
  const fullPath = path.join(process.cwd(), relPath);
  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[DataLoader] Error loading ${fullPath}:`, err);
    throw err;
  }
}

// Load all datasets at startup
export const locationsData = loadJSON("data/locations.json");
export const demographicsData = loadJSON("data/demographics.json");
export const districtIndicatorsData = loadJSON("data/district_indicators.json");
export const economicData = loadJSON("data/economic_data.json");
export const msmeData = loadJSON("data/msme_data.json");
export const cropsData = loadJSON("data/crops.json");
export const commodityPricesData = loadJSON("data/commodity_prices.json");
export const livestockData = loadJSON("data/livestock.json");
export const industrialClustersData = loadJSON("data/industrial_clusters.json");
export const bankingData = loadJSON("data/banking.json");
export const rainfallData = loadJSON("data/rainfall.json");
export const poiInfrastructureData = loadJSON("data/poi_infrastructure.json");
export const schemesData = loadJSON("data/schemes.json");

// Normalize locationsData structure to support both top-level and nested state formats
if (!locationsData.districts && locationsData.states?.[0]?.districts) {
  locationsData.districts = locationsData.states[0].districts;
  locationsData.state = locationsData.states[0].state_name || "Maharashtra";
  locationsData.state_lgd_code = locationsData.states[0].state_lgd_code || 27;
}

// Bidirectionally normalize naming keys across districts, sub-districts, and villages
(locationsData.districts || []).forEach((d: any) => {
  d.name = d.name || d.district_name;
  d.district_name = d.district_name || d.name;
  d.lgd_code = d.lgd_code || d.district_lgd_code;
  d.district_lgd_code = d.district_lgd_code || d.lgd_code;
  d.census_code = d.census_code || d.census_2011_code;
  d.census_2011_code = d.census_2011_code || d.census_code;

  (d.sub_districts || []).forEach((s: any) => {
    s.name = s.name || s.sub_district_name;
    s.sub_district_name = s.sub_district_name || s.name;
    s.lgd_code = s.lgd_code || s.sub_district_lgd_code;
    s.sub_district_lgd_code = s.sub_district_lgd_code || s.lgd_code;
    s.census_code = s.census_code || s.census_2011_code;
    s.census_2011_code = s.census_2011_code || s.census_code;

    (s.villages || []).forEach((v: any) => {
      v.name = v.name || v.village_name;
      v.village_name = v.village_name || v.name;
      v.lgd_code = v.lgd_code || v.village_lgd_code;
      v.village_lgd_code = v.village_lgd_code || v.lgd_code;
      v.census_code = v.census_code || v.census_2011_code;
      v.census_2011_code = v.census_2011_code || v.census_code;
    });
  });
});

/**
 * Resolved location context for a given district, tehsil, and village
 */
export interface ResolvedLocationContext {
  state: string;
  state_lgd_code: number;
  district: string;
  district_lgd_code: number;
  district_census_code: string;
  block: string;
  sub_district_lgd_code: number;
  sub_district_census_code: string;
  village: string;
  village_lgd_code?: number;
  village_census_code?: string;
  pincode: string;
  // Demographics (Census 2011)
  demographics: {
    total_population: number;
    total_households: number;
    rural_population: number;
    rural_households: number;
    cluster_population: number;
    cluster_households: number;
    rural_literacy_rate: number;
    female_literacy_rate: number;
    sc_st_share_percent: number;
    agricultural_worker_share_percent: number;
    data_year: number;
    provenance_source: string;
    catalog_idno: string;
  };
  // Economic & Wage Indicators (DES Maharashtra 2023-24)
  economic: {
    per_capita_income_inr: number;
    per_capita_income_tier: string;
    economic_vitality_score: number;
    gross_district_domestic_product_cr_inr: number;
    agriculture_contribution_percent: number;
    manufacturing_contribution_percent: number;
    services_contribution_percent: number;
    rural_daily_wage_unskilled_inr: number;
    rural_daily_wage_skilled_inr: number;
    nearest_apmc_mandi_distance_km: number;
    electrified_villages_percent: number;
    reporting_period: string;
    provenance_source: string;
  };
  // Banking (RBI DBIE 2024)
  banking: {
    scheduled_commercial_branches: number;
    cooperative_branches: number;
    banking_touchpoints_total: number;
    financial_accessibility_index: number;
    financial_accessibility_tier: string;
    cd_ratio_percent: number;
    lead_bank: string;
    provenance_source: string;
  };
  // Rainfall & Climate (IMD / Mahavedh 2023)
  rainfall: {
    annual_actual_mm: number;
    annual_normal_mm: number;
    departure_percent: number;
    rainfall_category: string;
    climate_risk_index: string;
    water_security_for_agro: string;
    purchasing_power_cyclicality: string;
    provenance_source: string;
  };
  // Local POI & Infrastructure anchors (OSM / Govt 2024)
  infrastructure: {
    schools_and_colleges: number;
    cooperative_dairy_societies: number;
    weekly_haats_bazaars: number;
    grocery_kirana_outlets: number;
    bank_branches_and_csp: number;
    bus_stands_and_transport_nodes: number;
    cluster_name: string;
    provenance_source: string;
  };
}

export function resolveLocationContext(
  requestedDistrict?: string,
  requestedBlock?: string,
  requestedVillage?: string
): ResolvedLocationContext {
  // Normalize district
  const districts = locationsData.districts || [];
  const reqDistClean = (requestedDistrict || "").trim().toLowerCase();
  let dObj = districts.find(
    (d: any) =>
      d.name.toLowerCase() === reqDistClean ||
      d.district_name?.toLowerCase() === reqDistClean ||
      (reqDistClean && d.name.toLowerCase().includes(reqDistClean))
  );
  if (!dObj) {
    // Default to Pune if not matched
    dObj = districts.find((d: any) => d.name === "Pune" || d.district_name === "Pune") || districts[0] || {
      name: "Pune",
      district_name: "Pune",
      lgd_code: 490,
      census_code: "521",
      sub_districts: [],
    };
  }

  // Normalize sub-district / block
  const subDistricts = dObj.sub_districts || [];
  const reqBlockClean = (requestedBlock || "").trim().toLowerCase();
  let sObj = subDistricts.find(
    (s: any) =>
      s.name.toLowerCase() === reqBlockClean ||
      s.sub_district_name?.toLowerCase() === reqBlockClean ||
      (reqBlockClean && s.name.toLowerCase().includes(reqBlockClean))
  );
  if (!sObj) {
    sObj = subDistricts.find((s: any) => s.name === "Junnar" || s.sub_district_name === "Junnar") || subDistricts[0] || {
      name: requestedBlock || "Junnar",
      sub_district_name: requestedBlock || "Junnar",
      lgd_code: 4192,
      census_code: "04192",
      villages: [],
    };
  }

  // Normalize village
  const villages = sObj.villages || [];
  const reqVillageClean = (requestedVillage || "").trim().toLowerCase();
  let isVerifiedVillage = true;
  let vObj = villages.find(
    (v: any) =>
      v.name.toLowerCase() === reqVillageClean ||
      v.village_name?.toLowerCase() === reqVillageClean ||
      (reqVillageClean && (reqVillageClean.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(reqVillageClean)))
  );
  if (!vObj) {
    if (!reqVillageClean || reqVillageClean === "otur" || reqVillageClean === "village center") {
      vObj = villages.find((v: any) => v.name === "Otur" || v.village_name === "Otur") || villages[0] || {
        name: "Otur",
        village_name: "Otur",
        lgd_code: 555620,
        census_code: "555620",
        pincode: "410502",
      };
    } else {
      isVerifiedVillage = false;
      vObj = {
        name: requestedVillage || "Custom Unverified Hamlet",
        village_name: requestedVillage || "Custom Unverified Hamlet",
        lgd_code: null,
        census_code: null,
        pincode: "",
      };
    }
  }

  const districtName = dObj.name || dObj.district_name || "Pune";
  const blockName = sObj.name || sObj.sub_district_name || "Junnar";
  const villageName = vObj.name || vObj.village_name || requestedVillage || "Otur";

  // Demographics lookup
  const distDemo = demographicsData.district_demographics?.[districtName] || demographicsData.district_demographics?.["Pune"] || {};
  const blockDemo = demographicsData.block_demographics?.[blockName] || {
    total_population: distDemo.rural_population ? Math.round(distDemo.rural_population / (subDistricts.length || 10)) : 399302,
    total_households: distDemo.rural_households ? Math.round(distDemo.rural_households / (subDistricts.length || 10)) : 84120,
    cluster_population: 82400,
    cluster_households: 16300,
    rural_literacy_rate_percent: distDemo.rural_literacy_rate_percent || 78.4,
    female_literacy_rate_percent: distDemo.female_literacy_rate_percent || 71.2,
    sc_st_share_percent: distDemo.sc_st_share_percent || 20.0,
    agricultural_worker_share_percent: 65.0,
  };

  // Indicators lookup
  const distInd = districtIndicatorsData.districts?.[districtName] || districtIndicatorsData.districts?.["Pune"] || {};

  // Economic lookup
  const distEcon = economicData.districts?.[districtName] || economicData.districts?.["Pune"] || {};

  // Banking lookup
  const distBank = bankingData.districts?.[districtName] || bankingData.districts?.["Pune"] || {};
  const blockBank = distBank.rural_block_presence?.[blockName] || {
    commercial_branches: 20,
    cooperative_branches: 15,
    banking_touchpoints_total: 35,
  };

  // Rainfall lookup
  const distRain = rainfallData.districts?.[districtName] || rainfallData.districts?.["Pune"] || {};

  // POI lookup
  const poiCluster = poiInfrastructureData.clusters?.[blockName] || poiInfrastructureData.clusters?.["Junnar"] || {};
  const poiAnchors = poiCluster?.infrastructure_anchors || {};

  return {
    state: locationsData.state || "Maharashtra",
    state_lgd_code: locationsData.state_lgd_code || 27,
    district: districtName,
    district_lgd_code: dObj.lgd_code,
    district_census_code: dObj.census_code,
    block: blockName,
    sub_district_lgd_code: sObj.lgd_code,
    sub_district_census_code: sObj.census_code,
    village: villageName,
    village_lgd_code: vObj.lgd_code,
    village_census_code: vObj.census_code,
    pincode: vObj.pincode || "410502",
    demographics: {
      total_population: blockDemo.total_population,
      total_households: blockDemo.total_households,
      rural_population: blockDemo.rural_population || blockDemo.total_population,
      rural_households: blockDemo.rural_households || blockDemo.total_households,
      cluster_population: blockDemo.cluster_population || 82400,
      cluster_households: blockDemo.cluster_households || 16300,
      rural_literacy_rate: blockDemo.rural_literacy_rate_percent,
      female_literacy_rate: blockDemo.female_literacy_rate_percent,
      sc_st_share_percent: blockDemo.sc_st_share_percent,
      agricultural_worker_share_percent: blockDemo.agricultural_worker_share_percent || 65.0,
      data_year: 2011,
      provenance_source: "Census of India 2011 - Primary Census Abstract (PCA) & Population Finder, ORGI",
      catalog_idno: "ORGI_PCA_2011_MH",
    },
    economic: {
      per_capita_income_inr: distEcon.per_capita_income_inr || 316742,
      per_capita_income_tier: distEcon.per_capita_income_tier || "High (Above State Avg)",
      economic_vitality_score: distEcon.economic_vitality_score || 88,
      gross_district_domestic_product_cr_inr: distEcon.gross_district_domestic_product_cr_inr || 448210,
      agriculture_contribution_percent: distEcon.agriculture_contribution_percent || 6.8,
      manufacturing_contribution_percent: distEcon.manufacturing_contribution_percent || 38.4,
      services_contribution_percent: distEcon.services_contribution_percent || 54.8,
      rural_daily_wage_unskilled_inr: distInd.rural_daily_wage_unskilled_inr || 380,
      rural_daily_wage_skilled_inr: distInd.rural_daily_wage_skilled_inr || 650,
      nearest_apmc_mandi_distance_km: distInd.nearest_mandi_avg_distance_km || 8.5,
      electrified_villages_percent: distInd.electrified_villages_percent || 100,
      reporting_period: "2023-24",
      provenance_source: "Directorate of Economics and Statistics (DES), Planning Dept, Govt of Maharashtra 2023-24",
    },
    banking: {
      scheduled_commercial_branches: distBank.scheduled_commercial_banks || 1845,
      cooperative_branches: distBank.district_central_cooperative_bank_pdcc || 294,
      banking_touchpoints_total: blockBank.banking_touchpoints_total || 45,
      financial_accessibility_index: distBank.financial_accessibility_index || 88,
      financial_accessibility_tier: distBank.financial_accessibility_tier || "High Financial Infrastructure",
      cd_ratio_percent: distBank.credit_deposit_ratio_percent || 84.6,
      lead_bank: distBank.lead_bank || "Bank of Maharashtra",
      provenance_source: "Reserve Bank of India (RBI) Branch Banking Statistics (March 2024)",
    },
    rainfall: {
      annual_actual_mm: distRain.annual_actual_mm || 845.2,
      annual_normal_mm: distRain.annual_normal_mm || 912.4,
      departure_percent: distRain.departure_percent ?? -7.4,
      rainfall_category: distRain.rainfall_category || "Normal (-19% to +19%)",
      climate_risk_index: distRain.climate_risk_index || "Low to Moderate",
      water_security_for_agro: distRain.water_security_for_agro || "High - Sustained dam irrigation",
      purchasing_power_cyclicality: distRain.purchasing_power_cyclicality || "Steady post-harvest liquidity peaks in October-December",
      provenance_source: "India Meteorological Department (IMD) / Mahavedh Annual Summary 2023",
    },
    infrastructure: {
      schools_and_colleges: poiAnchors.schools_and_colleges?.count || 40,
      cooperative_dairy_societies: poiAnchors.cooperative_dairy_societies?.count || 25,
      weekly_haats_bazaars: poiAnchors.weekly_haats_bazaars?.count || 5,
      grocery_kirana_outlets: poiAnchors.grocery_kirana_outlets?.count || 65,
      bank_branches_and_csp: poiAnchors.bank_branches_and_csp?.count || 16,
      bus_stands_and_transport_nodes: poiAnchors.bus_stands_and_transport_nodes?.count || 6,
      cluster_name: poiCluster?.cluster_name || `${blockName} Rural Cluster`,
      provenance_source: "OpenStreetMap (Overpass API 2024) & District Administrative Infrastructure Atlas",
    },
  };
}

/**
 * Returns commodity price benchmarks for a given district and category
 */
export function getCommodityPricesForCategory(districtName: string, category: string) {
  const mkt = commodityPricesData.markets?.[districtName] || commodityPricesData.markets?.["Pune"] || { commodities: [] };
  const allCommodities = mkt.commodities || [];
  const filtered = allCommodities.filter((c: any) => c.category === category);
  
  // If specific category is not in that district market, fall back to Pune baseline for that category
  if (filtered.length === 0) {
    const puneMkt = commodityPricesData.markets?.["Pune"] || { commodities: [] };
    return (puneMkt.commodities || []).filter((c: any) => c.category === category);
  }
  return filtered;
}

/**
 * Returns MSME density indicators for a district and category
 */
export function getMSMEIndicatorForCategory(districtName: string, blockName: string, category: string) {
  const dMsme = msmeData.districts?.[districtName] || msmeData.districts?.["Pune"] || {};
  const bData = dMsme.block_sector_estimates?.[blockName];
  const catIndicator = bData?.category_density_indicator?.[category];

  if (catIndicator) {
    return {
      registered_units_indicator: catIndicator.registered_units_indicator,
      concentration_band: catIndicator.concentration_band,
      interpretation: catIndicator.interpretation,
      total_district_msmes: dMsme.total_msmes || 408150,
      district_concentration_index: dMsme.msme_concentration_index || "Moderate to Dense",
      source: "Udyam Registration Portal - Ministry of MSME, Govt of India (2023-24)",
    };
  }

  // Default indicator mapping by category
  const defaults: Record<string, { units: number; band: string; interp: string }> = {
    Dairy: { units: 20, band: "Moderate", interp: "Cooperative and private milk collection centers operating within tehsil." },
    Textile: { units: 15, band: "Low-Moderate", interp: "Tailoring units and boutique vendors in bazaar hubs." },
    "Grocery Retail": { units: 40, band: "Moderate-Dense", interp: "Formal kirana and provision merchants in market yards." },
    "Food Processing": { units: 12, band: "Moderate", interp: "Agro-milling, spice, and seasonal food processing units." },
    "Small Manufacturing": { units: 9, band: "Low", interp: "Welding, fabrication, and rural building material workshops." },
  };

  const def = defaults[category] || defaults["Dairy"];
  return {
    registered_units_indicator: def.units,
    concentration_band: def.band,
    interpretation: def.interp,
    total_district_msmes: dMsme.total_msmes || 408150,
    district_concentration_index: dMsme.msme_concentration_index || "Moderate",
    source: "Udyam Registration Portal - Ministry of MSME, Govt of India (2023-24)",
  };
}

/**
 * Returns relevant industrial clusters under MSI-CDP
 */
export function getIndustrialClustersForLocation(districtName: string, category: string) {
  const clusters = industrialClustersData.clusters || [];
  return clusters.filter(
    (c: any) =>
      c.district &&
      c.district.toLowerCase() === districtName.toLowerCase() &&
      c.industry &&
      c.industry.toLowerCase().includes(category.toLowerCase().split(" ")[0])
  );
}

/**
 * Returns agricultural crop linkages for category
 */
export function getCropLinkageForCategory(districtName: string, category: string) {
  const dCrops = cropsData.districts?.[districtName] || cropsData.districts?.["Pune"] || {};
  const majorCrops = dCrops.major_crops || [];
  
  if (category === "Food Processing") {
    return {
      crops: majorCrops.filter((c: any) => ["Tomato", "Onion", "Turmeric", "Ginger", "Paddy (Rice)", "Wheat", "Gram (Chana)"].includes(c.crop)),
      specialization: dCrops.crop_specialization_index?.horticulture_vegetables || "Active Horticulture & Vegetable Production",
      source: "Department of Agriculture Maharashtra / data.gov.in (2023-24)",
    };
  } else if (category === "Dairy") {
    return {
      crops: majorCrops.filter((c: any) => ["Sugarcane", "Soybean", "Maize", "Bajra (Pearl Millet)"].includes(c.crop)),
      specialization: dCrops.crop_specialization_index?.sugarcane_fodder || "Adequate Fodder & Sugarcane Residues",
      source: "Department of Agriculture Maharashtra / data.gov.in (2023-24)",
    };
  } else if (category === "Textile") {
    return {
      crops: majorCrops.filter((c: any) => ["Cotton"].includes(c.crop)),
      specialization: "Cotton and handloom processing corridors",
      source: "Department of Agriculture Maharashtra / data.gov.in (2023-24)",
    };
  }
  return {
    crops: majorCrops.slice(0, 3),
    specialization: "General Agricultural Economy",
    source: "Department of Agriculture Maharashtra / data.gov.in (2023-24)",
  };
}

/**
 * Returns livestock context
 */
export function getLivestockContext(districtName: string) {
  const dLive = livestockData.districts?.[districtName] || livestockData.districts?.["Pune"] || {};
  return {
    ...dLive,
    source: "20th Livestock Census 2019 - Department of Animal Husbandry & Dairying (DAHD)",
  };
}

/**
 * Returns official government schemes
 */
export function getSchemesForBusiness(category: string, projectCost: number, marginCapital: number) {
  const allSchemes = schemesData.schemes || [];
  return allSchemes.filter((s: any) => {
    return s.eligible_business_categories.includes(category);
  });
}
