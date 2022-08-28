import { tableAndLabelCreation } from './Adapters/AdapterHelperFunctions';
import config from '../config';

/**
 * Gets all company information
 * @returns [{},{},{}] Array of objects
 */
export const getAllCompanies = () => {
  return fetch(`${config.API_ENDPOINT}/contacts/all`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { allContactInfo } = data;
      return tableAndLabelCreation(allContactInfo, 'oid', 'company');
    })
    .catch(error => error);
};

/**
 * Gets active company information
 * @returns [{},{},{}] Array of objects
 */
export const getActiveCompanies = () => {
  return fetch(`${config.API_ENDPOINT}/contacts/allActiveContacts`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { activeContacts } = data;
      return activeContacts.length > 0 ? tableAndLabelCreation(activeContacts, 'oid', 'company') : noData;
    })
    .catch(error => error);
};

/**
 * Gets prior clients
 * @returns
 */
export const getPriorCompanies = () => {
  return fetch(`${config.API_ENDPOINT}/contacts/allPriorContacts`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { priorContacts } = data;
      return priorContacts.length > 0 ? tableAndLabelCreation(priorContacts, 'oid', 'company') : noData;
    })
    .catch(error => error);
};

/**
 * Gets company information via query
 * @param {*} companyId Integer oid of company
 * @returns {object} Object is company information
 */
export const getCompanyInformation = companyId => {
  return fetch(`${config.API_ENDPOINT}/contacts/company/${companyId}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      return data.companyContactInformation[0];
    })
    .catch(error => error);
};

/**
 *
 */
export const getCompanyTransactions = (companyId, time) => {
  const allCompanyTransactions = fetch(`${config.API_ENDPOINT}/transactions/companyTransactions/${companyId}/${time}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { sortedCompanyTransactions } = data;
      return sortedCompanyTransactions.length > 0 ? tableAndLabelCreation(sortedCompanyTransactions, 'oid', 'company') : noData;
    })
    .catch(error => error);
  return allCompanyTransactions;
};

/**
 *
 */
export const getCompanyInvoices = companyId => {
  return fetch(`${config.API_ENDPOINT}/invoices/all/company/${companyId}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { invoicesWithNoDetail } = data;
      return invoicesWithNoDetail.length > 0 ? tableAndLabelCreation(invoicesWithNoDetail, 'oid', 'contactName') : noData;
    })
    .catch(error => error);
};

/**
 *
 */
export const getAllTransactions = time => {
  return fetch(`${config.API_ENDPOINT}/transactions/all/${time}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { allTransactions } = data;
      return allTransactions.length > 0 ? tableAndLabelCreation(allTransactions, 'oid', 'company') : noData;
    })
    .catch(error => error);
};

/**
 *
 */
export const getJobTransactions = (companyId, jobId) => {
  return fetch(`${config.API_ENDPOINT}/transactions/jobTransactions/${companyId}/${jobId}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { jobTransactions } = data;
      return jobTransactions.length > 0 ? tableAndLabelCreation(jobTransactions, 'jobDefinition', 'description') : noData;
    })
    .catch(error => error);
};

/**
 *
 */
export const getAllJobs = time => {
  return fetch(`${config.API_ENDPOINT}/jobs/allJobs/${time}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { allJobsWithinTimeframe } = data;
      return allJobsWithinTimeframe.length > 0 ? tableAndLabelCreation(allJobsWithinTimeframe, 'jobDefinition', 'description') : noData;
    })
    .catch(error => error);
};

/**
 *
 */
export const getCompanyJobs = (companyId, time) => {
  return fetch(`${config.API_ENDPOINT}/jobs/all/${companyId}/${time}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { jobs } = data;
      return jobs.length > 0 ? tableAndLabelCreation(jobs, 'jobDefinition', 'description') : noData;
    })
    .catch(error => error);
};

/**
 * Gets all job types/descriptions/definitions
 */
export const getAllJobDefinitions = () => {
  return fetch(`${config.API_ENDPOINT}/jobDescription/all`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { allJobDescriptions } = data;
      return allJobDescriptions.length > 0 ? tableAndLabelCreation(allJobDescriptions, 'oid', 'description') : noData;
    })
    .catch(error => error);
};

/**
 * Gets all Employees active and inactive
 * @returns [{},{},{}] Array of objects. Each object is a employee
 */
export const getAllEmployees = () => {
  return fetch(`${config.API_ENDPOINT}/employee/allActiveEmployees`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { employees } = data;
      return employees.length > 0 ? tableAndLabelCreation(employees, 'oid', 'firstName', 'lastName', 'employees') : noData;
    })
    .catch(error => error);
};

/**
 * Gets a specific employee
 */

export const getEmployee = employeeId => {
  return fetch(`${config.API_ENDPOINT}/employee/findEmployee/${employeeId}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { employee } = data;
      return employee[0];
    })
    .catch(error => error);
};

export const getMonthlyClients = () => {
  return fetch(`${config.API_ENDPOINT}/monthlyClients/active`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { clients } = data;
      return clients.length > 0 ? tableAndLabelCreation(clients, 'oid', 'company') : noData;
    })
    .catch(error => error);
};

/**
 * Gets all invoices
 * @param {*} time Integer in days. How many days in past
 * @returns [{},{},{}] arrays of objects, each object is a invoice
 */
export const getAllInvoices = time => {
  return fetch(`${config.API_ENDPOINT}/invoices/all/time/${time}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { invoices } = data;
      return invoices.length > 0 ? tableAndLabelCreation(invoices, 'oid', 'contactName') : noData;
    })
    .catch(error => error);
};

/**
 * Gets a specific invoice
 * @param {*} oid oid of invoice
 * @returns [{}] array of objects. object is invoice
 */
export const getAnInvoice = (invoiceId, companyId) => {
  return fetch(`${config.API_ENDPOINT}/invoices/single/${invoiceId}/${companyId}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { returnedInvoice, invoiceDetails } = data;
      const invoice = returnedInvoice[0];
      const details = invoiceDetails.length > 0 ? tableAndLabelCreation(invoiceDetails, 'oid', 'contactName') : noData;
      return { invoice, details };
    })
    .catch(error => error);
};

/**
 * Gets all users that are ready for billing
 * @returns
 */
export const getAllReadyToBillInvoices = () => {
  return fetch(`${config.API_ENDPOINT}/create/createInvoices/readyToBill`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { readyToBillContacts } = data;
      return readyToBillContacts.length > 0 ? tableAndLabelCreation(readyToBillContacts, 'oid', 'firstName') : noData;
    })
    .catch(error => error);
};

/**
 *
 * @returns Creates and gets zip file from backend
 */
export const getZippedInvoices = () => {
  return fetch(`${config.API_ENDPOINT}/create/download`, getHeader)
    .then(res => res.blob())
    .then(data => {
      var url = window.URL.createObjectURL(data);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'downloaded_file.zip';
      // We need to append the element to the dom -> otherwise it will not work in firefox
      document.body.appendChild(a);
      a.click();
      //afterwards we remove the element again
      a.remove();
    })
    .catch(error => error);
};

export const getOutstandingInvoiceForCompany = selectedCompany => {
  return fetch(`${config.API_ENDPOINT}/invoices/outstandingInvoices/${selectedCompany.oid}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(data => {
      const { outstandingInvoices } = data;
      return outstandingInvoices.length ? tableAndLabelCreation(outstandingInvoices, 'oid', 'companyName') : null;
    })
    .catch(error => error);
};

export const rePrintInvoice = async invoiceId => {
  return fetch(`${config.API_ENDPOINT}/create/createInvoices/rePrint/${invoiceId}`, getHeader)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(resp.status);
      }
      return resp.json();
    })
    .then(res => res)
    .catch(error => error);
};

const noData = {
  rawData: [],
  tableData: [],
  tableHeaders: []
};

const getHeader = {
  method: 'GET',
  headers: {
    'content-type': 'application/json',
    Authorization: `${config.API_TOKEN}`,
    Origin: `${config.FRONT_WEB}`
  }
};
