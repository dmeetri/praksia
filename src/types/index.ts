// ─── Template Types ───────────────────────────────────────────────────────────

export type FieldType = "text" | "number" | "date" | "textarea" | "select";

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  computed?: string; // e.g. "start_date + days_count"
  options?: string[]; // for select type
}

export interface Template {
  id: string;
  name: string;
  category: Category;
  categoryId: string;
  description: string;
  fields: TemplateField[];
  content: string;
  isActive: boolean;
  isPremium: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  _count?: { templates: number };
}

// ─── Document (stored in IndexedDB) ──────────────────────────────────────────

export interface SavedDocument {
  id: string;
  templateId: string;
  templateName: string;
  categoryName: string;
  name: string;           // user-given name
  content: string;        // current HTML content
  fieldValues: Record<string, string>;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isAdmin: boolean;
  subscription?: {
    plan: "FREE" | "PREMIUM";
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    expiresAt: string | null;
  };
  createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
