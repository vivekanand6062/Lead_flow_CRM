'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, TrendingUp, Contact, Building2, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/store/AuthContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    leads: any[];
    deals: any[];
    contacts: any[];
    companies: any[];
  }>({ leads: [], deals: [], contacts: [], companies: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults({ leads: [], deals: [], contacts: [], companies: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [leadsRes, dealsRes, contactsRes, companiesRes] = await Promise.all([
          api.get(`/leads?search=${encodeURIComponent(query)}`).catch(() => ({ data: { data: [] } })),
          api.get(`/deals`).catch(() => ({ data: { data: [] } })),
          api.get(`/contacts?search=${encodeURIComponent(query)}`).catch(() => ({ data: { data: [] } })),
          api.get(`/companies?search=${encodeURIComponent(query)}`).catch(() => ({ data: { data: [] } }))
        ]);

        const qLower = query.toLowerCase();
        const filteredDeals = (dealsRes.data?.data || []).filter((d: any) =>
          d.title.toLowerCase().includes(qLower) || (d.companyName && d.companyName.toLowerCase().includes(qLower))
        );

        setResults({
          leads: (leadsRes.data?.data || []).slice(0, 4),
          deals: filteredDeals.slice(0, 4),
          contacts: (contactsRes.data?.data || []).slice(0, 4),
          companies: (companiesRes.data?.data || []).slice(0, 4)
        });
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const rolePrefix = user?.role === 'ADMIN' ? 'admin' : (user?.role === 'MANAGER' ? 'manager' : 'sales');
  const totalResults = results.leads.length + results.deals.length + results.contacts.length + results.companies.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />

      {/* Search Dialog */}
      <div className="relative w-full max-w-xl bg-[#FFFDFC] dark:bg-[#1A151D] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl shadow-modal overflow-hidden z-10 animate-in fade-in zoom-in-95">
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#E5DCD5] dark:border-[#2A242D]">
          <Search className="w-5 h-5 text-[#A9683F] dark:text-[#C08457] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search leads, deals, contacts, companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#211A20] dark:text-[#F5F1F3] placeholder-[#8A7F87] dark:placeholder-[#817783] focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-[#8A7F87] hover:text-[#211A20] dark:hover:text-[#F5F1F3]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="p-6 text-center text-xs text-[#8A7F87] dark:text-[#817783]">
              Searching CRM records...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="p-6 text-center text-xs text-[#8A7F87] dark:text-[#817783]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div className="mb-2">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Leads
              </div>
              {results.leads.map((l) => (
                <button
                  key={l._id}
                  onClick={() => navigateTo(`/${rolePrefix}/leads/${l._id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] text-left transition-colors text-xs"
                >
                  <div>
                    <span className="font-medium text-[#211A20] dark:text-[#F5F1F3]">{l.name}</span>
                    <span className="text-[#8A7F87] dark:text-[#817783] ml-2">({l.companyName})</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1EBE7] dark:bg-[#141117] text-[#665C65] dark:text-[#B8AEB9] font-mono border border-[#E5DCD5] dark:border-[#2A242D]">
                    {l.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Deals */}
          {results.deals.length > 0 && (
            <div className="mb-2">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Deals
              </div>
              {results.deals.map((d) => (
                <button
                  key={d._id}
                  onClick={() => navigateTo(`/${rolePrefix}/deals/${d._id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] text-left transition-colors text-xs"
                >
                  <div>
                    <span className="font-medium text-[#211A20] dark:text-[#F5F1F3]">{d.title}</span>
                    <span className="text-[#8A7F87] dark:text-[#817783] ml-2 tabular-nums">₹{d.value?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1EBE7] dark:bg-[#141117] text-[#665C65] dark:text-[#B8AEB9] font-mono border border-[#E5DCD5] dark:border-[#2A242D]">
                    {d.stage}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Contacts */}
          {results.contacts.length > 0 && (
            <div className="mb-2">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider flex items-center gap-1.5">
                <Contact className="w-3.5 h-3.5" /> Contacts
              </div>
              {results.contacts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => navigateTo(`/${rolePrefix}/contacts`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] text-left transition-colors text-xs"
                >
                  <div>
                    <span className="font-medium text-[#211A20] dark:text-[#F5F1F3]">{c.name}</span>
                    <span className="text-[#8A7F87] dark:text-[#817783] ml-2">({c.designation || c.companyName})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8A7F87]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#141117] text-[11px] text-[#8A7F87] dark:text-[#817783]">
          <span>Press ESC to close</span>
          <span>LeadFlow Search Engine</span>
        </div>
      </div>
    </div>
  );
};
