# PrintHub Login Guide

## ✅ Booth Manager Authentication System

The PrintHub application now uses **full booth manager authentication** - no more fallback needed!

### Working Booth Manager Credentials

**Booth Manager Login:**
- **Email**: `booth1@printify.com`
- **Password**: `Yu2521191`
- **Manager Name**: Yusa
- **Booth**: Booth 1
- **Location**: DMK5002

### How to Login

1. **Start the Application**: Run `npm start` in the PrintHub directory
2. **Login Screen**: The application will show a login screen on startup
3. **Enter Credentials**: Use the booth manager credentials above
4. **Access Granted**: After successful login, you'll see the main Print Hub interface with your booth manager details

### System Status

✅ **Booth Manager Routes**: Fully deployed and working  
✅ **Authentication**: Direct booth manager login (no fallback)  
✅ **Database**: Booth manager account created and verified  
✅ **Token System**: JWT tokens working correctly  
✅ **Print Operations**: All print functions available to booth managers  

### Troubleshooting

If you encounter login issues:

1. **Check Credentials**: Ensure you're using the exact email and password above
2. **Network Connection**: Verify internet connectivity
3. **Server Status**: The system connects to: `https://printifyapp-564e0522a8a7.herokuapp.com/api`

### Creating Additional Booth Managers

To create additional booth manager accounts:

1. **Access Admin Panel**: Use the main PrintiFy web application
2. **Login as Admin**: Use admin credentials
3. **Navigate to Booth Managers**: Go to the booth manager management section
4. **Add New Manager**: Fill in the required details
5. **Use in PrintHub**: The new credentials will work immediately in the PrintHub app

### Security Features

- **Secure Authentication**: JWT token-based authentication
- **Role-Based Access**: Only booth managers can access print operations
- **Session Management**: Automatic logout and session cleanup
- **Encrypted Passwords**: All passwords are securely hashed in the database

### Features After Login

Once logged in, the PrintHub interface will show:
- **User Information**: Booth manager name and booth details in the header
- **Print Job Search**: Search for student print jobs by ID or RFID
- **Print Management**: Mark jobs as completed or print directly
- **PDF Preview**: View and download PDF files
- **Logout Option**: Secure logout functionality

### Security Features

- **Session Management**: Login sessions are maintained securely
- **Authentication Required**: All print operations require valid authentication
- **Secure Logout**: Proper session cleanup on logout
- **Error Handling**: Clear error messages for invalid credentials

### Troubleshooting

**Login Issues:**
- Verify booth manager account exists in the system
- Check network connection to the PrintiFy API
- Ensure credentials are correct (case-sensitive)

**Connection Problems:**
- Confirm API endpoint is accessible: `https://printifyapp-564e0522a8a7.herokuapp.com/api`
- Check firewall settings if running in restricted environment

**Account Creation:**
- Contact system administrator to create booth manager accounts
- Ensure booth manager role is properly assigned in the system

### API Endpoints Used

The login system uses these API endpoints:
- `POST /api/booth-managers/login` - Authentication
- `GET /api/booth-managers/profile` - User profile (future use)

### Development Notes

For development and testing:
1. The application connects to the production API
2. Authentication tokens are stored in memory (not persisted)
3. Logout clears all session data
 