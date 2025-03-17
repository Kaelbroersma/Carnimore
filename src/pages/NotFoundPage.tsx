import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-heading text-6xl md:text-8xl font-bold mb-4 text-tan">404</h1>
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button to="/" variant="primary" size="lg">
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;