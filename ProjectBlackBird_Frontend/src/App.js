import Router from './Routes/Router';
import ThemeConfig from './Theme';
import GlobalStyles from './Theme/globalStyles';

export default function App() {
  return (
    <ThemeConfig>
      <GlobalStyles />
      <Router />
    </ThemeConfig>
  );
}
