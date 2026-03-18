"use client";
import { useState, useEffect, useCallback } from "react";

// ---- Types ----
interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  sortOrder: number;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link: string;
  sortOrder: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  website: string;
  summary: string;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

const TABS = ["Personal", "Experience", "Education", "Skills", "Projects", "Certifications"] as const;
type Tab = (typeof TABS)[number];

function apiCall(data: object) {
  return fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

// ---- Personal Info Tab ----
function PersonalTab({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedIn: profile.linkedIn,
    github: profile.github,
    website: profile.website,
    summary: profile.summary,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await apiCall({ section: "personal", data: form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  };

  const fields: { key: keyof typeof form; label: string; type?: string; multiline?: boolean }[] = [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "linkedIn", label: "LinkedIn URL" },
    { key: "github", label: "GitHub URL" },
    { key: "website", label: "Website" },
    { key: "summary", label: "Professional Summary", multiline: true },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {fields.map(({ key, label, type, multiline }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          {multiline ? (
            <textarea
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <input
              type={type || "text"}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

// ---- Experience Tab ----
function ExperienceTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
  const emptyForm = {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    current: false,
    bulletsText: "",
  };
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await apiCall({
      section: "experience",
      action: "add",
      data: {
        ...form,
        bullets: form.bulletsText.split("\n").filter((b) => b.trim()),
        sortOrder: profile.experiences.length,
      },
    });
    setSaving(false);
    setAdding(false);
    setForm(emptyForm);
    onRefresh();
  };

  const handleUpdate = async () => {
    setSaving(true);
    await apiCall({
      section: "experience",
      action: "update",
      id: editId,
      data: {
        ...form,
        bullets: form.bulletsText.split("\n").filter((b) => b.trim()),
      },
    });
    setSaving(false);
    setEditId(null);
    setForm(emptyForm);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    await apiCall({ section: "experience", action: "delete", id });
    onRefresh();
  };

  const startEdit = (exp: Experience) => {
    setForm({
      company: exp.company,
      title: exp.title,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      bulletsText: exp.bullets.join("\n"),
    });
    setEditId(exp.id);
    setAdding(false);
  };

  const ExperienceForm = ({ onSubmit }: { onSubmit: () => void }) => (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
          <input
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Corp"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Software Engineer"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
          <input
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jan 2022"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
          <input
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            disabled={form.current}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Dec 2023"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={form.current}
          onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))}
          className="rounded"
        />
        Current position
      </label>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Bullet Points (one per line)
        </label>
        <textarea
          value={form.bulletsText}
          onChange={(e) => setForm((f) => ({ ...f, bulletsText: e.target.value }))}
          rows={5}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          placeholder="Built X that achieved Y by doing Z&#10;Led team of 5 engineers to..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={saving || !form.company || !form.title}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setAdding(false);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      {profile.experiences.map((exp) => (
        <div key={exp.id}>
          {editId === exp.id ? (
            <ExperienceForm onSubmit={handleUpdate} />
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900">{exp.title}</div>
                  <div className="text-gray-600 text-sm">{exp.company}</div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(exp)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {exp.bullets.length > 0 && (
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="text-gray-700 text-sm">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}

      {adding && <ExperienceForm onSubmit={handleAdd} />}

      {!adding && editId === null && (
        <button
          onClick={() => setAdding(true)}
          className="border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-xl px-4 py-3 text-sm w-full transition-colors"
        >
          + Add Experience
        </button>
      )}
    </div>
  );
}

// ---- Education Tab ----
function EducationTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
  const emptyForm = { school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" };
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await apiCall({ section: "education", action: "add", data: form });
    setSaving(false);
    setAdding(false);
    setForm(emptyForm);
    onRefresh();
  };

  const handleUpdate = async () => {
    setSaving(true);
    await apiCall({ section: "education", action: "update", id: editId, data: form });
    setSaving(false);
    setEditId(null);
    setForm(emptyForm);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this education?")) return;
    await apiCall({ section: "education", action: "delete", id });
    onRefresh();
  };

  const startEdit = (edu: Education) => {
    setForm({
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
    });
    setEditId(edu.id);
    setAdding(false);
  };

  const EducationForm = ({ onSubmit }: { onSubmit: () => void }) => (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">School</label>
          <input
            value={form.school}
            onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="MIT"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
          <input
            value={form.degree}
            onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="B.S. Computer Science"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Field of Study</label>
          <input
            value={form.field}
            onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Computer Science"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
          <input
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2018"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
          <input
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2022"
          />
        </div>
      </div>
      <div className="w-32">
        <label className="block text-xs font-medium text-gray-600 mb-1">GPA (optional)</label>
        <input
          value={form.gpa}
          onChange={(e) => setForm((f) => ({ ...f, gpa: e.target.value }))}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="3.8"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={saving || !form.school || !form.degree}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setAdding(false);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      {profile.educations.map((edu) => (
        <div key={edu.id}>
          {editId === edu.id ? (
            <EducationForm onSubmit={handleUpdate} />
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900">{edu.school}</div>
                  <div className="text-gray-600 text-sm">
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                    {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {edu.startDate}
                    {edu.endDate ? ` – ${edu.endDate}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(edu)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding && <EducationForm onSubmit={handleAdd} />}

      {!adding && editId === null && (
        <button
          onClick={() => setAdding(true)}
          className="border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-xl px-4 py-3 text-sm w-full transition-colors"
        >
          + Add Education
        </button>
      )}
    </div>
  );
}

// ---- Skills Tab ----
function SkillsTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("technical");
  const [saving, setSaving] = useState(false);

  const grouped = profile.skills.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await apiCall({ section: "skill", action: "add", data: { name: name.trim(), category } });
    setSaving(false);
    setName("");
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await apiCall({ section: "skill", action: "delete", id });
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {Object.entries(grouped).map(([cat, skills]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-gray-700 capitalize mb-2">{cat}</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {s.name}
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-blue-400 hover:text-red-500 transition-colors text-xs font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Skill</h3>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Skill name"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="technical">Technical</option>
            <option value="tools">Tools</option>
            <option value="languages">Languages</option>
            <option value="soft">Soft Skills</option>
            <option value="general">General</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Projects Tab ----
function ProjectsTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
  const emptyForm = { name: "", description: "", techStackText: "", link: "" };
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await apiCall({
      section: "project",
      action: "add",
      data: {
        name: form.name,
        description: form.description,
        techStack: form.techStackText.split(",").map((t) => t.trim()).filter(Boolean),
        link: form.link,
        sortOrder: profile.projects.length,
      },
    });
    setSaving(false);
    setAdding(false);
    setForm(emptyForm);
    onRefresh();
  };

  const handleUpdate = async () => {
    setSaving(true);
    await apiCall({
      section: "project",
      action: "update",
      id: editId,
      data: {
        name: form.name,
        description: form.description,
        techStack: form.techStackText.split(",").map((t) => t.trim()).filter(Boolean),
        link: form.link,
      },
    });
    setSaving(false);
    setEditId(null);
    setForm(emptyForm);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await apiCall({ section: "project", action: "delete", id });
    onRefresh();
  };

  const startEdit = (proj: Project) => {
    setForm({
      name: proj.name,
      description: proj.description,
      techStackText: proj.techStack.join(", "),
      link: proj.link,
    });
    setEditId(proj.id);
    setAdding(false);
  };

  const ProjectForm = ({ onSubmit }: { onSubmit: () => void }) => (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="My Awesome Project"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="What this project does and what it achieves..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Tech Stack (comma-separated)
        </label>
        <input
          value={form.techStackText}
          onChange={(e) => setForm((f) => ({ ...f, techStackText: e.target.value }))}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="React, Node.js, PostgreSQL"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link (optional)</label>
        <input
          value={form.link}
          onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://github.com/..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={saving || !form.name}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setAdding(false);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      {profile.projects.map((proj) => (
        <div key={proj.id}>
          {editId === proj.id ? (
            <ProjectForm onSubmit={handleUpdate} />
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <div className="font-semibold text-gray-900">{proj.name}</div>
                  {proj.techStack.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {proj.techStack.join(" • ")}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-gray-600 text-sm mt-1">{proj.description}</p>
                  )}
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs hover:underline mt-1 block"
                    >
                      {proj.link}
                    </a>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(proj)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding && <ProjectForm onSubmit={handleAdd} />}

      {!adding && editId === null && (
        <button
          onClick={() => setAdding(true)}
          className="border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-xl px-4 py-3 text-sm w-full transition-colors"
        >
          + Add Project
        </button>
      )}
    </div>
  );
}

// ---- Certifications Tab ----
function CertificationsTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
  const emptyForm = { name: "", issuer: "", date: "", link: "" };
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await apiCall({ section: "certification", action: "add", data: form });
    setSaving(false);
    setAdding(false);
    setForm(emptyForm);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certification?")) return;
    await apiCall({ section: "certification", action: "delete", id });
    onRefresh();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {profile.certifications.map((cert) => (
        <div key={cert.id} className="border border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-gray-900">{cert.name}</div>
              {cert.issuer && <div className="text-gray-600 text-sm">{cert.issuer}</div>}
              {cert.date && <div className="text-gray-400 text-xs mt-0.5">{cert.date}</div>}
              {cert.link && (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs hover:underline"
                >
                  {cert.link}
                </a>
              )}
            </div>
            <button
              onClick={() => handleDelete(cert.id)}
              className="text-red-500 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {adding && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Certification Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AWS Solutions Architect"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Issuer</label>
              <input
                value={form.issuer}
                onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amazon Web Services"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="March 2024"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Link (optional)
              </label>
              <input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !form.name}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setForm(emptyForm);
              }}
              className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-xl px-4 py-3 text-sm w-full transition-colors"
        >
          + Add Certification
        </button>
      )}
    </div>
  );
}

// ---- Main Profile Page ----
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Personal");

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    if (data) {
      // Parse bullets and techStack from JSON strings
      const parsed = {
        ...data,
        experiences: (data.experiences || []).map((e: Experience & { bullets: string }) => ({
          ...e,
          bullets: typeof e.bullets === "string" ? JSON.parse(e.bullets) : e.bullets,
        })),
        projects: (data.projects || []).map((p: Project & { techStack: string }) => ({
          ...p,
          techStack: typeof p.techStack === "string" ? JSON.parse(p.techStack) : p.techStack,
        })),
      };
      setProfile(parsed);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">
          Keep your profile up to date for better AI tailoring results
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? "bg-white text-blue-600 border border-gray-200 border-b-white -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "Personal" && (
          <PersonalTab profile={profile} onSaved={fetchProfile} />
        )}
        {activeTab === "Experience" && (
          <ExperienceTab profile={profile} onRefresh={fetchProfile} />
        )}
        {activeTab === "Education" && (
          <EducationTab profile={profile} onRefresh={fetchProfile} />
        )}
        {activeTab === "Skills" && (
          <SkillsTab profile={profile} onRefresh={fetchProfile} />
        )}
        {activeTab === "Projects" && (
          <ProjectsTab profile={profile} onRefresh={fetchProfile} />
        )}
        {activeTab === "Certifications" && (
          <CertificationsTab profile={profile} onRefresh={fetchProfile} />
        )}
      </div>
    </div>
  );
}
