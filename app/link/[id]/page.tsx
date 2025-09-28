"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';

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
        width: 300,
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

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
              ProxiConnect
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Event Sign-In</span>
              <div className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                📱
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
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
              <p className="text-gray-600 text-lg">Generating QR code...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100 mb-6">
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl} 
                      alt="Event QR Code" 
                      className="w-64 h-64"
                    />
                  )}
                </div>
                
                {/* Event Code */}
                <div className="bg-gray-100 rounded-2xl px-6 py-3">
                  <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                    {eventCode}
                  </span>
                </div>
              </div>

              {/* Right Side - Event Info & Instructions */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-light text-gray-800 mb-3">
                    {eventName}
                  </h1>
                  <p className="text-xl text-gray-600">
                    Scan the QR code to join this event
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800 mb-4">
                    How to Join:
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                      <div className="text-blue-600 text-xl">📱</div>
                      <div>
                        <h4 className="font-medium text-gray-800">Scan QR Code</h4>
                        <p className="text-gray-600 text-sm">
                          Point your phone's camera at the QR code
                        </p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
                      <div className="text-indigo-600 text-xl">🔗</div>
                      <div>
                        <h4 className="font-medium text-gray-800">Manual Entry</h4>
                        <p className="text-gray-600 text-sm">
                          Visit our website and enter code: <span className="font-mono font-bold">{eventCode}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* URL Display */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Direct Link:</p>
                  <p className="text-blue-600 font-mono text-sm break-all">
                    proxiconnect-v2.vercel.app/join/{eventCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QRCodeDisplayPage;