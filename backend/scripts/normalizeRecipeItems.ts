/**
 * normalizeRecipeItems.ts
 *
 * Reworks all recipe item names into the pattern:
 *   <amount+unit> <product name>
 * Removing extra / non-essential info (parentheses content, 'Achtung' warnings, trailing notes).
 * Keeps slash-separated multi-ingredients intact (e.g., Oregano/Basilikum).
 *
 * Rules:
 * 1. Detect trailing amount+unit cluster at end of string (e.g., 300g, 2EL, 1TL, 4Stück, 50ml, 1Prise, 1Zehe).
 * 2. Remove parentheses and their content anywhere in the product part.
 * 3. Remove substrings starting with 'Achtung' to end.
 * 4. If formatting is currently '<product> <amountUnit>' convert to '<amountUnit> <product>'.
 * 5. If no recognizable trailing amount, leave entry unchanged.
 * 6. Collapse multiple spaces and trim.
 *
 * Run with:
 *   npx tsx scripts/normalizeRecipeItems.ts
 */
import prisma from '../src/prismaClient';

// Regex for trailing amount+unit tokens (joined like '300g', '2EL', '1TL', '4Stück', '50ml', '1Prise', '1Zehe')
const TRAILING_QTY_RE = /(\d+(?:[.,]\d+)?\s*(?:g|kg|ml|l|EL|TL|Stück|Zehe|Prise))$/i;

// Sanitize product part: remove parentheses, 'Achtung' warnings, extra commas.
function cleanProduct(raw: string): string {
  let p = raw;
  // Remove 'Achtung' and everything after
  p = p.replace(/Achtung.*$/i, '').trim();
  // Remove parentheses content
  p = p.replace(/\([^)]*\)/g, '').trim();
  // Remove stray quotes
  p = p.replace(/"/g, '').trim();
  // Remove double spaces
  p = p.replace(/\s{2,}/g, ' ').trim();
  // Remove trailing commas / punctuation
  p = p.replace(/[,:;]+$/g, '').trim();
  // Simple canonical replacements (optionally extend)
  p = p.replace(/Hähnchenbrustfilet/i, 'Hähnchenbrust')
       .replace(/Putenbrustfilet/i, 'Putenbrust')
       .replace(/Mageres Rinderhack/i, 'Rinderhack')
       .replace(/Mageres Hackfleisch/i, 'Hackfleisch')
       .replace(/Rinderhüftsteak/i, 'Rindersteak');
  return p;
}

function normalize(name: string): { original: string; normalized: string; changed: boolean } {
  const trimmed = name.trim();
  const match = trimmed.match(TRAILING_QTY_RE);
  if (!match) {
    return { original: name, normalized: name.trim(), changed: false };
  }
  const amountUnit = match[1].replace(/\s+/g, ''); // ensure joined (e.g., '2 EL' -> '2EL') if any stray space
  const productPart = trimmed.slice(0, trimmed.length - match[0].length).trim();
  const cleanedProduct = cleanProduct(productPart);
  const normalized = `${amountUnit} ${cleanedProduct}`.trim();
  if (normalized === name) return { original: name, normalized, changed: false };
  return { original: name, normalized, changed: true };
}

async function main() {
  console.log('Normalizing recipe items...');
  const items = await prisma.recipeItem.findMany();
  let updates = 0;
  for (const item of items) {
    const { normalized, changed } = normalize(item.name);
    if (changed) {
      await prisma.recipeItem.update({ where: { id: item.id }, data: { name: normalized } });
      updates++;
      console.log(`Updated: '${item.name}' -> '${normalized}'`);
    }
  }
  console.log(`Normalization complete. Updated ${updates} of ${items.length} items.`);
}

main().catch(err => {
  console.error('Normalization failed:', err);
  process.exit(1);
});
