import React from 'react';
import { Lock } from 'lucide-react';

export function CareerSettingsTab() {
  return (
    <div className="space-y-8">
      {/* Job Preferences */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Job Preferences</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired Role Types
            </label>
            <div className="space-y-2">
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                <label key={type} className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-teal-600" />
                  <span className="ml-2 text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired Locations
            </label>
            <input 
              type="text" 
              placeholder="Add locations..."
              className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary Expectation
            </label>
            <div className="flex items-center gap-2">
              <select className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <option>EUR</option>
                <option>USD</option>
                <option>GBP</option>
              </select>
              <input 
                type="number" 
                placeholder="Enter amount"
                className="flex-1 rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Show my profile to employers</span>
            <input type="checkbox" className="rounded border-gray-300 text-teal-600" />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Allow job recommendations</span>
            <input type="checkbox" className="rounded border-gray-300 text-teal-600" />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Share profile with community members</span>
            <input type="checkbox" className="rounded border-gray-300 text-teal-600" />
          </label>
        </div>
      </section>
    </div>
  );
}