document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     Navigation & Mobile Menu
     ========================================================================== */
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Sticky Navbar on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Link Highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 120)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Menu Toggle
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    const isExpanded = nav.classList.contains('active');
    menuToggle.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close Mobile Menu on Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  /* ==========================================================================
     Farm Produce Catalog & WhatsApp Order Builder
     ========================================================================== */
  // Base rates to calculate estimates (derived as average values from the given price ranges)
  const productRates = {
    matooke: 24000,   // Range: 20k to 28k
    piglets: 250000,  // Range: 200k to 800k (starting base)
    chicken: 25000,   // Range: 20k to 30k
    eggs: 11000       // Range: 10k to 12k
  };

  const productNames = {
    matooke: 'Matooke Bunch',
    piglets: 'Weaner Piglet',
    chicken: 'Live Chicken (Layers/Broilers)',
    eggs: 'Tray of Eggs'
  };

  const productUnits = {
    matooke: 'Bunch',
    piglets: 'Piglet',
    chicken: 'Bird',
    eggs: 'Tray'
  };

  const orderQuantities = {
    matooke: 0,
    piglets: 0,
    chicken: 0,
    eggs: 0
  };

  const quantityValues = document.querySelectorAll('.counter-value');
  const summaryList = document.querySelector('.summary-list');
  const summaryTotalValue = document.querySelector('.summary-total-value');
  const sendOrderBtn = document.getElementById('send-order-btn');

  // Format Helper to output: X,XXX UGX
  function formatUGX(amount) {
    return new Intl.NumberFormat('en-US').format(amount) + ' UGX';
  }

  // Update Counters and Re-render Order Summary
  function updateOrderCatalog() {
    let grandTotal = 0;
    let itemsCount = 0;
    summaryList.innerHTML = '';

    Object.keys(orderQuantities).forEach(key => {
      const quantity = orderQuantities[key];
      const countEl = document.getElementById(`${key}-count`);
      if (countEl) countEl.textContent = quantity;

      if (quantity > 0) {
        itemsCount++;
        const itemTotal = quantity * productRates[key];
        grandTotal += itemTotal;

        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
          <div>
            <strong>${productNames[key]}</strong><br>
            <small>${quantity} ${productUnits[key]}(s) &times; ${formatUGX(productRates[key])}</small>
          </div>
          <div style="display: flex; align-items: center;">
            <span>${formatUGX(itemTotal)}</span>
            <i class="fas fa-trash-alt summary-item-remove" data-product="${key}"></i>
          </div>
        `;
        summaryList.appendChild(summaryItem);
      }
    });

    if (itemsCount === 0) {
      summaryList.innerHTML = '<div class="summary-list-empty">No items selected. Add products to build your order inquiry.</div>';
      sendOrderBtn.style.opacity = '0.6';
      sendOrderBtn.style.pointerEvents = 'none';
    } else {
      sendOrderBtn.style.opacity = '1';
      sendOrderBtn.style.pointerEvents = 'auto';
    }

    summaryTotalValue.textContent = formatUGX(grandTotal);

    // Bind trash click actions
    document.querySelectorAll('.summary-item-remove').forEach(trashBtn => {
      trashBtn.addEventListener('click', (e) => {
        const productKey = e.target.getAttribute('data-product');
        orderQuantities[productKey] = 0;
        updateOrderCatalog();
      });
    });
  }

  // Bind Plus and Minus Buttons
  document.querySelectorAll('.counter-btn').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-type'); // plus or minus
      const target = button.getAttribute('data-target'); // matooke, piglets etc.

      if (type === 'plus') {
        orderQuantities[target]++;
      } else if (type === 'minus' && orderQuantities[target] > 0) {
        orderQuantities[target]--;
      }

      updateOrderCatalog();
    });
  });

  // Handle WhatsApp Order Compilation & Redirect
  sendOrderBtn.addEventListener('click', () => {
    let orderSummaryText = '*BIWOOMA FARMERS LIMITED - ORDER INQUIRY*\n\n';
    let grandTotal = 0;
    let hasItems = false;

    Object.keys(orderQuantities).forEach(key => {
      const qty = orderQuantities[key];
      if (qty > 0) {
        hasItems = true;
        const cost = qty * productRates[key];
        grandTotal += cost;
        orderSummaryText += `• *${productNames[key]}*: ${qty} ${productUnits[key]}(s) - _Est: ${formatUGX(cost)}_\n`;
      }
    });

    if (!hasItems) return;

    orderSummaryText += `\n*Estimated Total:* ${formatUGX(grandTotal)}`;
    orderSummaryText += `\n\n_Note: Prices are subject to negotiation. Please confirm availability and delivery terms._`;
    orderSummaryText += `\n\n*Contact:* +256 705 056951`;

    const encodedText = encodeURIComponent(orderSummaryText);
    const whatsappUrl = `https://wa.me/256705056951?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  });

  // Initial call to set up the empty state UI
  updateOrderCatalog();


  /* ==========================================================================
     Farm Visits (Agritourism) Booking
     ========================================================================== */
  const bookTourBtn = document.getElementById('book-tour-btn');
  const visitorCountInput = document.getElementById('tour-visitors');

  if (bookTourBtn) {
    bookTourBtn.addEventListener('click', () => {
      const visitors = visitorCountInput ? visitorCountInput.value || 1 : 1;
      const ratePerPerson = 75000;
      const totalCost = visitors * ratePerPerson;
      
      const tourMessage = `*BIWOOMA FARMERS LIMITED - FARM TOUR BOOKING*\n\n` +
                          `Hi Biwooma Farmers! I would like to book a 2-hour guided farm visit.\n\n` +
                          `• *Number of Visitors:* ${visitors} person(s)\n` +
                          `• *Estimated Cost:* ${formatUGX(totalCost)} (75,000 UGX per person)\n\n` +
                          `Please let me know the available dates and slots for scheduling. Thank you!`;
      
      const encodedTourText = encodeURIComponent(tourMessage);
      const tourWhatsappUrl = `https://wa.me/256705056951?text=${encodedTourText}`;
      window.open(tourWhatsappUrl, '_blank');
    });
  }


  /* ==========================================================================
     Image & Video Gallery Lightbox Integration
     ========================================================================== */
  // Combined Farm Gallery Data Source featuring video activities and farm photos
  const galleryItems = [
    // Live Farm Videos (vid1.mp4 - vid7.mp4)
    {
      type: 'video',
      url: 'images/vid1.mp4',
      thumbnail: 'images/gallery5.jpg',
      title: 'Preparation of Automatic Drinkers for Broilers',
      category: 'Poultry Operations',
      tagline: 'Biosecure Equipment Setup',
      description: 'Preparing and calibrating our automated nipple drinking lines in the broiler house, ensuring clean, continuous water access and zero contamination.'
    },
    {
      type: 'video',
      url: 'images/vid2.mp4',
      thumbnail: 'images/gallery2.jpg',
      title: 'Cleaning & Disinfecting Automatic Drinkers',
      category: 'Biosecurity & Hygiene',
      tagline: 'Pre-Arrival House Prep',
      description: 'Thorough cleaning and chemical disinfection of automatic drinkers in the broiler house prior to the arrival of day-old chicks to safeguard flock health.'
    },
    {
      type: 'video',
      url: 'images/vid3.mp4',
      thumbnail: 'images/gallery1.jpg',
      title: 'Fully Grown Broilers Ready for Sale',
      category: 'Broiler Production',
      tagline: 'Market-Ready Fresh Poultry',
      description: 'A look at our mature, healthy broilers raised under optimal nutrition, biosecurity, and welfare standards — now ready for customer orders and wholesale supply.'
    },
    {
      type: 'video',
      url: 'images/vid4.mp4',
      thumbnail: 'images/gallery3.jpg',
      title: 'Quality & Health Inspection of Mature Broilers',
      category: 'Quality Assurance',
      tagline: 'Standardized Flock Check',
      description: 'Routine weight, feathering, and vitality inspection of fully grown broilers to guarantee top-tier poultry meat for restaurants, hotels, and retail clients.'
    },
    {
      type: 'video',
      url: 'images/vid5.mp4',
      thumbnail: 'images/gallery3.jpg',
      title: 'IMO Method for Eco-Friendly Pig Rearing',
      category: 'Piggery & Eco-Husbandry',
      tagline: 'Odor-Free Biological System',
      description: 'Demonstrating the Indigenous Micro-Organism (IMO) deep-bedding technology for pig rearing. This natural approach eliminates foul odors, breaks down waste naturally, promotes swine health, and generates high-grade organic manure.'
    },
    {
      type: 'video',
      url: 'images/vid6.mp4',
      thumbnail: 'images/gallery4.jpg',
      title: 'IMO Bedding Maintenance & Health Benefits',
      category: 'Piggery & Eco-Husbandry',
      tagline: 'Sustainable Swine Management',
      description: 'A closer look at our IMO pig bedding system in active operation. Highlighting bed temperature regulation, stress reduction in pigs, and sustainable waste recycling for commercial pig farming.'
    },
    {
      type: 'video',
      url: 'images/vid7.mp4',
      thumbnail: 'images/gallery2.jpg',
      title: 'Flock Nutrition: Feeding Chicks with Quantum Feeds',
      category: 'Poultry Operations',
      tagline: 'Premium Balanced Nutrition',
      description: 'Observing active, thriving young chicks fed with high-protein formula supplied by Quantum Feeds. Ensuring rapid early growth, strong immunity, and optimal feed conversion rates.'
    },
    // Farm Photos
    {
      type: 'photo',
      url: 'images/gallery1.jpg',
      thumbnail: 'images/gallery1.jpg',
      title: 'PoultryTechUganda Demonstration Facility',
      category: 'Grand Opening',
      description: 'Modern poultry infrastructure developed in partnership to promote commercial farming standards in Wakiso.'
    },
    {
      type: 'photo',
      url: 'images/gallery2.jpg',
      thumbnail: 'images/gallery2.jpg',
      title: 'Healthy Layers Feeding Unit',
      category: 'Poultry Division',
      description: 'Bio-protected layer flock housed in climate-managed pens for maximum egg yield.'
    },
    {
      type: 'photo',
      url: 'images/gallery3.jpg',
      thumbnail: 'images/gallery3.jpg',
      title: 'Practical Farming Instruction Session',
      category: 'Training Center',
      description: 'Hands-on agricultural training for local farmers and agricultural students visiting Biwooma Farmers.'
    },
    {
      type: 'photo',
      url: 'images/gallery4.jpg',
      thumbnail: 'images/gallery4.jpg',
      title: 'Farming Manual Publication Launch',
      category: 'Training Center',
      description: 'Unveiling educational literature designed to empower smallholder and commercial poultry producers across Uganda.'
    },
    {
      type: 'photo',
      url: 'images/gallery5.jpg',
      thumbnail: 'images/gallery5.jpg',
      title: 'Automated Bio-Clean Water Systems',
      category: 'Poultry Division',
      description: 'Automated nipple drinking loops ensuring zero-contamination water delivery for flock health.'
    }
  ];

  const galleryGrid = document.querySelector('.gallery-grid');
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.querySelector('.lightbox-close');

  function renderGallery(filter = 'all') {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const filteredItems = galleryItems.filter(item => {
      if (filter === 'all') return true;
      return item.type === filter;
    });

    filteredItems.forEach(item => {
      const card = document.createElement('div');
      card.className = `gallery-item ${item.type === 'video' ? 'video-item' : ''}`;
      
      const thumbUrl = item.thumbnail || item.url;
      let mediaHTML = `<img src="${thumbUrl}" alt="${item.title}" loading="lazy">`;
      if (item.type === 'video') {
        mediaHTML += `<div class="video-play-badge"><i class="fas fa-play"></i></div>`;
      }

      card.innerHTML = `
        ${mediaHTML}
        <div class="gallery-overlay">
          <div class="gallery-info">
            <p>${item.category} ${item.type === 'video' ? '&bull; Watch Video' : ''}</p>
            <h4>${item.title}</h4>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(item);
      });

      galleryGrid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (!lightbox) return;

    const badgeText = item.tagline ? `${item.category} • ${item.tagline}` : `${item.category} • ${item.type === 'video' ? 'Video' : 'Photo'}`;
    if (lightboxCategory) lightboxCategory.textContent = badgeText;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = item.description || '';

    if (item.type === 'video') {
      if (lightboxImg) lightboxImg.style.display = 'none';
      if (lightboxVideo) {
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = item.url;
        lightboxVideo.play().catch(() => {});
      }
    } else {
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
        lightboxVideo.src = '';
      }
      if (lightboxImg) {
        lightboxImg.style.display = 'block';
        lightboxImg.src = item.url;
        lightboxImg.alt = item.title;
      }
    }

    lightbox.style.display = 'flex';
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }
    lightbox.style.display = 'none';
  }

  // Filter Buttons Click Listeners
  if (galleryFilterBtns) {
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterVal = btn.getAttribute('data-filter');
        renderGallery(filterVal);
      });
    });
  }

  // Close Lightbox triggers
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Initial render
  renderGallery('all');


  /* ==========================================================================
     Testimonials Slider
     ========================================================================== */
  const track = document.querySelector('.testimonial-track');
  const dotsContainer = document.querySelector('.slider-dots');
  const slides = Array.from(document.querySelectorAll('.testimonial-card'));
  
  if (track && slides.length > 0) {
    let activeIndex = 0;
    let slideInterval;

    // Generate Dot Indicators dynamically
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(document.querySelectorAll('.slider-dot'));

    function goToSlide(index) {
      activeIndex = index;
      track.style.transform = `translateX(-${activeIndex * 100}%)`;
      
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
      });
    }

    function nextSlide() {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= slides.length) {
        nextIndex = 0;
      }
      goToSlide(nextIndex);
    }

    function startAutoplay() {
      slideInterval = setInterval(nextSlide, 6000);
    }

    function resetAutoplay() {
      clearInterval(slideInterval);
      startAutoplay();
    }

    // Start sliding carousel
    startAutoplay();

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(slideInterval));
    track.addEventListener('mouseleave', startAutoplay);
  }


  /* ==========================================================================
     Inquiry Contact Form Processing
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');

  if (contactForm) {
    contactForm.addEventListener('submit', function() {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Inquiry...';
      }
    });
  }

});
