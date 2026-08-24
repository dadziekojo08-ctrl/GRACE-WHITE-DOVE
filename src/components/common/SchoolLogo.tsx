import React from 'react';
import schoolLogo from '../../assets/logo.jpg';
import { FALLBACK_LOGO_BASE64 } from '../../assets/logoBase64';

export const SCHOOL_LOGO_SRC = schoolLogo || FALLBACK_LOGO_BASE64;

interface SchoolLogoProps {
  className?: string;
  alt?: string;
  id?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = 'w-10 h-10 object-contain',
  alt = 'Grace White Dove School Complex Logo',
  id
}) => {
  return (
    <img
      id={id}
      src={schoolLogo || FALLBACK_LOGO_BASE64}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.dataset.triedFallback) {
          target.dataset.triedFallback = '1';
          target.src = FALLBACK_LOGO_BASE64;
        }
      }}
    />
  );
};

export default SchoolLogo;
