import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function EditableDataGrid({ data }) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setColumns(columnsStatic);
    setRows(rowsStatic);
  }, []);

  const processRowUpdate = React.useCallback(async newRow => {
    // Make the HTTP request to save in the backend
    const response = newRow;
    console.log(response);
    return response;
  });

  const handleProcessRowUpdateError = React.useCallback(error => {
    console.log({ children: error.message, severity: 'error' });
  }, []);

  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGrid
        editMode='row'
        rows={rows}
        columns={columns}
        experimentalFeatures={{ newEditingApi: true }}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
      />
    </div>
  );
}

const columnsStatic = [
  {
    field: 'name',
    headerName: 'Name',
    type: 'singleSelect',
    valueOptions: ['name 1', 'name 2', 'name 3'],
    width: 180,
    editable: true
  },
  { field: 'age', headerName: 'Age', type: 'number', editable: true },
  {
    field: 'dateCreated',
    headerName: 'Date Created',
    type: 'date',
    width: 180,
    editable: true
  },
  {
    field: 'lastLogin',
    headerName: 'Last Login',
    type: 'dateTime',
    width: 220,
    editable: true
  }
];

const rowsStatic = [
  {
    id: 1,
    name: 'name 1',
    age: 25,
    dateCreated: '1/2/2023',
    lastLogin: '1/2/2023'
  },
  {
    id: 2,
    name: 'name 2',
    age: 36,
    dateCreated: '1/2/2023',
    lastLogin: '1/2/2023'
  },
  {
    id: 3,
    name: 'name 3',
    age: 19,
    dateCreated: '1/2/2023',
    lastLogin: '1/2/2023'
  }
];
