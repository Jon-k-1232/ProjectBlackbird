const monthlyClientsService = {
  getMonthlyClients(db) {
    return db.select().table('monthlyClients').whereIn('inactive', [false]);
  },

  addMonthlyClient(db, newClient) {
    return db.insert(newClient).into('monthlyClients').returning();
  },

  updateMonthlyClient(db, updatedClient, contactId) {
    return db.update(updatedClient).from('monthlyClients').where('oid', contactId).returning('*');
  }
};

module.exports = monthlyClientsService;
