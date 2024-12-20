import React from 'react';
import { Building2, Users, Briefcase } from 'lucide-react';

const features = [
  {
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    title: 'Customizable Job Boards',
    description:
      "Brand your job board and customize filters to match your community's needs.",
  },
  {
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    title: 'Community Engagement',
    description:
      'Foster meaningful connections with built-in engagement tools.',
  },
  {
    icon: <Briefcase className="h-6 w-6 text-indigo-600" />,
    title: 'Employer Network',
    description: 'Connect with top employers seeking verified talent.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
