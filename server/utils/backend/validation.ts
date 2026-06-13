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
}).strict();
