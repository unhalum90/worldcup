export type CityProduct = {
  en?: string;
  es?: string;
  fr?: string;
  pt?: string;
  ar?: string;
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
      en: "https://gumroad.com/l/atlanta-en",
    },
  },
  {
    id: "boston",
    name: "Boston",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/boston-en",
      es: "https://gumroad.com/l/boston-es",
      fr: "https://gumroad.com/l/boston-fr",
      pt: "https://gumroad.com/l/boston-pt",
      ar: "https://gumroad.com/l/boston-ar",
    },
  },
  {
    id: "dallas",
    name: "Dallas",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/dallas-en",
    },
  },
  {
    id: "guadalajara",
    name: "Guadalajara",
    flag: "/flags/mx.svg",
    products: {
      en: "https://gumroad.com/l/guadalajara-en",
      es: "https://gumroad.com/l/guadalajara-es",
    },
  },
  {
    id: "houston",
    name: "Houston",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/houston-en",
    },
  },
  {
    id: "kansas-city",
    name: "Kansas City",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/kansascity-en",
    },
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/losangeles-en",
    },
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    flag: "/flags/mx.svg",
    products: {
      en: "https://gumroad.com/l/mexicocity-en",
      es: "https://gumroad.com/l/mexicocity-es",
    },
  },
  {
    id: "miami",
    name: "Miami",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/miami-en",
    },
  },
  {
    id: "monterrey",
    name: "Monterrey",
    flag: "/flags/mx.svg",
    products: {
      en: "https://gumroad.com/l/monterrey-en",
      es: "https://gumroad.com/l/monterrey-es",
    },
  },
  {
    id: "new-york",
    name: "New York / New Jersey",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/newyork-en",
    },
  },
  {
    id: "philadelphia",
    name: "Philadelphia",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/philadelphia-en",
    },
  },
  {
    id: "san-francisco",
    name: "San Francisco Bay Area",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/sanfrancisco-en",
    },
  },
  {
    id: "seattle",
    name: "Seattle",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/seattle-en",
    },
  },
  {
    id: "toronto",
    name: "Toronto",
    flag: "/flags/ca.svg",
    products: {
      en: "https://gumroad.com/l/toronto-en",
      fr: "https://gumroad.com/l/toronto-fr",
    },
  },
  {
    id: "vancouver",
    name: "Vancouver",
    flag: "/flags/ca.svg",
    products: {
      en: "https://gumroad.com/l/vancouver-en",
    },
  },
];

export const languages = [
  { key: 'en', label: 'EN', name: 'English' },
  { key: 'es', label: 'ES', name: 'Spanish' },
  { key: 'fr', label: 'FR', name: 'French' },
  { key: 'pt', label: 'PT', name: 'Portuguese' },
  { key: 'ar', label: 'AR', name: 'Arabic' },
];
