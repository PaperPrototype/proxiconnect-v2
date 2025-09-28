"use client";

import supabase from '@/lib/supabase';
import Link from 'next/link';
import React, { useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react';

const WouldYouRatherGame = () => {
  const [currentPromptIndex, setCurrentPrompt] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [votes, setVotes] = useState({ A: 0, B: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [avatar, setAvatar] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventName, setEventName] = useState('');
  const [questions, setQuestions]: [any[], Dispatch<SetStateAction<never[]>>] = useState([]);

  const testQuestions = [
    {
      id: 100,
      question_1: "Have the ability to fly",
      question_2: "Have the ability to turn invisible"
    },
    {
      id: 200,
      question_1: "Always code in Python",
      question_2: "Always code in JavaScript"
    },
    {
      id: 300,
      question_1: "Work from a beach",
      question_2: "Work from a mountain cabin"
    },
    {
      id: 400,
      question_1: "Have unlimited coffee",
      question_2: "Have unlimited pizza"
    },
    {
      id: 500,
      question_1: "Go viral for something embarrassing",
      question_2: "Never go viral at all"
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
      const code = pathParts[2];
      setEventCode(code || '432981');
      
      const storedAvatar = localStorage.getItem('selectedAvatar');
      const storedName = localStorage.getItem('attendeeName');
      
      setAvatar(storedAvatar || 'panda');
      setAttendeeName(storedName || 'Demo User');

      getEvent();

      getQuestions();
    }
  }, []);

  function getEvent() {
    const eId = localStorage.getItem("eventId") || '';
    const eName = localStorage.getItem("eventName") || '';

    const pathParts = window.location.pathname.split('/');
    const code = pathParts[2]; // /join/[ID] -> index 2 is the ID
    
    if (code) {
      setEventCode(code);
    }
    
    setEventId(eId);
    setEventName(eName);
  }

  async function getQuestions() {
    console.log("eventId", eventId)
    const { data } = await supabase.from("questions").select();
    let cleanData: any[] = [];
    if (data) {
      cleanData = [...data];
    }
    cleanData = [...cleanData, ...testQuestions];

    console.log("loading questions from supabase")
    console.log("cleanData", cleanData)
    setQuestions(cleanData as [])
  }

  useEffect(() => {
    if (showResults && !isAnimating) {
      setIsAnimating(true);
    }
  }, [showResults]);

  const handleVote = async (choice: 'A' | 'B') => {
    if (hasVoted) return;

    setSelectedChoice(choice);
    setHasVoted(true);

    // Simulate API delay
    setTimeout(() => {
      // Demo: simulate realistic vote distribution
      const totalVoters = Math.floor(Math.random() * 50) + 20;
      const aVotes = choice === 'A' 
        ? Math.floor(Math.random() * (totalVoters - 5)) + 1 
        : Math.floor(Math.random() * (totalVoters - 5)) + 1;
      const bVotes = totalVoters - aVotes;

      setVotes({ A: aVotes, B: bVotes });
      setShowResults(true);
    }, 1000);
  };

  const nextPrompt = () => {
    if (currentPromptIndex < questions.length - 1) {
      setCurrentPrompt(currentPromptIndex + 1);
      setHasVoted(false);
      setSelectedChoice(null);
      setShowResults(false);
      setIsAnimating(false);
      setVotes({ A: 0, B: 0 });
    }
  };

  const getPercentage = (choice: 'A' | 'B'): string => {
    const total = votes.A + votes.B;
    if (total === 0) return '50.0';
    return ((votes[choice] / total) * 100).toFixed(1);
  };

  const currentQuestion = useMemo(() => {
    return questions.length > 0 ? questions[currentPromptIndex] : testQuestions;
  }, [questions, currentPromptIndex]);

  if (showResults) {
    // Results View - Slower animated width transition with dynamic colors
    const percentageA = parseFloat(getPercentage('A'));
    const percentageB = parseFloat(getPercentage('B'));
    const isAWinning = percentageA > percentageB;
    
    return (
      <div className="h-screen flex">
        {/* Option A Results */}
        <div 
          className={`flex flex-col justify-center items-center text-white relative transition-all ease-out ${
            isAWinning 
              ? 'bg-gradient-to-br from-pink-500 via-red-600 to-orange-600 brightness-110 saturate-150' 
              : 'bg-gradient-to-br from-pink-300 via-red-400 to-orange-400 brightness-75 saturate-75'
          }`}
          style={{ 
            width: isAnimating ? `${percentageA}%` : '50%',
            transitionDuration: '6000ms'
          }}
        >
          <div className="text-center p-4">
            <div className="text-4xl lg:text-6xl font-bold mb-4 transition-all duration-1000" style={{ transitionDelay: '3000ms' }}>
              {isAnimating ? getPercentage('A') : '50.0'}%
            </div>
            <div className="text-lg lg:text-2xl font-medium mb-2 transition-all duration-1000" style={{ transitionDelay: '3500ms' }}>
              {isAnimating ? votes.A : '0'} votes
            </div>
            <div className="text-base lg:text-xl max-w-sm px-2">
              {currentQuestion.question_1}
            </div>
          </div>
          {selectedChoice === 'A' && (
            <div className="absolute top-4 right-4 bg-white/30 rounded-full p-3">
              <span className="text-3xl">✓</span>
            </div>
          )}
        </div>

        {/* Option B Results */}
        <div 
          className={`flex flex-col justify-center items-center text-white relative transition-all ease-out ${
            !isAWinning 
              ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 brightness-110 saturate-150' 
              : 'bg-gradient-to-br from-blue-300 via-purple-400 to-indigo-500 brightness-75 saturate-75'
          }`}
          style={{ 
            width: isAnimating ? `${percentageB}%` : '50%',
            transitionDuration: '6000ms'
          }}
        >
          <div className="text-center p-4">
            <div className="text-4xl lg:text-6xl font-bold mb-4 transition-all duration-1000" style={{ transitionDelay: '3000ms' }}>
              {isAnimating ? getPercentage('B') : '50.0'}%
            </div>
            <div className="text-lg lg:text-2xl font-medium mb-2 transition-all duration-1000" style={{ transitionDelay: '3500ms' }}>
              {isAnimating ? votes.B : '0'} votes
            </div>
            <div className="text-base lg:text-xl max-w-sm px-2">
              {currentQuestion.question_2}
            </div>
          </div>
          {selectedChoice === 'B' && (
            <div className="absolute top-4 right-4 bg-white/30 rounded-full p-3">
              <span className="text-3xl">✓</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/60 text-white p-4 flex justify-between items-center">
          <div>
            <div className="font-bold">{eventName} Event</div>
            <div className="text-sm opacity-90">Question {currentPromptIndex + 1} of {questions.length}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{avatarEmojis[avatar]}</span>
            <span className="font-medium">{attendeeName}</span>
          </div>
        </div>

        {/* Connection Prompt */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 p-6 text-center">
          <div className="font-bold text-lg mb-2">💬 Time to Connect!</div>
          <div className="text-sm mb-4">
            Find someone who chose the opposite option and discuss your reasoning!
          </div>
          {currentPromptIndex < questions.length - 1 ? (
            <button
              onClick={nextPrompt}
              className="bg-amber-600 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-700 transition-colors shadow-lg"
            >
              Next Question →
            </button>
          ) : (
            <Link href={"/event/" + eventId} className="bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-lg">
              Game Complete! 🎉
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Voting View
  return (
    <div className="h-screen flex">
      {/* Option A */}
      <button
        onClick={() => handleVote('A')}
        disabled={hasVoted}
        className={`w-1/2 bg-gradient-to-br from-pink-400 via-red-500 to-orange-500 flex flex-col justify-center items-center text-white transition-all duration-300 ${
          hasVoted ? 'cursor-not-allowed opacity-75' : 'hover:brightness-110 active:scale-95'
        }`}
      >
        <div className="text-center p-8">
          <div className="text-3xl lg:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
            {currentQuestion.question_1}
          </div>
          {hasVoted && selectedChoice === 'A' && (
            <div className="text-3xl animate-bounce drop-shadow-lg">✓ Your Choice</div>
          )}
        </div>
      </button>

      {/* Option B */}
      <button
        onClick={() => handleVote('B')}
        disabled={hasVoted}
        className={`w-1/2 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex flex-col justify-center items-center text-white transition-all duration-300 ${
          hasVoted ? 'cursor-not-allowed opacity-75' : 'hover:brightness-110 active:scale-95'
        }`}
      >
        <div className="text-center p-8">
          <div className="text-3xl lg:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
            {currentQuestion.question_2}
          </div>
          {hasVoted && selectedChoice === 'B' && (
            <div className="text-3xl animate-bounce drop-shadow-lg">✓ Your Choice</div>
          )}
        </div>
      </button>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 text-white p-4 flex justify-between items-center">
        <div>
          <div className="font-bold">OSC Hackathon Event</div>
          <div className="text-sm opacity-90">Would You Rather - Question {currentPromptIndex + 1} of {questions.length}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{avatarEmojis[avatar]}</span>
          <span className="font-medium">{attendeeName}</span>
        </div>
      </div>

      {/* Question Prompt - Moved higher and smaller */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-xl text-center backdrop-blur-sm">
        <div className="text-lg lg:text-2xl font-bold">Would You Rather...</div>
      </div>

      {hasVoted && !showResults && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Collecting votes...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WouldYouRatherGame;

