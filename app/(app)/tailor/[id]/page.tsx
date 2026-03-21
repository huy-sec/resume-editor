"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ---- Types ----
interface ScoreFlag {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

interface KeywordMap {
  required: string[];
  preferred: string[];
  technical: string[];
  soft: string[];
  jobTitle: string;
  company: string;
}

interface ResumeExp {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface ResumeEdu {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface ResumeSkill {
  name: string;
  category: string;
}

interface ResumeProject {
  name: string;
  description: string;
  techStack: string[];
  link: string;
}

interface ResumeCert {
  name: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  jobTitle?: string;
  summary?: string;
  experiences?: ResumeExp[];
  educations?: ResumeEdu[];
  skills?: ResumeSkill[];
  projects?: ResumeProject[];
  certifications?: ResumeCert[];
}

interface Profile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
}

interface TailoredResumeData {
  id: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeJSON: string;
  coverLetterText: string;
  humanizationScore: number;
  scoreFlags: string;
  keywords: string;
  profile?: Profile;
}

// ---- Score Gauge ----
function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
  const bgColor =
    score >= 80 ? "bg-green-50 border-green-200" : score >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  const barColor =
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
  const label =
    score >= 85
      ? "Likely passes AI detectors"
      : score >= 70
      ? "Mostly human-sounding"
      : "Needs revision — fix AI writing";

  return (
    <div className={`${bgColor} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">Humanization Score</span>
        <span className={`text-3xl font-bold ${color}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${color}`}>{label}</p>
    </div>
  );
}

// ---- Keyword Checklist ----
function KeywordChecklist({ text, keywords }: { text: string; keywords: KeywordMap }) {
  const allKeywords = [
    ...keywords.required.map((k) => ({ kw: k, type: "required" })),
    ...keywords.technical.map((k) => ({ kw: k, type: "technical" })),
  ];

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {allKeywords.map(({ kw, type }) => {
        const found = text.toLowerCase().includes(kw.toLowerCase());
        return (
          <div key={kw} className="flex items-center gap-2 text-sm">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                found ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
              }`}
            >
              {found ? "✓" : "✗"}
            </span>
            <span className={found ? "text-gray-700" : "text-gray-400"}>{kw}</span>
            <span className="text-xs text-gray-300 ml-auto">{type}</span>
          </div>
        );
      })}
      {allKeywords.length === 0 && (
        <p className="text-gray-400 text-sm">No keywords extracted</p>
      )}
    </div>
  );
}

// ---- Resume Preview ----
function ResumePreview({
  data,
  profile,
  onChange,
}: {
  data: ResumeData;
  profile?: Profile;
  onChange: (updated: ResumeData) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 min-h-screen font-serif">
      {/* Header */}
      <div className="mb-6 pb-4 border-b-2 border-gray-900">
        <h1 className="text-2xl font-bold text-gray-900">{profile?.name || "Your Name"}</h1>
        <p className="text-gray-600 text-sm mt-1">
          {[profile?.email, profile?.phone, profile?.location, profile?.linkedIn, profile?.github]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>

      {/* Summary */}
      {data.summary !== undefined && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2">
            Summary
          </h2>
          <textarea
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            rows={3}
            className="w-full text-sm text-gray-700 leading-relaxed resize-none border border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none rounded p-1 transition-colors"
          />
        </div>
      )}

      {/* Experience */}
      {data.experiences && data.experiences.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Experience
          </h2>
          {data.experiences.map((exp, ei) => (
            <div key={ei} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{exp.title}</div>
                  <div className="text-gray-600 text-sm">{exp.company}</div>
                </div>
                <div className="text-gray-500 text-xs">
                  {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                </div>
              </div>
              <ul className="mt-2 ml-4 space-y-1">
                {exp.bullets.map((bullet, bi) => (
                  <li key={bi} className="flex items-start gap-1">
                    <span className="text-gray-400 mt-1 text-xs">•</span>
                    <textarea
                      value={bullet}
                      onChange={(e) => {
                        const newExps = [...(data.experiences || [])];
                        const newBullets = [...newExps[ei].bullets];
                        newBullets[bi] = e.target.value;
                        newExps[ei] = { ...newExps[ei], bullets: newBullets };
                        onChange({ ...data, experiences: newExps });
                      }}
                      rows={2}
                      className="flex-1 text-sm text-gray-700 resize-none border border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none rounded p-0.5 transition-colors"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Projects
          </h2>
          {data.projects.map((proj, pi) => (
            <div key={pi} className="mb-3">
              <div className="font-semibold text-gray-900 text-sm">
                {proj.name}
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-normal text-blue-600 text-xs ml-2"
                  >
                    {proj.link}
                  </a>
                )}
              </div>
              {proj.techStack?.length > 0 && (
                <div className="text-xs text-gray-500">
                  {Array.isArray(proj.techStack) ? proj.techStack.join(" • ") : proj.techStack}
                </div>
              )}
              <textarea
                value={proj.description}
                onChange={(e) => {
                  const newProjs = [...(data.projects || [])];
                  newProjs[pi] = { ...newProjs[pi], description: e.target.value };
                  onChange({ ...data, projects: newProjs });
                }}
                rows={2}
                className="w-full mt-1 text-sm text-gray-700 resize-none border border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none rounded p-0.5 transition-colors"
              />
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.educations && data.educations.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          {data.educations.map((edu, i) => (
            <div key={i} className="mb-3 flex justify-between">
              <div>
                <div className="font-semibold text-gray-900 text-sm">{edu.school}</div>
                <div className="text-gray-600 text-sm">
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ""}
                  {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                {edu.startDate}
                {edu.endDate ? ` – ${edu.endDate}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2">
            Skills
          </h2>
          {Object.entries(
            data.skills.reduce(
              (acc, s) => {
                const cat = s.category || "general";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(s.name);
                return acc;
              },
              {} as Record<string, string[]>
            )
          ).map(([cat, names]) => (
            <div key={cat} className="mb-1 text-sm">
              <span className="font-medium capitalize">{cat}:</span>{" "}
              <span className="text-gray-700">{names.join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----
export default function TailorReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<TailoredResumeData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const [coverLetter, setCoverLetter] = useState("");
  const [keywords, setKeywords] = useState<KeywordMap>({
    required: [],
    preferred: [],
    technical: [],
    soft: [],
    jobTitle: "",
    company: "",
  });
  const [flags, setFlags] = useState<ScoreFlag[]>([]);
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [humanizing, setHumanizing] = useState(false);
  const [humanizeMessage, setHumanizeMessage] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/tailor/${id}`);
    const d = await res.json();
    if (!res.ok) {
      router.push("/dashboard");
      return;
    }
    setData(d);
    setResumeData(JSON.parse(d.resumeJSON || "{}"));
    setCoverLetter(d.coverLetterText || "");
    setKeywords(JSON.parse(d.keywords || "{}"));
    setFlags(JSON.parse(d.scoreFlags || "[]"));
    setScore(d.humanizationScore || 0);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/tailor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resumeJSON: resumeData, coverLetterText: coverLetter }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRescore = async () => {
    setRescoring(true);
    const textToScore = `${resumeData.summary || ""}\n${(resumeData.experiences || [])
      .flatMap((e) => e.bullets || [])
      .join("\n")}\n${coverLetter}`;
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToScore }),
    });
    const d = await res.json();
    setScore(d.score || 0);
    setFlags(d.flags || []);
    setSuggestions(d.suggestions || []);
    setRescoring(false);
  };

  const handleHumanize = async () => {
    setHumanizing(true);
    setHumanizeMessage("");
    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, flags, suggestions }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setResumeData(d.resumeJSON || {});
      setCoverLetter(d.coverLetterText || "");
      setScore(d.humanizationScore || 0);
      setFlags(d.scoreFlags || []);
      setSuggestions(d.suggestions || []);
      setHumanizeMessage(`Rewritten! New score: ${d.humanizationScore}%`);
      setTimeout(() => setHumanizeMessage(""), 4000);
    } catch (e: unknown) {
      setHumanizeMessage(e instanceof Error ? e.message : "Humanize failed");
    } finally {
      setHumanizing(false);
    }
  };

  const handleDownload = async (type: "resume" | "cover" | "both") => {
    setDownloading(type);
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Use filename from server's Content-Disposition header
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? `resume-${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloading(null);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this tailored resume?")) return;
    await fetch(`/api/tailor/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const allText = `${resumeData.summary || ""} ${(resumeData.experiences || [])
    .flatMap((e) => e.bullets || [])
    .join(" ")} ${coverLetter}`;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <Link href="/dashboard" className="text-blue-600 text-sm hover:underline">
            &larr; Dashboard
          </Link>
          <h1 className="text-lg font-bold text-gray-900 mt-0.5">
            {data?.jobTitle || "Tailored Resume"}
            {data?.company && <span className="text-gray-500 font-normal"> at {data.company}</span>}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 text-sm hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Tab switcher */}
          <div className="bg-white border-b border-gray-200 px-6 pt-3">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("resume")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "resume"
                    ? "bg-gray-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab("cover")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "cover"
                    ? "bg-gray-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cover Letter
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "resume" ? (
              <ResumePreview
                data={resumeData}
                profile={data?.profile}
                onChange={setResumeData}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="mb-4">
                  <div className="font-bold text-lg">{data?.profile?.name || "Applicant"}</div>
                  <div className="text-gray-500 text-sm">
                    {[data?.profile?.email, data?.profile?.phone, data?.profile?.location]
                      .filter(Boolean)
                      .join(" | ")}
                  </div>
                </div>
                <div className="text-gray-500 text-sm mb-4">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                {data?.company && (
                  <div className="mb-4">
                    <div className="font-medium">{data.company}</div>
                    <div className="text-gray-500 text-sm">Re: {data.jobTitle}</div>
                  </div>
                )}
                <div className="mb-4 text-sm">Dear Hiring Manager,</div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full min-h-80 text-sm text-gray-700 leading-relaxed resize-none border border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none rounded p-1 transition-colors"
                />
                <div className="mt-4 text-sm">
                  <div>Sincerely,</div>
                  <div className="font-medium mt-3">{data?.profile?.name || "Applicant"}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto flex-shrink-0 p-4 space-y-4">
          {/* Score */}
          <ScoreGauge score={score} />

          {/* Fix AI Writing button */}
          <button
            onClick={handleHumanize}
            disabled={humanizing || rescoring}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
          >
            {humanizing ? "Rewriting with human touch..." : "Fix AI Writing"}
          </button>
          {humanizeMessage && (
            <p className={`text-xs text-center font-medium ${humanizeMessage.startsWith("Rewritten") ? "text-green-600" : "text-red-500"}`}>
              {humanizeMessage}
            </p>
          )}

          {/* Re-score button */}
          <button
            onClick={handleRescore}
            disabled={rescoring || humanizing}
            className="w-full border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {rescoring ? "Scoring..." : "Re-score Humanization"}
          </button>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggestions</h3>
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flags */}
          {flags.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Issues Found</h3>
              <div className="space-y-2">
                {flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                        flag.severity === "high"
                          ? "bg-red-100 text-red-600"
                          : flag.severity === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-xs text-gray-600">{flag.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Keyword Coverage</h3>
            <KeywordChecklist text={allText} keywords={keywords} />
          </div>

          {/* Download buttons */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Export PDF</h3>
            <button
              onClick={() => handleDownload("resume")}
              disabled={!!downloading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {downloading === "resume" ? "Generating..." : "Download Resume"}
            </button>
            <button
              onClick={() => handleDownload("cover")}
              disabled={!!downloading}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {downloading === "cover" ? "Generating..." : "Download Cover Letter"}
            </button>
            <button
              onClick={() => handleDownload("both")}
              disabled={!!downloading}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {downloading === "both" ? "Generating..." : "Download Both"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
