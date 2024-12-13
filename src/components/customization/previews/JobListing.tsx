import React from 'react';
import { MapPin, Building2, Clock, DollarSign } from 'lucide-react';

interface JobListingProps {
  styles: any;
  mode: string;
}

export function JobListing({ styles }: JobListingProps) {
  return (
    <div style={{ fontFamily: styles.typography.bodyFont }}>
      <div 
        style={{
          backgroundColor: styles.colors.background,
          borderRadius: styles.borderRadius,
          padding: styles.spacing.gap,
        }}
      >
        <div className="mb-6">
          <h1 
            style={{ 
              fontFamily: styles.typography.headingFont,
              color: styles.colors.text,
              fontSize: '2rem'
            }}
            className="mb-2"
          >
            Senior Frontend Developer
          </h1>
          <div className="flex items-center gap-4" style={{ color: styles.colors.text }}>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>TechCorp</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Remote</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Full-time</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>$120k - $150k</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            style={{
              backgroundColor: styles.colors.primary,
              borderRadius: styles.borderRadius,
            }}
            className="px-6 py-2 text-white"
          >
            Apply Now
          </button>
        </div>

        <div className="space-y-6" style={{ color: styles.colors.text }}>
          <section>
            <h2 
              style={{ fontFamily: styles.typography.headingFont }}
              className="text-xl font-semibold mb-3"
            >
              About the Role
            </h2>
            <p>
              We're looking for a Senior Frontend Developer to join our team...
            </p>
          </section>

          <section>
            <h2 
              style={{ fontFamily: styles.typography.headingFont }}
              className="text-xl font-semibold mb-3"
            >
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>5+ years of experience with React</li>
              <li>Strong TypeScript skills</li>
              <li>Experience with modern frontend tools</li>
            </ul>
          </section>

          <section>
            <h2 
              style={{ fontFamily: styles.typography.headingFont }}
              className="text-xl font-semibold mb-3"
            >
              Benefits
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Competitive salary</li>
              <li>Remote work</li>
              <li>Health insurance</li>
              <li>401(k) matching</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}