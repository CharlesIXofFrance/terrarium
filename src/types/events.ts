export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  location: string;
  image: string;
  description?: string;
  type?: 'in-person' | 'online';
  capacity?: number;
  attendees?: number;
}