import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "ExcelWizPro MTM-8",
  description: "AI formula and reporting engine for Excel workbooks."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
