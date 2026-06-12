import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

const deviceCategories = [
    {
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Mobile phones und ähnliche Geräte.',
        color: '#4F46E5',
    },
    {
        name: 'Tablet',
        slug: 'tablet',
        description: 'Tablets und Hybrid-Geräte.',
        color: '#0EA5E9',
    },
    {
        name: 'Laptop',
        slug: 'laptop',
        description: 'Notebooks und mobile Rechner.',
        color: '#22C55E',
    },
    {
        name: 'Desktop-PC',
        slug: 'desktop-pc',
        description: 'Stationäre Rechner, Workstations und All-in-One-Geräte.',
        color: '#F97316',
    },
    {
        name: 'Spielekonsole',
        slug: 'spielekonsole',
        description: 'Konsolen wie PlayStation, Xbox oder Nintendo-Geräte.',
        color: '#EC4899',
    },
    {
        name: 'Audio / HiFi',
        slug: 'audio-hifi',
        description: 'Lautsprecher, Verstärker und Audiogeräte.',
        color: '#8B5CF6',
    },
    {
        name: 'Sonstiges',
        slug: 'sonstiges',
        description: 'Für Geräte, die keiner festen Kategorie zugeordnet sind.',
        color: '#6B7280',
    },
];

const workItemTypes = [
    {
        name: 'Diagnose',
        slug: 'diagnose',
        description: 'Fehlerbild prüfen, messen und eingrenzen.',
        color: '#2563EB',
        icon: 'material-symbols:search',
        sortOrder: 10,
        isSystem: true,
    },
    {
        name: 'Sichtprüfung',
        slug: 'sichtpruefung',
        description: 'Gerät äußerlich und intern auf Auffälligkeiten prüfen.',
        color: '#0EA5E9',
        icon: 'material-symbols:visibility',
        sortOrder: 20,
        isSystem: true,
    },
    {
        name: 'Löten',
        slug: 'loeten',
        description: 'Bauteile, Leiterbahnen oder Anschlüsse löten.',
        color: '#F97316',
        icon: 'material-symbols:precision-manufacturing',
        sortOrder: 30,
        isSystem: true,
    },
    {
        name: 'Teileaustausch',
        slug: 'teileaustausch',
        description: 'Defekte Komponenten durch Ersatzteile ersetzen.',
        color: '#22C55E',
        icon: 'material-symbols:components-exchange',
        sortOrder: 40,
        isSystem: true,
    },
    {
        name: 'Batteriewechsel',
        slug: 'batteriewechsel',
        description: 'Akkus oder Batterien ersetzen.',
        color: '#EAB308',
        icon: 'material-symbols:battery-charging-full',
        sortOrder: 50,
        isSystem: true,
    },
    {
        name: 'Reinigung',
        slug: 'reinigung',
        description: 'Staub, Schmutz oder Flüssigkeitsschäden behandeln.',
        color: '#14B8A6',
        icon: 'material-symbols:sanitize',
        sortOrder: 60,
        isSystem: true,
    },
    {
        name: 'Software / Firmware',
        slug: 'software-firmware',
        description: 'Softwareprobleme, Updates oder Wiederherstellungen durchführen.',
        color: '#8B5CF6',
        icon: 'material-symbols:code',
        sortOrder: 70,
        isSystem: true,
    },
    {
        name: 'Testen',
        slug: 'testen',
        description: 'Abschließende Funktionstests und Kontrolle.',
        color: '#64748B',
        icon: 'material-symbols:check-circle',
        sortOrder: 80,
        isSystem: true,
    },
    {
        name: 'Custom',
        slug: 'custom',
        description: 'Freier Arbeitsschritt für individuelle Fälle.',
        color: '#111827',
        icon: 'material-symbols:add',
        sortOrder: 90,
        isSystem: false,
    },
];

const brands: string[] = [
    'Apple',
    'Samsung',
    'Google',
    'Huawei',
    'Oneplus',
    'Xiaomi',
    'Bosch',
    'Siemens',
    'Audi',
    'BMW',
    'HP',
    'XBox',
    'Playstation',
    'Nintendo',
];

const devices = [
    {
        name: 'iPhone 16',
        description: 'Aktuelles Apple-Standardmodell mit großem Display und A18-Chip.',
        brandName: 'Apple',
        purchaseValue: 949,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'iPhone 16 Plus',
        description: 'Apple-Plus-Modell mit größerem Display und längerer Laufzeit.',
        brandName: 'Apple',
        purchaseValue: 1099,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'iPhone 16 Pro',
        description: 'Apple Pro-Modell für Premium-Reparaturen und Diagnosen.',
        brandName: 'Apple',
        purchaseValue: 1199,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'iPhone 16 Pro Max',
        description: 'Apple-Topmodell mit großem Display und maximaler Ausstattung.',
        brandName: 'Apple',
        purchaseValue: 1449,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'Galaxy S25',
        description: 'Aktuelles Samsung-Flaggschiff im kompakten Format.',
        brandName: 'Samsung',
        purchaseValue: 949,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'Galaxy S25+',
        description: 'Samsung-Plus-Modell mit größerem Display und stärkerem Akku.',
        brandName: 'Samsung',
        purchaseValue: 1149,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'Galaxy S25 Ultra',
        description: 'Samsung-Topmodell für High-End-Fälle und komplexe Reparaturen.',
        brandName: 'Samsung',
        purchaseValue: 1449,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'Galaxy Z Fold6',
        description: 'Faltbares Samsung-Gerät mit innenliegendem Hauptdisplay.',
        brandName: 'Samsung',
        purchaseValue: 1899,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'Galaxy Z Flip6',
        description: 'Komfortables Samsung-Clamshell-Foldable mit flexiblem Scharnier.',
        brandName: 'Samsung',
        purchaseValue: 1199,
        categorySlugs: ['smartphone'],
    },
    {
        name: 'Nintendo Switch',
        description: 'Klassische Hybrid-Konsole von Nintendo.',
        brandName: 'Nintendo',
        purchaseValue: 299,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Nintendo Switch OLED',
        description: 'Switch-Variante mit OLED-Display und verbessertem Dock.',
        brandName: 'Nintendo',
        purchaseValue: 349,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Nintendo Switch 2',
        description: 'Nachfolger der Switch für aktuelle Nintendo-Konsolenfälle.',
        brandName: 'Nintendo',
        purchaseValue: 449,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Xbox One',
        description: 'Microsoft-Konsole der vorherigen Generation.',
        brandName: 'XBox',
        purchaseValue: 249,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Xbox One S',
        description: 'Kompaktere Xbox-One-Variante mit überarbeitetem Gehäuse.',
        brandName: 'XBox',
        purchaseValue: 279,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Xbox One X',
        description: 'Leistungsstärkere Xbox-One-Variante für 4K-Fälle.',
        brandName: 'XBox',
        purchaseValue: 349,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Xbox Series S',
        description: 'Kompakte aktuelle Xbox-Konsole ohne Laufwerk.',
        brandName: 'XBox',
        purchaseValue: 299,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'Xbox Series X',
        description: 'Aktuelles Xbox-Topmodell mit Laufwerk und hoher Leistung.',
        brandName: 'XBox',
        purchaseValue: 549,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'PlayStation 4',
        description: 'Klassische Sony-Konsole der vorherigen Generation.',
        brandName: 'Playstation',
        purchaseValue: 199,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'PlayStation 4 Pro',
        description: 'Leistungsstärkere PS4-Variante für UHD-Fälle.',
        brandName: 'Playstation',
        purchaseValue: 249,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'PlayStation 5',
        description: 'Aktuelle Sony-Konsole mit Laufwerk.',
        brandName: 'Playstation',
        purchaseValue: 549,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'PlayStation 5 Slim',
        description: 'Kompaktere PlayStation-5-Variante.',
        brandName: 'Playstation',
        purchaseValue: 499,
        categorySlugs: ['spielekonsole'],
    },
    {
        name: 'PlayStation 5 Pro',
        description: 'Premium-PlayStation-5-Modell für High-End-Reparaturen.',
        brandName: 'Playstation',
        purchaseValue: 699,
        categorySlugs: ['spielekonsole'],
    },
];

async function main() {
    const deviceCategoryBySlug = new Map<string, { id: string }>();

    for (const category of deviceCategories) {
        const storedCategory = await prisma.deviceCategory.upsert({
            where: { slug: category.slug },
            update: {
                name: category.name,
                description: category.description,
                color: category.color,
            },
            create: category,
        });

        deviceCategoryBySlug.set(storedCategory.slug, storedCategory);
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

    const deviceBrandByName = new Map<string, { id: string }>();

    for (const brand of brands) {
        const storedBrand = await prisma.deviceBrand.upsert({
            where: { name: brand },
            update: {
                name: brand,
            },
            create: {
                name: brand,
            },
        });

        deviceBrandByName.set(storedBrand.name, storedBrand);
    }

    for (const device of devices) {
        const brand = deviceBrandByName.get(device.brandName);

        if (!brand) {
            throw new Error(`Missing device brand: ${ device.brandName }`);
        }

        const storedDevice = await prisma.device.upsert({
            where: { name: device.name },
            update: {
                description: device.description,
                purchaseValue: device.purchaseValue,
                deviceBrandId: brand.id,
            },
            create: {
                name: device.name,
                description: device.description,
                purchaseValue: device.purchaseValue,
                deviceBrandId: brand.id,
            },
        });

        await prisma.deviceCategories.deleteMany({
            where: {
                deviceId: storedDevice.id,
            },
        });

        await prisma.deviceCategories.createMany({
            data: device.categorySlugs.map(categorySlug => {
                const category = deviceCategoryBySlug.get(categorySlug);

                if (!category) {
                    throw new Error(`Missing device category: ${ categorySlug }`);
                }

                return {
                    deviceId: storedDevice.id,
                    categoryId: category.id,
                };
            }),
        });
    }

    console.log(
        `Seeded ${ deviceCategories.length } device categories, ${ workItemTypes.length } work item types, ${ brands.length } brands and ${ devices.length } devices.`,
    );
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
