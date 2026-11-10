"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Copy, Download, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/accounts";
import type { Transaction, TxStatus } from "@/lib/transactions";

const REF_DATE = new Date("2026-11-10T00:00:00");
const ranges = [{ label: "All time", days: 0 }, { label: "Last 7 days", days: 7 }, { label: "Last 30 days", days: 30 }, { label: "Last 90 days", days: 90 }];
const types = ["All", "Money in", "Money out"] as const;
const statusClass: Record<TxStatus, string> = {
  Completed: "bg-[#e7f3ee] text-[#29946a]",
  Pending: "bg-[#fff4d6] text-[#a8730c]",
  Failed: "bg-[#fdeceb] text-[#d1453f]",
};

const fmtDate = (iso: string, long = false) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", long ? { month: "long", day: "numeric", year: "numeric" } : { month: "short", day: "numeric" }) : iso;

const selectClass = "h-9 rounded-lg border border-[#d6daee] bg-white px-2.5 text-[12px] text-[#454652] outline-none transition-colors hover:bg-[#f8f9fd] focus:border-[#4c4bf4]";

export function TransactionHistory({ transactions, hidden }: { transactions: Transaction[]; hidden: boolean }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [range, setRange] = useState(0);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(transactions.map((x) => x.category))).sort()], [transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((x) => {
        if (q && ![x.name, x.description, x.reference, x.counterparty, x.category].some((f) => f.toLowerCase().includes(q))) return false;
        if (type === "Money in" && x.amount <= 0) return false;
        if (type === "Money out" && x.amount >= 0) return false;
        if (status !== "All" && x.status !== status) return false;
        if (category !== "All" && x.category !== category) return false;
        if (range && (REF_DATE.getTime() - new Date(`${x.date}T00:00:00`).getTime()) / 864e5 > range) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, query, type, status, category, range]);

  const totals = filtered.reduce((s, x) => ({ in: s.in + (x.amount > 0 ? x.amount : 0), out: s.out + (x.amount < 0 ? x.amount : 0) }), { in: 0, out: 0 });
  const active = query || type !== "All" || status !== "All" || category !== "All" || range;
  const reset = () => { setQuery(""); setType("All"); setStatus("All"); setCategory("All"); setRange(0); };
  const amt = (v: number, signed = true) => (hidden ? "••••••" : money(v, signed));

  const exportCsv = () => {
    const rows = [["Date", "Name", "Description", "Category", "Method", "Status", "Amount", "Reference"], ...filtered.map((x) => [x.date, x.name, x.description, x.category, x.method, x.status, x.amount.toFixed(2), x.reference])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-4 rounded-[18px] border border-[#d6daee] bg-white p-[18px]" aria-label="Transaction history">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[14px] font-semibold">Transaction history</h2>
        <Button variant="secondary" onClick={exportCsv} disabled={!filtered.length}><Download size={14} className="mr-1.5" />Export CSV</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#858aa5]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, reference, counterparty" aria-label="Search transactions" className="h-9 w-full rounded-lg border border-[#d6daee] pl-8 pr-3 text-[12px] outline-none transition-colors placeholder:text-[#a0a4b8] focus:border-[#4c4bf4]" />
        </div>
        <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value as (typeof types)[number])} className={selectClass}>{types.map((o) => <option key={o}>{o}</option>)}</select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>{["All", "Completed", "Pending", "Failed"].map((o) => <option key={o} value={o}>{o === "All" ? "All statuses" : o}</option>)}</select>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>{categories.map((o) => <option key={o} value={o}>{o === "All" ? "All categories" : o}</option>)}</select>
        <select aria-label="Date range" value={range} onChange={(e) => setRange(Number(e.target.value))} className={selectClass}>{ranges.map((o) => <option key={o.days} value={o.days}>{o.label}</option>)}</select>
        {active ? <button onClick={reset} className="h-9 rounded-lg px-2.5 text-[12px] font-medium text-[#4c4bf4] transition-colors hover:bg-[#f0f1ff]">Clear filters</button> : null}
      </div>

      <p className="mt-3 text-[12px] text-[#858aa5]">{filtered.length} of {transactions.length} transactions · In <span className="font-medium tabular-nums text-[#299447]">{amt(totals.in)}</span> · Out <span className="font-medium tabular-nums text-[#3e404c]">{amt(totals.out)}</span></p>

      {filtered.length === 0 ? (
        <div className="grid place-items-center gap-2 py-12 text-center text-[13px] text-[#858aa5]"><SearchX size={26} />No transactions match your filters.<button onClick={reset} className="font-medium text-[#4c4bf4]">Clear filters</button></div>
      ) : (
        <div className="mt-2 divide-y divide-[#f0f1f6]">
          {filtered.map((x) => (
            <button key={x.id} onClick={() => setSelected(x)} className="grid w-full grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl px-2.5 py-3 text-left transition-colors hover:bg-[#f8f9fd] sm:grid-cols-[52px_minmax(0,1.4fr)_minmax(0,0.8fr)_96px_auto]">
              <time className="text-[12px] text-[#858aa5]">{fmtDate(x.date)}</time>
              <div className="min-w-0"><p className="truncate text-[13px] font-semibold text-[#4a4b57]">{x.name}</p><p className="truncate text-[12px] text-[#82869e]">{x.description}</p></div>
              <span className="hidden truncate text-[12px] text-[#858aa5] sm:block">{x.category}</span>
              <span className={`hidden w-fit rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-block ${statusClass[x.status]}`}>{x.status}</span>
              <span className={`text-right text-[13px] font-semibold tabular-nums ${x.amount > 0 ? "text-[#299447]" : x.status === "Failed" ? "text-[#a0a4b8] line-through" : "text-[#3e404c]"}`}>{amt(x.amount)}</span>
            </button>
          ))}
        </div>
      )}

      {selected && <TransactionDetails transaction={selected} hidden={hidden} onClose={() => setSelected(null)} />}
    </section>
  );
}

export function TransactionDetails({ transaction: selected, hidden, onClose }: { transaction: Transaction; hidden: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const amt = (value: number) => hidden ? "••••••" : money(value, true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyRef = async (ref: string) => {
    await navigator.clipboard?.writeText(ref);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <>
        <button aria-label="Close details" onClick={onClose} className="fixed inset-0 z-40 bg-[#202236]/25" />
        <aside role="dialog" aria-modal="true" aria-label="Transaction details" className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#eef0f6] px-5 py-4"><h3 className="text-[14px] font-semibold">Transaction details</h3><Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}><X size={17} /></Button></div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col items-center text-center">
              <span className={`flex size-12 items-center justify-center rounded-full ${selected.amount > 0 ? "bg-[#e7f3ee] text-[#29946a]" : "bg-[#f0f1f6] text-[#454652]"}`}>{selected.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}</span>
              <p className="mt-3 text-[13px] text-[#5b5d68]">{selected.name}</p>
              <p className={`mt-1 text-[28px] font-semibold tracking-[-1px] tabular-nums ${selected.amount > 0 ? "text-[#299447]" : ""}`}>{amt(selected.amount)}</p>
              <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusClass[selected.status]}`}>{selected.status}</span>
            </div>
            <dl className="mt-8 space-y-3.5 text-[13px]">
              {[
                ["Date", fmtDate(selected.date, true)],
                ["Description", selected.description],
                [selected.amount > 0 ? "From" : "To", selected.counterparty],
                ["Category", selected.category],
                ["Method", selected.method],
                ...(selected.fee ? [["Fee", money(selected.fee)]] : []),
              ].map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-[#f0f1f6] pb-3"><dt className="text-[#858aa5]">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
              <div className="flex items-center justify-between gap-4"><dt className="text-[#858aa5]">Reference</dt><dd className="flex items-center gap-1.5 font-medium tabular-nums">{selected.reference}<button onClick={() => copyRef(selected.reference)} aria-label="Copy reference" className="rounded p-1 text-[#777c93] transition-colors hover:bg-[#f0f1ff] hover:text-[#4c4bf4]"><Copy size={13} /></button></dd></div>
            </dl>
            {copied && <p role="status" className="mt-3 text-[12px] text-[#29946a]">Reference copied.</p>}
            {selected.status === "Failed" && <p className="mt-6 rounded-xl bg-[#fdeceb] p-3 text-[12px] text-[#a3403b]">This transaction could not be processed and no funds were moved.</p>}
            {selected.status === "Pending" && <p className="mt-6 rounded-xl bg-[#fff4d6] p-3 text-[12px] text-[#8a5f0a]">This transaction is still processing and may take 1-2 business days to clear.</p>}
          </div>
        </aside>
      </>;
}
