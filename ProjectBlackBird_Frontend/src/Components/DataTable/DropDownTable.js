import { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { TablePagination, Typography } from '@material-ui/core';
import styled from 'styled-components';
import Row from './Row';

const DataTableContainer = styled(TableContainer)`
  margin: ${({ root }) => (root ? '-1em -1em 0 -1em' : '')};
  width: calc(100% + 2em);
  td {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function DataTable({ root, data, filterBy }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filteredRows, setFilteredRows] = useState([]);

  const { headers, rows, hasNestedData } = data;

  useEffect(() => {
    setPage(0);
    const meetsFilterBy = row => (!filterBy ? true : row[filterBy.property] === filterBy.value);
    setFilteredRows(rows.filter(meetsFilterBy));
  }, [filterBy]);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = e => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <DataTableContainer root={root ? 'true' : ''}>
        <Table size='small'>
          <TableHead className={root ? 'grey-header' : ''}>
            <TableRow>
              {hasNestedData && <TableCell width={25} />}
              {headers.map(header => (
                <TableCell key={header} variant='head'>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <Row key={index} headers={headers} row={row} />
            ))}
          </TableBody>
        </Table>
      </DataTableContainer>

      <FooterContainer>
        <Typography variant='body2'>{filterBy && `Filtered to ${filterBy.property} : ${filterBy.value}`}</Typography>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage='Show'
        />
      </FooterContainer>
    </>
  );
}
