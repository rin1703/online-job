import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowBigUpDash, Handshake, SwatchBook } from 'lucide-react';
import { IconBox } from '@/components/ui/IconBox';

const FeaturesSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const card1Shadow = useTransform(
    scrollYProgress,
    [0, 0.25, 0.25, 1],
    ['0 20px 50px -10px rgba(0, 0, 0, 0.25)', '0 20px 50px -10px rgba(0, 0, 0, 0.25)', '', ''],
  );

  const card2Shadow = useTransform(
    scrollYProgress,
    [0.25, 0.4, 0.4, 1],
    ['', '0 20px 50px -10px rgba(0, 0, 0, 0.25)', '0 20px 50px -10px rgba(0, 0, 0, 0.25)', ''],
  );

  const card3Shadow = useTransform(
    scrollYProgress,
    [0.4, 1, 1, 1],
    ['', '0 20px 50px -10px rgba(0, 0, 0, 0.25)', '0 20px 50px -10px rgba(0, 0, 0, 0.25)', ''],
  );

  const card1Scale = useTransform(scrollYProgress, [0, 0.25, 0.25, 1], [1.02, 1.02, 1, 1]);

  const card2Scale = useTransform(scrollYProgress, [0.25, 0.4, 0.4, 1], [1, 1.02, 1.02, 1]);

  const card3Scale = useTransform(scrollYProgress, [0.4, 1, 1, 1], [1, 1.02, 1.02, 1.02]);

  const features = [
    {
      icon: <Handshake />,
      title: 'Connecting Talent and Opportunity',
      description:
        'Empowering candidates and employers to find the perfect match through a seamless online platform.',
      bgColor: 'bg-blue/20',
      shadow: card1Shadow,
      scale: card1Scale,
    },
    {
      icon: <SwatchBook />,
      title: 'Simplifying Recruitment Processes',
      description:
        'Streamlined tools for posting jobs, submitting CVs, and managing interviews efficiently.',
      bgColor: 'bg-primary/20',
      shadow: card2Shadow,
      scale: card2Scale,
    },
    {
      icon: <ArrowBigUpDash />,
      title: 'Building Careers with Innovation',
      description:
        'Leveraging modern technology to transform how people find jobs and grow their careers.',
      bgColor: 'bg-green/20',
      shadow: card3Shadow,
      scale: card3Scale,
    },
  ];

  return (
    <section id="about" className="bg-white">
      <div ref={containerRef} className="container mx-auto  h-900">
        <div className="min-h-screen  py-20 px-4 sm:px-6 lg:px-8 sticky top-0">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mt-16 mb-0 md:my-16 font-default">
              <p className="text-sm tracking-widest  uppercase mb-4">Why choose</p>
              <p className="text-4xl sm:text-5xl font-bold  text-gray-900 m-0 md:mb-6">
                JOB PORTAL ?
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 px-10  xl:mt-20">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  style={{
                    boxShadow: feature.shadow,
                    scale: feature.scale,
                  }}
                  className={`bg-white rounded-2xl text-center lg:text-start p-5 md:p-8 transition-all duration-300 hover:translate-y-[-4px]`}
                >
                  <IconBox
                    className={` ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-2 md:mb-6`}
                  >
                    {feature.icon}
                  </IconBox>

                  <h3 className="text-md lg:text-2xl font-bold text-gray-900 mb-1 md:mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
