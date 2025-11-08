import { z } from "zod";

// Helper function to detect XSS patterns in strings
const detectXSS = (value: string): boolean => {
    if (typeof value !== "string") return false;

    // Common XSS patterns to detect
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // onclick, onload, etc.
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /<link/gi,
        /<meta/gi,
        /<style/gi,
        /expression\s*\(/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /base64/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(value));
};

// Helper function to sanitize HTML content - strips dangerous tags and attributes
const sanitizeHTML = (html: string): string => {
    if (typeof html !== "string") return html;

    // Allow safe HTML tags for formatting (p, br, strong, em, ul, ol, li, etc.)
    // Remove script tags and dangerous attributes
    let sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
        .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
        .replace(/<object[^>]*>.*?<\/object>/gi, "")
        .replace(/<embed[^>]*>/gi, "")
        .replace(/<link[^>]*>/gi, "")
        .replace(/<meta[^>]*>/gi, "")
        .replace(/<style[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/expression\s*\(/gi, "")
        .replace(/vbscript:/gi, "")
        .replace(/data:text\/html/gi, "");

    return sanitized;
};

// Custom Zod string schema with XSS validation
const safeString = (fieldName: string, maxLength?: number, required: boolean = true) => {
    let schema = z.string();

    if (required) {
        schema = schema.min(1, `${fieldName} is required`);
    }

    return schema
        .max(maxLength || 10000, `${fieldName} must be less than ${maxLength || 10000} characters`)
        .refine(
            (val) => !val || !detectXSS(val),
            {
                message: `${fieldName} contains invalid or dangerous content`,
            }
        )
        .transform((val) => val ? sanitizeHTML(val) : val);
};

// Safe HTML string for rich text content (description)
const safeHTMLString = (fieldName: string, required: boolean = true) => {
    let schema = z.string();

    if (required) {
        schema = schema.min(1, `${fieldName} is required`);
    }

    return schema
        .max(50000, `${fieldName} must be less than 50000 characters`)
        .refine(
            (val) => !val || !detectXSS(val),
            {
                message: `${fieldName} contains invalid or dangerous content`,
            }
        )
        .transform((val) => val ? sanitizeHTML(val) : val);
};

// Team member schema
const teamMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: safeString("Name", 200),
    image: z.union([z.string().url("Invalid image URL"), z.literal("")]).optional(),
    role: z.enum(["Job Owner", "Reviewer", "Contributor"]),
});

// Question schema
const questionSchema = z.object({
    id: z.number(),
    category: safeString("Category", 100),
    questionCountToAsk: z.number().nullable().optional(),
    questions: z.array(
        z.object({
            question: safeString("Question", 1000),
            id: z.union([z.string(), z.number()]).optional(),
        })
    ),
});

// Pre-screening question option schema
const preScreeningQuestionOptionSchema = z.object({
    id: z.string(),
    value: safeString("Option value", 500),
});

// Pre-screening question schema
const preScreeningQuestionSchema = z.object({
    id: z.string(),
    question: safeString("Pre-screening question", 500),
    type: z.enum(["short-answer", "long-answer", "dropdown", "checkboxes", "range", "text"]),
    options: z.array(preScreeningQuestionOptionSchema).optional(),
    minValue: safeString("Minimum value", 100, false).optional().or(z.literal("")).nullable(),
    maxValue: safeString("Maximum value", 100, false).optional().or(z.literal("")).nullable(),
    rangeType: z.enum(["currency", "number"]).optional(),
    currency: safeString("Currency", 10, false).optional().or(z.literal("")).nullable(),
    source: z.enum(["custom", "suggested"]).optional(),
});

// Main career validation schema
export const addCareerSchema = z.object({
    jobTitle: safeString("Job title", 200),
    description: safeHTMLString("Job description"),
    questions: z.array(questionSchema).min(1, "At least one question category is required"),
    location: safeString("Location", 200),
    workSetup: z.enum(["Fully Remote", "Onsite", "Hybrid"]),
    workSetupRemarks: safeString("Work setup remarks", 500, false).optional().or(z.literal("")).nullable(),
    screeningSetting: z
        .enum(["Good Fit and above", "Only Strong Fit", "No Automatic Promotion"])
        .optional()
        .nullable(),
    orgID: z.string().min(1, "Organization ID is required"),
    requireVideo: z.boolean().optional(),
    secretPrompt: safeString("Secret prompt", 2000, false).optional().or(z.literal("")).nullable(),
    cvSecretPrompt: safeString("CV secret prompt", 2000, false).optional().or(z.literal("")).nullable(),
    aiInterviewSecretPrompt: safeString("AI interview secret prompt", 2000, false).optional().or(z.literal("")).nullable(),
    preScreeningQuestions: z.array(preScreeningQuestionSchema).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    salaryNegotiable: z.boolean().optional(),
    minimumSalary: z.number().nullable().optional(),
    maximumSalary: z.number().nullable().optional(),
    country: safeString("Country", 100, false).optional().nullable(),
    province: safeString("Province", 100, false).optional().nullable(),
    employmentType: z.enum(["Full-Time", "Part-Time"]).optional().or(z.literal("")).nullable(),
    teamMembers: z.array(teamMemberSchema).min(1, "At least one team member is required"),
    lastEditedBy: z
        .object({
            email: z.string().email(),
            name: safeString("Name", 200),
            image: z.string().url().optional().or(z.literal("")),
        })
        .optional(),
    createdBy: z
        .object({
            email: z.string().email(),
            name: safeString("Name", 200),
            image: z.string().url().optional().or(z.literal("")),
        })
        .optional(),
});

export type AddCareerInput = z.infer<typeof addCareerSchema>;

