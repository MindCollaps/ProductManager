import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { DeviceCategory } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const deviceCategories = [
  {
    name: "Smartphone",
    slug: "smartphone",
    description: "Mobile phones und ähnliche Geräte.",
    color: "#4F46E5",
  },
  {
    name: "Tablet",
    slug: "tablet",
    description: "Tablets und Hybrid-Geräte.",
    color: "#0EA5E9",
  },
  {
    name: "Laptop",
    slug: "laptop",
    description: "Notebooks und mobile Rechner.",
    color: "#22C55E",
  },
  {
    name: "Desktop-PC",
    slug: "desktop-pc",
    description: "Stationäre Rechner, Workstations und All-in-One-Geräte.",
    color: "#F97316",
  },
  {
    name: "Spielekonsole",
    slug: "spielekonsole",
    description: "Konsolen wie PlayStation, Xbox oder Nintendo-Geräte.",
    color: "#EC4899",
  },
  {
    name: "Audio / HiFi",
    slug: "audio-hifi",
    description: "Lautsprecher, Verstärker und Audiogeräte.",
    color: "#8B5CF6",
  },
  {
    name: "Sonstiges",
    slug: "sonstiges",
    description: "Für Geräte, die keiner festen Kategorie zugeordnet sind.",
    color: "#6B7280",
  },
];

const workItemTypes = [
  {
    name: "Diagnose",
    slug: "diagnose",
    description: "Fehlerbild prüfen, messen und eingrenzen.",
    color: "#2563EB",
    icon: "material-symbols:search",
    sortOrder: 10,
    isSystem: true,
  },
  {
    name: "Sichtprüfung",
    slug: "sichtpruefung",
    description: "Gerät äußerlich und intern auf Auffälligkeiten prüfen.",
    color: "#0EA5E9",
    icon: "material-symbols:visibility",
    sortOrder: 20,
    isSystem: true,
  },
  {
    name: "Löten",
    slug: "loeten",
    description: "Bauteile, Leiterbahnen oder Anschlüsse löten.",
    color: "#F97316",
    icon: "material-symbols:precision-manufacturing",
    sortOrder: 30,
    isSystem: true,
  },
  {
    name: "Teileaustausch",
    slug: "teileaustausch",
    description: "Defekte Komponenten durch Ersatzteile ersetzen.",
    color: "#22C55E",
    icon: "material-symbols:components-exchange",
    sortOrder: 40,
    isSystem: true,
  },
  {
    name: "Batteriewechsel",
    slug: "batteriewechsel",
    description: "Akkus oder Batterien ersetzen.",
    color: "#EAB308",
    icon: "material-symbols:battery-charging-full",
    sortOrder: 50,
    isSystem: true,
  },
  {
    name: "Reinigung",
    slug: "reinigung",
    description: "Staub, Schmutz oder Flüssigkeitsschäden behandeln.",
    color: "#14B8A6",
    icon: "material-symbols:sanitize",
    sortOrder: 60,
    isSystem: true,
  },
  {
    name: "Software / Firmware",
    slug: "software-firmware",
    description: "Softwareprobleme, Updates oder Wiederherstellungen durchführen.",
    color: "#8B5CF6",
    icon: "material-symbols:code",
    sortOrder: 70,
    isSystem: true,
  },
  {
    name: "Testen",
    slug: "testen",
    description: "Abschließende Funktionstests und Kontrolle.",
    color: "#64748B",
    icon: "material-symbols:check-circle",
    sortOrder: 80,
    isSystem: true,
  },
  {
    name: "Custom",
    slug: "custom",
    description: "Freier Arbeitsschritt für individuelle Fälle.",
    color: "#111827",
    icon: "material-symbols:add",
    sortOrder: 90,
    isSystem: false,
  },
];

async function main() {
  for (const category of deviceCategories) {
    await prisma.deviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        color: category.color,
      },
      create: category,
    });
  }

  for (const workItemType of workItemTypes) {
    await prisma.workItemType.upsert({
      where: { slug: workItemType.slug },
      update: {
        name: workItemType.name,
        description: workItemType.description,
        color: workItemType.color,
        icon: workItemType.icon,
        sortOrder: workItemType.sortOrder,
        isSystem: workItemType.isSystem,
        isActive: true,
      },
      create: workItemType,
    });
  }

  console.log(`Seeded ${deviceCategories.length} device categories and ${workItemTypes.length} work item types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });