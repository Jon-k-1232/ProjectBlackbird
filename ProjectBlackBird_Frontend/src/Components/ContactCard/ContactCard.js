// import React, {useState} from 'react';
import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import './ContactCard.css';
import greenCheckmark from '../../Static_Icons/greenCheckmark.svg';
import redCircle from '../../Static_Icons/redCircle.svg';
// import EllipsisMenu from '../EllipsisMenu/EllipsisMenu';

export default function ContactCard(props) {
  const {
    address1,
    address2,
    advancedPayment,
    beginningBalance,
    city,
    companyName,
    currentBalance,
    firstName,
    inactive,
    lastName,
    middleI,
    mobilePhone,
    newBalance,
    notBillable,
    oid,
    phoneNumber1,
    state,
    statementBalance,
    zip
  } = props;

  // used for editing client info
  // const [edit, setEdit] = useState(false);

  const conditionalCheckboxs = value => (
    <td>{value ? <img src={greenCheckmark} alt='Green Checkmark' /> : <img src={redCircle} alt='Red Negative Circle' />}</td>
  );

  return (
    <Card className='contactWrapper'>
      <CardContent style={styles.header} className='contactHeader'>
        <Typography variant='h4'>{companyName}</Typography>
        <Typography variant='subtitle1'>{inactive ? 'Inactive' : 'Active'}</Typography>
        <Typography variant='subtitle1'>Client: {oid}</Typography>
      </CardContent>
      <CardContent style={styles.tableBody} className='contactTables'>
        <table className='contactColumnOne'>
          <tbody>
            <tr>
              <th>Company Name:</th>
              <td>{companyName}</td>
            </tr>
            <tr>
              <th>Name:</th>
              <td>
                {lastName},{firstName},{middleI}
              </td>
            </tr>
            <tr>
              <th>Primary Address:</th>
              <td>
                {address1} {city}, {state} {zip}
              </td>
            </tr>
            <tr>
              <th>Secondary Address:</th>
              <td>{address2 ? `${address2} ${city}, ${state} ${zip}` : 'N/A'}</td>
            </tr>
            <tr>
              <th>Cell:</th>
              <td>{mobilePhone}</td>
            </tr>
            <tr>
              <th>Landline:</th>
              <td>{phoneNumber1}</td>
            </tr>
          </tbody>
        </table>

        <table className='contactColumnTwo'>
          <tbody>
            <tr>
              <th>Prepay Balance:</th>
              <td>{Number(advancedPayment).toFixed(2) || 0.0}</td>
            </tr>
            <tr>
              <th>Beginning Balance:</th>
              <td>{Number(beginningBalance).toFixed(2)}</td>
            </tr>
            <tr>
              <th>Statement Balance:</th>
              <td>{Number(statementBalance).toFixed(2)}</td>
            </tr>
            <tr>
              <th>Current Balance:</th>
              <td>{Number(currentBalance).toFixed(2)}</td>
            </tr>
            <tr>
              <th>New Balance:</th>
              {conditionalCheckboxs(newBalance)}
            </tr>
            <tr>
              <th>Billable:</th>
              {conditionalCheckboxs(!notBillable)}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

const styles = {
  header: {
    padding: '0px 0px 12px 0px'
  },
  tableBody: {
    padding: '0px 10px'
  }
};
