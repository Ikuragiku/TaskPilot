/**
 * Script: importRecipesFromCsv.ts
 *
 * Imports recipes from embedded CSV content (provided externally) into the database
 * for the test user (username: 'baxxter'). It creates recipe items and assigns
 * general supermarket-style categories using heuristic mapping.
 *
 * Run with:
 *   npx tsx prisma/importRecipesFromCsv.ts
 */
import prisma from '../src/prismaClient';

const CSV = `Rezeptname,Zutat,Menge,Einheit,Zubereitung
Hähnchenbrust aus dem Ofen,Hähnchenbrustfilet,300,g,"Ofen auf 200°C vorheizen. Hähnchen und Gemüse mit Öl, Salz, Pfeffer und Kräutern mischen. Ca. 30 Min. garen. Reis kochen und dazu servieren."
Hähnchenbrust aus dem Ofen,Kartoffeln,400,g,Beilage, mit Öl und Gewürzen geröstet
Hähnchenbrust aus dem Ofen,Karotten,150,g,Beilage, geröstet
Hähnchenbrust aus dem Ofen,Paprika,100,g,Beilage, geröstet (Achtung Blähungen!)
Hähnchenbrust aus dem Ofen,Zwiebel (fein gehackt),30,g,Optional (Achtung Blähungen!)
Hähnchenbrust aus dem Ofen,Olivenöl,2,EL,Zum Marinieren
Hähnchenbrust aus dem Ofen,Vollkornreis (roh),100,g,Als Beilage
Chili con Carne,Mageres Rinderhack,250,g,"Hackfleisch anbraten. Zwiebeln/Knoblauch (oder Knoblauch-Öl) und Gewürze hinzufügen. Tomaten, Bohnen und Mais zugeben, ca. 20-30 Min. köcheln lassen."
Chili con Carne,Zwiebel (gehackt),50,g,Achtung Blähungen!
Chili con Carne,Knoblauch (fein),1,Zehe,Achtung Blähungen!
Chili con Carne,Kidneybohnen (Dose),200,g,Abgetropft und gespült (Achtung Blähungen!)
Chili con Carne,Mais (Dose),100,g,Abgetropft (Achtung Blähungen!)
Chili con Carne,Passierte Tomaten,400,g,Flüssige Basis
Chili con Carne,Chili/Kreuzkümmel/Oregano,1,TL,Gewürze
Gebratene Putenstreifen,Putenbrustfilet,300,g,"Kartoffeln kochen und zu Püree verarbeiten (mit Milch/Muskat). Putenstreifen braten. Brokkoli dämpfen/kochen. Alles anrichten."
Gebratene Putenstreifen,Kartoffeln (mehlig),400,g,Für Püree
Gebratene Putenstreifen,Brokkoli,200,g,Gedämpft/gekocht (Achtung Blähungen!)
Gebratene Putenstreifen,Milch (laktosefrei),50,ml,Für Püree
Gebratene Putenstreifen,Salz/Pfeffer/Muskat,Nach Geschmack,Gewürze
Vollkornnudeln mit Hackfleisch,Vollkornnudeln,150,g,"Hackfleisch anbraten, Karotten/Zucchini/Paprika (klein geschnitten) und Tomaten zugeben. Ohne Zwiebel/Knoblauch (oder mit Knoblauch-Öl) ca. 20 Min. köcheln lassen."
Vollkornnudeln mit Hackfleisch,Mageres Hackfleisch,250,g,Rind/Gemischt
Vollkornnudeln mit Hackfleisch,Karotten,100,g,Fein gewürfelt/gerieben
Vollkornnudeln mit Hackfleisch,Zucchini,100,g,Gewürfelt
Vollkornnudeln mit Hackfleisch,Paprika,50,g,Gewürfelt (Achtung Blähungen!)
Vollkornnudeln mit Hackfleisch,Passierte Tomaten,400,g,Soßenbasis
Vollkornnudeln mit Hackfleisch,Basilikum/Oregano,1,TL,Gewürze
Selbstgemachte Wraps,Hähnchen/Putenbrust,200,g,"Hähnchen braten/kochen, würfeln. Salat, Tomaten und Paprika schneiden. Alles mit Bohnen in den Wrap füllen."
Selbstgemachte Wraps,Vollkorn-Wraps,4,Stück,Basis
Selbstgemachte Wraps,Kidneybohnen (Dose),100,g,Abgetropft (Achtung Blähungen!)
Selbstgemachte Wraps,Römersalat,50,g,Grob geschnitten
Selbstgemachte Wraps,Tomaten,100,g,Gewürfelt
Selbstgemachte Wraps,Paprika,50,g,Gewürfelt (Achtung Blähungen!)
Linsensuppe,Rote Linsen,100,g,"Linsen mit Brühe, Karotten, Sellerie (klein), Tomaten und Gewürzen kochen, bis sie weich sind (ca. 25-30 Min.). Fleisch/Tofu in Würfel schneiden, kurz vor Schluss zugeben."
Linsensuppe,Gemüsebrühe,750,ml,Flüssige Basis
Linsensuppe,Karotten,100,g,Gewürfelt
Linsensuppe,Sellerie,50,g,Gewürfelt (Achtung Blähungen!)
Linsensuppe,Tomaten (Stückig),200,g,Aus der Dose
Linsensuppe,Fleisch (z.B. Schinken) oder Tofu,100,g,Proteinquelle
Linsensuppe,Gewürze (Lorbeer, Kreuzkümmel),1,Prise,Achtung Linsen/Kreuzkümmel Blähungen!
Mageres Rindfleisch mit Süßkartoffel,Rinderhüftsteak,250,g,"Steak braten. Süßkartoffel würfeln, rösten oder gekocht. Bauchfreundliches Gemüse (Karotten, Zucchini, etc.) dämpfen. Alles anrichten."
Mageres Rindfleisch mit Süßkartoffel,Süßkartoffel,300,g,Als Beilage, geröstet oder gekocht
Mageres Rindfleisch mit Süßkartoffel,Bauchfreundliches Gemüse,200,g,Z.B. Karotten, gedämpfte Zucchini
Mageres Rindfleisch mit Süßkartoffel,Olivenöl,1,EL,Zum Braten/Rösten
Mediterrane Rinder-Hackfleisch-Pfanne,Mageres Hackfleisch,250,g,"Hackfleisch anbraten. Zucchini und passierte Tomaten zugeben. Mit Oregano/Basilikum würzen. Ohne Zwiebel/Knoblauch ca. 15 Min. köcheln. Mit Reis servieren."
Mediterrane Rinder-Hackfleisch-Pfanne,Zucchini,200,g,Gewürfelt
Mediterrane Rinder-Hackfleisch-Pfanne,Passierte Tomaten,200,g,Für Soße
Mediterrane Rinder-Hackfleisch-Pfanne,Reis (roh),100,g,Als Beilage
Mediterrane Rinder-Hackfleisch-Pfanne,Oregano/Basilikum,1,TL,Gewürze
Mediterraner Hähnchen-Reis-Salat,Hähnchenbrustfilet,200,g,"Hähnchen braten/kochen, würfeln. Gekochten, abgekühlten Reis mit gewürfelten Gurken/Tomaten/Paprika und Hähnchen mischen. Dressing aus Öl/Zitrone."
Mediterraner Hähnchen-Reis-Salat,Reis (roh),100,g,Kalt als Basis
Mediterraner Hähnchen-Reis-Salat,Gurke,100,g,Gewürfelt
Mediterraner Hähnchen-Reis-Salat,Tomaten,100,g,Gewürfelt
Mediterraner Hähnchen-Reis-Salat,Paprika,50,g,Gewürfelt (Achtung Blähungen!)
Mediterraner Hähnchen-Reis-Salat,Olivenöl/Zitronensaft,1,EL,Für das Dressing
Puten-Gulasch mit Dinkel-Nudeln,Putenbrust (Gulasch),300,g,"Pute anbraten, mit Brühe ablöschen. Karotten/Sellerie/Paprika und Gewürze (Majoran, Paprika) zugeben. Ca. 30 Min. schmoren. Mit gekochten Nudeln servieren."
Puten-Gulasch mit Dinkel-Nudeln,Dinkel-Vollkornnudeln,150,g,Beilage (oft verträglicher als Weizen)
Puten-Gulasch mit Dinkel-Nudeln,Karotten,100,g,Gewürfelt
Puten-Gulasch mit Dinkel-Nudeln,Paprika,50,g,Gewürfelt (Achtung Blähungen!)
Puten-Gulasch mit Dinkel-Nudeln,Gemüsebrühe,300,ml,Flüssige Basis
Puten-Gulasch mit Dinkel-Nudeln,Paprikapulver/Majoran,1,TL,Gewürze
Gefüllte Paprika mit Rinderhack,Paprika (groß),2,Stück,"Paprika halbieren, entkernen. Hackfleisch mit gekochtem Reis/Quinoa und etwas Tomate mischen, würzen. Paprika füllen und im Ofen ca. 30-40 Min. backen."
Gefüllte Paprika mit Rinderhack,Mageres Hackfleisch,200,g,Rind
Gefüllte Paprika mit Rinderhack,Reis/Quinoa (gekocht),150,g,Als Füllung
Gefüllte Paprika mit Rinderhack,Passierte Tomaten,100,g,In die Füllung
Gefüllte Paprika mit Rinderhack,Oregano/Salz/Pfeffer,Nach Geschmack,Gewürze`;

interface CsvRow { recipe: string; ingredient: string; amount: string; unit: string; note: string; }

function parseCsv(): CsvRow[] {
  const lines = CSV.trim().split(/\r?\n/);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // naive CSV split handling quoted description containing commas
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    parts.push(current.trim());
    while (parts.length < 5) parts.push('');
    rows.push({ recipe: parts[0], ingredient: parts[1], amount: parts[2], unit: parts[3], note: parts[4] });
  }
  return rows;
}

// General supermarket-style recipe categories
const CATEGORY_CANDIDATES = [
  'Fleisch',
  'Gemüse',
  'Hülsenfrüchte',
  'Getreide & Backwaren',
  'Gewürze & Kräuter',
  'Öl',
  'Milchprodukte',
];

function classifyIngredient(ing: string): string | null {
  const lower = ing.toLowerCase();
  if (/hähnchen|puten|rinder|rind|steak|fleisch|hackfleisch|schinken|brust/.test(lower)) return 'Fleisch';
  if (/kartoffel|karotte|paprika|zwiebel|brokkoli|gurke|sellerie|süßkartoffel|salat|gemüse/.test(lower)) return 'Gemüse';
  if (/kidneybohnen|bohnen|linse|linsen|quinoa/.test(lower)) return 'Hülsenfrüchte';
  if (/reis|vollkornreis|nudel|vollkornnudel|dinkel|wrap|brot|mehl/.test(lower)) return 'Getreide & Backwaren';
  if (/chili|kreuzkümmel|oregano|basilikum|salz|pfeffer|muskat|lorbeer|paprika|majoran|gewürz/.test(lower)) return 'Gewürze & Kräuter';
  if (/olivenöl|öl|zitronensaft/.test(lower)) return 'Öl';
  if (/milch|käse|yogurt|butter|rahm|sahne/.test(lower)) return 'Milchprodukte';
  return null;
}

async function ensureRecipeCategory(value: string): Promise<string> {
  const existing = await prisma.recipeCategory.findFirst({ where: { value } });
  if (existing) return existing.id;
  const created = await prisma.recipeCategory.create({ data: { value, color: '#cccccc' } });
  return created.id;
}

async function main() {
  console.log('Starting recipe CSV import...');
  const user = await prisma.user.findFirst({ where: { username: 'baxxter' } });
  if (!user) {
    console.error('User "baxxter" not found. Seed the database first.');
    process.exit(1);
  }

  // Ensure base categories exist
  const categoryIdsMap: Record<string, string> = {};
  for (const cat of CATEGORY_CANDIDATES) {
    categoryIdsMap[cat] = await ensureRecipeCategory(cat);
  }

  const rows = parseCsv();
  const grouped: Record<string, CsvRow[]> = {};
  for (const r of rows) {
    if (!grouped[r.recipe]) grouped[r.recipe] = [];
    grouped[r.recipe].push(r);
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const [recipeName, entries] of Object.entries(grouped)) {
    const existing = await prisma.recipe.findFirst({ where: { title: recipeName, userId: user.id } });
    if (existing) {
      console.log(`Skipping existing recipe: ${recipeName}`);
      skippedCount++;
      continue;
    }
    const description = Array.from(new Set(entries.map(e => e.note).filter(Boolean))).join('\n');
    const itemNames = entries.map(e => {
      const qty = (e.amount ? e.amount : '') + (e.unit ? e.unit : '');
      const combined = `${e.ingredient}${qty ? ' ' + qty : ''}`.trim();
      return combined;
    });

    // Collect categories for this recipe
    const catValues = Array.from(new Set(entries.map(e => classifyIngredient(e.ingredient)).filter(Boolean))) as string[];
    const recipeCategoryIds = catValues.map(v => categoryIdsMap[v]);

    await prisma.$transaction(async (tx) => {
      const created = await tx.recipe.create({ data: { title: recipeName, description, userId: user.id } });
      if (itemNames.length) {
        await tx.recipeItem.createMany({ data: itemNames.map((name, idx) => ({ recipeId: created.id, name, order: idx })) });
      }
      if (recipeCategoryIds.length) {
        await tx.recipeCategoryAssignment.createMany({ data: recipeCategoryIds.map(cid => ({ recipeId: created.id, recipeCategoryId: cid })) });
      }
    });
    console.log(`Imported recipe: ${recipeName} (${itemNames.length} items, ${recipeCategoryIds.length} categories)`);
    createdCount++;
  }

  console.log(`Import complete. Created: ${createdCount}, Skipped (already existed): ${skippedCount}`);
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
