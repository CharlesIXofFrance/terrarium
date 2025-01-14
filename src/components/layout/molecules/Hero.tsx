import React from 'react';
import { Button } from '@/components/ui/atoms/Button';

interface HeroProps {
  onGetStarted?: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build thriving communities with Terrarium
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create and manage your own professional community. Connect members,
            share opportunities, and grow together.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              onClick={onGetStarted}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Get started
            </Button>
            <a
              href="#features"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
