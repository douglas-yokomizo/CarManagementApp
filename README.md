# Car Management App

A modern React Native application for managing car registrations with a clean, responsive UI and complete CRUD functionality.

## Features

- **Car Registration**: Add new cars with complete information (plate, brand, model, year, color, image)
- **Car Listing**: View all registered cars with search and filtering capabilities
- **Car Details**: Detailed view of each vehicle with edit/delete options
- **Image Support**: Add photos from camera or gallery
- **Responsive Design**: Modern, intuitive UI that works on all screen sizes
- **Form Validation**: Comprehensive validation for all input fields
- **Search & Filter**: Advanced filtering by brand, year, and color
- **Mock API**: JSON Server for backend simulation

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Hook Form** for form management and validation
- **Axios** for API communication
- **JSON Server** for mock backend
- **Expo Image Picker** for image selection

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CarManagementApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the JSON Server (in a separate terminal):
```bash
npm run json-server
```

4. Start the Expo development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
npm run ios     # for iOS simulator
npm run android # for Android emulator
npm run web     # for web browser
```

## Mobile Device Testing

To test the app on your physical mobile device, you have two options:

### Option 1: LAN Mode (Same WiFi Network)
If both your computer and mobile device are on the same WiFi network:

1. Update the API URL in `src/services/apiConfig.ts`:
```typescript
const API_BASE_URL = "http://YOUR_COMPUTER_IP:3001";
```

2. Replace `YOUR_COMPUTER_IP` with your actual IP address (find it using `ipconfig` on Windows or `ifconfig` on Mac/Linux)

3. Start the development server in LAN mode:
```bash
npm run start:lan  # or expo start --lan
```

### Option 2: Tunnel Mode (Recommended for Mobile Testing)
If you need to test across different networks or LAN mode doesn't work:

1. Install localtunnel globally:
```bash
npm install -g localtunnel
```

2. Start the JSON server:
```bash
npm run json-server
```

3. In a new terminal, expose your API via tunnel:
```bash
lt --port 3001 --subdomain carmanagement
```

4. Update `src/services/apiConfig.ts` with the tunnel URL:
```typescript
const API_BASE_URL = "https://carmanagement.loca.lt";
```

5. Start Expo in tunnel mode:
```bash
npm start  # Uses tunnel mode by default
```

6. Scan the QR code with your mobile device using the Expo Go app

### Troubleshooting Mobile Connection Issues

- **Network Error on iOS**: Make sure both JSON server and Expo are running, and the API URL matches your setup
- **QR Code not working**: Try clearing Expo Go app cache or restarting the development server
- **Tunnel URL not accessible**: The localtunnel URL may change; restart the tunnel and update the API config
- **CORS issues**: The JSON server is configured with `--host 0.0.0.0` to accept external connections

## Project Structure

```
CarManagementApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CarCard.tsx
│   │   ├── FilterModal.tsx
│   │   └── ImagePickerComponent.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── CarListScreen.tsx
│   │   ├── CarDetailScreen.tsx
│   │   └── CarFormScreen.tsx
│   ├── services/           # API services
│   │   ├── apiConfig.ts
│   │   └── carService.ts
│   └── types/              # TypeScript type definitions
│       ├── Car.ts
│       └── navigation.ts
├── assets/                 # Static assets
├── db.json                # JSON Server database
├── App.tsx                # Main app component
└── package.json
```

## API Endpoints

The JSON Server provides the following endpoints:

- `GET /cars` - Get all cars
- `GET /cars/:id` - Get car by ID
- `POST /cars` - Create new car
- `PUT /cars/:id` - Update car
- `DELETE /cars/:id` - Delete car
- `GET /cars?marca_like=:brand` - Search cars by brand
- `GET /cars?ano=:year` - Filter cars by year
- `GET /cars?cor_like=:color` - Search cars by color

## Key Features Implementation

### Form Validation
- Plate format validation (ABC-1234)
- Required field validation
- Year range validation
- Input length validation

### Search & Filtering
- Real-time search across multiple fields
- Advanced filtering by brand, year, and color
- Clear filters functionality
- Filter state persistence

### Image Management
- Camera capture support
- Gallery image selection
- Image preview and replacement
- Error handling for image loading

### Clean Architecture
- SOLID principles implementation
- Service layer for API communication
- Type-safe interfaces
- Separation of concerns
- Reusable components

### Performance Optimizations
- Lazy loading of images
- Optimized re-renders
- Efficient state management
- Memory leak prevention

### Security Best Practices
- Input sanitization
- Type checking
- Error boundary implementation
- Safe image handling

## Development Scripts

- `npm start` - Start Expo development server (tunnel mode)
- `npm run start:lan` - Start Expo development server (LAN mode)
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run json-server` - Start mock API server

