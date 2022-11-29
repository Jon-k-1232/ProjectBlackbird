import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const createData = (data, subDataOne, subDataTwo) => {
  const dataObject = {
    name: null,
    hours: null,
    subDataOne: []
  };

  const subDataOneObject = {
    name: '2020-01-05',
    hours: '11091700',
    labels: 3,
    Jobs: 0
  };

  const subDataTwoObject = {
    name: '2020-01-05',
    hours: '11091700',
    labels: 3,
    Jobs: 0
  };
};

export function Row(props) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell style={{ padding: '0' }}>
          <IconButton style={{ padding: '15' }} aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell style={{ padding: '0' }} component='th' scope='row'>
          {row.name}
        </TableCell>
        <TableCell style={{ padding: '0' }} align='right'>
          {row.calories}
        </TableCell>
        <TableCell style={{ padding: '0' }} align='right'>
          {row.fat}
        </TableCell>
        <TableCell style={{ padding: '0' }} align='right'>
          {row.carbs}
        </TableCell>
        <TableCell style={{ padding: '0' }} align='right'>
          {row.protein}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box>
              <Table size='small' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align='right'>Amount</TableCell>
                    <TableCell align='right'>Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map(historyRow => (
                    <TableRow key={historyRow.date}>
                      <TableCell component='th' scope='row'>
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align='right'>{historyRow.amount}</TableCell>
                      <TableCell align='right'>{Math.round(historyRow.amount * row.price * 100) / 100}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0, 3.99),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 4.99),
  createData('Eclair', 262, 16.0, 24, 6.0, 3.79),
  createData('Cupcake', 305, 3.7, 67, 4.3, 2.5),
  createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5)
];

export function CollapsibleTable({ tableData }) {
  const { employees, headers } = tableData;

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>{headers.employeeName}</TableCell>
            <TableCell align='right'>{headers.totalHours}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map(employeeRow => (
            <Row key={employeeRow.employeeName} row={employeeRow} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
