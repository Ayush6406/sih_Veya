# VEYA — Static Dataset Data Dictionary

This document specifies the exact schemas, field types, primary keys, and relationships across the 13 static JSON datasets stored in `/data/`.

---

## 1. `/data/locations.json`
- **Description**: Standardized administrative hierarchy of Maharashtra based on the Local Government Directory (LGD).
- **Primary Key**: `state_lgd_code` -> `districts[].lgd_code` -> `sub_districts[].lgd_code` -> `villages[].lgd_code`.

| Field Name | Type | Unit / Format | Description |
|---|---|---|---|
| `state` | string | Name | State name (`Maharashtra`) |
| `state_lgd_code` | number | Integer | LGD unique identifier for state (`27`) |
| `districts[].name` | string | Name | District administrative name (`Pune`, `Nashik`, etc.) |
| `districts[].lgd_code` | number | Integer | LGD unique identifier for district (`490`) |
| `districts[].census_code` | string | 3-digit text | Census 2011 district code (`521`) |
| `districts[].headquarters` | string | Name | District headquarters |
| `sub_districts[].name` | string | Name | Sub-district / Tehsil name (`Junnar`, `Ambegaon`, etc.) |
| `sub_districts[].lgd_code` | number | Integer | LGD unique sub-district identifier (`4192`) |
| `sub_districts[].census_code` | string | 5-digit text | Census 2011 sub-district code (`04192`) |
| `villages[].name` | string | Name | Village / Gram Panchayat name (`Otur`, `Narayangaon`) |
| `villages[].lgd_code` | number | Integer | LGD unique village identifier (`555620`) |
| `villages[].pincode` | string | 6-digit text | India Post postal index number (`410502`) |

---

## 2. `/data/demographics.json`
- **Description**: Population, households, literacy, and demographic composition from Census of India 2011 (Primary Census Abstract).
- **Join Key**: `district_demographics[district_name]`, `block_demographics[block_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `total_population` | number | Count | Total recorded population in administrative unit |
| `total_households` | number | Count | Total occupied rural & urban households |
| `rural_population` | number | Count | Population residing in designated rural villages |
| `rural_households` | number | Count | Rural household count |
| `cluster_population` | number | Count | 5-10 km radius functional commercial cluster population |
| `cluster_households` | number | Count | 5-10 km radius addressable customer base |
| `rural_literacy_rate_percent` | number | % | Percentage of literate population aged 7+ |
| `female_literacy_rate_percent` | number | % | Percentage of literate females |
| `sc_st_share_percent` | number | % | Scheduled Caste & Scheduled Tribe population proportion |
| `agricultural_worker_share_percent`| number | % | Proportion of cultivators and agricultural laborers |
| `provenance_source` | string | Text | Formal citation of government data catalog |

---

## 3. `/data/district_indicators.json`
- **Description**: District-level socioeconomic indicators from DES Maharashtra *Selected Indicators for Districts (2023-24)*.
- **Join Key**: `districts[district_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `rural_daily_wage_unskilled_inr` | number | INR / Day | Mandated rural minimum daily wage for unskilled farm labor |
| `rural_daily_wage_skilled_inr` | number | INR / Day | Prevailing daily wage for skilled artisans/masons/welders |
| `nearest_mandi_avg_distance_km` | number | Kilometers | Average travel distance to regulated APMC principal yard |
| `electrified_villages_percent` | number | % | Percentage of villages connected to grid power |
| `gross_cropped_area_ha` | number | Hectares | Total agricultural cropped area in district |
| `net_irrigated_area_ha` | number | Hectares | Irrigated agricultural land |

---

## 4. `/data/economic_data.json`
- **Description**: District Domestic Product (DDP) and per capita income from DES Maharashtra.
- **Join Key**: `districts[district_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `per_capita_income_inr` | number | INR / Year | Net District Domestic Product per capita (current prices) |
| `per_capita_income_tier` | string | Category | `Very High`, `High`, `Moderate`, `Developing` |
| `economic_vitality_score` | number | 0 - 100 | Composite economic dynamism index |
| `gross_district_domestic_product_cr_inr` | number | ₹ Crores | Total economic output of the district |
| `agriculture_contribution_percent` | number | % | Primary sector share of DDP |
| `manufacturing_contribution_percent` | number | % | Secondary industrial sector share of DDP |
| `services_contribution_percent` | number | % | Tertiary services sector share of DDP |

---

## 5. `/data/msme_data.json`
- **Description**: Enterprise registrations from Ministry of MSME Udyam Registration Portal (2023-24).
- **Join Key**: `districts[district_name]`, `block_sector_estimates[block_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `total_msmes` | number | Count | Total active registered micro, small, medium enterprises |
| `msme_concentration_index` | number | 0 - 100 | Relative enterprise density vs state average |
| `category_density_indicator[category]` | object | Indicators | Category-specific enterprise counts and interpretation |
| `registered_units_indicator` | number | Count | Formal registered units in the tehsil |
| `concentration_band` | string | Category | `Low`, `Moderate`, `Moderate-Dense`, `Dense` |
| `interpretation` | string | Text | Analyst assessment of competitive saturation |

---

## 6. `/data/commodity_prices.json`
- **Description**: Modal and range price benchmarks from AGMARKNET & MSAMB market yard summaries.
- **Join Key**: `markets[district_name].commodities[]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `commodity` | string | Name | Crop, product, or service benchmark |
| `category` | string | Category | Linked business sector (Dairy, Textile, Retail, Food, Mfg) |
| `unit` | string | Standard unit | `Litre`, `Kg`, `Piece`, `Meter`, `1,000 Bricks`, etc. |
| `min_price` | number | INR | Minimum recorded price in market yard |
| `max_price` | number | INR | Maximum recorded price in market yard |
| `modal_price` | number | INR | Most frequent transaction price (recommended baseline) |
| `date` | string | Date text | Snapshot date (`15-March-2024`) |
| `source` | string | Citation | APMC market yard and government reporting authority |

---

## 7. `/data/crops.json`
- **Description**: District-wise agricultural crop production statistics from Dept of Agriculture Maharashtra.
- **Join Key**: `districts[district_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `major_crops[].crop` | string | Name | Agricultural crop name (Tomato, Sugarcane, Cotton, Soybean) |
| `major_crops[].season` | string | Season | `Kharif`, `Rabi`, `Annual / Perennial` |
| `major_crops[].area_ha` | number | Hectares | Cultivated area in district |
| `major_crops[].production_mt` | number | Metric Tonnes | Annual output in metric tonnes |
| `major_crops[].productivity_kg_ha`| number | Kg / Ha | Yield per hectare |
| `crop_specialization_index` | object | Ratings | District specialization corridors (horticulture, sugarcane, etc.) |

---

## 8. `/data/livestock.json`
- **Description**: Livestock statistics from 20th Livestock Census (2019), DAHD.
- **Join Key**: `districts[district_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `cattle_total` | number | Count | Total bovine cattle population |
| `indigenous_cattle` | number | Count | Native desi cattle (Gir, Dangi, Khillari) |
| `crossbred_cattle` | number | Count | High-yield crossbred dairy cows (HF, Jersey crosses) |
| `buffaloes` | number | Count | Murrah, Pandharpuri, Jaffarabadi buffaloes |
| `average_daily_milk_yield_liters_per_animal` | object | Liters/day | Yield benchmarks for indigenous, crossbred, and buffalo |
| `dairy_cooperative_societies_active` | number | Count | Operating primary dairy cooperative societies |

---

## 9. `/data/industrial_clusters.json`
- **Description**: Approved MSME clusters under MSE-CDP / MSI-CDP, Directorate of Industries Maharashtra.
- **Join Key**: Array of cluster records matching `district` and `industry`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `cluster_name` | string | Name | Official cluster designation |
| `district` | string | Name | Host district |
| `block` | string | Name | Host tehsil |
| `industry` | string | Sector | `Food Processing`, `Textiles & Garmenting`, `Fabrication` |
| `status` | string | Status | `Approved / Functional`, `Under Implementation` |
| `interventions` | array | List | Interventions such as Common Facility Centres (CFC), testing labs |

---

## 10. `/data/banking.json`
- **Description**: Branch banking and credit statistics from Reserve Bank of India (DBIE March 2024).
- **Join Key**: `districts[district_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `scheduled_commercial_banks` | number | Count | Commercial bank branches in district |
| `district_central_cooperative_bank_pdcc` | number | Count | DCCB / cooperative branch network |
| `credit_deposit_ratio_percent` | number | % | CD Ratio indicating credit flow to local economy |
| `lead_bank` | string | Name | Assigned District Lead Bank (Bank of Maharashtra, etc.) |
| `financial_accessibility_index` | number | 0 - 100 | Banking touchpoint density index |

---

## 11. `/data/rainfall.json`
- **Description**: Rainfall and climate vulnerability summary from IMD & Mahavedh (2023).
- **Join Key**: `districts[district_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `annual_actual_mm` | number | Millimeters | Recorded annual rainfall |
| `annual_normal_mm` | number | Millimeters | Long-period average normal rainfall |
| `departure_percent` | number | % | Departure from normal rainfall |
| `rainfall_category` | string | Classification | `Normal`, `Excess`, `Deficient` |
| `climate_risk_index` | string | Rating | `Low to Moderate`, `Moderate`, `High` |
| `purchasing_power_cyclicality` | string | Description | Correlation between rainfall and rural retail demand |

---

## 12. `/data/poi_infrastructure.json`
- **Description**: Commercial and institutional anchors mapped from OpenStreetMap (2024) and administrative atlases.
- **Join Key**: `clusters[block_name]`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `schools_and_colleges.count` | number | Count | Primary institutional demand driver for uniforms & snacks |
| `cooperative_dairy_societies.count` | number | Count | Bulk off-take and collection points for dairy ventures |
| `weekly_haats_bazaars.count` | number | Count | Footfall anchors for weekly pop-up sales |
| `grocery_kirana_outlets.count` | number | Count | Distribution partners and retail competitors |
| `bank_branches_and_csp.count` | number | Count | Micro-credit disbursement and repayment counters |

---

## 13. `/data/schemes.json`
- **Description**: Official government concessional scheme guidelines for micro-enterprises.
- **Join Key**: Array of scheme rules matching `eligible_business_categories`.

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `scheme_name` | string | Name | Official scheme title |
| `scheme_code` | string | Code | `PMEGP`, `CMEGP`, `PMFME`, `PM-VISHWAKARMA`, `MUDRA` |
| `implementing_agency` | string | Organization | KVIC, DIC Maharashtra, MoFPI, MSDE, DFS |
| `max_project_cost_inr` | number | INR | Maximum permissible project outlay under scheme rules |
| `promoter_contribution_min_percent` | number | % | Mandatory entrepreneur equity (typically 5% to 10%) |
| `government_subsidy_percent` | object | % | Margin money capital subsidy (25% - 35% in rural areas) |
| `interest_rate_structure` | object | Rates | Effective concessional borrowing interest rate |
| `special_provisions` | string | Description | Toolkit incentives, interest subventions, collateral waivers |
