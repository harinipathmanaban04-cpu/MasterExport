import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Downloads quotation as PDF matching the exact on-screen preview layout.
 * When the preview layout element (#printable-quotation-doc) is active in the DOM,
 * it captures the exact rendered DOM at retina resolution into an A4 PDF document.
 * If called in the background, it falls back to an exact matching vector-drawn PDF.
 */
export async function generateQuotationPdf(quotation) {
  if (!quotation) return;

  const qNo = quotation.quotationNo || 'Quotation';
  const filename = `${qNo}.pdf`;

  // 1. Primary Strategy: Capture the exact preview DOM element (#printable-quotation-doc)
  const element = document.getElementById('printable-quotation-doc');
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2.5, // 2.5x retina scaling for crisp lines and text
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210; // A4 mm
      const pageHeight = 297; // A4 mm
      const margin = 12; // 12mm margin
      const printWidth = pageWidth - (margin * 2);
      const printHeight = (canvas.height * printWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      let heightLeft = printHeight;
      let position = margin;

      // First page
      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        position,
        printWidth,
        Math.min(printHeight, pageHeight - (margin * 2))
      );
      heightLeft -= (pageHeight - (margin * 2));

      // Additional pages if needed
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (printHeight - heightLeft);
        pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
        heightLeft -= (pageHeight - (margin * 2));
      }

      pdf.save(filename);
      return;
    } catch (err) {
      console.warn('DOM canvas capture failed, using matching vector template:', err);
    }
  }

  // 2. Fallback Strategy: Vector-drawn PDF matching exact branding & preview layout
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currCode = quotation.currency || 'USD';
  const currencySymbol =
    currCode === 'INR'
      ? 'INR '
      : currCode === 'EUR'
      ? '€'
      : currCode === 'GBP'
      ? '£'
      : currCode === 'AED'
      ? 'AED '
      : '$';

  const primaryColor = [12, 90, 72];    // #0c5a48 Emerald
  const darkTeal = [30, 30, 45];        // #1e1e2d Ink
  const textColor = [55, 65, 81];       // #374151
  const mutedColor = [100, 116, 139];   // #64748b

  // 1. Header Banner & Branding (Apex Global Exporters Pro)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Master Export Pro Inc.', 14, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('EXPORT TODAY. A STRONGER TOMORROW.', 14, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('123 Trade Center, Business Bay, New York, NY 10001, USA', 14, 26);
  doc.text('Email: exports@masterexportpro.com | GST / Tax ID: 123456789', 14, 30);

  // Document Title & Meta (Right aligned)
  doc.setFillColor(232, 245, 242);
  doc.roundedRect(144, 10, 52, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('COMMERCIAL QUOTATION', 170, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Quote No:', 144, 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text(quotation.quotationNo || 'QUO-2026', 196, 23, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Date:', 144, 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text(quotation.quotationDate || new Date().toISOString().slice(0, 10), 196, 28, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Valid Until:', 144, 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text(quotation.validUntil || '30 Days from date', 196, 33, { align: 'right' });

  // Divider
  doc.setDrawColor(210, 230, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  // 2. Buyer and Commercial Information (2 Rounded Columns)
  let yPos = 44;

  // Box 1: Customer Details
  doc.setFillColor(248, 251, 250);
  doc.setDrawColor(213, 231, 227);
  doc.roundedRect(14, yPos, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('QUOTATION PREPARED FOR:', 18, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text(quotation.customer || quotation.companyName || 'Valued Buyer', 18, yPos + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(quotation.address || 'Business Bay, Dubai, UAE', 18, yPos + 17);
  doc.text(`Attn: ${quotation.contactPerson || 'Purchasing Department'}`, 18, yPos + 22);
  doc.text(`Email: ${quotation.email || 'purchasing@buyer.com'}`, 18, yPos + 26);

  // Box 2: Terms & Shipping Reference
  doc.setFillColor(248, 251, 250);
  doc.roundedRect(108, yPos, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('COMMERCIAL & LOGISTICS TERMS:', 112, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Currency: ${currCode}`, 112, yPos + 12);
  doc.text(`Incoterm: ${quotation.incoterm || 'CIF'}`, 112, yPos + 17);
  doc.text(`Delivery Port: ${quotation.destination || 'Destination Port'}`, 112, yPos + 22);
  doc.text(`Payment Terms: ${quotation.paymentTerms || 'Net 30'}`, 112, yPos + 26);

  yPos += 36;

  // 3. Line Items Table (autoTable)
  const rawItems =
    quotation.items && quotation.items.length > 0
      ? quotation.items
      : quotation.products && quotation.products.length > 0
      ? quotation.products
      : [];

  const items =
    rawItems.length > 0
      ? rawItems.map((p) => ({
          name: p.name || 'Export Item',
          description: p.description || 'Export grade specification',
          quantity: Number(p.quantity || 1),
          unit: p.unit || 'MT',
          unitPrice: Number(p.unitPrice || p.price || 0),
          discount: Number(p.discount || 0),
          discountType: p.discountType || 'percent',
          taxRate: Number(p.taxRate || 0),
          lineTotal: Number(p.lineTotal || p.total || (Number(p.quantity || 1) * Number(p.unitPrice || p.price || 0)))
        }))
      : [
          {
            name: 'Export Item',
            description: 'Standard export specification',
            quantity: 1,
            unit: 'PCS',
            unitPrice: Number(quotation.grandTotal || quotation.totalAmount || 0),
            discount: 0,
            taxRate: 0,
            lineTotal: Number(quotation.grandTotal || quotation.totalAmount || 0)
          }
        ];

  const tableBody = items.map((it, idx) => {
    const qty = Number(it.quantity || 1);
    const price = Number(it.unitPrice || 0);
    const disc = Number(it.discount || 0);
    const discStr = disc > 0 ? (it.discountType === 'amount' ? `${currencySymbol}${disc}` : `${disc}%`) : '-';
    const taxStr = it.taxRate > 0 ? `${it.taxRate}%` : '-';
    const total = Number(it.lineTotal || (qty * price));

    return [
      idx + 1,
      `${it.name}\n${it.description || ''}`.trim(),
      `${qty} ${it.unit || 'MT'}`,
      `${currencySymbol}${price.toFixed(2)}`,
      discStr,
      taxStr,
      `${currencySymbol}${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'ITEM & DESCRIPTION', 'QTY', 'UNIT PRICE', 'DISCOUNT', 'TAX', 'LINE TOTAL']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [237, 247, 244],
      textColor: [12, 70, 80],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      lineColor: [210, 230, 225],
      lineWidth: 0.3
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textColor,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 3,
      lineColor: [226, 237, 235],
      lineWidth: 0.2
    }
  });

  // Position after table
  let finalY = doc.lastAutoTable.finalY + 6;

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // 4. Financial Summary (Right column)
  const summaryX = 120;
  const summaryValX = 196;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);

  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`${currencySymbol}${Number(quotation.subtotal || quotation.grandTotal || quotation.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });

  finalY += 5;
  if (quotation.totalDiscount > 0) {
    doc.text('Discount:', summaryX, finalY);
    doc.text(`-${currencySymbol}${Number(quotation.totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });
    finalY += 5;
  }

  if (quotation.taxTotal > 0) {
    doc.text('Tax:', summaryX, finalY);
    doc.text(`${currencySymbol}${Number(quotation.taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });
    finalY += 5;
  }

  // Grand Total Box
  doc.setFillColor(232, 245, 242);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(summaryX - 4, finalY - 1, 80, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Grand Total:', summaryX, finalY + 6);
  doc.text(`${currencySymbol}${Number(quotation.grandTotal || quotation.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX - 2, finalY + 6, { align: 'right' });

  // 5. Notes, Terms & Conditions
  let termsY = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Notes & Specifications:', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const notesText = quotation.notes || 'All items inspected according to international export grade standards.';
  const splitNotes = doc.splitTextToSize(notesText, 95);
  doc.text(splitNotes, 14, termsY + 4);

  termsY += 5 + (splitNotes.length * 3.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Terms & Conditions:', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const termsText = quotation.termsAndConditions || '1. Prices valid for 30 days from date of issue.\n2. Goods dispatch within 14 business days from order confirmation.';
  const splitTerms = doc.splitTextToSize(termsText, 95);
  doc.text(splitTerms, 14, termsY + 4);

  // 6. Authorized Signatory (Bottom right)
  const bottomY = Math.max(finalY + 20, termsY + (splitTerms.length * 3.5) + 10);
  if (bottomY < 265) {
    doc.setDrawColor(169, 190, 191);
    doc.line(140, bottomY + 12, 196, bottomY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text('Master Export Pro Inc.', 168, bottomY + 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('Authorized Commercial Signatory', 168, bottomY + 20, { align: 'center' });
  }

  // 7. Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 237, 235);
    doc.line(14, 285, 196, 285);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('Apex Global Exporters Pro • Official Export Quotation', 14, 289);
    doc.text(`Page ${i} of ${pageCount}`, 196, 289, { align: 'right' });
  }

  doc.save(filename);
}
