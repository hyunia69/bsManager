import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Landing } from './pages/Landing';
import { ClientsPage } from './pages/Clients';
import { ConsultationNewPage } from './pages/ConsultationNew';
import { ConsultationsPage } from './pages/Consultations';
import { CompanyHistoryPage } from './pages/CompanyHistory';

/**
 * bsManager 앱 루트 컴포넌트
 * 거래처 및 상담 관리 시스템
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<MainLayout />}>
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id/history" element={<CompanyHistoryPage />} />
          <Route path="/consultation/new" element={<ConsultationNewPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
