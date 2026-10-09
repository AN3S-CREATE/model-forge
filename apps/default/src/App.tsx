import { lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { FloatingAgentChat } from '@/components/blocks';
import { PLATFORM_ASSISTANT_ID, PLATFORM_ASSISTANT_PUBLIC_ID } from '@/config/agent';
import { GenesisSection } from '@/lib/genesis';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DataUpload = lazy(() => import('@/pages/DataUpload'));
const ModelTraining = lazy(() => import('@/pages/ModelTraining'));
const ModelManagement = lazy(() => import('@/pages/ModelManagement'));
const Settings = lazy(() => import('@/pages/Settings'));
const Landing = lazy(() => import('@/pages/Landing'));

function App() {
  useEffect(() => {
    document.title = 'Neurologix — AI Model Training Platform';
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GenesisSection name="Landing">
              <Landing />
            </GenesisSection>
          }
        />
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <GenesisSection name="Dashboard">
                <Dashboard />
              </GenesisSection>
            }
          />
          <Route
            path="/upload"
            element={
              <GenesisSection name="DataUpload">
                <DataUpload />
              </GenesisSection>
            }
          />
          <Route
            path="/training"
            element={
              <GenesisSection name="ModelTraining">
                <ModelTraining />
              </GenesisSection>
            }
          />
          <Route
            path="/models"
            element={
              <GenesisSection name="ModelManagement">
                <ModelManagement />
              </GenesisSection>
            }
          />
          <Route
            path="/settings"
            element={
              <GenesisSection name="Settings">
                <Settings />
              </GenesisSection>
            }
          />
        </Route>
      </Routes>
      <FloatingAgentChat
        agentId={PLATFORM_ASSISTANT_ID}
        publicAgentId={PLATFORM_ASSISTANT_PUBLIC_ID}
      />
    </BrowserRouter>
  );
}

export default App;

