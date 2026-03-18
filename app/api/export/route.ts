import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildResumeHTML(resumeData: any, profile: any): string {
  const experiences = (resumeData.experiences || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((exp: any) => `
    <div class="mb-4">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-semibold">${exp.title}</div>
          <div class="text-gray-600">${exp.company}</div>
        </div>
        <div class="text-gray-500 text-sm">${exp.startDate} – ${exp.current ? "Present" : exp.endDate}</div>
      </div>
      <ul class="mt-2 ml-4 list-disc space-y-1">
        ${(exp.bullets || []).map((b: string) => `<li class="text-sm text-gray-700">${b}</li>`).join("")}
      </ul>
    </div>
  `)
    .join("");

  const educations = (resumeData.educations || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((edu: any) => `
    <div class="mb-3">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold">${edu.school}</div>
          <div class="text-gray-600 text-sm">${edu.degree}${edu.field ? ` in ${edu.field}` : ""}${edu.gpa ? ` • GPA: ${edu.gpa}` : ""}</div>
        </div>
        <div class="text-gray-500 text-sm">${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ""}</div>
      </div>
    </div>
  `)
    .join("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skillCategories = (resumeData.skills || []).reduce((acc: any, skill: any) => {
    const cat = skill.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {});

  const skillsHTML = Object.entries(skillCategories)
    .map(
      ([cat, names]) =>
        `<div class="mb-1"><span class="font-medium capitalize">${cat}:</span> <span class="text-gray-700">${(names as string[]).join(", ")}</span></div>`
    )
    .join("");

  const projects = (resumeData.projects || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((proj: any) => `
    <div class="mb-3">
      <div class="flex justify-between">
        <div class="font-semibold">${proj.name}${proj.link ? ` <span class="font-normal text-blue-600 text-sm">${proj.link}</span>` : ""}</div>
      </div>
      ${proj.techStack?.length ? `<div class="text-xs text-gray-500 mb-1">${Array.isArray(proj.techStack) ? proj.techStack.join(" • ") : proj.techStack}</div>` : ""}
      <p class="text-sm text-gray-700">${proj.description}</p>
    </div>
  `)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #1a1a1a; padding: 40px 48px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22pt; font-weight: 700; }
  h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #1a1a1a; padding-bottom: 3px; margin-bottom: 10px; margin-top: 18px; }
  .contact { color: #444; font-size: 10pt; margin-top: 4px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-4 { margin-bottom: 16px; }
  .mt-2 { margin-top: 8px; }
  .ml-4 { margin-left: 16px; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .text-gray-500 { color: #6b7280; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-700 { color: #374151; }
  .text-blue-600 { color: #2563eb; }
  .text-sm { font-size: 10pt; }
  .text-xs { font-size: 9pt; }
  .flex { display: flex; }
  .justify-between { justify-content: space-between; }
  .items-start { align-items: flex-start; }
  .capitalize { text-transform: capitalize; }
  ul { padding-left: 16px; }
  li { margin-bottom: 2px; }
  .space-y-1 > * + * { margin-top: 3px; }
</style>
</head>
<body>
  <h1>${profile?.name || resumeData.name || "Name"}</h1>
  <div class="contact">
    ${[profile?.email, profile?.phone, profile?.location, profile?.linkedIn, profile?.github]
      .filter(Boolean)
      .join(" | ")}
  </div>

  ${resumeData.summary ? `<h2>Summary</h2><p class="text-gray-700" style="font-size:10.5pt;line-height:1.5">${resumeData.summary}</p>` : ""}

  ${experiences ? `<h2>Experience</h2>${experiences}` : ""}

  ${projects ? `<h2>Projects</h2>${projects}` : ""}

  ${educations ? `<h2>Education</h2>${educations}` : ""}

  ${skillsHTML ? `<h2>Skills</h2>${skillsHTML}` : ""}
</body>
</html>`;
}

function buildCoverLetterHTML(
  coverLetterText: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any,
  jobTitle: string,
  company: string
): string {
  const paragraphs = coverLetterText
    .split("\n")
    .filter((p) => p.trim())
    .map((p) => `<p style="margin-bottom:16px;line-height:1.7">${p}</p>`)
    .join("");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #1a1a1a; padding: 60px 64px; max-width: 800px; margin: 0 auto; }
</style>
</head>
<body>
  <div style="margin-bottom:40px">
    <div style="font-size:16pt;font-weight:700">${profile?.name || "Applicant"}</div>
    <div style="color:#555;margin-top:4px;font-size:10pt">${[profile?.email, profile?.phone, profile?.location].filter(Boolean).join(" | ")}</div>
  </div>
  <div style="margin-bottom:32px;color:#555;font-size:10pt">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  <div style="margin-bottom:24px">
    <div style="font-weight:600">${company || "Hiring Team"}</div>
    <div style="color:#555">Re: ${jobTitle || "Application"}</div>
  </div>
  <div style="margin-bottom:20px">Dear Hiring Manager,</div>
  ${paragraphs}
  <div style="margin-top:32px">
    <div>Sincerely,</div>
    <div style="margin-top:16px;font-weight:600">${profile?.name || "Applicant"}</div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, type } = await req.json();

  const tailored = await prisma.tailoredResume.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!tailored) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const resumeData = JSON.parse(tailored.resumeJSON);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    let pdfBuffer: Buffer;

    if (type === "resume") {
      const page = await browser.newPage();
      await page.setContent(buildResumeHTML(resumeData, profile), { waitUntil: "networkidle0" });
      pdfBuffer = Buffer.from(
        await page.pdf({ format: "Letter", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" } })
      );
    } else if (type === "cover") {
      const page = await browser.newPage();
      await page.setContent(
        buildCoverLetterHTML(tailored.coverLetterText, profile, tailored.jobTitle, tailored.company),
        { waitUntil: "networkidle0" }
      );
      pdfBuffer = Buffer.from(await page.pdf({ format: "Letter", printBackground: true }));
    } else {
      const page1 = await browser.newPage();
      await page1.setContent(buildResumeHTML(resumeData, profile), { waitUntil: "networkidle0" });
      const resume = await page1.pdf({ format: "Letter", printBackground: true });

      const page2 = await browser.newPage();
      await page2.setContent(
        buildCoverLetterHTML(tailored.coverLetterText, profile, tailored.jobTitle, tailored.company),
        { waitUntil: "networkidle0" }
      );
      const cover = await page2.pdf({ format: "Letter", printBackground: true });

      pdfBuffer = Buffer.concat([Buffer.from(resume), Buffer.from(cover)]);
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-${tailored.jobTitle || "resume"}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
