import type { AccountSlug } from "@/lib/accounts";

export type TxStatus = "Completed" | "Pending" | "Failed";

export type Transaction = {
  id: string;
  date: string;
  name: string;
  description: string;
  category: string;
  method: string;
  status: TxStatus;
  amount: number;
  reference: string;
  counterparty: string;
  fee?: number;
};

const t = (id: string, date: string, name: string, description: string, category: string, method: string, status: TxStatus, amount: number, counterparty: string, fee?: number): Transaction =>
  ({ id, date, name, description, category, method, status, amount, reference: `NX-${id.toUpperCase()}`, counterparty, fee });

export const transactionsByAccount: Record<AccountSlug, Transaction[]> = {
  main: [
    t("m1024", "2026-11-09", "Adobe Creative Cloud", "Software subscription", "Software", "Visa credit card", "Completed", -28.49, "Adobe Systems Inc."),
    t("m1023", "2026-11-09", "Figma", "Team plan, 6 seats", "Software", "Visa credit card", "Pending", -90, "Figma, Inc."),
    t("m1022", "2026-11-08", "Ferrer Accounting", "Monthly bookkeeping", "Professional services", "ACH transfer", "Completed", -185, "Ferrer & Asociados LLC"),
    t("m1021", "2026-11-07", "Stripe payout", "Sales payout", "Sales", "ACH transfer", "Completed", 6427.8, "Stripe Payments Co."),
    t("m1020", "2026-11-06", "Wire from Lumen Retail", "Invoice INV-2041", "Sales", "Wire transfer", "Completed", 4800, "Lumen Retail Group", -15),
    t("m1019", "2026-11-05", "Google Workspace", "Monthly subscription", "Software", "Visa credit card", "Completed", -14.25, "Google LLC"),
    t("m1018", "2026-11-04", "AWS", "Cloud hosting, October", "Infrastructure", "Visa credit card", "Completed", -642.18, "Amazon Web Services"),
    t("m1017", "2026-11-03", "WeWork Brickell", "Coworking membership", "Rent", "ACH transfer", "Failed", -950, "WeWork Companies LLC"),
    t("m1016", "2026-11-02", "Delta Air Lines", "Flight MIA-JFK, client visit", "Travel", "Visa credit card", "Completed", -412.6, "Delta Air Lines"),
    t("m1015", "2026-11-01", "October payroll", "Employee payroll", "Payroll", "ACH transfer", "Completed", -12800, "Nexo Payroll"),
    t("m1014", "2026-10-29", "Stripe payout", "Sales payout", "Sales", "ACH transfer", "Completed", 2860.4, "Stripe Payments Co."),
    t("m1013", "2026-10-24", "Notion Labs", "Annual plan", "Software", "Visa credit card", "Completed", -384, "Notion Labs, Inc."),
    t("m1012", "2026-10-18", "Wire from Northwind Ltd", "Invoice INV-2036", "Sales", "Wire transfer", "Completed", 4852, "Northwind Traders Ltd", -15),
  ],
  checking: [
    t("c2011", "2026-11-08", "Ferrer Accounting", "Monthly bookkeeping", "Professional services", "ACH transfer", "Completed", -185, "Ferrer & Asociados LLC"),
    t("c2010", "2026-11-07", "Publix", "Office groceries", "Supplies", "Debit card", "Completed", -86.32, "Publix Super Markets"),
    t("c2009", "2026-11-05", "Google Workspace", "Monthly subscription", "Software", "Debit card", "Completed", -14.25, "Google LLC"),
    t("c2008", "2026-11-04", "Florida Power & Light", "Electricity bill", "Utilities", "ACH transfer", "Pending", -200, "FPL"),
    t("c2007", "2026-11-03", "Transfer from Main", "Internal transfer", "Transfers", "Internal", "Completed", 1500, "Nexo Main ••4821"),
    t("c2006", "2026-11-02", "Comcast Business", "Internet service", "Utilities", "ACH transfer", "Completed", -129.99, "Comcast Corp."),
    t("c2005", "2026-10-30", "Uber Eats", "Team lunch", "Dining", "Debit card", "Completed", -64.8, "Uber Technologies"),
    t("c2004", "2026-10-27", "Client refund", "Order #88213", "Refunds", "ACH transfer", "Failed", -240, "Marta Gómez"),
    t("c2003", "2026-10-22", "Transfer from Main", "Internal transfer", "Transfers", "Internal", "Completed", 3700, "Nexo Main ••4821"),
  ],
  savings: [
    t("s3006", "2026-11-01", "Interest payment", "Monthly interest, 4.35% APY", "Interest", "Internal", "Completed", 56.7, "Nexo Bank"),
    t("s3005", "2026-10-28", "Transfer from Main", "Tax reserve", "Transfers", "Internal", "Completed", 500, "Nexo Main ••4821"),
    t("s3004", "2026-10-01", "Interest payment", "Monthly interest, 4.35% APY", "Interest", "Internal", "Completed", 54.9, "Nexo Bank"),
    t("s3003", "2026-09-26", "Transfer from Main", "Equipment fund", "Transfers", "Internal", "Completed", 500, "Nexo Main ••4821"),
    t("s3002", "2026-09-01", "Interest payment", "Monthly interest, 4.35% APY", "Interest", "Internal", "Completed", 53.2, "Nexo Bank"),
    t("s3001", "2026-08-15", "Transfer to Checking", "Operating shortfall", "Transfers", "Internal", "Completed", -1200, "Nexo Checking ••7305"),
  ],
  investments: [
    t("i4007", "2026-11-06", "T-Bill interest", "13-week Treasury bill", "Interest", "Internal", "Completed", 312.4, "U.S. Department of the Treasury"),
    t("i4006", "2026-11-03", "Buy VTI", "12 shares @ $291.10", "Trades", "Brokerage", "Pending", -3493.2, "Nexo Securities", -0),
    t("i4005", "2026-10-30", "ETF dividend", "VTI quarterly dividend", "Dividends", "Brokerage", "Completed", 94.15, "Vanguard"),
    t("i4004", "2026-10-22", "Money market deposit", "Sweep to money market", "Transfers", "Internal", "Completed", -2000, "Nexo Money Market"),
    t("i4003", "2026-10-15", "Treasury purchase", "26-week Treasury bill", "Trades", "Brokerage", "Completed", -5000, "U.S. Department of the Treasury"),
    t("i4002", "2026-10-02", "Transfer from Main", "Investment funding", "Transfers", "Internal", "Completed", 4000, "Nexo Main ••4821"),
    t("i4001", "2026-09-18", "Sell BND", "20 shares @ $72.40", "Trades", "Brokerage", "Failed", 1448, "Nexo Securities"),
  ],
};
