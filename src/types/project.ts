export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  specifications: {
    area: string;
    rooms: string;
    bathrooms: string;
    year: string;
  };
} 