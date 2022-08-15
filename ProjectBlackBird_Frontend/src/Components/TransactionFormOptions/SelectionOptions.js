import { useEffect, useState } from 'react';
import { Stack, TextField, Autocomplete } from '@mui/material';
import { getCompanyJobs, getAllEmployees, getAllCompanies } from '../../ApiCalls/ApiCalls';

export default function SelectionOptions({
  passedCompany,
  selectedCompany,
  setSelectedCompany,
  selectedJob,
  setSelectedJob,
  selectedEmployee,
  setSelectedEmployee,
  setCompanyToGetOutstandingInvoice
}) {
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanyInputValue, setSelectedCompanyInputValue] = useState('');
  const [companyJobList, setCompanyJobList] = useState([]);
  const [selectedJobInputValue, setSelectedJobInputValue] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeInputValue, setSelectedEmployeeInputValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const allCompanies = await getAllCompanies();
      setAllCompanies(allCompanies.rawData);

      const allEmployees = await getAllEmployees();
      setAllEmployees(allEmployees.rawData);

      if (passedCompany) {
        setSelectedCompany(passedCompany);
        const allJobs = await getCompanyJobs(passedCompany.oid, null);
        setCompanyJobList(allJobs.rawData);
        setCompanyToGetOutstandingInvoice(passedCompany);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleCompanyChange = async newValue => {
    setSelectedCompany(newValue);
    const allJobs = await getCompanyJobs(newValue.oid, null);
    setCompanyJobList(allJobs.rawData);
    setCompanyToGetOutstandingInvoice(newValue);
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
        <Autocomplete
          value={selectedCompany}
          onChange={(event, newValue) => handleCompanyChange(newValue)}
          inputValue={selectedCompanyInputValue}
          onInputChange={(event, newInputValue) => setSelectedCompanyInputValue(newInputValue)}
          getOptionLabel={option => option['companyName']}
          options={allCompanies}
          sx={{ width: 350 }}
          renderInput={params => <TextField {...params} label='Select Company' />}
        />

        <Autocomplete
          value={selectedJob}
          onChange={(event, newValue) => setSelectedJob(newValue)}
          inputValue={selectedJobInputValue}
          onInputChange={(event, newInputValue) => setSelectedJobInputValue(newInputValue)}
          options={companyJobList}
          sx={{ width: 350 }}
          renderInput={params => <TextField {...params} label='Select Job' />}
        />

        <Autocomplete
          value={selectedEmployee}
          onChange={(event, newValue) => setSelectedEmployee(newValue)}
          inputValue={selectedEmployeeInputValue}
          onInputChange={(event, newInputValue) => setSelectedEmployeeInputValue(newInputValue)}
          options={allEmployees}
          sx={{ width: 350 }}
          renderInput={params => <TextField {...params} label='Select Employee' />}
        />
      </Stack>
    </Stack>
  );
}
