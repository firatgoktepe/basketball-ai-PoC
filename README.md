# Basketball Score Analyzer Frontend

AI-powered basketball game analysis tool that processes video footage through a backend API to extract comprehensive player statistics, game events, and generate highlight videos.

## Features

- **Backend API Integration**: Seamless integration with basketball analysis backend API
- **Video Upload & Processing**: Upload MP4 videos for AI-powered analysis with real-time progress tracking
- **Comprehensive Event Detection**: Automatically detect scores, shots, rebounds, assists, blocks, and other basketball events
- **Interactive Timeline**: Visual timeline with clickable events that seek to specific moments in the video
- **Event-Based Highlights**: Generate individual highlight videos for each detected event with proper timeframes
- **Player Filtering**: Filter events and statistics by specific players across different teams
- **Statistical Charts**: Interactive charts showing score progression, confidence distribution, and event frequency
- **Processed Video Download**: Download the analyzed video with overlays and annotations
- **Real-time Status Updates**: Live progress tracking during video analysis
- **Responsive Design**: Optimized for desktop and mobile viewing

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend Integration**: RESTful API integration with job-based processing
- **Charts & Visualization**: Recharts for interactive data visualization
- **State Management**: React Query for API state management and caching
- **UI Components**: Custom components with Tailwind CSS styling
- **Video Processing**: HTML5 video player with custom controls and timeline integration

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Video**: Select an MP4 video file of a basketball game for analysis
2. **Start Processing**: The video is uploaded to the backend API for AI analysis
3. **Monitor Progress**: Watch real-time progress updates as the video is processed
4. **Explore Results**: Once analysis is complete, explore the results through multiple tabs:
   - **Summary**: Overview of game statistics and team performance
   - **Timeline**: Interactive timeline with video player and event markers
   - **Highlights**: Individual highlight videos for each detected event
   - **Charts**: Statistical visualizations and data analysis
   - **Events**: Detailed list of all detected events with filtering options
   - **Players**: Player-specific analysis and statistics
5. **Download Results**: Download the processed video with analysis overlays
6. **Filter & Analyze**: Use player filters to focus on specific players or teams

## Recommended Video Quality

- **Resolution**: 1080p recommended for optimal analysis results
- **Camera Setup**: Stable camera position showing full court and basketball hoop
- **Hoop Visibility**: Basketball hoop must be clearly visible for accurate score detection
- **Lighting**: Good lighting improves player detection and event recognition
- **Camera Angle**: Side-court or elevated view capturing full court preferred
- **Duration**: 2-10 minutes for best processing results
- **Video Quality**: Avoid excessive compression, motion blur, or camera shake

## Architecture

The application uses a modern frontend architecture with backend API integration:

- **Frontend**: Next.js React application with TypeScript
- **API Integration**: RESTful API calls for video upload, processing status, and result retrieval
- **State Management**: React Query for efficient API state management and caching
- **Component Structure**: Modular components for different analysis views (Timeline, Charts, Events, etc.)
- **Real-time Updates**: Polling-based status updates during video processing
- **Video Player**: Custom HTML5 video player with timeline integration and event markers

## Development Status

Current implementation includes:

- ✅ **Video Upload & Processing**: Complete video upload with backend API integration
- ✅ **Real-time Progress Tracking**: Live status updates during video analysis
- ✅ **Interactive Timeline**: Video player with clickable event markers and timeline visualization
- ✅ **Event-Based Highlights**: Individual highlight videos for each detected event with proper timeframes
- ✅ **Comprehensive Event Detection**: Support for scores, shots, rebounds, assists, blocks, and more
- ✅ **Player Filtering System**: Filter events and statistics by specific players
- ✅ **Statistical Charts**: Interactive charts for score progression, confidence distribution, and event frequency
- ✅ **Processed Video Download**: Download analyzed videos with overlays via API
- ✅ **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **TypeScript Integration**: Full type safety throughout the application
- ✅ **React Query Integration**: Efficient API state management and caching

## Key Components

### Core Components

- **VideoUploader**: Handles video file selection and upload to backend API
- **ProcessingControls**: Manages video processing initiation and progress tracking
- **ProgressIndicator**: Real-time progress updates during video analysis
- **ResultsDisplay**: Main results interface with tabbed navigation

### Analysis Views

- **GameSummary**: Overview of game statistics and team performance
- **EventTimeline**: Interactive timeline with video player and event markers
- **Highlights**: Event-based highlight video generation and playback
- **StatisticsCharts**: Interactive charts and data visualizations
- **EventList**: Detailed event listing with filtering and editing capabilities
- **PlayerBasedAnalysis**: Player-specific statistics and analysis

### Utility Components

- **PlayerFilterContext**: Global player filtering system
- **ErrorBoundary**: Comprehensive error handling and user feedback
- **HelpDialog**: User assistance and documentation

## Performance

The application is optimized for efficient frontend performance:

- **React Query**: Efficient API state management with automatic caching and background updates
- **Lazy Loading**: Components and data loaded on demand
- **Responsive Design**: Optimized for all screen sizes and devices
- **Error Boundaries**: Graceful error handling without breaking the user experience
- **TypeScript**: Compile-time error checking and better development experience
- **Modern React**: Uses React 19 with latest features and optimizations

### Performance Features

- Real-time progress updates without blocking the UI
- Efficient video player with custom controls and timeline integration
- Smooth transitions between different analysis views
- Optimized chart rendering with Recharts
- Responsive video player that adapts to different screen sizes

## Help & Documentation

The application includes comprehensive help and documentation:

- **Help Dialog**: Accessible via the help button (?) in the bottom-right corner
- **Quick Start Guide**: Step-by-step usage instructions
- **FAQ & Troubleshooting**: Common issues and solutions
- **Privacy Information**: Data handling and security details
- **Component Documentation**: Well-documented TypeScript interfaces and components

## License

MIT License
