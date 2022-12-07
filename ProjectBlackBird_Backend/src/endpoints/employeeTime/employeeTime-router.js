const express = require('express');
const employeeTimeRouter = express.Router();
const employeeTimeService = require('./employeeTime-service');
const employeeService = require('../employee/employee-service');
const employeeObjects = require('../employee/employeeObjects');
const { requireAuth } = require('../auth/jwt-auth');
const dayjs = require('dayjs');

// Returns all employees active and inactive
employeeTimeRouter
  .route('/history/:date')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const date = req.params.date;
    const requestedDate = checkForWeekendRequest(date);

    console.log(requestedDate);

    // Get transactions and create list of employees with time
    const transactions = await employeeTimeService.fetchTransactionsForGivenDate(db, requestedDate.startOfDay, requestedDate.endOfDay);
    const employeesWithTime = getEmployeeTime(transactions);
    // Get list of active employees
    const employees = await employeeService.getActiveEmployees(db);
    const activeEmployees = employeeObjects.sendColumnsTypes(employees);
    // Create list of all employees with time, and no time input
    const employeeTime = getAllEmployeesTime(employeesWithTime, activeEmployees);

    res.send({
      employeeTime,
      activeEmployees,
      status: 200
    });
  });

module.exports = employeeTimeRouter;

/**
 * Checks to see if date requested is a weekend.
 * @param {*} date
 * @returns
 */
const checkForWeekendRequest = date => {
  // const checkDayOfWeekOnStart = dayjs(date).get('day');

  // if (checkDayOfWeekOnStart === 0) {
  //   // sunday condition
  //   const startOfDay = dayjs(date).subtract(3, 'day').startOf('day').format();
  //   const endOfDay = dayjs(date).subtract(3, 'day').endOf('day').format();
  //   return { startOfDay, endOfDay };
  // } else if (checkDayOfWeekOnStart === 6) {
  //   // saturday condition
  //   const startOfDay = dayjs(date).subtract(2, 'day').startOf('day').format();
  //   const endOfDay = dayjs(date).subtract(2, 'day').endOf('day').format();
  //   return { startOfDay, endOfDay };
  // }

  // if {
  // Monday-Friday condition
  const startOfDay = dayjs(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const endOfDay = dayjs(date).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
  return { startOfDay, endOfDay };
  // }
};

/**
 * Time is broken down by how a employee spent time on a client
 * @param {*} employeeTime
 * @returns { Object } Object where each employee is a key and the value is the client, and jobs for that client.
 */
const getEmployeeTime = employeeTime =>
  employeeTime.reduce((acc, obj) => {
    const { company, companyName, job, quantity, defaultDescription } = obj;
    const newClientsObject = { company, companyName, time: quantity, jobs: [] };
    const newJobObject = { job, description: defaultDescription, time: quantity };
    const key = obj['employee'];

    if (!acc[key]) acc[key] = { employee: null, id: null, time: 0, clients: [] };

    if (!acc[key].clients.some(item => item.company === obj.company)) {
      newClientsObject['jobs'].push(newJobObject);
      acc[key].clients.push(newClientsObject);
    } else {
      acc[key].clients.forEach(item => {
        if (item.company === obj.company) {
          item.time = Number((item.time + obj.quantity).toFixed(2));
          return item.jobs.push(newJobObject);
        }
        return item;
      });
    }

    acc[key].employee = obj.displayname;
    acc[key].id = obj.employee;
    acc[key].time = Number((acc[key].time + obj.quantity).toFixed(2));
    return acc;
  }, {});

const getAllEmployeesTime = (employeesWithTime, activeEmployees) => {
  const idsOfEmployeesWithTime = Object.keys(employeesWithTime).map(item => Number(item));
  const missingEmployees = activeEmployees.filter(employee => !idsOfEmployeesWithTime.includes(employee.oid));
  const employeesWithoutTime = missingEmployees.reduce((prev, curr) => {
    if (!prev[curr.oid]) prev[curr.oid] = { employee: curr.displayname, id: curr.oid, time: 0, clients: [] };
    return prev;
  }, {});

  return { ...employeesWithTime, ...employeesWithoutTime };
};
