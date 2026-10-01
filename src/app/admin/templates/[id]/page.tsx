"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import type { TemplateField, Category } from "@/types";

interface FormState {
  name: string;
  categoryId: string;
  description: string;
  content: string;
  isActive: boolean;
  isPremium: boolean;
  fields: TemplateField[];
}

const EMPTY_FIELD: TemplateField = {
  id: "",
  label: "",
  type: "text",
  placeholder: "",
  required: true,
};

export default function TemplateEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [form, setForm] = useState<FormState>({
    name: "", categoryId: "", description: "", content: "", isActive: true, isPremium: false, fields: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
    if (!isNew) {
      fetch(`/api/admin/templates/${id}`)
        .then(r => r.json())
        .then((t) => setForm({
          name: t.name,
          categoryId: t.categoryId,
          description: t.description,
          content: t.content,
          isActive: t.isActive,
          isPremium: t.isPremium,
          fields: t.fields ?? [],
        }));
    }
  }, [id, isNew]);

  function updateField(idx: number, key: keyof TemplateField, value: string | boolean) {
    setForm(f => ({
      ...f,
      fields: f.fields.map((fld, i) => i === idx ? { ...fld, [key]: value } : fld),
    }));
  }

  function addField() {
    setForm(f => ({ ...f, fields: [...f.fields, { ...EMPTY_FIELD }] }));
  }

  function removeField(idx: number) {
    setForm(f => ({ ...f, fields: f.fields.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const url = isNew ? "/api/admin/templates" : `/api/admin/templates/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Ошибка сохранения");
      } else {
        router.push("/admin/templates");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Новый шаблон" : "Редактирование шаблона"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Основная информация</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Название *</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Заявление на отпуск" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Категория *</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Выберите категорию</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Описание</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="с автозаполнением" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded" />
                Активен
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isPremium}
                  onChange={(e) => setForm(f => ({ ...f, isPremium: e.target.checked }))}
                  className="rounded" />
                Premium
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Поля ({form.fields.length})</h2>
              <button onClick={addField} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {form.fields.map((field, idx) => (
                <div key={idx} className="p-3 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Поле {idx + 1}</span>
                    <button onClick={() => removeField(idx)} className="p-1 rounded hover:bg-red-50 text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" placeholder="ID (латинница, без пробелов)"
                    value={field.id} onChange={(e) => updateField(idx, "id", e.target.value)} />
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Название поля"
                    value={field.label} onChange={(e) => updateField(idx, "label", e.target.value)} />
                  <div className="flex gap-2">
                    <select className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                      value={field.type} onChange={(e) => updateField(idx, "type", e.target.value as TemplateField["type"])}>
                      <option value="text">Текст</option>
                      <option value="number">Число</option>
                      <option value="date">Дата</option>
                      <option value="textarea">Многострочный</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input type="checkbox" checked={field.required}
                        onChange={(e) => updateField(idx, "required", e.target.checked)} />
                      Обязательное
                    </label>
                  </div>
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Плейсхолдер"
                    value={field.placeholder ?? ""} onChange={(e) => updateField(idx, "placeholder", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">HTML-шаблон</h2>
          <p className="text-xs text-gray-500 mb-3">Используйте <code className="bg-gray-100 px-1 rounded">{`{{field_id}}`}</code> для вставки полей</p>
          <textarea
            className="w-full h-[500px] px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500 resize-none"
            value={form.content}
            onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder={`<div class="document-page">\n  <h1>Заголовок</h1>\n  <p>{{applicant_name}}</p>\n</div>`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => router.back()} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.categoryId}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Сохранить
        </button>
      </div>
    </div>
  );
}
