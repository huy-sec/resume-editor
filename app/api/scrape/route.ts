import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude, extractJSON } from "@/lib/claude";
import { NextRequest, NextResponse } from "next/server";

// GitHub scraping via public API
async function scrapeGitHub(username: string): Promise<{ projects: { name: string; description: string; techStack: string[]; link: string; stars: number; updatedAt: string }[]; skills: string[] }> {
  const ghUser = username
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\/$/, "")
    .split("/")[0];

  const reposRes = await fetch(
    `https://api.github.com/users/${ghUser}/repos?sort=updated&per_page=30&type=public`,
    {
      headers: { "User-Agent": "ResumeEditor/1.0", Accept: "application/vnd.github.v3+json" },
    }
  );
  if (!reposRes.ok) throw new Error(`GitHub API error: ${reposRes.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repos = await reposRes.json() as any[];

  const projects: { name: string; description: string; techStack: string[]; link: string; stars: number; updatedAt: string }[] = [];
  const skillSet = new Set<string>();

  for (const repo of repos.slice(0, 15)) {
    if (repo.fork) continue;
    const techStack: string[] = [];
    if (repo.language) {
      techStack.push(repo.language);
      skillSet.add(repo.language);
    }

    try {
      const langRes = await fetch(repo.languages_url, {
        headers: { "User-Agent": "ResumeEditor/1.0" },
      });
      if (langRes.ok) {
        const langs = await langRes.json() as Record<string, number>;
        Object.keys(langs).forEach((l) => {
          techStack.push(l);
          skillSet.add(l);
        });
      }
    } catch {
      // ignore individual language fetch errors
    }

    projects.push({
      name: repo.name,
      description: repo.description || "",
      techStack: [...new Set(techStack)],
      link: repo.html_url,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    });
  }

  return { projects, skills: [...skillSet] };
}

// Website scraping via puppeteer
async function scrapeWebsite(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const text = await page.evaluate(() => document.body.innerText);
    return text.slice(0, 8000);
  } finally {
    await browser.close();
  }
}

// LinkedIn scraping via puppeteer
async function scrapeLinkedIn(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const text = await page.evaluate(() => document.body.innerText);
    return text.slice(0, 8000);
  } finally {
    await browser.close();
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sourceType, url } = await req.json();
  if (!sourceType || !url) return NextResponse.json({ error: "Missing sourceType or url" }, { status: 400 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawData: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let importedProjects: any[] = [];
  let importedSkills: string[] = [];

  try {
    if (sourceType === "github") {
      const result = await scrapeGitHub(url);
      rawData = result;
      importedProjects = result.projects;
      importedSkills = result.skills;
    } else if (sourceType === "linkedin") {
      const text = await scrapeLinkedIn(url);
      rawData = { text };
      const { buildImportPrompt } = await import("@/lib/prompts");
      const response = await callClaude(buildImportPrompt(text));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = extractJSON(response) as any;
      importedProjects = parsed.projects || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      importedSkills = (parsed.skills || []).map((s: any) => s.name);
      rawData.parsed = parsed;
    } else if (sourceType === "website") {
      const text = await scrapeWebsite(url);
      rawData = { text };
      const { buildImportPrompt } = await import("@/lib/prompts");
      const response = await callClaude(buildImportPrompt(text));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = extractJSON(response) as any;
      importedProjects = parsed.projects || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      importedSkills = (parsed.skills || []).map((s: any) => s.name);
      rawData.parsed = parsed;
    }

    // Save scraped source record (upsert by profileId + sourceType)
    const existingSource = await prisma.scrapedSource.findFirst({
      where: { profileId: profile.id, sourceType },
    });

    if (existingSource) {
      await prisma.scrapedSource.update({
        where: { id: existingSource.id },
        data: { sourceUrl: url, rawData: JSON.stringify(rawData), scrapedAt: new Date() },
      });
    } else {
      await prisma.scrapedSource.create({
        data: { profileId: profile.id, sourceType, sourceUrl: url, rawData: JSON.stringify(rawData) },
      });
    }

    // APPEND projects (don't delete existing)
    for (let i = 0; i < importedProjects.length; i++) {
      const p = importedProjects[i];
      const existing = await prisma.project.findFirst({ where: { profileId: profile.id, name: p.name } });
      if (!existing) {
        await prisma.project.create({
          data: {
            profileId: profile.id,
            name: p.name,
            description: p.description || "",
            techStack: JSON.stringify(Array.isArray(p.techStack) ? p.techStack : []),
            link: p.link || "",
            sortOrder: i,
          },
        });
      }
    }

    // APPEND skills (don't delete existing)
    for (const skillName of importedSkills) {
      const existing = await prisma.skill.findFirst({ where: { profileId: profile.id, name: skillName } });
      if (!existing && skillName.trim()) {
        await prisma.skill.create({
          data: { profileId: profile.id, name: skillName, category: "technical" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: { projects: importedProjects.length, skills: importedSkills.length },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    console.error("Scrape error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
