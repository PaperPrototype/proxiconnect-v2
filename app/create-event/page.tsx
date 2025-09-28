"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import supabase from "../../lib/supabase";
import Link from "next/link"
import QRCode from 'qrcode';

const CreateEventPage = () => {
  const [userName, setUserName] = useState('User');
  const [events, setEvents]: [any[], Dispatch<SetStateAction<never[]>>] = useState([])
  const [qrCodes, setQrCodes] = useState<{[key: string]: string}>({});

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
      const eventsData = data as [] || [];
      setEvents(eventsData);
      
      // Generate QR codes for all events
      generateQRCodes(eventsData);
    }
  }

  const generateQRCodes = async (eventsData: any[]) => {
    const qrCodeMap: {[key: string]: string} = {};
    
    for (const event of eventsData) {
      try {
        const joinUrl = `https://proxiconnect-v2.vercel.app/join/${event.code}`;
        const qrDataUrl = await QRCode.toDataURL(joinUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: '#374151', // Gray-700
            light: '#ffffff', // White
          },
        });
        qrCodeMap[event.code] = qrDataUrl;
      } catch (error) {
        console.error('Error generating QR code for event:', event.code, error);
      }
    }
    
    setQrCodes(qrCodeMap);
  };

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
              <div className="space-y-6">
                {events.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-start gap-8">
                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-black mb-2">{item.name}</div>
                        <h3 className="text-xl font-medium text-gray-800 mb-4">Join Code: {item.code}</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                          <Link 
                            href={"/link/" + item.code} 
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          >
                            View Full QR Code
                          </Link>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Direct Link:</span>
                            <br />
                            <span className="text-blue-600 underline break-all">
                              https://proxiconnect-v2.vercel.app/join/{item.code}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* QR Code */}
                      <div className="flex-shrink-0">
                        <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm">
                          {qrCodes[item.code] ? (
                            <img 
                              src={qrCodes[item.code]} 
                              alt={`QR Code for ${item.name}`}
                              className="w-24 h-24"
                              title="Scan to join event"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="animate-pulse">
                                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                  <rect x="7" y="7" width="3" height="3"/>
                                  <rect x="14" y="7" width="3" height="3"/>
                                  <rect x="7" y="14" width="3" height="3"/>
                                  <rect x="14" y="14" width="3" height="3"/>
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">Scan to join</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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