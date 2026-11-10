"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Landmark, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAuthSession, hasAuthSession, isValidCredentials, isValidOtp } from "@/lib/auth";

type LoginStep = "credentials" | "verification";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (hasAuthSession()) {
      router.replace("/home");
      return;
    }
    setCheckingSession(false);
  }, [router]);

  function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidCredentials(email, password)) {
      setError("The email or password is incorrect.");
      return;
    }

    setStep("verification");
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidOtp(code)) {
      setError("That code is invalid. Check it and try again.");
      return;
    }

    createAuthSession();
    router.replace("/home");
  }

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f6fb]" aria-label="Checking sign-in"><span className="size-7 animate-spin rounded-full border-2 border-[#d9dcef] border-t-[#4c4bf4]" /></main>;
  }

  return (
    <main className="min-h-screen bg-white text-[#292a35] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#262837] text-white lg:block">
        <div className="absolute inset-0 bg-cover bg-center" aria-hidden="true" style={{ backgroundImage: "linear-gradient(145deg, rgba(38,40,55,.28), rgba(38,40,55,.12)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85')" }} />
        <div className="absolute left-[clamp(36px,6vw,92px)] top-10 z-10 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[13px] bg-[#ffe500] text-[#30324b]"><Landmark size={22} strokeWidth={2.2} /></span>
          <span className="text-[18px] font-bold">nexo</span>
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-[clamp(44px,7vw,104px)] lg:py-10">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#ffe500] text-[#30324b]"><Landmark size={19} strokeWidth={2.2} /></span>
            <span className="text-[16px] font-bold">nexo</span>
          </div>
          <span className="flex items-center gap-2 text-[11px] font-medium text-[#777c93]"><LockKeyhole size={13} /> Secure connection</span>
        </div>

        <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 flex items-center gap-2 text-[11px] font-semibold text-[#858aa5]" aria-label={`Step ${step === "credentials" ? "1" : "2"} of 2`}>
            <span className={`flex size-6 items-center justify-center rounded-full ${step === "credentials" ? "bg-[#4c4bf4] text-white" : "bg-[#e9f5ed] text-[#25834a]"}`}>{step === "credentials" ? "1" : <Check size={13} />}</span>
            <span className={step === "credentials" ? "text-[#292a35]" : ""}>Sign in</span>
            <span className="mx-1 h-px w-8 bg-[#d9dcef]" />
            <span className={`flex size-6 items-center justify-center rounded-full ${step === "verification" ? "bg-[#4c4bf4] text-white" : "bg-[#f0f1f6] text-[#858aa5]"}`}>2</span>
            <span className={step === "verification" ? "text-[#292a35]" : ""}>Verification</span>
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <p className="mb-2 text-[12px] font-medium text-[#777c93]">Welcome back</p>
                <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.6px]">Sign in to your account</h2>
                <p className="mt-2 text-[13px] leading-5 text-[#777c93]">Enter your credentials to continue.</p>
              </div>

              <form className="space-y-5" onSubmit={submitCredentials} noValidate>
                <div>
                  <label htmlFor="email" className="mb-2 block text-[12px] font-semibold text-[#393b48]">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} placeholder="name@company.com" className="h-12 w-full rounded-[9px] border border-[#d9dcef] bg-white px-3.5 text-[13px] outline-none transition focus:border-[#7775f6] focus:ring-4 focus:ring-[#4c4bf4]/10 placeholder:text-[#a0a4b7]" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="text-[12px] font-semibold text-[#393b48]">Password</label>
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-[11px] font-semibold text-[#5553f4] hover:text-[#3938d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c4bf4]/40" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
                  </div>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} placeholder="Enter your password" className="h-12 w-full rounded-[9px] border border-[#d9dcef] bg-white px-3.5 text-[13px] outline-none transition focus:border-[#7775f6] focus:ring-4 focus:ring-[#4c4bf4]/10 placeholder:text-[#a0a4b7]" />
                </div>
                {error && <p id="login-error" role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[12px] leading-5 text-[#ad3b35]">{error}</p>}
                <Button type="submit" className="h-12 w-full rounded-[9px] text-[13px]">Continue <ArrowRight size={15} /></Button>
              </form>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { setStep("credentials"); setCode(""); setError(""); }} className="mb-7 flex w-fit items-center gap-2 text-[12px] font-semibold text-[#686d83] transition-colors hover:text-[#292a35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c4bf4]/40"><ArrowLeft size={14} /> Back</button>
              <div className="mb-8">
                <span className="mb-5 flex size-11 items-center justify-center rounded-[12px] bg-[#eef0ff] text-[#4c4bf4]"><ShieldCheck size={22} /></span>
                <p className="mb-2 text-[12px] font-medium text-[#777c93]">One more step</p>
                <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.6px]">Verify it's you</h2>
                <p className="mt-2 text-[13px] leading-5 text-[#777c93]">Enter the 6-digit code to finish signing in.</p>
              </div>

              <form className="space-y-5" onSubmit={submitCode} noValidate>
                <div>
                  <label htmlFor="verification-code" className="mb-2 block text-[12px] font-semibold text-[#393b48]">Verification code</label>
                  <input id="verification-code" name="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} aria-invalid={Boolean(error)} aria-describedby={error ? "code-error" : "code-hint"} placeholder="••••••" className="h-[58px] w-full rounded-[9px] border border-[#d9dcef] bg-white px-4 text-center text-[21px] font-semibold tracking-[0.55em] text-[#292a35] outline-none transition focus:border-[#7775f6] focus:ring-4 focus:ring-[#4c4bf4]/10 placeholder:text-[#c2c5d2] placeholder:tracking-[0.55em]" />
                  <p id="code-hint" className="mt-2 text-[11px] text-[#858aa5]">Your code has 6 digits.</p>
                </div>
                {error && <p id="code-error" role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[12px] leading-5 text-[#ad3b35]">{error}</p>}
                <Button type="submit" disabled={code.length !== 6} className="h-12 w-full rounded-[9px] text-[13px]">Verify and sign in <ArrowRight size={15} /></Button>
              </form>
              <p className="mt-6 text-center text-[11px] leading-5 text-[#858aa5]">For your security, never share your code.</p>
            </>
          )}
        </div>

        <footer className="mx-auto flex w-full max-w-[390px] items-center justify-between border-t border-[#eef0f6] pt-4 text-[10px] text-[#969aab]">
          <span>© 2026 Nexo</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Your data is protected</span>
        </footer>
      </section>
    </main>
  );
}