import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, CheckSquare, MessageSquare } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import Button from '../Button';

interface UserInfoFormProps {
  onSubmit: () => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit }) => {
  const { setUserInfo } = useCourseStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [] as string[],
    comments: ''
  });

  const skillOptions = [
    'Marksmanship Fundamentals',
    'Advanced Shooting Techniques',
    'Tactical Training',
    'Long Range Shooting',
    'Firearm Safety',
    'Weapon Maintenance'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserInfo(formData);
    onSubmit();
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-gunmetal p-6 rounded-sm shadow-luxury"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-heading text-xl font-bold mb-6">Personal Information</h3>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <User size={16} className="mr-2 text-tan" />
            Full Name <span className="text-tan ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <Mail size={16} className="mr-2 text-tan" />
            Email Address <span className="text-tan ml-1">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <Phone size={16} className="mr-2 text-tan" />
            Phone Number <span className="text-tan ml-1">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-3">
            <CheckSquare size={16} className="mr-2 text-tan" />
            Skills You'd Like to Learn <span className="text-tan ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`p-3 rounded-sm text-left transition-colors ${
                  formData.skills.includes(skill)
                    ? 'bg-tan text-black'
                    : 'bg-dark-gray hover:bg-tan/10'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <MessageSquare size={16} className="mr-2 text-tan" />
            Additional Comments
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            rows={4}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="mt-8">
        <Button type="submit" variant="primary" fullWidth>
          Confirm and Proceed to Checkout
        </Button>
      </div>
    </motion.form>
  );
};

export default UserInfoForm;