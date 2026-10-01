"use client";

import { CheckCircle2, XCircle, Download, FileDown, Mail, Loader2 } from "lucide-react";
import type { TemplateField } from "@/types";
import { cn } from "@/lib/utils";

interface ValidationItem {
  field: TemplateField;
  valid: boolean;
}

interface FieldsSidebarProps {
  fields: TemplateField[];
  fieldValues: Record<string, string>;
  onFieldChange: (id: string, value: string) => void;
  validation: ValidationItem[];
  allValid: boolean;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onEmail: () => void;
  exporting: boolean;
}

export function FieldsSidebar({
  fields,
  fieldValues,
  onFieldChange,
  validation,
  allValid,
  onExportPDF,
  onExportDOCX,
  onEmail,
  exporting,
}: FieldsSidebarProps) {
  const editableFields = fields.filter((f) => !f.computed);

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col overflow-y-auto border-l no-print scrollbar-hide"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Fields */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Поля документа
          </h3>
          <span className="text-xs badge badge-gray">
            {Object.values(fieldValues).filter(Boolean).length}/{editableFields.length}
          </span>
        </div>

        <div className="space-y-3">
          {editableFields.map((field) => (
            <div key={field.id}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className="textarea"
                  placeholder={field.placeholder}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  rows={3}
                />
              ) : field.type === "select" ? (
                <select
                  className="input"
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                >
                  <option value="">Выберите...</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                  className="input"
                  placeholder={field.placeholder}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
          Проверка перед печатью
        </h3>
        <div className="space-y-2">
          {validation.map(({ field, valid }) => (
            <div key={field.id} className={cn("check-item", valid && "valid", !valid && "invalid")}>
              {valid ? (
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="text-xs">{field.label}</span>
            </div>
          ))}
          {validation.length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Все поля заполнены</p>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
          Экспорт
        </h3>
        <div className="space-y-2">
          <button
            onClick={onExportDOCX}
            disabled={exporting}
            className="btn-secondary w-full justify-between text-sm py-2.5"
          >
            <div className="flex items-center gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-blue-600" />}
              Скачать DOCX
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
          </button>
          <button
            onClick={onExportPDF}
            disabled={exporting}
            className="btn-secondary w-full justify-between text-sm py-2.5"
          >
            <div className="flex items-center gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-red-600" />}
              Скачать PDF
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
          </button>
          <button
            onClick={onEmail}
            className="btn-secondary w-full justify-between text-sm py-2.5"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              Отправить по email
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
