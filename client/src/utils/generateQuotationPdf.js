import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateQuotationPdf(quotation) {
  if (!quotation) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currCode = quotation.currency || 'INR';
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
  const primaryColor = [8, 122, 104]; // #087a68 Emerald brand
  const darkTeal = [12, 70, 80];     // #0c4650
  const textColor = [40, 60, 65];
  const mutedColor = [110, 130, 135];

  // 1. Header Banner & Branding
  doc.setFillColor(247, 251, 250); // soft mint background
  doc.rect(0, 0, 210, 42, 'F');

  // Emerald accent top bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 3.5, 'F');

  // Company Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text('MASTER EXPORT PRO', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Simplified Export Business ERP & Logistics', 14, 21);
  doc.text('123 Trade Center, Business Bay, New York, NY 10001, USA', 14, 26);
  doc.text('Email: sales@masterexportpro.com | GST/Tax ID: 123456789', 14, 31);

  // Document Title & Meta (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('QUOTATION', 196, 17, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text(quotation.quotationNo || 'QUO-2026-0001', 196, 23, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`Issue Date: ${quotation.quotationDate || new Date().toISOString().slice(0, 10)}`, 196, 28, { align: 'right' });
  doc.text(`Valid Until: ${quotation.validUntil || '30 Days'}`, 196, 33, { align: 'right' });

  // Status Badge
  const statusStr = (quotation.status || 'Draft').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  if (statusStr === 'ACCEPTED') {
    doc.setTextColor(16, 123, 92);
  } else if (statusStr === 'SENT') {
    doc.setTextColor(43, 114, 199);
  } else {
    doc.setTextColor(179, 115, 20);
  }
  doc.text(`STATUS: ${statusStr}`, 196, 38, { align: 'right' });

  // Divider
  doc.setDrawColor(220, 235, 232);
  doc.setLineWidth(0.4);
  doc.line(14, 44, 196, 44);

  // 2. Buyer and Shipping Information (2 Columns)
  let yPos = 50;

  // Box 1: Customer Details
  doc.setFillColor(252, 254, 254);
  doc.setDrawColor(226, 237, 235);
  doc.roundedRect(14, yPos, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('QUOTED TO / CUSTOMER:', 18, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text(quotation.customer || quotation.companyName || 'Valued Customer', 18, yPos + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  if (quotation.contactPerson) {
    doc.text(`Attn: ${quotation.contactPerson}`, 18, yPos + 17);
  }
  if (quotation.email) {
    doc.text(`Email: ${quotation.email}`, 18, yPos + 21);
  }
  if (quotation.destination || quotation.address) {
    const dest = quotation.destination || quotation.address;
    doc.text(`Destination: ${dest}`, 18, yPos + 25);
  }

  // Box 2: Terms & Shipping Reference
  doc.setFillColor(252, 254, 254);
  doc.roundedRect(108, yPos, 88, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('COMMERCIAL & EXPORT TERMS:', 112, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Currency: ${currCode} (${currencySymbol.trim()})`, 112, yPos + 12);
  doc.text(`Incoterm: ${quotation.incoterm || 'CIF'}`, 112, yPos + 17);
  doc.text(`Payment Terms: ${quotation.paymentTerms || 'Net 30'}`, 112, yPos + 21);
  doc.text(`Delivery Port: ${quotation.destination || 'Destination Port'}`, 112, yPos + 25);

  yPos += 36;

  // 3. Line Items Table (autoTable)
  const items = quotation.items && quotation.items.length > 0 ? quotation.items : [
    {
      name: 'Custom Product',
      description: 'Standard export specification',
      quantity: 1,
      unit: 'PCS',
      unitPrice: quotation.grandTotal || 0,
      discount: 0,
      taxRate: 0,
      lineTotal: quotation.grandTotal || 0
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
      `${qty} ${it.unit || 'PCS'}`,
      `${currencySymbol}${price.toFixed(2)}`,
      discStr,
      taxStr,
      `${currencySymbol}${total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Item & Description', 'Qty', 'Unit Price', 'Discount', 'Tax Rate', 'Line Total']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
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
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
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

  // Check if we need a new page for totals & terms
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
  doc.text(`${currencySymbol}${Number(quotation.subtotal || quotation.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });

  finalY += 5;
  if (quotation.totalDiscount > 0) {
    doc.text('Discount:', summaryX, finalY);
    doc.text(`-${currencySymbol}${Number(quotation.totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });
    finalY += 5;
  }

  if (quotation.taxTotal > 0) {
    doc.text('Tax / VAT:', summaryX, finalY);
    doc.text(`${currencySymbol}${Number(quotation.taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });
    finalY += 5;
  }

  if (quotation.shippingCharges > 0) {
    doc.text(`Freight & Insurance (${quotation.incoterm || 'CIF'}):`, summaryX, finalY);
    doc.text(`${currencySymbol}${Number(quotation.shippingCharges).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });
    finalY += 5;
  }

  // Grand Total Box
  doc.setFillColor(244, 250, 248);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(summaryX - 4, finalY - 1, 80, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.text('Grand Total:', summaryX, finalY + 6);
  doc.text(`${currencySymbol}${Number(quotation.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValX - 2, finalY + 6, { align: 'right' });

  // 5. Notes, Terms & Conditions, and Signatures (Left column)
  let termsY = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('NOTES & SPECIFICATIONS:', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const notesText = quotation.notes || 'All goods inspected according to export standards. Standard seaworthy packaging.';
  const splitNotes = doc.splitTextToSize(notesText, 95);
  doc.text(splitNotes, 14, termsY + 4);

  termsY += 5 + (splitNotes.length * 3.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TERMS & CONDITIONS:', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const termsText = quotation.termsAndConditions || '1. Prices valid until validity date.\n2. Payment terms as stated.\n3. Goods dispatch within 14 days of order.';
  const splitTerms = doc.splitTextToSize(termsText, 95);
  doc.text(splitTerms, 14, termsY + 4);

  // 6. Authorized Signatory (Bottom right)
  const bottomY = Math.max(finalY + 20, termsY + (splitTerms.length * 3.5) + 10);
  if (bottomY < 265) {
    doc.setDrawColor(180, 200, 198);
    doc.line(140, bottomY + 12, 196, bottomY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text('Master Export Pro Inc.', 168, bottomY + 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('Authorized Signatory', 168, bottomY + 20, { align: 'center' });
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
    doc.text('Master Export Pro • Official Export Quotation • www.masterexportpro.com', 14, 289);
    doc.text(`Page ${i} of ${pageCount}`, 196, 289, { align: 'right' });
  }

  // Meaningful filename: e.g. Quotation-QUO-2026-0001.pdf
  const filename = `Quotation-${quotation.quotationNo || 'QUO-2026-0001'}.pdf`;
  doc.save(filename);
}
