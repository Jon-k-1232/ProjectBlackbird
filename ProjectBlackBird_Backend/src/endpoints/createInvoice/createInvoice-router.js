const express = require('express');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');
const fs = require('fs');
const path = require('path');
const createInvoiceRouter = express.Router();
const createInvoiceService = require('./createInvoice-service');
const invoiceService = require('./../invoice/invoice-service');
const transactionService = require('./../transactions/transactions-service');
const contactService = require('../contacts/contacts-service');
const advancedPaymentService = require('../advancedPayment/advancedPayment-service');
const createNewInvoice = require('./createInvoiceOrchestrator');
const pdfAndZipFunctions = require('../../pdfCreator/pdfOrchestrator');
const contactObjects = require('../contacts/contactObjects');
const { defaultPdfSaveLocation } = require('../../../config');
const dayjs = require('dayjs');

/**
 * List of invoice ready to bill. User to select which invoices to create
 */
createInvoiceRouter
  .route('/createInvoices/readyToBill')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    //TODO keep below two lines for now. Need to test new way.
    // const readyToBill = await createInvoiceService.getReadyToBill(db);
    // const readyToBillContacts = readyToBill.map(contact => contactObjects.contactObjectReduced(contact));

    // Get contacts
    const contacts = await contactService.getAllActiveContacts(db);
    // Find who has outstanding items since last invoice
    const contactsWithNewOrOutstandingItems = await getItemsForBilling(db, contacts);
    // Format found contacts
    const readyToBillContacts = contactsWithNewOrOutstandingItems.map(contact => contactObjects.contactObjectReduced(contact.contact));

    res.send({
      readyToBillContacts,
      status: 200
    });
  });

/**
 * User selected invoices, create invoices
 */
createInvoiceRouter
  .route('/createInvoices/readyToBill/:list/:invoiceRoughDraft/:createPdfInvoice')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const list = req.params.list;
    const { invoiceRoughDraft, createPdfInvoice } = req.params;
    const roughDraft = JSON.parse(invoiceRoughDraft);
    const createPdf = JSON.parse(createPdfInvoice);
    const contactBalance = false;

    const sanitizedData = sanitizeFields({ list });
    // Since sanitized, list is one giant string, must be separated at commas then converted into ints
    const separatedList = sanitizedData.list.split(',');
    const arrayOfIds = separatedList.map(item => Number(item));

    const newInvoices = await createNewInvoice(arrayOfIds, roughDraft, createPdf, db, contactBalance);

    res.send({
      newInvoices,
      status: 200
    });
  });

/**
 * Zips the pdf files and sends to front end
 */
createInvoiceRouter
  .route('/download')
  .all(requireAuth)
  .get(async (req, res) => {
    // Zip the files
    await pdfAndZipFunctions.zipCreate();

    // Assigned the name to downloaded file!
    const file_after_download = 'downloaded_file.zip';

    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
    res.download(`${defaultPdfSaveLocation}/output.zip`);

    // Deletes the contents of the pdf directory to ensure the directory does not exponentially grow
    fs.readdir(defaultPdfSaveLocation, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        fs.unlink(path.join(defaultPdfSaveLocation, file), err => {
          if (err) throw err;
        });
      });
    });
  });

/**
 * Reprint a invoice that already exists
 */
createInvoiceRouter
  .route('/createInvoices/rePrint/:id')
  .all(requireAuth)
  .get(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;

    // Get data from DB to rebuild invoice
    const invoiceId = Number(id);
    const invoiceFromDb = await invoiceService.getInvoiceByInvoiceId(db, invoiceId);
    const invoice = invoiceFromDb[0];
    const transactionsFromDB = await transactionService.getInvoiceTransactions(db, invoice.oid);
    const transactions = transactionsFromDB;
    const payToFromDb = await createInvoiceService.getBillTo(db);
    const payTo = payToFromDb[0];

    // Form object to pass to pdf creator
    const invoiceObject = {
      ...invoice,
      beginningBalance: invoice.beginningBalance.toFixed(2),
      totalPayments: invoice.totalPayments.toFixed(2),
      totalNewCharges: invoice.totalNewCharges.toFixed(2),
      endingBalance: invoice.endingBalance.toFixed(2),
      unPaidBalance: invoice.unPaidBalance.toFixed(2),
      // Unable to get outstanding records at the specific time in history. Would need to create new table to capture unpaid invoices and their balances.
      outstandingInvoiceRecords: [],
      paymentRecords: transactions.filter(trans => trans.transactionType === 'Payment' || trans.transactionType === 'WriteOff'),
      newChargesRecords: transactions.filter(
        trans =>
          trans.transactionType === 'Adjustment' ||
          trans.transactionType === 'Charge' ||
          trans.transactionType === 'Interest' ||
          trans.transactionType === 'Time'
      )
    };

    // Create Pdf
    await pdfAndZipFunctions.pdfCreate(invoiceObject, payTo);

    res.send({ invoiceObject, status: 200 });
  });

module.exports = createInvoiceRouter;

/**
 * Intakes contacts, and will find outstanding charges, time, unpaid invoices, and advanced payments above 0
 * @param {*} db 
 * @param {*} contacts 
 * @returns {} array of all contacts 
 *    { 
 *    contact:{},
 *    advancedPayments: [],
      unpaidInvoices: [],
      newCompanyTime: [],
      newCompanyCharges:[]
    }
 */
const getItemsForBilling = async (db, contacts) => {
  const itemsForBilling = contacts.map(async contact => {
    const lastCompanyInvoiceNumber = await invoiceService.getMostRecentCompanyInvoiceNumber(db, contact.oid);
    const lastCompanyInvoice = await invoiceService.getMostRecentCompanyInvoice(db, contact.oid, Number(lastCompanyInvoiceNumber[0].max));
    const lastInvoiceDate = lastCompanyInvoice.length && dayjs(lastCompanyInvoice[0].dataEndDate).format();
    const lastInvoiceDataEndDate = lastCompanyInvoice.length ? lastInvoiceDate : dayjs().subtract(365, 'day');

    const newCompanyCharges = await transactionService.getCompanyTransactionTypeAfterGivenDate(
      db,
      contact.oid,
      lastInvoiceDataEndDate,
      'Charge'
    );
    const newCompanyTime = await transactionService.getCompanyTransactionTypeAfterGivenDate(
      db,
      contact.oid,
      lastInvoiceDataEndDate,
      'Time'
    );
    const advancedPayments = await advancedPaymentService.getCompanyAdvancedPaymentsGreaterThanZero(db, contact.oid);
    const unpaidInvoices = await invoiceService.getOutstandingCompanyInvoice(db, contact.oid);

    return {
      contact: contact,
      advancedPayments: advancedPayments,
      unpaidInvoices: unpaidInvoices,
      newCompanyTime: newCompanyTime,
      newCompanyCharges: newCompanyCharges
    };
  });

  const itemsNeedingFilter = await Promise.all(itemsForBilling);
  // Only get contacts that have outstanding items.
  return itemsNeedingFilter.filter(
    contact =>
      contact.advancedPayments.length || contact.unpaidInvoices.length || contact.newCompanyTime.length || contact.newCompanyCharges.length
  );
};
