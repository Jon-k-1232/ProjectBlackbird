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

    const startOfDay = dayjs(date).format();
    const endOfDay = dayjs(date).endOf('day').format();

    const employeeTime = await employeeTimeService.fetchTransactionsForGivenDate(db, startOfDay, endOfDay);
    const sortedTimeByEmployee = sortEmployeeTime(employeeTime);
    const employees = await employeeService.getActiveEmployees(db);
    const activeEmployees = employeeObjects.sendColumnsTypes(employees);

    res.send({
      sortedTimeByEmployee,
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
const sortEmployeeTime = employeeTime =>
  employeeTime.reduce((acc, obj) => {
    const { company, companyName, job, quantity, defaultDescription } = obj;
    const newClientsObject = { company, companyName, quantity, jobs: [] };
    const newJobObject = { job, defaultDescription, quantity };
    const key = obj['employee'];

    if (!acc[key]) acc[key] = { employee: null, id: null, hours: 0, clients: [] };

    if (!acc[key].clients.some(item => item.company === obj.company)) {
      newClientsObject['jobs'].push(newJobObject);
      acc[key].clients.push(newClientsObject);
    } else {
      acc[key].clients.forEach(item => {
        if (item.company === obj.company) {
          item.quantity = Number((item.quantity + obj.quantity).toFixed(2));
          return item.jobs.push(newJobObject);
        }
        return item;
      });
    }

    acc[key].employee = obj.displayname;
    acc[key].id = obj.employee;
    acc[key].hours = Number((acc[key].hours + obj.quantity).toFixed(2));
    return acc;
  }, {});
