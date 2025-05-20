# NOVA 3D Map Application

This is a React + Vite application featuring a full-screen 3D map powered by Mapbox GL JS.

## Features

- Full-screen 3D map visualization
- Interactive navigation controls
- 3D terrain and building extrusions
- Satellite imagery for realistic view
- Default view centered on the Isle of Wight, UK

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root of the frontend directory with your Mapbox access token:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   ```

## Getting a Mapbox Access Token

To use this application, you need a Mapbox access token:

1. Sign up for a free account at [Mapbox](https://www.mapbox.com/)
2. Navigate to your account page
3. Create a new access token
4. Copy the token to your `.env` file

## Development

Run the development server:

```
npm run dev
```

## Building for Production

Build the application:

```
npm run build
```

Preview the production build:

```
npm run preview
```

## Technologies Used

- React 19
- Vite 6
- Mapbox GL JS
- React Map GL
