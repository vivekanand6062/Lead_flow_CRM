import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, X, ShieldCheck } from 'lucide-react';

export const SessionBanner: React.FC = () => {
  const { user, getDashboardPath } = useAuth();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user || !visible) {
    return null;
  }

  const dashboardUrl = getDashboardPath(user.role);

  return (
    <div className="relative z-50 bg-copper-500/10 dark:bg-copper-950/40 border-b border-copper-500/20 dark:border-copper-500/30 px-4 py-2 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-copper-900 dark:text-copper-200">
          <ShieldCheck className="w-4 h-4 text-copper-600 dark:text-copper-400 shrink-0" />
          <span>
            Active session detected for <strong className="font-semibold">{user.name}</strong> ({user.role.replace('_', ' ')}).
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={dashboardUrl}
            className="inline-flex items-center gap-1 font-semibold text-copper-700 dark:text-copper-300 hover:text-copper-900 dark:hover:text-white underline underline-offset-2 transition-colors font-mono"
          >
            <span>Open CRM Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss banner"
            className="text-copper-600 dark:text-copper-400 hover:text-copper-900 dark:hover:text-white p-0.5 rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
