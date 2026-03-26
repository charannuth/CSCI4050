/*
  Warnings:

  - You are about to drop the column `emailVerifyExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifyToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PendingEmailVerification" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "PendingEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingPasswordReset" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "PendingPasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Preserve only well-formed pairs (token + expiry both set). Orphan columns were invalid and are dropped.
INSERT INTO "PendingEmailVerification" ("userId", "token", "expiresAt")
SELECT "id", "emailVerifyToken", "emailVerifyExpires" FROM "User"
WHERE "emailVerifyToken" IS NOT NULL AND "emailVerifyExpires" IS NOT NULL;

INSERT INTO "PendingPasswordReset" ("userId", "token", "expiresAt")
SELECT "id", "passwordResetToken", "passwordResetExpires" FROM "User"
WHERE "passwordResetToken" IS NOT NULL AND "passwordResetExpires" IS NOT NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "firstName", "id", "lastName", "passwordHash", "phone", "role", "status", "tokenVersion", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "lastName", "passwordHash", "phone", "role", "status", "tokenVersion", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_status_idx" ON "User"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PendingEmailVerification_token_key" ON "PendingEmailVerification"("token");

-- CreateIndex
CREATE INDEX "PendingEmailVerification_token_idx" ON "PendingEmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PendingPasswordReset_token_key" ON "PendingPasswordReset"("token");

-- CreateIndex
CREATE INDEX "PendingPasswordReset_token_idx" ON "PendingPasswordReset"("token");
