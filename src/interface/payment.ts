export interface IBankDetail {
  _id: string;
  userId: string;
  userModel: "Client" | "Agent" | "User";
  bankName: string | null;
  branchName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  swiftCode: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IWalletDetail {
  _id: string;
  userId: string;
  userModel: "Client" | "Agent" | "User";
  label: string | null;
  network: string | null;
  walletAddress: string | null;
  isPrimary: boolean;
  balance?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}
