import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold select-none overflow-hidden",
        sizes[size],
        !src && "bg-brand-600 text-white",
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name ?? ""} width={48} height={48} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
