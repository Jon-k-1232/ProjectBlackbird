const ledgerService = {
  getAllLedgers(db) {
    return db.select().table('balance');
  },

  getCompanyLedger(db, companyId) {
    return db.select().table('balance').where('company', companyId);
  },

  insertNewCompanyLedger(db, newLedger) {
    return db.insert(newLedger).into('balance').returning('*');
  },

  updateCompanyLedger(db, updatedLedger) {
    return db.update(updatedLedger).from('balance').where('company', updatedLedger.company).returning('*');
  }
};

module.exports = ledgerService;
