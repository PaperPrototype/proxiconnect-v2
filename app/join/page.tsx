"use client";

import React, { useState, useRef, useEffect } from 'react';

const JoinEventPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('join'); // 'join' | 'avatar'
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [name, setName] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleJoinEvent(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoinEvent = async (eventCode: string) => {
    setIsLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // For demo: hardcode validation for 123456
      if (eventCode === '123456') {
        setCurrentView('avatar');
      } else {
        setError('Invalid event code. Try: 123456');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const eventCode = code.join('');
      const finalAvatar = selectedAvatar || avatars[Math.floor(Math.random() * avatars.length)].key;
      
      // For demo: simulate successful join
      const attendeeId = 'demo_' + Math.random().toString(36).substr(2, 9);
      
      // Store attendee info for session
      localStorage.setItem('attendeeId', attendeeId);
      localStorage.setItem('eventCode', eventCode);
      localStorage.setItem('avatar', finalAvatar);
      localStorage.setItem('attendeeName', name.trim());
      
      // Show success state
      setCurrentView('success');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAvatar = (avatarKey: string) => {
    setSelectedAvatar(avatarKey);
    setError('');
  };

  if (currentView === 'success') {
    const savedAvatar = localStorage.getItem('avatar');
    const savedName = localStorage.getItem('attendeeName');
    const selectedAvatarData = avatars.find(a => a.key === savedAvatar);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-white">✅</span>
          </div>
          
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to the Event!</h1>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-3">You're joining as:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{selectedAvatarData?.emoji}</span>
              <span className="text-xl font-medium text-gray-800">{savedName}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Next up: Fill out the attendance form, then jump into some fun icebreakers!
          </p>

          <button
            onClick={() => {
              // In production, this would navigate to attendance form
              alert('Next: Attendance form → Would You Rather game → Meet people!');
            }}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-all duration-200"
          >
            Continue to Attendance Form
          </button>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setCurrentView('join');
                setCode(['', '', '', '', '', '']);
                setSelectedAvatar('');
                setName('');
                setError('');
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              ← Try Different Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'avatar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">Choose Your Avatar</h1>
            <p className="text-gray-600">Pick a cute character to represent you</p>
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
            onClick={handleAvatarSubmit}
            disabled={isLoading || !name.trim()}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining...
              </>
            ) : (
              'Join Event'
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            No avatar selected? We'll pick a cute one for you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">📱</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">Join Event</h1>
          <p className="text-gray-600">Enter the 6-digit event code</p>
        </div>

        {/* Code Input */}
        <div className="flex gap-3 mb-6 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all uppercase"
              maxLength={1}
              disabled={isLoading}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Checking event...</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Demo code: <strong>123456</strong> | Don't have a code? Ask the event host or scan the QR code.
          </p>
          
          <button
            onClick={() => window.location.href = '/scan'}
            className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
          >
            Scan QR Code Instead
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinEventPage;
