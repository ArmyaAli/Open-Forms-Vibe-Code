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
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(form.title || 'Untitled Form', margin, yPosition);
  yPosition += 15;

  // Description
  if (form.description) {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    const descriptionLines = pdf.splitTextToSize(form.description, contentWidth);
    checkNewPage(descriptionLines.length * 7);
    pdf.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 7 + 10;
  }

  // Draw a line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Helper function to render field input
  const renderFieldInput = (field: FormField, x: number, y: number, width: number): number => {
    pdf.setFont(undefined, 'normal');
    pdf.setDrawColor(100, 100, 100);
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'time':
        pdf.rect(x, y, width, 8);
        if (field.placeholder) {
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text(field.placeholder, x + 2, y + 6);
          pdf.setTextColor(0, 0, 0);
        }
        return 20;

      case 'textarea':
        pdf.rect(x, y, width, 24);
        if (field.placeholder) {
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text(field.placeholder, x + 2, y + 8);
          pdf.setTextColor(0, 0, 0);
        }
        return 36;

      case 'select':
        pdf.rect(x, y, width, 8);
        pdf.text(field.placeholder || 'Select an option ▼', x + 2, y + 6);
        if (field.options && field.options.length > 0) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          const optionsText = pdf.splitTextToSize(`Options: ${field.options.join(', ')}`, width - 10);
          pdf.text(optionsText, x + 5, y + 18);
          pdf.setTextColor(0, 0, 0);
          return 20 + optionsText.length * 7;
        }
        return 25;

      case 'radio':
        let radioHeight = 0;
        field.options?.forEach((option) => {
          pdf.circle(x + 3, y + radioHeight + 3, 2);
          pdf.text(option, x + 10, y + radioHeight + 5);
          radioHeight += 12;
        });
        return radioHeight + 8;

      case 'checkbox':
        let checkboxHeight = 0;
        field.options?.forEach((option) => {
          pdf.rect(x, y + checkboxHeight, 6, 6);
          pdf.text(option, x + 10, y + checkboxHeight + 5);
          checkboxHeight += 12;
        });
        return checkboxHeight + 8;

      case 'toggle':
        pdf.rect(x, y, 20, 8);
        pdf.text(field.placeholder || 'Toggle option', x + 25, y + 6);
        return 20;

      case 'range':
        pdf.line(x, y + 4, x + width - 20, y + 4);
        pdf.circle(x + 50, y + 4, 2);
        return 20;

      default:
        pdf.rect(x, y, width, 8);
        return 20;
    }
  };

  // Render fields using row-based layout
  if (form.rows && form.rows.length > 0) {
    // Sort rows by order
    const sortedRows = [...form.rows].sort((a, b) => a.order - b.order);
    
    // Group fields by row
    const fieldsByRow = form.fields.reduce((acc, field) => {
      const rowId = (field as any).rowId;
      if (!acc[rowId]) acc[rowId] = [];
      acc[rowId].push(field);
      return acc;
    }, {} as Record<string, FormField[]>);
    
    // Sort fields within each row by columnIndex
    Object.keys(fieldsByRow).forEach(rowId => {
      fieldsByRow[rowId].sort((a, b) => ((a as any).columnIndex || 0) - ((b as any).columnIndex || 0));
    });
    
    sortedRows.forEach((row) => {
      const rowFields = fieldsByRow[row.id] || [];
      if (rowFields.length === 0) return;
      
      checkNewPage(50); // Minimum space for a row
      
      // Calculate column width
      const columnWidth = (contentWidth - (row.columns - 1) * 10) / row.columns;
      
      // Render fields in columns
      const startY = yPosition;
      let maxRowHeight = 0;
      
      for (let columnIndex = 0; columnIndex < row.columns; columnIndex++) {
        const columnFields = rowFields.filter(field => ((field as any).columnIndex || 0) === columnIndex);
        const columnX = margin + (columnWidth + 10) * columnIndex;
        let columnY = startY;
        
        columnFields.forEach((field) => {
          // Field label
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          const labelText = `${field.label}${field.required ? ' *' : ''}`;
          const labelLines = pdf.splitTextToSize(labelText, columnWidth);
          pdf.text(labelLines, columnX, columnY);
          columnY += labelLines.length * 7 + 5;
          
          // Field input area
          const fieldHeight = renderFieldInput(field, columnX, columnY, columnWidth);
          columnY += fieldHeight + 10;
        });
        
        maxRowHeight = Math.max(maxRowHeight, columnY - startY);
      }
      
      yPosition += maxRowHeight + 15; // Space between rows
    });
  } else {
    // Fallback: render fields sequentially if no rows defined
    form.fields.forEach((field, index) => {
      checkNewPage(40);
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      const labelText = `${index + 1}. ${field.label}${field.required ? ' *' : ''}`;
      pdf.text(labelText, margin, yPosition);
      yPosition += 15;
      
      const fieldHeight = renderFieldInput(field, margin, yPosition, contentWidth);
      yPosition += fieldHeight + 15;
    });
  }

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Generated by Open Forms', margin, footerY);
  pdf.text(new Date().toLocaleDateString(), pageWidth - margin - 30, footerY);

  // Download the PDF
  const fileName = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_form.pdf`;
  pdf.save(fileName);
};

export const exportResponseAsPDF = (form: PDFFormData, response: FormResponse) => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(form.title || 'Untitled Form', margin, yPosition);
  yPosition += 10;

  // Submission info
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Submitted: ${new Date(response.submittedAt).toLocaleString()}`, margin, yPosition);
  yPosition += 15;
  pdf.setTextColor(0, 0, 0);

  // Description
  if (form.description) {
    pdf.setFontSize(12);
    const descriptionLines = pdf.splitTextToSize(form.description, contentWidth);
    checkNewPage(descriptionLines.length * 7);
    pdf.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 7 + 10;
  }

  // Draw a line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Helper function to render a field response
  const renderFieldResponse = (field: FormField, x: number, y: number, width: number): number => {
    // Field label
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    const labelText = `${field.label}${field.required ? ' *' : ''}`;
    const labelLines = pdf.splitTextToSize(labelText, width);
    pdf.text(labelLines, x, y);
    let currentY = y + labelLines.length * 7 + 5;

    // Response value
    pdf.setFont(undefined, 'normal');
    const responseValue = response.responses[field.id];
    
    if (responseValue !== undefined && responseValue !== null && responseValue !== '') {
      pdf.setFontSize(11);
      
      switch (field.type) {
        case 'checkbox':
          // Handle array responses for checkboxes
          if (Array.isArray(responseValue)) {
            const selectedOptions = responseValue.join(', ');
            const responseLines = pdf.splitTextToSize(selectedOptions, width - 10);
            pdf.text(responseLines, x + 5, currentY);
            currentY += responseLines.length * 7;
          } else {
            pdf.text(String(responseValue), x + 5, currentY);
            currentY += 7;
          }
          break;
          
        case 'textarea':
          // Handle multi-line text
          const textLines = pdf.splitTextToSize(String(responseValue), width - 10);
          pdf.text(textLines, x + 5, currentY);
          currentY += textLines.length * 7;
          break;

        case 'rating':
          // Show rating as stars
          const rating = Number(responseValue) || 0;
          pdf.text(`${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`, x + 5, currentY);
          currentY += 7;
          break;
          
        default:
          // Handle single-line responses
          const responseLines = pdf.splitTextToSize(String(responseValue), width - 10);
          pdf.text(responseLines, x + 5, currentY);
          currentY += responseLines.length * 7;
          break;
      }
    } else {
      // No response provided
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('(No response)', x + 5, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 7;
    }

    return currentY - y + 10; // Return height used
  };

  // Render fields with row-based layout if available
  if (form.rows && form.rows.length > 0) {
    // Sort rows by order
    const sortedRows = [...form.rows].sort((a, b) => a.order - b.order);
    
    // Group fields by row
    const fieldsByRow = form.fields.reduce((acc, field) => {
      const rowId = (field as any).rowId;
      if (rowId) {
        if (!acc[rowId]) acc[rowId] = [];
        acc[rowId].push(field);
      }
      return acc;
    }, {} as Record<string, FormField[]>);
    
    // Sort fields within each row by columnIndex
    Object.keys(fieldsByRow).forEach(rowId => {
      fieldsByRow[rowId].sort((a, b) => ((a as any).columnIndex || 0) - ((b as any).columnIndex || 0));
    });
    
    sortedRows.forEach((row) => {
      const rowFields = fieldsByRow[row.id] || [];
      if (rowFields.length === 0) return;
      
      checkNewPage(60); // Minimum space for a row
      
      // Calculate column width
      const columnWidth = (contentWidth - (row.columns - 1) * 10) / row.columns;
      
      // Render fields in columns
      const startY = yPosition;
      let maxRowHeight = 0;
      
      for (let columnIndex = 0; columnIndex < row.columns; columnIndex++) {
        const columnFields = rowFields.filter(field => ((field as any).columnIndex || 0) === columnIndex);
        const columnX = margin + (columnWidth + 10) * columnIndex;
        let columnY = startY;
        
        columnFields.forEach((field) => {
          const fieldHeight = renderFieldResponse(field, columnX, columnY, columnWidth);
          columnY += fieldHeight + 10;
        });
        
        maxRowHeight = Math.max(maxRowHeight, columnY - startY);
      }
      
      yPosition += maxRowHeight + 15; // Space between rows
    });
  } else {
    // Fallback: render fields sequentially if no rows defined
    form.fields.forEach((field) => {
      checkNewPage(40);
      const fieldHeight = renderFieldResponse(field, margin, yPosition, contentWidth);
      yPosition += fieldHeight + 15;
    });
  }

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Generated by Open Forms', margin, footerY);
  pdf.text(new Date().toLocaleDateString(), pageWidth - margin - 30, footerY);

  // Download the PDF
  const fileName = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_response_${response.id}.pdf`;
  pdf.save(fileName);
};