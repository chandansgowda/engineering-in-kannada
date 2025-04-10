import React from 'react';
import { GraduationCap, Youtube, Twitter, Linkedin, Instagram } from 'lucide-react';
import { BsTwitterX } from "react-icons/bs"
export function Footer() {
  return (
    <footer className="bg-dark/50 backdrop-blur-sm border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-white">Engineering in Kannada</span>
          </div>
          
          <p className="mt-4 max-w-md text-center text-sm text-gray-400">
            Empowering Kannada-speaking students with quality engineering education.
            Learn at your own pace, completely free.
          </p>
          
          <div className="mt-8 flex items-center gap-6">
            <a
              href="https://www.youtube.com/@EngineeringinKannada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/engineering_in_kannada/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com/chandansgowdru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <BsTwitterX className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/chandan-s-gowda-4b2913183/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Engineering in Kannada. All rights reserved.</p>
            <p className="mt-1">
              Made with ❤️ for the Kannada tech community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
