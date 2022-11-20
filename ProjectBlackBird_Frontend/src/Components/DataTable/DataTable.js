import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MUIDataTable from 'mui-datatables';
import styled from '@emotion/styled';

/**
 * @param {*} props props.tableData, props.tableHeaders, props.route
 * Column data is an array of strings. Each string is a new column head
 * Table data is an array of arrays where each array is a separate item
 */
export default function DataTable(props) {
  const navigate = useNavigate();
  const [selectedRowData, setSelectedRowData] = useState(null);

  const {
    useCheckboxes,
    selectOnRowClick,
    route,
    rawData,
    tableData,
    tableHeaders,
    tableSize,
    paginationIncrement,
    chartHeight,
    columnToSortAscOrDesc,
    ascOrDesc,
    noRoute,
    passRowData
  } = props;

  const responsive = 'vertical';
  const tableBodyHeight = chartHeight ? chartHeight : '1000px';
  const tableBodyMaxHeight = '';

  // https://github.com/gregnb/mui-datatables#api
  const options = {
    sortOrder: {
      name: columnToSortAscOrDesc ? columnToSortAscOrDesc : 'Transaction Date',
      direction: ascOrDesc ? ascOrDesc : 'desc'
    },
    rowsPerPage: tableSize ? tableSize : 25,
    rowsPerPageOptions: paginationIncrement ? paginationIncrement : [25, 50, 100, 150],
    rowHover: true,
    jumpToPage: true,
    draggableColumns: { enabled: true },
    filter: true,
    filterType: 'dropdown',
    searchOpen: true,
    selectableRowsHideCheckboxes: useCheckboxes ? false : true,
    selectableRowsOnClick: selectOnRowClick ? true : false,
    responsive,
    tableBodyHeight,
    tableBodyMaxHeight,
    rowsSelected: selectedRowData,
    onRowClick: rowData => {
      if (noRoute) {
        passRowData(rowData);
      } else {
        // Whole row of data will be stored in router state
        // If 'route' is not present onClick will not fire.
        route && navigate(`${route}`, { state: { rowData } });
      }
    },
    onRowSelectionChange: (rowsSelected, allRows, selectedIndex) => {
      const data = rawData;
      const dataToState = selectedIndex.map(item => data[item]);
      setSelectedRowData(selectedIndex);
      props.selectedList(dataToState);
    },
    setTableProps: () => {
      return {
        size: 'small'
      };
    }
  };

  // Adjust table columns
  const DataTableContainer = styled('div')(() => ({
    marginTop: '25px',
    '& .MuiTableCell-root': {
      whiteSpace: 'nowrap'
    },
    '& .MuiTableCell-paddingCheckbox': {
      background: 'white'
    }
  }));

  /**
   * Filters data, and reformats for ease of reading.
   */
  const filteredTableData =
    tableData &&
    tableData.map(row =>
      // eslint-disable-next-line
      row.map(stringedItem => {
        if (+stringedItem && stringedItem % 1) {
          const formattedNumber = Number(stringedItem).toFixed(2);
          if (formattedNumber === '0.00' || formattedNumber === '-0.00') return 0;
          return formattedNumber;
        } else if (stringedItem !== 'null') {
          return stringedItem.replace('null', ' ');
        }
      })
    );

  return (
    <>
      <DataTableContainer>
        <MUIDataTable data={filteredTableData} columns={tableHeaders} options={options} />
      </DataTableContainer>
    </>
  );
}
