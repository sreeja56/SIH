import React from 'react';

interface GoogleMapPinProps {
  className?: string;
  size?: number;
}

export const GoogleMapPin: React.FC<GoogleMapPinProps> = ({
  className = 'w-4 h-4 shrink-0',
  size = 16,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Red pin head */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill="#EA4335"
      />
      {/* Top right gradient accent / 3D shadow */}
      <path
        d="M12 2C15.87 2 19 5.13 19 9C19 14.25 12 22 12 22V2Z"
        fill="#D93025"
      />
      {/* Yellow lower corner accent */}
      <path
        d="M12 22C12 22 19 14.25 19 9C19 6.5 17.5 4.5 15.5 3.5L12 22Z"
        fill="#FBBC04"
        opacity="0.25"
      />
      {/* Green bottom curve */}
      <path
        d="M12 22C12 22 5 14.25 5 9C5 7.5 5.7 6.2 6.8 5.2L12 22Z"
        fill="#34A853"
        opacity="0.3"
      />
      {/* Inner White / Blue circle */}
      <circle cx="12" cy="9" r="3.2" fill="#FFFFFF" />
      <circle cx="12" cy="9" r="2.2" fill="#4285F4" />
    </svg>
  );
};
