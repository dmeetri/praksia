import { notFound } from "next/navigation";
import db from "@/lib/db";
import { TemplateCard } from "@/components/templates/TemplateCard";
import type { Template } from "@/types";

interface Props { params: { id: string } }

export default async function CategoryPage({ params }: Props) {
  const category = await db.category.findUnique({
    where: { id: params.id },
    include: {
      templates: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { category: true },
      },
    },
  });

  if (!category) notFound();

  const templates = category.templates.map((t) => ({
    ...t,
    fields: t.fields as unknown as import("@/types").TemplateField[],
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })) as Template[];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {category.name}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>
          {templates.length} шаблонов
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: "var(--text-muted)" }}>
          В этой категории пока нет шаблонов
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => <TemplateCard key={t.id} template={t} />)}
        </div>
      )}
    </div>
  );
}
