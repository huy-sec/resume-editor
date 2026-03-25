"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { APPROACH_DESCRIPTIONS, TailorApproach } from "@/lib/prompts";

const APPROACH_KEYS = Object.keys(APPROACH_DESCRIPTIONS) as TailorApproach[];

const BUILD_STATUS_MESSAGES = [
  "Reading the job description...",
  "Matching your experience to requirements...",
  "Rewriting bullets for impact...",
  "Generating cover letter...",
  "Extracting ATS keywords...",
  "Scoring humanization...",
  "Finishing up...",
];

interface Recommendation {
  recommended: string;
  reasoning: string;
  alternatives: { approach: string; reason: string }[];
  fitSummary: string;
}

export default function TailorPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");

  // Step 1 state
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [analyzeError, setAnalyzeError] = useState("");

  // Step 2 state
  const [approach, setApproach] = useState<TailorApproach>("career-momentum");
  const [notes, setNotes] = useState("");
  const [building, setBuilding] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [buildError, setBuildError] = useState("");

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setAnalyzing(true);
    setAnalyzeError("");
    setRecommendation(null);
    try {
      const res = await fetch("/api/tailor/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecommendation(data);
      setApproach(data.recommended as TailorApproach);
    } catch (e: unknown) {
      setAnalyzeError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBuild = async () => {
    setBuilding(true);
    setBuildError("");
    setStatusIndex(0);
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % BUILD_STATUS_MESSAGES.length);
    }, 3500);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, approach, notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearInterval(interval);
      router.push(`/tailor/${data.id}`);
    } catch (e: unknown) {
      clearInterval(interval);
      setBuildError(e instanceof Error ? e.message : "An error occurred");
      setBuilding(false);
    }
  };

  if (building) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32">
        <div className="w-12 h-12 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" style={{ borderWidth: "3px", borderStyle: "solid" }} />
        <p className="text-lg font-semibold text-gray-900 mb-2">Building your tailored resume...</p>
        <p className="text-gray-500 text-sm animate-pulse">{BUILD_STATUS_MESSAGES[statusIndex]}</p>
        <p className="text-xs text-gray-400 mt-4">Usually takes 30–60 seconds</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tailor Resume</h1>
        <p className="text-gray-500 mt-1">
          Paste a job description. Claude will analyze the fit and recommend the best approach before building.
        </p>
      </div>

      {/* Step 1: Job Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setRecommendation(null); // reset if JD changes
          }}
          className="w-full h-64 p-4 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the full job description here, including responsibilities, requirements, and company info..."
        />
        {analyzeError && (
          <p className="text-red-500 text-sm mt-2">{analyzeError}</p>
        )}
        {!recommendation && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !jobDescription.trim()}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {analyzing ? "Analyzing fit..." : "Analyze with AI →"}
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Approach Selection — shown after analysis */}
      {recommendation && (
        <div>
          {/* Fit summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Overall Fit</div>
            <p className="text-gray-800 text-sm leading-relaxed">{recommendation.fitSummary}</p>
          </div>

          {/* Recommended approach callout */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">Choose Your Approach</label>
              <button
                onClick={() => setRecommendation(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Re-analyze
              </button>
            </div>

            <div className="grid gap-3">
              {APPROACH_KEYS.map((key) => {
                const config = APPROACH_DESCRIPTIONS[key];
                const isRecommended = key === recommendation.recommended;
                const isSelected = approach === key;
                const alt = recommendation.alternatives.find((a) => a.approach === key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setApproach(key)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                            {config.label}
                          </span>
                          {isRecommended && (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                              AI Pick
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 italic mb-2">{config.tagline}</div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                          {isRecommended
                            ? recommendation.reasoning
                            : alt
                            ? alt.reason
                            : config.description}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                        isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional notes */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Additional Instructions <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Tell Claude anything specific — emphasize certain skills, downplay gaps, focus on a project, adjust tone, or anything else you want reflected in the resume.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`e.g. "Emphasize my work on the payment system project. I don't have formal React experience but I've built several apps with it — include it. Keep the tone confident but not boastful."`}
            />
          </div>

          {buildError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {buildError}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Tailoring makes 4 API calls (resume, cover letter, keywords, score)
            </p>
            <button
              onClick={handleBuild}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Build Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
