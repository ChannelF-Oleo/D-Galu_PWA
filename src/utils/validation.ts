// src/utils/validation.ts
import { z } from 'zod';

/**
 * Utility function to validate data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success/error information
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Utility function to safely parse data with a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed data or null if validation fails
 */
export function safeParseData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Utility function to validate form data and return formatted errors
 * @param schema - Zod schema to validate against
 * @param formData - Form data to validate
 * @returns Validation result with field-specific errors
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: Record<string, any>
): { 
  success: true; 
  data: T; 
} | { 
  success: false; 
  fieldErrors: Record<string, string>; 
  generalErrors: string[] 
} {
  try {
    const validatedData = schema.parse(formData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      const generalErrors: string[] = [];

      (error.errors || []).forEach((err) => {
        if (err.path.length > 0) {
          const fieldName = err.path.join('.');
          fieldErrors[fieldName] = err.message;
        } else {
          generalErrors.push(err.message);
        }
      });

      return { success: false, fieldErrors, generalErrors };
    }
    return { 
      success: false, 
      fieldErrors: {}, 
      generalErrors: ['Unknown validation error'] 
    };
  }
}

/**
 * Utility function to create a validation hook for React Hook Form
 * @param schema - Zod schema to validate against
 * @returns Validation function for React Hook Form
 */
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: any) => {
    const result = validateFormData(schema, data);
    if (result.success) {
      return true;
    }
    
    // Return the first error for React Hook Form
    const firstFieldError = Object.values(result.fieldErrors)[0];
    const firstGeneralError = result.generalErrors[0];
    return firstFieldError || firstGeneralError || 'Validation failed';
  };
}

/**
 * Utility to validate file uploads
 */
export const fileValidationSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().optional().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).optional().default(['image/jpeg', 'image/png', 'image/webp']),
});

export function validateFile(
  file: File, 
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): { success: true } | { success: false; error: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

  if (file.size > maxSize) {
    return { 
      success: false, 
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      success: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }

  return { success: true };
}

/**
 * Utility to validate multiple files
 */
export function validateFiles(
  files: FileList | File[], 
  options: { maxSize?: number; allowedTypes?: string[]; maxCount?: number } = {}
): { success: true } | { success: false; errors: string[] } {
  const { maxCount = 10 } = options;
  const fileArray = Array.from(files);

  if (fileArray.length > maxCount) {
    return { 
      success: false, 
      errors: [`Maximum ${maxCount} files allowed`] 
    };
  }

  const errors: string[] = [];
  fileArray.forEach((file, index) => {
    const result = validateFile(file, options);
    if (!result.success) {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });

  return errors.length > 0 
    ? { success: false, errors }
    : { success: true };
}