const express = require('express');
const employeeTimeRouter = express.Router();
const employeeTimeService = require('./employeeTime-service');
const employeeService = require('../employee/employee-service');
const employeeObjects = require('../employee/employeeObjects');
const { requireAuth } = require('../auth/jwt-auth');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Returns all employees active and inactive
employeeTimeRouter
  .route('/history/:date')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const date = req.params.date;

    // Having to use timezone as server deployed on keeps defaulting to different timezone for these two lines.
    const startOfDay = dayjs(date).tz('America/Phoenix').startOf('day').format();
    const endOfDay = dayjs(date).tz('America/Phoenix').endOf('day').format();

    // Get transactions and create list of employees with time
    const transactions = await employeeTimeService.fetchTransactionsForGivenDate(db, startOfDay, endOfDay);
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
