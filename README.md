# PrintiFy Print Hub

A desktop application for booth managers to manage student print jobs efficiently.

## Features

### 🔐 Authentication
- **Booth Manager Login**: Secure authentication system for booth managers
- **Session Management**: JWT token-based authentication with automatic logout
- **Role-Based Access**: Only authenticated booth managers can access print operations

### 🔍 Print Job Management
- **Student Search**: Search for print jobs by Student ID (7 digits) or RFID Card Number (10 digits)
- **Job Overview**: View all pending print jobs for a student
- **PDF Preview**: View documents before printing with built-in PDF viewer
- **Print Operations**: Direct printing to local printers with advanced settings
- **Job Completion**: Mark jobs as completed after printing

### 📊 Dashboard (NEW!)
- **Booth Information**: View booth details, manager info, and location
- **Paper Management**: Real-time paper level monitoring with visual indicators
- **Paper Operations**: Add, remove, or set exact paper counts
- **Printer Status**: Monitor printer and booth status
- **Quick Actions**: One-click access to common tasks

### 🖨️ Advanced Printing
- **Cross-Platform Support**: Works on Windows, macOS, and Linux
- **Print Settings**: Support for copies, duplex, color mode, paper size, and page ranges
- **Local Printing**: Direct communication with system printers
- **Print Preview**: View documents before sending to printer
- **Error Handling**: Comprehensive error reporting and recovery

### 💰 Point System Integration
- **Point Validation**: Check if students have sufficient points before printing
- **Real-time Updates**: Point deduction happens automatically after printing
- **Visual Indicators**: Clear display of required vs. available points

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Active internet connection for API communication

### Installation
```bash
# Clone or download the PrintHub application
cd PrintHub

# Install dependencies
npm install

# Start the application
npm start
```

### Login
Use your booth manager credentials:
- **Email**: Your assigned booth manager email
- **Password**: Your booth manager password

For testing, you can use:
- **Email**: `booth1@printify.com`
- **Password**: `Yu2521191`

## User Interface

### Main Hub
- **Search Bar**: Enter Student ID or RFID to find print jobs
- **Results Display**: Shows student info and pending print jobs
- **Job Actions**: Print now, mark as completed, or preview PDF
- **Navigation**: Access dashboard, test printer, or logout

### Dashboard
- **Booth Information Card**: Manager and booth details
- **Paper Management Card**: Real-time paper level with management tools
- **Printer Information Card**: Printer status and details
- **Quick Actions Card**: Common tasks and navigation

### Print Operations
- **PDF Preview Modal**: View documents with download and external view options
- **Print Confirmation**: Confirm print settings and point deduction
- **Status Updates**: Real-time feedback on print job status

## API Integration

The application connects to the PrintiFy server at:
```
https://printifyapp-564e0522a8a7.herokuapp.com/api
```

### Endpoints Used
- `POST /api/booth-managers/login` - Authentication
- `GET /api/booth-managers/profile` - Get booth manager profile
- `PUT /api/booth-managers/paper-count` - Update paper count
- `GET /api/print/public/jobs/student/:id` - Search print jobs
- `POST /api/print/public/jobs/:id/complete` - Mark job completed
- `GET /api/print/public/view/:id` - View PDF documents

## File Structure

```
PrintHub/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── renderer.js          # Frontend application logic
├── index.html           # Main application interface
├── styles.css           # Application styling
├── package.json         # Dependencies and scripts
├── README.md           # This file
├── LOGIN_GUIDE.md      # Authentication guide
├── DASHBOARD_GUIDE.md  # Dashboard usage guide
└── DEPLOYMENT_STATUS.md # System status
```

## Development

### Running in Development Mode
```bash
# Start with developer tools
npm start -- --dev
```

### Building for Production
```bash
# Install electron-builder (if not already installed)
npm install -g electron-builder

# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Troubleshooting

### Common Issues

#### Login Problems
- Verify booth manager credentials
- Check internet connection
- Ensure PrintiFy server is accessible

#### Printing Issues
- Test printer functionality using the "Test Print" button
- Verify printer is connected and has paper
- Check printer drivers are installed

#### Dashboard Not Loading
- Refresh the dashboard using the refresh button
- Check authentication status
- Verify network connectivity

### Error Messages
- **"Invalid credentials"**: Check email and password
- **"Network error"**: Verify internet connection
- **"Printer not found"**: Check printer connection and drivers
- **"Insufficient points"**: Student needs to add more points

## Security

### Authentication
- JWT token-based authentication
- Secure session management
- Automatic logout on inactivity

### Data Protection
- HTTPS communication with server
- No sensitive data stored locally
- Secure IPC communication between processes

### Access Control
- Booth manager role verification
- Server-side permission validation
- Protected API endpoints

## Support

### Documentation
- **LOGIN_GUIDE.md**: Detailed authentication instructions
- **DASHBOARD_GUIDE.md**: Comprehensive dashboard usage guide
- **DEPLOYMENT_STATUS.md**: Current system status and deployment info

### Getting Help
- Contact your system administrator
- Check browser console for error details
- Refer to the troubleshooting section above

### Reporting Issues
- Include steps to reproduce the problem
- Provide error messages if any
- Mention your operating system and version

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Platform**: Electron (Cross-platform)  
**License**: Private/Proprietary 