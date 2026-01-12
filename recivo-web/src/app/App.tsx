import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { InAppBrowserWarning } from '@/components/InAppBrowserWarning';

function App() {
  return (
    <>
      <InAppBrowserWarning />
      <RouterProvider router={router} />
    </>
  );
}

export default App;