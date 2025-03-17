import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      <Link to="/" className="text-gray-400 hover:text-tan transition-colors">
        Home
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="text-gray-600" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-gray-400 hover:text-tan transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-tan">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;