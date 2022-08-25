const monthlyClientsService = {
  getMonthlyClients(db) {
    return db.select().table('monthlyclients').whereIn('inactive', [false]);
  },

  addMonthlyClient(db, newClient) {
    return db.insert(newClient).into('monthlyclients').returning();
  },

  updateMonthlyClient(db, updatedClient, contactId) {
    return db.update(updatedClient).from('monthlyclients').where('oid', contactId).returning('*');
  }
};

module.exports = monthlyClientsService;
