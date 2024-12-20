import React from 'react';
import { Globe2 } from 'lucide-react';

const footerColumns = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Communities', 'Employers'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Support', 'API', 'Status'],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Globe2 className="h-6 w-6 text-indigo-500" />
              <span className="text-white font-bold">Terrarium</span>
            </div>
            <p className="text-sm">
              Empowering niche talent communities to thrive and grow.
            </p>
          </div>
          {footerColumns.map((column, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="hover:text-white transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          © {new Date().getFullYear()} Terrarium. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
