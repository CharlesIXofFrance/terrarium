import React from 'react';
import { CheckCircle2, Zap, Shield } from 'lucide-react';

const benefits = [
  {
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    text: "White-label branding and customization",
  },
  {
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    text: "Automated job management and workflows",
  },
  {
    icon: <Shield className="h-5 w-5 text-blue-500" />,
    text: "Secure member verification system",
  },
];

export function Benefits() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Choose Terrarium?</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {benefit.icon}
                  <span className="text-gray-700">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="Team collaboration"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}