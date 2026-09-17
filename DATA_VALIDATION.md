# VEYA — Data Validation & Quality Assurance Report

This document records the data validation procedures, cross-source consistency checks, outlier handling, missing value strategies, known limitations, and recommended refresh cycles for the VEYA static dataset.

---

## 1. Cross-Source Consistency Checks

### A. Geographic Hierarchy Consistency (LGD vs Census)
- **Check**: Verified that all administrative units in `/data/locations.json` conform strictly to the Local Government Directory (LGD) coding standard and align with Census 2011 Primary Census Abstract sub-district codes.
- **Result**:
  - State: Maharashtra (`LGD: 27`)
  - Pune District (`LGD: 490`, `Census: 521`) -> Junnar Sub-District (`LGD: 4192`, `Census: 04192`) -> Otur Village (`LGD: 555620`).
  - Nashik District (`LGD: 485`, `Census: 516`) -> Niphad Sub-District (`LGD: 4157`, `Census: 04157`) -> Lasalgaon (`LGD: 550810`).
  - Ahmednagar District (`LGD: 476`, `Census: 522`) -> Sangamner Sub-District (`LGD: 4166`, `Census: 04166`).
  - Satara District (`LGD: 494`, `Census: 527`) -> Karad Sub-District (`LGD: 4235`, `Census: 04235`).
  - Kolhapur District (`LGD: 482`, `Census: 530`) -> Shirol Sub-District (`LGD: 4078`, `Census: 04078`).
- **Status**: PASSED (100% LGD compliance).

### B. Demographic Balance (Population vs Households)
- **Check**: Verified that average household size in rural sub-districts falls within the realistic Census 2011 range (4.5 to 5.2 persons per rural household).
- **Validation**:
  - Junnar: 3,99,302 rural population / 84,120 households = **4.75 persons/household** (Realistic).
  - Niphad: 4,93,254 population / 98,400 households = **5.01 persons/household** (Realistic).
  - Sangamner: 4,87,939 population / 99,200 households = **4.92 persons/household** (Realistic).
- **Status**: PASSED.

### C. Economic Realism (DDP vs Rural Wage vs Purchasing Power)
- **Check**: Verified that rural daily wages (DES 2023-24) multiplied by 250 annual working days do not exceed total per capita DDP (which includes corporate and urban output).
- **Validation**:
  - Pune: Unskilled farm wage ₹380/day × 250 days = ₹95,000/year (vs ₹3,16,742 total DDP per capita, which includes Pune municipal IT/auto corridors).
  - Nashik: Unskilled farm wage ₹350/day × 250 days = ₹87,500/year (vs ₹2,28,450 total DDP per capita).
- **Status**: PASSED (Reflects true agrarian wage floors without inflating rural disposable income).

### D. Commodity Pricing Bounds (AGMARKNET)
- **Check**: Verified that for all 5 sectors, `min_price <= modal_price <= max_price`.
- **Validation**:
  - Cow Milk (Pune/Junnar): Min ₹36, Modal ₹42, Max ₹46 per litre.
  - Buffalo Milk (Pune/Junnar): Min ₹54, Modal ₹62, Max ₹68 per litre.
  - Tomato (Junnar/Narayangaon): Min ₹14, Modal ₹22, Max ₹30 per kg.
  - School Uniform Pairs: Min ₹420, Modal ₹550, Max ₹750 per pair.
  - Fly-Ash Bricks: Min ₹5,200, Modal ₹6,200, Max ₹7,000 per 1,000 bricks.
- **Status**: PASSED (100% price range consistency).

---

## 2. Missing Value & Null Handling Strategy

1. **Explicit Identification**: No synthetic numbers are fabricated. When exact village-level economic counts are not published in official state records, the platform anchors to the verified **Sub-District / Tehsil (LGD) level** and states the parent granularity explicitly.
2. **Deterministic Defaults**: If an unrecognized location query is submitted, the engine gracefully defaults to the verified reference cluster (`Otur / Junnar, District Pune`) and flags the proxy in the Credibility Score audit trail.
3. **Formal vs Informal Distinction**: The platform explicitly annotates that Udyam counts represent **formally registered** enterprises. Informal unregistered micro-vendors are separately accounted for via modeled cluster ratios and cited in the limitations drawer.

---

## 3. Dual-Score Independence Verification

The core architecture requires two strictly separated, non-conflated indices:

| Criterion | Final Go / No-Go Model Score (0 - 100) | Credibility Score (0 - 100) |
|---|---|---|
| **Underlying Question** | *"How commercially viable is this business plan?"* | *"How complete and verified is our evidence base?"* |
| **Primary Inputs** | Addressable demand, debt serviceability, operating margin, competitor saturation | LGD mapping completeness, Census provenance, recency of APMC prices, presence of user notes |
| **Sensitivity to What-If** | **Dynamic**: Changes when capital, debt, or category changes | **Independent**: Remains invariant if location and evidence completeness do not change |
| **Conflation Rule** | **Never averaged or combined** with Credibility Score | **Never averaged or combined** with Go/No-Go Score |

**Verification Test**: Executing a simulated capital adjustment from ₹1,00,000 to ₹1,50,000 recalculates the Go/No-Go Score (e.g. from 82 to 84) while the Credibility Score remains constant at 88/100, validating absolute architectural independence.

---

## 4. Known Caveats & User Disclosures

1. **Census 2011 Baseline**: Census 2011 is India's most recent official decennial census. Real contemporary populations have expanded; VEYA displays Census 2011 figures as verified statutory baselines.
2. **Informal Sector Presence**: Rural economies feature unregistered micro-vendors (neighborhood petty kiranas and home-based tailors). Udyam provides formal enterprise indicators; field surveys are recommended to map hyper-local unorganized vendors.
3. **Commodity Price Fluctuation**: AGMARKNET benchmark prices represent a verified historical snapshot (`15-March-2024`). Daily agricultural prices in rural APMC yards fluctuate with seasonal harvest arrivals.

---

## 5. Recommended Dataset Refresh Cycles

| Dataset | Primary Source | Recommended Frequency |
|---|---|---|
| Commodity Prices | AGMARKNET / MSAMB | Monthly or Bi-Weekly during harvest peaks |
| Enterprise Registrations | Udyam Portal, MoMSME | Quarterly |
| Banking & Branch Statistics | RBI DBIE / SLBC Maharashtra | Semi-Annually |
| Crop Production & Acreage | Dept of Agriculture Maharashtra | Annually (Post Kharif/Rabi harvest) |
| District Domestic Product | DES Maharashtra | Annually upon Economic Survey release |
| Administrative Boundaries | LGD (Ministry of Panchayati Raj) | As gazetted by state government |
