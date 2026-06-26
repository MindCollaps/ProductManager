import bcrypt from 'bcrypt';
import { RepairRequestStatus, RepairStatus, RepairWorkItemStatus, PartOrderStatus } from '@prisma/client';
import type { WorkItemType, RepairWorkItem } from '@prisma/client';

import { prisma } from '~~/server/utils/prisma';

const DEMO_USERNAME = 'demo';
const DEMO_EMAIL = 'demo@demo.local';
const DEMO_PASSWORD = 'demo';

function daysAgo(days: number, offsetHours = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - offsetHours);
    return d;
}

interface StatusHistorySeed {
    status: RepairStatus;
    startedAt: Date;
    endedAt: Date | null;
    durationMinutes: number | null;
}

async function seedStatusHistory(requestId: string, deviceId: string, entries: StatusHistorySeed[]): Promise<void> {
    for (const entry of entries) {
        await prisma.repairStatusHistory.create({
            data: { requestId, deviceId, ...entry },
        });
    }
}

interface WorkItemSeed {
    slug: string;
    title: string;
    orderIndex: number;
    status: RepairWorkItemStatus;
    laborMinutes: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

async function seedWorkItems(
    requestId: string,
    deviceId: string,
    types: Map<string, WorkItemType>,
    seeds: WorkItemSeed[],
): Promise<Map<string, RepairWorkItem>> {
    const created = await Promise.all(seeds.map(seed => {
        const type = types.get(seed.slug);
        if (!type) {
            throw new Error(`[Demo] Unknown work item type slug: ${ seed.slug }`);
        }

        return prisma.repairWorkItem.create({
            data: {
                requestId,
                deviceId,
                workItemTypeId: type.id,
                title: seed.title,
                orderIndex: seed.orderIndex,
                status: seed.status,
                laborMinutes: seed.laborMinutes,
                completedAt: seed.completedAt,
                createdAt: seed.createdAt,
                updatedAt: seed.updatedAt,
            },
        });
    }));

    return new Map(seeds.map((seed, index) => [seed.slug, created[index]!]));
}

export async function applyDemoSeed(): Promise<void> {
    const existing = await prisma.demoData.findUnique({ where: { id: 'singleton' } });
    if (existing) {
        return;
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const demoUser = await prisma.user.upsert({
        where: { username: DEMO_USERNAME },
        update: { isActive: true, email: DEMO_EMAIL, passwordHash },
        create: {
            username: DEMO_USERNAME,
            email: DEMO_EMAIL,
            passwordHash,
            role: 'CUSTOMER',
            isActive: true,
        },
    });

    const [displayPart, batteryPart, hdmiPart] = await Promise.all([
        prisma.partCatalog.create({
            data: {
                name: 'iPhone 16 Display (OEM)',
                manufacturer: 'Apple',
                sku: 'DISP-IP16-OEM',
                description: 'Original-Display für iPhone 16, vollständige Baugruppe mit Touchglas.',
                unitCost: 89,
                retailPrice: 149,
            },
        }),
        prisma.partCatalog.create({
            data: {
                name: 'iPhone 16 Pro Max Akku',
                manufacturer: 'Apple',
                sku: 'BAT-IP16PM',
                description: 'Originalakku für iPhone 16 Pro Max, 4685 mAh.',
                unitCost: 45,
                retailPrice: 79,
            },
        }),
        prisma.partCatalog.create({
            data: {
                name: 'PS5 HDMI 2.0 Port',
                manufacturer: 'Sony',
                sku: 'HDMI-PS5-V2',
                description: 'HDMI-2.0-Buchse für PlayStation 5, kompatibel mit allen Revisionen.',
                unitCost: 8,
                retailPrice: 18,
            },
        }),
    ]);

    const [ip16Device, ip16pmDevice, ps5Device] = await Promise.all([
        prisma.device.findUnique({ where: { name: 'iPhone 16' } }),
        prisma.device.findUnique({ where: { name: 'iPhone 16 Pro Max' } }),
        prisma.device.findUnique({ where: { name: 'PlayStation 5' } }),
    ]);

    const workItemTypes = await prisma.workItemType.findMany({
        where: { slug: { in: ['eingang', 'sichtpruefung', 'diagnose', 'teileaustausch', 'batteriewechsel', 'loeten', 'testen', 'ausgang'] } },
    });
    const wit = new Map(workItemTypes.map(t => [t.slug, t]));

    const requestIds: string[] = [];
    const partIds = [displayPart.id, batteryPart.id, hdmiPart.id];

    // ─── Scenario 1: iPhone 16 – Kaputtes Display (IN_REPAIR) ───────────────────
    {
        const req = await prisma.repairRequest.create({
            data: {
                customerId: demoUser.id,
                status: RepairRequestStatus.ACCEPTED,
                subject: 'Display kaputt – iPhone 16',
                deviceName: 'iPhone 16',
                deviceBrand: 'Apple',
                deviceModel: 'iPhone 16',
                problemDescription: 'Das Display hat einen Riss und reagiert nicht mehr auf Touch-Eingaben.',
                alreadyTried: 'Neustart versucht, hat nichts gebracht.',
                suspectedIssue: 'Displaybruch durch Sturz.',
                acceptedAt: daysAgo(7),
                createdAt: daysAgo(8),
                updatedAt: daysAgo(7),
            },
        });
        requestIds.push(req.id);

        const repairDevice = await prisma.repairDevice.create({
            data: {
                requestId: req.id,
                deviceId: ip16Device?.id ?? null,
                displayName: 'iPhone 16 – Demo (Display defekt)',
                serialNumber: 'SN-DEMO-IP16-001',
                notes: 'Gerät wurde sorgfältig eingepackt geliefert.',
            },
        });

        await prisma.repairNote.create({
            data: {
                requestId: req.id,
                content: 'Vielen Dank für die super schnelle Annahme! Ich freue mich schon total auf die Reparatur. Ihr seid wirklich klasse!',
                isPrivate: false,
                createdAt: daysAgo(7),
                updatedAt: daysAgo(7),
            },
        });

        await seedStatusHistory(req.id, repairDevice.id, [
            { status: RepairStatus.RECEIVED, startedAt: daysAgo(7), endedAt: daysAgo(6), durationMinutes: 1440 },
            { status: RepairStatus.IN_DIAGNOSIS, startedAt: daysAgo(6), endedAt: daysAgo(5), durationMinutes: 1440 },
            { status: RepairStatus.IN_REPAIR, startedAt: daysAgo(5), endedAt: null, durationMinutes: null },
        ]);

        const items = await seedWorkItems(req.id, repairDevice.id, wit, [
            { slug: 'eingang', title: 'Eingang', orderIndex: 0, status: RepairWorkItemStatus.DONE, laborMinutes: 0, completedAt: daysAgo(7), createdAt: daysAgo(7), updatedAt: daysAgo(7) },
            { slug: 'sichtpruefung', title: 'Sichtprüfung', orderIndex: 10, status: RepairWorkItemStatus.DONE, laborMinutes: 15, completedAt: daysAgo(6), createdAt: daysAgo(7), updatedAt: daysAgo(6) },
            { slug: 'diagnose', title: 'Diagnose', orderIndex: 11, status: RepairWorkItemStatus.DONE, laborMinutes: 30, completedAt: daysAgo(5), createdAt: daysAgo(7), updatedAt: daysAgo(5) },
            { slug: 'teileaustausch', title: 'Teileaustausch', orderIndex: 30, status: RepairWorkItemStatus.IN_PROGRESS, laborMinutes: 45, completedAt: null, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
            { slug: 'testen', title: 'Testen', orderIndex: 90, status: RepairWorkItemStatus.PENDING, laborMinutes: 20, completedAt: null, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
            { slug: 'ausgang', title: 'Ausgang', orderIndex: 100, status: RepairWorkItemStatus.PENDING, laborMinutes: 0, completedAt: null, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
        ]);

        await prisma.partOrder.create({
            data: {
                requestId: req.id,
                deviceId: repairDevice.id,
                catalogPartId: displayPart.id,
                workItemId: items.get('teileaustausch')!.id,
                status: PartOrderStatus.ORDERED,
                quantity: 1,
                orderedName: displayPart.name,
                supplierName: 'Apple Parts EU',
                estimatedCost: 149,
                orderedAt: daysAgo(4),
            },
        });
    }

    // ─── Scenario 2: iPhone 16 Pro Max – Kaputte Akku (IN_QA) ────────────────────
    {
        const req = await prisma.repairRequest.create({
            data: {
                customerId: demoUser.id,
                status: RepairRequestStatus.ACCEPTED,
                subject: 'Akku hält kaum noch – iPhone 16 Pro Max',
                deviceName: 'iPhone 16 Pro Max',
                deviceBrand: 'Apple',
                deviceModel: 'iPhone 16 Pro Max',
                problemDescription: 'Akku entlädt sich innerhalb von 2 Stunden komplett, selbst bei Standby.',
                alreadyTried: 'Akkusparsam-Modus aktiviert, Einstellungen zurückgesetzt.',
                suspectedIssue: 'Defekter Akku nach ca. 2 Jahren intensiver Nutzung.',
                acceptedAt: daysAgo(4),
                createdAt: daysAgo(5),
                updatedAt: daysAgo(1),
            },
        });
        requestIds.push(req.id);

        const repairDevice = await prisma.repairDevice.create({
            data: {
                requestId: req.id,
                deviceId: ip16pmDevice?.id ?? null,
                displayName: 'iPhone 16 Pro Max – Demo (Akku)',
                serialNumber: 'SN-DEMO-IP16PM-001',
                notes: 'Akku zeigt bei Diagnose 61 % Kapazität, deutlich unter Minimum.',
            },
        });

        await prisma.repairNote.create({
            data: {
                requestId: req.id,
                content: 'Danke für die kostenlose Diagnose! Ihr seid echt die Besten in der Stadt. Krasse Arbeit 🙌',
                isPrivate: false,
                createdAt: daysAgo(4),
                updatedAt: daysAgo(4),
            },
        });

        await seedStatusHistory(req.id, repairDevice.id, [
            { status: RepairStatus.RECEIVED, startedAt: daysAgo(4), endedAt: daysAgo(3), durationMinutes: 1440 },
            { status: RepairStatus.IN_DIAGNOSIS, startedAt: daysAgo(3), endedAt: daysAgo(2), durationMinutes: 1440 },
            { status: RepairStatus.IN_REPAIR, startedAt: daysAgo(2), endedAt: daysAgo(1), durationMinutes: 1440 },
            { status: RepairStatus.IN_QA, startedAt: daysAgo(1), endedAt: null, durationMinutes: null },
        ]);

        const items = await seedWorkItems(req.id, repairDevice.id, wit, [
            { slug: 'eingang', title: 'Eingang', orderIndex: 0, status: RepairWorkItemStatus.DONE, laborMinutes: 0, completedAt: daysAgo(4), createdAt: daysAgo(4), updatedAt: daysAgo(4) },
            { slug: 'sichtpruefung', title: 'Sichtprüfung', orderIndex: 10, status: RepairWorkItemStatus.DONE, laborMinutes: 15, completedAt: daysAgo(3), createdAt: daysAgo(4), updatedAt: daysAgo(3) },
            { slug: 'diagnose', title: 'Diagnose', orderIndex: 11, status: RepairWorkItemStatus.DONE, laborMinutes: 30, completedAt: daysAgo(2), createdAt: daysAgo(4), updatedAt: daysAgo(2) },
            { slug: 'batteriewechsel', title: 'Batteriewechsel', orderIndex: 30, status: RepairWorkItemStatus.DONE, laborMinutes: 20, completedAt: daysAgo(1), createdAt: daysAgo(4), updatedAt: daysAgo(1) },
            { slug: 'testen', title: 'Testen', orderIndex: 90, status: RepairWorkItemStatus.IN_PROGRESS, laborMinutes: 20, completedAt: null, createdAt: daysAgo(4), updatedAt: daysAgo(1) },
            { slug: 'ausgang', title: 'Ausgang', orderIndex: 100, status: RepairWorkItemStatus.PENDING, laborMinutes: 0, completedAt: null, createdAt: daysAgo(4), updatedAt: daysAgo(4) },
        ]);

        await prisma.partOrder.create({
            data: {
                requestId: req.id,
                deviceId: repairDevice.id,
                catalogPartId: batteryPart.id,
                workItemId: items.get('batteriewechsel')!.id,
                status: PartOrderStatus.INSTALLED,
                quantity: 1,
                orderedName: batteryPart.name,
                supplierName: 'Apple Parts EU',
                estimatedCost: 79,
                actualCost: 45,
                orderedAt: daysAgo(3),
                receivedAt: daysAgo(2),
                installedAt: daysAgo(1),
            },
        });
    }

    // ─── Scenario 3: Nintendo Switch 2 – Geht nicht mehr an (WAITING_FOR_REVIEW) ─
    {
        const req = await prisma.repairRequest.create({
            data: {
                customerId: demoUser.id,
                status: RepairRequestStatus.WAITING_FOR_REVIEW,
                subject: 'Lässt sich nicht mehr einschalten – Nintendo Switch 2',
                deviceName: 'Nintendo Switch 2',
                deviceBrand: 'Nintendo',
                deviceModel: 'Nintendo Switch 2',
                problemDescription: 'Die Konsole lässt sich plötzlich nicht mehr einschalten. Kein Bild, kein Ton, keine LED-Reaktion.',
                alreadyTried: 'Ladekabel gewechselt, 30 Sekunden Power-Button gehalten.',
                suspectedIssue: 'Möglicherweise Kurzschluss auf dem Board oder defekter Ladeport.',
                createdAt: daysAgo(1),
                updatedAt: daysAgo(1),
            },
        });
        requestIds.push(req.id);

        await prisma.repairNote.create({
            data: {
                requestId: req.id,
                content: 'Hey, ich drücke die Daumen! Die Konsole ist noch fast neu. Danke schon mal für die schnelle Reaktion!',
                isPrivate: false,
                createdAt: daysAgo(1),
                updatedAt: daysAgo(1),
            },
        });
    }

    // ─── Scenario 4: PlayStation 5 – HDMI kaputt, verlötet (IN_OUTGOING) ─────────
    {
        const req = await prisma.repairRequest.create({
            data: {
                customerId: demoUser.id,
                status: RepairRequestStatus.ACCEPTED,
                subject: 'Kein Bild über HDMI – PlayStation 5',
                deviceName: 'PlayStation 5',
                deviceBrand: 'Sony',
                deviceModel: 'PlayStation 5 CFI-1016A',
                problemDescription: 'Der HDMI-Ausgang gibt kein Bild mehr aus. Der TV erkennt kein Signal.',
                alreadyTried: 'Anderes HDMI-Kabel und anderen TV ausprobiert.',
                suspectedIssue: 'HDMI-Buchse mechanisch beschädigt, vermutlich durch Hebelwirkung am Kabel.',
                acceptedAt: daysAgo(9),
                createdAt: daysAgo(10),
                updatedAt: daysAgo(2),
            },
        });
        requestIds.push(req.id);

        const repairDevice = await prisma.repairDevice.create({
            data: {
                requestId: req.id,
                deviceId: ps5Device?.id ?? null,
                displayName: 'PlayStation 5 – Demo (HDMI)',
                serialNumber: 'SN-DEMO-PS5-001',
                notes: 'HDMI-Buchse deutlich verbogen, Pin 18 und 19 gebrochen. Neugelötet am 4. Arbeitstag.',
            },
        });

        await prisma.repairNote.create({
            data: {
                requestId: req.id,
                content: 'Absolut unglaublich! Ich hätte nie erwartet, dass das so schnell geht. Danke für die tollen Videos – so bin ich überhaupt auf euch aufmerksam geworden!',
                isPrivate: false,
                createdAt: daysAgo(9),
                updatedAt: daysAgo(9),
            },
        });

        await seedStatusHistory(req.id, repairDevice.id, [
            { status: RepairStatus.RECEIVED, startedAt: daysAgo(9), endedAt: daysAgo(8), durationMinutes: 1440 },
            { status: RepairStatus.IN_DIAGNOSIS, startedAt: daysAgo(8), endedAt: daysAgo(7), durationMinutes: 1440 },
            { status: RepairStatus.IN_REPAIR, startedAt: daysAgo(7), endedAt: daysAgo(3), durationMinutes: 5760 },
            { status: RepairStatus.IN_QA, startedAt: daysAgo(3), endedAt: daysAgo(2), durationMinutes: 1440 },
            { status: RepairStatus.IN_OUTGOING, startedAt: daysAgo(2), endedAt: null, durationMinutes: null },
        ]);

        const items = await seedWorkItems(req.id, repairDevice.id, wit, [
            { slug: 'eingang', title: 'Eingang', orderIndex: 0, status: RepairWorkItemStatus.DONE, laborMinutes: 0, completedAt: daysAgo(9), createdAt: daysAgo(9), updatedAt: daysAgo(9) },
            { slug: 'sichtpruefung', title: 'Sichtprüfung', orderIndex: 10, status: RepairWorkItemStatus.DONE, laborMinutes: 15, completedAt: daysAgo(8), createdAt: daysAgo(9), updatedAt: daysAgo(8) },
            { slug: 'diagnose', title: 'Diagnose', orderIndex: 11, status: RepairWorkItemStatus.DONE, laborMinutes: 30, completedAt: daysAgo(7), createdAt: daysAgo(9), updatedAt: daysAgo(7) },
            { slug: 'loeten', title: 'HDMI-Buchse neu verlöten', orderIndex: 30, status: RepairWorkItemStatus.DONE, laborMinutes: 45, completedAt: daysAgo(3), createdAt: daysAgo(9), updatedAt: daysAgo(3) },
            { slug: 'testen', title: 'Testen', orderIndex: 90, status: RepairWorkItemStatus.DONE, laborMinutes: 20, completedAt: daysAgo(2), createdAt: daysAgo(9), updatedAt: daysAgo(2) },
            { slug: 'ausgang', title: 'Ausgang', orderIndex: 100, status: RepairWorkItemStatus.IN_PROGRESS, laborMinutes: 0, completedAt: null, createdAt: daysAgo(9), updatedAt: daysAgo(2) },
        ]);

        await prisma.partOrder.create({
            data: {
                requestId: req.id,
                deviceId: repairDevice.id,
                catalogPartId: hdmiPart.id,
                workItemId: items.get('loeten')!.id,
                status: PartOrderStatus.INSTALLED,
                quantity: 1,
                orderedName: hdmiPart.name,
                supplierName: 'Console Parts Direct',
                estimatedCost: 18,
                actualCost: 8,
                savedValue: 10,
                orderedAt: daysAgo(8),
                receivedAt: daysAgo(7),
                installedAt: daysAgo(3),
            },
        });
    }

    // ─── Scenario 5: Audi Steuergerät – Seltsam kaputt (IN_DIAGNOSIS) ────────────
    {
        const req = await prisma.repairRequest.create({
            data: {
                customerId: demoUser.id,
                status: RepairRequestStatus.ACCEPTED,
                subject: 'Steuergerät reagiert seltsam – Audi A4',
                deviceName: 'Steuergerät',
                deviceBrand: 'Audi',
                deviceModel: 'Audi A4 B9 – Motorsteuergerät',
                problemDescription: 'Das Motorsteuergerät löst sporadisch Fehlercodes aus (P0300, P0171). Motor läuft rau, keine mechanischen Ursachen gefunden.',
                alreadyTried: 'Fehlercodes ausgelesen und gelöscht, Problem tritt nach ca. 50 km wieder auf.',
                suspectedIssue: 'Verdacht auf defekte Lötverbindungen oder einen Kondensatorfehler auf dem Board.',
                acceptedAt: daysAgo(1),
                createdAt: daysAgo(2),
                updatedAt: daysAgo(0, 12),
            },
        });
        requestIds.push(req.id);

        const repairDevice = await prisma.repairDevice.create({
            data: {
                requestId: req.id,
                deviceId: null,
                displayName: 'Audi A4 B9 – ECU / Motorsteuergerät',
                serialNumber: 'SN-DEMO-ECU-AUDI-001',
                notes: 'Steuergerät wurde ausgebaut und separat eingeschickt. Gehäuse unversehrt, Stecker-Pins gecheckt – kein sichtbarer Schaden.',
            },
        });

        await prisma.repairNote.create({
            data: {
                requestId: req.id,
                content: 'Ich habe schon einige eurer Videos geschaut – mega Kanal! Deswegen bin ich auch auf euch gekommen. Danke, dass ihr euch das anschaut!',
                isPrivate: false,
                createdAt: daysAgo(1),
                updatedAt: daysAgo(1),
            },
        });

        await seedStatusHistory(req.id, repairDevice.id, [
            { status: RepairStatus.RECEIVED, startedAt: daysAgo(1), endedAt: daysAgo(0, 12), durationMinutes: 720 },
            { status: RepairStatus.IN_DIAGNOSIS, startedAt: daysAgo(0, 12), endedAt: null, durationMinutes: null },
        ]);

        await seedWorkItems(req.id, repairDevice.id, wit, [
            { slug: 'eingang', title: 'Eingang', orderIndex: 0, status: RepairWorkItemStatus.DONE, laborMinutes: 0, completedAt: daysAgo(1), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
            { slug: 'sichtpruefung', title: 'Sichtprüfung', orderIndex: 10, status: RepairWorkItemStatus.DONE, laborMinutes: 15, completedAt: daysAgo(0, 12), createdAt: daysAgo(1), updatedAt: daysAgo(0, 12) },
            { slug: 'diagnose', title: 'Diagnose', orderIndex: 11, status: RepairWorkItemStatus.IN_PROGRESS, laborMinutes: 30, completedAt: null, createdAt: daysAgo(1), updatedAt: daysAgo(0, 12) },
            { slug: 'testen', title: 'Testen', orderIndex: 90, status: RepairWorkItemStatus.PENDING, laborMinutes: 20, completedAt: null, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
            { slug: 'ausgang', title: 'Ausgang', orderIndex: 100, status: RepairWorkItemStatus.PENDING, laborMinutes: 0, completedAt: null, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
        ]);
    }

    await prisma.demoData.create({
        data: {
            id: 'singleton',
            userId: demoUser.id,
            requestIds,
            partIds,
        },
    });
}

export async function clearDemoSeed(): Promise<void> {
    const demo = await prisma.demoData.findUnique({ where: { id: 'singleton' } });

    if (!demo) {
        return;
    }

    if (demo.requestIds.length > 0) {
        await prisma.repairRequest.deleteMany({
            where: { id: { in: demo.requestIds } },
        });
    }

    if (demo.partIds.length > 0) {
        await prisma.partCatalog.deleteMany({
            where: { id: { in: demo.partIds } },
        });
    }

    if (demo.userId) {
        await prisma.user.update({
            where: { id: demo.userId },
            data: { isActive: false },
        });
    }

    await prisma.demoData.delete({ where: { id: 'singleton' } });
}
