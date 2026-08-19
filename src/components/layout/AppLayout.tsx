import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from '@/features/search/GlobalSearchModal';

export function AppLayout() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-[#0F172A] overflow-x-hidden">
      <div className="flex-1 flex flex-row min-w-0">
        {/* Responsive Sidebar (Persistent Desktop / Modal Drawer Mobile) */}
        <Sidebar
          currentUser={user}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Navbar
            currentUser={user}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />
          <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in min-w-0">
            <Outlet context={{ currentUser: user }} />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentUser={user} />

      {/* Global Search Command Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentUser={user}
      />
    </div>
  );
}
