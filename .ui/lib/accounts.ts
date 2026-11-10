export type AccountSlug = "main" | "checking" | "savings" | "investments";

export type AccountOverview = {
  slug: AccountSlug;
  name: string;
  type: string;
  number: string;
  routing: string;
  status: "Active";
  opened: string;
  balance: number;
  available: number;
  pending: number;
  held: number;
  change30d: number;
  inflow: number;
  outflow: number;
  apy?: number;
  interestYtd?: number;
  overdraftLimit?: number;
  monthlyLimit: { used: number; total: number };
  trend: number[];
  breakdown: { label: string; value: number; color: string }[];
  recent: { name: string; date: string; amount: number }[];
};

export const accounts: Record<AccountSlug, AccountOverview> = {
  main: {
    slug: "main", name: "Main", type: "Business operating account", number: "•••• 4821", routing: "061 000 104",
    status: "Active", opened: "Mar 12, 2023", balance: 22480.5, available: 21395.5, pending: 1085, held: 0,
    change30d: 1186.54, inflow: 18940.2, outflow: 17753.66, monthlyLimit: { used: 17753.66, total: 50000 },
    trend: [20100, 20450, 20300, 20980, 21200, 20850, 21500, 21320, 21900, 22300, 21800, 22100, 22480.5],
    breakdown: [
      { label: "Payroll", value: 12800, color: "#4c4bf4" },
      { label: "Software", value: 2140.66, color: "#8b8af8" },
      { label: "Vendors", value: 1950, color: "#55bf81" },
      { label: "Other", value: 863, color: "#c6c8dc" },
    ],
    recent: [
      { name: "Stripe payout", date: "Nov 7", amount: 6427.8 },
      { name: "October payroll", date: "Nov 1", amount: -12800 },
      { name: "Adobe Creative Cloud", date: "Nov 9", amount: -28.49 },
    ],
  },
  checking: {
    slug: "checking", name: "Checking", type: "Everyday checking", number: "•••• 7305", routing: "061 000 104",
    status: "Active", opened: "Mar 12, 2023", balance: 8245.32, available: 8045.32, pending: 200, held: 0,
    change30d: 42.18, inflow: 5200, outflow: 5157.82, overdraftLimit: 1000, monthlyLimit: { used: 5157.82, total: 15000 },
    trend: [8100, 8000, 8350, 8200, 8420, 8150, 8300, 8280, 8120, 8390, 8210, 8300, 8245.32],
    breakdown: [
      { label: "Bills", value: 2100, color: "#4c4bf4" },
      { label: "Transfers", value: 1800, color: "#8b8af8" },
      { label: "Dining", value: 740.82, color: "#55bf81" },
      { label: "Other", value: 517, color: "#c6c8dc" },
    ],
    recent: [
      { name: "Ferrer Accounting", date: "Nov 8", amount: -185 },
      { name: "Google Workspace", date: "Nov 5", amount: -14.25 },
      { name: "Transfer from Main", date: "Nov 3", amount: 1500 },
    ],
  },
  savings: {
    slug: "savings", name: "Savings", type: "High-yield savings", number: "•••• 9164", routing: "061 000 104",
    status: "Active", opened: "Jun 2, 2023", balance: 15850, available: 15850, pending: 0, held: 0,
    change30d: 58.2, inflow: 500, outflow: 0, apy: 4.35, interestYtd: 612.4, monthlyLimit: { used: 2, total: 6 },
    trend: [15200, 15250, 15300, 15350, 15400, 15450, 15500, 15550, 15600, 15650, 15700, 15780, 15850],
    breakdown: [
      { label: "Emergency fund", value: 9000, color: "#4c4bf4" },
      { label: "Taxes", value: 4350, color: "#8b8af8" },
      { label: "Equipment", value: 2500, color: "#55bf81" },
    ],
    recent: [
      { name: "Interest payment", date: "Nov 1", amount: 56.7 },
      { name: "Transfer from Main", date: "Oct 28", amount: 500 },
      { name: "Interest payment", date: "Oct 1", amount: 54.9 },
    ],
  },
  investments: {
    slug: "investments", name: "Investments", type: "Treasury & brokerage", number: "•••• 2057", routing: "061 000 104",
    status: "Active", opened: "Jan 18, 2024", balance: 31620.5, available: 4120.5, pending: 0, held: 27500,
    change30d: 1112.76, inflow: 0, outflow: 0, apy: 5.1, interestYtd: 1488.3, monthlyLimit: { used: 0, total: 25000 },
    trend: [29800, 30100, 29950, 30400, 30250, 30700, 30900, 30600, 31000, 31200, 31100, 31450, 31620.5],
    breakdown: [
      { label: "Treasury bills", value: 15000, color: "#4c4bf4" },
      { label: "Money market", value: 8120.5, color: "#8b8af8" },
      { label: "ETFs", value: 7500, color: "#55bf81" },
      { label: "Cash", value: 1000, color: "#c6c8dc" },
    ],
    recent: [
      { name: "T-Bill interest", date: "Nov 6", amount: 312.4 },
      { name: "ETF dividend", date: "Oct 30", amount: 94.15 },
      { name: "Money market deposit", date: "Oct 22", amount: -2000 },
    ],
  },
};

export const money = (n: number, signed = false) => {
  const s = Math.abs(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
  return n < 0 ? `-${s}` : signed ? `+${s}` : s;
};

export type Transfer = {
  id: string;
  source: AccountSlug;
  destination: string;
  amountCents: number;
  date: string;
};

const TRANSFERS_KEY = "nexo-demo-transfers";

export function getTransfers(): Transfer[] {
  if (typeof window === "undefined") return [];
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(TRANSFERS_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is Transfer =>
      item && typeof item.id === "string" && typeof item.source === "string" &&
      Object.hasOwn(accounts, item.source) && typeof item.destination === "string" &&
      Number.isSafeInteger(item.amountCents) && item.amountCents > 0 && typeof item.date === "string"
    );
  } catch {
    return [];
  }
}

export function getAccount(slug: AccountSlug, transfers: Transfer[]): AccountOverview {
  const account = accounts[slug];
  const outgoingCents = transfers.filter((transfer) => transfer.source === slug)
    .reduce((sum, transfer) => sum + transfer.amountCents, 0);
  return {
    ...account,
    balance: (Math.round(account.balance * 100) - outgoingCents) / 100,
    available: (Math.round(account.available * 100) - outgoingCents) / 100,
    change30d: (Math.round(account.change30d * 100) - outgoingCents) / 100,
    outflow: (Math.round(account.outflow * 100) + outgoingCents) / 100,
    monthlyLimit: {
      ...account.monthlyLimit,
      used: account.monthlyLimit.used + (slug === "savings" ? transfers.filter((transfer) => transfer.source === slug).length : outgoingCents / 100),
    },
    trend: [...account.trend.slice(0, -1), (Math.round(account.balance * 100) - outgoingCents) / 100],
    recent: [
      ...transfers.filter((transfer) => transfer.source === slug).map((transfer) => ({
        name: `Transfer to ${transfer.destination}`,
        date: transfer.date,
        amount: -transfer.amountCents / 100,
      })),
      ...account.recent,
    ],
  };
}

export function saveTransfer(source: AccountSlug, destination: string, amountCents: number): Transfer {
  const transfers = getTransfers();
  if (!destination.trim() || !Number.isSafeInteger(amountCents) || amountCents <= 0 ||
      amountCents > Math.round(getAccount(source, transfers).available * 100)) {
    throw new Error("Check the transfer details and available balance.");
  }
  const transfer: Transfer = {
    id: crypto.randomUUID(), source, destination: destination.trim(), amountCents,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
  window.sessionStorage.setItem(TRANSFERS_KEY, JSON.stringify([transfer, ...transfers]));
  return transfer;
}
