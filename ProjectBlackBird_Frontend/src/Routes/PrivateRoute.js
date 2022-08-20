import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoutes({ user }) {
  // let auth = { token: false };
  return user ? <Outlet /> : <Navigate to='/login' />;
  // auth.token && user ? <Outlet/> : <Navigate to="/login"/>
}
