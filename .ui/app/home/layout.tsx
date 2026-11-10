import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Nexo",
  description: "Your accounts, always within reach.",
};

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}