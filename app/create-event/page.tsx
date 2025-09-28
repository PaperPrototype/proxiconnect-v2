"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import supabase from "../../lib/supabase";

const CreateEventPage = () => {
  const [userName, setUserName] = useState('User');
  const [events, setEvents]: [any[], Dispatch<SetStateAction<never[]>>] = useState([])

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || 'User');
      const {data} = await supabase.from("events").select().eq("profile_id", user.id);
      setEvents(data as [] || []);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-800">
              ProxiConnect
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {userName}</span>
              <div className="aspect-square rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-2 ">
                🐼
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light text-gray-800 mb-4">
              Welcome back, {userName}
            </h1>
            <p className="text-lg text-gray-600">
              Manage your events and create new connections
            </p>
          </div>

          {/* Previous Events Section */}
          <div className="mb-20">
            <h2 className="text-2xl font-medium text-gray-800 mb-8">Your Events</h2>
            
            { events.length > 0 ? 
              events.map((item, index) => (
                <li key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 text-gray-400">
                      {item.name}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2"> Code {item.code}</h3>
                  <p className="text-gray-600 mb-6">Create your first event to start building connections</p>
                </li>
              ))
              :
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-6">Create your first event to start building connections</p>
              </div>
            }
          </div>
        </div>
      </main>

      {/* Clean Plus Button */}
      <div className="fixed bottom-8 right-8">
        <button 
          className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          onClick={() => {
            alert('Button clicked!');
            window.location.href = '/create-event/new';
          }}
        >
          <div className="w-6 h-6 relative">
            <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreateEventPage;
