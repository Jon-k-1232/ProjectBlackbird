const express = require('express');
const invoiceRouter = express.Router();
const invoiceService = require('./invoice-service');
const helperFunctions = require('../../helperFunctions/helperFunctions');
const transactionService = require('../transactions/transactions-service');
const transactionsObjects = require('../transactions/transactionsObjects');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { defaultDaysInPast } = require('../../../config');
const { requireAuth } = require('../auth/jwt-auth');

invoiceRouter
  .route('/all/time/:time')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const time = Number(req.params.time) ? Number(req.params.time) : defaultDaysInPast;
    const timeBetween = helperFunctions.timeSubtractionFromTodayCalculator(time);

    invoiceService.getAllInvoices(db, timeBetween.currDate, timeBetween.prevDate).then(invoices => {
      res.send({
        invoices,
        status: 200
      });
    });
  });

// Gets all invoices + invoice detail for a specific company
invoiceRouter
  .route('/all/company/:company')
  .all(requireAuth)
  .get(async (req, res) => {
    const company = Number(req.params.company);
    const db = req.app.get('db');

    invoiceService.getCompanyInvoices(db, company).then(invoicesWithNoDetail => {
      res.send({
        invoicesWithNoDetail,
        status: 200
      });
    });
  });

// Gets all invoices that have a balance
invoiceRouter
  .route('/newInvoices')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    invoiceService.getNewInvoices(db).then(newBalanceInvoices => {
      const arrayOfIds = newBalanceInvoices.map(item => item.oid);

      invoiceService.getInvoiceDetail(db, arrayOfIds).then(details => {
        // Mapping invoice detail to each of the matching invoices
        const newInvoices = helperFunctions.addProperty(newBalanceInvoices, details, 'invoiceDetails', 'invoice', 'oid');

        res.send({
          newInvoices,
          status: 200
        });
      });
    });
  });

/**
 *
 */
invoiceRouter
  .route('/outstandingInvoices/:oid')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const { oid } = req.params;

    invoiceService.getOutstandingCompanyInvoice(db, Number(oid)).then(outstandingInvoiceForCompany => {
      if (outstandingInvoiceForCompany.length) {
        const outstandingInvoices = outstandingInvoiceForCompany.map(item => {
          const { oid, invoiceNumber, unPaidBalance, invoiceDate, paymentDueDate, address1 } = item;
          return {
            oid: oid,
            company: address1,
            invoiceNumber: invoiceNumber,
            unPaidBalance: unPaidBalance,
            invoiceDate: invoiceDate,
            paymentDueDate: paymentDueDate
          };
        });
        res.send({
          outstandingInvoices,
          status: 200
        });
      } else {
        const outstandingInvoices = {};
        res.send({
          outstandingInvoices,
          status: 200
        });
      }
    });
  });

invoiceRouter
  .route('/single/:invoiceId/:companyId')
  .all(requireAuth)
  .get(async (req, res) => {
    const invoice = req.params.invoiceId;
    const company = req.params.companyId;
    const dataToPass = { invoice, company };
    const db = req.app.get('db');

    // ToDo update this to get all invoice details. Invoice details to have all transactions and outstanding.
    const [invoiceDetails, returnedInvoice] = await fetchAllTransactionsOnInvoice(db, dataToPass);

    res.send({
      returnedInvoice,
      invoiceDetails,
      status: 200
    });
  });

/**
 * Updates and Invoice that already exists
 */
invoiceRouter
  .route('/updateInvoice')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');

    const {
      oid,
      company,
      invoiceNumber,
      contactName,
      address1,
      address2,
      address3,
      address4,
      address5,
      beginningBalance,
      totalPayments,
      totalNewCharges,
      endingBalance,
      unPaidBalance,
      invoiceDate,
      paymentDueDate,
      dataEndDate
    } = req.body;

    const cleanedFields = sanitizeFields({
      oid,
      company,
      invoiceNumber,
      contactName,
      address1,
      address2,
      address3,
      address4,
      address5,
      beginningBalance,
      totalPayments,
      totalNewCharges,
      endingBalance,
      unPaidBalance,
      invoiceDate,
      paymentDueDate,
      dataEndDate
    });

    const invoiceData = convertToOriginalTypes(cleanedFields);

    await invoiceService.updateWholeCompanyInvoice(db, invoiceData.invoiceNumber, invoiceData).then(invoiceConfirmed => {
      res.send({
        item: invoiceConfirmed,
        message: 'Transaction and account updated successfully.',
        status: 200
      });
    });
  });

module.exports = invoiceRouter;

const convertToOriginalTypes = invoice => {
  return {
    company: Number(invoice.company),
    invoiceNumber: Number(invoice.invoiceNumber),
    contactName: invoice.contactName,
    address1: invoice.address1,
    address2: invoice.address2,
    address3: invoice.address3,
    address4: invoice.address4,
    address5: invoice.address5,
    beginningBalance: Number(invoice.beginningBalance),
    totalPayments: Number(invoice.totalPayments),
    totalNewCharges: Number(invoice.totalNewCharges),
    endingBalance: Number(invoice.endingBalance),
    unPaidBalance: Number(invoice.unPaidBalance),
    invoiceDate: invoice.invoiceDate,
    paymentDueDate: invoice.paymentDueDate,
    dataEndDate: invoice.dataEndDate
  };
};

/**
 * Returns requested invoice and transactions.
 * @param {*} db
 * @param {*} dataToPass
 * @returns [invoiceDetails, returnedInvoice]
 */
const fetchAllTransactionsOnInvoice = async (db, dataToPass) => {
  const { invoice, company } = dataToPass;

  const returnedInvoice = await invoiceService.getSingleCompanyInvoice(db, dataToPass);

  // Having to get all transaction between dates since old data in transactions prior to June 2022 may not have a correct invoiceNumber.
  const returnedSelectedInvoice = await invoiceService.getSingleCompanyInvoice(db, dataToPass);
  const selectedInvoice = returnedSelectedInvoice[0];
  const returnedCompanyInvoices = await invoiceService.getCompanyInvoices(db, company);
  const sortedByDateCompanyInvoices = returnedCompanyInvoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));

  const indexOfPriorInvoice = sortedByDateCompanyInvoices.findIndex(invoice => invoice.oid === selectedInvoice.oid) + 1;
  const priorInvoiceEndDate = sortedByDateCompanyInvoices[indexOfPriorInvoice].dataEndDate;
  const selectedInvoiceEndDate = selectedInvoice.dataEndDate;

  const invoiceDetailsReturned = await transactionService.getCompanyTransactionsBetweenDates(
    db,
    company,
    selectedInvoiceEndDate,
    priorInvoiceEndDate
  );

  const invoiceDetails = invoiceDetailsReturned.map(transaction => transactionsObjects.createTransactionJobJoinObject(transaction));

  return [invoiceDetails, returnedInvoice];
};
