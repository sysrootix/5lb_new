import React from 'react';

export const HomeNavIcon = ({ className }: { className?: string }) => (
    <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M7.40722 19.5214V16.4547C7.4072 15.6746 8.04312 15.0408 8.83101 15.0356H11.7171C12.5087 15.0356 13.1505 15.6709 13.1505 16.4547V16.4547V19.5309C13.1503 20.1932 13.6843 20.7345 14.353 20.75H16.2771C18.1951 20.75 19.75 19.2107 19.75 17.3118V17.3118V8.58784C19.7398 7.84083 19.3855 7.13935 18.788 6.68303L12.2077 1.4353C11.0549 0.521566 9.4162 0.521566 8.26342 1.4353L1.71203 6.69256C1.11226 7.14702 0.757387 7.84967 0.75 8.59736V17.3118C0.75 19.2107 2.30488 20.75 4.22291 20.75H6.14696C6.83235 20.75 7.38797 20.1999 7.38797 19.5214V19.5214" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const SearchNavIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M0.750122 0.75L2.83012 1.11L3.79312 12.583C3.87012 13.52 4.65312 14.239 5.59312 14.236H16.5021C17.3991 14.238 18.1601 13.578 18.2871 12.69L19.2361 6.132C19.3421 5.399 18.8331 4.719 18.1011 4.613C18.0371 4.604 3.16412 4.599 3.16412 4.599" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.1251 8.29492H14.8981" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M5.15447 17.7026C5.45547 17.7026 5.69847 17.9466 5.69847 18.2466C5.69847 18.5476 5.45547 18.7916 5.15447 18.7916C4.85347 18.7916 4.61047 18.5476 4.61047 18.2466C4.61047 17.9466 4.85347 17.7026 5.15447 17.7026Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M16.4347 17.7026C16.7357 17.7026 16.9797 17.9466 16.9797 18.2466C16.9797 18.5476 16.7357 18.7916 16.4347 18.7916C16.1337 18.7916 15.8907 18.5476 15.8907 18.2466C15.8907 17.9466 16.1337 17.7026 16.4347 17.7026Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Note: The user provided duplicate SVGs for the first three. I will assume the search icon is the magnifying glass which is usually standard, but the user provided the house icon 3 times and then a cart icon and a user icon.
// Wait, looking at the user request again:
// 1. House icon (Home)
// 2. House icon (Search?? No, likely a mistake in copy paste)
// 3. House icon (Percent?? No)
// 4. Cart icon
// 5. User icon
//
// The user said: "нижнее меню замени, как на скрине" and provided 5 SVGs.
// SVG 1: House
// SVG 2: House (Duplicate)
// SVG 3: House (Duplicate)
// SVG 4: Cart
// SVG 5: User
//
// BUT the screenshot shows: Home, Search, Percent, Cart, Profile.
// And the user said "по середине это кнопка с акциями" (in the middle is the button with promotions).
//
// I am missing the Search and Percent icons from the user's copy-paste.
// However, I have `SearchIcon` in `Icons.tsx`. I should check `Icons.tsx` to see if I can reuse or adapt.
// I will use `lucide-react` for the missing icons (Search, Percent) if I don't have them, or try to find them in the codebase.
// Actually, I should use the ones I have if they match well enough, or ask the user.
// But the user explicitly pasted SVGs. Let me re-read the SVGs carefully.
//
// SVG 1: path d="M7.40722..." -> House
// SVG 2: path d="M7.40722..." -> House (Identical)
// SVG 3: path d="M7.40722..." -> House (Identical)
// SVG 4: path d="M0.750122..." -> Cart (Looks like a cart with wheels)
// SVG 5: path d="M7.92048..." -> User (Profile)
//
// It seems the user copy-pasted the Home icon 3 times by mistake instead of Home, Search, Percent.
// I will use:
// 1. The provided House SVG for Home.
// 2. A standard Search SVG (or Lucide) for Search.
// 3. A standard Percent SVG (or Lucide) for Promotions.
// 4. The provided Cart SVG for Cart.
// 5. The provided User SVG for Profile.
//
// I will create `NavigationIcons.tsx` with these.

import { Search, Percent } from 'lucide-react';



export const CartNavIcon = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M0.750122 0.75L2.83012 1.11L3.79312 12.583C3.87012 13.52 4.65312 14.239 5.59312 14.236H16.5021C17.3991 14.238 18.1601 13.578 18.2871 12.69L19.2361 6.132C19.3421 5.399 18.8331 4.719 18.1011 4.613C18.0371 4.604 3.16412 4.599 3.16412 4.599" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.1251 8.29492H14.8981" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M5.15447 17.7026C5.45547 17.7026 5.69847 17.9466 5.69847 18.2466C5.69847 18.5476 5.45547 18.7916 5.15447 18.7916C4.85347 18.7916 4.61047 18.5476 4.61047 18.2466C4.61047 17.9466 4.85347 17.7026 5.15447 17.7026Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M16.4347 17.7026C16.7357 17.7026 16.9797 17.9466 16.9797 18.2466C16.9797 18.5476 16.7357 18.7916 16.4347 18.7916C16.1337 18.7916 15.8907 18.5476 15.8907 18.2466C15.8907 17.9466 16.1337 17.7026 16.4347 17.7026Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ProfileNavIcon = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M7.92048 13.2461C4.05286 13.2461 0.75 13.8309 0.75 16.1728C0.75 18.5147 4.0319 19.1204 7.92048 19.1204C11.7881 19.1204 15.09 18.5347 15.09 16.1937C15.09 13.8528 11.809 13.2461 7.92048 13.2461Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M7.92044 9.90578C10.4585 9.90578 12.5157 7.84769 12.5157 5.30959C12.5157 2.7715 10.4585 0.714355 7.92044 0.714355C5.38234 0.714355 3.32425 2.7715 3.32425 5.30959C3.31567 7.83912 5.35948 9.89721 7.88806 9.90578H7.92044Z" stroke="currentColor" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
