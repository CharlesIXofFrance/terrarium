import React from 'react';
import { Calendar, Users } from 'lucide-react';

interface CareerAcademyProps {
  styles: any;
}

export function CareerAcademy({ styles }: CareerAcademyProps) {
  const courses = [
    {
      title: 'Introduction to Finance Academy 2025',
      date: '7 Jan',
      format: 'Live',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
    },
    {
      title: 'Break into Private Equity',
      date: '1 Nov',
      format: 'In Person',
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop',
    },
    {
      title: 'Break into Investment Management',
      date: '5 Dec',
      format: 'Live',
      image:
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop',
    },
  ];

  return (
    <section className="min-w-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">WiF Career Academy</h2>
        <button className="text-sm" style={{ color: styles.colors.primary }}>
          See all
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden shadow-sm"
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2">{course.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {course.date}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.format}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
