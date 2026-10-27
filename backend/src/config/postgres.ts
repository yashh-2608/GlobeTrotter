import { supabaseCa } from "./supabase-ca.js"

export function postgresConfig(connectionString: string) {
  const url = new URL(connectionString)
  if (url.hostname.endsWith(".supabase.com") || url.hostname.endsWith(".supabase.co")) {
    // pg's URL SSL parameters override an explicit SSL object. Keep certificate
    // and hostname verification enabled with Supabase's published root CA.
    for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key)
    return { connectionString: url.toString(), ssl: { ca: supabaseCa, rejectUnauthorized: true }, connectionTimeoutMillis: 15000 }
  }
  return { connectionString, connectionTimeoutMillis: 15000 }
}
