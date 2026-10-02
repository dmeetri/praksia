import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import type { Metadata } from "next";

interface Props {
  params: { templateId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const template = await db.template.findUnique({
    where: { id: params.templateId, isActive: true },
    select: { name: true },
  });
  return { title: template?.name ?? "Редактор" };
}

export default async function EditorPage({ params }: Props) {
  const [template, session] = await Promise.all([
    db.template.findUnique({
      where: { id: params.templateId, isActive: true },
      include: { category: true },
    }),
    getServerSession(authOptions),
  ]);

  if (!template) notFound();

  const t = {
    ...template,
    fields: template.fields as unknown as import("@/types").TemplateField[],
    category: template.category,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };

  return <DocumentEditor template={t} isGuest={!session} />;
}
