"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplayPage = () => {
  const [eventCode, setEventCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [eventName, setEventName] = useState('Event');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract the ID from the URL path
    const pathSegments = window.location.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (id) {
      setEventCode(id);
      generateQRCode(id);
      // You can also fetch event details from Supabase here if needed
      // fetchEventDetails(id);
    }
  }, []);

  const generateQRCode = async (code: string) => {
    try {
      const joinUrl = `https://proxiconnect-v2.vercel.app/join/${code}`;
      const qrDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff', // White
        },
      });
      setQrCodeUrl(qrDataUrl);
      setLoading(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setLoading(false);
    }
  };

  // Optional: Fetch event details from Supabase
  // const fetchEventDetails = async (code) => {
  //   try {
  //     const { data } = await supabase
  //       .from("events")
  //       .select("name")
  //       .eq("code", code)
  //       .single();
  //     
  //     if (data) {
  //       setEventName(data.name);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching event details:', error);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-800">
              ProxiConnect
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Event Sign-In</span>
              <div className="aspect-square rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-2">
                📱
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light text-gray-800 mb-4">
              {eventName}
            </h1>
            <p className="text-lg text-gray-600">
              Scan the QR code below to join this event
            </p>
          </div>

          {/* QR Code Display */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <div className="w-8 h-8 text-gray-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <rect x="7" y="7" width="3" height="3"/>
                        <rect x="14" y="7" width="3" height="3"/>
                        <rect x="7" y="14" width="3" height="3"/>
                        <rect x="14" y="14" width="3" height="3"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-600">Generating QR code...</p>
                </div>
              ) : (
                <>
                  {/* QR Code */}
                  <div className="mb-8">
                    <div className="inline-block p-6 bg-white rounded-3xl shadow-lg border-2 border-gray-100">
                      {qrCodeUrl && (
                        <img 
                          src={qrCodeUrl} 
                          alt="Event QR Code" 
                          className="w-80 h-80 mx-auto"
                        />
                      )}
                    </div>
                  </div>

                  {/* Event Code */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-medium text-gray-800 mb-4">Event Code</h2>
                    <div className="inline-block bg-gray-100 rounded-2xl px-8 py-4">
                      <span className="text-3xl font-mono font-bold text-gray-800 tracking-wider">
                        {eventCode}
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4 text-left max-w-2xl mx-auto">
                    <h3 className="text-xl font-medium text-gray-800 text-center mb-6">
                      How to Join:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-2xl p-6">
                        <div className="text-blue-600 text-2xl mb-2">📱</div>
                        <h4 className="font-medium text-gray-800 mb-2">Option 1: Scan QR Code</h4>
                        <p className="text-gray-600 text-sm">
                          Open your phone's camera and point it at the QR code above
                        </p>
                      </div>
                      <div className="bg-indigo-50 rounded-2xl p-6">
                        <div className="text-indigo-600 text-2xl mb-2">🔗</div>
                        <h4 className="font-medium text-gray-800 mb-2">Option 2: Enter Code</h4>
                        <p className="text-gray-600 text-sm">
                          Visit the website and enter the event code: <span className="font-mono font-bold">{eventCode}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* URL Display */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Direct Link:</p>
                    <p className="text-blue-600 font-mono text-sm break-all">
                      https://proxiconnect-v2.vercel.app/join/{eventCode}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDisplayPage;