import { z } from 'zod';

// Message validation schemas
export const messageContentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
    .refine((content) => {
      // Basic XSS prevention - no script tags
      return !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(content);
    }, "Invalid content detected"),
  message_type: z.enum(['text', 'quote', 'order', 'audio', 'video', 'document', 'reservation', 'system', 'action']).optional(),
  attachment_url: z.string().url().optional(),
  reply_to_id: z.string().uuid().optional(),
  thread_id: z.string().uuid().optional(),
});

// User profile validation schemas
export const userProfileSchema = z.object({
  pseudo: z.string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  address: z.string()
    .trim()
    .max(200, "Address must be less than 200 characters")
    .optional(),
  visibility: z.enum(['public', 'private']).default('public'),
});

// Business profile validation schemas
export const businessProfileSchema = z.object({
  business_name: z.string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  description: z.string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  email: z.string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .optional(),
  website: z.string()
    .trim()
    .url("Invalid website URL")
    .max(255, "Website URL must be less than 255 characters")
    .optional(),
  address: z.string()
    .trim()
    .max(200, "Address must be less than 200 characters")
    .optional(),
});

// Catalog validation schemas
export const catalogSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Catalog name must be at least 2 characters")
    .max(100, "Catalog name must be less than 100 characters"),
  description: z.string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  base_price: z.number()
    .min(0, "Price must be positive")
    .max(1000000, "Price is too high")
    .optional(),
  keywords: z.array(z.string().trim().max(50))
    .max(10, "Maximum 10 keywords allowed")
    .optional(),
});

// Quote validation schemas
export const quoteSchema = z.object({
  items: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    quantity: z.number().int().min(1).max(1000),
    unit_price: z.number().min(0).max(1000000),
  })).min(1, "At least one item is required"),
  notes: z.string()
    .trim()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  terms_conditions: z.string()
    .trim()
    .max(1000, "Terms and conditions must be less than 1000 characters")
    .optional(),
});

// Content sanitization function
export const sanitizeContent = (content: string): string => {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
};

// Message rate limiter - 30 messages per minute
export const messageRateLimiter = createRateLimiter(30, 60 * 1000);

// File upload validation
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  // Check for malicious file names
  if (/[<>:"|?*\\\/]/.test(file.name)) {
    return { valid: false, error: 'Invalid file name characters' };
  }
  
  return { valid: true };
};