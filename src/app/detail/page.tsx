"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { languageLabels } from "@/data/crafts";
import { Craft } from "@/lib/types";
import TopNav from "@/components/ui/top-nav";
import CraftDetail from "@/components/ui/craft-detail";
import Footer from "@/components/ui/footer";

export default function DetailPage() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");
  const [craft, setCraft] = useState<Craft | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const craftId = Number(searchParams.get("id") || 1);

  useEffect(() => {
    fetch("/api/crafts")
      .then((res) => res.json())
      .then((data: Craft[]) => {
        const selected = data.find((item) => item.id === craftId) || data[0];
        setCraft(selected);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch craft detail:", err);
        setLoading(false);
      });
  }, [craftId]);

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      {loading ? (
        <div className="flex items-center justify-center p-20 text-xl text-slate-500">
          Loading craft details...
        </div>
      ) : (
        <CraftDetail craft={craft} />
      )}
      <Footer />
    </div>
  );
}
