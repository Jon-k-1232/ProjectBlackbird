const express = require('express');
const contactsRouter = express.Router();
const contactService = require('./contacts-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');
const ledgerService = require('../ledger/ledger-service');

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
      const companyContactInformation = formContactAndLedger(company[0], ledgers[0]);

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
      newBalance,
      balanceChanged,
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
      currentBalance,
      beginningBalance,
      statementBalance,
      inactive,
      originalCurrentBalance,
      notBillable
    } = req.body;

    const cleanedFields = sanitizeFields({
      newBalance,
      balanceChanged,
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
      currentBalance,
      beginningBalance,
      statementBalance,
      inactive,
      originalCurrentBalance,
      notBillable
    });

    const contactInfo = convertToRequiredTypes(cleanedFields);
    const lastOid = await contactService.getLastContactOidInDB(db);
    const oid = Number(lastOid[0].max) + 1;
    const newContact = { ...contactInfo, oid };

    contactService.insertNewContact(db, newContact).then(updatedContact => {
      res.send({
        updatedContact,
        message: 'Contact added successfully.',
        status: 200
      });
    });
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
      newBalance,
      balanceChanged,
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
      currentBalance,
      beginningBalance,
      statementBalance,
      inactive,
      originalCurrentBalance,
      notBillable
    } = req.body;

    const cleanedFields = sanitizeFields({
      newBalance,
      balanceChanged,
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
      currentBalance,
      beginningBalance,
      statementBalance,
      inactive,
      originalCurrentBalance,
      notBillable
    });

    const updatedContact = convertToRequiredTypes(cleanedFields);

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

const formContactAndLedger = (contactItem, ledger) => {
  return {
    newBalance: ledger.newBalance,
    companyName: contactItem.companyName,
    firstName: contactItem.firstName,
    lastName: contactItem.lastName,
    middleI: contactItem.middleI,
    address1: contactItem.address1,
    address2: contactItem.address2,
    city: contactItem.city,
    state: contactItem.state,
    zip: contactItem.zip,
    country: contactItem.country,
    phoneNumber1: contactItem.phoneNumber1,
    mobilePhone: contactItem.mobilePhone,
    advancedPayment: ledger.advancedPayment,
    currentBalance: ledger.currentAccountBalance,
    beginningBalance: ledger.beginningAccountBalance,
    statementBalance: ledger.statementBalance,
    inactive: contactItem.inactive,
    notBillable: contactItem.notBillable
  };
};

/**
 * Takes params and converts required items to correct type for db insert.
 * @param {*} contactItem
 * @returns
 */
const convertToRequiredTypes = contactItem => {
  return {
    newBalance: Boolean(contactItem.newBalance),
    balanceChanged: Boolean(contactItem.balanceChanged),
    companyName: contactItem.companyName,
    firstName: contactItem.firstName,
    lastName: contactItem.lastName,
    middleI: contactItem.middleI,
    address1: contactItem.address1,
    address2: contactItem.address2,
    city: contactItem.city,
    state: contactItem.state,
    zip: contactItem.zip,
    country: contactItem.country,
    phoneNumber1: contactItem.phoneNumber1,
    mobilePhone: contactItem.mobilePhone,
    currentBalance: Number(contactItem.currentBalance),
    beginningBalance: Number(contactItem.beginningBalance),
    statementBalance: Number(contactItem.statementBalance),
    inactive: Boolean(contactItem.inactive),
    originalCurrentBalance: Number(contactItem.originalCurrentBalance),
    notBillable: Boolean(contactItem.notBillable)
  };
};

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
  return createObject(contact);
};

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
  return createObject(contact);
};

const createObject = contact => {
  return {
    oid: contact.company,
    newBalance: contact.newBalance,
    companyName: contact.companyName,
    firstName: contact.firstName,
    lastName: contact.lastName,
    middleI: contact.middleI,
    address1: contact.address1,
    address2: contact.address2,
    city: contact.city,
    state: contact.state,
    zip: contact.zip,
    country: contact.country,
    phoneNumber1: contact.phoneNumber1,
    mobilePhone: contact.mobilePhone,
    currentBalance: contact.currentAccountBalance,
    beginningBalance: contact.beginningAccountBalance,
    statementBalance: contact.statementBalance,
    advancedPayment: contact.advancedPayment,
    inactive: contact.inactive,
    notBillable: contact.notBillable
  };
};
