import React from 'react';
import type { JobTestimonial } from '../../lib/types/jobs';

interface EmployeesTakeProps {
  testimonials: JobTestimonial[];
}

export function EmployeesTake({ testimonials }: EmployeesTakeProps) {
  if (!testimonials?.length) return null;

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Employees' Take</h2>
      <div className="space-y-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="flex space-x-4">
            <div className="flex-shrink-0">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48';
                }}
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <blockquote className="text-gray-700 mb-3">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <div className="font-medium text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}