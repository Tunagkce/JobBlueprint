import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router';
import { api } from './api';
import { ProfilePage } from './ProfilePage';
import type { Me } from './types';

function TopBar() {
  const [me, setMe] = useState<Me | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    api.get<Me>('/api/me').then(setMe, () => setMe(null));
  }, []);

  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="JobTracker home">
        <span className="brand-mark" aria-hidden="true">
          J
        </span>
        <span>jobtracker</span>
      </Link>
      <div className="topbar-actions">
        {me?.name && (
          <span className="local-badge" title={`Signed in with ${me.provider}`}>
            <span className="local-dot" /> {me.name}
          </span>
        )}
        <button
          className="text-button"
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            api.signOut().catch(() => setSigningOut(false));
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function NotFound() {
  return (
    <section className="intro">
      <p className="eyebrow">NOT FOUND</p>
      <h1>This page doesn’t exist.</h1>
      <p className="intro-copy">
        <Link to="/">Go to your profile</Link>
      </p>
    </section>
  );
}

export function App() {
  return (
    <main className="shell">
      <TopBar />
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="page-footer">
        <span>
          JOBTRACKER <span className="footer-separator">/</span> PROFILE
        </span>
        <span>Built for your next move.</span>
      </footer>
    </main>
  );
}
