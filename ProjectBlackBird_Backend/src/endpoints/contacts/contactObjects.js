contactObjects = {
  mergeContactAndLedger(contactItem, ledger) {
    return {
      oid: contactItem.oid,
      newBalance: ledger.newBalance,
      companyName: contactItem.companyName,
      firstName: contactItem.firstName,
      lastName: contactItem.lastName,
      middleI: contactItem.middleI,
      address1: contactItem.address1,
      address2: contactItem.address2,
      city: contactItem.city,
      state: contactItem.state,
      zip: contactItem.zip,
      country: contactItem.country,
      phoneNumber1: contactItem.phoneNumber1,
      mobilePhone: contactItem.mobilePhone,
      advancedPayment: ledger.advancedPayment,
      currentBalance: ledger.currentAccountBalance,
      beginningBalance: ledger.beginningAccountBalance,
      statementBalance: ledger.statementBalance,
      inactive: contactItem.inactive,
      notBillable: contactItem.notBillable
    };
  },

  contactObject(contact) {
    return {
      oid: contact.company,
      newBalance: contact.newBalance,
      companyName: contact.companyName,
      firstName: contact.firstName,
      lastName: contact.lastName,
      middleI: contact.middleI,
      address1: contact.address1,
      address2: contact.address2,
      city: contact.city,
      state: contact.state,
      zip: contact.zip,
      country: contact.country,
      phoneNumber1: contact.phoneNumber1,
      mobilePhone: contact.mobilePhone,
      currentBalance: contact.currentAccountBalance,
      beginningBalance: contact.beginningAccountBalance,
      statementBalance: contact.statementBalance,
      advancedPayment: contact.advancedPayment,
      inactive: contact.inactive,
      notBillable: contact.notBillable
    };
  },

  convertToRequiredLedgerTypes(ledger, newCompanyId) {
    return {
      newBalance: Number(ledger.newBalance),
      company: Number(newCompanyId),
      advancedPayment: Number(ledger.advancedPayment),
      currentAccountBalance: Number(ledger.currentAccountBalance),
      beginningAccountBalance: Number(ledger.beginningAccountBalance),
      statementBalance: Number(ledger.statementBalance)
    };
  },

  convertToRequiredTypes(contactItem) {
    return {
      companyName: contactItem.companyName,
      firstName: contactItem.firstName,
      lastName: contactItem.lastName,
      middleI: contactItem.middleI,
      address1: contactItem.address1,
      address2: contactItem.address2,
      city: contactItem.city,
      state: contactItem.state,
      zip: contactItem.zip,
      country: contactItem.country,
      phoneNumber1: contactItem.phoneNumber1,
      mobilePhone: contactItem.mobilePhone,
      inactive: Boolean(contactItem.inactive),
      notBillable: Boolean(contactItem.notBillable)
    };
  }
};

module.exports = contactObjects;
