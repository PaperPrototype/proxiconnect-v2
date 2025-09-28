"use client";

import React, { useState, useEffect } from 'react';

const AttendanceFormPage = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [avatar, setAvatar] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'success'

  // Demo form fields (host would create these)
  const formFields = [
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address'
    },
    {
      id: 'year',
      label: 'What year are you?',
      type: 'select',
      required: true,
      options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student', 'Faculty', 'Other']
    },
    {
      id: 'major',
      label: 'Major/Department',
      type: 'text',
      required: false,
      placeholder: 'e.g. Computer Science, Engineering, etc.'
    },
    {
      id: 'experience',
      label: 'Programming Experience',
      type: 'radio',
      required: true,
      options: ['Beginner (0-1 years)', 'Intermediate (2-4 years)', 'Advanced (5+ years)', 'Expert (Professional)']
    },
    {
      id: 'interests',
      label: 'What topics interest you most? (Select all that apply)',
      type: 'checkbox',
      required: false,
      options: ['Web Development', 'Mobile Apps', 'AI/Machine Learning', 'Data Science', 'Cybersecurity', 'Game Development', 'DevOps', 'Other']
    },
    {
      id: 'dietary',
      label: 'Dietary Restrictions',
      type: 'checkbox',
      required: false,
      options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Other']
    },
    {
      id: 'goals',
      label: 'What do you hope to get out of this hackathon?',
      type: 'textarea',
      required: false,
      placeholder: 'Tell us about your goals and expectations...'
    }
  ];

  const avatarEmojis: Record<string, string> = {
    'panda': '🐼', 'koala': '🐨', 'fox': '🦊', 'cat': '🐱', 'dog': '🐶',
    'rabbit': '🐰', 'bear': '🐻', 'tiger': '🐯', 'lion': '🦁', 'monkey': '🐵',
    'pig': '🐷', 'frog': '🐸'
  };

  useEffect(() => {
    // Get data from previous steps
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const code = pathParts[2]; // Get code from /join/[CODE]/attendance
      setEventCode(code || '432981');
      
      // Load stored data from avatar selection
      const storedAvatar = localStorage.getItem('selectedAvatar');
      const storedName = localStorage.getItem('attendeeName');
      
      setAvatar(storedAvatar || 'panda');
      setAttendeeName(storedName || 'Anonymous');
    }
  }, []);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setError('');
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = (formData[fieldId] as string[]) || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter(val => val !== option);
    
    handleInputChange(fieldId, newValues);
  };

  const validateForm = () => {
    const requiredFields = formFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => {
      const value = formData[field.id];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      setError(`Please fill out the required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Store form data
      const attendeeId = 'attendee_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('attendeeId', attendeeId);
      localStorage.setItem('attendanceFormData', JSON.stringify(formData));
      localStorage.setItem('submissionTime', new Date().toISOString());
      
      setCurrentStep('success');
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-white">✅</span>
          </div>
          
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">You're All Set!</h1>
          <h2 className="text-xl text-blue-600 font-medium mb-6">OSC Hackathon Event</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-3">Welcome to the hackathon:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{avatarEmojis[avatar]}</span>
              <span className="text-xl font-medium text-gray-800">{attendeeName}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-2">What's Next?</p>
            <p className="text-sm text-blue-600">
              Get ready for icebreaker games! The host will start activities shortly. 
              Keep this page open to participate.
            </p>
          </div>

          <button
            onClick={() => {
              // Navigate to game/lobby page
              alert('🎮 Game starting soon! Would You Rather questions coming up...');
            }}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-all duration-200 mb-4"
          >
            Ready for Icebreakers! 🎯
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">OSC Hackathon Event</h1>
                <p className="text-purple-100">Please fill out the attendance form</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{avatarEmojis[avatar]}</span>
                    <span className="font-medium">{attendeeName}</span>
                  </div>
                  <div className="text-xs text-purple-200 mt-1">Event: {eventCode || '432981'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="space-y-8">
              {formFields.map((field, index) => (
                <div key={field.id} className="space-y-3">
                  <label className="block text-lg font-medium text-gray-800">
                    {index + 1}. {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'text' || field.type === 'email' ? (
                    <input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800"
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800 resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800"
                    >
                      <option value="">Choose an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-3">
                      {field.options?.map((option) => (
                        <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name={field.id}
                            value={option}
                            checked={formData[field.id] === option}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {field.options?.map((option) => (
                        <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(formData[field.id] as string[] || []).includes(option)}
                            onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="mt-10 pt-6 border-t-2 border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Form...
                  </>
                ) : (
                  <>
                    <span>Submit & Join Hackathon</span>
                    <span className="text-xl">🚀</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.href = `/join/${eventCode}`}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Avatar Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFormPage;
