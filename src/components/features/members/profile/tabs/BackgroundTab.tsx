import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';

export function BackgroundTab() {
  return (
    <div className="space-y-8">
      {/* Work Experience */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Work Experience
          </h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Sample Experience Item */}
          <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <h3 className="font-medium text-gray-900">
              Senior Product Manager
            </h3>
            <p className="text-gray-600">Fintech Company</p>
            <p className="text-sm text-gray-500">
              Jan 2020 - Present · 4 years
            </p>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Education</span>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Sample Education Item */}
          <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <h3 className="font-medium text-gray-900">BSc Computer Science</h3>
            <p className="text-gray-600">University of Technology</p>
            <p className="text-sm text-gray-500">2016 - 2020</p>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Language</span>
          </Button>
        </div>

        <div className="space-y-4">
          {/* Sample Language Item */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">English</h3>
              <p className="text-sm text-gray-500">Native or Bilingual</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
