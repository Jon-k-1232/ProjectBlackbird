const fs = require('fs');
const PDFDocument = require('./pdfkit-tables');
const AdmZip = require('adm-zip');
const { defaultPdfSaveLocation } = require('../../config');
const dayjs = require('dayjs');

//www.youtube.com/watch?v=fKewAlUwRPk     ---- stream ---- does not save on server

// https://pdfkit.org/docs/text.html
// https://pspdfkit.com/blog/2019/generate-pdf-invoices-pdfkit-nodejs/
// https://stackabuse.com/generating-pdf-files-in-node-js-with-pdfkit/
// https://www.geeksforgeeks.org/how-to-convert-a-file-to-zip-file-and-download-it-using-node-js/
// https://thecodebarbarian.com/working-with-zip-files-in-node-js.html

const pdfAndZipFunctions = {
  pdfCreate: async (arrayOfDataToCreate, setupData) => {
    const folderPath = defaultPdfSaveLocation;

    // Makes directory if it does not exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const pdfArr = [];
    const convertToArray = [arrayOfDataToCreate];

    convertToArray.map(invoice => {
      const {
        invoiceNumber,
        contactName,
        address1,
        address2,
        address3,
        address4,
        address5,
        beginningBalance,
        outstandingInvoiceRecords,
        totalPayments,
        paymentRecords,
        totalNewCharges,
        newChargesRecords,
        endingBalance,
        invoiceDate,
        paymentDueDate
      } = invoice;

      // removes any slashes from name and any '/' will escape and code will think additional file path.
      const cleanContactName =
        contactName.charAt(0).toUpperCase() +
        contactName
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
      address2 && doc.font(normalFont).fontSize(12).text(`${address2}`, 75, 275);
      address3 && doc.font(normalFont).fontSize(12).text(`${address3}`, 75, 295);
      address4 && doc.font(normalFont).fontSize(12).text(`${address4}`, 75, 315);

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

      if (outstandingInvoiceRecords.length) {
        outstandingInvoiceRecords.forEach(outstandingRecord => {
          // This only is for display on the bill only, does not effect DB. Only helps with readability of invoice
          displayOfUnpaid = paymentRecords.reduce((prev, curr) => {
            if (Number(outstandingRecord.invoiceNumber) === Number(curr.invoice)) {
              return (prev = Number(prev) + Number(Math.abs(curr.totalTransaction)));
            }
            return outstandingRecord.unPaidBalance;
          }, outstandingRecord.unPaidBalance);

          height = height + 20;
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${dayjs(outstandingRecord.invoiceDate).format('MM/DD/YYYY')}`, 25, height);
          doc.font(normalFont).fontSize(12).text(`${outstandingRecord.invoiceNumber}`, 200, height);
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${outstandingRecord.totalNewCharges.toFixed(2)}`, 400, height);
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${displayOfUnpaid.toFixed(2)}`, 700, height);
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

      // Displays total for ease of bill reading.
      const unpaidDisplayTotal = paymentRecords.reduce((prev, curr) => {
        const match = outstandingInvoiceRecords.find(outstandingRecord => Number(outstandingRecord.invoiceNumber) === Number(curr.invoice));
        if (match) {
          return (prev = Number(prev) + Number(Math.abs(curr.totalTransaction)));
        }
        return beginningBalance;
      }, beginningBalance);

      doc
        .font(normalFont)
        .fontSize(12)
        .text(`${unpaidDisplayTotal.toFixed(2)}`, 700, height + 45);

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

      if (paymentRecords.length) {
        paymentRecords.forEach(paymentRecord => {
          height = height + 20;
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${dayjs(paymentRecord.transactionDate).format('MM/DD/YYYY')}`, 25, height);
          paymentRecord.invoice != 0 && doc.font(normalFont).fontSize(12).text(`${paymentRecord.invoice}`, 200, height);
          paymentRecord.invoice === 0 && doc.font(normalFont).fontSize(12).text(`${invoiceNumber}`, 200, height);
          paymentRecord.transactionType === 'Write Off' &&
            doc
              .font(normalFont)
              .fontSize(8)
              .text('Write Off', 300, height + 2);
          doc
            .font(normalFont)
            .fontSize(12)
            .text((paymentRecord.totalTransaction && `${paymentRecord.totalTransaction.toFixed(2)}`) || '0.00', 700, height);
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
        .text((totalPayments && `${totalPayments.toFixed(2)}`) || '0.00', 700, height + 45);

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

      if (newChargesRecords.length && newChargesRecords.totalCharges !== 0) {
        newChargesRecords.forEach(chargeRecord => {
          const totalAmount = (
            Number(chargeRecord.totalCharges) +
            Number(chargeRecord.totalAdjustments) +
            Number(chargeRecord.totalTime) +
            Number(chargeRecord.totalInterest)
          ).toFixed(2);

          const { totalTransaction } = chargeRecord;

          height = height + 20;
          doc.font(normalFont).fontSize(12).text(`${chargeRecord.job}`, 25, height);
          doc.font(normalFont).fontSize(12).text(`${chargeRecord.description}`, 90, height);
          doc
            .font(normalFont)
            .fontSize(12)
            .text(`${totalTransaction || totalAmount}`, 595, height);
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
        .text(`${totalNewCharges.toFixed(2)}`, 700, height + 55);

      // Total
      doc
        .font(normalFont)
        .fontSize(12)
        .text('Ending Balance:', 590, height + 85);
      doc
        .font(boldFont)
        .fontSize(14)
        .text(`${endingBalance.toFixed(2)}`, 700, height + 85);

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
