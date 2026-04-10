import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const projectRoot = path.resolve(process.cwd());
loadEnvFile(path.join(projectRoot, ".env.local"));
loadEnvFile(path.join(projectRoot, ".env"));

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function getTableRowCount(tableName) {
  const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to query ${tableName}: ${error.message}`);
  }

  return count ?? 0;
}

async function main() {
  try {
    const memberCount = await getTableRowCount("member_records");
    const supportRows = await getTableRowCount("support_counter");
    const slotRows = await getTableRowCount("slot_counts");

    console.log("Supabase SQL-only setup check completed.");
    console.log(`member_records: ${memberCount} rows`);
    console.log(`support_counter: ${supportRows} rows`);
    console.log(`slot_counts: ${slotRows} rows`);

    if (supportRows === 0 || slotRows === 0) {
      console.log("Warning: Seed rows appear to be missing. Re-run supabase/schema.sql in Supabase SQL Editor.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${message}\n\nThe Supabase schema is not ready yet. Run supabase/schema.sql in the Supabase SQL editor, then rerun npm run db:setup.`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
