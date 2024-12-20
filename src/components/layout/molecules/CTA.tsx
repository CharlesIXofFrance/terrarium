import React from 'react';

export function CTA() {
  return (
    <section className="py-20 bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Transform Your Community?
        </h2>
        <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
          Join the growing network of professional communities powered by
          Terrarium.
        </p>
        <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition">
          Get Started Now
        </button>
      </div>
    </section>
  );
}
