
import React from 'react';

interface FooterProps {
    onNavigate: (sectionId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigate(sectionId);
  }

  return (
    <footer className="bg-dozo-charcoal text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-dozo-teal mb-2">dozo</h3>
            <p className="text-gray-400">Your City, Your Catalog. Rent Anything, Anywhere.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white">About Us</a></li>
              <li><a href="#careers" onClick={(e) => handleNavClick(e, 'careers')} className="hover:text-white">Careers</a></li>
              <li><a href="#press" onClick={(e) => handleNavClick(e, 'press')} className="hover:text-white">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#help" onClick={(e) => handleNavClick(e, 'help')} className="hover:text-white">Help Center</a></li>
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-white">Contact Us</a></li>
              <li><a href="#trust" onClick={(e) => handleNavClick(e, 'trust')} className="hover:text-white">Trust & Safety</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#terms" onClick={(e) => handleNavClick(e, 'terms')} className="hover:text-white">Terms of Service</a></li>
              <li><a href="#privacy" onClick={(e) => handleNavClick(e, 'privacy')} className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
           <p className="text-sm">© {new Date().getFullYear()} Njure Group. All rights reserved.</p>
           <p className="text-xs mt-1">Blueprint for a Bolder World.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;