import { JWT } from "google-auth-library";

let client: JWT | null = null;

function getClient(): JWT {
  if (client) return client;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY are not set",
    );
  }

  client = new JWT({
    email,
    key: privateKey,
    // Read-only: the sync never writes back to the sheet (Section 2 — the
    // Sheet is the input mechanism only; Postgres is authoritative after).
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return client;
}

/**
 * Fetches a sheet range as rows of raw string cells. `range` is an A1
 * notation range, e.g. "Providers!A2:AC" (starting at row 2 to skip headers).
 */
export async function fetchSheetRows(spreadsheetId: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await getClient().request<{ values?: string[][] }>({ url });
  return res.data.values ?? [];
}
