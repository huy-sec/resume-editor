"use client";
import { useState } from "react";
import Link from "next/link";

export default function ImportPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

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

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/profile" className="text-blue-600 text-sm hover:underline">
          &larr; Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Import Resume with AI</h1>
        <p className="text-gray-500 mt-1">
          Paste your existing resume text, LinkedIn export, or any professional background text.
          Claude will extract and organize your information.
        </p>
      </div>

      {!result ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 p-4 border border-gray-300 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your resume text here..."
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
              Your profile has been updated with the extracted information.
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
    </div>
  );
}
