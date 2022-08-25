const express = require('express');
const monthlyClientsRouter = express.Router();
const monthlyClientsService = require('./monthlyClients-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');

// Gets active monthly clients
monthlyClientsRouter.route('/active').get(async (req, res) => {
  const db = req.app.get('db');

  monthlyClientsService.getMonthlyClients(db).then(clients => {
    res.send({
      clients,
      status: 200
    });
  });
});

// Add a monthly client
monthlyClientsRouter.route('/add').post(jsonParser, async (req, res) => {
  const db = req.app.get('db');
  const { company, monthlyCharge, lastInvoiced, inactive } = req.body;

  const newClient = sanitizeFields({
    company,
    monthlyCharge,
    lastInvoiced,
    inactive
  });

  monthlyClientsService.addMonthlyClient(db, newClient).then(() => {
    res.send({ message: 'Monthly Client Added successfully.', status: 200 });
  });
});

// Update a monthly client
monthlyClientsRouter.route('/update/:contactId').post(jsonParser, async (req, res) => {
  const db = req.app.get('db');
  const { contactId } = req.params;
  const id = Number(contactId);
  const { company, monthlyCharge, lastInvoiced, inactive } = req.body;

  const updatedClient = sanitizeFields({
    company,
    monthlyCharge,
    lastInvoiced,
    inactive
  });

  monthlyClientsService.updateMonthlyClient(db, updatedClient, id).then(() => {
    res.send({ message: 'Monthly Client Added successfully.', status: 200 });
  });
});

module.exports = monthlyClientsRouter;
