const ExcelJS = require('exceljs');

const EXPORT_HEADERS = ['Form Type', 'Title', 'Location', 'Survey Date', 'Status', 'Created By', 'Created At', 'Form Data'];

const formatRecord = (record) => ({
  formType: record.formType || '',
  title: record.title || '',
  location: record.location || '',    
  surveyDate: record.surveyDate ? new Date(record.surveyDate).toISOString().split('T')[0] : '',
  status: record.status || '',
  createdBy: record.createdBy
    ? `${record.createdBy.name || ''} (${record.createdBy.email || ''})`
    : String(record.createdBy || ''),
  createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : '',
  formData: JSON.stringify(record.formData || {}),
});

/**
 * Generate CSV string from survey records
 */
const generateCSV = (records) => {
  const rows = [EXPORT_HEADERS.join(',')];

  records.forEach((record) => {
    const f = formatRecord(record);
    const row = [
      `"${f.formType.replace(/"/g, '""')}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.location.replace(/"/g, '""')}"`,
      `"${f.surveyDate}"`,
      `"${f.status}"`,
      `"${f.createdBy.replace(/"/g, '""')}"`,
      `"${f.createdAt}"`,
      `"${f.formData.replace(/"/g, '""')}"`,
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
};

/**
 * Generate Excel buffer from survey records
 */
const generateExcel = async (records) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Survey API';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Survey Records', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Style the header row
  sheet.columns = [
    { header: 'Form Type', key: 'formType', width: 24 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Survey Date', key: 'surveyDate', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created By', key: 'createdBy', width: 30 },
    { header: 'Created At', key: 'createdAt', width: 22 },
    { header: 'Form Data', key: 'formData', width: 70 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 22;

  // Add data rows
  records.forEach((record, idx) => {
    const f = formatRecord(record);
    const row = sheet.addRow(f);
    const fillColor = idx % 2 === 0 ? 'FFF2F4F8' : 'FFFFFFFF';
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };

      // Color-code status cells
      if (cell.col === 5) {
        const statusColors = { Approved: 'FF27AE60', Rejected: 'FFE74C3C', Pending: 'FFF39C12' };
        cell.font = { color: { argb: statusColors[f.status] || 'FF000000' }, bold: true };
      }
    });
    row.height = 18;
  });

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add auto filter
  sheet.autoFilter = { from: 'A1', to: 'H1' };

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [{ header: 'Metric', key: 'metric', width: 20 }, { header: 'Value', key: 'value', width: 15 }];
  const statusCounts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  summarySheet.addRow({ metric: 'Total Records', value: records.length });
  summarySheet.addRow({ metric: 'Approved', value: statusCounts['Approved'] || 0 });
  summarySheet.addRow({ metric: 'Pending', value: statusCounts['Pending'] || 0 });
  summarySheet.addRow({ metric: 'Rejected', value: statusCounts['Rejected'] || 0 });
  summarySheet.addRow({ metric: 'Export Date', value: new Date().toISOString() });

  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
  });

  return workbook.xlsx.writeBuffer();
};

module.exports = { generateCSV, generateExcel };
