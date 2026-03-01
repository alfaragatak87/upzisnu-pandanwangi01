export class AdminValidationError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "AdminValidationError";
    this.field = field;
  }
}

type StringOptions = {
  label?: string;
  field?: string;
  required?: boolean;
  maxLength?: number;
};

type IntOptions = {
  label?: string;
  field?: string;
  required?: boolean;
  min?: number;
  max?: number;
};

function getFieldLabel(label: string | undefined, fallback: string) {
  return label ?? fallback;
}

function getStringField(form: FormData, key: string): string {
  const value = form.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
}

export function readString(form: FormData, key: string, options: StringOptions = {}): string {
  const label = getFieldLabel(options.label, key);
  const value = getStringField(form, key);
  if (options.required && !value) {
    throw new AdminValidationError(`${label} wajib diisi.`, options.field ?? key);
  }
  if (options.maxLength && value.length > options.maxLength) {
    throw new AdminValidationError(`${label} maksimal ${options.maxLength} karakter.`, options.field ?? key);
  }
  return value;
}

export function readNullableString(form: FormData, key: string, options: StringOptions = {}): string | null {
  const value = readString(form, key, { ...options, required: false });
  return value || null;
}

export function readInt(form: FormData, key: string, options: IntOptions = {}): number {
  const label = getFieldLabel(options.label, key);
  const raw = getStringField(form, key);
  if (!raw) {
    if (options.required) {
      throw new AdminValidationError(`${label} wajib diisi.`, options.field ?? key);
    }
    return 0;
  }

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new AdminValidationError(`${label} harus berupa angka bulat.`, options.field ?? key);
  }
  if (typeof options.min === "number" && value < options.min) {
    throw new AdminValidationError(`${label} minimal ${options.min}.`, options.field ?? key);
  }
  if (typeof options.max === "number" && value > options.max) {
    throw new AdminValidationError(`${label} maksimal ${options.max}.`, options.field ?? key);
  }
  return value;
}

export function readBoolean(form: FormData, key: string): boolean {
  const value = form.get(key);
  if (typeof value !== "string") return false;
  return value === "on" || value === "1" || value === "true";
}

export function readOptionalDate(form: FormData, key: string, field = key): Date | null {
  const raw = getStringField(form, key);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new AdminValidationError(`${key} tidak valid.`, field);
  }
  return date;
}

export function assertHttpUrl(value: string | null, label: string, field: string) {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new AdminValidationError(`${label} harus URL valid (http/https).`, field);
  }
}

export function assertEmail(value: string, field = "email") {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new AdminValidationError("Format email tidak valid.", field);
  }
}
