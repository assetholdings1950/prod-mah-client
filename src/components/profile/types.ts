export interface ClientProfile {
  _id: string;
  email: string;
  clientId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  profileImage: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other" | null;
  nationality: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  preferredCurrency: string;
  riskProfile: "conservative" | "moderate" | "aggressive";
  kycStatus: string;
  status: string;
  createdAt: string;
  agent: {
    _id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    agentId: string;
  } | null;
}

export type FormState = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  country: string;
  countryCode: string;
  city: string;
  address: string;
  postalCode: string;
  preferredCurrency: string;
  riskProfile: string;
  profileImage: string;
};

export const EMPTY_FORM: FormState = {
  firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "",
  gender: "", nationality: "", country: "", countryCode: "", city: "",
  address: "", postalCode: "", preferredCurrency: "USD",
  riskProfile: "moderate", profileImage: "",
};
