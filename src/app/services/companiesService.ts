import { requireSupabase } from "../lib/supabase";
import type { Company } from "../types";

interface CompanyRow {
  id: string;
  owner_id: string;
  company_name: string;
  company_number: string;
  contact_person: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyInput {
  companyName: string;
  companyNumber: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
}

export class CompaniesServiceError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "CompaniesServiceError";
    this.code = code;
  }
}

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    companyName: row.company_name,
    companyNumber: row.company_number,
    contactPerson: row.contact_person ?? undefined,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function optionalText(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

async function getCurrentUserId() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();

  if (error) throw new CompaniesServiceError(error.message, error.name);
  if (!data.user) throw new CompaniesServiceError("You must be signed in to manage companies.", "not_authenticated");

  return data.user.id;
}

function normalizeError(error: unknown): CompaniesServiceError {
  const err = error as { message?: string; code?: string };

  if (err.code === "23505") {
    return new CompaniesServiceError("Company number is already used. Choose a different number.", "duplicate_company_number");
  }

  if (err.code === "23503") {
    return new CompaniesServiceError("This company is linked to existing designs and cannot be deleted.", "delete_blocked");
  }

  if (error instanceof CompaniesServiceError) return error;

  return new CompaniesServiceError(err.message ?? "Something went wrong while saving the company.", err.code);
}

export function getCompanyErrorMessage(error: unknown) {
  return normalizeError(error).message;
}

export async function listCompanies() {
  const client = requireSupabase();
  await getCurrentUserId();
  const { data, error } = await client
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw normalizeError(error);
  return ((data ?? []) as CompanyRow[]).map(toCompany);
}

export async function getCompanyById(id: string) {
  const client = requireSupabase();
  await getCurrentUserId();
  const { data, error } = await client
    .from("companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw normalizeError(error);
  return data ? toCompany(data as CompanyRow) : null;
}

export async function createCompany(input: CompanyInput) {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();

  const { data, error } = await client
    .from("companies")
    .insert({
      owner_id: ownerId,
      company_name: input.companyName.trim(),
      company_number: input.companyNumber.trim(),
      contact_person: optionalText(input.contactPerson),
      phone: optionalText(input.phone),
      notes: optionalText(input.notes),
    })
    .select("*")
    .single();

  if (error) throw normalizeError(error);
  return toCompany(data as CompanyRow);
}

export async function updateCompany(id: string, input: CompanyInput) {
  const client = requireSupabase();
  await getCurrentUserId();

  const { data, error } = await client
    .from("companies")
    .update({
      company_name: input.companyName.trim(),
      company_number: input.companyNumber.trim(),
      contact_person: optionalText(input.contactPerson),
      phone: optionalText(input.phone),
      notes: optionalText(input.notes),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw normalizeError(error);
  return toCompany(data as CompanyRow);
}

export async function deleteCompany(id: string) {
  const client = requireSupabase();
  await getCurrentUserId();
  const { error } = await client.from("companies").delete().eq("id", id);

  if (error) throw normalizeError(error);
}
