import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { router } from './router';
import { InAppBrowserWarning } from '@/components/InAppBrowserWarning';

function App() {
  return (
    <>
      <InAppBrowserWarning />
      <RouterProvider router={router} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;