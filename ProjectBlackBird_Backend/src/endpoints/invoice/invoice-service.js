const invoiceService = {
  getAllInvoices(db, currDate, prevDate) {
    return db
      .from('invoice')
      .whereBetween('invoiceDate', [prevDate, currDate])
      .join('company', 'invoice.company', '=', 'company.oid')
      .select(
        'invoice.oid',
        'invoice.invoiceNumber',
        'invoice.company',
        'company.companyName',
        'invoice.contactName',
        'invoice.address1',
        'invoice.address2',
        'invoice.address3',
        'invoice.address4',
        'invoice.beginningBalance',
        'invoice.totalPayments',
        'invoice.totalNewCharges',
        'invoice.endingBalance',
        'invoice.unPaidBalance',
        'invoice.invoiceDate',
        'invoice.paymentDueDate',
        'invoice.dataEndDate'
      );
  },

  getCompanyInvoices(db, companyId) {
    return db
      .from('invoice')
      .whereIn('company', [companyId])
      .join('company', 'invoice.company', '=', 'company.oid')
      .select(
        'invoice.oid',
        'invoice.invoiceNumber',
        'invoice.company',
        'company.companyName',
        'invoice.contactName',
        'invoice.address1',
        'invoice.address2',
        'invoice.address3',
        'invoice.address4',
        'invoice.beginningBalance',
        'invoice.totalPayments',
        'invoice.totalNewCharges',
        'invoice.endingBalance',
        'invoice.unPaidBalance',
        'invoice.invoiceDate',
        'invoice.paymentDueDate',
        'invoice.dataEndDate'
      );
  },

  getSingleCompanyInvoice(db, companyDetails) {
    const { company, invoice } = companyDetails;
    return db.select().from('invoice').whereIn('invoiceNumber', [invoice]).whereIn('company', [company]);
  },

  getInvoiceByInvoiceId(db, invoiceId) {
    return db.select().from('invoice').whereIn('invoiceNumber', [invoiceId]);
  },

  getInvoiceDetail(db, arrayOfIds) {
    return db.select().from('invoiceDetail').whereIn('invoice', arrayOfIds);
  },

  getNewInvoices(db) {
    return db.select().from('invoice').where('endingBalance', '>', 0).orWhere('totalNewCharges', '>', 0).orWhere('unPaidBalance', '>', 0);
  },

  insertNewInvoice(db, newInvoice) {
    return db.insert(newInvoice).returning('*').into('invoice');
  },

  insertNewInvoiceDetails(db, job) {
    return db.insert(job).returning('*').into('invoiceDetail');
  },

  updateCompanyInvoice(db, invoiceRecord) {
    const { oid, unPaidBalance } = invoiceRecord;
    return db.update('unPaidBalance', unPaidBalance).from('invoice').where('oid', oid);
  },

  updateWholeCompanyInvoice(db, invoiceNumber, invoiceData) {
    return db.update(invoiceData).into('invoice').where('invoiceNumber', invoiceNumber).returning('*');
  },

  getOutstandingCompanyInvoice(db, oid) {
    return db.select().from('invoice').where('company', oid).where('unPaidBalance', '>', 0);
  },

  getOutstandingInvoice(db, record) {
    return db.select().from('invoice').where('invoiceNumber', record.invoice);
  },

  getOutstandingInvoicesArray(db, idArray, oid) {
    return db
      .select()
      .from('invoice')
      .where('company', oid)
      .where(builder => builder.whereIn('invoiceNumber', idArray))
      .orWhere('unPaidBalance', '>', 0)
      .where('company', oid);
  },

  getMostRecentCompanyInvoiceNumber(db, oid) {
    return db.select().from('invoice').where('company', oid).max('invoiceNumber');
  },

  getMostRecentCompanyInvoice(db, oid, invoiceNumber) {
    return db.select().from('invoice').whereIn('invoiceNumber', [invoiceNumber]).whereIn('company', [oid]);
  }
};

module.exports = invoiceService;
