# Movie App

A modern, responsive movie discovery application built with React, TypeScript, and Vite. Browse movies by category, search for your favorites, and explore detailed information about each film.

## Table of Contents

- [Product Site](#product-site)
- [Product Demo](#product-demo)
- [Build Instructions](#build-instructions)
- [Features](#features)
- [Technology Stack](#technology-stack)

## Product Site

([https://nitflex.vercel.app](https://nitflex.vercel.app))

## Product Demo

### Screen Recording

([Watch my product demo here](https://drive.google.com/file/d/16QB0Yi7WITH2pHfOxeo_1Nr-JwlIc5I4/view?usp=sharing))

## Build Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TrietTran1701/elotus-test.git
   cd elotus-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_TMDB_API_KEY=your_api_key_here
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   VITE_CACHE_DURATION=300000
   VITE_APP_TITLE=your_app_title
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```
   The production build will be in the `dist` directory.

6. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Features

### Required Features ✓

- [x] **Movie List Viewing** - Users can view a list of movies currently playing in theaters. Poster images load asynchronously.
- [x] **Tab Navigation** - Tab bar for **Now Playing** and **Top Rated** movies with smooth transitions.
- [x] **Search Functionality** - Search bar in the header for real-time movie search.
- [x] **Movie Details** - Users can view detailed information about a movie by clicking on a movie card.
- [x] **Loading States** - Loading indicators displayed while waiting for API responses.
- [x] **Error Handling** - User-friendly error messages displayed when network errors occur.
- [x] **Responsive Design** - Basic responsive layout that works on various screen sizes.

### Optional Features ✓

- [x] **View Mode Toggle** - Segmented control to switch between list view and grid view for better user experience.
- [x] **Image Animations** - All images fade in smoothly when loaded.
- [x] **Lazy Loading** - Implemented lazy loading for images to improve performance.
- [x] **Custom Interactions** - Customized highlight and selection effects for movie cards.
- [x] **Skeleton Loading** - Enhanced UX with skeleton loading screens instead of basic spinners.
- [x] **Enhanced Responsive** - Improved responsive design with mobile-optimized layouts.

### Additional UI Features

#### Navigation & Layout
- **Hero Carousel** - Dynamic hero section showcasing popular movies with auto-play functionality and thumbnail navigation
- **Header Navigation** - Sticky header with logo, search bar, category navigation, and mobile menu
- **Tab Bar** - Category tabs for easy navigation between Now Playing and Top Rated movies
- **Mobile Menu** - Hamburger menu for mobile devices with smooth animations
- **Page Transitions** - Smooth page transitions between routes
- **Scroll to Top** - Button to quickly return to the top of the page

#### Movie Display Components
- **Movie Carousel** - Horizontal scrolling carousel for displaying movie collections
- **Movie Grid** - Responsive grid layout for displaying movies in card format
- **Movie List** - List view layout with movie information
- **Movie Card** - Interactive movie cards with hover effects, tooltips, and lazy-loaded images
- **Cast Member** - Display of cast members with photos and names on detail pages

#### Pages
- **Home Page** - Main landing page with hero section, tab navigation, and movie carousels
- **Movie Detail Page** - Comprehensive movie information page with backdrop, poster, overview, cast, and metadata
- **Popular Movies Page** - Dedicated page for browsing popular movies
- **Upcoming Movies Page** - Page showing upcoming movies with "View more" functionality
- **404 Not Found Page** - Custom error page for invalid routes

#### Search & Filtering
- **Real-time Search** - Search functionality with debounced input and real-time results
- **Search Results** - Dedicated search results view with movie grid
- **URL-based Search** - Search queries are synced with URL parameters for shareable links

#### User Experience Enhancements
- **Skeleton Loading** - Placeholder loading states that match the final content layout
- **Error Boundaries** - Global error boundary to catch and display React errors gracefully
- **Loading States** - Multiple loading states (full-screen, inline, skeleton) for different contexts
- **Error Messages** - User-friendly error messages with retry functionality
- **Image Optimization** - Multiple image sizes loaded based on device and context
- **Tooltips** - Movie card tooltips showing additional information on hover

#### Responsive Features
- **Mobile-First Design** - Optimized for mobile devices with touch-friendly interactions
- **Breakpoint System** - Responsive breakpoints for tablet and desktop views
- **Adaptive Layouts** - Layouts that adapt to different screen sizes (grid columns, navigation, etc.)
- **Touch Gestures** - Touch-friendly carousel navigation on mobile devices

#### Performance Optimizations
- **Code Splitting** - Route-based code splitting for faster initial load
- **Image Lazy Loading** - Images load only when they're about to enter the viewport
- **Caching** - API response caching to reduce network requests
- **Memoization** - React memoization for performance-critical components
- **Debounced Search** - Search input debouncing to reduce API calls

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **SCSS/SASS** - CSS preprocessor for styling
- **Lucide React** - Icon library
- **TMDB API** - Movie data source

---

Built with ❤️ using React and TypeScript

