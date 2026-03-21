"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

const WORK_STYLE_OPTIONS = [
  "Independent","Collaborative","Deep focus","Fast-paced",
  "Structured","Flexible","Remote","In-person","Async","Synchronous","Mentoring others","Mentored by others",
];

const COMM_STYLE_OPTIONS = [
  "Direct & concise","Thorough & detailed","Warm & relational","Analytical & precise","Creative & expressive",
];

const MOTIVATOR_OPTIONS = [
  "Impact","Growth","Compensation","Stability","Creativity",
  "Leadership","Autonomy","Recognition","Mission","Learning",
  "Work-life balance","Innovation","Speed","Depth","Collaboration",
];

const QUESTIONS = [
  {
    id: "coworker",
    question: "How would your closest coworker describe how you work?",
    hint: "Think about the words they'd actually use — not the words you'd want.",
  },
  {
    id: "feedback",
    question: "What's the best professional feedback you've ever received, and why did it resonate?",
    hint: "This often reveals what you're actually known for.",
  },
  {
    id: "proud",
    question: "Describe a work moment you're genuinely proud of — what made it meaningful?",
    hint: "Not the biggest project, necessarily — the one that still sticks with you.",
  },
  {
    id: "problem",
    question: "What kind of problem do you most enjoy solving at work?",
    hint: "The type of challenge that makes you lose track of time.",
  },
  {
    id: "environment",
    question: "When you're doing your best work, what does that look like?",
    hint: "Team size, pace, structure, feedback loops — whatever matters to you.",
  },
  {
    id: "underrated",
    question: "What's something you do well that doesn't show up enough on your resume?",
    hint: "Often the most honest signal of how you'd describe yourself.",
  },
  {
    id: "impression",
    question: "What do you want the person reading your resume to think or feel after reading it?",
    hint: "One adjective or phrase is enough.",
  },
  {
    id: "rules",
    question: "If you could rewrite the rules of your industry or field, what would you change?",
    hint: "This is a window into your values and what drives you professionally.",
  },
];

export default function PersonalityPage() {
  const [mbti, setMbti] = useState("");
  const [workStyle, setWorkStyle] = useState<string[]>([]);
  const [commStyle, setCommStyle] = useState("");
  const [motivators, setMotivators] = useState<string[]>([]);
  const [personalBrand, setPersonalBrand] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d) return;
        setMbti(d.mbti || "");
        setWorkStyle(d.workStyle ? d.workStyle.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
        setCommStyle(d.communicationStyle || "");
        setMotivators((() => { try { return JSON.parse(d.careerMotivators || "[]"); } catch { return []; } })());
        setPersonalBrand(d.personalBrand || "");
        setAnswers((() => { try { return JSON.parse(d.personalityAnswers || "{}"); } catch { return {}; } })());
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePill = (val: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const answeredCount = QUESTIONS.filter((q) => answers[q.id]?.trim()).length;
  const totalFields = (mbti ? 1 : 0) + (workStyle.length > 0 ? 1 : 0) + (commStyle ? 1 : 0) + (motivators.length > 0 ? 1 : 0) + (personalBrand ? 1 : 0) + answeredCount;
  const maxFields = 5 + QUESTIONS.length;
  const completeness = Math.round((totalFields / maxFields) * 100);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "personality",
        data: {
          mbti,
          workStyle: workStyle.join(", "),
          communicationStyle: commStyle,
          careerMotivators: JSON.stringify(motivators),
          personalBrand,
          personalityAnswers: JSON.stringify(answers),
        },
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/profile" className="text-blue-600 text-sm hover:underline">← Back to Profile</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Personality & Voice</h1>
        <p className="text-gray-500 mt-1 text-sm leading-relaxed">
          The more Claude knows about how you think and work, the more your resume and cover letters will actually sound like you — not a template.
        </p>
      </div>

      {/* Completeness bar */}
      <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile completeness</span>
          <span className="text-sm font-bold text-blue-600">{completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${completeness}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">More answers = more personalized resumes and cover letters</p>
      </div>

      {/* MBTI */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">MBTI Type</h2>
        <p className="text-xs text-gray-500 mb-3">Helps calibrate your resume&apos;s tone — analytical and direct vs warm and collaborative, etc.</p>
        <div className="grid grid-cols-4 gap-2">
          {MBTI_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setMbti(mbti === type ? "" : type)}
              className={`py-2 rounded-lg text-sm font-mono font-semibold transition-all border ${
                mbti === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {mbti && (
          <p className="mt-2 text-xs text-blue-600 font-medium">Selected: {mbti}</p>
        )}
      </section>

      {/* Work Style */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Work Style</h2>
        <p className="text-xs text-gray-500 mb-3">Select all that describe how you work best. Used to shape bullet framing and emphasis.</p>
        <div className="flex flex-wrap gap-2">
          {WORK_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => togglePill(opt, workStyle, setWorkStyle)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                workStyle.includes(opt)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Communication Style */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Communication Style</h2>
        <p className="text-xs text-gray-500 mb-3">Your natural voice in professional writing.</p>
        <div className="flex flex-wrap gap-2">
          {COMM_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setCommStyle(commStyle === opt ? "" : opt)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                commStyle === opt
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Career Motivators */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">What Drives You</h2>
        <p className="text-xs text-gray-500 mb-3">Select your top motivators. These shape the &quot;why&quot; narrative in your cover letter.</p>
        <div className="flex flex-wrap gap-2">
          {MOTIVATOR_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => togglePill(opt, motivators, setMotivators)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                motivators.includes(opt)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Personal Brand */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Your Professional Brand</h2>
        <p className="text-xs text-gray-500 mb-3">In one sentence, how do you want to be described professionally? This goes into your summary.</p>
        <textarea
          value={personalBrand}
          onChange={(e) => setPersonalBrand(e.target.value)}
          rows={2}
          placeholder="e.g. A product engineer who obsesses over details and ships things people actually want to use."
          className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* Q&A Section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Personality Questions</h2>
        <p className="text-xs text-gray-500 mb-5">
          Answer as many or as few as you like. These are the most powerful signal for personalizing your voice.
          There are no right answers — just honest ones.
        </p>
        <div className="space-y-6">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{q.question}</p>
                  <p className="text-xs text-gray-400 mt-0.5 italic">{q.hint}</p>
                </div>
              </div>
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                rows={3}
                placeholder="Your answer..."
                className="w-full p-3 border border-gray-200 bg-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-8 px-8 py-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">{answeredCount} of {QUESTIONS.length} questions answered</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          {saved ? "Saved!" : saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
