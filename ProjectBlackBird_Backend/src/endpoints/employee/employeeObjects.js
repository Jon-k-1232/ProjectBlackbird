const convertToOriginalTypes = sanitizeEmployee => {
  return {
    firstName: sanitizeEmployee.firstName,
    lastName: sanitizeEmployee.lastName,
    middleI: sanitizeEmployee.middleI,
    hourlyCost: Number(sanitizeEmployee.hourlyCost),
    inactive: Boolean(sanitizeEmployee.inactive),
    username: sanitizeEmployee.username,
    password: sanitizeEmployee.password,
    role: sanitizeEmployee.role
  };
};

const sendColumnsTypes = employees =>
  employees.map(item => {
    return {
      oid: Number(item.oid),
      firstName: item.firstName,
      lastName: item.lastName,
      middleI: item.middleI,
      hourlyCost: item.hourlyCost,
      inactive: item.inactive
    };
  });

module.exports = { convertToOriginalTypes, sendColumnsTypes };
