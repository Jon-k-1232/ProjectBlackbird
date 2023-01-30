import { Route, Routes, Navigate } from 'react-router-dom';
import Login from '../Pages/Login/Login';
import DashboardLayout from '../Layouts/dashboard';
import LogoOnlyLayout from '../Layouts/LogoOnlyLayout';
import Clients from '../Pages/Clients/Clients';
import ClientDetails from '../Pages/Clients/ClientDetails';
import NotFound from '../Pages/Page404/Page404';
import Transactions from '../Pages/Transactions/Transactions';
import Invoices from '../Pages/Invoices/Invoices';
import NewInvoice from '../Pages/Invoices/NewInvoice';
import InvoiceDetails from '../Pages/InvoiceDetails/InvoiceDetails';
import NewClient from '../Pages/Clients/NewClient';
import Employees from '../Pages/Employees/Employees';
import NewEmployee from '../Pages/Employees/NewEmployee';
import Jobs from '../Pages/Jobs/Jobs';
import NewJob from '../Pages/Jobs/NewJob';
import JobDetails from '../Pages/Jobs/JobDetails';
import NewJobDefinition from '../Pages/JobDefinitions/NewJobDefinition';
import JobDefinitions from '../Pages/JobDefinitions/JobDefinitions';
import NewTransactionsPage from '../Pages/Transactions/NewTransactionPage';
import Deactivation from '../Pages/Clients/Deactivation';
import EditAnInvoice from '../Pages/Invoices/EditAnInvoice';
import MonthlyClients from 'src/Pages/MonthlyClients/MonthlyClients';
import Dashboard from 'src/Pages/Dashboard/Dashboard';
import { useContext } from 'react';
import { context } from '../App';
import AccessControl from 'src/Pages/Access/Access';
import DeleteTransaction from 'src/Pages/Transactions/DeleteTransaction';

export default function Router() {
  const { loginUser } = useContext(context);

  return (
    <Routes>
      <Route element={<LogoOnlyLayout />}>
        <Route exact path='/login' element={<Login />} />
        <Route path='/' element={<Navigate to='/dashboard' />} />
        <Route path='404' element={<NotFound />} />
        <Route path='*' element={<Navigate to='/404' />} />
      </Route>

      {/* Any route that goes through DashboardLayout will be checked by Private Route component */}
      <Route element={<DashboardLayout />}>
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='clients' element={<Clients />} />
        <Route path='clientDetails' element={<ClientDetails />} />
        <Route path='newClient' element={<NewClient />} />
        <Route path='transactions' element={<Transactions />} />
        <Route path='newTransaction' element={<NewTransactionsPage />} />
        <Route path='invoices' element={<Invoices />} />
        <Route path='newInvoice' element={<NewInvoice />} />
        <Route path='invoiceDetails' element={<InvoiceDetails />} />
        <Route path='newEmployee' element={<NewEmployee />} />
        <Route path='jobs' element={<Jobs />} />
        <Route path='newJob' element={<NewJob />} />
        <Route path='jobDetails' element={<JobDetails />} />
        <Route path='jobDefinitions' element={<JobDefinitions />} />
        <Route path='createNewJobDefinition' element={<NewJobDefinition />} />
        <Route path='deactivation' element={<Deactivation />} />
        <Route path='monthlyClients' element={<MonthlyClients />} />
      </Route>

      {/* ACCESS CONTROL */}
      {loginUser.role === 'manager' ? (
        <Route element={<DashboardLayout />}>
          <Route path='employees' element={<Employees />} />
          <Route path='editAnInvoice' element={<EditAnInvoice />} />
          <Route path='deleteTransaction' element={<DeleteTransaction />} />
        </Route>
      ) : (
        <Route element={<DashboardLayout />}>
          <Route path='employees' element={<AccessControl />} />
        </Route>
      )}
    </Routes>
  );
}
