# PrintiFy Print Hub - Deployment Guide

## Overview

This guide covers how to build, distribute, and deploy the PrintiFy Print Hub desktop application for Windows and macOS systems.

## Building Applications

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **electron-builder** (installed as dev dependency)

### Quick Build

```bash
# Build for current platform only
npm run build

# Build for macOS only
npm run build:mac

# Build for Windows only  
npm run build:win

# Build for all platforms
npm run build:all

# Or use the build script
./build-apps.sh
```

### Build Script Options

```bash
# Build for specific platform
./build-apps.sh mac     # macOS only
./build-apps.sh win     # Windows only
./build-apps.sh all     # All platforms (default)

# Show help
./build-apps.sh help
```

## Distribution Files

After building, you'll find the following files in the `dist/` directory:

### macOS Distribution
- **`PrintiFy Print Hub-1.0.0.dmg`** - DMG installer (recommended)
- **`PrintiFy Print Hub-1.0.0-mac.zip`** - ZIP archive
- **`PrintiFy Print Hub-1.0.0-arm64.dmg`** - Apple Silicon (M1/M2) DMG
- **`PrintiFy Print Hub-1.0.0-x64.dmg`** - Intel Mac DMG

### Windows Distribution
- **`PrintiFy Print Hub Setup 1.0.0.exe`** - NSIS installer (recommended)
- **`PrintiFy Print Hub 1.0.0.exe`** - Portable executable
- **`PrintiFy Print Hub-1.0.0-win.zip`** - ZIP archive

## Installation Instructions

### macOS Installation

#### Method 1: DMG Installer (Recommended)
1. Download `PrintiFy Print Hub-1.0.0.dmg`
2. Double-click the DMG file to mount it
3. Drag the "PrintiFy Print Hub" app to the Applications folder
4. Eject the DMG
5. Launch from Applications folder or Spotlight

#### Method 2: ZIP Archive
1. Download `PrintiFy Print Hub-1.0.0-mac.zip`
2. Extract the ZIP file
3. Move "PrintiFy Print Hub.app" to Applications folder
4. Launch from Applications folder

#### macOS Security Notes
- **First Launch**: Right-click the app and select "Open" to bypass Gatekeeper
- **Alternative**: Go to System Preferences > Security & Privacy > General and click "Open Anyway"
- **Printer Permissions**: The app may request printer access permissions

### Windows Installation

#### Method 1: NSIS Installer (Recommended)
1. Download `PrintiFy Print Hub Setup 1.0.0.exe`
2. Right-click and "Run as Administrator" (if needed)
3. Follow the installation wizard
4. Choose installation directory (default: `C:\Program Files\PrintiFy Print Hub`)
5. Create desktop and start menu shortcuts
6. Launch from desktop shortcut or Start menu

#### Method 2: Portable Executable
1. Download `PrintiFy Print Hub 1.0.0.exe`
2. Create a folder (e.g., `C:\PrintHub`)
3. Place the executable in the folder
4. Run the executable directly (no installation required)

#### Windows Security Notes
- **SmartScreen**: Windows may show a warning. Click "More info" then "Run anyway"
- **Antivirus**: Some antivirus software may flag the app. Add it to exclusions if needed
- **Printer Drivers**: Ensure printer drivers are installed and working

## Deployment Strategies

### Small Scale (1-10 Computers)
- **Manual Installation**: Download and install on each computer individually
- **USB Distribution**: Copy installers to USB drives for offline installation
- **Network Share**: Place installers on a shared network drive

### Medium Scale (10-50 Computers)
- **Group Policy (Windows)**: Deploy via Windows Group Policy
- **MDM Solutions**: Use Mobile Device Management for macOS
- **Installation Scripts**: Create batch/shell scripts for automated installation

### Large Scale (50+ Computers)
- **Enterprise Deployment Tools**: Use SCCM, Jamf, or similar tools
- **Silent Installation**: Use command-line parameters for unattended installation
- **Centralized Management**: Deploy via enterprise software distribution systems

## Silent Installation

### Windows Silent Install
```cmd
# NSIS installer
"PrintiFy Print Hub Setup 1.0.0.exe" /S

# With custom install directory
"PrintiFy Print Hub Setup 1.0.0.exe" /S /D=C:\CustomPath\PrintHub
```

### macOS Silent Install
```bash
# Mount DMG and copy app
hdiutil attach "PrintiFy Print Hub-1.0.0.dmg"
cp -R "/Volumes/PrintiFy Print Hub/PrintiFy Print Hub.app" /Applications/
hdiutil detach "/Volumes/PrintiFy Print Hub"
```

## Configuration

### Default Settings
- **API URL**: `https://printifyapp-564e0522a8a7.herokuapp.com/api`
- **Auto-start**: No (can be configured per system)
- **Update Check**: Manual (no auto-update currently)

### Printer Setup
1. **Ensure Default Printer**: Set up a default printer on each system
2. **Test Printing**: Use the "Test Print" button in the app header
3. **Printer Permissions**: Grant necessary permissions on macOS

### Network Requirements
- **Internet Access**: Required for API communication
- **Firewall**: Allow outbound HTTPS (port 443) to `printifyapp-564e0522a8a7.herokuapp.com`
- **Proxy**: Configure system proxy settings if needed

## Troubleshooting

### Common Issues

#### App Won't Start
- **Windows**: Run as Administrator, check antivirus exclusions
- **macOS**: Check Gatekeeper settings, verify app permissions

#### Printing Doesn't Work
- **Check Default Printer**: Ensure a default printer is set
- **Printer Drivers**: Update or reinstall printer drivers
- **Permissions**: Grant printer access permissions (macOS)
- **Test Print**: Use the built-in test print function

#### Network/API Issues
- **Internet Connection**: Verify internet connectivity
- **Firewall**: Check firewall settings and proxy configuration
- **API Status**: Verify the PrintiFy API server is accessible

#### Performance Issues
- **System Requirements**: Ensure minimum system requirements are met
- **Memory**: Close other applications if memory is limited
- **Disk Space**: Ensure adequate free disk space

### Log Files

#### Windows Logs
- **Application Logs**: `%APPDATA%\PrintiFy Print Hub\logs\`
- **Windows Event Log**: Check Application logs for errors

#### macOS Logs
- **Application Logs**: `~/Library/Logs/PrintiFy Print Hub/`
- **Console App**: Use Console.app to view system logs

## System Requirements

### Minimum Requirements
- **Windows**: Windows 10 (64-bit) or later
- **macOS**: macOS 10.14 (Mojave) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB free space
- **Network**: Internet connection required

### Recommended Requirements
- **Windows**: Windows 11 (64-bit)
- **macOS**: macOS 12 (Monterey) or later
- **RAM**: 8GB or more
- **Disk Space**: 1GB free space
- **Printer**: Network or USB printer with current drivers

## Support and Maintenance

### Updates
- **Manual Updates**: Download and install new versions manually
- **Notification**: Users will be notified of available updates
- **Backward Compatibility**: New versions maintain API compatibility

### Support Contacts
- **Technical Support**: [Your support email]
- **Documentation**: Check README.md and SETUP.md
- **Issues**: Report bugs via [your issue tracking system]

### Maintenance Schedule
- **Regular Updates**: Monthly or as needed
- **Security Patches**: Applied immediately when available
- **Feature Updates**: Quarterly releases

## Security Considerations

### Application Security
- **Code Signing**: Applications should be code-signed for production
- **Permissions**: App requests minimal necessary permissions
- **Network**: All API communication uses HTTPS

### Deployment Security
- **Verify Downloads**: Check file hashes before deployment
- **Secure Distribution**: Use secure channels for installer distribution
- **Access Control**: Limit installation to authorized personnel

### Operational Security
- **User Training**: Train users on proper application usage
- **Monitoring**: Monitor application usage and errors
- **Updates**: Keep applications updated with latest security patches

---

## Quick Reference

### Build Commands
```bash
npm run build:mac    # macOS build
npm run build:win    # Windows build
npm run build:all    # All platforms
./build-apps.sh      # Interactive build script
```

### Installation Files
- **macOS**: `*.dmg` (installer) or `*.zip` (archive)
- **Windows**: `*Setup*.exe` (installer) or `*.exe` (portable)

### Support
- Test printing with the built-in test function
- Check printer setup and permissions
- Verify network connectivity to PrintiFy API
- Review application logs for error details 