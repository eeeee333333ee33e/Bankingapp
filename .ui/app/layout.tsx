import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign In | Nexo",
  description: "Access your accounts and activity with Nexo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
