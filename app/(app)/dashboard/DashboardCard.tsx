"use client";

import Link from "next/link";
import { useState } from "react";

type Status = "" | "interview" | "offer" | "rejected";

interface Props {
  id: string;
  jobTitle: string;
  company: string;
  createdAt: string;
  humanizationScore: number;
  applicationStatus: string;
  approach?: string;
  keywordScore?: number;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  interview: { label: "Interview", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  offer:     { label: "Offer",     badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  rejected:  { label: "Rejected",  badge: "bg-red-100 text-red-600",    dot: "bg-red-400" },
};

export default function DashboardCard({
  id, jobTitle, company, createdAt, humanizationScore, applicationStatus, keywordScore,
}: Props) {
  const [status, setStatus] = useState<Status>((applicationStatus || "") as Status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: Status) {
    if (saving) return;
    setSaving(true);
    const newStatus = next === status ? "" : next; // toggle off if same
    setStatus(newStatus as Status);
    try {
      await fetch(`/api/resumes/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } finally {
      setSaving(false);
    }
  }

  const cfg = STATUS_CONFIG[status];
  const kwScore = keywordScore ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Left: job info */}
        <Link href={`/tailor/${id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{jobTitle || "Untitled Role"}</h3>
            {cfg && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{company || "Unknown Company"}</p>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </Link>

        {/* Right: scores */}
        <div className="flex gap-4 shrink-0 text-right">
          <div>
            <div className={`text-base font-bold ${humanizationScore >= 80 ? "text-green-600" : humanizationScore >= 60 ? "text-yellow-600" : "text-red-500"}`}>
              {humanizationScore}%
            </div>
            <div className="text-xs text-gray-400">Human</div>
          </div>
          {kwScore > 0 && (
            <div>
              <div className={`text-base font-bold ${kwScore >= 70 ? "text-green-600" : kwScore >= 45 ? "text-yellow-600" : "text-red-500"}`}>
                {kwScore}%
              </div>
              <div className="text-xs text-gray-400">Keywords</div>
            </div>
          )}
        </div>
      </div>

      {/* Status buttons */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">Outcome:</span>
        {(["interview", "offer", "rejected"] as const).map((s) => {
          const c = STATUS_CONFIG[s];
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                active
                  ? `${c.badge} border-transparent`
                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
