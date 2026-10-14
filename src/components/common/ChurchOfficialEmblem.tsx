import React from 'react';

interface ChurchOfficialEmblemProps {
  className?: string;
  size?: number | string;
  color?: string;
  accentColor?: string;
}

/**
 * Emblema Vetorial Oficial da IGREJA GERAÇÃO ELEITA — IGEAD-MT
 * Baseado na identidade visual oficial enviada pela congregação:
 * - Moldura circular externa
 * - Contorno do mapa do Brasil (terra)
 * - Fogo do Espírito Santo no centro (céu)
 * - Ramos de louro/oliveira na base
 */
export const ChurchOfficialEmblem: React.FC<ChurchOfficialEmblemProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
  accentColor = '#f59e0b'
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 170 170"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill="none"
    >
      {/* Outer Circular Ring */}
      <circle
        cx="85"
        cy="85"
        r="70"
        stroke={color}
        strokeWidth="5"
        fill="none"
        opacity="0.95"
      />

      {/* Brazil Map Contour Silhouette */}
      <path
        d="M 72 32
           C 80 30, 95 33, 104 36
           C 112 38, 120 40, 124 46
           C 130 54, 134 60, 142 66
           C 148 72, 153 78, 149 86
           C 145 94, 144 102, 138 108
           C 132 114, 128 122, 122 132
           C 118 138, 114 142, 110 144
           C 106 142, 102 136, 96 130
           C 90 124, 84 122, 78 116
           C 70 110, 60 102, 54 94
           C 48 86, 46 76, 52 68
           C 58 60, 64 48, 68 40
           Z"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />

      {/* Holy Spirit Fire (Chama Central) */}
      <path
        d="M 85 130
           C 80 124, 73 112, 73 98
           C 73 84, 81 74, 82 62
           C 82 56, 85 46, 87 40
           C 89 48, 92 56, 92 62
           C 94 66, 98 70, 99 76
           C 102 68, 103 62, 101 54
           C 107 62, 109 72, 109 82
           C 109 96, 103 108, 97 118
           C 93 124, 88 128, 85 130
           Z"
        fill={color}
      />

      {/* Inner flame negative space / core */}
      <path
        d="M 85 125
           C 82 120, 78 110, 78 98
           C 78 86, 84 78, 86 68
           C 87 74, 90 82, 92 88
           C 94 92, 97 96, 97 104
           C 97 114, 91 122, 85 125
           Z"
        fill="#020617"
        opacity="0.9"
      />

      {/* Base Supporting Arc */}
      <path
        d="M 46 142 Q 85 152 124 142"
        fill="none"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Left Laurel Leaves */}
      <path
        d="M 52 138 C 45 132, 42 122, 45 116 C 50 120, 54 130, 52 138 Z"
        fill={color}
      />
      <path
        d="M 62 142 C 54 137, 50 128, 52 122 C 58 125, 62 134, 62 142 Z"
        fill={color}
      />
      <path
        d="M 72 145 C 65 141, 62 133, 65 127 C 70 130, 73 138, 72 145 Z"
        fill={color}
      />

      {/* Right Laurel Leaves */}
      <path
        d="M 118 138 C 125 132, 128 122, 125 116 C 120 120, 116 130, 118 138 Z"
        fill={color}
      />
      <path
        d="M 108 142 C 116 137, 120 128, 118 122 C 112 125, 108 134, 108 142 Z"
        fill={color}
      />
      <path
        d="M 98 145 C 105 141, 108 133, 105 127 C 100 130, 97 138, 98 145 Z"
        fill={color}
      />
    </svg>
  );
};
