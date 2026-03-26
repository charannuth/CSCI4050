-- CreateIndex (IF NOT EXISTS: index may already exist from prisma db push / prior apply)
CREATE INDEX IF NOT EXISTS "UserFavorite_userId_idx" ON "UserFavorite"("userId");
