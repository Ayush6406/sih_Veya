// Official LGD (Local Government Directory) & Census of India 2011 Location Hierarchy
export interface VillageOption {
  name: string;
  lgd_code?: number;
  census_code?: string;
  pincode: string;
}

export interface SubDistrictOption {
  name: string;
  lgd_code: number;
  census_code: string;
  population_2011: number;
  households_2011: number;
  rural_literacy_percent: number;
  nearest_mandi_km: number;
  villages: VillageOption[];
}

export interface DistrictOption {
  name: string;
  lgd_code: number;
  census_code: string;
  per_capita_income_inr: number;
  unskilled_wage_inr: number;
  skilled_wage_inr: number;
  sub_districts: SubDistrictOption[];
}

export const MAHARASHTRA_DISTRICTS: DistrictOption[] = [
  {
    name: "Pune",
    lgd_code: 490,
    census_code: "521",
    per_capita_income_inr: 316742,
    unskilled_wage_inr: 380,
    skilled_wage_inr: 650,
    sub_districts: [
      {
        name: "Junnar",
        lgd_code: 4192,
        census_code: "04192",
        population_2011: 399302,
        households_2011: 84120,
        rural_literacy_percent: 78.4,
        nearest_mandi_km: 7.5,
        villages: [
          { name: "Otur", lgd_code: 555620, census_code: "555620", pincode: "410502" },
          { name: "Narayangaon", lgd_code: 555642, census_code: "555642", pincode: "410504" },
          { name: "Junnar Rural", lgd_code: 555610, census_code: "555610", pincode: "410502" },
          { name: "Alephata", lgd_code: 555635, census_code: "555635", pincode: "412411" },
          { name: "Dingore", lgd_code: 555615, census_code: "555615", pincode: "410502" },
        ],
      },
      {
        name: "Ambegaon",
        lgd_code: 4191,
        census_code: "04191",
        population_2011: 235972,
        households_2011: 49800,
        rural_literacy_percent: 79.1,
        nearest_mandi_km: 8.0,
        villages: [
          { name: "Manchar", lgd_code: 555580, census_code: "555580", pincode: "410503" },
          { name: "Ghodegaon", lgd_code: 555590, census_code: "555590", pincode: "412408" },
          { name: "Kalamb", lgd_code: 555575, census_code: "555575", pincode: "410515" },
        ],
      },
      {
        name: "Khed",
        lgd_code: 4193,
        census_code: "04193",
        population_2011: 450017,
        households_2011: 96200,
        rural_literacy_percent: 81.2,
        nearest_mandi_km: 6.5,
        villages: [
          { name: "Rajgurunagar (Khed)", lgd_code: 555700, census_code: "555700", pincode: "410505" },
          { name: "Chakan Rural", lgd_code: 555710, census_code: "555710", pincode: "410501" },
          { name: "Alandi Rural", lgd_code: 555720, census_code: "555720", pincode: "412105" },
        ],
      },
      {
        name: "Baramati",
        lgd_code: 4200,
        census_code: "04200",
        population_2011: 429600,
        households_2011: 91400,
        rural_literacy_percent: 82.5,
        nearest_mandi_km: 5.0,
        villages: [
          { name: "Malegaon Bk", lgd_code: 556010, census_code: "556010", pincode: "413115" },
          { name: "Baramati Rural", lgd_code: 556020, census_code: "556020", pincode: "413102" },
          { name: "Songaon", lgd_code: 556030, census_code: "556030", pincode: "413102" },
        ],
      },
    ],
  },
  {
    name: "Nashik",
    lgd_code: 485,
    census_code: "516",
    per_capita_income_inr: 228450,
    unskilled_wage_inr: 350,
    skilled_wage_inr: 600,
    sub_districts: [
      {
        name: "Niphad",
        lgd_code: 4157,
        census_code: "04157",
        population_2011: 493254,
        households_2011: 98400,
        rural_literacy_percent: 77.2,
        nearest_mandi_km: 4.5,
        villages: [
          { name: "Lasalgaon", lgd_code: 550810, census_code: "550810", pincode: "422306" },
          { name: "Pimpalgaon Baswant", lgd_code: 550820, census_code: "550820", pincode: "422209" },
          { name: "Niphad Rural", lgd_code: 550800, census_code: "550800", pincode: "422303" },
        ],
      },
      {
        name: "Sinnar",
        lgd_code: 4158,
        census_code: "04158",
        population_2011: 346390,
        households_2011: 69200,
        rural_literacy_percent: 79.4,
        nearest_mandi_km: 8.5,
        villages: [
          { name: "Sinnar Rural", lgd_code: 550910, census_code: "550910", pincode: "422103" },
          { name: "Musalgaon", lgd_code: 550920, census_code: "550920", pincode: "422112" },
        ],
      },
      {
        name: "Dindori",
        lgd_code: 4155,
        census_code: "04155",
        population_2011: 315709,
        households_2011: 61400,
        rural_literacy_percent: 74.8,
        nearest_mandi_km: 11.0,
        villages: [
          { name: "Dindori Rural", lgd_code: 550710, census_code: "550710", pincode: "422202" },
          { name: "Vani Rural", lgd_code: 550720, census_code: "550720", pincode: "422215" },
        ],
      },
    ],
  },
  {
    name: "Ahmednagar",
    lgd_code: 476,
    census_code: "522",
    per_capita_income_inr: 209870,
    unskilled_wage_inr: 340,
    skilled_wage_inr: 580,
    sub_districts: [
      {
        name: "Sangamner",
        lgd_code: 4166,
        census_code: "04166",
        population_2011: 487939,
        households_2011: 99200,
        rural_literacy_percent: 76.8,
        nearest_mandi_km: 6.0,
        villages: [
          { name: "Sangamner Rural", lgd_code: 551800, census_code: "551800", pincode: "422605" },
          { name: "Gunjalwadi", lgd_code: 551810, census_code: "551810", pincode: "422605" },
          { name: "Ashwi Khurd", lgd_code: 551820, census_code: "551820", pincode: "413738" },
        ],
      },
    ],
  },
  {
    name: "Satara",
    lgd_code: 494,
    census_code: "527",
    per_capita_income_inr: 241600,
    unskilled_wage_inr: 360,
    skilled_wage_inr: 620,
    sub_districts: [
      {
        name: "Karad",
        lgd_code: 4235,
        census_code: "04235",
        population_2011: 584085,
        households_2011: 124800,
        rural_literacy_percent: 82.1,
        nearest_mandi_km: 5.5,
        villages: [
          { name: "Karad Rural", lgd_code: 563400, census_code: "563400", pincode: "415110" },
          { name: "Malkapur Rural", lgd_code: 563410, census_code: "563410", pincode: "415539" },
          { name: "Ond", lgd_code: 563420, census_code: "563420", pincode: "415111" },
        ],
      },
    ],
  },
  {
    name: "Kolhapur",
    lgd_code: 482,
    census_code: "530",
    per_capita_income_inr: 264300,
    unskilled_wage_inr: 375,
    skilled_wage_inr: 640,
    sub_districts: [
      {
        name: "Shirol",
        lgd_code: 4078,
        census_code: "04078",
        population_2011: 391437,
        households_2011: 82400,
        rural_literacy_percent: 81.3,
        nearest_mandi_km: 7.0,
        villages: [
          { name: "Shirol Rural", lgd_code: 567100, census_code: "567100", pincode: "416103" },
          { name: "Jaysingpur Rural", lgd_code: 567110, census_code: "567110", pincode: "416101" },
          { name: "Kurundwad Rural", lgd_code: 567120, census_code: "567120", pincode: "416106" },
        ],
      },
    ],
  },
];
