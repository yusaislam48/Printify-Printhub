# PrintHub Dashboard Guide

## 🎯 Overview

The PrintHub Dashboard provides booth managers with comprehensive tools to monitor and manage their print booth operations. This dashboard integrates seamlessly with the existing PrintHub interface and offers real-time booth management capabilities.

## 🚀 Accessing the Dashboard

### From Print Hub Interface
1. **Login** to the PrintHub application with your booth manager credentials
2. **Click the Dashboard button** (📊) in the top navigation bar
3. **Dashboard loads** with your current booth information and status

### Navigation
- **Dashboard Button**: Located in the header next to the test print button
- **Back to Hub**: Use the back arrow button or "Back to Hub" quick action
- **Refresh**: Click the refresh button to update all dashboard data

## 📋 Dashboard Features

### 1. Booth Information Card
Displays essential booth details:
- **Manager Name**: Your name as the booth manager
- **Booth Name**: The name/identifier of your booth
- **Location**: Physical location of the booth
- **Booth Number**: Unique booth identifier

### 2. Paper Management Card
Real-time paper level monitoring and management:

#### Paper Level Display
- **Visual Progress Bar**: Color-coded paper level indicator
  - 🟢 **Green**: 50%+ capacity (Good)
  - 🟡 **Orange**: 20-50% capacity (Medium)
  - 🔴 **Red**: <20% capacity (Low - Needs Refill)
- **Exact Count**: Shows current sheets vs. total capacity
- **Percentage**: Displays paper level as a percentage

#### Paper Management Actions
- **Add Paper**: Increase the current paper count
- **Remove Paper**: Decrease the current paper count  
- **Set Paper Count**: Set an exact paper count

### 3. Printer Information Card
Displays printer and booth status:
- **Printer Name**: Connected printer identifier
- **Printer Model**: Printer model information
- **Status**: Active/Inactive booth status
- **Last Updated**: Timestamp of last data refresh

### 4. Quick Actions Card
One-click access to common tasks:
- **Test Print**: Send a test page to verify printer functionality
- **Refresh Status**: Update all dashboard information
- **View Logs**: Access system logs (future feature)
- **Back to Hub**: Return to the main Print Hub interface

## 🔧 Paper Management

### Adding Paper
1. Click **"Add Paper"** button
2. Enter the **number of sheets** being added
3. Click **"Update"** to confirm
4. Paper level updates automatically

### Removing Paper
1. Click **"Remove Paper"** button
2. Enter the **number of sheets** being removed
3. Click **"Update"** to confirm
4. Paper level adjusts accordingly

### Setting Exact Count
1. Click **"Set Paper Count"** button
2. Enter the **exact number of sheets** currently in the printer
3. Click **"Update"** to set the precise count
4. Useful for manual paper counting or after maintenance

### Paper Level Alerts
- **Visual Indicators**: Color-coded progress bar
- **Automatic Updates**: Real-time synchronization with server
- **Capacity Management**: Prevents overfilling beyond capacity

## 🔄 Data Synchronization

### Automatic Updates
- Dashboard data syncs with the server in real-time
- Paper count changes are immediately reflected
- Booth status updates automatically

### Manual Refresh
- Use the **refresh button** to force data update
- Helpful if connection was temporarily lost
- Ensures you have the latest information

### Error Handling
- **Network Issues**: Graceful error messages with retry options
- **Authentication**: Automatic re-authentication if session expires
- **Data Validation**: Input validation for paper count operations

## 🎨 User Interface

### Responsive Design
- **Desktop Optimized**: Full-featured dashboard layout
- **Mobile Friendly**: Responsive design for smaller screens
- **Touch Support**: Touch-friendly buttons and interactions

### Visual Feedback
- **Toast Notifications**: Success/error messages for all actions
- **Loading States**: Visual indicators during data operations
- **Hover Effects**: Interactive feedback for buttons and cards

### Material Design
- **Consistent Styling**: Matches PrintHub interface design
- **Icon System**: Material Design icons throughout
- **Color Scheme**: Professional gradient theme

## 🔐 Security & Authentication

### Access Control
- **Booth Manager Only**: Dashboard requires booth manager authentication
- **Session Management**: Secure JWT token-based authentication
- **Role Verification**: Server-side validation of booth manager permissions

### Data Protection
- **Encrypted Communication**: All API calls use HTTPS
- **Token Expiration**: Automatic session timeout for security
- **Input Validation**: Server-side validation of all inputs

## 🛠 Troubleshooting

### Common Issues

#### Dashboard Won't Load
- **Check Authentication**: Ensure you're logged in as a booth manager
- **Network Connection**: Verify internet connectivity
- **Server Status**: Confirm PrintiFy server is accessible

#### Paper Count Not Updating
- **Refresh Dashboard**: Click the refresh button
- **Check Permissions**: Verify booth manager permissions
- **Input Validation**: Ensure paper count is within valid range (0-1000)

#### Navigation Issues
- **Browser Compatibility**: Use a modern browser
- **JavaScript Enabled**: Ensure JavaScript is enabled
- **Clear Cache**: Clear browser cache if issues persist

### Error Messages
- **"Not authenticated"**: Login again with booth manager credentials
- **"Failed to load profile"**: Check network connection and try refresh
- **"Invalid paper count"**: Enter a number between 0 and printer capacity

## 📱 Mobile Usage

### Touch Interface
- **Large Touch Targets**: Buttons optimized for touch interaction
- **Swipe Navigation**: Smooth transitions between views
- **Responsive Layout**: Adapts to different screen sizes

### Mobile-Specific Features
- **Simplified Layout**: Streamlined interface for smaller screens
- **Quick Actions**: Easy access to most common functions
- **Offline Indicators**: Clear feedback when connection is lost

## 🔮 Future Enhancements

### Planned Features
- **Print Job Statistics**: Historical printing data and analytics
- **Maintenance Scheduling**: Automated maintenance reminders
- **Inventory Management**: Toner and supply level monitoring
- **Usage Reports**: Detailed booth usage reports

### Integration Possibilities
- **Printer Status API**: Direct printer communication
- **Supply Ordering**: Automatic supply reordering
- **Mobile App**: Dedicated mobile application
- **Real-time Notifications**: Push notifications for critical alerts

## 📞 Support

### Getting Help
- **Contact Administrator**: Reach out to your system administrator
- **Documentation**: Refer to this guide and other PrintHub documentation
- **Error Logs**: Check browser console for technical error details

### Reporting Issues
- **Bug Reports**: Include steps to reproduce the issue
- **Feature Requests**: Suggest improvements or new features
- **Performance Issues**: Report slow loading or responsiveness problems

---

**Dashboard Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatible with**: PrintHub v1.0.0+ 