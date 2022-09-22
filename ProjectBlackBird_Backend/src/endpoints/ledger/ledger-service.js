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
  },

  updateCompanyCurrentBalance(db, updatedBalance) {
    const { company, newBalance, currentAccountBalance } = updatedBalance;
    return db
      .update('newBalance', newBalance)
      .update('currentAccountBalance', currentAccountBalance)
      .from('balance')
      .where('company', company);
  },

  zeroOutLedger(db, oid, update) {
    const { statementBalance, currentAccountBalance, beginningAccountBalance, advancedPayment } = update;
    return db
      .update('currentAccountBalance', currentAccountBalance)
      .update('statementBalance', statementBalance)
      .update('beginningAccountBalance', beginningAccountBalance)
      .update('advancedPayment', advancedPayment)
      .from('balance')
      .where('company', oid);
  },

  getLastLedgerOidInDB(db) {
    return db.from('balance').max('oid');
  }
};

module.exports = ledgerService;
