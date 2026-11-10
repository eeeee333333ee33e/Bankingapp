"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TransactionHistory } from "@/components/transaction-history";
import { transactionsByAccount } from "@/lib/transactions";
import { ArrowDownLeft, ArrowUpRight, Copy, Eye, EyeOff, Landmark, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasAuthSession } from "@/lib/auth";
import { accounts, getAccount, getTransfers, money, type AccountSlug, type Transfer } from "@/lib/accounts";

const card = "rounded-[18px] border border-[#d6daee] bg-white p-[18px] shadow-[0_1px_2px_rgba(35,42,90,0.02)]";
const label = "text-[12px] text-[#858aa5]";

function Trend({ data }: { data: number[] }) {
  const w = 600, h = 160, min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 12 - ((v - min) / (max - min || 1)) * (h - 24)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[160px] w-full" preserveAspectRatio="none" role="img" aria-label="30-day balance trend">
      <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4c4bf4" stopOpacity=".22" /><stop offset="100%" stopColor="#4c4bf4" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="#4c4bf4" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function AccountOverviewPage({ params }: { params: Promise<{ account: string }> }) {
  const { account: slug } = use(params);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(true);
  const [copied, setCopied] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const account = Object.hasOwn(accounts, slug) ? getAccount(slug as AccountSlug, transfers) : undefined;

  useEffect(() => {
    if (!hasAuthSession()) { router.replace("/login"); return; }
    setTransfers(getTransfers());
    setReady(true);
  }, [router]);

  if (!account) notFound();
  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f4f6fb]"><span className="size-7 animate-spin rounded-full border-2 border-[#d9dcef] border-t-[#4c4bf4]" /></main>;

  const hide = (v: string) => (show ? v : "••••••");
  const net = account.inflow - account.outflow;
  const total = account.breakdown.reduce((s, b) => s + b.value, 0);
  const limitPct = Math.min(100, (account.monthlyLimit.used / account.monthlyLimit.total) * 100);
  const isCount = account.slug === "savings";

  const copy = async () => {
    await navigator.clipboard?.writeText(account.number.replace(/\D/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const metrics = [
    { title: "Available balance", value: money(account.available), note: "Ready to spend" },
    { title: "Pending", value: money(account.pending), note: "Clearing in 1-2 days" },
    { title: "On hold / invested", value: money(account.held), note: "Not immediately available" },
    { title: "30-day change", value: money(account.change30d, true), note: `${((account.change30d / (account.balance - account.change30d)) * 100).toFixed(2)}% vs. last month`, positive: account.change30d >= 0 },
  ];

  return (
    <AppShell active="Account details" breadcrumb={`Account details / ${account.name}`}>
      <main className="mx-auto max-w-[1100px] px-4 pb-12 pt-[78px] sm:px-6">
        <nav className="mb-5 flex gap-[27px] border-b border-[#dfe2ef]" role="tablist">
          {Object.values(accounts).map((a) => (
            <Link key={a.slug} href={`/home/accounts/${a.slug}`} role="tab" aria-selected={a.slug === account.slug} className={`relative h-[40px] pt-[10px] text-[13px] font-semibold transition-colors hover:text-[#4c4bf4] ${a.slug === account.slug ? "text-[#5553f4]" : "text-[#454652]"}`}>
              {a.name}{a.slug === account.slug && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#4c4bf4]" />}
            </Link>
          ))}
        </nav>

        <section className="relative overflow-hidden rounded-[18px] border border-[#d6daee] bg-gradient-to-br from-[#f4f4ff] via-white to-[#eaf1ff] p-[22px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[13px] text-[#5b5d68]"><span className="flex size-[28px] items-center justify-center rounded-lg bg-[#ffe500] text-[#30324b]"><Landmark size={15} /></span>{account.type}<span className="inline-flex items-center gap-1 rounded-full bg-[#e7f3ee] px-2 py-0.5 text-[11px] font-medium text-[#29946a]"><ShieldCheck size={12} />{account.status}</span></div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[36px] font-semibold leading-none tracking-[-1.4px] tabular-nums">{show ? money(account.balance) : "••••••••"}</span>
                <button aria-label={show ? "Hide balances" : "Show balances"} onClick={() => setShow(!show)} className="rounded p-1 text-[#575bff] transition-colors hover:bg-[#f0f1ff]">{show ? <Eye size={19} /> : <EyeOff size={19} />}</button>
              </div>
              <p className="mt-2 text-[12px] text-[#5b5d68]">Current balance · <span className={`font-semibold tabular-nums ${account.change30d >= 0 ? "text-[#2c9b40]" : "text-[#d1453f]"}`}>{hide(money(account.change30d, true))}</span> in the last 30 days</p>
            </div>
            <div className="flex gap-[7px]"><Button onClick={() => router.push(`/home/transfer?account=${account.slug}`)}>Transfer</Button><Button variant="secondary" onClick={() => router.push("/home")}>View activity</Button></div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Balance summary">
          {metrics.map((m) => (
            <div key={m.title} className={`${card} transition-colors hover:bg-[#f8f9fd]`}>
              <p className={label}>{m.title}</p>
              <p className={`mt-2 text-[20px] font-semibold tracking-[-0.4px] tabular-nums ${m.positive ? "text-[#2c9b40]" : ""}`}>{hide(m.value)}</p>
              <p className="mt-1 text-[11px] text-[#989bb0]">{m.note}</p>
            </div>
          ))}
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className={card}>
            <div className="flex items-center justify-between"><h2 className="text-[14px] font-semibold">Balance trend</h2><span className={label}>Last 30 days</span></div>
            <div className="mt-3"><Trend data={account.trend} /></div>
          </section>

          <section className={card}>
            <h2 className="text-[14px] font-semibold">Cash position</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-[#5b5d68]"><span className="flex size-6 items-center justify-center rounded-full bg-[#e7f3ee] text-[#29946a]"><ArrowDownLeft size={13} /></span>Money in</dt><dd className="font-semibold text-[#299447] tabular-nums">{hide(money(account.inflow, true))}</dd></div>
              <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-[#5b5d68]"><span className="flex size-6 items-center justify-center rounded-full bg-[#fdeceb] text-[#d1453f]"><ArrowUpRight size={13} /></span>Money out</dt><dd className="font-semibold tabular-nums">{hide(money(-account.outflow))}</dd></div>
              <div className="flex items-center justify-between border-t border-[#f0f1f6] pt-3"><dt className="font-medium">Net cash flow</dt><dd className={`font-semibold tabular-nums ${net >= 0 ? "text-[#299447]" : "text-[#d1453f]"}`}>{hide(money(net, true))}</dd></div>
            </dl>
            <div className="mt-5">
              <div className="flex justify-between text-[12px]"><span className={label}>{isCount ? "Withdrawals this month" : "Monthly limit used"}</span><span className="tabular-nums text-[#5b5d68]">{isCount ? `${account.monthlyLimit.used} of ${account.monthlyLimit.total}` : `${limitPct.toFixed(0)}%`}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef0f6]"><div className="h-full rounded-full bg-gradient-to-r from-[#4c4bf4] to-[#8b8af8] transition-all" style={{ width: `${limitPct}%` }} /></div>
            </div>
          </section>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className={card}>
            <h2 className="text-[14px] font-semibold">{account.slug === "investments" ? "Allocation" : account.slug === "savings" ? "Savings buckets" : "Spending by category"}</h2>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">{account.breakdown.map((b) => <span key={b.label} style={{ width: `${(b.value / total) * 100}%`, background: b.color }} />)}</div>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {account.breakdown.map((b) => <li key={b.label} className="flex items-center justify-between"><span className="flex items-center gap-2 text-[#5b5d68]"><span className="size-2.5 rounded-full" style={{ background: b.color }} />{b.label}</span><span className="font-medium tabular-nums">{hide(money(b.value))}</span></li>)}
            </ul>
          </section>

          <section className={card}>
            <h2 className="text-[14px] font-semibold">Key metrics</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              {account.apy !== undefined && <div className="flex justify-between"><dt className="text-[#5b5d68]">APY</dt><dd className="font-semibold tabular-nums">{account.apy.toFixed(2)}%</dd></div>}
              {account.interestYtd !== undefined && <div className="flex justify-between"><dt className="text-[#5b5d68]">Interest earned YTD</dt><dd className="font-semibold tabular-nums text-[#299447]">{hide(money(account.interestYtd, true))}</dd></div>}
              {account.overdraftLimit !== undefined && <div className="flex justify-between"><dt className="text-[#5b5d68]">Overdraft protection</dt><dd className="font-semibold tabular-nums">{money(account.overdraftLimit)}</dd></div>}
              <div className="flex justify-between"><dt className="text-[#5b5d68]">Avg. daily balance</dt><dd className="font-semibold tabular-nums">{hide(money(account.trend.reduce((s, v) => s + v, 0) / account.trend.length))}</dd></div>
              <div className="flex justify-between"><dt className="text-[#5b5d68]">Lowest balance (30d)</dt><dd className="font-semibold tabular-nums">{hide(money(Math.min(...account.trend)))}</dd></div>
            </dl>
          </section>

          <section className={card}>
            <h2 className="text-[14px] font-semibold">Account details</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between"><dt className="text-[#5b5d68]">Account number</dt><dd className="flex items-center gap-1.5 font-semibold tabular-nums">{account.number}<button onClick={copy} aria-label="Copy account number" className="rounded p-1 text-[#777c93] transition-colors hover:bg-[#f0f1ff] hover:text-[#4c4bf4]"><Copy size={13} /></button></dd></div>
              <div className="flex justify-between"><dt className="text-[#5b5d68]">Routing number</dt><dd className="font-semibold tabular-nums">{account.routing}</dd></div>
              <div className="flex justify-between"><dt className="text-[#5b5d68]">Opened</dt><dd className="font-semibold">{account.opened}</dd></div>
              <div className="flex justify-between"><dt className="text-[#5b5d68]">Status</dt><dd className="font-semibold text-[#29946a]">{account.status}</dd></div>
            </dl>
            {copied && <p role="status" className="mt-3 text-[12px] text-[#29946a]">Account number copied.</p>}
          </section>
        </div>

        <TransactionHistory transactions={transactionsByAccount[account.slug]} hidden={!show} />
      </main>
    </AppShell>
  );
}
