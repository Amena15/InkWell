-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" DATETIME,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" DATETIME
);
INSERT INTO "new_users" ("created_at", "email", "email_verified", "id", "image", "name", "password", "reset_token", "reset_token_expiry", "updated_at", "verification_token") SELECT "created_at", "email", "email_verified", "id", "image", "name", "password", "reset_token", "reset_token_expiry", "updated_at", "verification_token" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
