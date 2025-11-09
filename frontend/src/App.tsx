import { Navigate, Route, Routes } from 'react-router-dom';

import './App.css';
import { StorefrontRoute } from './pages/Storefront';

const DEFAULT_STORE_SLUG = 'paws-plus';

export const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to={`/stores/${DEFAULT_STORE_SLUG}`} replace />} />
    <Route path="/stores/:storeSlug" element={<StorefrontRoute />} />
    <Route path="*" element={<Navigate to={`/stores/${DEFAULT_STORE_SLUG}`} replace />} />
  </Routes>
);

export default App;
