#!/bin/bash

# PrintiFy Print Hub Build Script
# This script builds the application for Windows and macOS

echo "🚀 PrintiFy Print Hub - Build Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the PrintHub directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Create dist directory
print_status "Creating dist directory..."
mkdir -p dist

# Function to build for specific platform
build_platform() {
    local platform=$1
    local platform_name=$2
    
    print_status "Building for $platform_name..."
    
    case $platform in
        "mac")
            npm run build:mac
            ;;
        "win")
            npm run build:win
            ;;
        "all")
            npm run build:all
            ;;
        *)
            print_error "Unknown platform: $platform"
            return 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "$platform_name build completed successfully!"
    else
        print_error "$platform_name build failed!"
        return 1
    fi
}

# Parse command line arguments
case "${1:-all}" in
    "mac"|"macos")
        build_platform "mac" "macOS"
        ;;
    "win"|"windows")
        build_platform "win" "Windows"
        ;;
    "all")
        print_status "Building for all platforms..."
        build_platform "all" "All Platforms"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [platform]"
        echo ""
        echo "Platforms:"
        echo "  mac, macos    - Build for macOS only"
        echo "  win, windows  - Build for Windows only"
        echo "  all           - Build for all platforms (default)"
        echo "  help          - Show this help message"
        exit 0
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac

# Show build results
if [ $? -eq 0 ]; then
    echo ""
    print_success "Build process completed!"
    echo ""
    print_status "Build artifacts are located in the 'dist' directory:"
    
    if [ -d "dist" ]; then
        ls -la dist/
        echo ""
        
        # Calculate total size
        total_size=$(du -sh dist/ | cut -f1)
        print_status "Total build size: $total_size"
        
        echo ""
        print_status "Distribution files:"
        
        # List specific file types
        if ls dist/*.dmg 1> /dev/null 2>&1; then
            echo "  📦 macOS DMG installers:"
            ls -lh dist/*.dmg | awk '{print "    " $9 " (" $5 ")"}'
        fi
        
        if ls dist/*.zip 1> /dev/null 2>&1; then
            echo "  📦 ZIP archives:"
            ls -lh dist/*.zip | awk '{print "    " $9 " (" $5 ")"}'
        fi
        
        if ls dist/*.exe 1> /dev/null 2>&1; then
            echo "  📦 Windows installers:"
            ls -lh dist/*.exe | awk '{print "    " $9 " (" $5 ")"}'
        fi
        
        if ls dist/*Setup*.exe 1> /dev/null 2>&1; then
            echo "  📦 Windows setup files:"
            ls -lh dist/*Setup*.exe | awk '{print "    " $9 " (" $5 ")"}'
        fi
    fi
    
    echo ""
    print_success "🎉 Build completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Test the applications on target platforms"
    echo "  2. Distribute the installers to print booth operators"
    echo "  3. Provide installation instructions"
    
else
    echo ""
    print_error "❌ Build process failed!"
    echo ""
    print_status "Troubleshooting tips:"
    echo "  1. Check that all dependencies are installed: npm install"
    echo "  2. Ensure you have the required build tools for your platform"
    echo "  3. Check the error messages above for specific issues"
    echo "  4. For Windows builds on macOS, you may need Wine or a Windows VM"
fi 