import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Building2,
  Globe,
  X,
  ArrowRight,
  Briefcase,
  UserCheck,
  Store,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  permission?: string;
  moduleCode?: string;
  badge?: string;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export interface RecentSearchItem {
  id: string;
  label: string;
  category: string;
  to: string;
  badge?: string;
  timestamp: number;
}

export const RECENT_SEARCHES_STORAGE_KEY = 'visiblo_recent_searches';

const INITIAL_DEFAULT_RECENT: RecentSearchItem[] = [
  { id: 'rec-1', label: 'Sales Pipeline', category: 'Sales & Field', to: '/admin/sales/pipeline', badge: '₹2.46 Cr', timestamp: Date.now() - 1000 * 60 * 2 },
  { id: 'rec-2', label: 'Leads Management', category: 'Sales & Field', to: '/admin/leads', badge: '1,250 Leads', timestamp: Date.now() - 1000 * 60 * 15 },
  { id: 'rec-3', label: 'Businesses', category: 'Sales & Field', to: '/admin/businesses', badge: '5.8k Stores', timestamp: Date.now() - 1000 * 60 * 45 },
  { id: 'rec-4', label: 'Territories', category: 'Sales & Field', to: '/admin/territories', badge: '12 Active', timestamp: Date.now() - 1000 * 60 * 90 },
  { id: 'rec-5', label: 'Target Dashboard', category: 'Targets & Incentives', to: '/admin/targets', badge: '69.9%', timestamp: Date.now() - 1000 * 60 * 180 },
];

/**
 * Universal authoritative helper to record a search/page in recent history
 */
export function recordRecentSearch(item: {
  label: string;
  category?: string;
  to: string;
  badge?: string;
}) {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    let current: RecentSearchItem[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) current = parsed;
      } catch {
        current = [];
      }
    } else {
      current = INITIAL_DEFAULT_RECENT;
    }

    const filtered = current.filter(
      (r) => r.to.toLowerCase() !== item.to.toLowerCase() && r.label.toLowerCase() !== item.label.toLowerCase()
    );

    const newItem: RecentSearchItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: item.label,
      category: item.category || 'Navigation',
      to: item.to,
      badge: item.badge,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('visiblo_recent_searches_updated'));
  } catch (e) {
    console.error('Failed to save recent search:', e);
  }
}

interface HeaderSearchBarProps {
  navCategories?: NavCategory[];
}

export function HeaderSearchBar({ navCategories = [] }: HeaderSearchBarProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Load purely from localStorage, seeding if empty
  const loadRecentSearches = useCallback((): RecentSearchItem[] => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      // Seed default recent searches on initial load
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_RECENT));
      return INITIAL_DEFAULT_RECENT;
    } catch {
      return INITIAL_DEFAULT_RECENT;
    }
  }, []);

  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(loadRecentSearches);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for storage / custom events to keep recentSearches 100% in sync
  useEffect(() => {
    const handleUpdate = () => {
      setRecentSearches(loadRecentSearches());
    };

    window.addEventListener('visiblo_recent_searches_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('visiblo_recent_searches_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadRecentSearches]);

  // Clear all recent searches
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify([]));
      setRecentSearches([]);
      window.dispatchEvent(new Event('visiblo_recent_searches_updated'));
    } catch {
      /* ignore */
    }
  };

  // Remove a single recent item
  const handleRemoveSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((r) => r.id !== id);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('visiblo_recent_searches_updated'));
    } catch {
      /* ignore */
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Flattened list of all sidebar navigation items
  const allNavItems = useMemo(() => {
    const list: { item: NavItem; category: string }[] = [];
    navCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        list.push({ item, category: cat.title });
      });
    });
    return list;
  }, [navCategories]);

  // Filtered sidebar items matching query
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allNavItems.filter(({ item, category }) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchCategory = category.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      return matchLabel || matchCategory || matchBadge;
    });
  }, [allNavItems, query]);

  // Quick link sections matching reference image
  const quickLinks = useMemo(
    () => [
      {
        label: 'Search Leads',
        desc: 'Find and manage leads',
        to: '/admin/leads',
        category: 'Leads',
        icon: UserPlus,
        iconBg: 'bg-purple-100 text-purple-600',
      },
      {
        label: 'Search Customers',
        desc: 'Find customers and view history',
        to: '/admin/customers',
        category: 'Customers',
        icon: UserCheck,
        iconBg: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Search Executives',
        desc: 'Find field executives',
        to: '/admin/executives',
        category: 'Executives',
        icon: Briefcase,
        iconBg: 'bg-rose-100 text-rose-500',
      },
      {
        label: 'Search Stores',
        desc: 'Find business stores',
        to: '/admin/businesses',
        category: 'Businesses',
        icon: Store,
        iconBg: 'bg-emerald-100 text-emerald-600',
      },
    ],
    []
  );

  const totalSelectable = searchResults.length;

  // Handle selecting an item
  const handleSelect = (label: string, category: string, to: string, badge?: string) => {
    recordRecentSearch({ label, category, to, badge });
    setIsOpen(false);
    setQuery('');
    navigate(to);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 >= totalSelectable ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 < 0 ? totalSelectable - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const sel = searchResults[selectedIndex];
        handleSelect(sel.item.label, sel.category, sel.item.to, sel.item.badge);
      } else if (query.trim() && searchResults.length > 0) {
        const first = searchResults[0];
        handleSelect(first.item.label, first.category, first.item.to, first.item.badge);
      } else if (query.trim()) {
        // Freeform query entered: save to recent and navigate to leads search
        const q = query.trim();
        handleSelect(q, 'Search', `/admin/leads?search=${encodeURIComponent(q)}`);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[480px] lg:max-w-[540px]">
      {/* Unified Single Input Frame - Zero inner boxes */}
      <div className="relative flex items-center w-full">
        <Search
          className={`absolute left-3.5 h-4 w-4 pointer-events-none transition-colors z-10 ${
            isOpen ? 'text-[#2563EB]' : 'text-slate-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search leads, customers, executives, stores, reports..."
          className={`h-10 w-full rounded-lg bg-white pl-10 pr-20 text-xs font-medium text-slate-800 placeholder:text-slate-400 transition-colors ${
            isOpen
              ? 'border border-[#2563EB] shadow-xs'
              : 'border border-slate-200 hover:border-slate-300'
          }`}
          style={{
            outline: 'none',
            boxShadow: isOpen ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
          }}
        />

        <div className="absolute right-2.5 flex items-center gap-1 z-10">
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Shortcut Badges */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 rounded">
              Ctrl
            </kbd>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 rounded">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[380px] sm:min-w-[460px] lg:min-w-[500px] rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in duration-100">
          {/* State 1: When input is empty -> Show Recent Searches & Quick Links */}
          {!query.trim() && (
            <div className="py-2">
              {/* Recent Searches Section */}
              <div className="px-3 py-1">
                <div className="flex items-center justify-between pb-1.5 px-1">
                  <span className="text-xs font-bold text-[#0D1F3D]">Recent Searches</span>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {recentSearches.length > 0 ? (
                  <div className="space-y-0.5">
                    {recentSearches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.label, item.category, item.to, item.badge)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Clock className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2563EB] flex-shrink-0 transition-colors" />
                          <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0D1F3D] truncate">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {item.badge && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-600">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSingle(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-rose-500 transition-all ml-1"
                            title="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs text-slate-400">
                    No recent searches yet. Try searching for a page or module above.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 my-1.5" />

              {/* Quick Links Section */}
              <div className="px-3 py-1">
                <div className="px-1 pb-1.5">
                  <span className="text-xs font-bold text-[#0D1F3D]">Quick Links</span>
                </div>
                <div className="space-y-1">
                  {quickLinks.map((ql) => {
                    const Icon = ql.icon;
                    return (
                      <div
                        key={ql.to}
                        onClick={() => handleSelect(ql.label, ql.category, ql.to)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${ql.iconBg} flex-shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-[#0D1F3D] transition-colors truncate">
                              {ql.label}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 truncate">{ql.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* State 2: When user types -> Real-time Search across ALL Sidebar Items */}
          {query.trim() && (
            <div className="max-h-[380px] overflow-y-auto py-2">
              {searchResults.length > 0 ? (
                <div className="px-3 py-1">
                  <div className="px-1 pb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Matching Sidebar Items ({searchResults.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Press Enter to open</span>
                  </div>
                  <div className="space-y-0.5">
                    {searchResults.map(({ item, category }, idx) => {
                      const Icon = item.icon;
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={item.to + idx}
                          onClick={() => handleSelect(item.label, category, item.to, item.badge)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-100/90 text-[#0D1F3D] border-l-2 border-[#2563EB] pl-2'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 flex-shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {item.label}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 truncate">
                                {category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {item.badge && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Freeform search suggestion if no exact sidebar item match */
                <div className="px-3 py-2">
                  <div
                    onClick={() => handleSelect(query.trim(), 'Search', `/admin/leads?search=${encodeURIComponent(query.trim())}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50/70 hover:bg-blue-50 text-blue-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="h-4 w-4 text-[#2563EB]" />
                      <span className="text-xs font-semibold">
                        Search workspace records for "<span className="font-bold">{query.trim()}</span>"
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#2563EB]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Hint Footer */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Search className="h-3 w-3 text-slate-400 flex-shrink-0" />
              Search sidebar pages and records
            </span>
            <span className="text-[10px] text-slate-400 font-mono">↑↓ Navigate • ↵ Select</span>
          </div>
        </div>
      )}
    </div>
  );
}
