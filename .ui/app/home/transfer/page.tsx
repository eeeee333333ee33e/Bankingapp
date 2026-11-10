"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { accounts, getAccount, getTransfers, money, saveTransfer, type AccountSlug, type Transfer } from "@/lib/accounts";
import { hasAuthSession, isValidOtp } from "@/lib/auth";

type Step = "details" | "verify" | "complete";
const fieldClass = "h-12 w-full rounded-[9px] border border-[#d9dcef] bg-white px-3.5 text-[13px] outline-none transition focus:border-[#7775f6] focus:ring-4 focus:ring-[#4c4bf4]/10";

function amountInCents(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return 0;
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : 0;
}

export default function TransferPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<AccountSlug>("main");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("details");
  const [processing, setProcessing] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [receipt, setReceipt] = useState<Transfer | null>(null);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasAuthSession()) { router.replace("/login"); return; }
    const requested = new URLSearchParams(window.location.search).get("account");
    if (requested && Object.hasOwn(accounts, requested)) setSource(requested as AccountSlug);
    setTransfers(getTransfers());
    setReady(true);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [router]);

  useEffect(() => {
    const debounce = setTimeout(() => setDebouncedAmount(amount), 350);
    return () => clearTimeout(debounce);
  }, [amount]);

  const account = getAccount(source, transfers);
  const cents = amountInCents(amount);
  const previewCents = amountInCents(debouncedAmount);
  const insufficient = previewCents > Math.round(account.available * 100);

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination.trim()) { setError("Enter a destination account number."); return; }
    if (!cents) { setError("Enter an amount greater than zero, with up to two decimal places."); return; }
    if (cents > Math.round(account.available * 100)) { setError("The amount exceeds your available balance."); return; }
    setError("");
    setStep("verify");
  }

  function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setProcessing(true);
    setError("");
    timer.current = setTimeout(() => {
      try {
        if (!hasAuthSession()) { router.replace("/login"); return; }
        if (!isValidOtp(code)) { setError("That code is invalid. Check it and try again."); return; }
        const completed = saveTransfer(source, destination, cents);
        setReceipt(completed);
        setTransfers(getTransfers());
        setStep("complete");
      } catch {
        setError("The transfer could not be completed. Check your balance and try again.");
      } finally {
        locked.current = false;
        setProcessing(false);
        timer.current = null;
      }
    }, 1800);
  }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f4f6fb]" aria-label="Checking your session"><span className="size-7 animate-spin rounded-full border-2 border-[#d9dcef] border-t-[#4c4bf4]" /></main>;

  return (
    <AppShell active="Transfer" breadcrumb="Transfer">
      <main className="mx-auto max-w-[1050px] px-4 pb-12 pt-[78px] sm:px-6">
        <div className="mb-7 border-b border-[#e4e6f0] pb-6">
          <p className="mb-2 text-[12px] font-medium text-[#777c93]">Move money</p>
          <h1 className="text-[27px] font-semibold">Transfer</h1>
          <p className="mt-2 text-[13px] text-[#777c93]">Send money from your Nexo account.</p>
        </div>

        <div>
          <section className="min-w-0 max-w-[540px]">
            <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold text-[#858aa5]" aria-label={`Step ${step === "details" ? 1 : step === "verify" ? 2 : 3} of 3`}>
              <span className={`flex size-6 items-center justify-center rounded-full ${step === "details" ? "bg-[#4c4bf4] text-white" : "bg-[#e9f5ed] text-[#25834a]"}`}>{step === "details" ? "1" : <Check size={13} />}</span><span className={step === "details" ? "text-[#292a35]" : ""}>Details</span>
              <span className="h-px w-5 bg-[#d9dcef]" />
              <span className={`flex size-6 items-center justify-center rounded-full ${step === "verify" ? "bg-[#4c4bf4] text-white" : step === "complete" ? "bg-[#e9f5ed] text-[#25834a]" : "bg-[#f0f1f6]"}`}>{step === "complete" ? <Check size={13} /> : "2"}</span><span className={step === "verify" ? "text-[#292a35]" : ""}>Verify</span>
              <span className="h-px w-5 bg-[#d9dcef]" />
              <span className={`flex size-6 items-center justify-center rounded-full ${step === "complete" ? "bg-[#4c4bf4] text-white" : "bg-[#f0f1f6]"}`}>3</span><span className={step === "complete" ? "text-[#292a35]" : ""}>Complete</span>
            </div>

            {step === "details" && <form onSubmit={review} noValidate className="space-y-5">
              <div><h2 className="text-[18px] font-semibold">Transfer details</h2><p className="mt-1 text-[13px] text-[#777c93]">Choose an account and enter the destination.</p></div>
              <div><label htmlFor="source" className="mb-2 block text-[12px] font-semibold text-[#393b48]">From account</label><select id="source" value={source} onChange={(event) => { setSource(event.target.value as AccountSlug); setError(""); }} className={fieldClass}>{Object.values(accounts).map((item) => <option key={item.slug} value={item.slug}>{item.name} {item.number}</option>)}</select><p className="mt-2 text-[11px] text-[#777c93]">Available: <span className="font-semibold tabular-nums text-[#393b48]">{money(account.available)}</span></p></div>
              <div><label htmlFor="destination" className="mb-2 block text-[12px] font-semibold text-[#393b48]">Destination account number</label><input id="destination" value={destination} onChange={(event) => { setDestination(event.target.value); setError(""); }} maxLength={100} autoComplete="off" placeholder="Enter account number" className={fieldClass} /></div>
              <div><label htmlFor="amount" className="mb-2 block text-[12px] font-semibold text-[#393b48]">Amount (USD)</label><input id="amount" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} inputMode="decimal" placeholder="0.00" className={`${fieldClass} tabular-nums`} aria-describedby="amount-hint" /><p id="amount-hint" aria-live="polite" className={`mt-2 text-[11px] ${insufficient ? "text-[#ad3b35]" : "text-[#777c93]"}`}>{insufficient ? "Amount exceeds your available balance." : previewCents > 0 ? `Remaining available balance: ${money(account.available - previewCents / 100)}` : "Enter an amount in USD."}</p></div>
              {error && <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[12px] text-[#ad3b35]">{error}</p>}
              <Button type="submit" className="h-12 w-full">Review transfer <ArrowRight size={15} /></Button>
            </form>}

            {step === "verify" && <form onSubmit={confirm} noValidate className="space-y-5">
              <button type="button" disabled={processing} onClick={() => { setStep("details"); setCode(""); setError(""); }} className="flex items-center gap-2 text-[12px] font-semibold text-[#686d83] hover:text-[#292a35] disabled:opacity-50"><ArrowLeft size={14} /> Edit details</button>
              <div><h2 className="text-[18px] font-semibold">Review and verify</h2><p className="mt-1 text-[13px] text-[#777c93]">Confirm the details before sending.</p></div>
              <dl className="divide-y divide-[#eef0f6] border-y border-[#eef0f6] text-[13px]">
                <div className="flex justify-between gap-4 py-3"><dt className="text-[#777c93]">From</dt><dd className="text-right font-semibold">{account.name} {account.number}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="shrink-0 text-[#777c93]">To</dt><dd className="break-all text-right font-semibold">{destination.trim()}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-[#777c93]">Amount</dt><dd className="font-semibold tabular-nums">{money(cents / 100)}</dd></div>
              </dl>
              <div><label htmlFor="code" className="mb-2 block text-[12px] font-semibold text-[#393b48]">2FA verification code</label><input id="code" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} disabled={processing} placeholder="6-digit code" className={fieldClass} /><p className="mt-2 text-[11px] text-[#777c93]">Enter your verification code to confirm.</p></div>
              {error && <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[12px] text-[#ad3b35]">{error}</p>}
              <Button type="submit" disabled={processing || code.length !== 6} className="h-12 w-full">{processing ? <><LoaderCircle size={16} className="animate-spin" /> Processing transfer...</> : <>Confirm transfer <ArrowUpRight size={15} /></>}</Button>
              {processing && <p role="status" className="text-center text-[12px] text-[#777c93]">Verifying and processing your transfer...</p>}
            </form>}

            {step === "complete" && receipt && <div role="status">
              <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#e7f3ee] text-[#29946a]"><Check size={24} /></span>
              <h2 className="text-[20px] font-semibold">Transfer confirmed</h2>
              <p className="mt-2 text-[13px] leading-5 text-[#777c93]">Your transfer has been completed.</p>
              <dl className="mt-6 divide-y divide-[#eef0f6] border-y border-[#eef0f6] text-[13px]">
                <div className="flex justify-between gap-4 py-3"><dt className="text-[#777c93]">Amount</dt><dd className="font-semibold tabular-nums">{money(receipt.amountCents / 100)}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-[#777c93]">From</dt><dd className="text-right font-semibold">{account.name} {account.number}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="shrink-0 text-[#777c93]">To</dt><dd className="break-all text-right font-semibold">{receipt.destination}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-[#777c93]">Available balance</dt><dd className="font-semibold tabular-nums">{money(account.available)}</dd></div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2"><Button onClick={() => { setDestination(""); setAmount(""); setDebouncedAmount(""); setCode(""); setReceipt(null); setStep("details"); }}>Make another transfer</Button><Button variant="secondary" onClick={() => router.push("/home")}>Back to home</Button></div>
            </div>}
          </section>

        </div>
      </main>
    </AppShell>
  );
}