import React from "react";

interface TopNavbarCTAProps {
  className?: string;
}

export const TopNavbarCTA: React.FC<TopNavbarCTAProps> = ({ className = "" }) => {
  return (
    <header className={`w-full max-w-[1060px] mx-auto px-4 ${className}`}>
      <div className="w-full rounded-full bg-[#071d63] text-white px-6 sm:px-10 py-3 sm:py-3.5 flex flex-wrap items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.12)] gap-4 select-none">
        {/* Contact Info Items Separated by Dividers */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-[13px] font-normal text-white/95">
          <a
            href="mailto:binamargajawatimur@gmail.com"
            className="hover:text-[#fed000] hover:underline transition-colors"
          >
            binamargajawatimur@gmail.com
          </a>

          <span className="text-white/40 select-none">|</span>

          <a
            href="https://wa.me/6289612548511"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#fed000] hover:underline transition-colors"
          >
            WA : +62-896-1254-8511
          </a>

          <span className="text-white/40 select-none">|</span>

          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#fed000] hover:underline transition-colors"
          >
            WA : +62-812-3456-7890
          </a>
        </div>

        {/* Social Media Icons on the Right */}
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="text-white/40 select-none hidden sm:inline">|</span>

          {/* X / Twitter */}
          <a
            href="https://x.com/dbmjatim"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X Twitter"
            className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/x-29.png"
              alt="Twitter"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                (e.target as any).src = "/images/twitter.png";
              }}
            />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/binamargajatim?stkn=ZmMxcWYzbTB3Zjl1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/instagram-30.png"
              alt="Instagram"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                (e.target as any).src = "/images/instagram.png";
              }}
            />
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com/@dbmjatim?si=qIWAAk8L5fMt3QQs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/youtube-31.png"
              alt="YouTube"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                (e.target as any).src = "/images/youtube.png";
              }}
            />
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/1EKHfjwTXG/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/facebook-32.png"
              alt="Facebook"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                (e.target as any).src = "/images/facebook.png";
              }}
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopNavbarCTA;
