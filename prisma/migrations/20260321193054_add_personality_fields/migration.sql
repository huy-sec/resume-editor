-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "linkedIn" TEXT NOT NULL DEFAULT '',
    "github" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "writingStyleExample" TEXT NOT NULL DEFAULT '',
    "mbti" TEXT NOT NULL DEFAULT '',
    "workStyle" TEXT NOT NULL DEFAULT '',
    "personalityAnswers" TEXT NOT NULL DEFAULT '{}',
    "careerMotivators" TEXT NOT NULL DEFAULT '[]',
    "communicationStyle" TEXT NOT NULL DEFAULT '',
    "personalBrand" TEXT NOT NULL DEFAULT '',
    "githubUrl" TEXT NOT NULL DEFAULT '',
    "linkedInUrl" TEXT NOT NULL DEFAULT '',
    "websiteUrl" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("email", "github", "githubUrl", "id", "linkedIn", "linkedInUrl", "location", "name", "phone", "summary", "userId", "website", "websiteUrl", "writingStyleExample") SELECT "email", "github", "githubUrl", "id", "linkedIn", "linkedInUrl", "location", "name", "phone", "summary", "userId", "website", "websiteUrl", "writingStyleExample" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
