# React Native Integration Guide

## Overview
This guide shows how to integrate the PDF to Image API with your React Native app for secure textbook viewing.

## Installation
First, install the required dependencies in your React Native project:

```bash
npm install react-native-image-viewing react-native-gesture-handler
```

## Basic Integration

### 1. API Service
Create a service to handle API calls:

```typescript
// services/chapterService.ts
class ChapterService {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getChapterPages(chapterId: string): Promise<ChapterPagesResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/chapter-pages/chapter/${chapterId}/pages?signed=true`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getChapterPage(chapterId: string, pageNumber: number): Promise<ChapterPageResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/chapter-pages/chapter/${chapterId}/page/${pageNumber}?signed=true`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export default ChapterService;
```

### 2. Secure Image Component
Create a component for secure image display:

```typescript
// components/SecureImage.tsx
import React, { useState } from 'react';
import { Image, View, Text, ActivityIndicator } from 'react-native';

interface SecureImageProps {
  uri: string;
  width: number;
  height: number;
  onError?: () => void;
  onLoad?: () => void;
}

const SecureImage: React.FC<SecureImageProps> = ({
  uri,
  width,
  height,
  onError,
  onLoad
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  if (error) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Failed to load image</Text>
      </View>
    );
  }

  return (
    <View style={{ width, height }}>
      {loading && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <Image
        source={{ uri }}
        style={{ width, height }}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="contain"
      />
    </View>
  );
};

export default SecureImage;
```

### 3. Chapter Viewer Component
Create a full-featured chapter viewer:

```typescript
// components/ChapterViewer.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import SecureImage from './SecureImage';
import ChapterService from '../services/chapterService';

interface ChapterViewerProps {
  chapterId: string;
  authToken: string;
  baseUrl: string;
}

const ChapterViewer: React.FC<ChapterViewerProps> = ({
  chapterId,
  authToken,
  baseUrl
}) => {
  const [chapterData, setChapterData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const chapterService = new ChapterService(baseUrl, authToken);

  useEffect(() => {
    loadChapterData();
  }, [chapterId]);

  const loadChapterData = async () => {
    try {
      const data = await chapterService.getChapterPages(chapterId);
      setChapterData(data);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageData = () => {
    return chapterData?.pages.find(page => page.page === currentPage);
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= chapterData.totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return <View><Text>Loading...</Text></View>;
  }

  if (!chapterData) {
    return <View><Text>No data available</Text></View>;
  }

  const currentPageData = getCurrentPageData();
  const imageWidth = screenWidth - 40;
  const imageHeight = (imageWidth * currentPageData.height) / currentPageData.width;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <SecureImage
          uri={currentPageData.imageUrl}
          width={imageWidth}
          height={imageHeight}
        />
      </ScrollView>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
        <TouchableOpacity
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text>Previous</Text>
        </TouchableOpacity>
        
        <Text>Page {currentPage} of {chapterData.totalPages}</Text>
        
        <TouchableOpacity
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === chapterData.totalPages}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChapterViewer;
```

## Security Best Practices

### 1. Token Management
```typescript
// utils/auth.ts
class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }
}

export default AuthManager;
```

### 2. Image Caching
```typescript
// utils/imageCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class ImageCache {
  private static readonly CACHE_PREFIX = 'image_cache_';
  private static readonly MAX_CACHE_SIZE = 50; // Maximum cached images

  static async getCachedImage(url: string): Promise<string | null> {
    try {
      const cacheKey = `${ImageCache.CACHE_PREFIX}${url}`;
      return await AsyncStorage.getItem(cacheKey);
    } catch (error) {
      console.error('Error getting cached image:', error);
      return null;
    }
  }

  static async cacheImage(url: string, base64Data: string): Promise<void> {
    try {
      const cacheKey = `${ImageCache.CACHE_PREFIX}${url}`;
      await AsyncStorage.setItem(cacheKey, base64Data);
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(ImageCache.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default ImageCache;
```

## Performance Optimization

### 1. Lazy Loading
```typescript
// components/LazyImage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import SecureImage from './SecureImage';

interface LazyImageProps {
  uri: string;
  width: number;
  height: number;
  threshold?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  width,
  height,
  threshold = 100
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    const checkIfInView = () => {
      viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const screenHeight = Dimensions.get('window').height;
        const isVisible = pageY < screenHeight + threshold && pageY + height > -threshold;
        
        if (isVisible) {
          setShouldLoad(true);
        }
      });
    };

    checkIfInView();
  }, []);

  return (
    <View ref={viewRef} style={{ width, height }}>
      {shouldLoad && (
        <SecureImage
          uri={uri}
          width={width}
          height={height}
        />
      )}
    </View>
  );
};

export default LazyImage;
```

### 2. Preloading
```typescript
// utils/preloader.ts
class ImagePreloader {
  private static preloadedImages = new Set<string>();

  static async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url));
    await Promise.all(promises);
  }

  static async preloadImage(url: string): Promise<void> {
    if (this.preloadedImages.has(url)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.preloadedImages.add(url);
        resolve();
      };
      image.onerror = reject;
      image.src = url;
    });
  }
}

export default ImagePreloader;
```

## Error Handling

### 1. Retry Logic
```typescript
// utils/retryHandler.ts
class RetryHandler {
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError!;
  }
}

export default RetryHandler;
```

### 2. Error Boundary
```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong.</Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Usage Example

```typescript
// App.tsx
import React from 'react';
import { View } from 'react-native';
import ChapterViewer from './components/ChapterViewer';
import ErrorBoundary from './components/ErrorBoundary';
import AuthManager from './utils/auth';

const App = () => {
  const authToken = AuthManager.getInstance().getToken();

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <ChapterViewer
          chapterId="your-chapter-id"
          authToken={authToken}
          baseUrl="https://your-api-domain.com"
        />
      </View>
    </ErrorBoundary>
  );
};

export default App;
```

This integration provides:
- Secure image loading with authentication
- Lazy loading for performance
- Error handling and retry logic
- Caching for offline support
- Responsive design for different screen sizes
- Navigation controls for page browsing
