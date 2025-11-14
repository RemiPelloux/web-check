import { Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import Home from 'web-check-live/views/Home.tsx';
import Results from 'web-check-live/views/Results.tsx';
import About from 'web-check-live/views/About.tsx';
import NotFound from 'web-check-live/views/NotFound.tsx';

import ErrorBoundary from 'web-check-live/components/boundaries/PageError.tsx';
import GlobalStyles from './styles/globals.tsx';
import { initSessionCheck, setupSessionMonitor, clearSession } from './utils/session-manager.ts';

const Layout = () => {
  return (
  <>
    <GlobalStyles />
    <Outlet />
  </>
  );
}

export default function App() {
  useEffect(() => {
    // Suppress known safe browser extension attributes warnings
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        args[0].includes('bis_skin_checked')
      ) {
        return; // Ignore bis_skin_checked warnings from browser extensions
      }
      originalError.apply(console, args);
    };

    // Initialize session check on app load
    initSessionCheck();
    
    // Setup session monitoring - checks every minute
    const sessionMonitor = setupSessionMonitor(() => {
      // Session expired callback
      console.log('Session expired - redirecting to login');
      clearSession();
      window.location.href = '/';
    });

    // Cleanup on unmount
    return () => {
      clearInterval(sessionMonitor);
      console.error = originalError; // Restore original error handler
    };
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path=":urlToScan" element={<Results />} />
        </Route>
        <Route path="/check" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path=":urlToScan" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/wiki" element={<Layout />}>
          <Route index element={<About />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
