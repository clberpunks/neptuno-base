import React from "react";
// import { tss } from "tailwind-tss-react";



const Spinner: React.FC = () => {
  

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <svg
        viewBox="0 0 150 150"
        className="w-36 h-36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(75,75)">
          {/* Efecto de pulso */}
          <circle
            cx="0"
            cy="0"
            r="70"
            fill="none"
            stroke="#ffffff22"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              values="70;80;70"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Logotipo robot */}
          <g transform="scale(0.7)">
            <path
              d="M-40,-50 h80 v100 h-80 Z"
              fill="#fff"
              rx="10"
              ry="10"
            />
            <circle cx="-20" cy="-30" r="10" fill="#000" />
            <circle cx="20" cy="-30" r="10" fill="#000" />
            <rect x="-10" y="-60" width="20" height="10" rx="5" fill="#fff" />
            <rect x="-30" y="-20" width="10" height="30" rx="5" fill="#fff" />
            <rect x="20" y="-20" width="10" height="30" rx="5" fill="#fff" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Spinner;
