"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

interface ReportData {
  approachStats: { approach: string; total: number; interviews: number; offers: number; rate: number }[];
  humanScoreBuckets: { bucket: string; total: number; interviews: number }[];
  kwScoreBuckets: { bucket: string; total: number; interviews: number }[];
  monthlyVolume: { month: string; applications: number; interviews: number; offers: number }[];
  topCompanies: { company: string; count: number; interviews: number }[];
  radarData: { metric: string; value: number }[];
  totalApplications: number;
  interviewRate: number;
  offerRate: number;
  avgHumanScore: number;
  avgKwScore: number;
}

const APPROACH_COLORS: Record<string, string> = {
  "career-momentum":    "#3b82f6",
  "domain-expert":      "#8b5cf6",
  "mission-alignment":  "#10b981",
  "career-pivot":       "#f59e0b",
  "high-impact-operator": "#ef4444",
};

const GREEN  = "#10b981";
const BLUE   = "#3b82f6";
const PURPLE = "#8b5cf6";
const GRAY   = "#e5e7eb";

function StatCard({ label, value, sub, color = "text-gray-900" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{children}</h2>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">{message}</div>
  );
}

export default function ReportCharts({ data }: { data: ReportData }) {
  const hasData = data.totalApplications > 0;
  const hasOutcomes = data.approachStats.some(a => a.interviews > 0 || a.offers > 0);

  return (
    <div className="space-y-10">
      {/* KPI row */}
      <div>
        <SectionTitle>Overview</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Applications" value={data.totalApplications} />
          <StatCard
            label="Interview rate"
            value={`${data.interviewRate}%`}
            color={data.interviewRate >= 40 ? "text-green-600" : data.interviewRate > 0 ? "text-yellow-600" : "text-gray-400"}
          />
          <StatCard
            label="Offer rate"
            value={`${data.offerRate}%`}
            color={data.offerRate >= 20 ? "text-green-600" : data.offerRate > 0 ? "text-yellow-600" : "text-gray-400"}
          />
          <StatCard
            label="Avg human score"
            value={`${data.avgHumanScore}%`}
            sub="across all resumes"
            color={data.avgHumanScore >= 80 ? "text-green-600" : data.avgHumanScore >= 60 ? "text-yellow-600" : "text-red-500"}
          />
          <StatCard
            label="Avg keyword score"
            value={`${data.avgKwScore}%`}
            sub="across all resumes"
            color={data.avgKwScore >= 70 ? "text-green-600" : data.avgKwScore >= 45 ? "text-yellow-600" : "text-red-500"}
          />
        </div>
      </div>

      {/* Application volume over time */}
      <div>
        <SectionTitle>Application volume over time</SectionTitle>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {data.monthlyVolume.length < 2 ? (
            <EmptyState message="Need more applications across multiple months to show trend" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.monthlyVolume} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="applications" stroke={BLUE}   strokeWidth={2} dot={false} name="Applications" />
                <Line type="monotone" dataKey="interviews"   stroke={GREEN}  strokeWidth={2} dot={false} name="Interviews" />
                <Line type="monotone" dataKey="offers"       stroke={PURPLE} strokeWidth={2} dot={false} name="Offers" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Approach effectiveness */}
      <div>
        <SectionTitle>Approach effectiveness</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart: volume */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-3">Applications by approach</p>
            {!hasData ? <EmptyState message="No data yet" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.approachStats} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="approach" tick={{ fontSize: 10 }} width={130}
                    tickFormatter={(v: string) => v.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} />
                  <Tooltip formatter={(v: number) => [v, "Count"]} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {data.approachStats.map((entry) => (
                      <Cell key={entry.approach} fill={APPROACH_COLORS[entry.approach] ?? BLUE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart: interview rate per approach */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-3">Interview rate by approach (%)</p>
            {!hasOutcomes ? <EmptyState message="Mark outcomes on the dashboard to see rates" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.approachStats} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="approach" tick={{ fontSize: 10 }} width={130}
                    tickFormatter={(v: string) => v.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Interview rate"]} />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {data.approachStats.map((entry) => (
                      <Cell key={entry.approach} fill={entry.rate >= 50 ? GREEN : entry.rate >= 25 ? "#f59e0b" : GRAY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Human score vs interview rate */}
      <div>
        <SectionTitle>Human score vs interview rate</SectionTitle>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {!hasOutcomes ? <EmptyState message="Mark outcomes on the dashboard to see this chart" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.humanScoreBuckets} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total"      fill="#e5e7eb" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill={GREEN}   name="Interviews"   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Grouped by human-sounding score range. Higher scores should correlate with more responses.</p>
      </div>

      {/* Keyword coverage vs interview rate */}
      <div>
        <SectionTitle>Keyword coverage vs interview rate</SectionTitle>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {!hasOutcomes ? <EmptyState message="Mark outcomes on the dashboard to see this chart" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.kwScoreBuckets} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total"      fill="#e5e7eb" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill={BLUE}    name="Interviews"   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Grouped by keyword coverage %. Higher coverage means more ATS keywords matched.</p>
      </div>

      {/* Radar: profile strength across dimensions */}
      <div>
        <SectionTitle>Resume quality radar</SectionTitle>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          {!hasData ? <EmptyState message="No data yet" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={data.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#f3f4f6" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Your avg" dataKey="value" stroke={PURPLE} fill={PURPLE} fillOpacity={0.25} />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-gray-400 mt-1">Average scores across all your tailored resumes</p>
        </div>
      </div>

      {/* Top companies applied to */}
      {data.topCompanies.length > 0 && (
        <div>
          <SectionTitle>Top companies applied to</SectionTitle>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <ResponsiveContainer width="100%" height={Math.max(160, data.topCompanies.length * 36)}>
              <BarChart data={data.topCompanies} layout="vertical" margin={{ left: 10, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="company" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="count"      fill={GRAY}  name="Applications" radius={[0, 4, 4, 0]} />
                <Bar dataKey="interviews" fill={GREEN} name="Interviews"   radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
