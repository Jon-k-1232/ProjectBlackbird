import React, { useState } from 'react';
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export function SubRow({ headers, row }) {
  const [open, setOpen] = useState(false);

  return (
    row && (
      <React.Fragment>
        <TableRow>
          <TableCell style={{ padding: '0' }}>
            <IconButton style={{ padding: '15' }} aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell style={{ padding: '0' }} component='th' scope='row'>
            {row.companyName}
          </TableCell>
          <TableCell style={{ padding: '0' }} align='right'>
            {row.time}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ padding: 0 }} colSpan={6}>
            <Collapse in={open} timeout='auto' unmountOnExit>
              <Box>
                <Table size='small' aria-label='purchases'>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>{headers.headerOne}</TableCell>
                      <TableCell align='right'>{headers.headerTwo}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.jobs.map(job => (
                      <TableRow key={job.job}>
                        <TableCell style={{ width: '14em' }} />
                        <TableCell component='th' scope='row'>
                          {job.description}
                        </TableCell>
                        <TableCell style={{ padding: '0' }} align='right'>
                          {job.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    )
  );
}

export function Row({ headers, row }) {
  const [open, setOpen] = useState(false);

  const expandableHeaders = {
    headerOne: 'Job',
    headerTwo: 'Time'
  };

  return (
    <React.Fragment>
      <TableRow style={{ background: row.time > 0 ? '#d5f2df' : '#ffd0d0' }}>
        <TableCell style={{ padding: '0' }}>
          <IconButton
            style={{ padding: '0' }}
            aria-label='expand row'
            size='small'
            onClick={() => (row.clients.length ? setOpen(!open) : null)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell style={{ padding: '0' }} component='th' scope='row'>
          {row.employee}
        </TableCell>
        <TableCell style={{ padding: '0' }} align='right'>
          {row.time}
        </TableCell>
      </TableRow>
      {row.clients && (
        <TableRow>
          <TableCell style={{ padding: 0 }} colSpan={6}>
            <Collapse in={open} timeout='auto' unmountOnExit>
              <Box>
                <Table size='small' aria-label='purchases'>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '12em' }} />
                      <TableCell>{headers.headerOne}</TableCell>
                      <TableCell align='right'>{headers.headerTwo}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.clients.map(client => (
                      <SubRow key={client.company} headers={expandableHeaders} row={client} />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export function CollapsibleTable({ data }) {
  const expandableHeaders = {
    headerOne: 'Client',
    headerTwo: 'Time'
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell align='right'>Total Hours</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(data.employeeTime).map(employeeRow => (
            <Row key={employeeRow.id} headers={expandableHeaders} row={employeeRow} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
