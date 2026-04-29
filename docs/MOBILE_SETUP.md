# Acadivo Mobile App Setup Guide

Complete guide for setting up and building the Acadivo Flutter mobile application.

---

## Table of Contents

- [Flutter SDK Installation](#flutter-sdk-installation)
- [Android Studio / Xcode Setup](#android-studio--xcode-setup)
- [Firebase Project Setup](#firebase-project-setup)
- [FCM Configuration](#fcm-configuration)
- [Environment Configuration](#environment-configuration)
- [Build Commands](#build-commands)
- [Code Signing](#code-signing)
- [Store Deployment Checklist](#store-deployment-checklist)
- [Testing on Real Devices](#testing-on-real-devices)

---

## Flutter SDK Installation

### Download Flutter

```bash
# macOS
brew install flutter

# Or download manually
cd ~/development
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.x.x-stable.zip
unzip flutter_macos_3.x.x-stable.zip

# Linux
sudo snap install flutter --classic

# Or download manually
cd ~/development
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.x.x-stable.tar.xz
tar xf flutter_linux_3.x.x-stable.tar.xz
```

### Add to PATH

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.bash_profile
export PATH="$HOME/development/flutter/bin:$PATH"

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

### Verify Installation

```bash
flutter doctor
```

**Expected output:**
```
[✓] Flutter (Channel stable, 3.x.x, ...)
[✓] Android toolchain - develop for Android devices
[✓] Xcode - develop for iOS and macOS
[✓] Chrome - develop for the web
[✓] Android Studio
[✓] VS Code
[✓] Connected device
```

### Fix Any Issues

```bash
# Accept Android licenses
flutter doctor --android-licenses

# If CocoaPods is missing (macOS)
sudo gem install cocoapods

# If Android SDK is missing, install via Android Studio
```

---

## Android Studio / Xcode Setup

### Android Studio Setup

1. **Download and Install** [Android Studio](https://developer.android.com/studio)

2. **Install SDK Components:**
   - Android SDK Platform (API 34)
   - Android SDK Build-Tools (34.0.0)
   - Android Emulator
   - Android SDK Platform-Tools
   - Google Play Services

3. **Configure in Android Studio:**
   - File > Settings > Appearance & Behavior > System Settings > Android SDK
   - Install API levels 21 through 34

4. **Create Emulator:**
   - Tools > Device Manager > Create Device
   - Select Pixel 6 or similar
   - Download Android 14 (API 34) system image

### Xcode Setup (macOS only)

1. **Download Xcode** from App Store or [Apple Developer](https://developer.apple.com/download/)

2. **Install Command Line Tools:**
```bash
xcode-select --install
```

3. **Accept License:**
```bash
sudo xcodebuild -license accept
```

4. **Install CocoaPods:**
```bash
sudo gem install cocoapods
pod setup
```

5. **Open iOS Simulator:**
```bash
open -a Simulator
```

---

## Firebase Project Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Name: `acadivo-mobile`
4. Disable Google Analytics (or enable if needed)
5. Click **"Create Project"**

### Register Android App

1. Go to **Project Overview > Add App > Android**
2. **Android package name:** `com.acadivo.app`
3. **App nickname:** `Acadivo Android`
4. **Debug signing certificate SHA-1** (get with):
```bash
cd apps/mobile/android
./gradlew signingReport
# Look for SHA1 under Variant: debug
```
5. Download `google-services.json`
6. Move to `apps/mobile/android/app/google-services.json`

### Register iOS App

1. Go to **Project Overview > Add App > iOS**
2. **iOS bundle ID:** `com.acadivo.app`
3. **App nickname:** `Acadivo iOS`
4. **App Store ID:** (leave blank for now)
5. Download `GoogleService-Info.plist`
6. Move to `apps/mobile/ios/Runner/GoogleService-Info.plist`

### Configure Firebase in Xcode

1. Open `apps/mobile/ios/Runner.xcworkspace` in Xcode
2. Right-click `Runner` > **Add Files to "Runner"**
3. Select `GoogleService-Info.plist`
4. Ensure "Copy items if needed" is checked

---

## FCM Configuration

### Enable Firebase Cloud Messaging

1. In Firebase Console, go to **Project Settings > Cloud Messaging**
2. Note the **Server Key** and **Sender ID**
3. Go to **Project Settings > Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)

### Update API Environment

Add to API `.env`:
```bash
FIREBASE_PROJECT_ID=acadivo-mobile
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@acadivo-mobile.iam.gserviceaccount.com
```

### Android FCM Setup

The `google-services.json` file already contains the necessary configuration. Ensure `apps/mobile/android/build.gradle` includes:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

And `apps/mobile/android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}
```

### iOS FCM Setup

1. Open Xcode project
2. Select Runner > Signing & Capabilities
3. Click **+ Capability**
4. Add **Push Notifications**
5. Add **Background Modes** > Check **Remote Notifications**

---

## Environment Configuration for Mobile

### API Base URL

Edit `apps/mobile/lib/constants/api_constants.dart`:

```dart
class ApiConstants {
  // Development
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:5000/api'; // iOS simulator
  
  // Production (uncomment for release)
  // static const String baseUrl = 'https://api.acadivo.com.pk/api';
  
  static const String socketUrl = 'ws://10.0.2.2:5001'; // Android emulator
  // static const String socketUrl = 'wss://socket.acadivo.com.pk'; // Production
}
```

### App Configuration

Edit `apps/mobile/lib/constants/app_constants.dart`:

```dart
class AppConstants {
  static const String appName = 'Acadivo';
  static const String appVersion = '1.0.0';
  static const String supportEmail = 'support@acadivo.com.pk';
  static const String privacyPolicyUrl = 'https://acadivo.com.pk/privacy';
  static const String termsOfServiceUrl = 'https://acadivo.com.pk/terms';
}
```

### Language Support

The app supports English and Urdu. Translation files are in:
- `apps/mobile/assets/languages/en.json`
- `apps/mobile/assets/languages/ur.json`

Ensure these are declared in `pubspec.yaml`:
```yaml
flutter:
  assets:
    - assets/languages/en.json
    - assets/languages/ur.json
```

---

## Build Commands

### Debug Build

**Android:**
```bash
cd apps/mobile
flutter pub get
flutter run
```

**iOS:**
```bash
cd apps/mobile
flutter pub get
cd ios && pod install && cd ..
flutter run
```

### Release APK

```bash
cd apps/mobile
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Release AAB (for Play Store)

```bash
cd apps/mobile
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

### Release IPA (for App Store)

```bash
cd apps/mobile
flutter build ios --release

# Then archive in Xcode:
# open ios/Runner.xcworkspace
# Product > Archive
```

### Web Build (for PWA)

```bash
cd apps/mobile
flutter build web --release

# Output: build/web/
```

---

## Code Signing

### Android Keystore

Create a keystore for release signing:

```bash
cd apps/mobile/android

# Generate keystore
keytool -genkey -v -keystore acadivo-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias acadivo \
  -storepass your-store-password \
  -keypass your-key-password

# Move to secure location
mkdir -p ~/.android/keystore
mv acadivo-release-key.jks ~/.android/keystore/
```

Configure signing in `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("HOME") + "/.android/keystore/acadivo-release-key.jks")
            storePassword "your-store-password"
            keyAlias "acadivo"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Security Note:** Store keystore password in environment variables, never commit to Git:

```bash
# ~/.bashrc or CI/CD secrets
export ACADIVO_STORE_PASSWORD=your-store-password
export ACADIVO_KEY_PASSWORD=your-key-password
```

### iOS Certificates

1. **Enroll in Apple Developer Program** ($99/year)

2. **Create Certificates in Xcode:**
   - Xcode > Preferences > Accounts
   - Add your Apple ID
   - Select Team
   - Xcode will manage certificates automatically

3. **Manual Certificate Management:**
   - Go to [Apple Developer Portal](https://developer.apple.com)
   - Certificates, Identifiers & Profiles
   - Create:
     - iOS Distribution Certificate
     - App Store Provisioning Profile

4. **Configure in Xcode:**
   - Open `ios/Runner.xcworkspace`
   - Select Runner > Signing & Capabilities
   - Check "Automatically manage signing"
   - Select your Team

---

## Play Store / App Store Deployment Checklist

### Pre-Deployment Checks

| Check | Status |
|-------|--------|
| App icon (all sizes) | [ ] |
| Splash screen | [ ] |
| App name and description | [ ] |
| Screenshots (phone + tablet) | [ ] |
| Privacy policy URL | [ ] |
| Terms of service URL | [ ] |
| Support email | [ ] |
| Content rating questionnaire | [ ] |
| Data safety form | [ ] |
| Tested on real devices | [ ] |
| No debug code or logs | [ ] |
| API URL points to production | [ ] |

### Google Play Store Deployment

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill store listing (title, description, screenshots)
4. Upload AAB: `build/app/outputs/bundle/release/app-release.aab`
5. Set up pricing and distribution
6. Complete content rating
7. Publish to internal testing, then production

### Apple App Store Deployment

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill app information
4. Upload build via Xcode: Product > Archive > Distribute App
5. Complete App Store information
6. Submit for review

---

## Testing on Real Devices

### Android Device Testing

```bash
# Enable developer options on Android device
# Settings > About Phone > Tap "Build Number" 7 times

# Enable USB debugging
# Settings > Developer Options > USB Debugging

# Connect device via USB
flutter devices
# Should show your connected device

# Run on device
flutter run -d <device-id>

# Or use wireless debugging (Android 11+)
# Pair device: adb pair IP:PORT
# Connect: adb connect IP:PORT
```

### iOS Device Testing

```bash
# Connect iPhone via USB
# Trust the computer on iPhone

# Register device in Apple Developer Portal
# Or let Xcode handle it with automatic signing

# Run on device
flutter run -d <device-id>

# Or select device in Xcode and click Run
```

### Common Issues

| Issue | Solution |
|-------|----------|
| `flutter run` hangs | Run `flutter clean`, then `flutter pub get` |
| iOS build fails | `cd ios && pod install --repo-update` |
| Android license issue | `flutter doctor --android-licenses` |
| Device not detected | Check USB cable, restart ADB: `adb kill-server && adb start-server` |
| iOS signing error | Check Apple ID in Xcode preferences, verify team |
| Firebase not working | Verify `google-services.json` / `GoogleService-Info.plist` is in correct location |

---

*For API reference, see [API.md](../API.md).*
*For deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md).*
