const advancedPaymentService = {
  getAllAdvancedPayments(db) {
    return db.select().table('advancedPayments');
  },

  getAllCompanyAdvancedPayments(db, oid) {
    return db.select().from('advancedPayments').where('company', oid);
  },

  getCompanyAdvancedPaymentsGreaterThanZero(db, oid) {
    return db.select().from('advancedPayments').where('company', oid).where('availableAmount', '>', 0);
  },

  insertNewAdvancedPayment(db, newAdvancedPayment) {
    return db.insert(newAdvancedPayment).into('advancedPayments').returning('*');
  },

  updateAdvancedPayment(db, recordOid, availableAmount) {
    return db.update('availableAmount', availableAmount).from('advancedPayments').where('oid', recordOid).returning('*');
  }
};

module.exports = advancedPaymentService;
