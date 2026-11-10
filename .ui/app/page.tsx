"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return <main className="grid min-h-screen place-items-center bg-[#f4f6fb]" aria-label="Opening sign in"><span className="size-7 animate-spin rounded-full border-2 border-[#d9dcef] border-t-[#4c4bf4]" /></main>;
}