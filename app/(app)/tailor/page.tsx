"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_MESSAGES = [
  "Analyzing job requirements...",
  "Tailoring your experience...",
  "Rewriting bullet points...",
  "Generating cover letter...",
  "Extracting keywords...",
  "Scoring humanization...",
  "Finalizing your resume...",
];

export default function TailorPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState("");

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError("");
    setStatusIndex(0);

    // Cycle through status messages
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearInterval(interval);
      router.push(`/tailor/${data.id}`);
    } catch (e: unknown) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tailor Resume</h1>
        <p className="text-gray-500 mt-1">
          Paste a job description and Claude will tailor your resume and generate a cover letter
        </p>
      </div>

      {!loading ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the full job description here, including responsibilities, requirements, and any other relevant details..."
          />
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              This will make 4 API calls to Claude (tailor, cover letter, keywords, score)
            </p>
            <button
              onClick={handleTailor}
              disabled={!jobDescription.trim()}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Tailor My Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" style={{ borderWidth: "3px" }} />
          <p className="text-lg font-medium text-gray-900 mb-2">Processing...</p>
          <p className="text-gray-500 text-sm animate-pulse">{STATUS_MESSAGES[statusIndex]}</p>
          <p className="text-xs text-gray-400 mt-4">This usually takes 30-60 seconds</p>
        </div>
      )}
    </div>
  );
}
