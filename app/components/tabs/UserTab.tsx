'use client';

import { Settings, Info, LogOut, User, Shield, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from './shared/MenuItem';
import { useApp } from '../../context/AppContext';

/**
 * UserProfile component for displaying user information
 */
function UserProfile() {
  const { state, userId } = useApp();
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={`https://pickeanu.com/500?random=${userId}`} 
              alt="User Avatar"
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">Player</h2>
            <p className="text-sm text-muted-foreground mb-2">Level {Math.floor(state.characterHealth / 10) + 1} Warrior</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {state.streak} day streak
              </Badge>
              <Badge variant={state.characterStatus === 'powered' ? 'default' : state.characterStatus === 'weakened' ? 'destructive' : 'secondary'} className="text-xs">
                {state.characterStatus}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserTab() {
  const handleSettings = () => {
    // In a real app, navigate to settings
    alert('Settings coming soon!');
  };

  const handleAbout = () => {
    // In a real app, show about dialog or navigate to about page
    alert('FoodApp v1.0\n\nGameify reducing food delivery orders with friends!');
  };

  const handlePrivacy = () => {
    // In a real app, navigate to privacy policy
    alert('Privacy Policy coming soon!');
  };

  const handleHelp = () => {
    // In a real app, navigate to help center
    alert('Help Center coming soon!');
  };

  const handleLogOut = () => {
    // In a real app, handle logout
    if (confirm('Are you sure you want to log out?')) {
      alert('Logout functionality coming soon!');
    }
  };

  return (
    <div className="p-4 pb-20">
      <UserProfile />
      
      <Card>
        <CardHeader>
          <CardTitle>Account & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MenuItem
            icon={<Settings size={20} />}
            label="Settings"
            onClick={handleSettings}
          />
          
          <MenuItem
            icon={<Shield size={20} />}
            label="Privacy Policy"
            onClick={handlePrivacy}
          />
          
          <MenuItem
            icon={<HelpCircle size={20} />}
            label="Help Center"
            onClick={handleHelp}
          />
          
          <MenuItem
            icon={<Info size={20} />}
            label="About"
            onClick={handleAbout}
          />
          
          <MenuItem
            icon={<LogOut size={20} />}
            label="Log Out"
            onClick={handleLogOut}
          />
        </CardContent>
      </Card>
    </div>
  );
}