"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, BadgeDollarSign, Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, ChevronDown,
  CircleDollarSign, CircleHelp, CreditCard, FileChartColumn, HandCoins, House, Landmark, Link2, LogOut,
  Menu, ReceiptText, Settings2, ShoppingBag, Shirt, Wallet, X, ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAuthSession } from "@/lib/auth";

const navigation = [
  { title: "", links: [{ name: "Home", icon: House, href: "/home" }, { name: "Account details", icon: Wallet, href: "/home/accounts/main" }, { name: "Transfer", icon: ArrowLeftRight, href: "/home/transfer" }, { name: "Activity", icon: ReceiptText }, { name: "Reports", icon: FileChartColumn }, { name: "Credit", icon: HandCoins }] },
  { title: "Sales tools", links: [{ name: "Point of sale", icon: Building2 }, { name: "Payment links", icon: Link2 }, { name: "Subscription plans", icon: CircleDollarSign }, { name: "Card readers", icon: CreditCard }, { name: "Fee calculator", icon: Settings2 }] },
  { title: "Business", links: [{ name: "Business management", icon: BriefcaseBusiness }, { name: "Sales", icon: ShoppingBag }, { name: "Analytics", icon: ChartNoAxesCombined }, { name: "Fees and installments", icon: BadgeDollarSign }, { name: "Your products", icon: Shirt }] },
];

const ShellContext = createContext<{ showMessage: (text: string) => void }>({ showMessage: () => {} });
export const useShell = () => useContext(ShellContext);

export type ActiveNav = "Home" | "Account details" | "Transfer";

export function AppShell({ active, breadcrumb, onReviewAlerts, children }: { active: ActiveNav; breadcrumb: string; onReviewAlerts?: () => void; children: React.ReactNode }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2800);
  };

  const signOut = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const go = (name: string, href?: string) => {
    setMobileMenuOpen(false);
    if (name === active) return;
    if (href) router.push(href);
    else showMessage(`${name}: coming soon`);
  };

  const links = (iconClass: boolean) => navigation.map((group, groupIndex) => (
    <div key={group.title || "main"} className={groupIndex > 0 ? "mt-[13px]" : ""}>
      {group.title && <p className="mb-[9px] mt-[10px] text-[12px] font-semibold">{group.title}</p>}
      <div className="space-y-[3px]">
        {group.links.map(({ name, icon: Icon, ...rest }) => {
          const selected = name === active;
          return (
            <button key={name} onClick={() => go(name, "href" in rest ? rest.href : undefined)} className={`group flex h-[36px] w-full items-center gap-[10px] rounded-[7px] px-[9px] text-left text-[13px] transition-colors ${selected ? "bg-[#eef0ff]/75 font-medium text-[#514ff4] shadow-[inset_0_0_0_1px_rgba(76,75,244,0.07)]" : "text-[#393b48] hover:bg-[#f4f6fb] hover:text-[#4c4bf4]"}`} aria-current={selected ? "page" : undefined}>
              <Icon size={16} strokeWidth={1.8} className={iconClass ? (selected ? "text-[#5553ff]" : "text-[#555968] group-hover:text-[#4c4bf4]") : undefined} />
              {name}
            </button>
          );
        })}
      </div>
    </div>
  ));

  return (
    <ShellContext.Provider value={{ showMessage }}>
      <div className="app-canvas min-h-screen text-[#292a35]">
        {mobileMenuOpen && <>
          <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-[#202236]/25 lg:hidden" />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/80 bg-white/75 shadow-xl backdrop-blur-xl lg:hidden">
            <div className="flex h-[60px] items-center justify-between px-[13px]">
              <div className="flex items-center gap-2.5"><span className="flex size-[43px] items-center justify-center rounded-[12px] bg-[#ffe500] text-[#30324b]"><Landmark size={22} strokeWidth={2.2} /></span><span className="text-[16px] font-bold">nexo</span></div>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X size={17} /></Button>
            </div>
            <nav className="dashboard-scrollbar flex-1 overflow-y-auto px-[9px] pb-5 pt-[14px]">{links(false)}</nav>
          </aside>
        </>}
        <aside className={`fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-white/80 bg-white/70 shadow-[4px_0_20px_rgba(35,42,90,0.035)] backdrop-blur-xl transition-transform duration-200 lg:flex ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-[60px] items-center px-[13px]">
            <button aria-label="Nexo home" onClick={() => go("Home", "/home")} className="flex size-[43px] items-center justify-center rounded-[12px] bg-[#ffe500] text-[#30324b] transition-transform hover:scale-[1.03]">
              <Landmark size={22} strokeWidth={2.2} />
            </button>
            <span className="ml-2.5 text-[16px] font-bold tracking-[-0.3px]">nexo</span>
          </div>
          <nav className="dashboard-scrollbar flex-1 overflow-y-auto px-[9px] pb-5 pt-[14px]">{links(true)}</nav>
          <div className="border-t border-[#eef0f6] p-3">
            <button onClick={() => showMessage("Help center: coming soon")} className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-[12px] text-[#777c93] transition-colors hover:bg-[#f5f6fb] hover:text-[#4c4bf4]"><CircleHelp size={16} /> Help</button>
          </div>
        </aside>

        <div className={`min-h-screen transition-[margin] duration-200 ${sidebarOpen ? "lg:ml-[220px]" : "lg:ml-0"}`}>
          <header className={`fixed right-0 top-0 z-20 flex h-[52px] items-center justify-between border-b border-white/80 bg-white/65 px-4 shadow-[0_1px_14px_rgba(27,31,56,0.04)] backdrop-blur-xl lg:px-[18px] ${sidebarOpen ? "lg:left-[220px]" : "lg:left-0"}`}>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" aria-label="Toggle menu" onClick={() => { if (window.matchMedia("(min-width: 1024px)").matches) setSidebarOpen(!sidebarOpen); else setMobileMenuOpen(true); }} className="size-[32px] rounded-md"><Menu size={17} /></Button>
              <span className="hidden text-[12px] text-[#868aa1] sm:inline">{breadcrumb}</span>
            </div>
            <div className="flex items-center gap-[9px]">
              <div className="relative">
                <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative size-[38px] rounded-[13px] border border-[#eef0f6] shadow-[0_1px_4px_rgba(27,31,56,0.06)]"><Bell size={17} /><span className="absolute right-[5px] top-[3px] flex size-[14px] items-center justify-center rounded-full border border-white bg-[#ee4f4f] text-[9px] font-bold text-white">3</span></Button>
                {notificationsOpen && <div className="absolute right-0 top-[44px] z-40 w-[250px] rounded-xl border border-[#e4e6f0] bg-white p-4 shadow-lg"><div className="mb-2 flex items-center justify-between font-semibold">Notifications <button onClick={() => setNotificationsOpen(false)} aria-label="Close"><X size={15} /></button></div><p className="border-t border-[#f0f1f6] py-2 text-[12px] text-[#747991]">You have 3 new account alerts.</p><button className="text-[12px] font-semibold text-[#4c4bf4]" onClick={() => onReviewAlerts?.()}>Review alerts <ArrowRight size={13} className="inline" /></button></div>}
              </div>
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex h-[38px] items-center gap-[8px] rounded-[13px] border border-[#eef0f6] px-2.5 shadow-[0_1px_4px_rgba(27,31,56,0.06)] transition-colors hover:bg-[#fafbfe]" aria-expanded={profileOpen}>
                  <span className="flex size-[24px] items-center justify-center rounded-full bg-[#fff3cf] text-[12px]">👨🏻‍💼</span><span className="text-[12px] font-medium">Ernesto</span><ChevronDown size={14} className="text-[#777c90]" />
                </button>
                {profileOpen && <div className="absolute right-0 top-[44px] z-40 w-[185px] rounded-xl border border-[#e4e6f0] bg-white p-1.5 shadow-lg"><button onClick={() => showMessage("Ernesto's profile")} className="w-full rounded-lg px-3 py-2 text-left text-[12px] hover:bg-[#f5f6fb]">My profile</button><button onClick={() => showMessage("Settings: coming soon")} className="w-full rounded-lg px-3 py-2 text-left text-[12px] hover:bg-[#f5f6fb]">Settings</button><button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-[#a3403b] hover:bg-[#fff3f2]"><LogOut size={14} />Sign out</button></div>}
              </div>
            </div>
          </header>
          {children}
        </div>
        {message && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#292a35] px-4 py-3 text-[12px] font-medium text-white shadow-xl animate-rise-in">{message}</div>}
      </div>
    </ShellContext.Provider>
  );
}
