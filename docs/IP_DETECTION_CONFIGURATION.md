# IP Detection Global Switch Configuration

This document describes the global configuration switch for IP-based language detection and switching functionality.

## Overview

The IP detection feature allows the application to:
1. Load English version by default for all users
2. Asynchronously detect user's IP location when they visit the homepage
3. Prompt users to switch to their local language based on their IP location
4. Remember user's language choice in the browser for future visits
5. Apply the chosen language to all subsequent page loads

## Configuration

The IP detection feature is controlled by the global configuration in `config/index.ts`:

```typescript
i18n: {
  // ... other i18n settings
  ipDetection: {
    // Whether IP-based language detection should be enabled (default: false)
    enabled: false,
    // Detection delay in milliseconds (default: 1000ms)
    detectionDelay: 1000,
    // Whether to show language suggestions on all pages (default: false, only homepage)
    showOnAllPages: false,
  },
}
```

### Configuration Options

- **`enabled`** (boolean): Controls whether the IP detection feature is active
  - Default: `false` (disabled by default as requested)
  - When `false`, no IP detection or language prompting occurs
  - When `true`, enables the full IP detection workflow

- **`detectionDelay`** (number): Delay in milliseconds before starting IP detection
  - Default: `1000` (1 second)
  - Gives the page time to load before making external API calls
  - Can be adjusted based on performance requirements

- **`showOnAllPages`** (boolean): Controls where language suggestions appear
  - Default: `false` (only on homepage)
  - When `true`, shows suggestions on all pages
  - When `false`, only shows on the homepage

## Usage

### Manual Configuration

Edit the configuration in `config/index.ts`:

```typescript
// To enable IP detection
ipDetection: {
  enabled: true,
  detectionDelay: 2000, // Wait 2 seconds before detection
}

// To disable IP detection  
ipDetection: {
  enabled: false,
}
```

### Using the Helper Script

A convenience script is provided to toggle the IP detection feature:

```bash
# Check current status
node scripts/toggle-ip-detection.js --status

# Enable IP detection
node scripts/toggle-ip-detection.js --enable

# Disable IP detection
node scripts/toggle-ip-detection.js --disable
```

## How It Works

1. **Default Behavior**: All users see the English version initially
2. **Background Detection**: When enabled, the system asynchronously detects the user's IP location
3. **Language Mapping**: The detected country is mapped to available languages
4. **User Prompt**: If a different language is recommended, a banner appears asking if the user wants to switch
5. **Choice Persistence**: The user's choice is saved in browser storage
6. **Future Visits**: Subsequent visits use the remembered language preference

## Technical Implementation

### Components Involved

- **`HomeLanguageDetection`**: Main component handling the detection logic
- **`SimpleHomeLanguageDetection`**: Simplified version using global config
- **`useLanguageDetection`**: React hook containing the detection logic
- **`LanguageSuggestionBanner`**: UI component for showing language suggestions

### API Integration

The system uses multiple IP geolocation APIs for reliability:
1. Internal API endpoint (`/api/geolocation/ip-info`)
2. ip-api.com (free, no API key required)
3. ipapi.co (free tier available)

### Caching Strategy

- **Geolocation Data**: Cached for 24 hours in localStorage
- **Dismissed Suggestions**: Permanently stored to avoid repeated prompts
- **Language Preferences**: Stored in cookies for persistence across sessions

## Supported Languages

The system supports mapping from countries to the following languages:
- English (en) - Default
- Chinese (zh) - China, Taiwan, Hong Kong
- German (de) - Germany, Austria, Switzerland
- French (fr) - France, Belgium, Canada (Quebec)
- Spanish (es) - Spain, Mexico, Argentina, Colombia, etc.
- Russian (ru) - Russia
- Arabic (ar) - Saudi Arabia, UAE, Egypt, etc.

## Security & Privacy

- **No Personal Data**: Only country-level location is detected
- **External APIs**: Uses public IP geolocation services
- **Fallback**: Gracefully handles API failures
- **User Control**: Users can always dismiss suggestions

## Development & Testing

### Development Mode
In development mode, additional debug information is displayed:
- Current locale
- Suggested locale
- Country detection results
- Confidence level
- Error messages

### Testing the Feature

1. **Default State**: Verify IP detection is disabled by default
2. **Enable Feature**: Use the toggle script to enable detection
3. **Test Detection**: Visit the homepage and verify the async detection works
4. **Test Dismissal**: Dismiss suggestions and verify they don't reappear
5. **Test Choice**: Accept a language suggestion and verify it persists

### Debugging

Common issues and solutions:

- **No suggestions appearing**: Check if `enabled: true` in config
- **API failures**: Check browser network tab for external API calls
- **Caching issues**: Clear localStorage with the debug function
- **Development testing**: Use the clear cache function to reset state

## Migration Notes

This feature was added after commit `2a0159d add search switch` and builds upon the existing language infrastructure. The implementation:

- ✅ Maintains backward compatibility
- ✅ Defaults to disabled state
- ✅ Preserves existing language switching functionality
- ✅ Adds new configuration options without breaking changes

## Future Enhancements

Possible future improvements:
- Add more granular country-to-language mappings
- Support for regional language variants
- A/B testing capabilities for different prompting strategies
- Analytics integration to track conversion rates
- Admin panel for runtime configuration changes