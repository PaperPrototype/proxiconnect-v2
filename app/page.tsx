"use client";

import React, { useState, useEffect } from 'react';
import supabase from "../lib/supabase"

const SignupPopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create a new user if they do not already exist (if we fully implement this then we would send a verification email but that is overkill for the hackathon)
      const { data, error:dbErr } = await supabase.from("profiles").upsert({
        username: formData.email,
        name: formData.name,
      }, {
        onConflict: "username"
      }).select().maybeSingle()

      if (dbErr) {
        throw new Error(dbErr.message);
      }

      // Store user data, use this to identify the user when doing api calls later on (in a real app we would do an actual full authentication flow)
      localStorage.setItem('userData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        isSignedUp: true,
        id: data.id,
      }));

      // Close popup and redirect to create event page
      onClose();
      window.location.href = '/create-event';
      
    } catch (er) {
      const typedEr = er as any;
      if (typedEr.message) {
        setErrors({ general: typedEr.message });
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Sign Up for ProxiConnect</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <button className="text-blue-500 hover:text-blue-600 font-medium">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const ProxiConnectLanding = () => {
  const [activeTab, setActiveTab] = useState('attendees');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCreateEventClick = () => {
    // Check if user is already signed up
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isSignedUp) {
        // User is signed up, redirect to create event page
        window.location.href = '/create-event';
        return;
      }
    }
    
    // User is not signed up, show signup popup
    setShowSignupPopup(true);
  };

  const QRCode = () => (
    <div className="w-30 h-30 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-5">
      <div className="grid grid-cols-8 gap-0.5">
        {[...Array(64)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${
              [0,1,2,3,4,5,6,7,8,11,12,15,16,17,20,23,24,25,28,31,32,33,34,35,36,39,40,43,44,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63].includes(i)
                ? 'bg-gray-800' 
                : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const PersonIcon = ({ delay, color }: {delay: any; color: any;}) => (
    <div 
      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white ${color}`}
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      👤
    </div>
  );

  const ConnectionDot = ({ children, color, delay }: {children: any, color:any, delay:any;}) => (
    <div 
      className={`w-10 h-10 rounded-full flex items-center justify-center text-base text-white ${color}`}
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(0); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .bounce-arrow {
          animation: bounce 2s infinite;
        }
        .pulse-line {
          animation: pulse 2s infinite;
        }
      `}</style>

      {/* Signup Popup */}
      <SignupPopup 
        isOpen={showSignupPopup} 
        onClose={() => setShowSignupPopup(false)} 
      />

      {/* Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          headerScrolled 
            ? 'bg-white/98 backdrop-blur-md shadow-lg' 
            : 'bg-white/95 backdrop-blur-md'
        } border-b border-gray-200 ${showSignupPopup ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-800">
              ProxiConnect
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSignupPopup(true)}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-6xl font-normal mb-6 leading-tight text-gray-800">
              Turn check-ins into connections.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-light">
              Scan a QR to join or set up an event that sparks conversations before the program even begins.
            </p>
            
            <div className="flex gap-4 justify-center mb-16">
              <a 
                href="/join" 
                className="px-8 py-4 text-lg font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              >
                Join an Event
              </a>
              <button 
                onClick={handleCreateEventClick}
                className="px-8 py-4 text-lg font-medium bg-pink-500 text-white rounded-full hover:bg-pink-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
              >
                Create an Event
              </button>
            </div>

            {/* QR Demo */}
            <div className="flex justify-center items-center gap-10 flex-wrap">
              <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                <QRCode />
                <h3 className="text-xl font-medium mb-2">Scan QR Code</h3>
                <p className="text-gray-600">Quick check-in</p>
              </div>
              
              <div className="text-3xl text-blue-500 bounce-arrow">→</div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <ConnectionDot color="bg-yellow-400" delay={0}>🎯</ConnectionDot>
                  <ConnectionDot color="bg-orange-500" delay={0.5}>🎮</ConnectionDot>
                  <ConnectionDot color="bg-pink-500" delay={1}>💬</ConnectionDot>
                  <ConnectionDot color="bg-purple-500" delay={1.5}>📊</ConnectionDot>
                  <ConnectionDot color="bg-blue-500" delay={2}>🤝</ConnectionDot>
                </div>
                <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded pulse-line mb-2"></div>
                <p className="text-sm text-gray-600">Interactive engagement</p>
              </div>
            </div>

            {/* People Icons */}
            <div className="flex justify-center gap-8 mt-6">
              <PersonIcon delay={0} color="bg-blue-500" />
              <PersonIcon delay={1} color="bg-pink-500" />
              <PersonIcon delay={2} color="bg-purple-500" />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-normal text-center mb-16 text-gray-800">
              How it works
            </h2>
            
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 rounded-full p-1 flex gap-2">
                <button
                  onClick={() => setActiveTab('attendees')}
                  className={`px-8 py-3 rounded-full text-base font-medium transition-all duration-200 ${
                    activeTab === 'attendees'
                      ? 'bg-white text-blue-500 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  For Attendees
                </button>
                <button
                  onClick={() => setActiveTab('organizers')}
                  className={`px-8 py-3 rounded-full text-base font-medium transition-all duration-200 ${
                    activeTab === 'organizers'
                      ? 'bg-white text-blue-500 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  For Organizers
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
              {activeTab === 'attendees' ? (
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
                      📱
                    </div>
                    <h3 className="text-xl font-medium mb-3">Scan the event QR</h3>
                    <p className="text-gray-600">Simply point your phone camera at the event's unique QR code to instantly join.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
                      🎯
                    </div>
                    <h3 className="text-xl font-medium mb-3">Play quick icebreakers</h3>
                    <p className="text-gray-600">Answer polls, trivia questions, and fun prompts designed to spark conversation.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
                      🤝
                    </div>
                    <h3 className="text-xl font-medium mb-3">See results live and connect</h3>
                    <p className="text-gray-600">View real-time results and discover others with shared interests or answers.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
                      ⚡
                    </div>
                    <h3 className="text-xl font-medium mb-3">Create an event & get a QR code</h3>
                    <p className="text-gray-600">Set up your event in minutes and get a shareable QR code for attendees.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
                      📚
                    </div>
                    <h3 className="text-xl font-medium mb-3">Choose icebreakers from the library</h3>
                    <p className="text-gray-600">Browse our curated collection of activities or create custom ones for your event.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
                      📊
                    </div>
                    <h3 className="text-xl font-medium mb-3">Track attendance & engagement</h3>
                    <p className="text-gray-600">Monitor participation in real-time and see detailed analytics after your event.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Why People Love It */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-normal text-center mb-16 text-gray-800">
              Why people love it
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
              <div className="bg-white p-10 rounded-2xl shadow-sm">
                <h3 className="text-2xl font-medium mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-base text-white">
                    🎪
                  </span>
                  Attendees
                </h3>
                <p className="text-gray-600">
                  Engage from the start. Meet new people effortlessly. Transform awkward pre-event moments into meaningful connections and conversations.
                </p>
              </div>
              <div className="bg-white p-10 rounded-2xl shadow-sm">
                <h3 className="text-2xl font-medium mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-base text-white">
                    🎯
                  </span>
                  Organizers
                </h3>
                <p className="text-gray-600">
                  Easy setup. Real-time interaction. Memorable events. Create buzz before your program starts and gather valuable insights about your audience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-normal text-center mb-16 text-gray-800">
              Perfect for every gathering
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">
                  💻
                </div>
                <h3 className="text-lg font-medium mb-3">Tech Conferences</h3>
                <p className="text-sm text-gray-600">Break the ice between developers and spark technical discussions before sessions begin.</p>
              </div>
              <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">
                  🎓
                </div>
                <h3 className="text-lg font-medium mb-3">University Orientations</h3>
                <p className="text-sm text-gray-600">Help new students connect and find their community from day one on campus.</p>
              </div>
              <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">
                  💼
                </div>
                <h3 className="text-lg font-medium mb-3">Corporate Trainings</h3>
                <p className="text-sm text-gray-600">Energize teams and foster collaboration before important workshops and meetings.</p>
              </div>
              <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">
                  🌟
                </div>
                <h3 className="text-lg font-medium mb-3">Community Meetups</h3>
                <p className="text-sm text-gray-600">Create welcoming spaces where neighbors and like-minded people can easily connect.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-center">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-5xl font-normal mb-8">
              Make your next event unforgettable.
            </h2>
            <div className="flex gap-4 justify-center">
              <a 
                href="/join" 
                className="px-8 py-4 text-lg font-medium bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
              >
                Join an Event
              </a>
              <button 
                onClick={handleCreateEventClick}
                className="px-8 py-4 text-lg font-medium bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
              >
                Create an Event
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-800">
              ProxiConnect
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">About</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Contact</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Privacy</a>
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded mt-6"></div>
        </div>
      </footer>
    </div>
  );
};

export default ProxiConnectLanding;