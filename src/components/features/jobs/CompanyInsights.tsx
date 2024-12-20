import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  MapPin,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  UserRound,
  LineChart,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CircularProgress } from '../../ui/atoms/CircularProgress';
import { JOB_TESTIMONIALS } from '../../../lib/mocks/mockJobs';
import type {
  JobTestimonial,
  CompanyInsights as CompanyInsightsType,
} from '../../../types/domain/jobs';

// Create custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CompanyInsightsProps {
  companyName?: string;
  insights: CompanyInsightsType;
  jobTitle?: string;
}

export function CompanyInsights({
  insights,
  jobTitle,
  companyName = 'Company',
}: CompanyInsightsProps) {
  const defaultCenter: [number, number] = [51.5074, -0.1278];
  const defaultZoom = 4;
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  const testimonials = useMemo(() => {
    try {
      if (!jobTitle || !JOB_TESTIMONIALS) return undefined;
      return JOB_TESTIMONIALS[jobTitle] as JobTestimonial[] | undefined;
    } catch (error) {
      setTestimonialError('Failed to load testimonials');
      return undefined;
    }
  }, [jobTitle]);

  // Reset error when jobTitle changes
  useEffect(() => {
    setTestimonialError(null);
  }, [jobTitle]);

  // Calculate bounds only if there are locations
  const bounds = useMemo(() => {
    if (!insights.locations?.length) return null;
    return L.latLngBounds(insights.locations.map((loc) => loc.coordinates));
  }, [insights.locations]);

  // Auto-advance testimonials
  useEffect(() => {
    if (testimonials?.length) {
      const timer = setInterval(() => {
        setCurrentTestimonial((prev) =>
          prev === testimonials.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [testimonials]);

  const nextTestimonial = () => {
    if (testimonials) {
      setCurrentTestimonial((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevTestimonial = () => {
    if (testimonials) {
      setCurrentTestimonial((prev) =>
        prev === 0 ? testimonials.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 space-y-6">
      <h2 className="text-xl font-semibold">About {companyName}</h2>

      {/* Company Description */}
      {insights.description && (
        <p className="text-gray-700 leading-relaxed">{insights.description}</p>
      )}

      {/* Team Photo */}
      {insights.teamPhoto && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            The team says hi!
          </h3>
          <div className="rounded-lg overflow-hidden">
            <img
              src={insights.teamPhoto.url}
              alt={insights.teamPhoto.alt || 'Our team'}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Office Locations Map */}
      {insights.locations && insights.locations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Hiring Locations
          </h3>
          <div className="h-[140px] md:h-[180px] rounded-lg overflow-hidden">
            <MapContainer
              center={bounds ? undefined : defaultCenter}
              bounds={bounds || undefined}
              zoom={bounds ? undefined : defaultZoom}
              className="h-full w-full"
              scrollWheelZoom={false}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {insights.locations.map((location, index) => (
                <Marker
                  key={index}
                  position={location.coordinates}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="font-medium">{location.name}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.locations.map((location, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{location.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonialError ? (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">{testimonialError}</p>
        </div>
      ) : (
        testimonials &&
        testimonials.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Employee Testimonials
            </h3>
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm italic mb-3">
                    "{testimonial.quote}"
                  </p>
                  <div
                    className="flex items-center space-x-3"
                    key={`${index}-content`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/32';
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <h3 className="text-sm font-medium text-gray-700 col-span-2 mb-2">
          Key Stats
        </h3>
        <div className="col-span-2 space-y-4">
          {/* Response Time Insight */}
          <div className="flex items-center space-x-3">
            <CircularProgress
              value={25}
              icon={<MessageCircle className="h-5 w-5 text-gray-600" />}
              positiveDirection="up"
            />
            <div>
              <span className="text-gray-900">
                <strong className="text-[#DC2626]">Few</strong> candidates hear
                back within 2 weeks
              </span>
            </div>
          </div>

          {/* Gender Diversity Insight */}
          <div className="flex items-center space-x-3">
            <CircularProgress
              value={37}
              icon={<UserRound className="h-5 w-5 text-gray-600" />}
              positiveDirection="up"
            />
            <div>
              <span className="text-gray-900">
                <strong className="text-[#059669]">37%</strong> female employees
              </span>
            </div>
          </div>

          {/* Employee Growth Insight */}
          <div className="flex items-center space-x-3">
            <CircularProgress
              value={-9}
              icon={<LineChart className="h-5 w-5 text-gray-600" />}
              positiveDirection="up"
            />
            <div>
              <span className="text-gray-900">
                <strong className="text-[#DC2626]">-9%</strong> employee growth
                in 12 months
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Awards */}
      {insights.awards && insights.awards.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Awards & Recognition
          </h3>
          <div className="space-y-2">
            {insights.awards.map((award, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">{award.title}</div>
                  <div className="text-sm text-gray-500">{award.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
