import React from 'react';
import { Button } from '@/components/ui/atoms/Button';

interface CTAProps {
  onGetStarted?: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
  return (
    <div className="bg-indigo-600 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to build your community?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
            Start connecting your members, sharing opportunities, and growing
            your professional network today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              onClick={onGetStarted}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Get started
            </Button>
            <a
              href="#features"
              className="text-sm font-semibold leading-6 text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
