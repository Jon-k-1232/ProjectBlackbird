const contactService = {
  getAllContactsInfo(db) {
    return db.select().table('company');
  },

  getAllActiveContacts(db) {
    return db.select().from('company').whereIn('inactive', [false]);
  },

  getAllPriorContacts(db) {
    return db.select().from('company').whereIn('inactive', [true]);
  },

  getContactInfo(db, id) {
    return db.select().from('company').whereIn('oid', [id]);
  },

  insertNewContact(db, newContact) {
    return db.insert(newContact).into('company').returning();
  },

  getLastContactOidInDB(db) {
    return db.from('company').max('oid');
  },

  updateContact(db, contactId, updatedContact) {
    return db.update(updatedContact).from('company').where('oid', contactId).returning('*');
  },

  companyRecordAndBalance(db, contactId) {
    return db.select().from('company').where('company.oid', contactId).innerJoin('balance', 'company.oid', 'balance.company');
  },

  companyCleanupForDeactivation(db, oid, update) {
    const { inactive, notBillable } = update;
    return db.update('inactive', inactive).update('notBillable', notBillable).from('company').where('oid', oid);
  },

  companyZeroOut(db, oid, update) {
    const { newBalance } = update;
    return db.update('newBalance', newBalance).from('company').where('oid', oid);
  }
};

module.exports = contactService;
