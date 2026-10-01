import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: { default: "Praksia — Умные документы", template: "%s | Praksia" },
  description:
    "Создавайте официальные документы за минуты: заявления, приказы, рапорты и другие документы онлайн.",
  keywords: ["документы", "заявление", "приказ", "рапорт", "шаблоны документов"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
