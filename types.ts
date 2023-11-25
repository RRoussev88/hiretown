import { ListResult, RecordModel as CollectionRecord } from "pocketbase";
import { PaymentMethod } from "./utils";

export type SelectOption = {
  key: string;
  value: string | null;
  label: string;
};

export type BaseRecord = { name: string } & CollectionRecord;

// Use Moment type in the future or at least an union of string and number.
// Better store the timestamp as a number
type DateString = string;

export interface Country extends CollectionRecord {
  callingCode: string;
  capital: string;
  code: string;
  flagImageUri: string;
  name: string;
  numRegions: number;
  wikiDataId: string;
}

export interface Region extends CollectionRecord {
  country: string;
  countryCode: string;
  isoCode: string;
  name: string;
  numCities: number;
  wikiDataId: string;
  capital?: string;
  fipsCode?: string;
}

export interface Division extends CollectionRecord {
  country: string;
  countryCode: string;
  elevationMeters: number;
  latitude: number;
  longitude: number;
  name: string;
  population: number;
  region: string;
  regionCode: string;
  timezone: string;
  wikiDataId: string;
}

export interface City extends Division {
  division?: string;
}

export interface User extends CollectionRecord {
  avatar: string | null;
  email: string;
  emailVisibility: boolean;
  name: string;
  username: string;
  verified: boolean;
}

export type ImageUploadPayload = {
  imageBase64: string;
  imageName: string;
  imageType: string;
};

export interface ServiceCategory extends CollectionRecord {
  description: string;
  name: string;
}

export interface Service extends CollectionRecord {
  category: string;
  description: string;
  isAvailable: boolean;
  name: string;
}

export type OpeningHours = {
  Monday: [string, string];
  Tuesday: [string, string];
  Wednesday: [string, string];
  Thursday: [string, string];
  Friday: [string, string];
  Saturday: [string, string];
  Sunday: [string, string];
};

export interface Business extends CollectionRecord {
  address: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;
  description: string;
  isActive: boolean;
  name: string;
  openingHours: OpeningHours;
  priority: number;
  rating: number;
  expand: Partial<{
    "businessServices(business)": BusinessService[];
    "imageAlbums(business)": ImageAlbum[];
    "offers(business)": Offer[];
    "areas(business)": Area[];
    "socialLinks(business)": SocialLink[];
  }>;
}

export type BusinessPayload = {
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  description?: string;
  isActive: boolean;
  name: string;
  priority: number;
  rating: number;
};

// export interface BusinessDetails extends CollectionRecord {
//   business: Business["id"];
//   isActive: boolean;
//   paidUntil: DateString;
//   priority: number;
//   rating: number;
//   thumbnail: string;
//   ...
//   paymentData: ...
//   adminUsers: User[]
// } Sensitive fields that could be stored separately as One to One relation

export interface BusinessService extends CollectionRecord {
  business: Business["id"];
  service: Service["id"];
  expand?: { business: Business; service: Service };
}

export interface ImageAlbum extends CollectionRecord {
  business: Business["id"];
  description: string;
  name: string;
  expand?: { business: Business };
}

export interface BusinessImage extends CollectionRecord {
  album: ImageAlbum["id"];
  image: string;
  isSelected: boolean;
  expand?: { album: ImageAlbum };
}
export interface SocialPlatform extends CollectionRecord {
  title: string;
  key: string;
}

export interface SocialLink extends CollectionRecord {
  business: Business["id"];
  platform: SocialPlatform["id"];
  link: string;
  title?: string;
  expand: { business: Business; platform: SocialPlatform };
}

export interface Area extends CollectionRecord {
  business: CollectionRecord["id"];
  country: CollectionRecord["id"];
  region: CollectionRecord["id"];
  division: CollectionRecord["id"];
  city: CollectionRecord["id"];
  expand?: {
    business: Business;
    country: Country;
    region: Region;
    division: Division;
    city: City;
  };
}

export interface UnitOfMeasure extends CollectionRecord {
  name: string;
  shortName: string;
}

export interface Offer extends CollectionRecord {
  business: CollectionRecord["id"];
  description: string;
  name: string;
  price: number;
  currency: string; // Implement a Currency record
  service: Service["id"];
  unitOfMeasure: UnitOfMeasure["id"];
  expand?: {
    business: Business;
    service: Service;
    unitOfMeasure: UnitOfMeasure;
  };
}

export interface Role extends CollectionRecord {
  description: string;
  name: string;
  priority: number;
}

export interface UserBusiness extends CollectionRecord {
  business: CollectionRecord["id"];
  user: CollectionRecord["id"];
  expand: { business: Business; user?: User };
}

export interface UserRole extends CollectionRecord {
  role: CollectionRecord["id"];
  user: CollectionRecord["id"];
  expand?: { role: Role; user: User };
}

export interface SubscriptionPlan extends CollectionRecord {
  description: string;
  name: string;
  daysLength: number;
  price: number;
  businessCount: number;
}

export interface Payment extends CollectionRecord {
  subscription: CollectionRecord["id"];
  user: CollectionRecord["id"];
  amount: number | null;
  method: (typeof PaymentMethod)[keyof typeof PaymentMethod];
  expand?: { subscription: SubscriptionPlan; user: User };
}

export interface BusinessPlan extends CollectionRecord {
  business: CollectionRecord["id"];
  plan: CollectionRecord["id"];
  payment: CollectionRecord["id"];
  startsOn: DateString;
  expand?: { business: Business; payment: Payment; plan: SubscriptionPlan };
}

export type BusinessesFilterParams = {
  category: string;
  service: string;
  country: string;
  region?: string;
  division?: string;
  city: string;
};

export type BusinessArea = Area & {
  expand: {
    country: Country;
    region?: Region;
    division?: Division;
    city?: City;
  };
};

export type LocationSelectState = {
  id?: string;
  name?: string;
  isLoading: boolean;
};

export type LocationType = "country" | "region" | "division" | "city";

export type APIResponse<T = CollectionRecord> = ListResult<T>;

export type GeoAPIResponse<T = object> = {
  data: T[];
  metadata: { currentOffset: number; totalCount: number };
};
