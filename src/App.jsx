import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ClientsPage } from './pages/Clients';
import { ConsultationNewPage } from './pages/ConsultationNew';
import { ConsultationsPage } from './pages/Consultations';
import { CompanyHistoryPage } from './pages/CompanyHistory';
import { TodosPage } from './pages/Todos';

/**
 * bsManager 앱 루트 컴포넌트
 * 거래처 및 상담 관리 시스템
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 보호된 라우트 */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id/history" element={<CompanyHistoryPage />} />
          <Route path="/consultation/new" element={<ConsultationNewPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/todos" element={<TodosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
