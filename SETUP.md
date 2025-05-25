# PrintiFy Print Hub - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Application**
   ```bash
   npm start
   ```
   
   Or use the launcher script:
   ```bash
   ./start.sh
   ```

## What This App Does

This Electron desktop application replicates the exact functionality of the PrintiFy Print Hub web interface (`/print-hub`) from your original system. It provides booth operators with a dedicated desktop tool for managing student print jobs.

## Key Features Replicated

✅ **Student/RFID Search Interface**
- 7-digit Student ID validation (not starting with 0)
- 10-digit RFID Card validation (starting with 0)
- Auto-search functionality
- Real-time input validation

✅ **Print Job Management**
- Display pending print jobs for students
- Show student's available points
- Display detailed print settings (copies, paper size, color mode, etc.)
- Points validation before operations

✅ **Two Print Options**
- **"Print Now"**: Direct printing to default printer
- **"Mark as Printed"**: Manual completion for external printing

✅ **PDF Preview & Download**
- In-app PDF preview using iframe
- Native download dialog
- Open in external browser option

✅ **Point System Integration**
- Real-time points display
- Insufficient points prevention
- Automatic point deduction

## API Integration

The app connects to your deployed API at:
**https://printifyapp-564e0522a8a7.herokuapp.com/**

### Endpoints Used:
- `GET /api/print/public/jobs/student/:studentId` - Search jobs
- `POST /api/print/public/jobs/:jobId/complete` - Mark completed
- `POST /api/print/public/jobs/:jobId/print-now` - Direct printing
- `GET /api/print/public/view/:jobId` - PDF preview

## Cross-Platform Printing

The app handles printing differently based on the operating system:

- **macOS**: Uses `lp`, `lpr` commands, or opens in Preview
- **Windows/Linux**: Uses `pdf-to-printer` library
- Automatic platform detection

## File Structure

```
PrintHub/
├── main.js              # Main Electron process
├── preload.js           # Secure IPC bridge
├── index.html           # UI interface
├── styles.css           # Material Design styling
├── renderer.js          # Frontend logic
├── package.json         # Dependencies
├── start.sh            # Launcher script
├── assets/
│   └── icon.svg        # App icon
└── README.md           # Documentation
```

## Testing the Application

1. **Start the app**: `npm start`
2. **Test with a valid Student ID**: Enter a 7-digit number (not starting with 0)
3. **Test with a valid RFID**: Enter a 10-digit number starting with 0
4. **Verify API connection**: The app should search for print jobs
5. **Test PDF preview**: Click "View PDF" on any job
6. **Test printing**: Use "Print Now" or "Mark as Printed"

## Troubleshooting

### Common Issues:

1. **App won't start**
   - Run `npm install` to ensure dependencies are installed
   - Check Node.js version (requires v16+)

2. **API connection fails**
   - Verify internet connection
   - Check if the API server is running at https://printifyapp-564e0522a8a7.herokuapp.com/

3. **Printing doesn't work**
   - Ensure a default printer is configured
   - Check printer connectivity
   - On macOS, verify printer permissions

4. **PDF preview fails**
   - Check if the PDF URL is accessible
   - Try opening the PDF in an external browser

## Development Mode

For development with DevTools enabled:
```bash
npm run dev
```

## Building for Distribution

To create distributable packages:
```bash
npm install electron-builder --save-dev
npm run build
```

## Security Features

- Context isolation enabled
- Node integration disabled
- Secure IPC communication
- No direct file system access from renderer

## Performance

- Lightweight Electron app (~100MB)
- Fast startup time
- Efficient memory usage
- Responsive UI with Material Design

## Next Steps

1. Test the application with real student data
2. Configure printers on target machines
3. Deploy to booth operator workstations
4. Train operators on the interface
5. Monitor usage and gather feedback

The application is now ready for use and provides the exact same functionality as the web-based Print Hub interface! 