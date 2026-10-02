"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Table,
  Printer, Download, Mail, Sparkles, Save, ArrowLeft, FileDown,
  Info, X, Loader2,
} from "lucide-react";
import { applyFields } from "@/lib/utils";
import { saveDocument, getDocument, updateDocument } from "@/lib/storage";
import { exportToPDF } from "@/lib/export/exportPDF";
import { exportToDOCX } from "@/lib/export/exportDOCX";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Template, TemplateField, SavedDocument } from "@/types";
import { FieldsSidebar } from "./FieldsSidebar";

interface DocumentEditorProps {
  template: Template;
  isGuest?: boolean;
}

export function DocumentEditor({ template, isGuest = false }: DocumentEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const toast = useToast();

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [docName, setDocName] = useState(template.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Modals
  const [emailModal, setEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [guestBanner, setGuestBanner] = useState(isGuest);

  // Render content with current field values
  const regenerateContent = useCallback(
    (values: Record<string, string>) => {
      const rendered = applyFields(template.content, values);
      setContent(rendered);
      if (editorRef.current) {
        editorRef.current.innerHTML = rendered;
      }
    },
    [template.content]
  );

  // Load existing doc or initialize with empty values
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
      // Initialize with empty values and immediately render
      // applyFields now shows underscores for empty fields — correct legal blank style
      const initial: Record<string, string> = {};
      template.fields.forEach((f) => {
        if (!f.computed) initial[f.id] = "";
      });
      setFieldValues(initial);
      const rendered = applyFields(template.content, initial);
      setContent(rendered);
      setTimeout(() => {
        if (editorRef.current) editorRef.current.innerHTML = rendered;
      }, 0);
    }
  }, [docId, template.fields, template.content]);

  const handleFieldChange = useCallback(
    (id: string, value: string) => {
      setFieldValues((prev) => {
        const updated = { ...prev, [id]: value };
        regenerateContent(updated);
        return updated;
      });
    },
    [regenerateContent]
  );

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  }, []);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  // Validation
  const validation = template.fields
    .filter((f) => f.required && !f.computed)
    .map((f) => ({ field: f, valid: !!fieldValues[f.id]?.trim() }));
  const allValid = validation.every((v) => v.valid);

  // Save to IndexedDB
  async function handleSave() {
    setSaving(true);
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
      toast.error((err as Error).message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      await exportToPDF("doc-print-area", docName);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportDOCX() {
    setExporting(true);
    try {
      const currentContent = editorRef.current?.innerHTML ?? content;
      await exportToDOCX(currentContent, docName);
    } finally {
      setExporting(false);
    }
  }

  async function handleSendEmail() {
    if (!emailInput.trim()) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailInput.trim(),
          subject: docName,
          documentName: docName,
        }),
      });
      if (res.ok) {
        toast.success("Письмо успешно отправлено!");
        setEmailModal(false);
        setEmailInput("");
      } else {
        toast.error("Ошибка отправки. Проверьте настройки SMTP.");
      }
    } catch {
      toast.error("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Main editor area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Guest banner */}
        {guestBanner && (
          <div className="flex items-center gap-3 px-4 py-2.5 text-sm no-print" style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
            <Info className="w-4 h-4 flex-shrink-0 text-blue-600" />
            <span className="flex-1 text-blue-800">
              Вы работаете без авторизации. Документы сохраняются только в браузере (на этом устройстве).{" "}
              <Link href="/register" className="font-semibold underline">Зарегистрируйтесь</Link>
              {" "}или{" "}
              <Link href="/login" className="font-semibold underline">войдите</Link>
              {" "}для сохранения в облаке.
            </span>
            <button onClick={() => setGuestBanner(false)} className="p-0.5 rounded hover:bg-blue-100">
              <X className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="header px-4 flex items-center gap-3 h-14 no-print">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="flex-1 max-w-xs text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-[var(--brand)] transition-colors"
            style={{ color: "var(--text)" }}
          />

          <div className="flex-1" />

          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5 ${saved ? "border-green-500 text-green-600" : ""}`}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Сохранено!" : saving ? "Сохраняю..." : "Сохранить"}
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-1 px-4 py-2 border-b no-print"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <button onClick={() => exec("bold")} className="btn-ghost p-1.5" title="Жирный"><Bold className="w-4 h-4" /></button>
          <button onClick={() => exec("italic")} className="btn-ghost p-1.5" title="Курсив"><Italic className="w-4 h-4" /></button>
          <button onClick={() => exec("underline")} className="btn-ghost p-1.5" title="Подчёркнутый"><Underline className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
          <button onClick={() => exec("justifyLeft")} className="btn-ghost p-1.5"><AlignLeft className="w-4 h-4" /></button>
          <button onClick={() => exec("justifyCenter")} className="btn-ghost p-1.5"><AlignCenter className="w-4 h-4" /></button>
          <button onClick={() => exec("justifyRight")} className="btn-ghost p-1.5"><AlignRight className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
          <button onClick={() => exec("insertUnorderedList")} className="btn-ghost p-1.5"><List className="w-4 h-4" /></button>
          <button
            onClick={() => exec("insertHTML", "<table border='1' style='border-collapse:collapse;width:100%'><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>")}
            className="btn-ghost p-1.5"
          >
            <Table className="w-4 h-4" />
          </button>
          <div className="flex-1" />
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
        onEmail={isGuest ? undefined : () => setEmailModal(true)}
        exporting={exporting}
        isGuest={isGuest}
      />

      {/* Email modal */}
      <Modal
        open={emailModal}
        title="Отправить по email"
        confirmText={emailSending ? "Отправка..." : "Отправить"}
        onConfirm={handleSendEmail}
        onClose={() => { setEmailModal(false); setEmailInput(""); }}
      >
        <div className="mb-4">
          <label className="label mb-1">Email получателя</label>
          <input
            type="email"
            className="input"
            placeholder="recipient@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
            autoFocus
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
            Получатель получит уведомление со ссылкой на документ
          </p>
        </div>
      </Modal>
    </div>
  );
}
