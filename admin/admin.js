// Supabase configuration - Using Service Role Key to bypass RLS
const SUPABASE_URL = 'https://vhqwguqptzaogekpwbok.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocXdndXFwdHphb2dla3B3Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI3ODU1MCwiZXhwIjoyMDc4ODU0NTUwfQ.ImL5fUq-wK-7V01OKkuhucmEwzrbcFtWm9i1jVdUvSY'; // Replace with your service_role key

let supabase;
let currentEditingProduct = null;
let currentEditingSale = null;
let currentEditingVideo = null;
let currentEditingSlider = null;

// Utility function for loading states
function setLoadingState(button, isLoading, originalText = 'Save') {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.style.color = 'transparent';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.style.color = '';
    }
}

// Enhanced notification system
function showToast(message, type = 'success', title = null, duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return null;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const toastTitle = title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info');
    
    toast.innerHTML = `
        <div class="toast-title">${toastTitle}</div>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after duration (unless duration is 0 for persistent)
    if (duration > 0) {
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    return toast;
}

// Override existing notification functions
function showSuccess(message) {
    console.log('✅ Success:', message);
    showToast(message, 'success');
}

function showError(message) {
    console.error('❌ Error:', message);
    showToast(message, 'error');
}

function showWarning(message) {
    console.warn('⚠️ Warning:', message);
    showToast(message, 'warning');
}

function showInfo(message) {
    console.info('ℹ️ Info:', message);
    showToast(message, 'info');
}

// Initialize Supabase - direct access without authentication
function initializeSupabase() {
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_SERVICE_KEY !== 'YOUR_SERVICE_ROLE_KEY_HERE') {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            console.log('✅ Admin Supabase initialized successfully');
            console.log('📍 URL:', SUPABASE_URL.substring(0, 30) + '...');
            console.log('🔑 Service Key length:', SUPABASE_SERVICE_KEY.length);
            
            // Load data directly without authentication check
            loadAllData();
            return true;
        } catch (error) {
            console.error('❌ Admin Supabase initialization failed:', error);
            showError('Failed to connect to database: ' + error.message);
            return false;
        }
    } else {
        console.error('❌ Admin Supabase Service Key not configured');
        console.log('Please:');
        console.log('1. Go to Supabase Dashboard → Settings → API');
        console.log('2. Copy your service_role key');
        console.log('3. Replace YOUR_SERVICE_ROLE_KEY_HERE in admin.js');
        showError('Service Role Key not configured. Check console for instructions.');
        return false;
    }
}

async function saveSliderImage() {
    const title = document.getElementById('slider-title').value.trim();
    const description = document.getElementById('slider-description').value.trim();
    const contactLink = document.getElementById('slider-contact-link').value.trim();
    const contactType = document.getElementById('slider-contact-type').value;
    const displayOrder = parseInt(document.getElementById('slider-order').value);
    const isActive = document.getElementById('slider-active').checked;
    const imageFile = document.getElementById('slider-image').files[0];
    const saveButton = document.querySelector('#slider-form .save-button');
    
    if (!title || !contactLink) {
        showError('Title and contact link are required');
        return;
    }
    
    // Show loading state
    setLoadingState(saveButton, true, 'Saving...');
    
    // Check if we already have 10 images and this is a new addition
    if (!currentEditingSlider) {
        const { data: existingImages } = await supabase
            .from('slider_images')
            .select('id', { count: 'exact' });
        
        if (existingImages && existingImages.length >= 10) {
            showError('Maximum 10 slider images allowed. Please delete an existing image first.');
            setLoadingState(saveButton, false);
            return;
        }
    }
    
    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            try {
                const fileName = `slider/${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw new Error('Image upload failed: ' + uploadError.message);
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    imageUrl = publicUrl;
                }
            } catch (uploadErr) {
                console.error('Image upload failed:', uploadErr);
                throw uploadErr;
            }
        }
        
        const sliderData = {
            title: title,
            description: description,
            image_url: imageUrl,
            contact_link: contactLink,
            contact_link_type: contactType,
            display_order: displayOrder,
            is_active: isActive,
            updated_at: new Date().toISOString()
        };
        
        if (currentEditingSlider) {
            // If no new image uploaded, don't update the image_url field
            if (!imageUrl) {
                delete sliderData.image_url;
            }
            
            // Update existing slider image
            const { error } = await supabase
                .from('slider_images')
                .update(sliderData)
                .eq('id', currentEditingSlider);
            
            if (error) throw error;
            showSuccess('Slider image updated successfully');
            setLoadingState(saveButton, false);
        } else {
            // Add new slider image
            const { error } = await supabase
                .from('slider_images')
                .insert(sliderData);
            
            if (error) throw error;
            showSuccess('Slider image added successfully');
            setLoadingState(saveButton, false);
        }
        
        // Close modal and refresh
        document.getElementById('slider-modal').classList.remove('active');
        await loadSliderImages();
        
    } catch (error) {
        console.error('Error saving slider image:', error);
        showError('Failed to save slider image: ' + error.message);
        setLoadingState(saveButton, false);
    }
}

// No authentication needed - direct access

// Load all dashboard data
async function loadAllData() {
    try {
        await Promise.all([
            loadSliderImages(),
            loadBusinessDetails(),
            loadAboutUs(),
            loadLocation(),
            loadVideos(),
            loadSalesRecords()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Navigation functionality
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-button[data-section]');
    const sectionPanels = document.querySelectorAll('.section-panel');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Remove active class from all buttons and panels
            navButtons.forEach(btn => btn.classList.remove('active'));
            sectionPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(`${targetSection}-section`).classList.add('active');
        });
    });
    
    // Logout functionality - redirect to main page
    document.getElementById('logout-button').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
}

// Slider Images management
async function loadSliderImages() {
    try {
        const { data, error } = await supabase
            .from('slider_images')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        
        displaySliderImages(data || []);
    } catch (error) {
        console.error('Error loading slider images:', error);
        showError('Failed to load slider images');
    }
}

function displaySliderImages(sliderImages) {
    const sliderImagesList = document.getElementById('slider-images-list');
    
    if (sliderImages.length === 0) {
        sliderImagesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🖼️</div>
                <h3>No slider images found</h3>
                <p>Click "Add Slider Image" to create your first slider image.</p>
            </div>
        `;
        return;
    }

    sliderImagesList.innerHTML = sliderImages.map(image => `
        <div class="data-item">
            <div class="item-content">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${image.image_url}" alt="${image.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <div class="item-title">${image.title}</div>
                        <div class="item-description">${image.description || 'No description'}</div>
                        <div class="item-description">Order: ${image.display_order} | Type: ${image.contact_link_type} | <a href="${image.contact_link}" target="_blank">Contact Link</a></div>
                    </div>
                </div>
            </div>
            <div class="item-actions">
                <button class="action-button edit-button" onclick="editSliderImage('${image.id}')">Edit</button>
                <button class="action-button delete-button" onclick="deleteSliderImage('${image.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function setupSliderModal() {
    const addButton = document.getElementById('add-slider-image-button');
    const modal = document.getElementById('slider-modal');
    const cancelButton = document.getElementById('cancel-slider');
    const form = document.getElementById('slider-form');
    const imageInput = document.getElementById('slider-image');
    const imagePreview = document.getElementById('slider-image-preview');
    const contactTypeSelect = document.getElementById('slider-contact-type');
    const contactLinkInput = document.getElementById('slider-contact-link');
    
    addButton.addEventListener('click', function() {
        currentEditingSlider = null;
        document.getElementById('slider-modal-title').textContent = 'Add Slider Image';
        form.reset();
        imagePreview.style.display = 'none';
        modal.classList.add('active');
    });
    
    cancelButton.addEventListener('click', function() {
        modal.classList.remove('active');
        currentEditingSlider = null;
    });
    
    // Update contact link based on contact type
    contactTypeSelect.addEventListener('change', function() {
        const contactType = this.value;
        const defaultLinks = {
            'facebook': 'https://www.facebook.com/',
            'messenger': 'https://m.me/',
            'website': 'https://',
            'phone': 'tel:09460341076',
            'email': 'mailto:info@example.com'
        };
        contactLinkInput.value = defaultLinks[contactType] || 'https://';
    });
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveSliderImage();
    });
}

async function saveProduct() {
    const title = document.getElementById('product-title').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = document.getElementById('product-price').value;
    const imageFile = document.getElementById('product-image').files[0];
    const saveButton = document.querySelector('#product-form .save-button');
    
    if (!title || !description) {
        showError('Title and description are required');
        return;
    }
    
    // Show loading state
    setLoadingState(saveButton, true, 'Saving...');
    
    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            try {
                const fileName = `products/${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Don't throw error, just continue without image
                    console.log('Continuing without image upload...');
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    imageUrl = publicUrl;
                    console.log('Image uploaded successfully:', publicUrl);
                }
            } catch (uploadErr) {
                console.error('Image upload failed:', uploadErr);
                // Continue without image - don't block the save
                console.log('Saving product without image...');
            }
        }
        
        const productData = {
            title,
            description,
            price: price ? parseFloat(price) : null,
            image_url: imageUrl
        };
        
        if (currentEditingProduct) {
            // Update existing product
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', currentEditingProduct);
            
            if (error) throw error;
            showSuccess('Product updated successfully');
            setLoadingState(saveButton, false);
        } else {
            // Create new product
            const { error } = await supabase
                .from('products')
                .insert(productData);
            
            if (error) throw error;
            showSuccess('Product created successfully');
            setLoadingState(saveButton, false);
        }
        
        // Close modal and reload products
        document.getElementById('product-modal').classList.remove('active');
        await loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Failed to save product');
        setLoadingState(saveButton, false);
    }
}

async function saveSliderImage() {
    const title = document.getElementById('slider-title').value.trim();
    const description = document.getElementById('slider-description').value.trim();
    const contactLink = document.getElementById('slider-contact-link').value.trim();
    const contactType = document.getElementById('slider-contact-type').value;
    const displayOrder = parseInt(document.getElementById('slider-order').value);
    const isActive = document.getElementById('slider-active').checked;
    const imageFile = document.getElementById('slider-image').files[0];
    
    if (!title || !contactLink) {
        showError('Title and contact link are required');
        return;
    }
    
    // Check if we already have 10 images and this is a new addition
    if (!currentEditingSlider) {
        const { data: existingImages } = await supabase
            .from('slider_images')
            .select('id', { count: 'exact' });
        
        if (existingImages && existingImages.length >= 10) {
            showError('Maximum 10 slider images allowed. Please delete an existing image first.');
            return;
        }
    }
    
    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            try {
                const fileName = `slider/${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw new Error('Image upload failed: ' + uploadError.message);
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    imageUrl = publicUrl;
                }
            } catch (uploadErr) {
                console.error('Image upload failed:', uploadErr);
                throw uploadErr;
            }
        }
        
        const sliderData = {
            title: title,
            description: description,
            image_url: imageUrl,
            contact_link: contactLink,
            contact_link_type: contactType,
            display_order: displayOrder,
            is_active: isActive,
            updated_at: new Date().toISOString()
        };
        
        if (currentEditingSlider) {
            // If no new image uploaded, don't update the image_url field
            if (!imageUrl) {
                delete sliderData.image_url;
            }
            
            // Update existing slider image
            const { error } = await supabase
                .from('slider_images')
                .update(sliderData)
                .eq('id', currentEditingSlider);
            
            if (error) throw error;
            showSuccess('Slider image updated successfully');
        } else {
            // Add new slider image
            const { error } = await supabase
                .from('slider_images')
                .insert(sliderData);
            
            if (error) throw error;
            showSuccess('Slider image added successfully');
        }
        
        // Close modal and refresh
        document.getElementById('slider-modal').classList.remove('active');
        await loadSliderImages();
        
    } catch (error) {
        console.error('Error saving slider image:', error);
        showError('Failed to save slider image: ' + error.message);
    }
}

async function editProduct(productId) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        currentEditingProduct = productId;
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        
        // Populate form
        document.getElementById('product-title').value = data.title;
        document.getElementById('product-description').value = data.description;
        document.getElementById('product-price').value = data.price || '';
        
        // Show existing image if available
        const imagePreview = document.getElementById('product-image-preview');
        if (data.image_url) {
            imagePreview.src = data.image_url;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('product-modal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product for editing');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        showSuccess('Product deleted successfully');
        await loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

async function editSliderImage(sliderId) {
    const saveButton = document.querySelector('#slider-form .save-button');
    
    try {
        // Show loading state while fetching data
        if (saveButton) {
            setLoadingState(saveButton, true, 'Loading...');
        }
        
        const { data, error } = await supabase
            .from('slider_images')
            .select('*')
            .eq('id', sliderId)
            .single();
        
        if (error) throw error;
        
        currentEditingSlider = sliderId;
        document.getElementById('slider-modal-title').textContent = 'Edit Slider Image';
        
        // Populate form
        document.getElementById('slider-title').value = data.title;
        document.getElementById('slider-description').value = data.description || '';
        document.getElementById('slider-contact-link').value = data.contact_link;
        document.getElementById('slider-contact-type').value = data.contact_link_type;
        document.getElementById('slider-order').value = data.display_order;
        document.getElementById('slider-active').checked = data.is_active;
        
        // Show existing image if available
        const imagePreview = document.getElementById('slider-image-preview');
        if (data.image_url) {
            imagePreview.src = data.image_url;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
        
        // Remove required attribute for image when editing
        document.getElementById('slider-image').removeAttribute('required');
        
        document.getElementById('slider-modal').classList.add('active');
        
        // Remove loading state after data is loaded and form is populated
        if (saveButton) {
            setLoadingState(saveButton, false);
        }
        
    } catch (error) {
        console.error('Error loading slider image:', error);
        showError('Failed to load slider image');
        if (saveButton) {
            setLoadingState(saveButton, false);
        }
    }
}

async function deleteSliderImage(sliderId) {
    if (!confirm('Are you sure you want to delete this slider image?')) {
        return;
    }
    
    // Show loading toast
    const loadingToast = showToast('Deleting slider image...', 'info', 'Please Wait', 0);
    
    try {
        const { error } = await supabase
            .from('slider_images')
            .delete()
            .eq('id', sliderId);
        
        if (error) throw error;
        
        // Remove loading toast and show success
        if (loadingToast && loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        showSuccess('Slider image deleted successfully');
        await loadSliderImages();
        
    } catch (error) {
        console.error('Error deleting slider image:', error);
        // Remove loading toast and show error
        if (loadingToast && loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        showError('Failed to delete slider image');
    }
}

// About Us management
async function loadAboutUs() {
    try {
        const { data, error } = await supabase
            .from('about_us')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        
        displayAboutUs(data);
    } catch (error) {
        console.error('Error loading about us:', error);
        showError('Failed to load about us content');
    }
}

function displayAboutUs(aboutData) {
    const aboutContent = document.getElementById('about-content');
    
    aboutContent.innerHTML = `
        <form id="about-form">
            <div class="form-group">
                <label for="about-description" class="form-label">Description</label>
                <textarea id="about-description" class="form-textarea" required>${aboutData?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="about-mission" class="form-label">Mission Statement</label>
                <textarea id="about-mission" class="form-textarea" required>${aboutData?.mission || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="about-services" class="form-label">Services</label>
                <textarea id="about-services" class="form-textarea" required>${aboutData?.services || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="about-image" class="form-label">About Image</label>
                <input type="file" id="about-image" class="form-input" accept="image/*">
                ${aboutData?.image_url ? `<img src="${aboutData.image_url}" class="image-preview" alt="About image">` : ''}
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Save About Us</button>
            </div>
        </form>
    `;
    
    // Setup form submission
    document.getElementById('about-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveAboutUs();
    });
}

async function saveAboutUs() {
    const description = document.getElementById('about-description').value.trim();
    const mission = document.getElementById('about-mission').value.trim();
    const services = document.getElementById('about-services').value.trim();
    const imageFile = document.getElementById('about-image').files[0];
    
    if (!description || !mission || !services) {
        showError('All fields are required');
        return;
    }
    
    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            try {
                const fileName = `about/${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('About image upload error:', uploadError);
                    console.log('Continuing without about image...');
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    imageUrl = publicUrl;
                    console.log('About image uploaded:', publicUrl);
                }
            } catch (uploadErr) {
                console.error('About image upload failed:', uploadErr);
                console.log('Saving about without image...');
            }
        }
        
        const aboutData = {
            description,
            mission,
            services,
            ...(imageUrl && { image_url: imageUrl })
        };
        
        // Check if about us record exists
        const { data: existingData } = await supabase
            .from('about_us')
            .select('id')
            .single();
        
        let error;
        if (existingData) {
            // Update existing record
            ({ error } = await supabase
                .from('about_us')
                .update(aboutData)
                .eq('id', existingData.id));
        } else {
            // Create new record
            ({ error } = await supabase
                .from('about_us')
                .insert(aboutData));
        }
        
        if (error) throw error;
        showSuccess('About Us content saved successfully');
        
    } catch (error) {
        console.error('Error saving about us:', error);
        showError('Failed to save about us content');
    }
}

// Location management
async function loadLocation() {
    try {
        const { data, error } = await supabase
            .from('location')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        displayLocation(data);
    } catch (error) {
        console.error('Error loading location:', error);
        showError('Failed to load location data');
    }
}

function displayLocation(locationData) {
    const locationContent = document.getElementById('location-content');
    
    locationContent.innerHTML = `
        <form id="location-form">
            <div class="form-group">
                <label for="location-address" class="form-label">Business Address</label>
                <input type="text" id="location-address" class="form-input" required 
                       value="${locationData?.address || ''}" placeholder="123 Main St, City, State 12345">
            </div>
            <div class="form-group">
                <label for="location-latitude" class="form-label">Latitude</label>
                <input type="number" id="location-latitude" class="form-input" required step="0.000001"
                       value="${locationData?.latitude || ''}" placeholder="40.7128">
            </div>
            <div class="form-group">
                <label for="location-longitude" class="form-label">Longitude</label>
                <input type="number" id="location-longitude" class="form-input" required step="0.000001"
                       value="${locationData?.longitude || ''}" placeholder="-74.0060">
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Save Location</button>
            </div>
        </form>
    `;
    
    // Setup form submission
    document.getElementById('location-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveLocation();
    });
}

async function saveLocation() {
    const address = document.getElementById('location-address').value.trim();
    const latitude = parseFloat(document.getElementById('location-latitude').value);
    const longitude = parseFloat(document.getElementById('location-longitude').value);
    
    if (!address || isNaN(latitude) || isNaN(longitude)) {
        showError('All fields are required and must be valid numbers');
        return;
    }
    
    try {
        const locationData = {
            address,
            latitude,
            longitude
        };
        
        // Check if location record exists
        const { data: existingData } = await supabase
            .from('location')
            .select('id')
            .single();
        
        let error;
        if (existingData) {
            // Update existing record
            ({ error } = await supabase
                .from('location')
                .update(locationData)
                .eq('id', existingData.id));
        } else {
            // Create new record
            ({ error } = await supabase
                .from('location')
                .insert(locationData));
        }
        
        if (error) throw error;
        showSuccess('Location saved successfully');
        
    } catch (error) {
        console.error('Error saving location:', error);
        showError('Failed to save location');
    }
}

// Sales management
async function loadSalesRecords() {
    try {
        const { data, error } = await supabase
            .from('sales_records')
            .select('*')
            .order('sale_date', { ascending: false });

        if (error) throw error;
        
        displaySalesRecords(data || []);
    } catch (error) {
        console.error('Error loading sales records:', error);
        showError('Failed to load sales records');
    }
}

function displaySalesRecords(sales) {
    const salesList = document.getElementById('sales-list');
    
    if (sales.length === 0) {
        salesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <h3>No sales records found</h3>
                <p>Click "Add Sale" to create your first sales record.</p>
            </div>
        `;
        return;
    }

    salesList.innerHTML = sales.map(sale => `
        <div class="data-item">
            <div class="item-content">
                <div class="item-title">${sale.customer_name}</div>
                <div class="item-description">Product: ${sale.product_name}</div>
                <div class="item-description">Date: ${new Date(sale.sale_date).toLocaleDateString()}</div>
                ${sale.receipt_url ? `<div class="item-description">📄 Has receipt</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="action-button edit-button" onclick="editSale('${sale.id}')">Edit</button>
                <button class="action-button delete-button" onclick="deleteSale('${sale.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function setupSaleModal() {
    const addButton = document.getElementById('add-sale-button');
    const modal = document.getElementById('sale-modal');
    const cancelButton = document.getElementById('cancel-sale');
    const form = document.getElementById('sale-form');
    const receiptInput = document.getElementById('sale-receipt');
    const receiptPreview = document.getElementById('sale-receipt-preview');
    
    addButton.addEventListener('click', function() {
        currentEditingSale = null;
        document.getElementById('sale-modal-title').textContent = 'Add Sale Record';
        form.reset();
        document.getElementById('sale-date').value = new Date().toISOString().split('T')[0];
        receiptPreview.style.display = 'none';
        modal.classList.add('active');
    });
    
    cancelButton.addEventListener('click', function() {
        modal.classList.remove('active');
        currentEditingSale = null;
    });
    
    receiptInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                receiptPreview.src = e.target.result;
                receiptPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveSale();
    });
}

async function saveSale() {
    const customerName = document.getElementById('sale-customer').value.trim();
    const productName = document.getElementById('sale-product').value.trim();
    const saleDate = document.getElementById('sale-date').value;
    const receiptFile = document.getElementById('sale-receipt').files[0];
    const saveButton = document.querySelector('#sale-form .save-button');
    
    if (!customerName || !productName || !saleDate) {
        showError('All fields are required');
        return;
    }
    
    // Show loading state
    setLoadingState(saveButton, true, 'Saving...');
    
    try {
        let receiptUrl = null;
        
        // Upload receipt image if provided
        if (receiptFile) {
            try {
                const fileName = `receipts/${Date.now()}_${receiptFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, receiptFile);
                
                if (uploadError) {
                    console.error('Receipt upload error:', uploadError);
                    console.log('Continuing without receipt...');
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    receiptUrl = publicUrl;
                    console.log('Receipt uploaded:', publicUrl);
                }
            } catch (uploadErr) {
                console.error('Receipt upload failed:', uploadErr);
                console.log('Saving sale without receipt...');
            }
        }
        
        const saleData = {
            customer_name: customerName,
            product_name: productName,
            sale_date: saleDate,
            receipt_url: receiptUrl
        };
        
        if (currentEditingSale) {
            // Update existing sale
            const { error } = await supabase
                .from('sales_records')
                .update(saleData)
                .eq('id', currentEditingSale);
            
            if (error) throw error;
            showSuccess('Sale record updated successfully');
            setLoadingState(saveButton, false);
        } else {
            // Create new sale
            const { error } = await supabase
                .from('sales_records')
                .insert(saleData);
            
            if (error) throw error;
            showSuccess('Sale record created successfully');
            setLoadingState(saveButton, false);
        }
        
        // Close modal and reload sales
        document.getElementById('sale-modal').classList.remove('active');
        await loadSalesRecords();
        
    } catch (error) {
        console.error('Error saving sale:', error);
        showError('Failed to save sale record');
        setLoadingState(saveButton, false);
    }
}

async function editSale(saleId) {
    try {
        const { data, error } = await supabase
            .from('sales_records')
            .select('*')
            .eq('id', saleId)
            .single();
        
        if (error) throw error;
        
        currentEditingSale = saleId;
        document.getElementById('sale-modal-title').textContent = 'Edit Sale Record';
        
        // Populate form
        document.getElementById('sale-customer').value = data.customer_name;
        document.getElementById('sale-product').value = data.product_name;
        document.getElementById('sale-date').value = data.sale_date;
        
        // Show existing receipt if available
        const receiptPreview = document.getElementById('sale-receipt-preview');
        if (data.receipt_url) {
            receiptPreview.src = data.receipt_url;
            receiptPreview.style.display = 'block';
        } else {
            receiptPreview.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('sale-modal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading sale:', error);
        showError('Failed to load sale record for editing');
    }
}

async function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sales record?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('sales_records')
            .delete()
            .eq('id', saleId);
        
        if (error) throw error;
        
        showSuccess('Sales record deleted successfully');
        await loadSalesRecords();
        
    } catch (error) {
        console.error('Error deleting sale:', error);
        showError('Failed to delete sales record');
    }
}

// Utility functions
function showError(message) {
    // Create error element if it doesn't exist
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.admin-content .container').prepend(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    // Create success element if it doesn't exist
    let successDiv = document.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        document.querySelector('.admin-content .container').prepend(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    
    // Initialize Supabase and check authentication
    if (!initializeSupabase()) {
        return;
    }
    
    // Setup navigation
    setupNavigation();
    
    // Setup modals
    setupSliderModal();
    setupSaleModal();
    setupBusinessModal();
    setupVideoModal();
});

// Make functions available globally for onclick handlers
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editSliderImage = editSliderImage;
window.deleteSliderImage = deleteSliderImage;
window.editSale = editSale;
window.deleteSale = deleteSale;
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;

// Business Details management
async function loadBusinessDetails() {
    try {
        const { data, error } = await supabase
            .from('business_details')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        displayBusinessDetails(data);
    } catch (error) {
        console.error('Error loading business details:', error);
        showError('Failed to load business details');
    }
}

function displayBusinessDetails(businessData) {
    const businessContent = document.getElementById('business-content');
    
    businessContent.innerHTML = `
        <form id="business-form">
            <div class="form-group">
                <label for="business-name" class="form-label">Business Name</label>
                <input type="text" id="business-name" class="form-input" required 
                       value="${businessData?.business_name || 'JRD Fire Fighting Equipment Trading'}">
            </div>
            <div class="form-group">
                <label for="business-tagline" class="form-label">Tagline</label>
                <input type="text" id="business-tagline" class="form-input" 
                       value="${businessData?.tagline || 'A Product of RD RAC\'S MARKETING'}">
            </div>
            <div class="form-group">
                <label for="business-description" class="form-label">Description</label>
                <textarea id="business-description" class="form-textarea" rows="4">${businessData?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="business-services" class="form-label">Services (one per line)</label>
                <textarea id="business-services" class="form-textarea" rows="6">${businessData?.services?.join('\n') || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="business-phones" class="form-label">Phone Numbers (one per line)</label>
                <textarea id="business-phones" class="form-textarea" rows="3">${businessData?.phone_numbers?.join('\n') || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="business-address" class="form-label">Address</label>
                <textarea id="business-address" class="form-textarea" rows="3">${businessData?.address || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="business-facebook" class="form-label">Facebook Page</label>
                <input type="text" id="business-facebook" class="form-input" 
                       value="${businessData?.facebook_page || ''}">
            </div>
            <div class="form-group">
                <label for="business-email" class="form-label">Email</label>
                <input type="email" id="business-email" class="form-input" 
                       value="${businessData?.email || ''}">
            </div>
            <div class="form-group">
                <label for="business-image" class="form-label">Business Image</label>
                <input type="file" id="business-image" class="form-input" accept="image/*">
                ${businessData?.image_url ? `<img src="${businessData.image_url}" class="image-preview">` : ''}
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Save Business Details</button>
            </div>
        </form>
    `;
    
    // Setup form submission
    document.getElementById('business-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveBusinessDetails();
    });
}

async function saveBusinessDetails() {
    const businessName = document.getElementById('business-name').value.trim();
    const businessTagline = document.getElementById('business-tagline').value.trim();
    const businessDescription = document.getElementById('business-description').value.trim();
    const servicesText = document.getElementById('business-services').value.trim();
    const phonesText = document.getElementById('business-phones').value.trim();
    const businessAddress = document.getElementById('business-address').value.trim();
    const businessFacebook = document.getElementById('business-facebook').value.trim();
    const businessEmail = document.getElementById('business-email').value.trim();
    const imageFile = document.getElementById('business-image').files[0];
    const saveButton = document.querySelector('#business-form .save-button');
    
    // Show loading state
    setLoadingState(saveButton, true, 'Saving...');
    
    if (!businessName) {
        showError('Business name is required');
        return;
    }
    
    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            try {
                const fileName = `business/${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('Image upload error:', uploadError);
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    imageUrl = publicUrl;
                    console.log('Image uploaded:', publicUrl);
                }
            } catch (uploadErr) {
                console.error('Image upload failed:', uploadErr);
            }
        }
        
        const businessData = {
            business_name: businessName,
            tagline: businessTagline,
            description: businessDescription,
            services: servicesText ? servicesText.split('\n').filter(s => s.trim()) : [],
            phone_numbers: phonesText ? phonesText.split('\n').filter(p => p.trim()) : [],
            address: businessAddress,
            facebook_page: businessFacebook,
            email: businessEmail
        };
        
        // Only update image URL if new image was uploaded
        if (imageUrl) {
            businessData.image_url = imageUrl;
        }
        
        // Check if business details record exists
        const { data: existingData } = await supabase
            .from('business_details')
            .select('id')
            .single();
        
        let error;
        if (existingData) {
            // Update existing record
            ({ error } = await supabase
                .from('business_details')
                .update(businessData)
                .eq('id', existingData.id));
        } else {
            // Create new record
            ({ error } = await supabase
                .from('business_details')
                .insert(businessData));
        }
        
        if (error) throw error;
        showSuccess('Business details saved successfully');
        setLoadingState(saveButton, false);
        
    } catch (error) {
        console.error('Error saving business details:', error);
        showError('Failed to save business details');
        setLoadingState(saveButton, false);
    }
}

function setupBusinessModal() {
    // Business details uses inline form, no modal needed
}

// Videos management
async function loadVideos() {
    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        displayVideos(data || []);
    } catch (error) {
        console.error('Error loading videos:', error);
        showError('Failed to load videos');
    }
}

function displayVideos(videos) {
    const videosList = document.getElementById('videos-list');
    
    if (videos.length === 0) {
        videosList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎥</div>
                <h3>No video found</h3>
                <p>Click "Add Video" to upload your video. Only one video can be stored at a time.</p>
            </div>
        `;
        return;
    }

    // Since we only allow one video, show it as the current video
    const video = videos[0];
    
    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
    // Format duration
    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    videosList.innerHTML = `
        <div class="data-item current-video-item">
            <div class="item-content">
                <div class="item-title">${video.title} (Current Video)</div>
                <div class="item-description">${video.description || 'No description'}</div>
                <div class="item-description">Status: ${video.is_active ? 'Active' : 'Inactive'}</div>
                ${video.video_file_url ? 
                    `<div class="item-description">📹 Video File: ${video.video_file_url.split('/').pop()}</div>` : 
                    video.video_url ? `<div class="item-description">📹 ${video.video_url.substring(0, 50)}...</div>` : ''
                }
                ${video.file_size ? `<div class="item-description">💾 Size: ${formatFileSize(video.file_size)}</div>` : ''}
                ${video.duration_seconds ? `<div class="item-description">⏱️ Duration: ${formatDuration(video.duration_seconds)}</div>` : ''}
                <div class="item-description" style="color: #ff6b35; font-weight: 500; margin-top: 10px;">
                    ⚠️ Uploading a new video will replace this current video.
                </div>
            </div>
            <div class="item-actions">
                <button class="action-button edit-button" onclick="editVideo('${video.id}')">Edit</button>
                <button class="action-button delete-button" onclick="deleteVideo('${video.id}')">Delete</button>
            </div>
        </div>
    `;
}

function setupVideoModal() {
    const addButton = document.getElementById('add-video-button');
    const modal = document.getElementById('video-modal');
    const cancelButton = document.getElementById('cancel-video');
    const form = document.getElementById('video-form');
    const thumbnailInput = document.getElementById('video-thumbnail');
    const thumbnailPreview = document.getElementById('video-thumbnail-preview');
    const videoFileInput = document.getElementById('video-file');
    const videoFileInfo = document.getElementById('video-file-info');
    
    addButton.addEventListener('click', function() {
        currentEditingVideo = null;
        document.getElementById('video-modal-title').textContent = 'Upload New Video (Replaces Current)';
        form.reset();
        document.getElementById('video-order').value = '0';
        document.getElementById('video-active').checked = true;
        thumbnailPreview.style.display = 'none';
        videoFileInfo.textContent = '';
        modal.classList.add('active');
    });
    
    cancelButton.addEventListener('click', function() {
        modal.classList.remove('active');
        currentEditingVideo = null;
    });
    
    thumbnailInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                thumbnailPreview.src = e.target.result;
                thumbnailPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    videoFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const fileSize = (file.size / (1024 * 1024)).toFixed(1);
            const fileType = file.type.split('/')[1].toUpperCase();
            videoFileInfo.innerHTML = `
                <strong>Selected:</strong> ${file.name}<br>
                <strong>Size:</strong> ${fileSize} MB<br>
                <strong>Type:</strong> ${fileType}
            `;
        } else {
            videoFileInfo.textContent = '';
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveVideo();
    });
}

async function saveVideo() {
    const title = document.getElementById('video-title').value.trim();
    const description = document.getElementById('video-description').value.trim();
    const videoFile = document.getElementById('video-file').files[0];
    const thumbnailFile = document.getElementById('video-thumbnail').files[0];
    const displayOrder = parseInt(document.getElementById('video-order').value) || 0;
    const isActive = document.getElementById('video-active').checked;
    const saveButton = document.querySelector('#video-form .save-button');
    
    if (!title) {
        showError('Video title is required');
        return;
    }
    
    // If it's a new video, file is required
    if (!currentEditingVideo && !videoFile) {
        showError('Video file is required for new uploads');
        return;
    }
    
    // Show loading state
    setLoadingState(saveButton, true, 'Uploading...');
    
    try {
        let videoFileUrl = null;
        let thumbnailUrl = null;
        let fileSize = null;
        let durationSeconds = null;
        
        // Check if there's an existing video that needs to be deleted
        let existingVideo = null;
        if (!currentEditingVideo) {
            // Get the current video before uploading new one
            const { data: currentVideos, error: fetchError } = await supabase
                .from('videos')
                .select('id, video_file_url, thumbnail_url')
                .limit(1);
            
            if (!fetchError && currentVideos && currentVideos.length > 0) {
                existingVideo = currentVideos[0];
            }
        }
        
        // Upload video file if provided
        if (videoFile) {
            try {
                // Show upload progress
                showInfo(`Uploading video: ${videoFile.name}...`);
                
                const fileName = `videos/${Date.now()}_${videoFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, videoFile);
                
                if (uploadError) {
                    console.error('Video upload error:', uploadError);
                    throw new Error('Video upload failed: ' + uploadError.message);
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    videoFileUrl = publicUrl;
                    fileSize = videoFile.size;
                    
                    console.log('Video uploaded:', publicUrl);
                    showSuccess('Video uploaded successfully!');
                }
            } catch (uploadErr) {
                console.error('Video upload failed:', uploadErr);
                throw uploadErr;
            }
        }
        
        // Upload thumbnail if provided
        if (thumbnailFile) {
            try {
                const fileName = `videos/thumbnails/${Date.now()}_${thumbnailFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, thumbnailFile);
                
                if (uploadError) {
                    console.error('Thumbnail upload error:', uploadError);
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);
                    
                    thumbnailUrl = publicUrl;
                    console.log('Thumbnail uploaded:', publicUrl);
                }
            } catch (uploadErr) {
                console.error('Thumbnail upload failed:', uploadErr);
            }
        }
        
        const videoData = {
            title,
            description,
            display_order: displayOrder,
            is_active: isActive,
            file_size: fileSize,
            duration_seconds: durationSeconds,
            updated_at: new Date().toISOString()
        };
        
        // Only update video file URL if new video was uploaded
        if (videoFileUrl) {
            videoData.video_file_url = videoFileUrl;
        }
        
        // Only update thumbnail URL if new thumbnail was uploaded
        if (thumbnailUrl) {
            videoData.thumbnail_url = thumbnailUrl;
        }
        
        if (currentEditingVideo) {
            // Update existing video
            const { error } = await supabase
                .from('videos')
                .update(videoData)
                .eq('id', currentEditingVideo);
            
            if (error) throw error;
            showSuccess('Video updated successfully');
            setLoadingState(saveButton, false);
        } else {
            // Delete existing video if it exists (to maintain only one video)
            if (existingVideo) {
                showInfo('Deleting old video...');
                
                // Delete from storage
                if (existingVideo.video_file_url) {
                    try {
                        const oldVideoPath = existingVideo.video_file_url.split('/').pop();
                        await supabase.storage
                            .from('images')
                            .remove([`videos/${oldVideoPath}`]);
                        console.log('Old video file deleted from storage');
                    } catch (deleteError) {
                        console.warn('Could not delete old video file:', deleteError);
                    }
                }
                
                if (existingVideo.thumbnail_url) {
                    try {
                        const oldThumbnailPath = existingVideo.thumbnail_url.split('/').pop();
                        await supabase.storage
                            .from('images')
                            .remove([`videos/thumbnails/${oldThumbnailPath}`]);
                        console.log('Old thumbnail deleted from storage');
                    } catch (deleteError) {
                        console.warn('Could not delete old thumbnail:', deleteError);
                    }
                }
                
                // Delete from database
                const { error: deleteError } = await supabase
                    .from('videos')
                    .delete()
                    .eq('id', existingVideo.id);
                
                if (!deleteError) {
                    console.log('Old video record deleted from database');
                }
            }
            
            // Create new video
            const { error } = await supabase
                .from('videos')
                .insert(videoData);
            
            if (error) throw error;
            showSuccess('Video created successfully');
            setLoadingState(saveButton, false);
        }
        
        // Close modal and reload videos
        document.getElementById('video-modal').classList.remove('active');
        await loadVideos();
        
    } catch (error) {
        console.error('Error saving video:', error);
        showError('Failed to save video: ' + error.message);
        setLoadingState(saveButton, false);
    }
}

async function editVideo(videoId) {
    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('id', videoId)
            .single();
        
        if (error) throw error;
        
        currentEditingVideo = videoId;
        document.getElementById('video-modal-title').textContent = 'Edit Current Video';
        
        // Populate form
        document.getElementById('video-title').value = data.title;
        document.getElementById('video-description').value = data.description || '';
        document.getElementById('video-order').value = data.display_order;
        document.getElementById('video-active').checked = data.is_active;
        
        // Show existing thumbnail if available
        const thumbnailPreview = document.getElementById('video-thumbnail-preview');
        if (data.thumbnail_url) {
            thumbnailPreview.src = data.thumbnail_url;
            thumbnailPreview.style.display = 'block';
        } else {
            thumbnailPreview.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('video-modal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading video:', error);
        showError('Failed to load video for editing');
    }
}

async function deleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this video?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', videoId);
        
        if (error) throw error;
        
        showSuccess('Video deleted successfully');
        await loadVideos();
        
    } catch (error) {
        console.error('Error deleting video:', error);
        showError('Failed to delete video');
    }
}