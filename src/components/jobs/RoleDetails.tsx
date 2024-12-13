import React from 'react';
import { ClipboardList, Settings, Lightbulb, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RoleDetailsProps {
  details: {
    responsibilities: string[];
    niceToHave: string[];
    roleBenefits?: string[];
    languages: {
      name: string;
      level: string;
    }[];
  };
  labels?: {
    whatYouDo?: string;
    niceToHave?: string;
    whatYouGet?: string;
    languages?: string;
  };
}

export function RoleDetails({ 
  details,
  labels = {
    whatYouDo: 'What will you do',
    niceToHave: 'Nice to have',
    whatYouGet: 'What will you get',
    languages: 'Languages'
  }
}: RoleDetailsProps) {
  return (
    <div className="bg-[#F9F9F9] rounded-xl p-6 space-y-8">
      {/* What will you do */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{labels.whatYouDo}</h3>
        </div>
        <ul className="space-y-3">
          {details.responsibilities.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0" />
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{item}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Languages */}
      {details.languages.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{labels.languages}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {details.languages.map((lang, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full border border-gray-200"
              >
                <span className="font-medium text-gray-900">{lang.name}</span>
                <span className="text-sm text-gray-500">({lang.level})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nice to have */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{labels.niceToHave}</h3>
        </div>
        <ul className="space-y-3">
          {details.niceToHave.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{item}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* What will you get */}
      {details.roleBenefits && details.roleBenefits.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{labels.whatYouGet}</h3>
          </div>
          <ul className="space-y-3">
            {details.roleBenefits.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{item}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}