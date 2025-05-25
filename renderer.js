// Print Hub Electron App - Renderer Process
class PrintHubApp {
    constructor() {
        this.currentJobs = [];
        this.currentStudent = null;
        this.currentUserPoints = 0;
        this.selectedJob = null;
        this.confirmAction = null;
        this.currentBoothManager = null;
        this.isAuthenticated = false;
        this.popupTimer = null;
        this.popupTimeLeft = 30;
        this.lastSearchValue = null;
        this.isWaitingForRfidScan = false;
        this.backgroundScanInterval = null;
        
        this.init();
    }

    async init() {
        // Check if already authenticated
        await this.checkAuthentication();
        
        if (!this.isAuthenticated) {
            this.showLoginPage();
        } else {
            this.showMainApp();
        }
        
        this.setupEventListeners();
        await this.loadAppVersion();
    }

    async checkAuthentication() {
        try {
            const result = await window.electronAPI.getCurrentBoothManager();
            if (result.success && result.isAuthenticated) {
                this.currentBoothManager = result.boothManager;
                this.isAuthenticated = true;
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    }

    showLoginPage() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        this.setupLoginEventListeners();
    }

    showMainApp() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        this.updateUserInterface();
        this.updateBoothInfoDisplay();
        this.focusSearchInput();
        this.showToast('Welcome to PrintiFy Print Hub', 'success');
    }

    setupLoginEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('password');

        // Login form submission
        loginForm.addEventListener('submit', this.handleLogin.bind(this));

        // Password visibility toggle
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = passwordToggle.querySelector('.material-icons');
            icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });

        // Clear error on input
        document.getElementById('email').addEventListener('input', this.clearLoginError.bind(this));
        document.getElementById('password').addEventListener('input', this.clearLoginError.bind(this));
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnSpinner = loginBtn.querySelector('.btn-spinner');

        if (!email || !password) {
            this.showLoginError('Please enter both email and password');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'flex';
        this.clearLoginError();

        try {
            const result = await window.electronAPI.loginBoothManager({
                email: email,
                password: password
            });

            if (result.success) {
                this.currentBoothManager = result.boothManager;
                this.isAuthenticated = true;
                this.showMainApp();
                this.showToast(`Welcome back, ${this.currentBoothManager.name}!`, 'success');
            } else {
                this.showLoginError(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Network error. Please try again.');
        } finally {
            // Reset button state
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        const errorMessage = errorDiv.querySelector('.error-message');
        
        errorMessage.textContent = message;
        errorDiv.style.display = 'flex';
    }

    clearLoginError() {
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
    }

    updateUserInterface() {
        if (this.currentBoothManager) {
            // Update user info in header
            document.getElementById('userName').textContent = this.currentBoothManager.name;
        }
    }

    updateBoothInfoDisplay() {
        if (this.currentBoothManager) {
            // Update booth information cards
            document.getElementById('displayBoothName').textContent = this.currentBoothManager.boothName || 'N/A';
            document.getElementById('displayBoothLocation').textContent = this.currentBoothManager.boothLocation || 'N/A';
            document.getElementById('displayPaperCount').textContent = `${this.currentBoothManager.loadedPaper || 0} sheets`;
        }
    }

    focusSearchInput() {
        // Auto-focus the search input when main app is shown
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    async handleLogout() {
        try {
            const result = await window.electronAPI.logoutBoothManager();
            
            if (result.success) {
                this.currentBoothManager = null;
                this.isAuthenticated = false;
                this.currentJobs = [];
                this.currentStudent = null;
                this.currentUserPoints = 0;
                
                // Reset form
                document.getElementById('loginForm').reset();
                this.clearLoginError();
                
                // Show login page
                this.showLoginPage();
                this.showToast('Logged out successfully', 'info');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Error during logout', 'error');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            // Store the bound handler for later reference
            this.boundHandleSearchInput = this.handleSearchInput.bind(this);
            this.boundHandleKeyPress = this.handleKeyPress.bind(this);
            
            searchInput.addEventListener('input', this.boundHandleSearchInput);
            searchInput.addEventListener('keypress', this.boundHandleKeyPress);
        }

        // App controls
        const quitBtn = document.getElementById('quitBtn');
        const testPrintBtn = document.getElementById('testPrintBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        
        if (quitBtn) quitBtn.addEventListener('click', this.quitApp.bind(this));
        if (testPrintBtn) testPrintBtn.addEventListener('click', this.testPrint.bind(this));
        if (logoutBtn) logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        if (dashboardBtn) dashboardBtn.addEventListener('click', this.showDashboard.bind(this));

        // Popup overlay click to close
        const popupOverlay = document.getElementById('popupOverlay');
        if (popupOverlay) {
            popupOverlay.addEventListener('click', this.closeSearchPopup.bind(this));
        }

        // Test rescan button for debugging
        const testRescanBtn = document.getElementById('testRescanBtn');
        if (testRescanBtn) {
            testRescanBtn.addEventListener('click', this.testRfidRescan.bind(this));
        }

        // Dashboard controls
        this.setupDashboardEventListeners();

        // Modal controls
        this.setupModalEventListeners();
    }

    setupDashboardEventListeners() {
        const backToHubBtn = document.getElementById('backToHubBtn');
        const backToHubBtn2 = document.getElementById('backToHubBtn2');
        const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
        const dashboardRefreshBtn = document.getElementById('dashboardRefreshBtn');
        const dashboardTestPrintBtn = document.getElementById('dashboardTestPrintBtn');
        
        // Paper management buttons
        const addPaperBtn = document.getElementById('addPaperBtn');
        const removePaperBtn = document.getElementById('removePaperBtn');
        const setPaperBtn = document.getElementById('setPaperBtn');
        
        if (backToHubBtn) backToHubBtn.addEventListener('click', this.showMainHub.bind(this));
        if (backToHubBtn2) backToHubBtn2.addEventListener('click', this.showMainHub.bind(this));
        if (refreshDashboardBtn) refreshDashboardBtn.addEventListener('click', this.refreshDashboard.bind(this));
        if (dashboardRefreshBtn) dashboardRefreshBtn.addEventListener('click', this.refreshDashboard.bind(this));
        if (dashboardTestPrintBtn) dashboardTestPrintBtn.addEventListener('click', this.testPrint.bind(this));
        
        if (addPaperBtn) addPaperBtn.addEventListener('click', () => this.showPaperModal('add'));
        if (removePaperBtn) removePaperBtn.addEventListener('click', () => this.showPaperModal('remove'));
        if (setPaperBtn) setPaperBtn.addEventListener('click', () => this.showPaperModal('set'));
    }

    setupModalEventListeners() {
        // Paper update modal
        const cancelPaperUpdateBtn = document.getElementById('cancelPaperUpdateBtn');
        const confirmPaperUpdateBtn = document.getElementById('confirmPaperUpdateBtn');
        const paperOperation = document.getElementById('paperOperation');
        
        if (cancelPaperUpdateBtn) cancelPaperUpdateBtn.addEventListener('click', this.closePaperModal.bind(this));
        if (confirmPaperUpdateBtn) confirmPaperUpdateBtn.addEventListener('click', this.updatePaperCount.bind(this));
        if (paperOperation) paperOperation.addEventListener('change', this.updatePaperOperationInfo.bind(this));
    }

    handleSearchInput(e) {
        const value = e.target.value.trim();
        
        // Auto-search when input reaches valid length
        if (this.isValidSearchInput(value)) {
            // Debounce the search - give more time for RFID readers
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchPrintJobs();
            }, 800); // Increased from 500ms to 800ms
        }
    }

    isValidSearchInput(value) {
        // Student ID: exactly 7 digits
        if (/^\d{7}$/.test(value)) {
            return true;
        }
        
        // RFID: exactly 10 digits starting with 0
        if (/^0\d{9}$/.test(value)) {
            return true;
        }
        
        return false;
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.searchPrintJobs();
        }
    }

    async searchPrintJobs() {
        const searchInput = document.getElementById('searchInput');
        const searchValue = searchInput.value.trim();
        
        if (!this.isValidSearchInput(searchValue)) {
            this.showToast('Please enter a valid Student ID (7 digits) or RFID (10 digits starting with 0)', 'warning');
            return;
        }

        // Store the search value for background scanning
        this.lastSearchValue = searchValue;

        this.showSearchLoading(true);
        
        try {
            const result = await window.electronAPI.searchPrintJobs(searchValue);
            
            if (result.success) {
                // Handle the actual API response structure
                this.currentJobs = result.data.pendingPrintJobs || [];
                this.currentStudent = { name: result.data.studentName };
                this.currentUserPoints = result.data.userPoints || 0;
                
                this.showSearchPopup();
                this.startBackgroundScanning();
            } else {
                this.showToast(result.error || 'No print jobs found', 'info');
                this.clearSearchInput();
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Error searching for print jobs', 'error');
            this.clearSearchInput();
        } finally {
            this.showSearchLoading(false);
        }
    }

    showSearchLoading(show) {
        const searchLoading = document.getElementById('searchLoading');
        if (searchLoading) {
            searchLoading.style.display = show ? 'block' : 'none';
        }
    }

    showSearchPopup() {
        const popup = document.getElementById('searchPopup');
        const studentName = document.getElementById('popupStudentName');
        const userPoints = document.getElementById('popupUserPoints');
        const jobsList = document.getElementById('popupJobsList');
        const noJobsMessage = document.getElementById('noJobsMessage');

        // Update student info
        if (this.currentStudent) {
            studentName.textContent = this.currentStudent.name || 'Unknown Student';
        }
        userPoints.textContent = this.currentUserPoints;
        
        // Show jobs or no jobs message
        if (this.currentJobs.length > 0) {
        jobsList.innerHTML = '';
        this.currentJobs.forEach(job => {
            const jobCard = this.createJobCard(job);
            jobsList.appendChild(jobCard);
        });
            jobsList.style.display = 'grid';
            noJobsMessage.style.display = 'none';
        } else {
            jobsList.style.display = 'none';
            noJobsMessage.style.display = 'block';
        }
        
        // Setup manual print functionality
        this.setupManualPrintInput();
        
        // Show popup
        popup.style.display = 'flex';
        
        // Start countdown timer
        this.startPopupTimer();
    }

    setupManualPrintInput() {
        const manualPrintInput = document.getElementById('manualPrintInput');
        const manualPrintBtn = document.getElementById('manualPrintBtn');
        const printNowBtn = document.getElementById('printNowBtn');
        
        if (manualPrintInput && manualPrintBtn) {
            // Clear any existing event listeners
            manualPrintInput.replaceWith(manualPrintInput.cloneNode(true));
            manualPrintBtn.replaceWith(manualPrintBtn.cloneNode(true));
            if (printNowBtn) {
                printNowBtn.replaceWith(printNowBtn.cloneNode(true));
            }
            
            // Get fresh references
            const newManualPrintInput = document.getElementById('manualPrintInput');
            const newManualPrintBtn = document.getElementById('manualPrintBtn');
            const newPrintNowBtn = document.getElementById('printNowBtn');
            
            // Auto-focus the manual print input
            setTimeout(() => {
                newManualPrintInput.focus();
            }, 100);
            
            // Handle input changes
            newManualPrintInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                console.log('Manual input value:', value);
                console.log('Last search value:', this.lastSearchValue);
                console.log('Values match:', value === this.lastSearchValue);
                
                // Auto-trigger when valid input is detected
                if (this.isValidSearchInput(value)) {
                    // Check if it matches the current student's RFID/ID
                    if (value === this.lastSearchValue) {
                        console.log('RFID match confirmed, triggering print');
                        // Clear the input immediately
                        e.target.value = '';
                        this.triggerManualPrint();
                    } else {
                        // Different student - show message and clear input
                        console.log('RFID mismatch - Expected:', this.lastSearchValue, 'Got:', value);
                        this.showToast('This RFID/ID belongs to a different student', 'warning');
                        e.target.value = '';
                    }
                }
            });
            
            // Handle Enter key
            newManualPrintInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.triggerManualPrint();
                }
            });
            
            // Handle button click - always allow printing
            newManualPrintBtn.addEventListener('click', () => {
                this.triggerManualPrint();
            });
            
            // Handle Print Now button - immediate printing without validation
            if (newPrintNowBtn) {
                newPrintNowBtn.addEventListener('click', () => {
                    console.log('Print Now button clicked - immediate printing');
                    this.triggerManualPrint();
                });
            }
        }
    }

    async triggerManualPrint() {
        console.log('Manual print triggered');
        
        if (this.currentJobs.length === 0) {
            this.showToast('No jobs available to print', 'warning');
            return;
        }
        
        // Find the first job that the student has enough points for
        let jobToPrint = null;
        let skippedJobs = [];
        
        for (let job of this.currentJobs) {
            const pointsRequired = job.pointsUsed || 0;
            if (pointsRequired <= this.currentUserPoints) {
                jobToPrint = job;
                break;
            } else {
                skippedJobs.push({
                    name: job.fileName || 'Untitled Document',
                    points: pointsRequired
                });
            }
        }
        
        if (!jobToPrint) {
            this.showToast('No jobs can be printed - insufficient points for all jobs', 'error');
            return;
        }
        
        // Show message about skipped jobs if any
        if (skippedJobs.length > 0) {
            const skippedNames = skippedJobs.map(job => `${job.name} (${job.points} pts)`).join(', ');
            this.showToast(`Skipped ${skippedJobs.length} job(s) due to insufficient points: ${skippedNames}`, 'info');
        }
        
        console.log('Printing job:', jobToPrint);
        console.log('Skipped jobs:', skippedJobs);
        
        // Close the search popup
        this.closeSearchPopup();
        
        // Show printing popup
        this.showPrintingPopup(jobToPrint);
        
        // Start printing process
        await this.printJobWithProgress(jobToPrint);
    }

    startPopupTimer() {
        this.popupTimeLeft = 30;
        const timerElement = document.getElementById('popupTimer');
        
        // Clear any existing timer
        if (this.popupTimer) {
            clearInterval(this.popupTimer);
        }
        
        // Update timer display
        timerElement.textContent = this.popupTimeLeft;
        
        // Start countdown
        this.popupTimer = setInterval(() => {
            this.popupTimeLeft--;
            timerElement.textContent = this.popupTimeLeft;
            
            if (this.popupTimeLeft <= 0) {
                this.closeSearchPopup();
            }
        }, 1000);
    }

    closeSearchPopup() {
        const popup = document.getElementById('searchPopup');
        popup.style.display = 'none';
        
        // Clear timer
        if (this.popupTimer) {
            clearInterval(this.popupTimer);
            this.popupTimer = null;
        }
        
        // Stop background scanning
        this.stopBackgroundScanning();
        
        // Clear both search inputs
        this.clearSearchInput();
        
        // Clear manual print input
        const manualPrintInput = document.getElementById('manualPrintInput');
        if (manualPrintInput) {
            manualPrintInput.value = '';
        }
        
        // Refocus main search input
        this.focusSearchInput();
    }

    clearSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card';
        
        const formatPageSettings = (printSettings) => {
            console.log('Print settings data:', printSettings);
            
            if (!printSettings) {
                return '1 copy • All pages • Portrait • A4 • Color';
            }
            
            const parts = [];
            
            // Handle copies
            const copies = printSettings.copies || printSettings.numberOfCopies || 1;
            parts.push(`${copies} ${copies === 1 ? 'copy' : 'copies'}`);
            
            // Handle page range
            if (printSettings.customPageRange) {
                parts.push(`Pages: ${printSettings.customPageRange}`);
            } else if (printSettings.pageRange && printSettings.pageRange !== 'all') {
                parts.push(`Pages: ${printSettings.pageRange}`);
            } else if (printSettings.pages && printSettings.pages !== 'all') {
                parts.push(`Pages: ${printSettings.pages}`);
            } else {
                parts.push('All pages');
            }
            
            // Handle layout/orientation
            const orientation = printSettings.orientation || printSettings.layout || 'portrait';
            parts.push(orientation.charAt(0).toUpperCase() + orientation.slice(1).toLowerCase());
            
            // Handle paper size
            const paperSize = printSettings.paperSize || printSettings.pageSize || printSettings.paper || 'A4';
            parts.push(paperSize.toUpperCase());
            
            // Handle color mode
            let colorMode = 'Color'; // default
            if (printSettings.colorMode === 'bw' || printSettings.colorMode === 'grayscale') {
                colorMode = 'B&W';
            } else if (printSettings.color === false || printSettings.grayscale === true) {
                colorMode = 'B&W';
            } else if (printSettings.colorMode === 'color' || printSettings.color === true) {
                colorMode = 'Color';
            }
            parts.push(colorMode);
            
            // Handle double-sided printing
            if (printSettings.printBothSides || printSettings.duplex || printSettings.doubleSided) {
                parts.push('Double-sided');
            }
            
            return parts.join(' • ');
        };

        const pointsRequired = job.pointsUsed || 0;
        const hasInsufficientPoints = pointsRequired > this.currentUserPoints;
        
        card.innerHTML = `
            <div class="job-header">
                <h4 class="job-title">${job.fileName || 'Untitled Document'}</h4>
                <span class="job-status pending">Pending</span>
            </div>
            
            <div class="job-meta">
            <div class="job-details">
                <div class="detail-group">
                        <span class="detail-label">Pages</span>
                        <span class="detail-value">${job.printSettings?.totalPages || job.pageCount || 'N/A'}</span>
                </div>
                <div class="detail-group">
                        <span class="detail-label">Size</span>
                        <span class="detail-value">${job.fileSize || 'N/A'}</span>
                </div>
                <div class="detail-group">
                        <span class="detail-label">Submitted</span>
                        <span class="detail-value">${this.formatDate(job.createdAt)}</span>
                </div>
                </div>
                
                <div class="print-settings-section">
                    <div class="settings-header">
                        <span class="material-icons">settings</span>
                        <span>Print Settings</span>
                </div>
                    <div class="settings-content">
                        ${formatPageSettings(job.printSettings)}
                </div>
                </div>
                
                <div class="points-required ${hasInsufficientPoints ? 'insufficient' : ''}">
                    <div class="points-required-label">
                        <span class="material-icons">account_balance_wallet</span>
                        Points Required
                </div>
                    <div class="points-required-value">${pointsRequired}</div>
                </div>
                
                ${hasInsufficientPoints ? `
                        <div class="insufficient-warning">
                        Insufficient points. Student has ${this.currentUserPoints} points.
                        </div>
                    ` : ''}
            </div>
            
            <div class="job-actions">
                <button class="btn btn-primary" onclick="app.printJobNow('${job._id}')" ${hasInsufficientPoints ? 'disabled' : ''}>
                    <span class="material-icons">print</span>
                        Print Now
                </button>
            </div>
        `;
        
        return card;
    }

    async printJobNow(jobId) {
        const job = this.currentJobs.find(j => j._id === jobId);
        if (!job) {
            this.showToast('Job not found', 'error');
            return;
        }

        const pointsRequired = job.pointsUsed || 0;
        if (pointsRequired > this.currentUserPoints) {
            this.showToast(`Cannot print "${job.fileName}" - requires ${pointsRequired} points, student has ${this.currentUserPoints} points`, 'error');
            return;
        }

        this.showLoading('Printing document...');
        
        try {
            const result = await window.electronAPI.printJobNow(jobId, job);
            
            if (result.success) {
                this.showToast('Document printed successfully!', 'success');
                this.updateJobStatus(jobId, 'completed');
                
                // Update user points
                this.currentUserPoints -= pointsRequired;
                this.updatePointsDisplay();
                
                // Close popup after successful print
                setTimeout(() => {
                    this.closeSearchPopup();
                }, 2000);
            } else {
                this.showToast(result.error || 'Failed to print document', 'error');
            }
        } catch (error) {
            console.error('Print error:', error);
            this.showToast('Error printing document', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async markJobCompleted(jobId) {
                try {
                    const result = await window.electronAPI.markJobCompleted(jobId);
                    
                    if (result.success) {
                this.showToast('Job marked as completed', 'success');
                        this.updateJobStatus(jobId, 'completed');
                    } else {
                this.showToast(result.error || 'Failed to mark job as completed', 'error');
                    }
                } catch (error) {
            console.error('Error marking job as completed:', error);
            this.showToast('Error updating job status', 'error');
                }
    }

    async previewPdf(jobId) {
        try {
            const result = await window.electronAPI.viewPdf(jobId);
            
            if (result.success) {
                // Open PDF in external browser
                await window.electronAPI.openExternal(result.url);
            } else {
                this.showToast('Failed to open PDF preview', 'error');
            }
        } catch (error) {
            console.error('Error opening PDF preview:', error);
            this.showToast('Error opening PDF preview', 'error');
        }
    }

    updateJobStatus(jobId, status) {
        const job = this.currentJobs.find(j => j._id === jobId);
        if (job) {
            job.status = status;
        }
    }

    updatePointsDisplay() {
        const userPoints = document.getElementById('popupUserPoints');
        if (userPoints) {
            userPoints.textContent = this.currentUserPoints;
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = document.getElementById('loadingMessage');
        
        if (overlay && messageEl) {
            messageEl.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        
        toast.innerHTML = `
            <span class="material-icons">${iconMap[type] || 'info'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">
                <span class="material-icons">close</span>
            </button>
        `;
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
            });
        } catch (error) {
            return 'Invalid date';
        }
    }

    async loadAppVersion() {
        try {
            const version = await window.electronAPI.getAppVersion();
            const versionEl = document.getElementById('appVersion');
            if (versionEl) {
                versionEl.textContent = `v${version}`;
            }
        } catch (error) {
            console.error('Error loading app version:', error);
        }
    }

    async quitApp() {
        try {
            await window.electronAPI.quitApp();
        } catch (error) {
            console.error('Error quitting app:', error);
        }
    }

    async testPrint() {
        this.showLoading('Testing printer...');
        
        try {
            const result = await window.electronAPI.testPrint();
            
            if (result.success) {
                this.showToast(result.message, 'success');
            } else {
                this.showToast(result.error || 'Test print failed', 'error');
            }
        } catch (error) {
            console.error('Test print error:', error);
            this.showToast('Error testing printer', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async showDashboard() {
        // Hide main content and show dashboard
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        // Load dashboard data
        await this.loadDashboardData();
        
        this.showToast('Dashboard loaded', 'info');
    }

    showMainHub() {
        // Hide dashboard and show main content
        document.getElementById('dashboardSection').style.display = 'none';
        document.querySelector('.main-content').style.display = 'flex';
        
        // Refocus search input
        this.focusSearchInput();
        
        this.showToast('Back to Print Hub', 'info');
    }

    async loadDashboardData() {
        this.showLoading('Loading dashboard data...');
        
        try {
            const result = await window.electronAPI.getBoothManagerProfile();
            
            if (result.success) {
                this.currentBoothManager = result.boothManager;
                this.updateDashboardUI();
                this.updateBoothInfoDisplay(); // Update main page info too
            } else {
                this.showToast('Error loading dashboard data', 'error');
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Error loading dashboard data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateDashboardUI() {
        if (!this.currentBoothManager) return;
        
        const bm = this.currentBoothManager;
        
        // Update booth information
        document.getElementById('dashboardManagerName').textContent = bm.name || 'N/A';
        document.getElementById('dashboardBoothName').textContent = bm.boothName || 'N/A';
        document.getElementById('dashboardBoothLocation').textContent = bm.boothLocation || 'N/A';
        document.getElementById('dashboardBoothNumber').textContent = bm.boothNumber || 'N/A';
        
        // Update paper information
        document.getElementById('dashboardLoadedPaper').textContent = bm.loadedPaper || 0;
        document.getElementById('dashboardPaperCapacity').textContent = bm.paperCapacity || 0;
        
        // Update printer information
        document.getElementById('dashboardPrinterName').textContent = bm.printerName || 'N/A';
        document.getElementById('dashboardPrinterModel').textContent = bm.printerModel || 'N/A';
        
        // Update last updated time
        document.getElementById('dashboardLastUpdated').textContent = this.formatDate(bm.updatedAt) || 'Just now';
        
        // Update paper level
        this.updatePaperLevel();
    }

    updatePaperLevel() {
        if (!this.currentBoothManager) return;
        
        const loaded = this.currentBoothManager.loadedPaper || 0;
        const capacity = this.currentBoothManager.paperCapacity || 1;
        const percentage = Math.round((loaded / capacity) * 100);
        
        const fillElement = document.getElementById('dashboardPaperLevelFill');
        const percentageElement = document.getElementById('dashboardPaperPercentage');
        
        if (fillElement) {
            fillElement.style.width = `${percentage}%`;
            
            // Update color based on level
            fillElement.className = 'paper-level-fill';
            if (percentage < 20) {
                fillElement.classList.add('low');
            } else if (percentage < 50) {
                fillElement.classList.add('medium');
            }
        }
        
        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }
    }

    async refreshDashboard() {
        await this.loadDashboardData();
        this.showToast('Dashboard refreshed', 'success');
    }

    showPaperModal(operation) {
        const modal = document.getElementById('paperUpdateModal');
        const title = document.getElementById('paperModalTitle');
        const operationSelect = document.getElementById('paperOperation');
        const amountInput = document.getElementById('paperAmount');
        
        // Set operation
        operationSelect.value = operation;
        
        // Update title
        const titles = {
            add: 'Add Paper',
            remove: 'Remove Paper',
            set: 'Set Paper Count'
        };
        title.textContent = titles[operation] || 'Update Paper Count';
        
        // Clear amount input
        amountInput.value = '';
        
        // Update operation info
        this.updatePaperOperationInfo();
        
        // Show modal
        modal.style.display = 'flex';
        
        // Focus amount input
        setTimeout(() => amountInput.focus(), 100);
    }

    updatePaperOperationInfo() {
        const operation = document.getElementById('paperOperation').value;
        const infoElement = document.getElementById('paperOperationInfo');
        
        const infoTexts = {
            add: 'Add the specified amount to current paper count',
            remove: 'Remove the specified amount from current paper count',
            set: 'Set the paper count to the exact specified amount'
        };
        
        const infoText = infoTexts[operation] || 'Update paper count';
        infoElement.querySelector('span:last-child').textContent = infoText;
    }

    closePaperModal() {
        const modal = document.getElementById('paperUpdateModal');
        modal.style.display = 'none';
    }

    async updatePaperCount() {
        const operation = document.getElementById('paperOperation').value;
        const amount = parseInt(document.getElementById('paperAmount').value);
        
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'warning');
            return;
        }
        
        this.showLoading('Updating paper count...');
        
        try {
            const result = await window.electronAPI.updatePaperCount({
                operation: operation,
                count: amount
            });
            
            if (result.success) {
                this.currentBoothManager = result.boothManager;
                this.updateDashboardUI();
                this.updateBoothInfoDisplay();
                this.closePaperModal();
                this.showToast(result.message || 'Paper count updated successfully', 'success');
            } else {
                this.showToast(result.error || 'Failed to update paper count', 'error');
            }
        } catch (error) {
            console.error('Error updating paper count:', error);
            this.showToast('Error updating paper count', 'error');
        } finally {
            this.hideLoading();
        }
    }

    startBackgroundScanning() {
        this.isWaitingForRfidScan = true;
        console.log('Starting background scanning for RFID:', this.lastSearchValue);
        
        // Monitor search input for new RFID scans
        const searchInput = document.getElementById('searchInput');
        
        // Remove the normal input handler completely during background scanning
        if (this.boundHandleSearchInput) {
            searchInput.removeEventListener('input', this.boundHandleSearchInput);
        }
        
        // Create background scan handler that monitors input changes
        const backgroundScanHandler = (e) => {
            if (!this.isWaitingForRfidScan) return;
            
            const value = e.target.value.trim();
            console.log('Background scan detected input:', value, 'Expected:', this.lastSearchValue);
            
            // Check if this is the same RFID as the last search and it's a valid input
            if (value === this.lastSearchValue && this.isValidSearchInput(value)) {
                console.log('Same RFID detected, triggering print:', value);
                e.preventDefault();
                e.stopPropagation();
                e.target.value = ''; // Clear input immediately
                this.handleRfidRescan(value);
                return;
            }
            
            // If it's a different valid input, perform new search
            if (this.isValidSearchInput(value) && value !== this.lastSearchValue) {
                console.log('Different RFID detected, performing new search:', value);
                // Stop current background scanning
                this.stopBackgroundScanning();
                // Update last search value
                this.lastSearchValue = value;
                // Perform new search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.searchPrintJobs();
                }, 500);
            }
        };
        
        // Add the background scan handler
        searchInput.addEventListener('input', backgroundScanHandler);
        
        // Store reference to restore later
        this.backgroundScanHandler = backgroundScanHandler;
    }

    stopBackgroundScanning() {
        this.isWaitingForRfidScan = false;
        console.log('Stopping background scanning');
        
        // Remove background scan handler
        const searchInput = document.getElementById('searchInput');
        if (this.backgroundScanHandler) {
            searchInput.removeEventListener('input', this.backgroundScanHandler);
            this.backgroundScanHandler = null;
        }
        
        // Restore normal search input handler
        if (this.boundHandleSearchInput) {
            searchInput.addEventListener('input', this.boundHandleSearchInput);
        }
    }

    async handleRfidRescan(rfidValue) {
        console.log('handleRfidRescan called with:', rfidValue);
        console.log('Current jobs:', this.currentJobs);
        console.log('isWaitingForRfidScan:', this.isWaitingForRfidScan);
        
        // Get the first printable job (with enough points)
        if (this.currentJobs.length === 0) {
            this.showToast('No jobs available to print', 'warning');
            return;
        }
        
        // Find the first job that the student has enough points for
        let jobToPrint = null;
        let skippedJobs = [];
        
        for (let job of this.currentJobs) {
            const pointsRequired = job.pointsUsed || 0;
            if (pointsRequired <= this.currentUserPoints) {
                jobToPrint = job;
                break;
            } else {
                skippedJobs.push({
                    name: job.fileName || 'Untitled Document',
                    points: pointsRequired
                });
            }
        }
        
        if (!jobToPrint) {
            this.showToast('No jobs can be printed - insufficient points for all jobs', 'error');
            return;
        }
        
        // Show message about skipped jobs if any
        if (skippedJobs.length > 0) {
            const skippedNames = skippedJobs.map(job => `${job.name} (${job.points} pts)`).join(', ');
            this.showToast(`Skipped ${skippedJobs.length} job(s) due to insufficient points: ${skippedNames}`, 'info');
        }
        
        console.log('Job to print:', jobToPrint);
        console.log('Skipped jobs:', skippedJobs);
        
        // Stop background scanning first
        this.stopBackgroundScanning();
        
        // Close the search popup
        this.closeSearchPopup();
        
        // Show printing popup
        this.showPrintingPopup(jobToPrint);
        
        // Start printing process
        await this.printJobWithProgress(jobToPrint);
    }

    showPrintingPopup(job) {
        // Create printing popup if it doesn't exist
        let printingPopup = document.getElementById('printingPopup');
        if (!printingPopup) {
            printingPopup = this.createPrintingPopup();
            document.body.appendChild(printingPopup);
        }
        
        // Update popup content
        document.getElementById('printingFileName').textContent = job.fileName || 'Untitled Document';
        document.getElementById('printingStatus').textContent = 'Preparing to print...';
        document.getElementById('printingProgress').style.width = '0%';
        document.getElementById('printingProgressText').textContent = '0%';
        
        // Show popup
        printingPopup.style.display = 'flex';
    }

    createPrintingPopup() {
        const popup = document.createElement('div');
        popup.id = 'printingPopup';
        popup.className = 'printing-popup';
        popup.innerHTML = `
            <div class="printing-overlay"></div>
            <div class="printing-content">
                <div class="printing-header">
                    <div class="printing-icon">
                        <span class="material-icons">print</span>
                    </div>
                    <h3>Printing Document</h3>
                </div>
                
                <div class="printing-body">
                    <div class="printing-file-info">
                        <div class="file-icon">
                            <span class="material-icons">description</span>
                        </div>
                        <div class="file-details">
                            <h4 id="printingFileName">Document Name</h4>
                            <p id="printingStatus">Preparing to print...</p>
                        </div>
                    </div>
                    
                    <div class="printing-progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="printingProgress"></div>
                        </div>
                        <div class="progress-text" id="printingProgressText">0%</div>
                    </div>
                    
                    <div class="printing-steps">
                        <div class="step" id="step1">
                            <span class="material-icons">check_circle</span>
                            <span>Document received</span>
                        </div>
                        <div class="step" id="step2">
                            <span class="material-icons">hourglass_empty</span>
                            <span>Processing document</span>
                        </div>
                        <div class="step" id="step3">
                            <span class="material-icons">hourglass_empty</span>
                            <span>Sending to printer</span>
                        </div>
                        <div class="step" id="step4">
                            <span class="material-icons">hourglass_empty</span>
                            <span>Printing in progress</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return popup;
    }

    async printJobWithProgress(job) {
        const pointsRequired = job.pointsUsed || 0;
        if (pointsRequired > this.currentUserPoints) {
            this.showToast('Insufficient points to print this job', 'error');
            this.closePrintingPopup();
            return;
        }

        try {
            // Step 1: Document received (already done)
            this.updatePrintingStep(1, 'completed');
            this.updatePrintingProgress(25, 'Processing document...');
            await this.delay(1000);

            // Step 2: Processing document
            this.updatePrintingStep(2, 'active');
            this.updatePrintingProgress(50, 'Sending to printer...');
            await this.delay(1500);

            // Step 3: Sending to printer
            this.updatePrintingStep(2, 'completed');
            this.updatePrintingStep(3, 'active');
            this.updatePrintingProgress(75, 'Printing in progress...');
            await this.delay(1000);

            // Step 4: Actually print the job
            this.updatePrintingStep(3, 'completed');
            this.updatePrintingStep(4, 'active');
            
            const result = await window.electronAPI.printJobNow(job._id, job);
            
            if (result.success) {
                this.updatePrintingStep(4, 'completed');
                this.updatePrintingProgress(100, 'Print completed successfully!');
                
                // Update user points
                this.currentUserPoints -= pointsRequired;
                
                this.showToast('Document printed successfully!', 'success');
                
                // Close popup after 2 seconds
                setTimeout(() => {
                    this.closePrintingPopup();
                }, 2000);
            } else {
                this.updatePrintingStep(4, 'error');
                this.updatePrintingProgress(75, 'Print failed');
                this.showToast(result.error || 'Failed to print document', 'error');
                
                setTimeout(() => {
                    this.closePrintingPopup();
                }, 3000);
            }
        } catch (error) {
            console.error('Print error:', error);
            this.updatePrintingStep(4, 'error');
            this.updatePrintingProgress(75, 'Print error occurred');
            this.showToast('Error printing document', 'error');
            
            setTimeout(() => {
                this.closePrintingPopup();
            }, 3000);
        }
    }

    updatePrintingStep(stepNumber, status) {
        const step = document.getElementById(`step${stepNumber}`);
        if (!step) return;
        
        const icon = step.querySelector('.material-icons');
        
        // Remove existing status classes
        step.classList.remove('active', 'completed', 'error');
        
        // Add new status
        step.classList.add(status);
        
        // Update icon based on status
        switch (status) {
            case 'active':
                icon.textContent = 'hourglass_empty';
                icon.classList.add('spinning');
                break;
            case 'completed':
                icon.textContent = 'check_circle';
                icon.classList.remove('spinning');
                break;
            case 'error':
                icon.textContent = 'error';
                icon.classList.remove('spinning');
                break;
        }
    }

    updatePrintingProgress(percentage, statusText) {
        document.getElementById('printingProgress').style.width = `${percentage}%`;
        document.getElementById('printingProgressText').textContent = `${percentage}%`;
        document.getElementById('printingStatus').textContent = statusText;
    }

    closePrintingPopup() {
        const popup = document.getElementById('printingPopup');
        if (popup) {
            popup.style.display = 'none';
        }
        
        // Refocus search input
        this.focusSearchInput();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test method for debugging - can be called from browser console
    testRfidRescan() {
        console.log('Testing RFID rescan with last search value:', this.lastSearchValue);
        if (this.lastSearchValue) {
            this.handleRfidRescan(this.lastSearchValue);
        } else {
            console.log('No last search value available');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PrintHubApp();
}); 