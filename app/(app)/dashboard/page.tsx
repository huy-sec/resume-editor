import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardList from "./DashboardList";

export default async function DashboardPage() {
  const session = await auth();
  const resumes = await prisma.tailoredResume.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { createdAt: "desc" },
  });

  // Compute insights
  const total = resumes.length;
  const interviews = resumes.filter((r) => r.applicationStatus === "interview" || r.applicationStatus === "offer").length;
  const offers = resumes.filter((r) => r.applicationStatus === "offer").length;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  // Best-performing approach among interviews+offers
  const successfulResumes = resumes.filter(
    (r) => r.applicationStatus === "interview" || r.applicationStatus === "offer"
  );
  const approachCounts: Record<string, number> = {};
  for (const r of successfulResumes) {
    try {
      const rd = JSON.parse(r.resumeJSON);
      const a = rd.approach || "";
      if (a) approachCounts[a] = (approachCounts[a] || 0) + 1;
    } catch { /* skip */ }
  }
  const topApproach = Object.entries(approachCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Avg humanization score: successful vs overall
  const avgScore = (arr: typeof resumes) =>
    arr.length > 0 ? Math.round(arr.reduce((s, r) => s + r.humanizationScore, 0) / arr.length) : 0;
  const avgHumanAll = avgScore(resumes);
  const avgHumanSuccess = avgScore(successfulResumes);

  // Keyword score from keywords JSON
  function kwCoverage(r: typeof resumes[0]): number {
    try {
      const kw = JSON.parse(r.keywords);
      const found = (kw.found || []).length;
      const total = found + (kw.missing || []).length;
      return total > 0 ? Math.round((found / total) * 100) : 0;
    } catch { return 0; }
  }

  const showInsights = total >= 2 && successfulResumes.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your tailored resumes</p>
        </div>
        <Link
          href="/tailor"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Tailor New Resume
        </Link>
      </div>

      {/* Insights panel */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-400 mt-0.5">Applications</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${interviewRate >= 50 ? "text-green-600" : interviewRate > 0 ? "text-yellow-600" : "text-gray-400"}`}>
              {interviewRate}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Interview rate</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${offerRate >= 30 ? "text-green-600" : offerRate > 0 ? "text-yellow-600" : "text-gray-400"}`}>
              {offerRate}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Offer rate</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${avgHumanAll >= 80 ? "text-green-600" : avgHumanAll >= 60 ? "text-yellow-600" : "text-red-500"}`}>
              {avgHumanAll}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Avg human score</div>
          </div>
        </div>
      )}

      {/* What's working panel */}
      {showInsights && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">What&apos;s working</h2>
          <div className="flex flex-wrap gap-4 text-sm text-blue-800">
            {topApproach && (
              <div>
                <span className="font-medium capitalize">{topApproach.replace(/-/g, " ")}</span>
                <span className="text-blue-500"> approach leads to most interviews</span>
              </div>
            )}
            {avgHumanSuccess > avgHumanAll && (
              <div>
                <span className="font-medium">{avgHumanSuccess}% human score</span>
                <span className="text-blue-500"> on average for successful resumes (vs {avgHumanAll}% overall)</span>
              </div>
            )}
            {successfulResumes.length > 0 && (
              <div>
                <span className="font-medium">{successfulResumes.length} of {total}</span>
                <span className="text-blue-500"> resumes got a response</span>
              </div>
            )}
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📄</div>
          <p className="text-lg font-medium text-gray-500">No tailored resumes yet</p>
          <p className="text-sm mt-1 mb-4">Build your profile and tailor your first resume</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/profile"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Set up profile
            </Link>
            <Link
              href="/tailor"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Tailor a resume
            </Link>
          </div>
        </div>
      ) : (
        <DashboardList
          resumes={resumes.map((r) => {
            let approach = "";
            try { approach = JSON.parse(r.resumeJSON).approach || ""; } catch { /* skip */ }
            return {
              id: r.id,
              jobTitle: r.jobTitle,
              company: r.company,
              createdAt: r.createdAt.toISOString(),
              humanizationScore: r.humanizationScore,
              applicationStatus: r.applicationStatus,
              approach,
              keywordScore: kwCoverage(r),
            };
          })}
        />
      )}
    </div>
  );
}
