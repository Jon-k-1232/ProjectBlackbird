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

export const updateReviewInvoiceObject = invoicesForReviewArray => {
  return invoicesForReviewArray.map(invoice => {
    const { unPaidBalance, endingBalance } = invoice;
    const { oid, companyName, address1, city, zip, state, firstName, lastName } = invoice.contact;
    const startingSubTotal = invoice.beginningBalanceTotaledAndGrouped.subTotal;
    const paymentSubTotal = invoice.paymentsTotaledAndGrouped.subTotal;
    const chargesSubTotal = invoice.transactionsTotaledAndGrouped.subTotal;
    const { advancedPaymentsAvailableTotal, advancedPaymentSubtotal } = invoice.advancedPaymentsAppliedToTransactions;

    return {
      company: oid,
      contactName: companyName,
      address1: `${firstName} ${lastName}`,
      address2: `${address1}, ${city}, ${state} ${zip}`,
      beginningBalance: startingSubTotal.toFixed(2),
      totalPayments: paymentSubTotal.toFixed(2),
      totalNewCharges: chargesSubTotal.toFixed(2),
      beginningRetainer: advancedPaymentSubtotal.toFixed(2),
      remainingRetainer: advancedPaymentsAvailableTotal.toFixed(2),
      unPaidBalance: unPaidBalance.toFixed(2),
      endingBalance: endingBalance.toFixed(2),
      hold: '',
      mail: '',
      email: '',
      adjustmentType: '',
      adjustmentAmount: '',
      reasonForAdjustment: '',
      jobToAdjust: ''
    };
  });
};
