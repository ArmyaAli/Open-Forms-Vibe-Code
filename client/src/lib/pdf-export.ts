import jsPDF from 'jspdf';
import { FormField, Form, FormResponse } from '@shared/schema';

interface PDFFormData {
  title: string;
  description: string;
  fields: FormField[];
  rows: any[];
  themeColor: string;
}

interface PDFResponseData extends PDFFormData {
  responses: Record<string, any>;
  submittedAt: string;
}

export const exportFormAsPDF = (form: PDFFormData) => {
  const pdf = new jsPDF();
  let yPosition = 25;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 30) {
      pdf.addPage();
      yPosition = 25;
      addPageBorder();
    }
  };

  // Add border around the entire page
  const addPageBorder = () => {
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);
  };

  addPageBorder();

  // Professional header section
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(form.title || 'Form', margin, yPosition);
  
  // Add underline
  pdf.setDrawColor(70, 130, 180);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition + 5, margin + pdf.getTextWidth(form.title || 'Form'), yPosition + 5);
  
  yPosition += 25;

  // Description if provided
  if (form.description) {
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(60, 60, 60);
    const descriptionLines = pdf.splitTextToSize(form.description, contentWidth);
    checkNewPage(descriptionLines.length * 5 + 15);
    pdf.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 5 + 15;
  }

  // Add separator line
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // Instructions section
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Please fill out all required fields marked with an asterisk (*)', margin, yPosition);
  yPosition += 20;

  // Clean field rendering function
  const renderFormField = (field: FormField) => {
    checkNewPage(50);
    
    // Field label
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(40, 40, 40);
    
    let labelText = field.label || field.type;
    if (field.required) {
      labelText += ' *';
    }
    
    pdf.text(labelText, margin, yPosition);
    yPosition += 6;
    
    // Field input area
    const fieldHeight = getFieldHeight(field.type, field);
    const fieldWidth = contentWidth;
    
    // Clean border for input area
    pdf.setDrawColor(160, 160, 160);
    pdf.setLineWidth(0.5);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, yPosition, fieldWidth, fieldHeight, 'FD');
    
    // Add field-specific content
    renderFieldContent(field, margin, yPosition, fieldWidth);
    
    yPosition += fieldHeight + 15;
  };

  // Get appropriate height for different field types
  const getFieldHeight = (fieldType: string, field?: FormField): number => {
    switch (fieldType) {
      case 'textarea': return 40;
      case 'radio':
      case 'checkbox': return Math.max(30, (field?.options?.length || 3) * 8 + 10);
      case 'select': return 15;
      default: return 15;
    }
  };

  // Render field-specific content
  const renderFieldContent = (field: FormField, x: number, y: number, width: number) => {
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(10);
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
      case 'date':
      case 'time':
        if (field.placeholder) {
          pdf.text(field.placeholder, x + 5, y + 10);
        }
        break;
        
      case 'textarea':
        if (field.placeholder) {
          pdf.text(field.placeholder, x + 5, y + 12);
        }
        // Add clean writing lines
        pdf.setDrawColor(240, 240, 240);
        pdf.setLineWidth(0.3);
        for (let i = 1; i <= 4; i++) {
          pdf.line(x + 5, y + (i * 8), x + width - 5, y + (i * 8));
        }
        break;
        
      case 'select':
        pdf.text(field.placeholder || 'Please select an option', x + 5, y + 10);
        // Clean dropdown arrow
        pdf.setTextColor(100, 100, 100);
        pdf.text('▼', x + width - 15, y + 10);
        break;
        
      case 'radio':
        field.options?.forEach((option, index) => {
          const optionY = y + 8 + (index * 8);
          // Clean radio button
          pdf.setDrawColor(120, 120, 120);
          pdf.setLineWidth(0.5);
          pdf.circle(x + 8, optionY, 2.5, 'D');
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(10);
          pdf.text(option, x + 18, optionY + 2);
        });
        break;
        
      case 'checkbox':
        field.options?.forEach((option, index) => {
          const optionY = y + 8 + (index * 8);
          // Clean checkbox
          pdf.setDrawColor(120, 120, 120);
          pdf.setLineWidth(0.5);
          pdf.rect(x + 6, optionY - 2, 5, 5, 'D');
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(10);
          pdf.text(option, x + 18, optionY + 2);
        });
        break;
    }
  };

  // Render all form fields directly
  form.fields.forEach(field => {
    renderFormField(field);
  });

  // Add footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Generated by OpenForms', margin, footerY);
    
    const currentDate = new Date().toLocaleDateString();
    const dateText = `Date: ${currentDate}`;
    pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), footerY);
  };

  addFooter();

  // Save the PDF
  pdf.save(`${form.title || 'form'}.pdf`);
};

export const exportResponseAsPDF = (form: PDFFormData, response: FormResponse) => {
  const pdf = new jsPDF();
  let yPosition = 25;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 30) {
      pdf.addPage();
      yPosition = 25;
    }
  };

  // Add border around the entire page
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.5);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Header section
  pdf.setFillColor(240, 248, 255);
  pdf.rect(margin, yPosition, contentWidth, 35, 'F');
  
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(`${form.title || 'Form'} - Response`, margin + 10, yPosition + 15);
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Submitted: ${new Date(response.submittedAt).toLocaleString()}`, margin + 10, yPosition + 28);
  
  yPosition += 50;

  // Response data
  form.fields.forEach(field => {
    checkNewPage(35);
    
    // Field label
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    pdf.text(field.label || field.type, margin + 10, yPosition);
    yPosition += 8;
    
    // Response value
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    const responseValue = response.responses[field.id!] || 'No response';
    const valueText = Array.isArray(responseValue) ? responseValue.join(', ') : String(responseValue);
    
    // Background for response
    pdf.setFillColor(248, 248, 248);
    const responseHeight = 15;
    pdf.rect(margin + 10, yPosition, contentWidth - 20, responseHeight, 'F');
    
    pdf.text(valueText, margin + 15, yPosition + 10);
    yPosition += responseHeight + 10;
  });

  // Footer
  const footerY = pageHeight - 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text('Generated by OpenForms', margin, footerY);

  pdf.save(`${form.title || 'form'}-response.pdf`);
};