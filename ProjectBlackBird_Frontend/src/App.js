import Router from './Routes/Router';
import ThemeConfig from './Theme';
import GlobalStyles from './Theme/globalStyles';
import { createContext, useState } from 'react';
import UserService from './Services/UserService';

let context = createContext();

export default function App() {
   // Hook for Context, holds user info once logged in.
   let [loginUser, setLoginUser] = useState(
      {
         oid: UserService.getUserId(),
         displayname: UserService.getUserDisplayName(),
         role: UserService.getUserRole()
      } || {}
   );

   return (
      <ThemeConfig>
         <context.Provider value={{ loginUser, setLoginUser }}>
            <GlobalStyles />
            <Router />
         </context.Provider>
      </ThemeConfig>
   );
}

export { context };
