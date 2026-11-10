"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CalendarDays, Eye, EyeOff, MoreHorizontal, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell, useShell } from "@/components/app-shell";
import { TransactionDetails } from "@/components/transaction-history";
import { hasAuthSession } from "@/lib/auth";
import { getAccount, getTransfers, money, type AccountSlug, type Transfer } from "@/lib/accounts";
import { transactionsByAccount, type Transaction } from "@/lib/transactions";

type Activity = {
  transaction: Transaction;
  mark: string;
  markClass: string;
};

const transactions: Activity[] = [
  { transaction: transactionsByAccount.main.find((item) => item.id === "m1024")!, mark: "A", markClass: "bg-[#f9e9df] text-[#e9512d]" },
  { transaction: transactionsByAccount.main.find((item) => item.id === "m1022")!, mark: "FA", markClass: "bg-[#e9edff] text-[#5965cb]" },
  { transaction: transactionsByAccount.main.find((item) => item.id === "m1021")!, mark: "S", markClass: "bg-[#e7eaff] text-[#635bdb]" },
  { transaction: transactionsByAccount.main.find((item) => item.id === "m1019")!, mark: "G", markClass: "bg-[#f0f3f8] text-[#4285f4]" },
  { transaction: transactionsByAccount.main.find((item) => item.id === "m1015")!, mark: "P", markClass: "bg-[#e7f3ee] text-[#29946a]" },
];

const accountTabs = ["Main", "Checking", "Savings", "Investments"] as const;
type AccountTab = (typeof accountTabs)[number];

export default function DashboardLayout() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [notice, setNotice] = useState(true);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/login");
      return;
    }
    setTransfers(getTransfers());
    setAuthReady(true);
  }, [router]);

  if (!authReady) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f6fb]" aria-label="Checking your session"><span className="size-7 animate-spin rounded-full border-2 border-[#d9dcef] border-t-[#4c4bf4]" /></main>;
  }

  return (
    <AppShell active="Home" breadcrumb="Home" onReviewAlerts={() => setNotice(false)}>
      <DashboardContent notice={notice} setNotice={setNotice} transfers={transfers} />
    </AppShell>
  );
}

function DashboardContent({ notice, setNotice, transfers }: { notice: boolean; setNotice: (value: boolean) => void; transfers: Transfer[] }) {
  const router = useRouter();
  const { showMessage } = useShell();
  const [activeTab, setActiveTab] = useState<AccountTab>("Main");
  const [showBalance, setShowBalance] = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const account = getAccount(activeTab.toLowerCase() as AccountSlug, transfers);
  const recentTransfers: Activity[] = transfers.map((transfer) => ({
    transaction: {
      id: transfer.id, name: `Transfer to ${transfer.destination}`, description: `From ${getAccount(transfer.source, []).name}`,
      date: transfer.date, method: "Transfer", amount: -transfer.amountCents / 100,
      category: "Transfers", status: "Completed", reference: transfer.id, counterparty: transfer.destination,
    },
    mark: "T", markClass: "bg-[#e9edff] text-[#5965cb]",
  }));

  return (
        <main className="mx-auto max-w-[1390px] px-4 pb-10 pt-[78px] sm:px-6 lg:ml-[clamp(28px,6.1vw,92px)] lg:mr-[18px] lg:px-0">
          {notice && <section className="animate-rise-in mb-[21px] flex min-h-[85px] items-center justify-between gap-4 rounded-[18px] border border-[#e1e7ff] bg-[linear-gradient(115deg,#edf2ff_0%,#f5f7ff_62%,#f1f8f5_100%)] px-[18px] py-[14px] shadow-[0_8px_24px_rgba(58,72,142,0.06)] sm:px-[18px]" aria-label="Action required">
            <div><div className="flex items-center gap-[8px] text-[14px] font-semibold"><span className="flex size-[18px] items-center justify-center rounded-full bg-[#4e55e9] text-[11px] text-white">i</span>You have an item to review</div><p className="mt-[10px] text-[13px] text-[#4f5871]">Confirm your details by December 14.</p></div>
            <Button onClick={() => { setNotice(false); showMessage("Your details have been confirmed."); }} className="shrink-0">Confirm details</Button>
          </section>}

          <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_312px]">
            <div className="min-w-0">
              <section className="glass-panel glass-panel-accent overflow-hidden rounded-[18px]">
                <div className="flex h-[44px] items-stretch gap-[27px] border-b border-[#dfe2ef] px-[15px]">
                  {accountTabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`relative text-[13px] font-semibold transition-colors hover:text-[#4c4bf4] ${activeTab === tab ? "text-[#5553f4]" : "text-[#454652]"}`} aria-selected={activeTab === tab} role="tab">{tab}{activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#4c4bf4]" />}</button>)}
                </div>
                <div className="flex min-h-[190px] flex-col justify-between px-[18px] py-[21px] sm:min-h-[191px]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-[7px]"><span className="text-[29px] font-semibold leading-none tracking-[-1.2px] tabular-nums">{showBalance ? money(account.balance) : "••••••••"}</span><button aria-label={showBalance ? "Hide balance" : "Show balance"} onClick={() => setShowBalance(!showBalance)} className="rounded p-1 text-[#575bff] transition-colors hover:bg-[#f0f1ff]">{showBalance ? <Eye size={18} /> : <EyeOff size={18} />}</button></div>
                      <p className="mt-[9px] text-[12px] text-[#5b5d68]">Net activity over the past 30 days: <span className={`font-semibold tabular-nums ${account.change30d >= 0 ? "text-[#2c9b40]" : "text-[#d1453f]"}`}>{showBalance ? money(account.change30d, true) : "••••••"}</span></p>
                    </div>
                    <div className="flex shrink-0 gap-[7px]"><Button onClick={() => router.push(`/home/transfer?account=${account.slug}`)}>Transfer</Button><Button variant="secondary" onClick={() => router.push(`/home/accounts/${activeTab.toLowerCase()}`)}>View {activeTab}</Button></div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#989bb0]"><span className="inline-flex size-[7px] rounded-full bg-[#55bf81]" /> Balance updated today <span className="text-[#d1d3df]">·</span> <CalendarDays size={12} /> Nov 9, 2026</div>
                </div>
              </section>

              <section className="mt-[40px]">
                <div className="mb-[15px] flex items-end justify-between">
                  <div><h2 className="text-[17px] font-semibold tracking-[-0.3px]">Recent activity</h2><button onClick={() => showMessage("Showing all activity.")} className="mt-[5px] text-[13px] font-medium text-[#5755f5] transition-colors hover:text-[#3938d8]">View all <ArrowRight size={14} className="ml-1 inline" /></button></div>
                  <Button variant="ghost" size="icon" aria-label="More options" onClick={() => showMessage("Activity options")} className="size-8"><MoreHorizontal size={18} /></Button>
                </div>
                <div className="divide-y divide-[#f0f1f6]">
                  {[...recentTransfers, ...transactions].map(({ transaction, mark, markClass }) => <button key={transaction.id} type="button" onClick={() => setSelected(transaction)} className="group grid min-h-[65px] w-full grid-cols-[52px_minmax(170px,1.35fr)_minmax(110px,0.9fr)_minmax(95px,0.8fr)_minmax(105px,auto)] items-center gap-x-[10px] rounded-xl px-[10px] text-left transition-colors hover:bg-[#f8f9fd] max-md:grid-cols-[46px_minmax(0,1fr)_auto] max-md:gap-x-2">
                    <time className="text-[12px] text-[#858aa5] max-md:text-[11px]">{/^\d{4}-\d{2}-\d{2}$/.test(transaction.date) ? new Date(`${transaction.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : transaction.date}</time>
                    <div className="flex min-w-0 items-center gap-[10px]">
                      <span className={`flex size-[42px] shrink-0 items-center justify-center rounded-full border border-[#e0e3ef] text-[13px] font-bold ${markClass}`}>{mark}</span>
                      <div className="min-w-0"><p className="truncate text-[12px] font-semibold text-[#4a4b57]">{transaction.name}</p><p className="mt-[3px] truncate text-[12px] text-[#82869e]">{transaction.description}</p></div>
                    </div>
                    <span className="truncate text-[12px] text-[#858aa5] max-md:hidden">{transaction.method}</span>
                    <span className="inline-flex items-center gap-[5px] whitespace-nowrap text-[12px] font-medium text-[#299447] max-md:hidden"><ShieldCheck size={15} fill="#259a3f" className="text-white" />{transaction.status}</span>
                    <span className={`text-right text-[12px] font-semibold tabular-nums ${transaction.amount > 0 ? "text-[#299447]" : "text-[#3e404c]"}`}>{money(transaction.amount, true)}</span>
                  </button>)}
                </div>
              </section>
              {selected && <TransactionDetails transaction={selected} hidden={false} onClose={() => setSelected(null)} />}
            </div>

            <aside className="flex flex-col gap-[43px]">
              <section className="glass-panel flex min-h-[238px] flex-col rounded-[18px] px-[18px] py-[17px]">
                <h2 className="text-[14px] font-semibold">Credit</h2>
                <div className="mt-[36px]"><p className="text-[12px] leading-[1.5] text-[#858aa5]">Get a personal loan for up to</p><p className="mt-[5px] text-[20px] font-semibold leading-tight tracking-[-0.4px] tabular-nums">$5,440.00</p></div>
                <Button variant="secondary" className="mt-auto w-fit" onClick={() => showMessage("Your loan application is coming soon.")}>Apply now</Button>
              </section>

              <section className="relative isolate flex aspect-[1/0.84] min-h-[240px] flex-col overflow-hidden rounded-[18px] bg-[#f2eee8] p-[14px] shadow-[0_10px_28px_rgba(35,42,90,0.07)]">
                <div className="absolute inset-0 -z-10 bg-cover bg-[center_55%]" style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.80) 31%, rgba(255,255,255,0) 69%), url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=85')" }} />
                <h2 className="max-w-[240px] text-[18px] font-bold leading-[1.15] tracking-[-0.35px]">Save for what<br className="hidden sm:block xl:block" /> matters most</h2>
                <button onClick={() => showMessage("Create a savings goal to get started.")} className="mt-[13px] w-fit text-[13px] font-medium text-[#5553f4] transition-colors hover:text-[#3332cc]">Create a savings goal <ArrowRight size={14} className="ml-1 inline" /></button>
              </section>
              <div className="-mt-[32px] flex justify-center gap-[7px]" aria-label="Promotions"><button className="h-[7px] w-[22px] rounded-full bg-[#292a35]" aria-label="Promotion 1" /><button onClick={() => showMessage("There are no more promotions right now.")} className="size-[7px] rounded-full bg-[#b7bac7]" aria-label="Promotion 2" /></div>
            </aside>
          </div>
        </main>
  );
}
