'use client';

import { Settings, Info, LogOut, ChevronRight } from 'lucide-react';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-primary">
          {icon}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}

export default function UserTab() {
  const handleSettings = () => {
    // In a real app, navigate to settings
    alert('Settings coming soon!');
  };

  const handleAbout = () => {
    // In a real app, show about dialog or navigate to about page
    alert('SkipIt v1.0\n\nGameify reducing food delivery orders with friends!');
  };

  const handleLogOut = () => {
    // In a real app, handle logout
    if (confirm('Are you sure you want to log out?')) {
      alert('Logout functionality coming soon!');
    }
  };

  // Import useApp from context
  // eslint-disable-next-line
  // @ts-ignore
  const { state } = require('../../context/AppContext').useApp();

  return (
    <div className="p-4 pb-20">
      {/* User Profile Summary */}
      <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="mb-3">
            <img
              src={`/imgs/01-${state?.characterStatus || 'neutral'}.png`}
              alt="User Character"
              className="mx-auto"
              width={150}
              height={150}
            />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-1">Welcome!</h3>
          <p className="text-gray-600 text-sm">Keep fighting the good fight!</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        <MenuItem
          icon={<Settings size={24} />}
          label="Settings"
          onClick={handleSettings}
        />

        <MenuItem
          icon={<Info size={24} />}
          label="About SkipIt"
          onClick={handleAbout}
        />

        <MenuItem
          icon={<LogOut size={24} />}
          label="Log Out"
          onClick={handleLogOut}
        />
      </div>

      {/* App Version */}
      <div className="text-center mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          SkipIt v1.0.0
        </p>
      </div>
    </div>
  );
}