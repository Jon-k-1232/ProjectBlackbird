const express = require('express');
const contactsRouter = express.Router();
const contactService = require('./contacts-service');
const contactObjects = require('./contactObjects');
const ledgerService = require('../ledger/ledger-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

/**
 * Gets all contacts
 */
contactsRouter
  .route('/all')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    contactService.getAllContactsInfo(db).then(allContactInfo => {
      res.send({
        allContactInfo,
        status: 200
      });
    });
  });

/**
 * Finds company with company id
 */
contactsRouter
  .route('/company/:companyId')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const companyId = Number(req.params.companyId);

    const ledgers = await ledgerService.getCompanyLedger(db, Number(companyId));

    contactService.getContactInfo(db, companyId).then(company => {
      const companyContactInformation = contactObjects.mergeContactAndLedger(company[0], ledgers[0]);
      res.send({
        companyContactInformation,
        status: 200
      });
    });
  });

/**
 * Gets all active contacts
 */
contactsRouter
  .route('/allActiveContacts')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    contactService.getAllActiveContacts(db).then(activeContacts => {
      res.send({
        activeContacts,
        status: 200
      });
    });
  });

/**
 * Gets priorClients
 */
contactsRouter
  .route('/allPriorContacts')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    contactService.getAllPriorContacts(db).then(priorContacts => {
      res.send({
        priorContacts,
        status: 200
      });
    });
  });

/**
 * Adds a new contact
 */
contactsRouter
  .route('/new/contact')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const {
      companyName,
      firstName,
      lastName,
      middleI,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phoneNumber1,
      mobilePhone,
      inactive,
      notBillable,
      newBalance,
      company,
      advancedPayment,
      currentAccountBalance,
      beginningAccountBalance,
      statementBalance
    } = req.body;

    const cleanedFields = sanitizeFields({
      companyName,
      firstName,
      lastName,
      middleI,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phoneNumber1,
      mobilePhone,
      inactive,
      notBillable,
      newBalance,
      company,
      advancedPayment,
      currentAccountBalance,
      beginningAccountBalance,
      statementBalance
    });

    // Insert into contact
    const contactInfo = contactObjects.convertToRequiredTypes(cleanedFields);
    const lastContactOid = await contactService.getLastContactOidInDB(db);
    const contactOid = Number(lastContactOid[0].max) + 1;
    const newCompany = await contactService.insertNewContact(db, contactInfo, contactOid);

    // Insert new record for balance
    const ledgerInfo = contactObjects.convertToRequiredLedgerTypes(cleanedFields, contactOid);
    const newCompanyLedger = await ledgerService.insertNewCompanyLedger(db, ledgerInfo);

    // Create new object to return
    const newInsertedContact = contactObjects.mergeContactAndLedger(newCompany[0], newCompanyLedger[0]);

    if (newCompany.length === 0 || newCompanyLedger.length === 0) {
      res.send({
        message: 'Error',
        status: 400
      });
    } else {
      res.send({
        newInsertedContact,
        message: 'Contact added successfully.',
        status: 200
      });
    }
  });

/**
 * Updates a user specified user. Param is integer
 */
contactsRouter
  .route('/update/contact/:contactId')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { contactId } = req.params;
    const id = Number(contactId);
    const {
      companyName,
      firstName,
      lastName,
      middleI,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phoneNumber1,
      mobilePhone,
      inactive,
      notBillable
    } = req.body;

    const cleanedFields = sanitizeFields({
      companyName,
      firstName,
      lastName,
      middleI,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phoneNumber1,
      mobilePhone,
      inactive,
      notBillable
    });

    const updatedContact = contactObjects.convertToRequiredTypes(cleanedFields);

    contactService.updateContact(db, id, updatedContact).then(updatedContact => {
      res.send({
        updatedContact,
        message: 'Contact description updated',
        status: 200
      });
    });
  });

contactsRouter
  .route('/zeroAndDeactivate')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { companyId } = req.body;

    const sanitizedId = sanitizeFields({ companyId });
    const contactId = Number(sanitizedId.companyId);
    const updatedContact = await cleanup(contactId, db);

    res.send({
      updatedContact,
      status: 200
    });
  });

contactsRouter
  .route('/zeroOutCompany')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { companyId } = req.body;

    const sanitizedId = sanitizeFields({ companyId });
    const contactId = Number(sanitizedId.companyId);
    const updatedContact = await zeroContact(contactId, db);

    res.send({
      updatedContact,
      status: 200
    });
  });

module.exports = contactsRouter;

/**
 *
 * @param {*} contactId
 * @param {*} db
 * @returns
 */
const cleanup = async (contactId, db) => {
  const update = {
    statementBalance: 0,
    currentAccountBalance: 0,
    beginningAccountBalance: 0,
    advancedPayment: 0,
    newBalance: false,
    inactive: true,
    notBillable: true
  };

  await contactService.companyCleanupForDeactivation(db, contactId, update);
  await ledgerService.zeroOutLedger(db, contactId, update);
  const updateContact = await contactService.companyRecordAndBalance(db, contactId);
  const contact = updateContact[0];
  return contactObjects.contactObject(contact);
};

/**
 *
 * @param {*} contactId
 * @param {*} db
 * @returns
 */
const zeroContact = async (contactId, db) => {
  const update = {
    statementBalance: 0,
    currentAccountBalance: 0,
    beginningAccountBalance: 0,
    advancedPayment: 0,
    newBalance: false
  };

  await contactService.companyZeroOut(db, contactId, update);
  await ledgerService.zeroOutLedger(db, contactId, update);
  const updateContact = await contactService.companyRecordAndBalance(db, contactId);
  const contact = updateContact[0];
  return contactObjects.contactObject(contact);
};
