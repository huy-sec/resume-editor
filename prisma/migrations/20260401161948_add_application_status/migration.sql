-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TailoredResume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "jobDescription" TEXT NOT NULL,
    "resumeJSON" TEXT NOT NULL DEFAULT '{}',
    "coverLetterText" TEXT NOT NULL DEFAULT '',
    "humanizationScore" INTEGER NOT NULL DEFAULT 0,
    "scoreFlags" TEXT NOT NULL DEFAULT '[]',
    "keywords" TEXT NOT NULL DEFAULT '{}',
    "applicationStatus" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TailoredResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TailoredResume" ("company", "coverLetterText", "createdAt", "humanizationScore", "id", "jobDescription", "jobTitle", "keywords", "resumeJSON", "scoreFlags", "updatedAt", "userId") SELECT "company", "coverLetterText", "createdAt", "humanizationScore", "id", "jobDescription", "jobTitle", "keywords", "resumeJSON", "scoreFlags", "updatedAt", "userId" FROM "TailoredResume";
DROP TABLE "TailoredResume";
ALTER TABLE "new_TailoredResume" RENAME TO "TailoredResume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
