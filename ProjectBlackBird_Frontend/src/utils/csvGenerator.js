import { ExportToCsv } from 'export-to-csv';
import dayjs from 'dayjs';

/**
 * https://www.npmjs.com/package/export-to-csv
 * creates a client side CSV
 * @param {*} data [{},{}] accepts an array of objects
 */
export const csvGenerator = (data, title) => {
  const options = {
    filename: `Invoices_For_Review_${dayjs().format('MMMM')}`,
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: false,
    title: title,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
  };

  const csvExporter = new ExportToCsv(options);

  csvExporter.generateCsv(data);
};

export const updateReviewInvoiceObject = invoicesForReviewArray =>
  invoicesForReviewArray.map(invoice => {
    const newObject = {
      company: invoice.company,
      contactName: invoice.contactName,
      address1: invoice.address1,
      address2: invoice.address2,
      address3: invoice.address3,
      address4: invoice.address4,
      dataEndDate: invoice.dataEndDate,
      beginningBalance: invoice.beginningBalance,
      totalPayments: invoice.totalPayments,
      totalNewCharges: invoice.totalNewCharges,
      unPaidBalance: invoice.unPaidBalance,
      endingBalance: invoice.endingBalance,
      hold: '',
      mail: '',
      email: '',
      adjustmentType: '',
      adjustmentAmount: '',
      reasonForAdjustment: '',
      jobToAdjust: ''
    };

    return newObject;
  });
