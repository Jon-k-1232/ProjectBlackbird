import Router from './Routes/Router';
import ThemeConfig from './Theme';
import GlobalStyles from './Theme/globalStyles';
import { createContext, useState } from 'react';

let context = createContext();

export default function App() {
  // Hook for Context
  let [loginUser, setLoginUser] = useState({});

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
