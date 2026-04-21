export interface OrgNode {
  id: string;
  parent_id: string;
  name: string;
  position: string;
  department: Department;
  dept_color: string;
  level: number;
  sort_order: number;
  updated_at?: string;
}

export type Department = "leadership" | "sales" | "finance" | "hr" | "service";

export interface DeptConfig {
  label: string;
  bg: string;
  border: string;
  text: string;
}

export const DEPT_CONFIG: Record<Department, DeptConfig> = {
  leadership: { label: "Ban lãnh đạo", bg: "#E6F4ED", border: "#00843D", text: "#005A2B" },
  sales:      { label: "Kinh doanh",   bg: "#DBEAFE", border: "#0077B6", text: "#1E40AF" },
  finance:    { label: "Kế toán",      bg: "#FEF3C7", border: "#D97706", text: "#92400E" },
  hr:         { label: "HC — NS",      bg: "#EDE9FE", border: "#7C3AED", text: "#5B21B6" },
  service:    { label: "Dịch vụ",      bg: "#FFE4E6", border: "#E11D48", text: "#9F1239" },
};

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: "leadership", label: "Ban lãnh đạo" },
  { value: "sales",      label: "Kinh doanh" },
  { value: "finance",    label: "Kế toán — Tài chính" },
  { value: "hr",         label: "Hành chính — Nhân sự" },
  { value: "service",    label: "Dịch vụ" },
];
