export type CityProduct = {
  en?: string;
  es?: string;
};

export type City = {
  id: string;
  name: string;
  flag: string; // path to flag svg in /public/flags
  products: CityProduct;
};

export const cities: City[] = [
  {
    id: "atlanta",
    name: "Atlanta",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/e9b8ee0d-039b-4cda-9751-5dc05de27209",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/e9b8ee0d-039b-4cda-9751-5dc05de27209",
    },
  },
  {
    id: "boston",
    name: "Boston",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/797027c4-c96e-4737-ab61-7a559d62216b",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/797027c4-c96e-4737-ab61-7a559d62216b",
    },
  },
  {
    id: "dallas",
    name: "Dallas",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/cbd81218-8b0e-4162-b273-fcec2840e785",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/cbd81218-8b0e-4162-b273-fcec2840e785",
    },
  },
  {
    id: "guadalajara",
    name: "Guadalajara",
    flag: "/flags/mx.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/da6172f4-ed40-4bdb-9cbe-885d952371af",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/da6172f4-ed40-4bdb-9cbe-885d952371af",
    },
  },
  {
    id: "houston",
    name: "Houston",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/9b21215f-8b01-466f-9351-c1ada247b193",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/9b21215f-8b01-466f-9351-c1ada247b193",
    },
  },
  {
    id: "kansas-city",
    name: "Kansas City",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/63dabf70-991b-4de9-9754-1f904dd33302",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/63dabf70-991b-4de9-9754-1f904dd33302",
    },
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/f33af5f6-df57-4cfd-ad66-1348db3f1815",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/f33af5f6-df57-4cfd-ad66-1348db3f1815",
    },
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    flag: "/flags/mx.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/6b4e850c-cf6d-405f-b538-960acaf6a4e1",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/6b4e850c-cf6d-405f-b538-960acaf6a4e1",
    },
  },
  {
    id: "miami",
    name: "Miami",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/cac3bfec-ee75-4b4c-aad6-dccb8a38403d",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/cac3bfec-ee75-4b4c-aad6-dccb8a38403d",
    },
  },
  {
    id: "monterrey",
    name: "Monterrey",
    flag: "/flags/mx.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/0bb18004-271f-40f8-901a-cf9e93c86d92",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/0bb18004-271f-40f8-901a-cf9e93c86d92",
    },
  },
  {
    id: "new-york",
    name: "New York / New Jersey",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/72d9999b-605a-4854-b186-050a57dcfc7a",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/72d9999b-605a-4854-b186-050a57dcfc7a",
    },
  },
  {
    id: "philadelphia",
    name: "Philadelphia",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/cee64e14-fd14-4497-ac55-ab4c6d0c7abd",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/cee64e14-fd14-4497-ac55-ab4c6d0c7abd",
    },
  },
  {
    id: "san-francisco",
    name: "San Francisco Bay Area",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/0c6977df-e95f-481b-9c99-a0bfe8566e4f",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/0c6977df-e95f-481b-9c99-a0bfe8566e4f",
    },
  },
  {
    id: "seattle",
    name: "Seattle",
    flag: "/flags/us.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/5eb6125a-1240-4a81-a204-1c61f0e2b9bf",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/5eb6125a-1240-4a81-a204-1c61f0e2b9bf",
    },
  },
  {
    id: "toronto",
    name: "Toronto",
    flag: "/flags/ca.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/9d0da014-03a2-4f13-99d7-f38aedfb312c",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/9d0da014-03a2-4f13-99d7-f38aedfb312c",
    },
  },
  {
    id: "vancouver",
    name: "Vancouver",
    flag: "/flags/ca.svg",
    products: {
      en: "https://fanzonenetwork.lemonsqueezy.com/buy/3305da18-4612-49ec-b853-a0b41dfee707",
      es: "https://fanzonenetwork.lemonsqueezy.com/buy/3305da18-4612-49ec-b853-a0b41dfee707",
    },
  },
];

export const languages = [
  { key: 'en', label: 'EN', name: 'English' },
  { key: 'es', label: 'ES', name: 'Spanish' },
];
