import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { SubscriptionProvider } from '@/subscriptions/context/SubscriptionContext';

function App() {
  return (
    <SubscriptionProvider>
      <RouterProvider router={router} />
    </SubscriptionProvider>
  );
}

export default App;