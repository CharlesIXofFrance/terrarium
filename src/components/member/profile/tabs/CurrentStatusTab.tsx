import React from 'react';
import { Briefcase, Building2, MapPin } from 'lucide-react';

export function CurrentStatusTab() {
  return (
    <div className="space-y-8">
      {/* Current Role */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Role</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-900 font-medium">Senior Product Manager</p>
              <p className="text-sm text-gray-500">Full-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-900 font-medium">Fintech Company</p>
              <p className="text-sm text-gray-500">Financial Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <p className="text-gray-900">London, United Kingdom</p>
          </div>
        </div>
      </section>

      {/* Job Satisfaction */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Job Satisfaction</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How satisfied are you with your current role?
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="75"
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Not Satisfied</span>
              <span>Very Satisfied</span>
            </div>
          </div>
        </div>
      </section>

      {/* Career Goals */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Career Goals</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your career goals for the next 12 months?
            </label>
            <textarea 
              className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              rows={4}
              placeholder="Share your career aspirations..."
            />
          </div>
        </div>
      </section>
    </div>
  );
}