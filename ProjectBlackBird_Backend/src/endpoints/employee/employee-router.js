const express = require('express');
const employeeRouter = express.Router();
const employeeService = require('./employee-service');
const employeeObjects = require('./employeeObjects');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

// Returns all employees active and inactive
employeeRouter
   .route('/all')
   .all(requireAuth)
   .get(async (req, res) => {
      const db = req.app.get('db');

      employeeService.getAllEmployees(db).then(employeeData => {
         const employees = employeeObjects.sendColumnsTypes(employeeData);
         res.send({
            employees,
            status: 200
         });
      });
   });

// Returns all active employees
employeeRouter
   .route('/allActiveEmployees')
   .all(requireAuth)
   .get(async (req, res) => {
      const db = req.app.get('db');

      const activeEmployees = await employeeService.getActiveEmployees(db);
      const employees = employeeObjects.sendColumnsTypes(activeEmployees);

      res.send({
         employees,
         status: 200
      });
   });

employeeRouter
   .route('/findEmployee/:employeeId')
   .all(requireAuth)
   .get(async (req, res) => {
      const db = req.app.get('db');
      const employeeId = Number(req.params.employeeId);

      employeeService.getEmployee(db, employeeId).then(employeeData => {
         const employee = employeeObjects.sendColumnsTypes(employeeData);
         res.send({
            employee,
            status: 200
         });
      });
   });

/**
 * New Employee
 */
employeeRouter
   .route('/new/employee')
   .all(requireAuth)
   .post(jsonParser, async (req, res) => {
      const db = req.app.get('db');
      const { firstName, lastName, middleI, hourlyCost, inactive, username, password, role } = req.body;

      const sanitizeEmployee = sanitizeFields({
         firstName,
         lastName,
         middleI,
         hourlyCost,
         inactive,
         username,
         password,
         role
      });

      const newEmployee = employeeObjects.convertToOriginalTypes(sanitizeEmployee);

      employeeService.insertEmployee(db, newEmployee).then(() => {
         res.send({
            message: 'New employee added',
            status: 200
         });
      });
   });

/**
 * Update employee
 */
employeeRouter
   .route('/update/employee/:employeeId')
   .all(requireAuth)
   .post(jsonParser, async (req, res) => {
      const db = req.app.get('db');
      const { employeeId } = req.params;
      const id = Number(employeeId);
      const { firstName, lastName, middleI, hourlyCost, inactive, username, password, role } = req.body;

      const sanitizeEmployee = sanitizeFields({
         firstName,
         lastName,
         middleI,
         hourlyCost,
         inactive,
         username,
         password,
         role
      });

      const updatedEmployee = employeeObjects.convertToOriginalTypes(sanitizeEmployee);

      employeeService.updateEmployee(db, id, updatedEmployee).then(() => {
         employeeService.getAllEmployees(db).then(employees => {
            res.send({
               employees,
               message: 'Employee updated',
               status: 200
            });
         });
      });
   });

module.exports = employeeRouter;
