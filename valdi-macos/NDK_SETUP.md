# Android NDK Setup for Valdi

## Option 1: Use Existing Flutter NDK (Recommended)

If you have Flutter installed, you likely already have Android NDK:

```bash
# Check Flutter's Android SDK location
flutter doctor -v | grep "Android SDK"

# Check for NDK
ls -la ~/Library/Android/sdk/ndk/
```

Update `.bazelrc` to point to your NDK:
```bash
build --action_env=ANDROID_HOME=/Users/YOUR_USERNAME/Library/Android/sdk
build --action_env=ANDROID_NDK_HOME=/Users/YOUR_USERNAME/Library/Android/sdk/ndk/VERSION
```

## Option 2: Manual Download

### Download NDK 25.2.9519653

1. **Download from Google:**
   - macOS: https://dl.google.com/android/repository/android-ndk-r25c-darwin.dmg
   - Or ZIP: https://dl.google.com/android/repository/android-ndk-r25c-darwin.zip

2. **Extract to Android SDK:**
   ```bash
   # Create NDK directory if it doesn't exist
   mkdir -p ~/Library/Android/sdk/ndk
   
   # If you downloaded DMG, mount and copy
   # Or if ZIP:
   unzip android-ndk-r25c-darwin.zip
   mv android-ndk-r25c ~/Library/Android/sdk/ndk/25.2.9519653
   ```

3. **Verify structure:**
   ```bash
   ls ~/Library/Android/sdk/ndk/25.2.9519653/toolchains/llvm/prebuilt/darwin-x86_64
   ```
   Should contain: bin, lib64, sysroot, etc.

### Alternative: Use sdkmanager

```bash
# Install via Android SDK Manager
sdkmanager "ndk;25.2.9519653"

# Or install latest
sdkmanager "ndk-bundle"
```

## Option 3: Install via Homebrew

```bash
# Install Android command-line tools
brew install --cask android-commandlinetools

# Install NDK
sdkmanager --sdk_root=/usr/local/share/android-commandlinetools "ndk;25.2.9519653"
```

## Verify Installation

```bash
# Check NDK exists
ls -la $ANDROID_NDK_HOME/toolchains/llvm/prebuilt/

# Test Valdi build
cd valdi-macos
valdi projectsync
```

## Troubleshooting

### Error: "can't readdir(), not a directory"
- NDK download incomplete
- Check if toolchains/llvm/prebuilt/darwin-x86_64 exists
- Re-download or use different NDK version

### Error: "ANDROID_NDK_HOME not set"
- Add to .bazelrc or set environment variable:
  ```bash
  export ANDROID_NDK_HOME=~/Library/Android/sdk/ndk/25.2.9519653
  ```

## Current Setup

This project uses:
- **ANDROID_HOME**: `/Users/universinformatique/Library/Android/sdk`
- **ANDROID_NDK_HOME**: `/Users/universinformatique/Library/Android/sdk/ndk/26.3.11579264`
- Configured in: `.bazelrc`
