"use client";

import { useState } from "react";
import DashboardCard from "./DashboardCard";

interface ResumeItem {
  id: string;
  jobTitle: string;
  company: string;
  createdAt: string;
  humanizationScore: number;
  applicationStatus: string;
  approach: string;
  keywordScore: number;
}

export default function DashboardList({ resumes }: { resumes: ResumeItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? resumes.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.jobTitle.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q) ||
          r.approach.toLowerCase().includes(q)
        );
      })
    : resumes;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by role, company, or approach..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          {query ? `No resumes matching "${query}"` : "No tailored resumes yet"}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <DashboardCard
              key={r.id}
              id={r.id}
              jobTitle={r.jobTitle}
              company={r.company}
              createdAt={r.createdAt}
              humanizationScore={r.humanizationScore}
              applicationStatus={r.applicationStatus}
              approach={r.approach}
              keywordScore={r.keywordScore}
            />
          ))}
        </div>
      )}

      {query && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          {filtered.length} of {resumes.length} resumes
        </p>
      )}
    </div>
  );
}
