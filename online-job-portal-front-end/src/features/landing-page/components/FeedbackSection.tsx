import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import avatarCustomer from '../../../assets/user.jpg';
import feedbackImg from '../../../assets/feedback.png';
import { IconBox } from '@/components/ui/IconBox';

interface Testimonial {
  id: number;
  text: string;
  highlight: string;
  name: string;
  title: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "I'm saving a fortune and my monthly payment is much easier to manage. I highly recommend Alliance One to anyone looking to get out of credit card debt fast.",
    highlight: 'Fast and simple!',
    name: 'John Smith',
    title: 'Borrower',
    rating: 5,
  },
  {
    id: 2,
    text: 'The customer service team was incredibly helpful throughout the entire process. They made everything so clear and easy to understand.',
    highlight: 'Outstanding support!',
    name: 'Sarah Johnson',
    title: 'Client',
    rating: 5,
  },
  {
    id: 3,
    text: 'I was skeptical at first, but the results speak for themselves. My debt is now manageable and I can finally see a path to financial freedom.',
    highlight: 'Life-changing experience!',
    name: 'Michael Chen',
    title: 'Customer',
    rating: 5,
  },
  {
    id: 4,
    text: 'The process was smooth from start to finish. I appreciate the transparency and honesty throughout our partnership.',
    highlight: 'Highly professional!',
    name: 'Emily Davis',
    title: 'Borrower',
    rating: 5,
  },
];

const FeedbackSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handlePrevious = () => {
    setIsAutoPlay(false);
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      id="contact"
      style={{ backgroundImage: `url(${feedbackImg})` }}
      className="relative h-150 2xl:h-150 md:h-150 bg-cover bg-top-center bg-opa"
    >
      <div className="absolute inset-0 bg-orange-500/80"></div>
      <div className="container  mx-auto flex flex-col gap-0 lg:flex-row items-center lg:items-start justify-center lg:justify-between h-full  lg:py-32 px-4 md:px-0 relative">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 items-center mb-5 lg:w-1/2 ">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full ">
            <Quote className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-default text-5xl md:text-6xl font-bold text-white">What They Say</h2>
        </div>

        {/* Testimonial Card with Navigation */}
        <div className="flex flex-col lg:grid grid-flow-col-dense lg:gap-x-8 -space-y-5 lg:w-1/2">
          <div
            className="flex justify-end lg:justify-center
           flex-row lg:flex-col gap-4 col-start-2"
          >
            <IconBox variant="primary" onClick={handlePrevious} aria-label="Previous testimonial">
              <ChevronUp className=" lg:block hidden" />
              <ChevronLeft className=" lg:hidden block" />
            </IconBox>
            <IconBox variant="primary" onClick={handleNext} aria-label="Next testimonial">
              <ChevronDown className=" lg:block hidden" />
              <ChevronRight className=" lg:hidden block" />
            </IconBox>
          </div>

          <div className=" flex flex-col -space-y-4 md:-space-y-12 items-center w-full  lg h-80">
            {/* Testimonial Card */}
            <div className="bg-white h-fit rounded-3xl p-8 md:p-12 shadow-2xl transition-all duration-500 ease-in-out">
              <div className="text-center">
                {/* Testimonial Text */}
                <p className="text-sm md:text-xl text-gray-700 leading-relaxed mb-8 h-fit flex items-center justify-center">
                  <span>
                    <span className="text-orange-500 font-semibold">
                      "{currentTestimonial.highlight}"
                    </span>{' '}
                    {currentTestimonial.text}
                  </span>
                </p>

                {/* Star Rating */}
                <div className="flex justify-center items-center gap-1 m-0 md:mb-8">
                  {[...Array(currentTestimonial.rating)].map((_, index) => (
                    <Star key={index} className="w-6 h-6 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
            </div>
            {/* Customer Info */}
            <div className="flex items-center justify-center gap-4 bg-section w-1/2 rounded-2xl p-4">
              <div className=" w-10 h-10 md:w-16 md:h-16  rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={avatarCustomer}
                  alt={currentTestimonial.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h4 className="font-default font-medium text-md md:text-lg">
                  {currentTestimonial.name}
                </h4>
                <p className="text-gray-500 text-sm">{currentTestimonial.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-play indicator */}
        {/* <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            {isAutoPlay ? 'Tự động chuyển sau 4 giây' : 'Tạm dừng tự động chuyển'}
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default FeedbackSection;
