import React from 'react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Empower Your Talent Community
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          The all-in-one platform for managing job boards, engaging members, and
          growing your professional ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
            <span>Launch Your Community</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition">
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );
}
