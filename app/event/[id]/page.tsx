"use client";

import React, { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  guide: string;
  code: string;
  profile_id: string;
  created_at: string;
}

const EventDetailPage = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [attendeeName, setAttendeeName] = useState<string>('');

  useEffect(() => {
    fetchEventDetails();
    // Get attendee name from localStorage if available
    const name = localStorage.getItem('attendeeName');
    if (name) {
      setAttendeeName(name);
    }
  }, []);

  const fetchEventDetails = async () => {
    try {
      // Extract event ID from URL path /event/[id]
      const pathSegments = window.location.pathname.split('/');
      const eventId = pathSegments[2]; // /event/[ID] -> index 2 is the ID

      if (!eventId) {
        setError('Invalid event URL');
        setLoading(false);
        return;
      }

      // Fetch event from Supabase
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError || !data) {
        setError('Event not found');
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Event...</h2>
          <p className="text-gray-600">Please wait while we fetch the event details.</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/join"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Back to Join
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
              ProxiConnect
            </Link>
            <div className="flex items-center gap-4">
              {attendeeName && (
                <span className="text-gray-600">Welcome, {attendeeName}</span>
              )}
              <div className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                <span className="text-lg">🎉</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-800 mb-4">
              {event.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Welcome! You've successfully joined the event. Here's what you need to know:
            </p>
            <div className="inline-block bg-blue-100 rounded-2xl px-6 py-3">
              <span className="text-blue-800 font-medium">Event Code: {event.code}</span>
            </div>
          </div>

          {/* Event Guide */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-semibold text-white">Event Information</h2>
              <p className="text-blue-100 mt-2">Everything you need to know about this event</p>
            </div>
            
            <div className="p-8">
              <pre className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed text-base bg-gray-50 rounded-xl p-6 border border-gray-200 overflow-x-auto text-wrap">
{event.guide}
              </pre>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Connect with Others</h3>
              <p className="text-gray-600 mb-4">
                Use the icebreaker responses to start conversations with fellow attendees
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Stay Connected</h3>
              <p className="text-gray-600 mb-4">
                Bookmark this page or save the event code for easy reference during the event
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Questions about the event? Check the information above or ask an organizer.
            </p>
            <div className="mt-6">
              <Link 
                href="/join"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Join Another Event
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;