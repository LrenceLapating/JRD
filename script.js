// Supabase configuration
const SUPABASE_URL = 'https://vhqwguqptzaogekpwbok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocXdndXFwdHphb2dla3B3Ym9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzg1NTAsImV4cCI6MjA3ODg1NDU1MH0.aRc7lzAGIiz0nVSBPhS84GAVLXmp50ZWA0W9tgIQj5M';

let supabase;
let adminClickCount = 0;

// Initialize Supabase
function initializeSupabase() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized successfully');
            console.log('📍 URL:', SUPABASE_URL.substring(0, 30) + '...');
            console.log('🔑 Key length:', SUPABASE_ANON_KEY.length);
            loadAllData();
        } catch (error) {
            console.error('❌ Supabase client creation failed:', error);
            showDemoData();
        }
    } else {
        console.warn('❌ Supabase not configured. Please add your Supabase URL and ANON_KEY.');
        console.log('Current values:');
        console.log('URL:', SUPABASE_URL);
        console.log('Key:', SUPABASE_ANON_KEY ? 'Set (' + SUPABASE_ANON_KEY.length + ' chars)' : 'Not set');
        showDemoData();
    }
}

// Load all data from Supabase
async function loadAllData() {
    try {
        console.log('🔄 Loading data from Supabase...');
        await Promise.all([
            loadSliderImages(),
            loadAboutUs(),
            loadLocation(),
            loadSalesRecords(),
            loadBusinessDetails(),
            loadVideos()
        ]);
        console.log('✅ All data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        console.log('💡 Showing demo data instead');
        showDemoData();
    }
}

// Load products
async function loadSliderImages() {
    try {
        console.log('🖼️ Loading slider images...');
        const { data, error } = await supabase
            .from('slider_images')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('❌ Slider images query error:', error);
            console.error('Error details:', error.message, error.code, error.details);
            throw error;
        }
        
        console.log('✅ Slider images loaded:', data ? data.length : 0, 'items');
        displaySliderImages(data);
    } catch (error) {
        console.error('❌ Error loading slider images:', error);
        showDemoSliderImages();
    }
}

// Display products
function displaySliderImages(sliderImages) {
    const sliderImagesContainer = document.getElementById('slider-images');
    const sliderIndicators = document.getElementById('slider-indicators');
    
    if (!sliderImages || sliderImages.length === 0) {
        sliderImagesContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🖼️</div><p>No slider images available</p></div>';
        return;
    }

    // Create slider items
    sliderImagesContainer.innerHTML = sliderImages.map((image, index) => `
        <div class="slider-item" data-index="${index}">
            <img src="${image.image_url}" alt="${image.title}" class="slider-image" onerror="this.src='https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20fire%20extinguisher%20on%20clean%20white%20background%2C%20high%20quality%20product%20photography%2C%20commercial%20lighting%2C%20professional%20marketing%20image&image_size=landscape_16_9'">
            <div class="slider-content">
                <h3 class="slider-title">${image.title}</h3>
                <p class="slider-description">${image.description || 'Professional fire extinguisher product'}</p>
                <a href="${image.contact_link}" target="_blank" class="contact-us-btn" data-link-type="${image.contact_link_type}">
                    Contact Us!
                </a>
            </div>
        </div>
    `).join('');

    // Create indicators
    sliderIndicators.innerHTML = sliderImages.map((_, index) => `
        <button class="slider-indicator ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Go to slide ${index + 1}"></button>
    `).join('');

    // Initialize slider functionality
    initializeSlider(sliderImages.length);
}

// Initialize slider functionality
function initializeSlider(totalSlides) {
    let currentSlide = 0;
    const sliderImages = document.getElementById('slider-images');
    const indicators = document.querySelectorAll('.slider-indicator');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    function updateSlide() {
        const translateX = -currentSlide * 100;
        sliderImages.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlide();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateSlide();
        });
    });

    // Auto-play functionality (optional)
    let autoPlayInterval;
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Start auto-play
    startAutoPlay();

    // Pause auto-play on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });

    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left - next slide
            } else {
                prevSlide(); // Swipe right - previous slide
            }
        }
    }
}

// Load about us content
async function loadAboutUs() {
    try {
        const { data, error } = await supabase
            .from('about_us')
            .select('*')
            .single();

        if (error) throw error;
        
        displayAboutUs(data);
    } catch (error) {
        console.error('Error loading about us:', error);
        showDemoAboutUs();
    }
}

// Display about us content
function displayAboutUs(aboutData) {
    const aboutDescription = document.getElementById('about-description');
    const aboutImage = document.getElementById('about-image');
    
    if (aboutData) {
        aboutDescription.innerHTML = `
            <p>${aboutData.description || 'JRD Fire Fighting Equipment Trading is your trusted partner in fire safety solutions. We provide professional-grade fire extinguishers and safety equipment to protect lives and property.'}</p>
            <p>${aboutData.mission || 'Our mission is to ensure every home and business is equipped with reliable fire safety equipment and knowledge to prevent and respond to fire emergencies.'}</p>
            <p>${aboutData.services || 'We offer fire extinguisher sales, installation, maintenance, and training services for residential, commercial, and industrial clients.'}</p>
        `;
        
        if (aboutData.image_url) {
            aboutImage.src = aboutData.image_url;
            aboutImage.style.display = 'block';
        } else {
            aboutImage.style.display = 'none';
        }
    } else {
        showDemoAboutUs();
    }
}

// Load location data
async function loadLocation() {
    try {
        const { data, error } = await supabase
            .from('location')
            .select('*')
            .single();

        if (error) throw error;
        
        displayLocation(data);
    } catch (error) {
        console.error('Error loading location:', error);
        showDemoLocation();
    }
}

// Display location
function displayLocation(locationData) {
    const locationAddress = document.getElementById('location-address');
    const locationMap = document.getElementById('location-map');
    
    if (locationData) {
        const address = locationData.address || 'Blk 2 Lot 21 Ricsyl Village New Visayas, Panabo City';
        locationAddress.textContent = address;
        
        // Use the provided Google Maps embed code
        locationMap.src = 'https://www.google.com/maps/embed?pb=!4v1763299821709!6m8!1m7!1sy4Ffmjzb2wa5kLy6hRXnVA!2m2!1d7.308551898163223!2d125.6669783678776!3f195.66145544990135!4f-15.06104881464104!5f0.7820865974627469';
    } else {
        showDemoLocation();
    }
}

// Load sales records
async function loadSalesRecords() {
    try {
        const { data, error } = await supabase
            .from('sales_records')
            .select('*')
            .order('sale_date', { ascending: false })
            .limit(10);

        if (error) throw error;
        
        displaySalesRecords(data);
    } catch (error) {
        console.error('Error loading sales records:', error);
        showDemoSalesRecords();
    }
}

// Display sales records
function displaySalesRecords(sales) {
    const salesRecords = document.getElementById('sales-records');
    
    if (!sales || sales.length === 0) {
        salesRecords.innerHTML = '<p class="loading">No sales records available</p>';
        return;
    }

    salesRecords.innerHTML = sales.map(sale => `
        <div class="sale-record">
            <div class="sale-customer">${sale.customer_name}</div>
            <div class="sale-product">${sale.product_name}</div>
            <div class="sale-date">${new Date(sale.sale_date).toLocaleDateString()}</div>
            ${sale.receipt_url ? 
                `<div class="sale-receipt">
                    <img src="${sale.receipt_url}" alt="Receipt" onclick="window.open('${sale.receipt_url}', '_blank')">
                </div>` : ''
            }
        </div>
    `).join('');
}

// Load business details
async function loadBusinessDetails() {
    try {
        const { data, error } = await supabase
            .from('business_details')
            .select('*')
            .single();

        if (error) throw error;
        
        displayBusinessDetails(data);
    } catch (error) {
        console.error('Error loading business details:', error);
        showDemoBusinessDetails();
    }
}

// Display business details
function displayBusinessDetails(businessData) {
    const businessName = document.getElementById('business-name');
    const businessTagline = document.getElementById('business-tagline');
    const businessDescription = document.getElementById('business-description');
    const servicesList = document.getElementById('services-list');
    const businessImage = document.getElementById('business-image');
    
    // Update contact section
    const contactBusinessName = document.getElementById('contact-business-name');
    const contactTagline = document.getElementById('contact-tagline');
    const contactPhones = document.getElementById('contact-phones');
    const contactAddress = document.getElementById('contact-address');
    
    if (businessData) {
        // Business details section
        businessName.textContent = businessData.business_name || 'JRD Fire Fighting Equipment Trading';
        businessTagline.textContent = businessData.tagline || 'A Product of RD RAC\'S MARKETING';
        
        // Enhanced business description with multiple paragraphs for better readability
        const defaultDescription = `
            <p>Your trusted partner in fire safety solutions. We provide professional-grade fire extinguishers and safety equipment to protect lives and property.</p>
            <p>With years of experience in the industry, we are committed to delivering top-quality products and exceptional service to ensure your safety and peace of mind.</p>
        `;
        
        businessDescription.innerHTML = businessData.description ? 
            `<p>${businessData.description}</p>` : defaultDescription;
        
        // Services list with enhanced layout
        if (businessData.services && businessData.services.length > 0) {
            servicesList.innerHTML = businessData.services.map(service => `
                <div class="service-item">
                    <div class="service-content">
                        <div class="service-icon">🔥</div>
                        <div class="service-text">${service}</div>
                    </div>
                </div>
            `).join('');
        } else {
            servicesList.innerHTML = `
                <div class="service-item">
                    <div class="service-content">
                        <div class="service-icon">🧯</div>
                        <div class="service-text">Fire Extinguisher Sales</div>
                    </div>
                </div>
                <div class="service-item">
                    <div class="service-content">
                        <div class="service-icon">🔧</div>
                        <div class="service-text">Fire Extinguisher Installation</div>
                    </div>
                </div>
                <div class="service-item">
                    <div class="service-content">
                        <div class="service-icon">⚙️</div>
                        <div class="service-text">Fire Extinguisher Maintenance & Refilling</div>
                    </div>
                </div>
                <div class="service-item">
                    <div class="service-content">
                        <div class="service-icon">🎓</div>
                        <div class="service-text">Fire Safety Training</div>
                    </div>
                </div>
            `;
        }
        
        if (businessData.image_url) {
            businessImage.src = businessData.image_url;
            businessImage.style.display = 'block';
        } else {
            businessImage.style.display = 'none';
        }
        
        // Contact section
        contactBusinessName.textContent = businessData.business_name || 'JRD Fire Fighting Equipment Trading';
        contactTagline.textContent = businessData.tagline || 'A Product of RD RAC\'S MARKETING';
        
        // Phone numbers
        if (businessData.phone_numbers && businessData.phone_numbers.length > 0) {
            contactPhones.innerHTML = businessData.phone_numbers.map(phone => `
                <p>📞 ${phone}</p>
            `).join('');
        } else {
            contactPhones.innerHTML = `
                <p>📞 09460341076</p>
                <p>📞 09219771021</p>
            `;
        }
        
        // Address
        contactAddress.textContent = businessData.address || 'Blk 2 Lot 21 Ricsyl Village New Visayas, Panabo City';
        
        // Facebook link
        const facebookLink = document.getElementById('facebook-link');
        if (businessData.facebook_page) {
            // Clean up the Facebook URL - remove any spaces and ensure it's a valid URL
            let facebookUrl = businessData.facebook_page.trim();
            
            // If it's just a page name (not a full URL), convert it to a Facebook URL
            if (!facebookUrl.startsWith('http')) {
                facebookUrl = `https://www.facebook.com/${facebookUrl}`;
            }
            
            facebookLink.href = facebookUrl;
            facebookLink.style.display = 'inline-flex';
            facebookLink.title = `Visit our Facebook page: ${businessData.facebook_page}`;
            // Remove any existing click handlers to let browser handle navigation naturally
            facebookLink.onclick = null;
        } else {
            facebookLink.href = '#';
            facebookLink.style.display = 'none';
            facebookLink.onclick = function(e) {
                e.preventDefault();
                return false;
            };
        }
    } else {
        showDemoBusinessDetails();
    }
}

// Load videos
async function loadVideos() {
    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        displayVideos(data);
    } catch (error) {
        console.error('Error loading videos:', error);
        showDemoVideos();
    }
}

// Display videos (single video system) with inline player
function displayVideos(videos) {
    const videoContent = document.getElementById('video-content');
    
    if (!videos || videos.length === 0) {
        videoContent.innerHTML = '<p class="loading">No videos available</p>';
        return;
    }

    // Since we only have one video, display it prominently with inline player
    const video = videos[0]; // Take the first (and only) video
    const videoUrl = video.video_file_url || video.video_url;
    
    videoContent.innerHTML = `
        <div class="video-item featured-video">
            <div class="video-player-container">
                <video 
                    class="inline-video-player" 
                    poster="${video.thumbnail_url || ''}"
                    preload="metadata">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-overlay-controls">
                    <button class="play-pause-btn" onclick="toggleVideoPlay(this)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <div class="video-time-display">
                        <span class="current-time">0:00</span>
                        <span class="time-separator"> / </span>
                        <span class="duration-time">0:00</span>
                    </div>
                    <div class="video-progress-container">
                        <div class="video-progress-bar">
                            <div class="video-progress-fill"></div>
                        </div>
                    </div>
                    <button class="volume-btn" onclick="toggleVideoMute(this)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                        </svg>
                    </button>
                    <button class="fullscreen-btn" onclick="toggleVideoFullscreen(this)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                <div class="video-meta">
                    ${video.duration_seconds ? `<span class="video-duration">Duration: ${formatDuration(video.duration_seconds)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Initialize video player controls
    initializeVideoPlayer();
}

// Helper functions for video formatting
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDuration(seconds) {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Video player control functions
function initializeVideoPlayer() {
    const video = document.querySelector('.inline-video-player');
    if (!video) return;

    // Add event listeners for video controls
    video.addEventListener('loadedmetadata', function() {
        updateVideoProgress(video);
        // Initialize duration display
        const durationTimeEl = document.querySelector('.duration-time');
        if (durationTimeEl && video.duration) {
            durationTimeEl.textContent = formatTime(video.duration);
        }
    });

    video.addEventListener('timeupdate', function() {
        updateVideoProgress(video);
    });

    video.addEventListener('play', function() {
        updatePlayPauseButton(true);
    });

    video.addEventListener('pause', function() {
        updatePlayPauseButton(false);
    });

    // Add click to play/pause functionality
    video.addEventListener('click', function() {
        toggleVideoPlay();
    });
}

function toggleVideoPlay() {
    const video = document.querySelector('.inline-video-player');
    if (!video) return;

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function toggleVideoMute() {
    const video = document.querySelector('.inline-video-player');
    if (!video) return;

    video.muted = !video.muted;
    updateVolumeButton(video.muted);
}

function toggleVideoFullscreen() {
    const video = document.querySelector('.inline-video-player');
    if (!video) return;

    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
}

function updateVideoProgress(video) {
    const progressFill = document.querySelector('.video-progress-fill');
    const currentTimeEl = document.querySelector('.current-time');
    const durationTimeEl = document.querySelector('.duration-time');
    
    if (!progressFill || !video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;
    progressFill.style.width = progress + '%';
    
    // Update time display
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(video.currentTime);
    }
    if (durationTimeEl) {
        durationTimeEl.textContent = formatTime(video.duration);
    }
}

function updatePlayPauseButton(isPlaying) {
    const playPauseBtn = document.querySelector('.play-pause-btn');
    if (!playPauseBtn) return;

    playPauseBtn.innerHTML = isPlaying ? 
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' :
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function updateVolumeButton(isMuted) {
    const volumeBtn = document.querySelector('.volume-btn');
    if (!volumeBtn) return;

    volumeBtn.innerHTML = isMuted ?
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>' :
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>';
}

// Play video function (fallback for old functionality)
function playVideo(videoUrl) {
    window.open(videoUrl, '_blank');
}

// Demo data functions
function showDemoData() {
    showDemoProducts();
    showDemoAboutUs();
    showDemoLocation();
    showDemoSalesRecords();
    showDemoBusinessDetails();
    showDemoVideos();
}

function showDemoProducts() {
    const demoProducts = [
        {
            title: "ABC Dry Chemical Extinguisher",
            description: "Multi-purpose fire extinguisher suitable for Class A, B, and C fires. Perfect for offices and homes.",
            price: "89.99",
            image_url: null // No image for demo
        },
        {
            title: "CO2 Fire Extinguisher",
            description: "Clean agent extinguisher ideal for electrical fires and sensitive equipment areas.",
            price: "129.99",
            image_url: null // No image for demo
        },
        {
            title: "Water Mist Extinguisher",
            description: "Eco-friendly extinguisher using deionized water mist for Class A and C fires.",
            price: "159.99",
            image_url: null // No image for demo
        }
    ];
    displayProducts(demoProducts);
}

function showDemoAboutUs() {
    const demoAboutData = {
        description: "JRD Fire Fighting Equipment Trading is your trusted partner in fire safety solutions. We provide professional-grade fire extinguishers and safety equipment to protect lives and property.",
        mission: "Our mission is to ensure every home and business is equipped with reliable fire safety equipment and knowledge to prevent and respond to fire emergencies.",
        services: "We offer fire extinguisher sales, installation, maintenance, and training services for residential, commercial, and industrial clients.",
        image_url: null // No image for demo
    };
    displayAboutUs(demoAboutData);
}

function showDemoLocation() {
    const demoLocation = {
        address: "Blk 2 Lot 21 Ricsyl Village New Visayas, Panabo City",
        latitude: 7.308551898163223,
        longitude: 125.6669783678776
    };
    displayLocation(demoLocation);
}

function showDemoSalesRecords() {
    const demoSales = [
        {
            customer_name: "John Smith",
            product_name: "ABC Dry Chemical Extinguisher",
            sale_date: new Date().toISOString()
        },
        {
            customer_name: "Sarah Johnson",
            product_name: "CO2 Fire Extinguisher",
            sale_date: new Date(Date.now() - 86400000).toISOString()
        },
        {
            customer_name: "Mike Wilson",
            product_name: "Water Mist Extinguisher",
            sale_date: new Date(Date.now() - 172800000).toISOString()
        }
    ];
    displaySalesRecords(demoSales);
}

function showDemoBusinessDetails() {
    const demoBusinessData = {
        business_name: 'JRD Fire Fighting Equipment Trading',
        tagline: 'A Product of RD RAC\'S MARKETING',
        description: 'Your trusted partner in fire safety solutions. We provide professional-grade fire extinguishers and safety equipment to protect lives and property in Panabo City and surrounding areas.',
        services: [
            'Fire Extinguisher Sales',
            'Fire Extinguisher Installation',
            'Fire Extinguisher Maintenance & Refilling',
            'Fire Safety Training',
            'Fire Safety Consultation',
            'Emergency Fire Equipment'
        ],
        phone_numbers: ['09460341076', '09219771021'],
        address: 'Blk 2 Lot 21 Ricsyl Village New Visayas, Panabo City',
        facebook_page: 'https://www.facebook.com/profile.php?id=61578063793868',
        email: 'jrd.fire.fighting@email.com',
        image_url: null
    };
    displayBusinessDetails(demoBusinessData);
}

function showDemoVideos() {
    const demoVideos = [
        {
            title: 'How to Use a Fire Extinguisher',
            description: 'Learn the proper technique for using a fire extinguisher in emergency situations.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20fire%20extinguisher%20demonstration%20video%20thumbnail%2C%20safety%20training%2C%20clean%20modern%20design%2C%20orange%20and%20red%20colors%2C%20high%20quality&image_size=landscape_16_9',
            display_order: 1,
            is_active: true,
            duration_seconds: 60,
            file_size: 5242880
        }
    ];
    displayVideos(demoVideos);
}

// Smooth scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Admin trigger functionality
function setupAdminTrigger() {
    const adminTrigger = document.getElementById('admin-trigger');
    
    adminTrigger.addEventListener('click', function() {
        adminClickCount++;
        console.log(`Admin trigger clicked ${adminClickCount} times`);
        
        if (adminClickCount >= 10) {
            // Reset counter
            adminClickCount = 0;
            
            // Redirect directly to admin dashboard
            window.location.href = '/admin/dashboard.html';
        }
        
        // Visual feedback
        this.style.opacity = '0.5';
        setTimeout(() => {
            this.style.opacity = '0.1';
        }, 200);
    });
}

// Setup navigation functionality
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const navigationBar = document.querySelector('.navigation-bar');
    
    // Add click handlers to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Remove active class from all buttons
                navButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active button on scroll
    function updateActiveNav() {
        const sections = ['hero', 'products', 'business-details', 'about', 'videos', 'sales', 'location', 'contact'];
        let currentSection = 'hero';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = sectionId;
                }
            }
        });
        
        // Update active button
        navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-target') === currentSection) {
                button.classList.add('active');
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', updateActiveNav);
    
    // Initial active state
    updateActiveNav();
    
    // Add scroll effect to navigation bar
    window.addEventListener('scroll', function() {
        if (navigationBar) {
            if (window.scrollY > 50) {
                navigationBar.classList.add('scrolled');
            } else {
                navigationBar.classList.remove('scrolled');
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('JRD Fire Fighting Equipment Trading landing page loaded');
    
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Check network connection.');
        showDemoData();
        setupAdminTrigger();
        return;
    }
    
    console.log('✅ Supabase library loaded');
    
    // Initialize Supabase
    initializeSupabase();
    
    // Setup admin trigger
    setupAdminTrigger();
    
    // Setup navigation functionality
    setupNavigation();
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only process internal links that start with # and have a target
            if (href && href.startsWith('#') && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault(); // Only prevent default if we found a valid target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                // If no target found, let browser handle normally (may navigate to top)
            }
            // If href doesn't start with # or is just "#", let browser handle it normally
        });
    });
});

// Handle errors gracefully
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Show user-friendly message
    if (document.getElementById('products-grid')) {
        document.getElementById('products-grid').innerHTML = 
            '<p class="loading">Unable to load products. Please refresh the page.</p>';
    }
});