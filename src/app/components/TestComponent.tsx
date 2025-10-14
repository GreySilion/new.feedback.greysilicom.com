'use client';

import React from 'react';

export default function TestComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to Grey Silicon
        </h1>
        <p className="text-gray-600 mb-6">
          This is a test component to verify that Tailwind CSS is working correctly.
          If you can see this text with proper styling, then Tailwind CSS is working!
        </p>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
