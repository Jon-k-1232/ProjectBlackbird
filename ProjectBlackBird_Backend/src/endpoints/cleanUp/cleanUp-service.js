const cleanUpService = {
  getLastContactTransactionInDB(db, oid) {
    return db.select().from('transaction').whereIn('company', [oid]).max('transactionDate');
  },

  companyDeactivation(db, oid, update) {
    const { inactive, notBillable } = update;
    return db.update('inactive', inactive).update('notBillable', notBillable).from('company').where('oid', oid);
  },

  getAllInvoices(db) {
    return db.select().from('invoice');
  },

  deleteInvoice(db, companyId, invoiceNumber) {
    return db.from('invoice').whereIn('company', [companyId]).whereIn('invoiceNumber', [invoiceNumber]).del();
  }
};

module.exports = cleanUpService;
