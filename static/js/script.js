document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeFileUpload();
    initializeAnimations();
    initializeNavigation();
    initializeResultPage();
});

// File Upload Handling
function initializeFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const fileName = document.getElementById('file-name');
    const submitBtn = document.getElementById('submit-btn');
    const uploadForm = document.getElementById('upload-form');
    const loader = document.getElementById('loader');
    const removePreviewBtn = document.getElementById('remove-preview');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', handleFileSelect);

    // Remove preview
    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetFileUpload();
        });
    }

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            if (fileInput.files.length === 0) {
                e.preventDefault();
                showNotification('Please select an image first', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            if (!validateFile(file)) {
                e.preventDefault();
                return;
            }
            
            // Show loader
            if (loader) {
                loader.style.display = 'block';
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                uploadArea.style.opacity = '0.5';
                if (previewContainer) previewContainer.style.opacity = '0.5';
            }
        });
    }

    function handleFileSelect() {
        const file = fileInput.files[0];
        
        if (file) {
            if (!validateFile(file)) return;

            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
                previewContainer.style.display = 'block';
                submitBtn.disabled = false;
                
                // Animate preview appearance
                previewContainer.style.animation = 'scaleIn 0.5s ease';
                
                // Scroll to preview
                setTimeout(() => {
                    previewContainer.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            };
            reader.readAsDataURL(file);
        }
    }

    function validateFile(file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/avif'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPG, PNG, JPEG, AVIF)', 'error');
            resetFileUpload();
            return false;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File size must be less than 10MB', 'error');
            resetFileUpload();
            return false;
        }

        return true;
    }

    function resetFileUpload() {
        fileInput.value = '';
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        if (uploadArea) {
            uploadArea.style.opacity = '1';
        }
    }
}

// Animations
function initializeAnimations() {
    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in, .scale-in, .slide-in');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    };

    // Initial animation check
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Animate confidence bars on result page
    const confidenceFills = document.querySelectorAll('.confidence-fill');
    if (confidenceFills.length > 0) {
        animateConfidenceBars();
    }
}

function animateConfidenceBars() {
    const confidenceFills = document.querySelectorAll('.confidence-fill');
    
    confidenceFills.forEach((confidenceFill, index) => {
        const confidence = parseFloat(confidenceFill.dataset.confidence);
        
        setTimeout(() => {
            // Animate width
            confidenceFill.style.width = confidence + '%';
            
            // Animate percentage text
            let currentValue = 0;
            const interval = setInterval(() => {
                if (currentValue >= confidence) {
                    clearInterval(interval);
                    confidenceFill.textContent = confidence.toFixed(1) + '%';
                } else {
                    currentValue += Math.ceil(confidence / 40);
                    if (currentValue > confidence) currentValue = confidence;
                    confidenceFill.textContent = currentValue.toFixed(1) + '%';
                }
            }, 30);
        }, 500 + (index * 300));
    });
}

// Navigation
function initializeNavigation() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Highlight active section in navigation
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Result Page Initialization
function initializeResultPage() {
    // Add copy report ID functionality
    const reportIdElement = document.querySelector('.report-id');
    if (reportIdElement) {
        reportIdElement.style.cursor = 'pointer';
        reportIdElement.title = 'Click to copy Report ID';
        
        reportIdElement.addEventListener('click', () => {
            const reportId = reportIdElement.textContent.replace('Report ID: ', '').trim();
            navigator.clipboard.writeText(reportId).then(() => {
                showNotification('Report ID copied to clipboard', 'success');
            });
        });
    }

    // Initialize tooltips
    initializeTooltips();
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        element.addEventListener('mouseenter', (e) => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - 40 + 'px';
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translate(-50%, 0)';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translate(-50%, 10px)';
        });
    });
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add styles for notification
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                min-width: 300px;
                max-width: 400px;
                border-left: 4px solid;
            }
            
            .notification.info {
                border-left-color: var(--info-color);
            }
            
            .notification.success {
                border-left-color: var(--success-color);
            }
            
            .notification.error {
                border-left-color: var(--danger-color);
            }
            
            .notification.warning {
                border-left-color: var(--warning-color);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
            }
            
            .notification-content i {
                font-size: 1.25rem;
            }
            
            .notification.info .notification-content i {
                color: var(--info-color);
            }
            
            .notification.success .notification-content i {
                color: var(--success-color);
            }
            
            .notification.error .notification-content i {
                color: var(--danger-color);
            }
            
            .notification.warning .notification-content i {
                color: var(--warning-color);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--gray-text);
                cursor: pointer;
                font-size: 1rem;
                padding: 0.25rem;
                border-radius: 4px;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background: rgba(0, 0, 0, 0.05);
                color: var(--danger-color);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .tooltip {
                position: fixed;
                background: var(--dark-text);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.85rem;
                pointer-events: none;
                z-index: 10001;
                opacity: 0;
                transform: translate(-50%, 10px);
                transition: opacity 0.3s, transform 0.3s;
                white-space: nowrap;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-width: 6px;
                border-style: solid;
                border-color: var(--dark-text) transparent transparent transparent;
            }
        `;
        document.head.appendChild(style);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// Image Error Handling
function handleImageError(img) {
    const container = img.parentElement;
    container.innerHTML = `
        <div class="image-error">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>Image Loading Error</h4>
            <p>The image could not be loaded. Please try again.</p>
        </div>
    `;
    
    // Add styles for image error
    if (!document.querySelector('#image-error-styles')) {
        const style = document.createElement('style');
        style.id = 'image-error-styles';
        style.textContent = `
            .image-error {
                padding: 3rem;
                text-align: center;
                background: var(--light-bg);
                border-radius: var(--small-radius);
                color: var(--gray-text);
            }
            
            .image-error i {
                font-size: 3rem;
                color: var(--warning-color);
                margin-bottom: 1rem;
            }
            
            .image-error h4 {
                color: var(--dark-text);
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Export functions for global use
window.handleImageError = handleImageError;
window.showNotification = showNotification;