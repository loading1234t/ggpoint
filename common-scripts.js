// common-scripts.js

// Глобальные переменные
let productsData = [];
let currentImageIndex = 0;

// Функция для открытия деталей товара
function openProductDetail(product) {
    const modal = document.getElementById('productDetailModal');
    const content = document.getElementById('productDetailContent');
    
    if (!modal || !content) {
        console.error('Modal elements not found');
        return;
    }
    
    // Формируем HTML для модального окна
    const html = `
        <div class="product-detail-grid">
            <div class="product-gallery">
                <div class="main-image" id="mainImageContainer">
                    <img src="${product.image || 'https://via.placeholder.com/500x400?text=Нет+изображения'}" 
                         alt="${product.name}"
                         id="mainProductImage"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/500x400?text=Ошибка+загрузки'">
                    ${product.images && product.images.length > 1 ? `
                    <div class="gallery-nav">
                        <button class="nav-btn" onclick="prevImage()">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="nav-btn" onclick="nextImage()">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    ` : ''}
                </div>
                
                ${product.images && product.images.length > 1 ? `
                <div class="image-thumbnails">
                    ${product.images.map((img, index) => `
                        <img src="${img}" 
                             alt="Фото ${index + 1}"
                             class="thumbnail ${index === 0 ? 'active' : ''}"
                             onclick="changeImage(${index})"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/80x80?text=Ошибка'">
                    `).join('')}
                </div>
                
                <div class="photo-count">
                    <i class="fas fa-camera"></i>
                    <span>${product.images.length} фото</span>
                </div>
                ` : ''}
            </div>
            
            <div class="product-details">
                <h1 style="font-size: 2.2rem; margin-bottom: 1rem; color: var(--text-light);">${product.name}</h1>
                
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    ${product.category ? `<span style="color: var(--accent-teal); font-weight: 600; background: rgba(13, 148, 136, 0.1); padding: 0.3rem 1rem; border-radius: 15px;">${product.category}</span>` : ''}
                </div>
                
                <p class="product-price" style="font-size: 2.5rem; margin-bottom: 2rem;">${product.price}</p>
                
                <div class="product-description-full">
                    <h3 style="margin-bottom: 1rem; color: var(--text-light);">Описание</h3>
                    <p>${product.description || 'Описание отсутствует'}</p>
                </div>
                
                ${product.features && product.features.length > 0 ? `
                <div class="product-features">
                    <h3 style="margin-bottom: 1rem; color: var(--text-light);">Характеристики</h3>
                    <ul class="feature-list">
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'block';
    
    // Обновляем глобальную переменную с изображениями
    window.productImages = product.images || [product.image || ''].filter(Boolean);
}

// Функции для навигации по галерее
window.changeImage = function(index) {
    currentImageIndex = index;
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage && productImages && productImages[index]) {
        mainImage.src = productImages[index];
        
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
};

window.prevImage = function() {
    if (productImages && productImages.length > 1) {
        currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
        changeImage(currentImageIndex);
    }
};

window.nextImage = function() {
    if (productImages && productImages.length > 1) {
        currentImageIndex = (currentImageIndex + 1) % productImages.length;
        changeImage(currentImageIndex);
    }
};

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для модальных окон
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Инициализация товаров на странице
    initProducts();
});

// Инициализация товаров
function initProducts() {
    const productCards = document.querySelectorAll('.product-card[data-product]');
    
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const product = getProductById(productId);
            if (product) {
                openProductDetail(product);
            }
        });
    });
}

// Получение товара по ID
function getProductById(productId) {
    // В реальном приложении здесь будет запрос к Firebase
    // Сейчас используем тестовые данные
    return window.productsData.find(p => p.id === productId);
}
