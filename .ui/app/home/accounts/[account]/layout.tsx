import { accounts } from "@/lib/accounts";

export function generateStaticParams() {
  return Object.keys(accounts).map((account) => ({ account }));
}

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}