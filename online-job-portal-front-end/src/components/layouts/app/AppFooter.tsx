import React from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { IconBox } from '@/components/ui/IconBox';

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    links: [
      { name: 'Home', href: '#' },
      { name: 'For Talents', href: '#' },
      { name: 'For Clients', href: '#' },
      { name: 'FAQ', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms & Services', href: '#' },
    ],
    aboutUs: [
      { name: 'About Us', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Sign In', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Twitter, href: '#', color: 'bg-sky-400 hover:bg-sky-500' },
    { icon: Linkedin, href: '#', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: MessageCircle, href: '#', color: 'bg-green-500 hover:bg-green-600' },
  ];

  return (
    <footer className="bg-section py-12 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-50">
          {/* Brand Section */}
          <div className="flex flex-col justify-center md:justify-start md:w-2/3 space-y-4">
            <h2 className="font-default text-4xl font-bold text-gray-800 text-center md:text-start">
              Online Job Portal
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed lg:leading-8 text-center md:text-start">
              Online Job Portal helps you craft better resumes, apply confidently, and find jobs
              that truly match your skills and goals.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 pt-4 justify-center md:justify-start">
              {socialLinks.map(({ icon: Icon, href, color }, i) => (
                <a key={i} href={href} aria-label={`Social link ${i + 1}`}>
                  <IconBox
                    className={` ${color} text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110`}
                    variant="custom"
                    size="default"
                    animation={false}
                    icon={<Icon className="w-5 h-5 text-white" />}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center md:text-start md:col-span-3 ">
            <FooterColumn title="Links" items={footerLinks.links} />
            <FooterColumn title="About Us" items={footerLinks.aboutUs} />

            {/* Contact Section */}
            <div className="max-md:col-span-full flex flex-col items-center md:items-start max-md:px-12 space-y-2">
              <h3 className="text-gray-800 font-semibold text-lg mb-4 font-default">Contact Us</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Feel free to get in touch with us via phone or send us a message.
              </p>
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">+1 702 605 0067</p>
                <a
                  href="mailto:hello@jobportal.io"
                  className="text-orange-400 hover:text-orange-500 transition-colors duration-200 inline-block"
                >
                  hello@jobportal.io
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 w-full">
          <p className="w-full text-center text-sm text-gray-500">
            © {currentYear} Online Job Portal Inc. Made with passion for your success.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Reusable Footer Column Component
const FooterColumn: React.FC<{ title: string; items: { name: string; href: string }[] }> = ({
  title,
  items,
}) => (
  <div className="space-y-3">
    <h3 className="text-gray-800 font-semibold text-lg mb-4 font-default">{title}</h3>
    <ul className="space-y-2">
      {items.map(({ name, href }, i) => (
        <li key={i}>
          <a
            href={href}
            className="text-gray-500 hover:text-orange-500 text-sm transition-colors duration-200"
          >
            {name}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default AppFooter;
