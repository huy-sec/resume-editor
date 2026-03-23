import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildResumeHTML(resumeData: any, profile: any): string {
  const experiences = (resumeData.experiences || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((exp: any) => `
    <div class="experience-entry">
      <div class="row">
        <div>
          <div class="font-semibold">${exp.title}</div>
          <div class="gray small">${exp.company}</div>
        </div>
        <div class="light small" style="white-space:nowrap">${exp.startDate} – ${exp.current ? "Present" : exp.endDate}</div>
      </div>
      <ul>
        ${(exp.bullets || []).map((b: string) => `<li>${b}</li>`).join("")}
      </ul>
    </div>
  `)
    .join("");

  const educations = (resumeData.educations || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((edu: any) => `
    <div class="edu-entry">
      <div class="row">
        <div>
          <div class="font-semibold">${edu.school}</div>
          <div class="gray small">${edu.degree}${edu.field ? ` in ${edu.field}` : ""}${edu.gpa ? ` &nbsp;•&nbsp; GPA: ${edu.gpa}` : ""}</div>
        </div>
        <div class="light small" style="white-space:nowrap">${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ""}</div>
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
        `<div class="skill-row"><span class="font-medium capitalize">${cat}:</span> <span class="gray">${(names as string[]).join(", ")}</span></div>`
    )
    .join("");

  const projects = (resumeData.projects || []).slice(0, 5)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((proj: any) => `
    <div class="proj-entry">
      <div class="font-semibold">${proj.name}${proj.link ? ` <span style="font-weight:400;color:#2563eb;font-size:9pt">${proj.link}</span>` : ""}</div>
      ${proj.techStack?.length ? `<div class="xsmall light" style="margin-bottom:2px">${Array.isArray(proj.techStack) ? proj.techStack.join(" &nbsp;•&nbsp; ") : proj.techStack}</div>` : ""}
      <p class="small gray" style="line-height:1.5;margin-top:2px">${proj.description}</p>
    </div>
  `)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; }
  h1 { font-size: 19pt; font-weight: 700; }
  h2 {
    font-size: 9.5pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; border-bottom: 1.5px solid #1a1a1a;
    padding-bottom: 2px; margin-bottom: 7px; margin-top: 12px;
    page-break-after: avoid; break-after: avoid;
  }
  .contact { color: #444; font-size: 9pt; margin-top: 3px; }
  .section-block {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 10px;
  }
  .experience-entry {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 11px;
  }
  .edu-entry {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 8px;
  }
  .proj-entry {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 8px;
  }
  .row { display: flex; justify-content: space-between; align-items: flex-start; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .gray { color: #4b5563; }
  .light { color: #6b7280; }
  .blue { color: #2563eb; }
  .small { font-size: 9pt; }
  .xsmall { font-size: 8.5pt; }
  .capitalize { text-transform: capitalize; }
  ul { padding-left: 14px; margin-top: 4px; }
  li { margin-bottom: 1.5px; line-height: 1.4; font-size: 10pt; }
  .skill-row { margin-bottom: 2px; line-height: 1.45; font-size: 10pt; }
  p.summary { font-size: 10.5pt; line-height: 1.5; }
</style>
</head>
<body>
  <div class="section-block">
    <h1>${profile?.name || resumeData.name || "Name"}</h1>
    <div class="contact">
      ${[profile?.email, profile?.phone, profile?.location, profile?.linkedIn, profile?.github]
        .filter(Boolean)
        .join(" &nbsp;|&nbsp; ")}
    </div>
  </div>

  ${resumeData.summary ? `<h2>Summary</h2><div class="section-block"><p class="summary">${resumeData.summary}</p></div>` : ""}

  ${experiences ? `<h2>Experience</h2>${experiences}` : ""}

  ${projects ? `<h2>Projects</h2>${projects}` : ""}

  ${educations ? `<h2>Education</h2>${educations}` : ""}

  ${skillsHTML ? `<h2>Skills</h2><div class="section-block">${skillsHTML}</div>` : ""}

  ${(resumeData.certifications?.length) ? `<h2>Certifications</h2><div class="section-block">${
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (resumeData.certifications as any[]).map((c: any) => `
      <div class="row edu-entry">
        <div>
          <div class="font-semibold">${c.name}</div>
          ${c.issuer ? `<div class="gray small">${c.issuer}</div>` : ""}
        </div>
        ${c.date ? `<div class="light small" style="white-space:nowrap">${c.date}</div>` : ""}
      </div>`).join("")
  }</div>` : ""}
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
    .map((p) => `<p class="para">${p}</p>`)
    .join("");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; }
  .name  { font-size: 14pt; font-weight: 700; margin-bottom: 3px; }
  .contact { color: #555; font-size: 9.5pt; margin-bottom: 18px; }
  .date  { color: #555; font-size: 9.5pt; margin-bottom: 14px; }
  .to    { margin-bottom: 14px; font-size: 10pt; }
  .to .co { font-weight: 600; }
  .to .re { color: #555; }
  .greeting { margin-bottom: 12px; font-size: 10.5pt; }
  .para  { font-size: 10.5pt; line-height: 1.6; margin-bottom: 11px; }
  .sign  { margin-top: 18px; font-size: 10.5pt; }
  .sign-name { font-weight: 600; margin-top: 12px; }
</style>
</head>
<body>
  <div class="name">${profile?.name || "Applicant"}</div>
  <div class="contact">${[profile?.email, profile?.phone, profile?.location].filter(Boolean).join(" &nbsp;|&nbsp; ")}</div>
  <div class="date">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  <div class="to">
    <div class="co">${company || "Hiring Team"}</div>
    <div class="re">Re: ${jobTitle || "Application"}</div>
  </div>
  <div class="greeting">Dear Hiring Manager,</div>
  ${paragraphs}
  <div class="sign">
    <div>Sincerely,</div>
    <div class="sign-name">${profile?.name || "Applicant"}</div>
  </div>
</body>
</html>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFileName(profile: any, tailored: any, type: string): string {
  // If multi-word: keep first word + first letter of each subsequent word (e.g. "Amazon Web Services" → "AmazonWS")
  const abbreviate = (s: string) => {
    const words = (s || "").replace(/[^a-zA-Z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return words[0] || "";
    return words[0] + words.slice(1).map((w) => w[0].toUpperCase()).join("");
  };

  // Build "FirstLast" from full name (capitalize each word, no spaces)
  const fullName = (profile?.name || "Applicant").trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "First";
  const lastName = nameParts.slice(1).join("") || "Last";
  const nameSlug = `${firstName}${lastName}`;

  const company = abbreviate(tailored.company || "Company");
  const role = abbreviate(tailored.jobTitle || "Role");
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const typeName = type === "resume" ? "Resume" : type === "cover" ? "CoverLetter" : "Both";

  return `${nameSlug}-${company}-${role}-${date}-${typeName}.pdf`;
}

/** Count pages in a PDF buffer by scanning for individual page objects */
function countPDFPages(buf: Buffer): number {
  // PDFs store the page count as /Count N inside the Pages dictionary.
  // We scan for all occurrences and take the largest (the root Pages node).
  const text = buf.toString("latin1");
  let max = 1;
  const re = /\/Count\s+(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (n > max) max = n;
  }
  return max;
}

/** Generate a resume PDF, shrinking font size in 0.3pt steps until it fits maxPages. */
async function buildFittedResumePDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  browser: any,
  html: string,
  margins: { top: string; bottom: string; left: string; right: string },
  maxPages = 2
): Promise<Buffer> {
  const page = await browser.newPage();
  let fontSize = 10.5;

  for (let attempt = 0; attempt < 8; attempt++) {
    // Inject current font-size override on every attempt after the first
    const styledHtml =
      attempt === 0
        ? html
        : html.replace(
            "body { font-family: Arial, sans-serif; font-size: 10.5pt;",
            `body { font-family: Arial, sans-serif; font-size: ${fontSize}pt;`
          );

    await page.setContent(styledHtml, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "Letter", printBackground: true, margin: margins });
    const buf = Buffer.from(pdf);

    if (countPDFPages(buf) <= maxPages) {
      await page.close();
      return buf;
    }

    fontSize = Math.max(8.0, +(fontSize - 0.3).toFixed(1));
    if (fontSize <= 8.0) {
      // At minimum font — return whatever we have
      await page.close();
      return buf;
    }
  }

  await page.close();
  // Fallback: return the last generated buffer
  const fallbackPage = await browser.newPage();
  await fallbackPage.setContent(html, { waitUntil: "networkidle0" });
  const fallback = Buffer.from(await fallbackPage.pdf({ format: "Letter", printBackground: true, margin: margins }));
  await fallbackPage.close();
  return fallback;
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

    const RESUME_MARGINS = { top: "0.6in",  bottom: "0.6in",  left: "0.75in", right: "0.75in" };
    const COVER_MARGINS  = { top: "0.75in", bottom: "0.65in", left: "1in",    right: "1in"    };

    if (type === "resume") {
      pdfBuffer = await buildFittedResumePDF(
        browser,
        buildResumeHTML(resumeData, profile),
        RESUME_MARGINS,
        2
      );
    } else if (type === "cover") {
      const page = await browser.newPage();
      await page.setContent(
        buildCoverLetterHTML(tailored.coverLetterText, profile, tailored.jobTitle, tailored.company),
        { waitUntil: "networkidle0" }
      );
      pdfBuffer = Buffer.from(await page.pdf({ format: "Letter", printBackground: true, margin: COVER_MARGINS }));
    } else {
      // Resume: fitted to max 2 pages; cover letter: single page
      const resume = await buildFittedResumePDF(
        browser,
        buildResumeHTML(resumeData, profile),
        RESUME_MARGINS,
        2
      );

      const coverPage = await browser.newPage();
      await coverPage.setContent(
        buildCoverLetterHTML(tailored.coverLetterText, profile, tailored.jobTitle, tailored.company),
        { waitUntil: "networkidle0" }
      );
      const cover = Buffer.from(await coverPage.pdf({ format: "Letter", printBackground: true, margin: COVER_MARGINS }));
      await coverPage.close();

      pdfBuffer = Buffer.concat([resume, cover]);
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${buildFileName(profile, tailored, type)}"`,
      },
    });
  } finally {
    await browser.close();
  }
}
