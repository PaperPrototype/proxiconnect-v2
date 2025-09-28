"use client";

import supabase from '@/lib/supabase';
import React, { useState, useRef, useEffect } from 'react';

const JoinCodeEntry = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    // validate the code
    const { data, error: dbErr } = await supabase.from("events").select().eq("code", eventCode).maybeSingle();

    try {
      if (dbErr) {
        setError("Invalid event code.");
      } else {
        console.log("eventId", data.id)
        localStorage.setItem("eventId", data.id);
        localStorage.setItem("eventName", data.name);
        window.location.href = '/join/' + eventCode;
      }
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
            Demo code: <strong>432981</strong> | Don't have a code? Ask the event host or scan the QR code.
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

export default JoinCodeEntry;
