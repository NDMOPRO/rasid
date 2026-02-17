/**
 * Server-side CSV domain importer
 * This is used internally to import the 14K domains from the uploaded CSV
 */
import * as fs from 'fs';
import * as path from 'path';

export function parseCsvDomains(csvPath: string): string[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const domains: string[] = [];

  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
    for (const part of parts) {
      const cleaned = part.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();
      if (cleaned && cleaned.includes('.') && !cleaned.includes(' ') && cleaned.length > 3 && cleaned.length < 255) {
        domains.push(cleaned);
        break;
      }
    }
  }

  return Array.from(new Set(domains));
}
