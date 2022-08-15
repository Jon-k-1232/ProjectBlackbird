import { useNavigate } from 'react-router-dom';
import MUIDataTable from 'mui-datatables';

/**
 * @param {*} props props.tableData, props.tableHeaders, props.route
 * Column data is an array of strings. Each string is a new column head
 * Table data is an array of arrays where each array is a separate item
 */
export default function DataTable(props) {
  const navigate = useNavigate();
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
    ascOrDesc
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
    rowsPerPage: tableSize ? tableSize : 50,
    rowsPerPageOptions: paginationIncrement ? paginationIncrement : [50, 150, 300],
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
    onRowClick: rowData => {
      // Whole row of data will be stored in router state
      // If 'route' is not present onClick will not fire.
      route && navigate(`${route}`, { state: { rowData } });
    },
    onRowSelectionChange: (rowsSelected, allRows, selectedIndex) => {
      const data = rawData;
      const dataToState = selectedIndex.map(item => data[item]);
      props.selectedList(dataToState);
    }
  };

  return (
    <>
      <div style={{ marginTop: '25px' }}>
        <MUIDataTable data={tableData} columns={tableHeaders} options={options} />
      </div>
    </>
  );
}
