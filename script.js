// script.js - โค้ด JavaScript ทั้งหมดสำหรับ Creative Ads Manager AI
// คัดลอกทั้งหมดนี้ไปวางในไฟล์ script.js บน GitHub

/* === GLOBAL VARIABLES === */
let productData = JSON.parse(localStorage.getItem('productData')) || {};
let galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let currentProject = null;
let currentSection = null;
let transitionOverlay = null;
let calendar = null;
let selectedImages = new Set(); // สำหรับเลือกหลายรูป
let currentPage = 1;
const IMAGES_PER_PAGE = 12;

/* === DEFAULT PROJECT TEMPLATE === */
const defaultProject = {
    id: Date.now(),
    name: "โปรเจกต์ใหม่",
    status: "draft",
    createdAt: new Date().toISOString(),
    dueDate: null,
    tasks: [
        { id: 1, text: "กำหนดคอนเซ็ปต์", completed: false, due: null },
        { id: 2, text: "สร้างแคปชั่น", completed: false, due: null },
        { id: 3, text: "ออกแบบรูปภาพ", completed: false, due: null },
        { id: 4, text: "รีวิวและปรับแก้", completed: false, due: null }
    ],
    notes: "",
    assets: [],
    progress: 0
};

/* === PAGE TRANSITION SYSTEM === */
function showPageTransition(message = 'กำลังโหลด...') {
    if (!transitionOverlay) {
        transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'page-transition';
        transitionOverlay.innerHTML = `
            <div style="text-align:center;">
                <div class="transition-loader"></div>
                <div class="transition-text">${message}</div>
            </div>
        `;
        document.body.appendChild(transitionOverlay);
    }
    requestAnimationFrame(() => transitionOverlay.classList.add('active'));
}

function hidePageTransition() {
    if (transitionOverlay) {
        transitionOverlay.classList.remove('active');
        setTimeout(() => {
            if (transitionOverlay && transitionOverlay.parentNode) {
                transitionOverlay.parentNode.removeChild(transitionOverlay);
                transitionOverlay = null;
            }
        }, 400);
    }
}

function getSectionLoadingMessage(sectionId) {
    const messages = {
        'gallery': 'กำลังโหลดแกลเลอรี่ AI...',
        'project-manager': 'กำลังโหลดโปรเจกต์...',
        'fb-generator': 'เตรียมแคปชั่น Facebook...',
        'tiktok-generator': 'สร้างไอเดีย TikTok...',
        'shopee-generator': 'ออกแบบแคปชั่น Shopee...'
    };
    return messages[sectionId] || 'กำลังโหลด...';
}

/* === NAVIGATION HANDLER === */
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (!targetSection || targetSection === currentSection) return;
        
        showPageTransition(getSectionLoadingMessage(targetId));
        
        setTimeout(() => {
            document.querySelectorAll('main section').forEach(sec => {
                sec.style.display = 'none';
                sec.classList.remove('active');
            });
            
            targetSection.style.display = 'block';
            requestAnimationFrame(() => {
                targetSection.classList.add('active');
            });
            
            currentSection = targetSection;
            hidePageTransition();
            
            if (targetId === 'gallery') {
                setTimeout(() => {
                    renderGallery();
                    updateTagFilterOptions();
                }, 100);
            }
            if (targetId === 'project-manager') {
                initProjectManager();
            }
        }, 300);
    });
});

/* === PRODUCT INFO FORM === */
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            productData.name = document.getElementById('product-name').value.trim();
            productData.desc = document.getElementById('product-desc').value.trim();
            productData.audience = document.getElementById('target-audience').value.trim();
            
            const fileInput = document.getElementById('product-image');
            if (fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    productData.image = e.target.result;
                    saveAndPreviewProduct();
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                saveAndPreviewProduct();
            }
        });
    }
    
    function saveAndPreviewProduct() {
        localStorage.setItem('productData', JSON.stringify(productData));
        const preview = document.getElementById('product-preview');
        if (preview && productData.image) {
            preview.innerHTML = `<img src="${productData.image}" alt="Product" style="max-width:200px; border-radius:12px; margin-top:1rem;">`;
        }
        showToast('บันทึกข้อมูลสินค้าเรียบร้อย!', 'success');
    }
    
    loadProductData();
});

function loadProductData() {
    if (productData.name) {
        document.getElementById('product-name').value = productData.name;
        document.getElementById('product-desc').value = productData.desc;
        document.getElementById('target-audience').value = productData.audience;
        if (productData.image) {
            document.getElementById('product-preview').innerHTML = `<img src="${productData.image}" alt="Product" style="max-width:200px; border-radius:12px; margin-top:1rem;">`;
        }
    }
}

/* === GALLERY SYSTEM === */
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    const filtered = filterGalleryImages();
    const start = (currentPage - 1) * IMAGES_PER_PAGE;
    const end = start + IMAGES_PER_PAGE;
    const pageImages = filtered.slice(start, end);
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>ไม่พบรูปภาพ</p>
                <small>ลองเปลี่ยนตัวกรองหรือเพิ่มรูปใหม่</small>
            </div>
        `;
        updatePagination(0);
        return;
    }
    
    grid.innerHTML = pageImages.map((img, index) => `
        <div class="gallery-item" style="animation-delay: ${0.05 * (index + 1)}s;" 
             onclick="toggleSelection(${img.id}, event)">
            <a href="${img.url}" data-fancybox="gallery" data-caption="${img.tags ? img.tags.join(', ') : ''}">
                <img src="${img.url}" alt="AI Image">
            </a>
            <div class="gallery-overlay">
                <div style="flex:1;">
                    <div style="font-weight:600; margin-bottom:0.3rem;">${img.name || 'รูปภาพ AI'}</div>
                    <div class="image-tags">
                        ${img.tags ? img.tags.map(t => `<span class="tag">#${t}</span>`).join('') : '<span class="tag">ไม่มีแท็ก</span>'}
                    </div>
                </div>
                <div class="overlay-actions">
                    <button class="fav-btn ${img.fav ? 'active' : ''}" onclick="event.preventDefault(); event.stopPropagation(); toggleFav(${img.id})">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="download-btn" onclick="event.preventDefault(); event.stopPropagation(); downloadImage('${img.url}', '${img.name || 'ai-image'}')">
                        <i class="fas fa-download"></i>
                    </button>
                    ${currentProject ? `
                    <button class="edit-btn" onclick="event.preventDefault(); event.stopPropagation(); addAssetFromGallery({url: '${img.url}', name: '${img.name || 'รูปภาพ'}'})">
                        <i class="fas fa-folder-plus"></i>
                    </button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    Fancybox.bind("[data-fancybox='gallery']");
    updatePagination(filtered.length);
    updateStats(filtered.length);
}

function filterGalleryImages() {
    let filtered = [...galleryImages];
    
    // ตัวกรองแท็ก
    const selectedTags = $('#tag-filter').val() || [];
    if (selectedTags.length > 0) {
        filtered = filtered.filter(img => 
            img.tags && selectedTags.some(tag => img.tags.includes(tag))
        );
    }
    
    // ค้นหาชื่อ
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(img => 
            (img.name && img.name.toLowerCase().includes(searchTerm)) ||
            (img.tags && img.tags.some(t => t.toLowerCase().includes(searchTerm)))
        );
    }
    
    // เรียงลำดับ
    const sortBy = document.getElementById('sort-select')?.value;
    if (sortBy === 'date-desc') {
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'date-asc') {
        filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    return filtered;
}

function updatePagination(total) {
    const totalPages = Math.ceil(total / IMAGES_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    pagination.innerHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
        ${Array.from({length: totalPages}, (_, i) => `
            <button class="page-btn ${i + 1 === currentPage ? 'active' : ''}" onclick="changePage(${i + 1})">
                ${i + 1}
            </button>
        `).join('')}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

function changePage(page) {
    const total = filterGalleryImages().length;
    const maxPage = Math.ceil(total / IMAGES_PER_PAGE);
    if (page < 1 || page > maxPage) return;
    currentPage = page;
    renderGallery();
}

function updateStats(total) {
    const stats = document.querySelector('.stats-bar');
    if (!stats) return;
    const favCount
