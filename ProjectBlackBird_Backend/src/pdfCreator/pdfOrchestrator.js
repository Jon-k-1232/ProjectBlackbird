const fs = require('fs');
const PDFDocument = require('./pdfkit-tables');
const AdmZip = require('adm-zip');
const { defaultPdfSaveLocation } = require('../../config');
const dayjs = require('dayjs');
const { getCompanyTransactionsAfterLastInvoice } = require('../endpoints/createInvoice/createInvoice-service');

//www.youtube.com/watch?v=fKewAlUwRPk     ---- stream ---- does not save on server

// https://pdfkit.org/docs/text.html
// https://pspdfkit.com/blog/2019/generate-pdf-invoices-pdfkit-nodejs/
// https://stackabuse.com/generating-pdf-files-in-node-js-with-pdfkit/
// https://www.geeksforgeeks.org/how-to-convert-a-file-to-zip-file-and-download-it-using-node-js/
// https://thecodebarbarian.com/working-with-zip-files-in-node-js.html

const pdfAndZipFunctions = {
  pdfCreate: async (invoiceDetails, arrayOfDataToCreate, setupData) => {
    const folderPath = defaultPdfSaveLocation;

    // Makes directory if it does not exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const pdfArr = [];
    const convertToArray = [arrayOfDataToCreate];

    convertToArray.map(invoice => {
      const { beginningBalanceTotaledAndGrouped, paymentsTotaledAndGrouped, transactionsTotaledAndGrouped } = invoiceDetails;
      const { invoiceNumber, contactName, address1, address3, address4, endingBalance, invoiceDate, paymentDueDate } = invoice;

      // removes any slashes from name and any '/' will escape and code will think additional file path.
      const testContactNameForBlanks = contactName.replace(/\s+/g, '');
      const selectContactName = testContactNameForBlanks.length ? contactName : address1;
      const cleanContactName =
        selectContactName.charAt(0).toUpperCase() +
        selectContactName
          .slice(1)
          .match(/[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g)
          .join()
          .replace(/,/g, ' ');

      const boldFont = 'Helvetica-Bold';
      const normalFont = 'Helvetica';

      // a3 = 8x12 piece of paper
      const doc = new PDFDocument({ size: 'A3' });
      doc.pipe(fs.createWriteStream(`${folderPath}/${cleanContactName}.pdf`));
      // header of bill
      doc.image('./images/logo.png', 10, 95, { width: 60 });
      doc.font(boldFont).fontSize(12).text(`${setupData.customerName}`, 75, 100);
      doc.font(normalFont).fontSize(12).text(`${setupData.customerAddress}`, 75, 130);
      doc.font(normalFont).fontSize(12).text(`${setupData.customerCity}, ${setupData.customerState} ${setupData.customerZip}`, 75, 145);
      doc.font(boldFont).fontSize(20).text(`INVOICE`, 685, 100);
      doc.font(boldFont).fontSize(12).text(`${invoiceNumber}`, 710, 130);
      doc.font(normalFont).fontSize(12).text(`Phone:     ${setupData.customerPhone}`, 640, 155);
      doc.font(normalFont).fontSize(12).text(`Fax:     ${setupData.customerFax}`, 655, 170);
      doc.lineCap('butt').lineWidth(4).moveTo(10, 210).lineTo(770, 210).stroke();

      // Bill To --------------------------------------------------------------------------------------
      doc.font(normalFont).fontSize(12).text(`Bill To:`, 20, 235);

      contactName && doc.font(normalFont).fontSize(12).text(`${contactName}`, 75, 235);
      address1 && doc.font(normalFont).fontSize(12).text(`${address1}`, 75, 255);
      address3 && doc.font(normalFont).fontSize(12).text(`${address3}`, 75, 275);
      address4 && doc.font(normalFont).fontSize(12).text(`${address4}`, 75, 295);

      // Statement dates and starting amount ----------------------------------------------------------
      doc.font(normalFont).fontSize(12).text(`Statement Date:`, 590, 235);
      doc.font(normalFont).fontSize(12).text(`Payment Due Date:`, 573, 255);

      doc
        .font(normalFont)
        .fontSize(12)
        .text(`${dayjs(invoiceDate).format('MM/DD/YYYY')}`, 700, 235);
      doc
        .font(normalFont)
        .fontSize(12)
        .text(`${dayjs(paymentDueDate).format('MM/DD/YYYY')}`, 700, 255);

      // Outstanding Charges -------------------------------------------------------------------------
      let height = 385;

      doc.font(boldFont).fontSize(14).text('Beginning Balance', 10, height);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Invoice Date', 25, height + 20);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Invoice', 200, height + 20);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Original Amount', 400, height + 20);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Outstanding', 700, height + 20);
      // left to right, height
      doc
        .lineCap('butt')
        .lineWidth(1)
        .moveTo(10, height + 40)
        .lineTo(770, height + 40)
        .stroke();

      height = height + 30;

      if (Object.keys(beginningBalanceTotaledAndGrouped.groupedInvoices)) {
        Object.entries(beginningBalanceTotaledAndGrouped.groupedInvoices).forEach(outstandingRecord => {
          const [key, value] = outstandingRecord;

          height = height + 20;
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${dayjs(value.invoiceDate).format('MM/DD/YYYY')}`, 25, height);
          doc.font(normalFont).fontSize(12).text(`${value.invoice}`, 200, height);
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${value.invoiceTotal.toFixed(2)}`, 400, height);
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${value.invoiceTotal.toFixed(2)}`, 700, height);
        });
      }

      doc
        .lineCap('butt')
        .lineWidth(1)
        .moveTo(10, height + 25)
        .lineTo(770, height + 25)
        .stroke();
      doc
        .font(normalFont)
        .fontSize(12)
        .text(`Beginning Balance:`, 574, height + 45);

      doc
        .font(normalFont)
        .fontSize(12)
        .text(`${beginningBalanceTotaledAndGrouped.subTotal.toFixed(2)}`, 700, height + 45);

      // Payments ---------------------------------------------------------------------------------
      height = height + 80;

      //Payments (x,y) (width from left, height from top)
      doc.font(boldFont).fontSize(14).text('Payments', 10, height);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Date', 25, height + 20);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Invoice', 200, height + 20);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Amount', 700, height + 20);
      // left to right, height
      doc
        .lineCap('butt')
        .lineWidth(1)
        .moveTo(10, height + 40)
        .lineTo(770, height + 40)
        .stroke();

      height = height + 30;

      if (Object.keys(paymentsTotaledAndGrouped.groupedPayments)) {
        Object.entries(paymentsTotaledAndGrouped.groupedPayments).forEach(paymentRecord => {
          const [key, value] = paymentRecord;

          height = height + 20;

          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${dayjs(value.transactionDate).format('MM/DD/YYYY')}`, 25, height);

          value.invoice != 0 && doc.font(normalFont).fontSize(12).text(`${value.invoice}`, 200, height);
          value.invoice === 0 && doc.font(normalFont).fontSize(12).text(`${invoiceNumber}`, 200, height);

          doc
            .font(normalFont)
            .fontSize(8)
            .text('Payment - Thank You', 300, height + 2);

          value.transactionType === 'Write Off' &&
            doc
              .font(normalFont)
              .fontSize(8)
              .text('Write Off', 300, height + 2);
          doc
            .font(normalFont)
            .fontSize(12)
            .text(value.invoiceTotal.toFixed(2) || '0.00', 700, height);
        });
      }

      doc
        .lineCap('butt')
        .lineWidth(1)
        .moveTo(10, height + 25)
        .lineTo(770, height + 25)
        .stroke();

      doc
        .font(normalFont)
        .fontSize(12)
        .text('Total Payments: ', 592, height + 45);
      doc
        .font(normalFont)
        .fontSize(12)
        .text(`${paymentsTotaledAndGrouped.subTotal.toFixed(2)}` || '0.00', 700, height + 45);

      // Charges ------------------------------------------------------------------------------------------
      height = height + 10;

      doc
        .font(boldFont)
        .fontSize(14)
        .text('Professional Services', 10, height + 65);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Job', 25, height + 90);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Job Description', 90, height + 90);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Charge', 592, height + 90);
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Net', 700, height + 90);
      doc
        .lineCap('butt')
        .lineWidth(1)
        .moveTo(10, height + 110)
        .lineTo(770, height + 110)
        .stroke();

      height = height + 105;

      if (Object.keys(transactionsTotaledAndGrouped.groupedTransactions)) {
        Object.entries(transactionsTotaledAndGrouped.groupedTransactions).forEach(chargeRecord => {
          const [key, value] = chargeRecord;

          height = height + 20;
          doc.font(normalFont).fontSize(12).text(`${value.job}`, 25, height);
          doc.font(normalFont).fontSize(12).text(`${value.description}`, 90, height);
          doc.font(normalFont).fontSize(12).text(value.jobTotal, 595, height);
        });
      }

      doc
        .lineCap('butt')
        .lineWidth(1)
        .moveTo(10, height + 20)
        .lineTo(770, height + 20)
        .stroke();

      doc
        .font(normalFont)
        .fontSize(12)
        .text('Total new Charges:', 575, height + 55);
      doc
        .font(normalFont)
        .fontSize(12)
        .text(`${transactionsTotaledAndGrouped.subTotal.toFixed(2)}`, 700, height + 55);

      // Total
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Ending Balance:', 590, height + 85);

      doc
        .font(boldFont)
        .fontSize(14)
        .text(`${endingBalance.toFixed(2)}`, 700, height + 85);

      doc
        .font(normalFont)
        .fontSize(14)
        .text('* Please reference the invoice number on payment. Thanks!', 20, height + 130);

      // Interest statement
      doc.font(normalFont).fontSize(10).text(`${setupData.statementText}`, 250, 1100);

      doc.end();
      pdfArr.push(doc);
    });
    return 200;
  },

  /**
   * Creates the zip output file
   * @returns
   */
  zipCreate: async () => {
    const file = new AdmZip();
    file.addLocalFolder(defaultPdfSaveLocation);
    fs.writeFileSync(`${defaultPdfSaveLocation}/output.zip`, file.toBuffer());
    return 200;
  }
};

module.exports = pdfAndZipFunctions;
