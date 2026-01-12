import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { router } from './router';
import { InAppBrowserWarning } from '@/components/InAppBrowserWarning';

function App() {
  return (
    <>
      <InAppBrowserWarning />
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}

export default App;