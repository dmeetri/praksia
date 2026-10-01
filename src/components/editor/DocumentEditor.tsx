"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Table,
  Printer, Download, Mail, Sparkles, CheckCircle2, XCircle, Save, ArrowLeft,
  FileDown
} from "lucide-react";
import { applyFields, formatDateShort } from "@/lib/utils";
import { saveDocument, getDocument, updateDocument } from "@/lib/storage";
import { exportToPDF } from "@/lib/export/exportPDF";
import { exportToDOCX } from "@/lib/export/exportDOCX";
import type { Template, TemplateField, SavedDocument } from "@/types";
import { addDays, parseISO, format } from "date-fns";
import { FieldsSidebar } from "./FieldsSidebar";

interface DocumentEditorProps {
  template: Template;
}

export function DocumentEditor({ template }: DocumentEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [docName, setDocName] = useState(template.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content from template
  const regenerateContent = useCallback((values: Record<string, string>) => {
    let rendered = applyFields(template.content, values);
    setContent(rendered);
    if (editorRef.current) {
      editorRef.current.innerHTML = rendered;
    }
  }, [template.content]);

  // Load existing doc or initialize blank
  useEffect(() => {
    if (docId) {
      getDocument(docId).then((doc) => {
        if (doc) {
          setFieldValues(doc.fieldValues);
          setDocName(doc.name);
          setContent(doc.content);
          setTimeout(() => {
            if (editorRef.current) editorRef.current.innerHTML = doc.content;
          }, 0);
        }
      });
    } else {
      // Init with empty values
      const initial: Record<string, string> = {};
      template.fields.forEach((f) => { initial[f.id] = ""; });
      setFieldValues(initial);
    }
  }, [docId, template.fields]);

  // Update content when field values change
  const handleFieldChange = useCallback((id: string, value: string) => {
    setFieldValues((prev) => {
      const updated = { ...prev, [id]: value };
      regenerateContent(updated);
      return updated;
    });
  }, [regenerateContent]);

  // Capture editor changes
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Toolbar actions
  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  // Validation
  const validation = template.fields
    .filter((f) => f.required && !f.computed)
    .map((f) => ({
      field: f,
      valid: !!fieldValues[f.id]?.trim(),
    }));
  const allValid = validation.every((v) => v.valid);

  // Save to IndexedDB
  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const currentContent = editorRef.current?.innerHTML ?? content;
    try {
      if (docId) {
        await updateDocument(docId, { content: currentContent, fieldValues, name: docName });
      } else {
        const doc = await saveDocument({
          templateId: template.id,
          templateName: template.name,
          categoryName: template.category?.name ?? "",
          name: docName,
          content: currentContent,
          fieldValues,
          isFavorite: false,
          isArchived: false,
        });
        router.replace(`/editor/${template.id}?docId=${doc.id}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Export PDF
  async function handleExportPDF() {
    setExporting(true);
    try {
      await exportToPDF("doc-print-area", docName);
    } finally {
      setExporting(false);
    }
  }

  // Export DOCX
  async function handleExportDOCX() {
    setExporting(true);
    try {
      const currentContent = editorRef.current?.innerHTML ?? content;
      await exportToDOCX(currentContent, docName);
    } finally {
      setExporting(false);
    }
  }

  // Send email
  async function handleEmail() {
    const email = prompt("Введите email для отправки:");
    if (!email) return;
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: docName,
        documentName: docName,
      }),
    });
    if (res.ok) alert("Письмо отправлено!");
    else alert("Ошибка отправки. Проверьте настройки SMTP.");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Main editor area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor header */}
        <div className="header px-4 flex items-center gap-3 h-14 no-print">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Doc name */}
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="flex-1 max-w-xs text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-[var(--brand)] transition-colors"
            style={{ color: "var(--text)" }}
          />

          <div className="flex-1" />

          {saveError && (
            <p className="text-xs text-red-500 max-w-xs truncate">{saveError}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-secondary text-sm px-3 py-1.5 ${saved ? "border-green-500 text-green-600" : ""}`}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Сохранено!" : saving ? "Сохраняю..." : "Сохранить"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b no-print"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <button onClick={() => exec("bold")} className="btn-ghost p-1.5" title="Жирный">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => exec("italic")} className="btn-ghost p-1.5" title="Курсив">
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => exec("underline")} className="btn-ghost p-1.5" title="Подчёркнутый">
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
          <button onClick={() => exec("justifyLeft")} className="btn-ghost p-1.5"><AlignLeft className="w-4 h-4" /></button>
          <button onClick={() => exec("justifyCenter")} className="btn-ghost p-1.5"><AlignCenter className="w-4 h-4" /></button>
          <button onClick={() => exec("justifyRight")} className="btn-ghost p-1.5"><AlignRight className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
          <button onClick={() => exec("insertUnorderedList")} className="btn-ghost p-1.5"><List className="w-4 h-4" /></button>
          <button onClick={() => exec("insertHTML", "<table border='1' style='border-collapse:collapse;width:100%'><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>")}
            className="btn-ghost p-1.5"><Table className="w-4 h-4" /></button>

          <div className="flex-1" />

          {/* AI button (premium placeholder) */}
          <button
            className="btn-ghost p-1.5 text-amber-500"
            title="ИИ-помощник (Premium)"
            onClick={() => router.push("/subscription")}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs ml-1 hidden sm:inline">ИИ-помощник</span>
          </button>

          <button onClick={() => window.print()} className="btn-ghost p-1.5" title="Печать">
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Document canvas */}
        <div className="flex-1 overflow-y-auto p-6" style={{ background: "#e5e7eb" }}>
          <div
            id="doc-print-area"
            className="print-area"
            style={{
              background: "white",
              width: "210mm",
              minHeight: "297mm",
              margin: "0 auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              className="document-page outline-none"
              style={{ minHeight: "297mm" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <FieldsSidebar
        fields={template.fields}
        fieldValues={fieldValues}
        onFieldChange={handleFieldChange}
        validation={validation}
        allValid={allValid}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onEmail={handleEmail}
        exporting={exporting}
      />
    </div>
  );
}
