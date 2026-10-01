"use client";

import Link from "next/link";
import { FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  compact?: boolean;
}

export function TemplateCard({ template, compact = false }: TemplateCardProps) {
  if (compact) {
    return (
      <Link
        href={`/editor/${template.id}`}
        className={cn(
          "flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group",
          "hover:bg-[var(--brand-light)]"
        )}
      >
        <span className="text-sm font-medium group-hover:text-[var(--brand)] transition-colors line-clamp-1" style={{ color: "var(--text)" }}>
          {template.name}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {template.category?.name} · {template.description}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/editor/${template.id}`}
      className="card group flex flex-col gap-3 hover:shadow-card-hover cursor-pointer relative"
    >
      {template.isPremium && (
        <div className="absolute top-3 right-3">
          <span className="badge badge-yellow flex items-center gap-1">
            <Lock className="w-3 h-3" /> Premium
          </span>
        </div>
      )}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: "var(--brand-light)" }}
      >
        <FileText className="w-5 h-5" style={{ color: "var(--brand)" }} />
      </div>
      <div>
        <p className="font-semibold text-sm group-hover:text-[var(--brand)] transition-colors" style={{ color: "var(--text)" }}>
          {template.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {template.category?.name} · {template.description}
        </p>
      </div>
    </Link>
  );
}
