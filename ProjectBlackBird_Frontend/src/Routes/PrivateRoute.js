import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  const [user, setUser] = useState(true);
  let auth = { token: false };
  return user ? <Outlet /> : <Navigate to='/login' />;
  // auth.token && user ? <Outlet/> : <Navigate to="/login"/>
};

export default PrivateRoutes;
