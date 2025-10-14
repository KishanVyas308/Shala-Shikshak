# 🚀 NEW AD SYSTEM - PRODUCTION READY

## 📋 Overview

This is a complete rewrite of the ad system to be production-ready, policy-compliant, and error-free.

### ✅ What's Fixed
- No more rate limiting errors (`Too many recently failed requests`)
- No more `no-fill` spam in development
- AdMob policy compliance (proper timing, frequency)
- Better error handling and user experience
- Cleaner, maintainable code
- Production-safe patterns

## 🛠️ Quick Migration Guide

### Before (Old System)
```tsx
import { useInterstitialAd, useRewardedAd, BottomBanner } from '../components/Ads';

// Old way - prone to errors
const { showInterstitialAd, loaded } = useInterstitialAd();
const { canShowInterstitial, recordInterstitialShown } = useAdFrequency();
```

### After (New System)
```tsx
import { useInterstitialAd, useRewardedAd, useAdFrequency } from '../lib/adHooks';
import { OptimizedBannerAd } from '../components/OptimizedBannerAd';

// New way - production ready
const { showInterstitialAd, isLoaded } = useInterstitialAd();
const { shouldShowInterstitialAd, recordInterstitialShown } = useAdFrequency();
```

## 📖 Components Reference

### 1. Banner Ads (Optimized)
```tsx
import { OptimizedBannerAd, SmartBannerAd, BottomBannerAd } from '../components/OptimizedBannerAd';

// Basic banner
<OptimizedBannerAd />

// Smart banner (adaptive size)
<SmartBannerAd />

// Bottom banner
<BottomBannerAd style={{ marginTop: 'auto' }} />
```

### 2. Interstitial Ads (Smart Timing)
```tsx
import { useInterstitialAd, useAdFrequency } from '../lib/adHooks';

function NavigationComponent() {
  const { showInterstitialAd, isLoaded } = useInterstitialAd();
  const { shouldShowInterstitialAd, recordInterstitialShown } = useAdFrequency();

  const handleNavigation = (route: string) => {
    // Smart ad display - follows AdMob guidelines
    if (shouldShowInterstitialAd() && isLoaded) {
      showInterstitialAd(() => {
        recordInterstitialShown();
        router.push(route);
      });
    } else {
      // Navigate directly - no spam
      router.push(route);
    }
  };
}
```

### 3. Rewarded Ads (User-Friendly)
```tsx
import { useRewardedAd } from '../lib/adHooks';

function PremiumContent() {
  const { showRewardedAd, isLoaded } = useRewardedAd();

  const handlePremiumAccess = () => {
    showRewardedAd(
      () => {
        // Reward earned - grant access
        openPremiumContent();
      },
      {
        fallbackMessage: 'જાહેરાત તૈયાર નથી, પણ તમે આગળ વધી શકો છો.',
        allowFallback: true, // Always give user access
      }
    );
  };
}
```

## 🎯 Best Practices

### ✅ DO
- Use `shouldShowInterstitialAd()` before showing interstitials
- Always provide fallback options for rewarded ads
- Use OptimizedBannerAd for better performance
- Test with development builds first
- Check `isLoaded` before showing ads

### ❌ DON'T
- Show ads on every navigation
- Show ads immediately on app launch
- Show ads on accidental taps
- Retry failed ads immediately
- Show ads on exit/back button

## 🐛 Debug Mode

Add this to any screen to see ad status:
```tsx
import { AdStatusDebug } from '../components/AdExamples';

// In your component
<AdStatusDebug />
```

## 📊 Ad Frequency Rules (AdMob Compliant)

- **Interstitial**: Max every 2 minutes, 20% chance
- **Session Limit**: Max 8 interstitials per session
- **Rewarded**: Always available when loaded
- **Banner**: No limits, optimized loading

## 🔧 Configuration

### Ad Unit IDs (in AdManager.ts)
```typescript
const AD_UNIT_IDS = {
  banner: 'ca-app-pub-3397220667540126/8068445014',
  interstitial: 'ca-app-pub-3397220667540126/4759755392',
  rewarded: 'ca-app-pub-3397220667540126/1383655159',
};
```

### Environment Handling
- **Development**: Automatically uses TestIds
- **Production**: Uses real Ad Unit IDs
- **Error Handling**: Graceful fallbacks for all scenarios

## 📈 Performance Benefits

1. **Reduced API Calls**: Smart loading prevents spam
2. **Better Match Rate**: Proper timing improves fill rate
3. **Policy Compliance**: No violations or account issues
4. **User Experience**: Never blocks user actions
5. **Maintainability**: Clean, documented code

## 🚀 Migration Steps

1. **Install new system** ✅ (Already done)
2. **Update imports** - Change to new hooks/components
3. **Test thoroughly** - Verify all ad scenarios work
4. **Deploy gradually** - Test with small user group first
5. **Monitor metrics** - Check AdMob dashboard for improvements

## 📞 Support

If you encounter issues:
1. Check debug output in development
2. Verify Ad Unit IDs are correct
3. Test with fresh app install
4. Check AdMob account for policy issues