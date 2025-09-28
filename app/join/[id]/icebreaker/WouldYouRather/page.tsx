"use client";

import React, { useState, useEffect } from 'react';

const AvatarSelectionPage = () => {
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eventCode, setEventCode] = useState('');

  const avatars = [
    { key: 'panda', emoji: '🐼', name: 'Panda' },
    { key: 'koala', emoji: '🐨', name: 'Koala' },
    { key: 'fox', emoji: '🦊', name: 'Fox' },
    { key: 'cat', emoji: '🐱', name: 'Cat' },
    { key: 'dog', emoji: '🐶', name: 'Dog' },
    { key: 'rabbit', emoji: '🐰', name: 'Rabbit' },
    { key: 'bear', emoji: '🐻', name: 'Bear' },
    { key: 'tiger', emoji: '🐯', name: 'Tiger' },
    { key: 'lion', emoji: '🦁', name: 'Lion' },
    { key: 'monkey', emoji: '🐵', name: 'Monkey' },
    { key: 'pig', emoji: '🐷', name: 'Pig' },
    { key: 'frog', emoji: '🐸', name: 'Frog' }
  ];

  useEffect(() => {
    // Get event code from URL path /join/[id]
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const code = pathParts[2]; // /join/[ID] -> index 2 is the ID
      
      if (code) {
        setEventCode(code);
      }
    }
  }, []);

  const selectAvatar = (avatarKey: string) => {
    setSelectedAvatar(avatarKey);
    setError('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const finalAvatar = selectedAvatar || avatars[Math.floor(Math.random() * avatars.length)].key;
      
      // Store avatar and name info
      localStorage.setItem('selectedAvatar', finalAvatar);
      localStorage.setItem('attendeeName', name.trim());
      localStorage.setItem('eventCode', eventCode);
      
      // Redirect to Would You Rather game (default for demo)
      window.location.href = `/join/${eventCode}/icebreaker/WouldYouRather`;
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Join OSC Hackathon Event
          </h1>
          <p className="text-gray-600">Choose your avatar and enter your name</p>
          <div className="mt-2 text-sm text-blue-600 font-medium">
            Event Code: {eventCode || '432981'}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            maxLength={30}
          />
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {avatars.map((avatar) => (
            <button
              key={avatar.key}
              onClick={() => selectAvatar(avatar.key)}
              className={`aspect-square rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-2 ${
                selectedAvatar === avatar.key
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:scale-105'
              }`}
            >
              <span className="text-2xl mb-1">{avatar.emoji}</span>
              <span className="text-xs text-gray-600 text-center">{avatar.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Avatar Preview */}
        {selectedAvatar && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">You'll appear as:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">
                {avatars.find(a => a.key === selectedAvatar)?.emoji}
              </span>
              <span className="font-medium text-gray-800">{name || 'Your Name'}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || !name.trim()}
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Continuing...
            </>
          ) : (
            'Continue to Icebreaker Game'
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          No avatar selected? We'll pick a cute one for you!
        </p>

        {/* Back Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/join'}
            className="w-full text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            ← Back to Code Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionPage;

