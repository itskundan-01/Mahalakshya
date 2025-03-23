/**
 * Utility functions for exporting transaction data
 */

/**
 * Convert transactions to CSV format and trigger download
 */
export const exportToCSV = (transactions, fileName = 'transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions to export');
  }
  
  // Define CSV header
  const headers = [
    'Date', 
    'Type', 
    'Description', 
    'Amount', 
    'Balance Before', 
    'Balance After'
  ];
  
  // Format transaction data
  const data = transactions.map(t => [
    new Date(t.createdAt).toLocaleDateString('en-IN'),
    t.type.toUpperCase(),
    t.description,
    t.amount,
    t.balanceBefore,
    t.balanceAfter
  ]);
  
  // Combine headers and data
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');
  
  // Create download link
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};

/**
 * Generate PDF from transactions and trigger download
 * Requires jspdf and jspdf-autotable libraries
 */
export const exportToPDF = async (transactions, formatCurrency, fileName = 'transactions.pdf') => {
  // Dynamically import the libraries only when needed
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions to export');
  }
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Transaction History', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 30);
  
  // Format data for table
  const tableData = transactions.map(t => [
    new Date(t.createdAt).toLocaleDateString('en-IN'),
    t.type.toUpperCase(),
    t.description,
    t.amount > 0 ? `+${formatCurrency(t.amount)}` : formatCurrency(t.amount),
    formatCurrency(t.balanceAfter)
  ]);
  
  // Generate table
  autoTable(doc, {
    startY: 35,
    head: [['Date', 'Type', 'Description', 'Amount', 'Balance After']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255
    },
    styles: {
      cellPadding: 3,
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      'MahaLakshya Virtual Trading Platform',
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(fileName);
};
