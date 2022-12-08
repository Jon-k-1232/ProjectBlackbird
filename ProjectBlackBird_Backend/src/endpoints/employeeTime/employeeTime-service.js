const employeeTimeService = {
  fetchTransactionsForGivenDate(db, startOfDay, endOfDay) {
    return db
      .select()
      .from('transaction')
      .whereBetween('transaction.transactionDate', [startOfDay, endOfDay])
      .where('transaction.transactionType', 'Time')
      .innerJoin('company', 'transaction.company', '=', 'company.oid')
      .innerJoin('job', 'transaction.job', '=', 'job.oid')
      .innerJoin('employee', 'transaction.employee', '=', 'employee.oid');
  }
};

module.exports = employeeTimeService;
