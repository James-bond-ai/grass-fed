import { matchRecords } from '../data/match.mjs';
export function GET() {
  return new Response(JSON.stringify(matchRecords()), { headers: { 'Content-Type': 'application/json' } });
}
