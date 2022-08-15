// Gets headers, capitalizes the first letters, and inserts spaces between numbers and caps.
export const getTableHeaders = rawData => {
  const columns = Object.keys(rawData[0]);

  return columns.map(
    item =>
      item.charAt(0).toUpperCase() +
      item
        .slice(1)
        .match(/[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g)
        .join()
        .replace(/,/g, ' ')
  );
};

// Makes table data
export const getDataTable = rawData => {
  // Gets the values of the passed data. Converts from object to array
  const tableValues = rawData.map(Object.values);

  // Stringifies each individual Value
  return tableValues.map(item =>
    item.map(value => {
      let stringedItem = value;
      if (typeof value !== 'string') {
        stringedItem = JSON.stringify(value);
      }
      return stringedItem;
    })
  );
};

/**
 * Adds a label,value pair to each object of an array.
 * @param {*} rawData array of data. array needs to contain objects {},{}
 * @param {*} value value of drop down. String value of object property
 * @param {*} label label of drop down. String value of object property
 * @returns
 */
export const getFormValues = (rawData, value, label) => {
  return rawData.map(item => {
    item.value = item[value];
    item.label = item[label];
    return item;
  });
};

/**
 * Adds a label,value pair to each object of an array.
 * @param {*} rawData array of data. array needs to contain objects {},{}
 * @param {*} value value of drop down. String value of object property
 * @param {*} label label of drop down. String value of object property
 * @param {*} label label of drop down. String value of object property
 * @returns
 */
const getFormValuesNames = (rawData, value, labelFirst, labelLast) => {
  return rawData.map(item => {
    item.value = item[value];
    item.label = `${item[labelFirst]} ${item[labelLast]}`;
    return item;
  });
};

/**
 *  MAIN ORCHESTRATOR FOR THIS FILE. CREATES A LABEL, AND VALUE FOR DROP DOWNS. EXAMPLE: LABEL FOR DROP DOWN IS 'MICKEY MOUSE', VALUE CAN BE THE 'COMPANY ID'
 * @param {*} rawData
 * @param {*} value
 * @param {*} label
 * @param {*} label2
 * @param {*} type
 * @returns
 */
// Orchestrates adding header, table and drop down data
export const tableAndLabelCreation = (rawData, value, label, label2, type) => {
  const tableHeaders = getTableHeaders(rawData);
  const tableData = getDataTable(rawData);
  type !== 'employees' ? getFormValues(rawData, value, label) : getFormValuesNames(rawData, value, label, label2);
  return { tableHeaders, tableData, rawData };
};
