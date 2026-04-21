import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sơ đồ Tổ chức — VinFast Minh Thanh TPHCM",
  description: "Sơ đồ cơ cấu tổ chức Công ty CP Ô tô Minh Thanh TPHCM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
