const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const printer = require('pdf-to-printer');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

// API Configuration
const API_URL = 'https://printifyapp-564e0522a8a7.herokuapp.com/api';

let mainWindow;
let authToken = null;
let currentBoothManager = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add icon if available
    title: 'PrintiFy Print Hub',
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Authentication IPC Handlers
ipcMain.handle('login-booth-manager', async (event, credentials) => {
  try {
    console.log('Attempting booth manager login...');
    
    const response = await axios.post(`${API_URL}/booth-managers/login`, {
      email: credentials.email,
      password: credentials.password
    });

    if (response.data.success) {
      authToken = response.data.token;
      currentBoothManager = response.data.boothManager;
      
      console.log('Booth manager login successful:', currentBoothManager.name);
      
      return {
        success: true,
        boothManager: currentBoothManager,
        token: authToken
      };
    } else {
      console.log('Booth manager login failed:', response.data.message);
      return {
        success: false,
        error: response.data.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Booth manager login error:', error.message);
    
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || 'Login failed';
      
      if (statusCode === 401) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      } else if (statusCode === 404) {
        return {
          success: false,
          error: 'Booth manager system not available'
        };
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    return {
      success: false,
      error: 'Network error. Please check your connection.'
    };
  }
});

ipcMain.handle('logout-booth-manager', async (event) => {
  try {
    authToken = null;
    currentBoothManager = null;
    
    console.log('Booth manager logged out');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Error during logout'
    };
  }
});

ipcMain.handle('get-current-booth-manager', async (event) => {
  return {
    success: true,
    boothManager: currentBoothManager,
    isAuthenticated: !!authToken
  };
});

// Booth Manager Dashboard IPC Handlers
ipcMain.handle('get-booth-manager-profile', async (event) => {
  try {
    console.log('Getting booth manager profile...');
    
    if (!authToken || !currentBoothManager) {
      console.log('Not authenticated - no token or booth manager');
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    console.log('Making request to:', `${API_URL}/booth-managers/profile`);
    console.log('With token:', authToken ? 'Present' : 'Missing');

    const response = await axios.get(`${API_URL}/booth-managers/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('Profile response status:', response.status);
    console.log('Profile response data:', response.data);

    if (response.data.success) {
      currentBoothManager = response.data.boothManager;
      console.log('Profile loaded successfully for:', currentBoothManager.name);
      return {
        success: true,
        boothManager: currentBoothManager
      };
    } else {
      console.log('Profile request failed:', response.data.message);
      return {
        success: false,
        error: response.data.message || 'Failed to get profile'
      };
    }
  } catch (error) {
    console.error('Error getting booth manager profile:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
});

ipcMain.handle('update-paper-count', async (event, paperData) => {
  try {
    if (!authToken) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const response = await axios.put(`${API_URL}/booth-managers/paper-count`, {
      loadedPaper: paperData.count,
      operation: paperData.operation
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      // Update local booth manager data
      if (currentBoothManager) {
        currentBoothManager.loadedPaper = response.data.boothManager.loadedPaper;
      }
      
      return {
        success: true,
        boothManager: response.data.boothManager,
        message: 'Paper count updated successfully'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to update paper count'
      };
    }
  } catch (error) {
    console.error('Error updating paper count:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
});

// Helper function to parse page ranges from print settings
function parsePageRanges(printSettings) {
  // If pageRange is "all" or no custom range specified, return null (print all)
  if (!printSettings || printSettings.pageRange === 'all' || !printSettings.customPageRange) {
    return null;
  }
  
  // If pageRange is "custom", parse the customPageRange
  if (printSettings.pageRange === 'custom' && printSettings.customPageRange) {
    try {
      console.log(`Parsing custom page range: "${printSettings.customPageRange}"`);
      return printSettings.customPageRange.trim();
    } catch (error) {
      console.error('Error parsing custom page range:', error);
      return null;
    }
  }
  
  return null;
}

// Helper function to download PDF to temporary file
async function downloadPdfToTemp(pdfUrl, fileName) {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `printhub_${Date.now()}_${fileName}`);
  
  try {
    const response = await axios({
      url: pdfUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve(tempFilePath);
      });
      writer.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
}

// Helper function to print PDF locally
async function printPdfLocally(filePath, printSettings = {}) {
  const platform = os.platform();
  
  try {
    if (platform === 'darwin') {
      // macOS printing using lp command
      return await printOnMacOS(filePath, printSettings);
    } else if (platform === 'win32') {
      // Windows printing using pdf-to-printer
      return await printOnWindows(filePath, printSettings);
    } else {
      // Linux printing using lp command
      return await printOnLinux(filePath, printSettings);
    }
  } catch (error) {
    throw new Error(`Local printing failed: ${error.message}`);
  }
}

// macOS printing implementation
async function printOnMacOS(filePath, printSettings) {
  const execAsync = promisify(exec);
  
  try {
    // First check if there are any printers available
    try {
      const { stdout: printerList } = await execAsync('lpstat -p');
      if (!printerList || printerList.trim() === '') {
        throw new Error('No printers found on the system');
      }
      console.log('Available printers:', printerList.trim());
    } catch (printerCheckError) {
      console.warn('Could not check printer status:', printerCheckError.message);
    }
    
    // Build lp command with options
    let command = 'lp';
    
    // Add copies
    if (printSettings.copies && printSettings.copies > 1) {
      command += ` -n ${printSettings.copies}`;
    }
    
    // Add duplex printing
    if (printSettings.printBothSides) {
      command += ' -o sides=two-sided-long-edge';
    }
    
    // Add color mode
    if (printSettings.colorMode === 'bw' || printSettings.colorMode === 'grayscale') {
      command += ' -o ColorModel=Gray';
    }
    
    // Add paper size
    if (printSettings.paperSize) {
      const paperSizeMap = {
        'a4': 'A4',
        'letter': 'Letter',
        'legal': 'Legal',
        'a3': 'A3',
        'a5': 'A5'
      };
      const macPaperSize = paperSizeMap[printSettings.paperSize.toLowerCase()] || 'A4';
      command += ` -o media=${macPaperSize}`;
    }
    
    // Add orientation
    if (printSettings.layout === 'landscape') {
      command += ' -o landscape';
    } else if (printSettings.layout === 'portrait') {
      command += ' -o portrait';
    }
    
    // Add page ranges - this is crucial for printing specific pages
    const customPageRange = parsePageRanges(printSettings);
    if (customPageRange) {
      // Use the parsed custom page range directly
      command += ` -o page-ranges=${customPageRange}`;
      console.log(`Added custom page range to command: ${customPageRange}`);
    } else {
      console.log('No custom page range specified, printing all pages');
    }
    
    // Add scaling/fit options
    if (printSettings.fitToPage) {
      command += ' -o fit-to-page';
    }
    
    // Add print quality
    if (printSettings.quality) {
      const qualityMap = {
        'draft': 'Draft',
        'normal': 'Normal',
        'high': 'High',
        'best': 'Best'
      };
      const macQuality = qualityMap[printSettings.quality.toLowerCase()];
      if (macQuality) {
        command += ` -o print-quality=${macQuality}`;
      }
    }
    
    // Add margins if specified
    if (printSettings.margins) {
      if (printSettings.margins === 'none') {
        command += ' -o page-border=none';
      } else if (printSettings.margins === 'minimum') {
        command += ' -o page-border=single';
      }
    }
    
    // Add collation
    if (printSettings.collate === false) {
      command += ' -o Collate=False';
    }
    
    command += ` "${filePath}"`;
    
    console.log(`Executing macOS print command with settings:`, printSettings);
    console.log(`Final command: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    // Check for successful print job submission
    if (stdout && stdout.includes('request id')) {
      const requestId = stdout.match(/request id is (\S+)/)?.[1];
      return { 
        success: true, 
        message: `Document sent to printer successfully${requestId ? ` (Job ID: ${requestId})` : ''}` 
      };
    }
    
    if (stderr && !stderr.includes('request id')) {
      throw new Error(stderr);
    }
    
    return { success: true, message: 'Document sent to printer successfully' };
  } catch (error) {
    console.error('lp command failed:', error.message);
    
    // Fallback: try to open in Preview with print dialog
    try {
      console.log('lp command failed, trying Preview fallback...');
      // Open in Preview and trigger print dialog
      await execAsync(`open -a Preview "${filePath}"`);
      // Wait a moment for Preview to open, then trigger print dialog
      setTimeout(async () => {
        try {
          await execAsync(`osascript -e 'tell application "Preview" to activate' -e 'tell application "System Events" to keystroke "p" using command down'`);
        } catch (scriptError) {
          console.warn('Could not trigger print dialog automatically:', scriptError.message);
        }
      }, 2000);
      
      return { 
        success: true, 
        message: 'Document opened in Preview with print dialog (please configure settings and print manually)' 
      };
    } catch (previewError) {
      console.error('Preview fallback also failed:', previewError.message);
      throw new Error(`Printing failed: ${error.message}. Preview fallback also failed: ${previewError.message}`);
    }
  }
}

// Windows printing implementation
async function printOnWindows(filePath, printSettings) {
  try {
    const options = {};
    
    // Add print settings
    if (printSettings.copies && printSettings.copies > 1) {
      options.copies = printSettings.copies;
    }
    
    // Add duplex printing
    if (printSettings.printBothSides) {
      options.duplex = 'DuplexVertical';
    }
    
    // Add paper size
    if (printSettings.paperSize) {
      const paperSizeMap = {
        'a4': 'A4',
        'letter': 'Letter',
        'legal': 'Legal',
        'a3': 'A3',
        'a5': 'A5'
      };
      const winPaperSize = paperSizeMap[printSettings.paperSize.toLowerCase()];
      if (winPaperSize) {
        options.paperSize = winPaperSize;
      }
    }
    
    // Add orientation
    if (printSettings.layout === 'landscape') {
      options.orientation = 'landscape';
    } else if (printSettings.layout === 'portrait') {
      options.orientation = 'portrait';
    }
    
    // Add page ranges - crucial for printing specific pages
    const customPageRange = parsePageRanges(printSettings);
    if (customPageRange) {
      // Use the parsed custom page range directly
      options.pages = customPageRange;
      console.log(`Added custom page range to Windows print options: ${customPageRange}`);
    } else {
      console.log('No custom page range specified, printing all pages');
    }
    
    // Add scaling/fit options
    if (printSettings.fitToPage) {
      options.scale = 'fit';
    }
    
    // Add print quality
    if (printSettings.quality) {
      const qualityMap = {
        'draft': 'draft',
        'normal': 'normal',
        'high': 'high',
        'best': 'best'
      };
      const winQuality = qualityMap[printSettings.quality.toLowerCase()];
      if (winQuality) {
        options.quality = winQuality;
      }
    }
    
    // Add color mode
    if (printSettings.colorMode === 'bw' || printSettings.colorMode === 'grayscale') {
      options.color = false;
    } else if (printSettings.colorMode === 'color') {
      options.color = true;
    }
    
    // Add collation
    if (printSettings.collate === false) {
      options.collate = false;
    }
    
    // Add margins
    if (printSettings.margins) {
      if (printSettings.margins === 'none') {
        options.margins = 'none';
      } else if (printSettings.margins === 'minimum') {
        options.margins = 'minimum';
      }
    }
    
    console.log(`Windows printing with settings:`, printSettings);
    console.log(`pdf-to-printer options:`, options);
    
    // Use pdf-to-printer library with enhanced options
    await printer.print(filePath, options);
    
    return { success: true, message: 'Document sent to printer successfully with specified settings' };
  } catch (error) {
    throw new Error(`Windows printing failed: ${error.message}`);
  }
}

// Linux printing implementation
async function printOnLinux(filePath, printSettings) {
  const execAsync = promisify(exec);
  
  try {
    // Build lp command with options (similar to macOS)
    let command = 'lp';
    
    // Add copies
    if (printSettings.copies && printSettings.copies > 1) {
      command += ` -n ${printSettings.copies}`;
    }
    
    // Add duplex printing
    if (printSettings.printBothSides) {
      command += ' -o sides=two-sided-long-edge';
    }
    
    // Add color mode
    if (printSettings.colorMode === 'bw' || printSettings.colorMode === 'grayscale') {
      command += ' -o ColorModel=Gray';
    }
    
    // Add paper size
    if (printSettings.paperSize) {
      const paperSizeMap = {
        'a4': 'A4',
        'letter': 'Letter',
        'legal': 'Legal',
        'a3': 'A3',
        'a5': 'A5'
      };
      const linuxPaperSize = paperSizeMap[printSettings.paperSize.toLowerCase()] || 'A4';
      command += ` -o media=${linuxPaperSize}`;
    }
    
    // Add orientation
    if (printSettings.layout === 'landscape') {
      command += ' -o landscape';
    } else if (printSettings.layout === 'portrait') {
      command += ' -o portrait';
    }
    
    // Add page ranges - crucial for printing specific pages
    const customPageRange = parsePageRanges(printSettings);
    if (customPageRange) {
      // Use the parsed custom page range directly
      command += ` -o page-ranges=${customPageRange}`;
      console.log(`Added custom page range to Linux command: ${customPageRange}`);
    } else {
      console.log('No custom page range specified, printing all pages');
    }
    
    // Add scaling/fit options
    if (printSettings.fitToPage) {
      command += ' -o fit-to-page';
    }
    
    // Add print quality
    if (printSettings.quality) {
      const qualityMap = {
        'draft': 'Draft',
        'normal': 'Normal',
        'high': 'High',
        'best': 'Best'
      };
      const linuxQuality = qualityMap[printSettings.quality.toLowerCase()];
      if (linuxQuality) {
        command += ` -o print-quality=${linuxQuality}`;
      }
    }
    
    // Add margins if specified
    if (printSettings.margins) {
      if (printSettings.margins === 'none') {
        command += ' -o page-border=none';
      } else if (printSettings.margins === 'minimum') {
        command += ' -o page-border=single';
      }
    }
    
    // Add collation
    if (printSettings.collate === false) {
      command += ' -o Collate=False';
    }
    
    command += ` "${filePath}"`;
    
    console.log(`Executing Linux print command with settings:`, printSettings);
    console.log(`Final command: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('request id')) {
      throw new Error(stderr);
    }
    
    return { success: true, message: 'Document sent to printer successfully with specified settings' };
  } catch (error) {
    throw new Error(`Linux printing failed: ${error.message}`);
  }
}

// Helper function to clean up temporary files
function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to cleanup temp file: ${error.message}`);
  }
}

// IPC Handlers for API communication
ipcMain.handle('search-print-jobs', async (event, searchValue) => {
  try {
    console.log(`Searching for print jobs with: ${searchValue}`);
    const response = await axios.get(`${API_URL}/print/public/jobs/student/${searchValue}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error searching print jobs:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
});

ipcMain.handle('mark-job-completed', async (event, jobId) => {
  try {
    console.log(`Marking job as completed: ${jobId}`);
    const response = await axios.post(`${API_URL}/print/public/jobs/${jobId}/complete`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error marking job as completed:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
});

// NEW: Local printing implementation
ipcMain.handle('print-job-now', async (event, jobId, jobData) => {
  let tempFilePath = null;
  
  try {
    console.log(`Starting local print process for job: ${jobId}`);
    
    // Step 1: Get the PDF URL for downloading
    const pdfUrl = jobData.proxyUrl 
      ? `https://printifyapp-564e0522a8a7.herokuapp.com${jobData.proxyUrl}`
      : `https://printifyapp-564e0522a8a7.herokuapp.com/api/print/public/view/${jobId}`;
    
    console.log(`Downloading PDF from: ${pdfUrl}`);
    
    // Step 2: Download PDF to temporary file
    tempFilePath = await downloadPdfToTemp(pdfUrl, jobData.fileName);
    console.log(`PDF downloaded to: ${tempFilePath}`);
    
    // Step 3: Print the PDF locally
    const printResult = await printPdfLocally(tempFilePath, jobData.printSettings);
    console.log(`Print result:`, printResult);
    
    // Step 4: Mark job as completed via API (only if printing succeeded)
    console.log(`Marking job ${jobId} as completed...`);
    const completeResponse = await axios.post(`${API_URL}/print/public/jobs/${jobId}/complete`);
    
    return {
      success: true,
      data: completeResponse.data,
      printMessage: printResult.message
    };
    
  } catch (error) {
    console.error('Error in local print process:', error);
    return {
      success: false,
      error: error.message || 'Failed to print document locally'
    };
  } finally {
    // Always cleanup temporary file
    if (tempFilePath) {
      setTimeout(() => cleanupTempFile(tempFilePath), 5000); // Delay cleanup to ensure printing is done
    }
  }
});

ipcMain.handle('download-pdf', async (event, jobIdOrUrl, fileName) => {
  try {
    let pdfUrl;
    
    // Check if first parameter is a URL or job ID
    if (typeof jobIdOrUrl === 'string' && (jobIdOrUrl.startsWith('http') || jobIdOrUrl.startsWith('/'))) {
      pdfUrl = jobIdOrUrl.startsWith('http') ? jobIdOrUrl : `https://printifyapp-564e0522a8a7.herokuapp.com${jobIdOrUrl}`;
    } else {
      // It's a job ID
      pdfUrl = `${API_URL}/print/public/view/${jobIdOrUrl}?download=true`;
    }
    
    console.log(`Downloading PDF: ${fileName} from ${pdfUrl}`);
    
    // Show save dialog
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save PDF',
      defaultPath: fileName,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { success: false, error: 'Download cancelled' };
    }

    // Download the file
    const response = await axios({
      url: pdfUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(result.filePath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        resolve({ success: true, filePath: result.filePath });
      });
      writer.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error.message };
  }
});

// View PDF handler
ipcMain.handle('view-pdf', async (event, jobId) => {
  try {
    const pdfUrl = `${API_URL}/print/public/view/${jobId}`;
    return {
      success: true,
      url: pdfUrl
    };
  } catch (error) {
    console.error('Error getting PDF view URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Open PDF in external browser
ipcMain.handle('open-pdf-external', async (event, jobId) => {
  try {
    const pdfUrl = `${API_URL}/print/public/view/${jobId}`;
    await shell.openExternal(pdfUrl);
    return { success: true };
  } catch (error) {
    console.error('Error opening PDF externally:', error);
    return { success: false, error: error.message };
  }
});

// Handle app updates and other system events
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('quit-app', () => {
  app.quit();
});

// Test printing functionality
ipcMain.handle('test-print', async (event) => {
  try {
    console.log('Testing print functionality...');
    
    // Create a simple test PDF content (HTML to be converted)
    const testHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PrintHub Test Page</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; color: #1976d2; }
          .content { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PrintiFy Print Hub Test</h1>
          <p>Test print job - ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">
          <p>This is a test print to verify that the PrintHub printing functionality is working correctly.</p>
          <p>If you can see this document, the local printing system is functioning properly.</p>
          <p><strong>Platform:</strong> ${os.platform()}</p>
          <p><strong>Architecture:</strong> ${os.arch()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Save test HTML to temp file
    const tempDir = os.tmpdir();
    const testHtmlPath = path.join(tempDir, `printhub_test_${Date.now()}.html`);
    fs.writeFileSync(testHtmlPath, testHtmlContent);
    
    // On macOS, we can print HTML directly or convert to PDF first
    if (os.platform() === 'darwin') {
      try {
        // Try to print HTML directly
        const execAsync = promisify(exec);
        const { stdout, stderr } = await execAsync(`lp "${testHtmlPath}"`);
        
        // Cleanup
        setTimeout(() => cleanupTempFile(testHtmlPath), 2000);
        
        return {
          success: true,
          message: 'Test print sent successfully! Check your default printer.'
        };
      } catch (error) {
        // Fallback: open in browser for printing
        await shell.openExternal(`file://${testHtmlPath}`);
        
        // Cleanup after delay
        setTimeout(() => cleanupTempFile(testHtmlPath), 10000);
        
        return {
          success: true,
          message: 'Test page opened in browser. Please print manually to test your printer.'
        };
      }
    } else {
      // For other platforms, open in browser
      await shell.openExternal(`file://${testHtmlPath}`);
      
      // Cleanup after delay
      setTimeout(() => cleanupTempFile(testHtmlPath), 10000);
      
      return {
        success: true,
        message: 'Test page opened in browser. Please print manually to test your printer.'
      };
    }
    
  } catch (error) {
    console.error('Test print error:', error);
    return {
      success: false,
      error: `Test print failed: ${error.message}`
    };
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 