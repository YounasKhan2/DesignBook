export interface Design {
  id: string;
  designName: string;
  designNumber: string;
  companyId: string;
  dyeId: string;
  dyeName: string;
  dyeNumber: string;
  description: string;
  images: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  companyNumber: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dye {
  id: string;
  dyeName: string;
  dyeNumber: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
