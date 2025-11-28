import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { IngestPage } from '@/pages/IngestPage';
import { ChatbotPage } from '@/pages/ChatbotPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'activity',
        element: <ActivityPage />,
      },
      {
        path: 'ingest',
        element: <IngestPage />,
      },
      {
        path: 'chatbot',
        element: <ChatbotPage />,
      },
      {
        path: 'goals',
        element: <div className="text-center py-12 text-gray-500">Goals page coming soon</div>,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
