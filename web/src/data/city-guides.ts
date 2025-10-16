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
    id: "boston",
    name: "Boston",
    flag: "/flags/us.svg",
    products: {
      en: "https://gumroad.com/l/boston-en",
      es: "",
      fr: "",
      pt: "",
      ar: "",
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
    id: "toronto",
    name: "Toronto",
    flag: "/flags/ca.svg",
    products: {
      en: "https://gumroad.com/l/toronto-en",
      fr: "https://gumroad.com/l/toronto-fr",
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
    id: "mexico-city",
    name: "Mexico City",
    flag: "/flags/mx.svg",
    products: {
      en: "https://gumroad.com/l/mexicocity-en",
      es: "https://gumroad.com/l/mexicocity-es",
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
