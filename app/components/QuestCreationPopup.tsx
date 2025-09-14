'use client';

import { useState } from 'react';
import { X, Plus, Users, Calendar, Sword } from 'lucide-react';
import { TeamMember } from '../context/AppContext';

interface QuestCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  availableTeammates?: TeamMember[];
}

export default function QuestCreationPopup({ isOpen, onClose, availableTeammates = [] }: QuestCreationPopupProps) {
  const [questLength, setQuestLength] = useState({ number: 2, unit: 'weeks' as 'weeks' | 'months' });
  const [selectedBoss, setSelectedBoss] = useState('');
  const [selectedTeammates, setSelectedTeammates] = useState<TeamMember[]>([]);

  const bossOptions = [
    { value: 'delivery-dragon', label: '🐲 Delivery Dragon' },
    { value: 'fast-food-fiend', label: '🍔 Fast Food Fiend' },
    { value: 'takeout-titan', label: '🥡 Takeout Titan' },
    { value: 'pizza-phantom', label: '🍕 Pizza Phantom' },
    { value: 'burger-beast', label: '🍟 Burger Beast' },
  ];

  const handleCreateQuest = () => {
    const questData = {
      length: questLength,
      boss: selectedBoss,
      teammates: selectedTeammates,
      calculatedDuration: questLength.unit === 'months'
        ? `${questLength.number} ${questLength.unit} (~${questLength.number * 4} weeks)`
        : `${questLength.number} ${questLength.unit}`,
    };

    console.log('Creating quest with data:', questData);

    // Reset form
    setQuestLength({ number: 2, unit: 'weeks' });
    setSelectedBoss('');
    setSelectedTeammates([]);
    onClose();
  };

  const addTeammate = (teammate: TeamMember) => {
    if (!selectedTeammates.find(t => t.id === teammate.id)) {
      setSelectedTeammates([...selectedTeammates, teammate]);
    }
  };

  const removeTeammate = (teammateId: string) => {
    setSelectedTeammates(selectedTeammates.filter(t => t.id !== teammateId));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getCircleBackground = (status: string) => {
    switch (status) {
      case 'powered': return 'bg-primary';
      case 'weakened': return 'bg-secondary';
      default: return 'bg-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-foreground">Create New Quest</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quest Length Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Calendar size={16} />
              Quest Duration
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  value={questLength.number}
                  onChange={(e) => setQuestLength({ ...questLength, number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={questLength.unit}
                  onChange={(e) => setQuestLength({ ...questLength, unit: e.target.value as 'weeks' | 'months' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Duration: {questLength.unit === 'months'
                ? `${questLength.number} ${questLength.unit} (~${questLength.number * 4} weeks)`
                : `${questLength.number} ${questLength.unit}`
              }
            </p>
          </div>

          {/* Boss Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Sword size={16} />
              Choose Your Boss
            </label>
            <select
              value={selectedBoss}
              onChange={(e) => setSelectedBoss(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a boss to fight...</option>
              {bossOptions.map(boss => (
                <option key={boss.value} value={boss.value}>{boss.label}</option>
              ))}
            </select>
          </div>

          {/* Teammate Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Users size={16} />
              Add Teammates
            </label>

            <div className="flex gap-2 mb-4 flex-wrap">
              {/* Selected Teammates */}
              {selectedTeammates.map(teammate => (
                <button
                  key={teammate.id}
                  onClick={() => removeTeammate(teammate.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all hover:scale-105 ${getCircleBackground(teammate.status)}`}
                  title={`${teammate.name} - Click to remove`}
                >
                  {getInitials(teammate.name)}
                </button>
              ))}

              {/* Add Teammate Buttons */}
              {selectedTeammates.length < 4 && (
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const teammate = availableTeammates.find(t => t.id === e.target.value);
                      if (teammate) {
                        addTeammate(teammate);
                        e.target.value = ''; // Reset select
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    defaultValue=""
                  >
                    <option value="">Add teammate</option>
                    {availableTeammates
                      .filter(teammate => !selectedTeammates.find(selected => selected.id === teammate.id))
                      .map(teammate => (
                        <option key={teammate.id} value={teammate.id}>{teammate.name}</option>
                      ))
                    }
                  </select>
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                    <Plus size={16} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {selectedTeammates.length === 0 && "No teammates selected - you'll quest solo!"}
              {selectedTeammates.length > 0 && `${selectedTeammates.length} teammate${selectedTeammates.length > 1 ? 's' : ''} selected`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateQuest}
            disabled={!selectedBoss}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Quest
          </button>
        </div>
      </div>
    </div>
  );
}