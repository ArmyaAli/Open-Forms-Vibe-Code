import { nanoid } from "nanoid";
import { FormField, FormRow, SerializableForm, ImportForm, SerializableFormSchema, ImportFormSchema } from "@shared/schema";

export interface FormSerializationOptions {
  includeMetadata?: boolean;
  minifyJson?: boolean;
}

export interface FormImportOptions {
  replaceIds?: boolean;
  validateStructure?: boolean;
  preserveTheme?: boolean;
}

/**
 * Serialize a form to a JSON object for export
 */
export function serializeForm(
  title: string,
  description: string,
  fields: FormField[],
  rows: FormRow[],
  themeColor: string,
  options: FormSerializationOptions = {}
): SerializableForm {
  const { includeMetadata = true } = options;
  
  // Calculate form complexity
  const fieldCount = fields.length;
  const rowCount = rows.length;
  const hasAdvancedFields = fields.some(f => 
    ['select', 'radio', 'checkbox', 'rating', 'file', 'address', 'range', 'toggle'].includes(f.type)
  );
  const hasMultiColumn = rows.some(r => r.columns > 1);
  
  let complexity: "simple" | "moderate" | "complex";
  if (fieldCount <= 3 && rowCount <= 2 && !hasAdvancedFields) {
    complexity = "simple";
  } else if (fieldCount <= 10 && rowCount <= 5 && (!hasAdvancedFields || !hasMultiColumn)) {
    complexity = "moderate";
  } else {
    complexity = "complex";
  }

  const serializedForm: SerializableForm = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    formData: {
      title,
      description: description || undefined,
      fields,
      rows,
      themeColor,
      metadata: includeMetadata ? {
        fieldCount,
        rowCount,
        complexity,
      } : {
        fieldCount: 0,
        rowCount: 0,
        complexity: "simple",
      },
    },
  };

  // Validate the serialized form
  try {
    SerializableFormSchema.parse(serializedForm);
  } catch (error) {
    console.error("Form serialization validation failed:", error);
    throw new Error("Failed to serialize form: Invalid form structure");
  }

  return serializedForm;
}

/**
 * Deserialize a JSON object to form data for import
 */
export function deserializeForm(
  jsonData: any,
  options: FormImportOptions = {}
): ImportForm {
  const { replaceIds = true, validateStructure = true } = options;

  try {
    // First validate the structure if requested
    if (validateStructure) {
      SerializableFormSchema.parse(jsonData);
    }

    const formData = jsonData.formData || jsonData; // Support both wrapped and unwrapped formats
    
    let { title, description, fields, rows, themeColor } = formData;

    // Generate new IDs if requested
    if (replaceIds) {
      const oldToNewIds: Record<string, string> = {};
      
      // Generate new row IDs and ensure they have required properties
      rows = rows.map((row: any) => {
        const newId = nanoid();
        oldToNewIds[row.id] = newId;
        return { 
          id: newId,
          order: row.order || 0,
          columns: row.columns || 1,
        };
      });

      // Generate new field IDs and update row references
      fields = fields.map((field: any) => {
        const newFieldId = nanoid();
        const newRowId = field.rowId ? oldToNewIds[field.rowId] : undefined;
        return {
          id: newFieldId,
          type: field.type,
          label: field.label || "",
          placeholder: field.placeholder,
          required: field.required || false,
          options: field.options,
          rowId: newRowId,
          columnIndex: field.columnIndex,
          width: field.width || 1,
        };
      });
    } else {
      // Ensure all required properties are present even without ID replacement
      rows = rows.map((row: any) => ({
        id: row.id || nanoid(),
        order: row.order || 0,
        columns: row.columns || 1,
      }));

      fields = fields.map((field: any) => ({
        id: field.id || nanoid(),
        type: field.type,
        label: field.label || "",
        placeholder: field.placeholder,
        required: field.required || false,
        options: field.options,
        rowId: field.rowId,
        columnIndex: field.columnIndex,
        width: field.width || 1,
      }));
    }

    const importForm: ImportForm = {
      title: title || "Imported Form",
      description: description || undefined,
      fields,
      rows,
      themeColor: themeColor || "#6366F1",
    };

    // Validate the import form
    ImportFormSchema.parse(importForm);
    
    return importForm;
  } catch (error) {
    console.error("Form deserialization failed:", error);
    throw new Error(`Failed to import form: ${error instanceof Error ? error.message : 'Invalid JSON structure'}`);
  }
}

/**
 * Download a form as a JSON file
 */
export function downloadFormAsJson(
  title: string,
  description: string,
  fields: FormField[],
  rows: FormRow[],
  themeColor: string,
  options: FormSerializationOptions = {}
): void {
  try {
    const serializedForm = serializeForm(title, description, fields, rows, themeColor, options);
    
    const jsonString = options.minifyJson 
      ? JSON.stringify(serializedForm)
      : JSON.stringify(serializedForm, null, 2);
    
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-form.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download form:", error);
    throw error;
  }
}

/**
 * Read and parse a JSON file from file input
 */
export function readJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    // More lenient file type checking - some systems don't set proper MIME types
    if (!file.name.endsWith(".json") && file.type !== "application/json" && file.type !== "text/plain") {
      console.log('File validation failed:', { name: file.name, type: file.type });
      reject(new Error("Please select a valid JSON file"));
      return;
    }

    console.log('File passed validation:', { name: file.name, type: file.type, size: file.size });

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        console.log('File content read, length:', content.length);
        console.log('First 200 chars:', content.substring(0, 200));
        
        const jsonData = JSON.parse(content);
        console.log('JSON parsed successfully');
        resolve(jsonData);
      } catch (error) {
        console.error('JSON parse error:', error);
        reject(new Error("Invalid JSON file format"));
      }
    };
    
    reader.onerror = () => {
      console.error('FileReader error');
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate form compatibility for import
 */
export function validateFormCompatibility(jsonData: any): {
  isValid: boolean;
  version: string;
  issues: string[];
  canImport: boolean;
} {
  const issues: string[] = [];
  let isValid = true;
  let canImport = true;

  console.log('Validating form compatibility for:', jsonData);

  try {
    // Check if it's a valid serialized form
    console.log('Attempting schema validation...');
    SerializableFormSchema.parse(jsonData);
    console.log('Schema validation passed');
    
    const version = jsonData.version || "unknown";
    const formData = jsonData.formData || jsonData;
    
    console.log('Version:', version);
    console.log('Form data:', formData);

    // Check for required fields
    if (!formData.title) {
      issues.push("Form title is missing");
      isValid = false;
    }

    if (!formData.fields || !Array.isArray(formData.fields)) {
      issues.push("Form fields are missing or invalid");
      isValid = false;
      canImport = false;
    }

    if (!formData.rows || !Array.isArray(formData.rows)) {
      issues.push("Form rows are missing or invalid");
      isValid = false;
      canImport = false;
    }

    // Check field types
    if (formData.fields) {
      formData.fields.forEach((field: any, index: number) => {
        if (!field.type || !field.id) {
          issues.push(`Field ${index + 1} is missing required properties`);
          isValid = false;
        }
      });
    }

    // Check row structure
    if (formData.rows) {
      formData.rows.forEach((row: any, index: number) => {
        if (!row.id || typeof row.order !== 'number') {
          issues.push(`Row ${index + 1} is missing required properties`);
          isValid = false;
        }
      });
    }

    const result = {
      isValid,
      version,
      issues,
      canImport: canImport && issues.length === 0,
    };
    
    console.log('Validation result:', result);
    return result;
  } catch (error) {
    console.error('Schema validation error:', error);
    return {
      isValid: false,
      version: "unknown",
      issues: ["Invalid form format or structure"],
      canImport: false,
    };
  }
}