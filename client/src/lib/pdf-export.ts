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

  // Header section with logo placeholder and title
  pdf.setFillColor(240, 248, 255); // Light blue background
  pdf.rect(margin, yPosition, contentWidth, 35, 'F');
  
  // Title in header
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(form.title || 'Form', margin + 10, yPosition + 15);
  
  // Add logo placeholder area (top right)
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.rect(pageWidth - margin - 50, yPosition + 5, 40, 25);
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text('LOGO', pageWidth - margin - 30, yPosition + 20);
  
  yPosition += 50;

  // Description if provided
  if (form.description) {
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(80, 80, 80);
    const descriptionLines = pdf.splitTextToSize(form.description, contentWidth - 20);
    checkNewPage(descriptionLines.length * 5 + 15);
    pdf.text(descriptionLines, margin + 10, yPosition);
    yPosition += descriptionLines.length * 5 + 20;
  }

  // Section counter
  let sectionNumber = 1;

  // Render section with professional styling
  const renderSection = (sectionTitle: string, fields: FormField[]) => {
    // Section header with background
    checkNewPage(25);
    pdf.setFillColor(235, 245, 255);
    pdf.rect(margin, yPosition, contentWidth, 20, 'F');
    
    // Section number circle
    pdf.setFillColor(70, 130, 180);
    pdf.circle(margin + 10, yPosition + 10, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text(sectionNumber.toString(), margin + 7, yPosition + 13);
    
    // Section title
    pdf.setTextColor(70, 130, 180);
    pdf.setFontSize(12);
    pdf.text(sectionTitle, margin + 25, yPosition + 13);
    
    yPosition += 30;
    sectionNumber++;
    
    // Render fields in organized rows
    fields.forEach(field => {
      checkNewPage(35);
      renderFormField(field);
      yPosition += 10; // Space between fields
    });
    
    yPosition += 15; // Space after section
  };

  // Enhanced field rendering function
  const renderFormField = (field: FormField) => {
    pdf.setTextColor(60, 60, 60);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    // Field label with better styling
    pdf.setFont(undefined, 'bold');
    pdf.text(field.label || field.type, margin + 10, yPosition);
    
    // Required indicator
    if (field.required) {
      pdf.setTextColor(180, 50, 50);
      pdf.text('*', margin + 10 + pdf.getTextWidth(field.label || field.type) + 2, yPosition);
      pdf.setTextColor(60, 60, 60);
    }
    
    yPosition += 8;
    
    // Field input area with better styling
    pdf.setFont(undefined, 'normal');
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    
    const fieldWidth = contentWidth - 20;
    const fieldHeight = getFieldHeight(field.type);
    
    // Light background for input fields
    pdf.setFillColor(252, 252, 252);
    pdf.rect(margin + 10, yPosition, fieldWidth, fieldHeight, 'FD');
    
    // Add field-specific elements
    renderFieldContent(field, margin + 10, yPosition, fieldWidth);
    
    yPosition += fieldHeight + 5;
  };

  // Get appropriate height for different field types
  const getFieldHeight = (fieldType: string): number => {
    switch (fieldType) {
      case 'textarea': return 25;
      case 'radio':
      case 'checkbox': return 20;
      case 'select': return 12;
      default: return 12;
    }
  };

  // Render field-specific content
  const renderFieldContent = (field: FormField, x: number, y: number, width: number) => {
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(9);
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'time':
        if (field.placeholder) {
          pdf.text(field.placeholder, x + 3, y + 8);
        }
        break;
        
      case 'textarea':
        if (field.placeholder) {
          pdf.text(field.placeholder, x + 3, y + 8);
        }
        // Add lines for writing
        for (let i = 1; i < 4; i++) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(x + 3, y + (i * 6), x + width - 3, y + (i * 6));
        }
        break;
        
      case 'select':
        pdf.text(field.placeholder || 'Please select...', x + 3, y + 8);
        // Dropdown arrow
        pdf.text('▼', x + width - 15, y + 8);
        break;
        
      case 'radio':
        field.options?.forEach((option, index) => {
          const optionY = y + 4 + (index * 12);
          // Radio button circle
          pdf.setDrawColor(150, 150, 150);
          pdf.circle(x + 8, optionY, 2);
          pdf.setTextColor(80, 80, 80);
          pdf.text(option, x + 15, optionY + 2);
        });
        break;
        
      case 'checkbox':
        field.options?.forEach((option, index) => {
          const optionY = y + 4 + (index * 12);
          // Checkbox square
          pdf.setDrawColor(150, 150, 150);
          pdf.rect(x + 5, optionY - 2, 4, 4);
          pdf.setTextColor(80, 80, 80);
          pdf.text(option, x + 15, optionY + 2);
        });
        break;
    }
  };

  // Organize fields into logical sections
  const organizeFieldsIntoSections = () => {
    const sections = [];
    let currentSection = { title: 'Form Fields', fields: [] as FormField[] };
    
    form.fields.forEach(field => {
      currentSection.fields.push(field);
    });
    
    if (currentSection.fields.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  // Render all sections
  const sections = organizeFieldsIntoSections();
  sections.forEach((section) => {
    renderSection(section.title, section.fields);
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