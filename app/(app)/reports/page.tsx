import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReportChartsWrapper from "./ReportChartsWrapper";

// ── helpers ──────────────────────────────────────────────────────────────────

function kwCoverage(keywords: string): number {
  try {
    const kw = JSON.parse(keywords);
    const found = (kw.found || []).length;
    const total = found + (kw.missing || []).length;
    return total > 0 ? Math.round((found / total) * 100) : 0;
  } catch { return 0; }
}

function scoreBucket(score: number, step: number): string {
  const low = Math.floor(score / step) * step;
  return `${low}–${low + step - 1}`;
}

function monthKey(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function ReportsPage() {
  const session = await auth();
  const resumes = await prisma.tailoredResume.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { createdAt: "asc" },
  });

  const total = resumes.length;

  // ── derived per-resume data ───────────────────────────────────────────────
  const enriched = resumes.map((r) => {
    let approach = "";
    try { approach = JSON.parse(r.resumeJSON).approach || ""; } catch { /* skip */ }
    const isInterview = r.applicationStatus === "interview" || r.applicationStatus === "offer";
    const isOffer     = r.applicationStatus === "offer";
    return {
      ...r,
      approach,
      kw: kwCoverage(r.keywords),
      isInterview,
      isOffer,
    };
  });

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const interviews   = enriched.filter(r => r.isInterview).length;
  const offers       = enriched.filter(r => r.isOffer).length;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const offerRate     = total > 0 ? Math.round((offers / total) * 100) : 0;
  const avgHumanScore = total > 0 ? Math.round(enriched.reduce((s, r) => s + r.humanizationScore, 0) / total) : 0;
  const avgKwScore    = total > 0 ? Math.round(enriched.reduce((s, r) => s + r.kw, 0) / total) : 0;

  // ── approach stats ────────────────────────────────────────────────────────
  const approachMap = new Map<string, { total: number; interviews: number; offers: number }>();
  const APPROACH_ORDER = ["career-momentum", "domain-expert", "mission-alignment", "career-pivot", "high-impact-operator"];
  for (const r of enriched) {
    const key = r.approach || "unset";
    if (!approachMap.has(key)) approachMap.set(key, { total: 0, interviews: 0, offers: 0 });
    const e = approachMap.get(key)!;
    e.total++;
    if (r.isInterview) e.interviews++;
    if (r.isOffer) e.offers++;
  }
  const approachStats = [...approachMap.entries()]
    .sort((a, b) => (APPROACH_ORDER.indexOf(a[0]) + 1 || 99) - (APPROACH_ORDER.indexOf(b[0]) + 1 || 99))
    .map(([approach, v]) => ({
      approach,
      ...v,
      rate: v.total > 0 ? Math.round((v.interviews / v.total) * 100) : 0,
    }));

  // ── score buckets ─────────────────────────────────────────────────────────
  function buildBuckets(
    items: typeof enriched,
    scoreFn: (r: typeof enriched[0]) => number,
    step: number
  ) {
    const map = new Map<string, { total: number; interviews: number; _low: number }>();
    for (const r of items) {
      const s   = scoreFn(r);
      const key = scoreBucket(s, step);
      const low = Math.floor(s / step) * step;
      if (!map.has(key)) map.set(key, { total: 0, interviews: 0, _low: low });
      const e = map.get(key)!;
      e.total++;
      if (r.isInterview) e.interviews++;
    }
    return [...map.entries()]
      .sort((a, b) => a[1]._low - b[1]._low)
      .map(([bucket, v]) => ({ bucket, total: v.total, interviews: v.interviews }));
  }

  const humanScoreBuckets = buildBuckets(enriched, r => r.humanizationScore, 20);
  const kwScoreBuckets    = buildBuckets(enriched, r => r.kw, 25);

  // ── monthly volume ────────────────────────────────────────────────────────
  const monthMap = new Map<string, { applications: number; interviews: number; offers: number; _ts: number }>();
  for (const r of enriched) {
    const key = monthKey(r.createdAt);
    const ts  = new Date(r.createdAt).getTime();
    if (!monthMap.has(key)) monthMap.set(key, { applications: 0, interviews: 0, offers: 0, _ts: ts });
    const e = monthMap.get(key)!;
    e.applications++;
    if (r.isInterview) e.interviews++;
    if (r.isOffer) e.offers++;
    if (ts < e._ts) e._ts = ts;
  }
  const monthlyVolume = [...monthMap.entries()]
    .sort((a, b) => a[1]._ts - b[1]._ts)
    .map(([month, v]) => ({ month, applications: v.applications, interviews: v.interviews, offers: v.offers }));

  // ── top companies ─────────────────────────────────────────────────────────
  const companyMap = new Map<string, { count: number; interviews: number }>();
  for (const r of enriched) {
    const key = r.company || "Unknown";
    if (!companyMap.has(key)) companyMap.set(key, { count: 0, interviews: 0 });
    const e = companyMap.get(key)!;
    e.count++;
    if (r.isInterview) e.interviews++;
  }
  const topCompanies = [...companyMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([company, v]) => ({ company, ...v }));

  // ── radar: avg quality dimensions ────────────────────────────────────────
  const radarData = [
    { metric: "Human Score",     value: avgHumanScore },
    { metric: "Keyword Coverage", value: avgKwScore },
    { metric: "Interview Rate",  value: interviewRate },
    { metric: "Offer Rate",      value: offerRate * 2 }, // scaled ×2 so it's visible
    {
      metric: "Consistency",
      value: total >= 3
        ? Math.max(0, 100 - Math.round(Math.sqrt(
            enriched.reduce((s, r) => s + Math.pow(r.humanizationScore - avgHumanScore, 2), 0) / total
          )))
        : 0,
    },
  ];

  const reportData = {
    approachStats,
    humanScoreBuckets,
    kwScoreBuckets,
    monthlyVolume,
    topCompanies,
    radarData,
    totalApplications: total,
    interviewRate,
    offerRate,
    avgHumanScore,
    avgKwScore,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">
          What&apos;s working — and what&apos;s not — across your applications.
          {total === 0 && " Start tailoring resumes to see data here."}
          {total > 0 && interviews === 0 && " Mark interview and offer outcomes on the Dashboard to unlock deeper insights."}
        </p>
      </div>
      <ReportChartsWrapper data={reportData} />
    </div>
  );
}
