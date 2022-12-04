import { useState } from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Collapse, IconButton } from 'material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import DataTable from ' ./DataTable';

export default function Row({ headers, row }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow style={row.color ? { background: row.color } : {}}>
        {row.nestedData && (
          <>
            <TableCell>
              <IconButton size='small' onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
          </>
        )}

        {headers.map(header => (
          <TableCell key={header}>{row[header]}</TableCell>
        ))}
      </TableRow>
      {row.nestedData && (
        <>
          <TableRow>
            <TableCell className='p-0' colSpan={6}>
              <Collapse in={open} timeout='auto' unmountOnExit>
                <DataTable data={row.nestedDate} />
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  );
}
