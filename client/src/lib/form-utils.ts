import { FormField } from "@shared/schema";

export const validateFormField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} is required`;
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
  }

  if (field.type === "number" && value) {
    if (isNaN(Number(value))) {
      return "Please enter a valid number";
    }
  }

  return null;
};

export const validateForm = (fields: FormField[], formData: Record<string, any>): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const error = validateFormField(field, formData[field.id]);
    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
};

export const getFieldDefaultValue = (field: FormField): any => {
  switch (field.type) {
    case "checkbox":
      return [];
    case "number":
      return "";
    default:
      return "";
  }
};

export const formatFormData = (fields: FormField[], formData: Record<string, any>): Record<string, any> => {
  const formatted: Record<string, any> = {};

  fields.forEach((field) => {
    const value = formData[field.id];
    
    if (field.type === "number" && value) {
      formatted[field.label] = Number(value);
    } else if (field.type === "checkbox" && Array.isArray(value)) {
      formatted[field.label] = value.join(", ");
    } else {
      formatted[field.label] = value || "";
    }
  });

  return formatted;
};
