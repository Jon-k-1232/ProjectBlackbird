const express = require('express');
const { requireAuth } = require('../auth/jwt-auth');
const dayjs = require('dayjs');
const contactsRouter = express.Router();
const cleanUpService = require('./cleanUp-service');
const contactService = require('../contacts/contacts-service');

/**
 * Move clients older than a given date to prior clients
 */
contactsRouter
  .route('/oldClients/:date')
  // .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const date = dayjs(req.params.date).format();

    const allContacts = await contactService.getAllActiveContacts(db);
    const lastClientTransaction = await getLastContactTransaction(db, allContacts);
    const contactsToBeDeactivated = lastClientTransaction.filter(
      contact => contact.lastTransactionDate < date || contact.lastTransactionDate === null
    );

    contactsToBeDeactivated.map(async contact => {
      const { oid } = contact.contact;
      const update = { inactive: true, notBillable: true };
      await cleanUpService.companyDeactivation(db, oid, update);
    });

    res.send({
      status: 200
    });
  });

module.exports = contactsRouter;

/**
 * Gets the last transaction for each client.
 * @param {*} db
 * @param {*} allContacts
 * @returns {contact: contact, lastTransactionDate:{}}
 */
const getLastContactTransaction = async (db, allContacts) => {
  const clientsWithLastTransactions = await allContacts.map(async contact => {
    const lastTransactionDB = await cleanUpService.getLastContactTransactionInDB(db, contact.oid);
    const lastTransactionDate = lastTransactionDB[0].max ? dayjs(lastTransactionDB[0].max).format() : null;
    return { contact, lastTransactionDate };
  });
  return Promise.all(clientsWithLastTransactions);
};
