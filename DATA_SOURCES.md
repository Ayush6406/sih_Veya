# VEYA — Official Government & Public Data Sources

This document details all official government, public administrative, and institutional datasets incorporated into the VEYA (*AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs*) platform.

---

## Summary of Data Sources

| # | Domain | Source Organization | Publication / Period | Geographic Granularity | Coverage in VEYA | Primary Purpose |
|---|--------|---------------------|----------------------|------------------------|------------------|-----------------|
| 1 | **Administrative Hierarchy** | Local Government Directory (LGD), Ministry of Panchayati Raj, Govt of India | 2024 (Continuous) | State, District, Sub-District (Tehsil), Village | Maharashtra State (LGD 27) & key agrarian districts (Pune, Nashik, Ahmednagar, Satara, Kolhapur) | Standardized location IDs, administrative nesting, pincodes |
| 2 | **Demographics & Literacy** | Office of the Registrar General & Census Commissioner (ORGI), Ministry of Home Affairs | Census of India 2011 (Primary Census Abstract) | District, Sub-District (Tehsil), Village Cluster | Block-level population, rural households, female/rural literacy rates, SC/ST share | Market scale, addressable customer baseline, reach modeling |
| 3 | **Socioeconomic Indicators** | Directorate of Economics and Statistics (DES), Planning Dept, Govt of Maharashtra | 2023-24 Edition | District-level | Districts of Maharashtra | Rural agricultural daily wages, nearest APMC distance, village electrification | Local purchasing power calibration, cost of labor baselines |
| 4 | **District Domestic Product (DDP)** | Directorate of Economics and Statistics (DES), Planning Dept, Govt of Maharashtra | 2011-12 to 2022-23 (Base: 2011-12) | District-level | Gross District Domestic Product, Per Capita Income (INR) | Purchasing power tiers, economic vitality score |
| 5 | **Micro & Small Enterprises** | Ministry of Micro, Small and Medium Enterprises, Govt of India | Udyam Registration Portal (2023-24) | District & Sub-District sector estimates | Registered Micro/Small units across NIC agro, food, retail, manufacturing | Competitor density per 1,000 households, formal enterprise concentration |
| 6 | **Agricultural Crop Production** | Department of Agriculture, Govt of Maharashtra / data.gov.in | 2022-23 & 2023-24 Agricultural Census & Crop Reports | District-level | Major cereals, pulses, sugarcane, cotton, onion, tomato | Raw material availability, agro-processing linkages |
| 7 | **Commodity Price Benchmarks** | AGMARKNET (DMI, Ministry of Agriculture) & Maharashtra State Agricultural Marketing Board (MSAMB) | 15-March-2024 Historical Snapshot | APMC Market Yard level | Modal, min, max prices for milk, grains, spices, vegetables, bricks, fabric | Price viability benchmarks, retail markup ceilings |
| 8 | **Livestock & Dairy Base** | Department of Animal Husbandry & Dairying (DAHD), Ministry of Fisheries, Animal Husbandry and Dairying | 20th Livestock Census (2019) | District-level | Cattle (indigenous/crossbred), buffaloes, goats, poultry, daily milk yield | Dairy feasibility, cattle stocking validation, fodder viability |
| 9 | **Industrial Clusters** | Micro and Small Enterprises Cluster Development Programme (MSE-CDP / MSI-CDP), Directorate of Industries, Govt of Maharashtra | Approved Clusters (2015-2025) | District & Tehsil corridor | Approved food processing, garmenting, fabrication, auto clusters | Cluster synergy, supply chain linkages, Common Facility Centre (CFC) access |
| 10 | **Banking & Financial Access** | Reserve Bank of India (RBI) Database on Indian Economy (DBIE) & State Level Bankers' Committee (SLBC) Maharashtra | March 2024 Summary | District & Block branch presence | Scheduled commercial branches, DCCB branches, Credit-Deposit (CD) ratio, lead bank | Formal credit absorption, branch proximity, banking access tier |
| 11 | **Rainfall & Agro-Climatic Risk** | India Meteorological Department (IMD) & Mahavedh (MahaAgri Agro-Meteorology) | Annual Summary 2023 & Normal 1981-2010 | District-level | Annual actual vs. normal rainfall, departure %, drought vulnerability | Seasonal cash-flow cyclicality, agricultural demand volatility |
| 12 | **Local Points of Interest (POI)** | OpenStreetMap (Overpass API 2024) & District Administrative Infrastructure Atlas | 2024 Data Snapshot | Village Cluster & Tehsil Hub | Schools, colleges, cooperative dairy chilling centers, weekly haats, banks | Local institutional demand drivers (e.g. uniforms for schools, milk for dhabas) |
| 13 | **Government Credit Schemes** | Official Operational Guidelines (MoMSME, MoFPI, DIC Maharashtra, MoF) | FY 2023-24 / FY 2024-25 Policy Guidelines | National & Maharashtra State | PMEGP, CMEGP, PMFME, PM Vishwakarma, MUDRA (PMMY) | Concessional debt structuring, interest subventions, capital subsidies |

---

## Data Provenance & Methodological Citations

### 1. Administrative Directory (LGD)
- **Authority**: Ministry of Panchayati Raj, Government of India.
- **URL**: `https://lgdirectory.gov.in/`
- **Application**: Used as the canonical key for all geographic hierarchies. Maharashtra is registered under State LGD Code `27`. Pune is District LGD `490` with Sub-District Junnar at LGD `4192`.

### 2. Demographics (Census of India 2011)
- **Authority**: Office of the Registrar General & Census Commissioner, India (ORGI).
- **Catalog Number**: `ORGI_PCA_2011_MH`
- **URL**: `https://censusindia.gov.in/`
- **Limitation Note**: Census 2011 serves as the verified statutory baseline for population and households. VEYA explicitly marks demographic projections as historical statutory benchmarks, acknowledging that contemporary populations have expanded.

### 3. Economic & Wage Data (DES Maharashtra)
- **Authority**: Directorate of Economics and Statistics, Planning Department, Government of Maharashtra.
- **Publications**:
  - *Selected Indicators for Districts in Maharashtra (2023-24)*
  - *District Domestic Product of Maharashtra (2011-12 to 2022-23)*
- **URL**: `https://mahades.maharashtra.gov.in/`
- **Application**: Ground truth for rural agricultural daily wages (Unskilled: ₹380/day in Pune; Skilled: ₹650/day) and District Per Capita Income (₹3,16,742 in Pune, ₹2,28,450 in Nashik).

### 4. Enterprise Registrations (Udyam MSME)
- **Authority**: Ministry of Micro, Small and Medium Enterprises, Government of India.
- **URL**: `https://udyamregistration.gov.in/`
- **Application**: Provides formal enterprise concentration indicators per sub-district and sector.
- **Limitation Note**: Udyam captures formally registered enterprises. Unregistered informal micro-vendors (neighborhood petty kiranas and home tailors) are estimated via modeled multipliers and marked with audit caveats.

### 5. Commodity & Farm-Gate Prices (AGMARKNET)
- **Authority**: Directorate of Marketing and Inspection (DMI), Ministry of Agriculture and Farmers Welfare.
- **URL**: `https://agmarknet.gov.in/` & `https://www.msamb.com/`
- **Snapshot Date**: `15-March-2024`
- **Application**: Modal price benchmarks, market ranges (min/max), and unit measurements for realistic enterprise cash-flow modeling.

### 6. Official Government Schemes
- **CMEGP**: Chief Minister Employment Generation Programme, Directorate of Industries, Govt of Maharashtra (`https://cmegp.gov.in/`)
- **PMEGP**: Prime Minister's Employment Generation Programme, KVIC & MoMSME (`https://www.kviconline.gov.in/pmegpeportal/`)
- **PMFME**: PM Formalisation of Micro Food Processing Enterprises, MoFPI (`https://pmfme.mofpi.gov.in/`)
- **PM Vishwakarma**: Central Sector Scheme for Traditional Artisans and Craftspeople (`https://pmvishwakarma.gov.in/`)
- **MUDRA**: Pradhan Mantri Mudra Yojana, Department of Financial Services (`https://www.mudra.org.in/`)
