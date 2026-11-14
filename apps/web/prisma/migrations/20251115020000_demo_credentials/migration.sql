-- Demo credential store for DEMO_AUTH password login (not a production IdP).
CREATE TABLE "DemoCredential" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "staffRole" "StaffRole",
    "displayName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DemoCredential_email_key" ON "DemoCredential"("email");
