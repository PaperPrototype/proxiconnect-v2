"use client";

import React, { useState } from 'react';

interface Prompt {
  optionA: string;
  optionB: string;
}

interface EventData {
  name: string;
  description: string;
  location: string;
  capacity: string;
  contactEmail: string;
  enableContactSharing: boolean;
  startDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  doorsOpen: string;
  autoStartIcebreaker: boolean;
  promptDuration: number;
  allowLateJoin: boolean;
  selectedGame: string;
  prompts: Prompt[];
  advanceMode: string;
  endMessage: string;
}

interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
}

const NewEventFlow = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    description: 'Kick off the night by checking in and jumping into a quick icebreaker to meet new people. We will have short intros, a friendly debate round, and time to mingle before the main talk begins. Snacks provided. Bring a friend!',
    location: '',
    capacity: '',
    contactEmail: '',
    enableContactSharing: false,
    startDate: '',
    startTime: '',
    endTime: '',
    timeZone: 'America/Los_Angeles',
    doorsOpen: '15 min before',
    autoStartIcebreaker: true,
    promptDuration: 10,
    allowLateJoin: true,
    selectedGame: 'would-you-rather',
    prompts: [
      { optionA: 'Have the ability to fly', optionB: 'Have the ability to turn invisible' }
    ],
    advanceMode: 'auto',
    endMessage: 'Icebreaker ended. The event is starting.'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: Step[] = [
    { id: 1, title: 'Basic info', icon: '✨', color: 'from-yellow-400 to-orange-500' },
    { id: 2, title: 'Icebreaker', icon: '🎯', color: 'from-pink-500 to-purple-500' },
    { id: 3, title: 'Review & create', icon: '🚀', color: 'from-purple-500 to-blue-500' }
  ];

  const updateEventData = (field: keyof EventData, value: string | boolean | number) => {
    setEventData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!eventData.name.trim()) {
        newErrors.name = 'Event name is required';
      }
      if (!eventData.description.trim()) {
        newErrors.description = 'Event description is required';
      }
    }

    if (step === 2) {
      if (eventData.prompts.length === 0 || !eventData.prompts.some(p => p.optionA && p.optionB)) {
        newErrors.prompts = 'Add at least one complete prompt to continue';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCreateEvent();
      }
    }
  };

  const handleCreateEvent = () => {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    alert(`Event created successfully! Join code: ${joinCode}`);
    window.location.href = '/create-event';
  };

  const addPrompt = () => {
    setEventData(prev => ({
      ...prev,
      prompts: [...prev.prompts, { optionA: '', optionB: '' }]
    }));
  };

  const updatePrompt = (index: number, field: keyof Prompt, value: string) => {
    setEventData(prev => ({
      ...prev,
      prompts: prev.prompts.map((prompt, i) => 
        i === index ? { ...prompt, [field]: value } : prompt
      )
    }));
  };

  const removePrompt = (index: number) => {
    if (eventData.prompts.length > 1) {
      setEventData(prev => ({
        ...prev,
        prompts: prev.prompts.filter((_, i) => i !== index)
      }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Event name <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventData.name}
                      onChange={(e) => updateEventData('name', e.target.value)}
                      placeholder="Tech & Tacos: Student Startup Night"
                      maxLength={80}
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-gray-600">Use a short, memorable title people can recognize on the projector</p>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{eventData.name.length}/80</span>
                    </div>
                    {errors.name && <p className="text-pink-500 font-medium mt-2">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Event description <span className="text-pink-500">*</span>
                    </label>
                    <textarea
                      value={eventData.description}
                      onChange={(e) => updateEventData('description', e.target.value)}
                      rows={5}
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                    />
                    <p className="text-gray-600 mt-2">Describe the vibe, what to expect, and any logistics</p>
                    {errors.description && <p className="text-pink-500 font-medium mt-2">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">Location</label>
                      <input
                        type="text"
                        value={eventData.location}
                        onChange={(e) => updateEventData('location', e.target.value)}
                        placeholder="Science Hall, Room 210"
                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all hover:border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">Capacity</label>
                      <input
                        type="number"
                        value={eventData.capacity}
                        onChange={(e) => updateEventData('capacity', e.target.value)}
                        placeholder="Leave blank if unlimited"
                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all hover:border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">Contact email</label>
                    <input
                      type="email"
                      value={eventData.contactEmail}
                      onChange={(e) => updateEventData('contactEmail', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all hover:border-gray-300"
                    />
                    <div className="flex items-center mt-3">
                      <input
                        type="checkbox"
                        checked={eventData.enableContactSharing}
                        onChange={(e) => updateEventData('enableContactSharing', e.target.checked)}
                        className="w-5 h-5 mr-3 accent-pink-500"
                      />
                      <span className="text-gray-700">Enable contact sharing with attendees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 sticky top-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Live Preview</h3>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{eventData.name || 'Your Event Name'}</h4>
                  <div className="space-y-2 text-gray-600">
                    <p>Date & time will appear here</p>
                    {eventData.location && <p>{eventData.location}</p>}
                    {eventData.capacity && <p>Up to {eventData.capacity} people</p>}
                  </div>
                  <p className="text-gray-700 mt-4 leading-relaxed">{eventData.description.substring(0, 120)}...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-3xl p-8 shadow-xl border-4 border-pink-300 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤔</div>
                  <h3 className="text-xl font-bold mb-3">Would You Rather</h3>
                  <p className="mb-4 opacity-90">Two choices. One room. Watch opinions split live.</p>
                  <div className="bg-white text-pink-600 text-sm font-bold px-4 py-2 rounded-full inline-block">
                    AVAILABLE NOW
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-3xl p-8 opacity-60 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤥</div>
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-xl font-bold text-gray-500 mr-3">Two Truths & a Lie</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">COMING SOON</span>
                  </div>
                  <p className="text-gray-500">Share three statements; the room guesses the fib</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-3xl p-8 opacity-60 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-xl font-bold text-gray-500 mr-3">Speed Mingles</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">COMING SOON</span>
                  </div>
                  <p className="text-gray-500">Timed 1:1 rotations with conversation starters</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Configure Would You Rather</h3>
              
              <div className="space-y-6 mb-8">
                {eventData.prompts.map((prompt, index) => (
                  <div key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-bold text-gray-900 mb-3">Option A</label>
                        <input
                          type="text"
                          value={prompt.optionA}
                          onChange={(e) => updatePrompt(index, 'optionA', e.target.value)}
                          placeholder="Have the ability to fly"
                          className="w-full px-6 py-4 text-lg border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all placeholder-gray-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-lg font-bold text-gray-900 mb-3">Option B</label>
                          <input
                            type="text"
                            value={prompt.optionB}
                            onChange={(e) => updatePrompt(index, 'optionB', e.target.value)}
                            placeholder="Have the ability to turn invisible"
                            className="w-full px-6 py-4 text-lg border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all placeholder-gray-500"
                          />
                        </div>
                        {eventData.prompts.length > 1 && (
                          <button
                            onClick={() => removePrompt(index)}
                            className="mt-12 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xl"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={addPrompt}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  + Add Another Question
                </button>
                <button
                  onClick={() => {
                    setEventData(prev => ({
                      ...prev,
                      prompts: [
                        { optionA: 'Arrive early to events', optionB: 'Stay late at events' },
                        { optionA: 'Build projects solo', optionB: 'Build projects with a team' },
                        { optionA: 'Work from a beach', optionB: 'Work from a mountain cabin' }
                      ]
                    }));
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Use Examples
                </button>
              </div>

              {errors.prompts && (
                <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
                  <p className="text-red-700 font-bold text-lg">{errors.prompts}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-3xl p-8 shadow-xl border-4 border-pink-300 transform hover:scale-105 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤔</div>
                  <h3 className="text-xl font-bold mb-3">Would You Rather</h3>
                  <p className="mb-4 opacity-90">Two choices. One room. Watch opinions split live.</p>
                  <div className="bg-white text-pink-600 text-sm font-bold px-4 py-2 rounded-full inline-block">
                    AVAILABLE NOW
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-3xl p-8 opacity-60 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤥</div>
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-xl font-bold text-gray-500 mr-3">Two Truths & a Lie</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">COMING SOON</span>
                  </div>
                  <p className="text-gray-500">Share three statements; the room guesses the fib</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-3xl p-8 opacity-60 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-xl font-bold text-gray-500 mr-3">Speed Mingles</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">COMING SOON</span>
                  </div>
                  <p className="text-gray-500">Timed 1:1 rotations with conversation starters</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Configure Would You Rather</h3>
              
              <div className="space-y-6 mb-8">
                {eventData.prompts.map((prompt, index) => (
                  <div key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-bold text-gray-900 mb-3">Option A</label>
                        <input
                          type="text"
                          value={prompt.optionA}
                          onChange={(e) => updatePrompt(index, 'optionA', e.target.value)}
                          placeholder="Have the ability to fly"
                          className="w-full px-6 py-4 text-lg border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-lg font-bold text-gray-900 mb-3">Option B</label>
                          <input
                            type="text"
                            value={prompt.optionB}
                            onChange={(e) => updatePrompt(index, 'optionB', e.target.value)}
                            placeholder="Have the ability to turn invisible"
                            className="w-full px-6 py-4 text-lg border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
                          />
                        </div>
                        {eventData.prompts.length > 1 && (
                          <button
                            onClick={() => removePrompt(index)}
                            className="mt-12 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xl"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={addPrompt}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  + Add Another Question
                </button>
                <button
                  onClick={() => {
                    setEventData(prev => ({
                      ...prev,
                      prompts: [
                        { optionA: 'Arrive early to events', optionB: 'Stay late at events' },
                        { optionA: 'Build projects solo', optionB: 'Build projects with a team' },
                        { optionA: 'Work from a beach', optionB: 'Work from a mountain cabin' }
                      ]
                    }));
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Use Examples
                </button>
              </div>

              {errors.prompts && (
                <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
                  <p className="text-red-700 font-bold text-lg">{errors.prompts}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <label className="block text-lg font-bold text-gray-900 mb-4">Duration per question (minutes)</label>
                  <input
                    type="number"
                    value={eventData.promptDuration}
                    onChange={(e) => updateEventData('promptDuration', parseInt(e.target.value))}
                    className="w-full px-6 py-4 text-xl font-bold border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-center"
                  />
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <label className="block text-lg font-bold text-gray-900 mb-4">Advance mode</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 bg-white rounded-xl border border-purple-200 cursor-pointer hover:bg-purple-50 transition-colors">
                      <input
                        type="radio"
                        value="auto"
                        checked={eventData.advanceMode === 'auto'}
                        onChange={(e) => updateEventData('advanceMode', e.target.value)}
                        className="mr-3 w-5 h-5 accent-purple-500"
                      />
                      <span className="font-semibold text-gray-900">Auto-advance on timer</span>
                    </label>
                    <label className="flex items-center p-3 bg-white rounded-xl border border-purple-200 cursor-pointer hover:bg-purple-50 transition-colors">
                      <input
                        type="radio"
                        value="manual"
                        checked={eventData.advanceMode === 'manual'}
                        onChange={(e) => updateEventData('advanceMode', e.target.value)}
                        className="mr-3 w-5 h-5 accent-purple-500"
                      />
                      <span className="font-semibold text-gray-900">I'll advance manually</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Almost Ready!</h2>
              <p className="text-xl text-gray-600">Review your event details and let's get this party started</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Event Summary</h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all"
                >
                  Edit
                </button>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{eventData.name}</h4>
                <p className="text-gray-700 mb-4 leading-relaxed">{eventData.description.substring(0, 200)}...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventData.location && <p className="font-semibold text-gray-800">{eventData.location}</p>}
                  {eventData.capacity && <p className="font-semibold text-gray-800">Up to {eventData.capacity} attendees</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Icebreaker</h3>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-2xl font-bold hover:from-pink-500 hover:to-purple-600 transform hover:scale-105 transition-all"
                >
                  Edit
                </button>
              </div>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                <p className="text-xl font-semibold text-gray-900 mb-2">Would You Rather</p>
                <p className="text-gray-700 mb-2">{eventData.prompts.length} questions</p>
                <p className="text-gray-600">Interactive voting and discussion prompts</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Share Your Event</h3>
              <p className="text-gray-600 mb-6">Your join code will be generated after creating the event.</p>
              <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-lg">Join code: Will be generated</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create a new event
              </h1>
              <p className="text-gray-600 mt-1">Set the basics, choose an icebreaker, then review.</p>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ?
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all transform hover:scale-105 ${
                      currentStep === step.id
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                        : currentStep > step.id
                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{step.icon}</span>
                    <span className="font-semibold">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-1 bg-gray-300 rounded"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6">
        {renderStepContent()}
      </main>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
          >
            Back
          </button>
          
          <div className="flex gap-4">
            <button className="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold transition-all">
              Save draft
            </button>
            <button
              onClick={handleContinue}
              className="px-10 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 font-bold transform hover:scale-105 transition-all shadow-lg"
            >
              {currentStep === 3 ? 'Create Event' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 p-6 overflow-y-auto border-l border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Help</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-6 text-gray-600">
            <p className="font-semibold">Step-by-step tips for creating your event:</p>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Basic Info</h4>
              <p>Choose a catchy event name and describe what attendees can expect.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Date & Time</h4>
              <p>Set when your event starts and ends. Enable auto-start for seamless icebreaking.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Icebreaker</h4>
              <p>Would You Rather prompts help attendees connect and start conversations.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Review</h4>
              <p>Double-check everything looks good before creating your event.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEventFlow;
