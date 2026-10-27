import "dotenv/config"
import { defineConfig, env } from "prisma/config"
import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { supabaseCa } from "./src/config/supabase-ca"

const databaseUrl = new URL(process.env.DIRECT_URL ?? env("DATABASE_URL"))
if (databaseUrl.hostname.endsWith(".supabase.com") || databaseUrl.hostname.endsWith(".supabase.co")) {
  const certificate = join(tmpdir(), "globetrotter-supabase-ca.crt")
  writeFileSync(certificate, supabaseCa)
  databaseUrl.searchParams.set("sslcert", certificate)
  databaseUrl.searchParams.set("sslmode", "verify-full")
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl.toString(),
  },
})
