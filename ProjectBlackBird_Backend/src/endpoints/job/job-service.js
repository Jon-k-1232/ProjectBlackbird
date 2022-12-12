const jobService = {
  /**
   * Gets all jobs for a user provided company
   * @param {*} db takes in db
   * @param {*} time company OID
   * @returns [{},{}] Array of objects. Each object is a job for the given company
   */
  getJobs(db, companyId, currDate, prevDate) {
    return db
      .from('job')
      .whereIn('company', [companyId])
      .whereBetween('startDate', [prevDate, currDate])
      .join('company', 'job.company', '=', 'company.oid')
      .join('jobdefinition', 'job.jobDefinition', '=', 'jobdefinition.oid')
      .select(
        'job.oid',
        'job.company',
        'company.companyName',
        'jobdefinition.description',
        'job.description',
        'job.defaultDescription',
        'job.jobDefinition'
      );
  },

  getCompanyJobs(db, companyId) {
    return db
      .from('job')
      .whereIn('company', [companyId])
      .join('company', 'job.company', '=', 'company.oid')
      .join('jobdefinition', 'job.jobDefinition', '=', 'jobdefinition.oid')
      .select(
        'job.oid',
        'job.company',
        'company.companyName',
        'jobdefinition.description',
        'job.description',
        'job.defaultDescription',
        'job.jobDefinition'
      );
  },

  /**
   * Gets all jobs within a given time frame
   * @param {*} db takes in db
   * @param {*} time company OID
   * @returns [{},{}] Array of objects. Each object is a job
   */
  getAllJobs(db, currDate, prevDate) {
    return db
      .from('job')
      .whereBetween('startDate', [prevDate, currDate])
      .join('company', 'job.company', '=', 'company.oid')
      .join('jobdefinition', 'job.jobDefinition', '=', 'jobdefinition.oid')
      .select(
        'job.oid',
        'job.company',
        'company.companyName',
        'jobdefinition.description',
        'job.description',
        'job.defaultDescription',
        'job.jobDefinition'
      );
  },

  /**
   *
   * @param {*} db
   * @param {*} newMessage
   * @returns
   */
  insertNewJob(db, newJob) {
    return db.insert(newJob).returning('*').into('job');
  },

  /**
   * Get last oid
   * @param {*} db
   * @returns
   */
  getLastJobOidInDB(db) {
    return db.from('job').max('oid');
  }
};

module.exports = jobService;
