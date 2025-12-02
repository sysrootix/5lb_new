import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const ProfileIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M11.9848 15.3462C8.11719 15.3462 4.81433 15.931 4.81433 18.2729C4.81433 20.6148 8.09624 21.2205 11.9848 21.2205C15.8524 21.2205 19.1543 20.6348 19.1543 18.2938C19.1543 15.9529 15.8734 15.3462 11.9848 15.3462Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M11.9848 12.0059C14.5229 12.0059 16.58 9.94779 16.58 7.40969C16.58 4.8716 14.5229 2.81445 11.9848 2.81445C9.44667 2.81445 7.38858 4.8716 7.38858 7.40969C7.38001 9.93922 9.42382 11.9973 11.9524 12.0059H11.9848Z" 
      stroke="currentColor" 
      strokeWidth="1.42857" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Using the same icon as Profile for now as per user request (duplicated SVG)
export const OrdersIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M16.5137 21.4999H8.16592C5.09955 21.4999 2.74715 20.3924 3.41534 15.9347L4.19338 9.89351C4.60528 7.66925 6.02404 6.81799 7.26889 6.81799H17.4474C18.7105 6.81799 20.0469 7.73332 20.5229 9.89351L21.3009 15.9347C21.8684 19.8889 19.5801 21.4999 16.5137 21.4999Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M16.651 6.59836C16.651 4.21229 14.7167 2.27799 12.3306 2.27799V2.27799C11.1816 2.27312 10.078 2.72615 9.26381 3.53691C8.44963 4.34766 7.99193 5.44935 7.99194 6.59836H7.99194" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M15.2963 11.1018H15.2506" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9.46566 11.1018H9.41989" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle 
      cx="11.7666" 
      cy="11.7666" 
      r="8.98856" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M18.0183 18.4852L21.5423 22.0001" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const CartIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path 
      d="M2.75012 3.24988L4.83012 3.60988L5.79312 15.0829C5.87012 16.0199 6.65312 16.7389 7.59312 16.7359H18.5021C19.3991 16.7379 20.1601 16.0779 20.2871 15.1899L21.2361 8.63188C21.3421 7.89888 20.8331 7.21888 20.1011 7.11288C20.0371 7.10388 5.16412 7.09888 5.16412 7.09888" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M14.1251 10.7948H16.8981" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M7.15447 20.2025C7.45547 20.2025 7.69847 20.4465 7.69847 20.7465C7.69847 21.0475 7.45547 21.2915 7.15447 21.2915C6.85347 21.2915 6.61047 21.0475 6.61047 20.7465C6.61047 20.4465 6.85347 20.2025 7.15447 20.2025Z" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M18.4347 20.2025C18.7357 20.2025 18.9797 20.4465 18.9797 20.7465C18.9797 21.0475 18.7357 21.2915 18.4347 21.2915C18.1337 21.2915 17.8907 21.0475 17.8907 20.7465C17.8907 20.4465 18.1337 20.2025 18.4347 20.2025Z" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path 
      d="M9.15722 20.7714V17.7047C9.1572 16.9246 9.79312 16.2908 10.581 16.2856H13.4671C14.2587 16.2856 14.9005 16.9209 14.9005 17.7047V17.7047V20.7809C14.9003 21.4432 15.4343 21.9845 16.103 22H18.0271C19.9451 22 21.5 20.4607 21.5 18.5618V18.5618V9.83784C21.4898 9.09083 21.1355 8.38935 20.538 7.93303L13.9577 2.6853C12.8049 1.77157 11.1662 1.77157 10.0134 2.6853L3.46203 7.94256C2.86226 8.39702 2.50739 9.09967 2.5 9.84736V18.5618C2.5 20.4607 4.05488 22 5.97291 22H7.89696C8.58235 22 9.13797 21.4499 9.13797 20.7714V20.7714" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
