import fs from "fs";
function loadEnv() { for (const line of fs.readFileSync(".env.local","utf8").split("\n")) { const t=line.trim(); if(!t||t.startsWith("#")) continue; const eq=t.indexOf("="); if(eq<0) continue; const k=t.slice(0,eq).trim(); let v=t.slice(eq+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1); if(!(k in process.env)) process.env[k]=v; } }
(async () => {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: { query: (q: string) => Promise<{ rows: Record<string, unknown>[] }> } }).pool;
  const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='media' AND table_schema='public' ORDER BY ordinal_position");
  console.log("media columns:", cols.rows.map(r => r.column_name).join(", "));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
