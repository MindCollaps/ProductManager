import { z } from 'zod';

// Password validation: at least 8 chars with complexity requirements
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must not exceed 64 characters')
    .refine(
        password => /[a-z]/.test(password),
        'Password must contain at least one lowercase letter',
    )
    .refine(
        password => /[A-Z]/.test(password),
        'Password must contain at least one uppercase letter',
    )
    .refine(
        password => /[0-9]/.test(password),
        'Password must contain at least one number',
    );

export const signupSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(32, 'Username must not exceed 32 characters').transform(val => val.trim()),
    password: passwordSchema,
    passwordRepeated: passwordSchema,
    email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
}).strict();

// Login schema uses basic password validation (not strict requirements)
// to allow users with old passwords to still log in
export const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(32, 'Username must not exceed 32 characters').transform(val => val.trim()),
    password: z.string().min(3, 'Password must be at least 3 characters').max(64, 'Password must not exceed 64 characters'),
}).strict();

export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Verification token is required').transform(val => val.trim()),
}).strict();

export const passwordResetRequestSchema = z.object({
    email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
}).strict();

export const passwordResetConfirmSchema = z.object({
    token: z.string().min(1, 'Reset token is required').transform(val => val.trim()),
    password: passwordSchema,
    passwordRepeated: passwordSchema,
}).strict();

export const deviceCategoryCreateSchema = z.object({
    name: z.string().min(3, 'Device category name must be at least 3 characters').max(50, 'Device category name must not exceed 50 characters').transform(val => val.trim()),
    slug: z.string().min(3, 'Device category slug must be at least 3 characters').max(50, 'Device category slug must not exceed 50 characters').transform(val => val.trim().toLowerCase()),
    description: z.string().max(255, 'Device category description must not exceed 255 characters').transform(val => val.trim()).optional(),
    color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color must be a valid hex code').optional(),
}).strict();

export const deviceCreateSchema = z.object({
    name: z.string().min(3, 'Device name must be at least 3 characters').max(100, 'Device name must not exceed 100 characters').transform(val => val.trim()),
    categories: z.array(z.string()).min(1, 'At least one category ID is required'),
    description: z.string().max(255, 'Device description must not exceed 255 characters').transform(val => val.trim()).optional(),
    deviceBrandId: z.string(),
    purchaseValue: z.number(),
}).strict();

export const requestCreateSchema = z.object({
    deviceName: z.string().max(100, 'Device name must not exceed 100 characters').transform(val => val.trim()),
    deviceModel: z.string().max(100, 'Device model must not exceed 100 characters').transform(val => val.trim()).optional(),
    deviceBrand: z.string().max(100, 'Device brand must not exceed 100 characters').transform(val => val.trim()).optional(),
    problemDescription: z.string().min(10, 'Problem desciption must be at least 10 characters').max(250, 'Problem desciption must not exceed 250 characters').transform(val => val.trim()),
    alreadyTried: z.string().min(3, 'Already tried must be at least 3 characters').max(250, 'Already tried must not exceed 250 characters').transform(val => val.trim()).optional(),
    suspectedIssue: z.string().min(3, 'Suspected issue must be at least 3 characters').max(250, 'Suspected issue must not exceed 250 characters').transform(val => val.trim()).optional(),
    customerNotes: z.string().max(250, 'Customer notes must not exceed 250 characters').transform(val => val.trim()).optional(),
});

export const deviceBrandCreateSchema = z.object({
    name: z.string().min(3, 'Device category name must be at least 3 characters').max(50, 'Device category name must not exceed 50 characters').transform(val => val.trim()),
}).strict();

export const repairDeviceCreateSchema = z.object({
    displayName: z.string().max(100, 'Display name must not exceed 100 characters').transform(val => val.trim()),
    serialNumber: z.string().max(100, 'Serialnumber must not exceed 100 characters').transform(val => val.trim()).optional(),
    notes: z.string().max(250, 'Notes must not exceed 250 characters').transform(val => val.trim()).optional(),
    deviceId: z.string(),
    requestId: z.string(),
}).strict();

export const workItemTypeCreateSchema = z.object({
    name: z.string().max(100, 'Name must not exceed 100 characters').transform(val => val.trim()),
    slug: z.string().min(3, 'Device category slug must be at least 3 characters').max(50, 'Device category slug must not exceed 50 characters').transform(val => val.trim().toLowerCase()),
    description: z.string().max(100, 'Name must not exceed 100 characters').transform(val => val.trim()),
    color: z.string().max(100, 'Name must not exceed 100 characters').transform(val => val.trim()),
    icon: z.string().max(100, 'Name must not exceed 100 characters').transform(val => val.trim()),
    sortOrder: z.number().max(100, 'Name must not exceed 100 characters'),
    laborMinutes: z.number().int().min(0).max(480).nullable().default(null),
    isDefault: z.boolean().default(false),
}).strict();

export const repairWorkItemStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED']);

export const repairWorkItemCreateSchema = z.object({
    title: z.string().max(100, 'Work item title must not exceed 100 characters').transform(val => val.trim()),
    description: z.string().max(500, 'Work item description must not exceed 500 characters').transform(val => val.trim()).optional(),
    orderIndex: z.number().int().min(0).max(100),
    workItemTypeId: z.string(),
    assignedStaffId: z.string().nullable().optional(),
    laborMinutes: z.number().int().min(0).nullable().optional(),
    status: repairWorkItemStatusSchema.default('PENDING'),
    completedAt: z.string().datetime().nullable().optional(),
}).strict();

export const appConfigUpdateSchema = z.object({
    hourlyRate: z.number().min(0).max(9999),
    showTimelineToCustomer: z.boolean().optional(),
    demoMode: z.boolean().optional(),
}).strict();

export const partCatalogCreateSchema = z.object({
    name: z.string().min(2).max(120).transform(val => val.trim()),
    manufacturer: z.string().max(100).transform(val => val.trim()).optional(),
    sku: z.string().max(100).transform(val => val.trim()).optional(),
    description: z.string().max(500).transform(val => val.trim()).optional(),
    unitCost: z.number().min(0).nullable().optional(),
    retailPrice: z.number().min(0).nullable().optional(),
}).strict();

export const partOrderCreateSchema = z.object({
    catalogPartId: z.string(),
    quantity: z.number().int().min(1).max(100),
    supplierName: z.string().max(120).transform(val => val.trim()).optional(),
    estimatedCost: z.number().min(0).nullable().optional(),
    note: z.string().max(500).transform(val => val.trim()).optional(),
    workItemId: z.string().optional(),
}).strict();

export const partOrderUpdateSchema = z.object({
    quantity: z.number().int().min(1).max(100).optional(),
    supplierName: z.string().max(120).transform(val => val.trim()).nullable().optional(),
    estimatedCost: z.number().min(0).nullable().optional(),
    actualCost: z.number().min(0).nullable().optional(),
    savedValue: z.number().nullable().optional(),
    status: z.enum(['DRAFT', 'ORDERED', 'SHIPPED', 'RECEIVED', 'ALREADY_IN_STOCK', 'INSTALLED', 'CANCELLED']).optional(),
    note: z.string().max(500).transform(val => val.trim()).nullable().optional(),
    workItemId: z.string().nullable().optional(),
}).strict();
