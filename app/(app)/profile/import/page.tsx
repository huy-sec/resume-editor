"use client";
import { useState } from "react";
import Link from "next/link";

interface ScrapeResult {
  projects: number;
  skills: number;
}

interface ScrapeState {
  loading: boolean;
  result: ScrapeResult | null;
  error: string;
}

export default function ImportPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [scrapeStates, setScrapeStates] = useState<Record<string, ScrapeState>>({
    linkedin: { loading: false, result: null, error: "" },
    github: { loading: false, result: null, error: "" },
    website: { loading: false, result: null, error: "" },
  });

  const handleScrape = async (sourceType: string, url: string) => {
    if (!url.trim()) return;
    setScrapeStates((prev) => ({
      ...prev,
      [sourceType]: { loading: true, result: null, error: "" },
    }));
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScrapeStates((prev) => ({
        ...prev,
        [sourceType]: { loading: false, result: data.imported, error: "" },
      }));
    } catch (e: unknown) {
      setScrapeStates((prev) => ({
        ...prev,
        [sourceType]: {
          loading: false,
          result: null,
          error: e instanceof Error ? e.message : "An error occurred",
        },
      }));
    }
  };

  const handleImport = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllData = async () => {
    try {
      const res = await fetch("/api/profile/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const match = contentDisposition.match(/filename="([^"]+)"/);
      const fileName = match ? match[1] : "profile-data.json";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Export failed");
    }
  };

  const urlFields = [
    { key: "linkedin", label: "LinkedIn URL", value: linkedInUrl, setter: setLinkedInUrl, placeholder: "https://linkedin.com/in/yourname" },
    { key: "github", label: "GitHub URL", value: githubUrl, setter: setGithubUrl, placeholder: "https://github.com/yourusername" },
    { key: "website", label: "Website URL", value: websiteUrl, setter: setWebsiteUrl, placeholder: "https://yourwebsite.com" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/profile" className="text-blue-600 text-sm hover:underline">
          &larr; Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Import Information</h1>
        <p className="text-gray-500 mt-1">
          Import from LinkedIn, GitHub, or your website — or paste text directly. All information is appended to your existing profile.
        </p>
      </div>

      {/* URL Scraping Section */}
      <div className="mb-8 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Scrape from URLs</h2>
        {urlFields.map(({ key, label, value, setter, placeholder }) => {
          const state = scrapeStates[key];
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleScrape(key, value)}
                  disabled={state.loading || !value.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
                >
                  {state.loading ? "Scraping..." : "Scrape"}
                </button>
              </div>
              {state.error && (
                <p className="text-red-500 text-xs mt-1">{state.error}</p>
              )}
              {state.result && (
                <p className="text-green-600 text-xs mt-1">
                  Information appended to your profile: {state.result.projects} project{state.result.projects !== 1 ? "s" : ""}, {state.result.skills} skill{state.result.skills !== 1 ? "s" : ""} added
                </p>
              )}
            </div>
          );
        })}
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Text Import Section */}
      <h2 className="text-base font-semibold text-gray-800 mb-3">Paste Text</h2>
      {!result ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 p-4 border border-gray-300 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your resume text, LinkedIn export, or any professional background text here..."
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            onClick={handleImport}
            disabled={loading || !text.trim()}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Parsing with AI..." : "Parse with AI"}
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800">Import successful!</h3>
            <p className="text-green-700 text-sm mt-1">
              Information appended to your profile.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 text-sm">
            {result.name && (
              <div>
                <span className="font-medium">Name:</span> {result.name}
              </div>
            )}
            {result.experiences?.length > 0 && (
              <div>
                <span className="font-medium">Experiences:</span> {result.experiences.length} entries
              </div>
            )}
            {result.skills?.length > 0 && (
              <div>
                <span className="font-medium">Skills:</span> {result.skills.length} skills
              </div>
            )}
            {result.educations?.length > 0 && (
              <div>
                <span className="font-medium">Education:</span> {result.educations.length} entries
              </div>
            )}
            {result.projects?.length > 0 && (
              <div>
                <span className="font-medium">Projects:</span> {result.projects.length} projects
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/profile"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              View Profile
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setText("");
              }}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Import More
            </button>
          </div>
        </div>
      )}

      <hr className="border-gray-200 mt-10 mb-6" />

      {/* Download All Data */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Export All Profile Data</h2>
        <p className="text-gray-500 text-sm mb-3">Download a complete JSON snapshot of all your profile information.</p>
        <button
          onClick={handleDownloadAllData}
          className="border border-gray-300 bg-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium"
        >
          Download All Profile Data
        </button>
      </div>
    </div>
  );
}
