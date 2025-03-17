import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import SchedulingModal from '../components/CourseScheduling/SchedulingModal';

const TrainingPage: React.FC = () => {
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Training courses ordered by price (lowest to highest)
  const trainingCourses = [
    {
      id: '1',
      title: "Custom Firearms Maintenance",
      description: "Comprehensive course on maintaining, cleaning, and basic troubleshooting of custom firearms. Learn how to preserve your investment for years to come.",
      duration: "1 Hour",
      level: "All Levels",
      price: 149
    },
    {
      id: '2',
      title: "Fundamentals of Marksmanship",
      description: "Master the essential skills of proper stance, grip, sight alignment, and trigger control. Suitable for beginners and those looking to reinforce core techniques.",
      duration: "2 Hours",
      level: "Beginner",
      price: 199
    },
    {
      id: '3',
      title: "Long Range Precision",
      description: "Learn the art and science of long-range shooting, including ballistics, wind reading, and precision rifle techniques. Includes practical field exercises.",
      duration: "2 Hours",
      level: "Advanced",
      price: 299
    },
    {
      id: '4',
      title: "Positional & Field Shooting",
      description: "Master the art of shooting from various positions and using natural supports. Learn how to set up stable shooting positions in different hunting environments and terrain.",
      duration: "2 Hours",
      level: "Intermediate",
      price: 449
    }
  ];

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsSchedulingOpen(true);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-16">
          <motion.h1 
            className="font-heading text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Training <span className="text-tan">Programs</span>
          </motion.h1>
          <motion.div 
            className="w-24 h-0.5 bg-tan mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <motion.p
            className="text-xl max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Elevate your skills with our professional training programs. From fundamentals to advanced techniques, our expert instructors provide hands-on guidance in a safe, controlled environment.
          </motion.p>
        </div>

        {/* Training Courses */}
        <div className="mb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">Available <span className="text-tan">Courses</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainingCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-medium-gray rounded-sm overflow-hidden shadow-luxury angular-border"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-heading text-xl font-bold">{course.title}</h3>
                    <span className="bg-tan text-black px-3 py-1 text-sm font-medium rounded-sm">
                      {course.level}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-6">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-400">Duration: </span>
                      <span className="text-white">{course.duration}</span>
                    </div>
                    <span className="text-tan font-heading text-xl">${course.price}</span>
                  </div>
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      fullWidth
                      onClick={() => handleCourseSelect(course.id)}
                    >
                      Schedule This Course
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom Training */}
        <motion.div
          className="bg-gunmetal p-12 rounded-sm shadow-luxury mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Custom <span className="text-tan">Training Solutions</span></h2>
              <p className="text-gray-300 mb-6">
                Need specialized training for your specific requirements? We offer customized training programs for individuals and groups. Our expert instructors will design a curriculum tailored to your skill level and objectives.
              </p>
              <Button to="/contact" variant="primary">
                Request Custom Training
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Custom Training" 
                className="w-full h-auto rounded-sm shadow-luxury"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-tan opacity-60"></div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Ready to <span className="text-tan">Take Control of Your Safety?</span></h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Gain confidence, skill, and peace of mind with expert instruction. Book your class now and become a responsible, prepared gun owner.
          </p>
          <Button to="/contact" variant="primary" size="lg">
            Schedule Your Training
          </Button>
        </motion.div>

        {/* Scheduling Modal */}
        <SchedulingModal
          isOpen={isSchedulingOpen}
          onClose={() => setIsSchedulingOpen(false)}
          courseId={selectedCourseId || ''}
        />
      </div>
    </div>
  );
};

export default TrainingPage;