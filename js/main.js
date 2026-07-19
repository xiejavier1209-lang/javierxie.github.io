/* ============================================================
   JAVIER XIE · PERSONAL WEBSITE
   Video Modal · Image Lightbox · Language Toggle · Nav
   ============================================================ */

(function () {
    'use strict';

    let currentLang = localStorage.getItem('lang') || 'zh';

    // ==================== INIT ====================
    document.addEventListener('DOMContentLoaded', () => {
        initAOS();
        applyLanguage(currentLang);
        initLanguageToggle();
        initNavbarScroll();
        initMobileMenu();
        initActiveNavOnScroll();
        initSmoothScroll();
        initVideoCards();
        initImageGalleries();
        initLightbox();
    });

    // ==================== AOS ====================
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-expo',
                once: true,
                offset: 40,
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }
    }

    // ==================== LANGUAGE ====================
    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

        document.querySelectorAll('[data-zh][data-en]').forEach(el => {
            const text = el.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en');
            if (text !== null && el.children.length === 0) {
                el.textContent = text;
            }
        });

        updateLangToggleUI(lang);
        localStorage.setItem('lang', lang);
    }

    function initLanguageToggle() {
        const toggle = document.getElementById('langToggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            applyLanguage(currentLang === 'zh' ? 'en' : 'zh');
        });
    }

    function updateLangToggleUI(lang) {
        const zhEl = document.querySelector('.lang-zh');
        const enEl = document.querySelector('.lang-en');
        if (zhEl) zhEl.classList.toggle('active', lang === 'zh');
        if (enEl) enEl.classList.toggle('active', lang === 'en');
    }

    // ==================== NAVBAR ====================
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    navbar.classList.toggle('scrolled', window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    function initActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        if (!sections.length || !navLinks.length) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    let current = '';
                    sections.forEach(s => {
                        if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
                    });
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }
            });
        });
    }

    // ==================== VIDEO CARDS ====================
    function initVideoCards() {
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => openVideoModal(card));
        });
    }

    function openVideoModal(card) {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('modalVideoPlayer');
        const videoIframe = document.getElementById('modalVideoIframe');
        const videoTitle = document.getElementById('modalVideoTitle');
        const videoMeta = document.getElementById('modalVideoMeta');
        const externalLink = document.getElementById('modalExternalLink');

        const localVideo = card.getAttribute('data-video');
        const douyinUrl = card.getAttribute('data-douyin');
        const zhTitle = card.getAttribute('data-zh-title') || card.getAttribute('data-title');
        const enTitle = card.getAttribute('data-en-title') || card.getAttribute('data-title');
        const meta = card.getAttribute('data-meta') || '';

        // Set title
        videoTitle.textContent = currentLang === 'zh' ? zhTitle : enTitle;
        videoMeta.textContent = meta;

        // Reset
        videoPlayer.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.src = '';
        videoIframe.style.display = 'none';
        videoIframe.src = '';

        if (localVideo) {
            // Try playing local video, fallback to Douyin link on error
            videoPlayer.src = localVideo;
            videoPlayer.style.display = 'block';
            externalLink.style.display = 'none';
            const fallbackToDouyin = () => {
                videoPlayer.style.display = 'none';
                videoPlayer.src = '';
                if (douyinUrl) {
                    externalLink.style.display = 'inline-flex';
                    externalLink.href = douyinUrl;
                    const wrapper = document.getElementById('modalVideoWrapper');
                    wrapper.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:16px;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;">
                            <i class="fa-brands fa-tiktok" style="font-size:56px;opacity:0.8;"></i>
                            <p style="font-size:16px;opacity:0.7;">${currentLang === 'zh' ? '点击下方按钮在抖音观看' : 'Watch on Douyin'}</p>
                        </div>`;
                }
            };
            videoPlayer.onerror = fallbackToDouyin;
            videoPlayer.play().catch(fallbackToDouyin);
        } else if (douyinUrl) {
            // Show external link to Douyin
            videoPlayer.style.display = 'none';
            videoIframe.style.display = 'none';

            // Try to extract video ID from douyin URL and embed
            // Most douyin links won't embed, so we show a nice message + external link
            externalLink.style.display = 'inline-flex';
            externalLink.href = douyinUrl;

            // Show a placeholder in the video area
            const wrapper = document.getElementById('modalVideoWrapper');
            wrapper.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:16px;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;">
                    <i class="fa-brands fa-tiktok" style="font-size:56px;opacity:0.8;"></i>
                    <p style="font-size:16px;opacity:0.7;">${currentLang === 'zh' ? '点击下方按钮在抖音观看' : 'Watch on Douyin'}</p>
                </div>`;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Close on Escape
        document.addEventListener('keydown', handleModalEscape);
    }

    function closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('modalVideoPlayer');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        videoPlayer.pause();
        videoPlayer.src = '';

        // Restore wrapper
        const wrapper = document.getElementById('modalVideoWrapper');
        wrapper.innerHTML = `
            <video id="modalVideoPlayer" controls playsinline style="width:100%;height:100%;display:none;"></video>
            <iframe id="modalVideoIframe" style="width:100%;height:100%;display:none;" allowfullscreen allow="autoplay"></iframe>`;

        document.removeEventListener('keydown', handleModalEscape);
    }

    function handleModalEscape(e) {
        if (e.key === 'Escape') closeVideoModal();
    }

    // Expose to global scope for onclick
    window.closeVideoModal = closeVideoModal;

    // ==================== IMAGE GALLERIES ====================
    function initImageGalleries() {
        // Conference images (联合发布会)
        const conferenceImages = [
            { src: 'images/conference/广汽丰田xMomenta，安心安全新体验！.jpg', zh: '广汽丰田 × Momenta', en: 'GAC-Toyota × Momenta' },
            { src: 'images/conference/广汽丰田Momenta与华为小米共筑最强生态圈.jpg', zh: 'Momenta与华为小米共筑最强生态圈', en: 'Momenta with Huawei & Xiaomi' },
            { src: 'images/conference/R6飞轮大模型上车铂智发布会.jpg', zh: 'R6飞轮大模型上车铂智发布会', en: 'R6 Flywheel Model Launch' },
            { src: 'images/conference/东风奕派发布会.jpg', zh: '东风奕派发布会', en: 'Dongfeng eπ Launch' },
            { src: 'images/conference/img_v3_02pj_f76dd183-ff51-4ab8-8046-eb61dc2ce9cg.jpg', zh: '品牌联合发布', en: 'Brand Joint Launch' },
        ];
        populateGallery('gallery-conference', conferenceImages);

        // Co-marketing product images
        const comktImages = [
            { src: 'images/co-marketing/铂智3x辅助驾驶，记忆泊车，万变从容.jpg', zh: '记忆泊车，万变从容', en: 'Memory Parking' },
            { src: 'images/co-marketing/铂智3x辅助驾驶，桥底迷宫，通行不迷路.jpg', zh: '桥底迷宫，通行不迷路', en: 'Bridge Maze Navigation' },
            { src: 'images/co-marketing/铂智3x夜间南浦大桥.jpg', zh: '夜间南浦大桥', en: 'Night Nanpu Bridge' },
            { src: 'images/co-marketing/铂智3x日间南浦大桥.jpg', zh: '日间南浦大桥', en: 'Day Nanpu Bridge' },
            { src: 'images/co-marketing/铂智3X施工路段.jpg', zh: '施工路段辅助驾驶', en: 'Construction Zone Assist' },
            { src: 'images/co-marketing/铂智3X新疆伊昭公路.jpg', zh: '新疆伊昭公路', en: 'Xinjiang Yizhao Highway' },
            { src: 'images/co-marketing/铂智3X辅助驾驶 夜战北京胡同.webp', zh: '夜战北京胡同', en: 'Beijing Hutong Night Drive' },
            { src: 'images/co-marketing/铂智3X 窄路对向会车.jpg', zh: '窄路对向会车', en: 'Narrow Road Passing' },
            { src: 'images/co-marketing/铂智3x窄路调头丝滑无滞.jpg', zh: '窄路调头丝滑无滞', en: 'Smooth Narrow Road U-turn' },
            { src: 'images/co-marketing/铂智3x ETC通行不发懵.jpg', zh: 'ETC通行不发懵', en: 'ETC Smart Passage' },
            { src: 'images/co-marketing/再登央视《朝闻天下》.jpg', zh: '再登央视《朝闻天下》', en: 'CCTV News Feature' },
            { src: 'images/co-marketing/新疆铂智3X八卦城.png', zh: '新疆铂智3X八卦城', en: 'Xinjiang Bagua City' },
        ];
        populateGallery('gallery-comkt', comktImages);

        // Product highlight images
        const productImages = [
            { src: 'images/product/APA机械车库.jpg', zh: 'APA 机械车库', en: 'APA Mechanical Garage' },
            { src: 'images/product/APA开阔车位.jpg', zh: 'APA 开阔车位', en: 'APA Open Parking' },
            { src: 'images/product/APA老小区.jpg', zh: 'APA 老小区', en: 'APA Old Community' },
            { src: 'images/product/APA逆向水平断头路.jpg', zh: 'APA 逆向水平断头路', en: 'APA Reverse Dead End' },
            { src: 'images/product/老小区.jpg', zh: '老小区泊车', en: 'Old Community Parking' },
            { src: 'images/product/视频号.png', zh: '产品亮点展示', en: 'Product Highlights' },
        ];
        populateGallery('gallery-product', productImages);
    }

    function populateGallery(containerId, images) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const VISIBLE_COUNT = 4; // Show 4 items, collapse the rest

        images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            if (index >= VISIBLE_COUNT) item.classList.add('collapsed');
            item.setAttribute('data-aos', 'fade-up');
            const caption = currentLang === 'zh' ? img.zh : img.en;
            item.innerHTML = `
                <img src="${img.src}" alt="${caption}" loading="lazy" onerror="this.parentElement.style.display='none'">
                <div class="gallery-item-caption">${caption}</div>`;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(img.src, caption);
            });
            container.appendChild(item);
        });

        // Add collapse toggle if there are more items than VISIBLE_COUNT
        if (images.length > VISIBLE_COUNT) {
            const wrap = document.createElement('div');
            wrap.className = 'gallery-toggle-wrap';
            const btn = document.createElement('button');
            btn.className = 'gallery-toggle';
            btn.innerHTML = '<span data-zh="展开更多" data-en="Show More">展开更多</span> <span class="toggle-icon">▾</span>';
            btn.addEventListener('click', function() {
                const grid = this.parentElement.parentElement;
                const items = grid.querySelectorAll('.gallery-item.collapsed');
                const isExpanding = items.length > 0 && items[0].style.display !== 'block';

                if (this.classList.contains('expanded')) {
                    // Collapse
                    items.forEach(item => { item.style.display = 'none'; });
                    this.classList.remove('expanded');
                    const span = this.querySelector('[data-zh]');
                    if (span) span.textContent = currentLang === 'zh' ? '展开更多' : 'Show More';
                } else {
                    // Expand
                    items.forEach(item => { item.style.display = 'block'; });
                    this.classList.add('expanded');
                    const span = this.querySelector('[data-zh]');
                    if (span) span.textContent = currentLang === 'zh' ? '收起' : 'Collapse';
                }
                if (typeof AOS !== 'undefined') AOS.refresh();
            });
            wrap.appendChild(btn);
            container.parentElement.appendChild(wrap);
        }

        // Refresh AOS for new elements
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // ==================== LIGHTBOX ====================
    function initLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (!lightbox) return;

        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    function openLightbox(src, caption) {
        const lightbox = document.getElementById('imageLightbox');
        const img = document.getElementById('lightboxImage');
        const captionEl = document.getElementById('lightboxCaption');
        img.src = src;
        captionEl.textContent = caption || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.closeLightbox = function() {
        const lightbox = document.getElementById('imageLightbox');
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    };

})();
