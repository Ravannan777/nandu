const snackbar = document.getElementById('snackbar');

function showSnackbar(message) {
  if (!snackbar) return;
  snackbar.textContent = message;
  snackbar.classList.add('show');
  clearTimeout(window.snackbarTimer);
  window.snackbarTimer = setTimeout(() => {
    snackbar.classList.remove('show');
  }, 2200);
}

// Smooth in-page anchor scrolling fallback for browsers that need script support.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const audioSource = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
let backgroundAudio = document.getElementById('backgroundAudio');
const storedAudioPaused = localStorage.getItem('shopEaseAudioPaused') === 'true';
const audioToggleBtn = document.getElementById('audioToggleBtn');

if (!backgroundAudio) {
  backgroundAudio = document.createElement('audio');
  backgroundAudio.id = 'backgroundAudio';
  backgroundAudio.src = audioSource;
  backgroundAudio.preload = 'auto';
  backgroundAudio.autoplay = !storedAudioPaused;
  backgroundAudio.loop = true;
  backgroundAudio.playsInline = true;
  backgroundAudio.style.display = 'none';
  document.body.appendChild(backgroundAudio);
}
if (backgroundAudio) {
  backgroundAudio.volume = 0.35;
  backgroundAudio.muted = false;

  const isAudioPaused = () => storedAudioPaused || backgroundAudio.paused;
  const setToggleLabel = () => {
    if (!audioToggleBtn) return;
    audioToggleBtn.textContent = isAudioPaused() ? 'Play music' : 'Pause music';
  };

  const playBackgroundAudio = () => {
    return backgroundAudio.play().then(() => {
      localStorage.setItem('shopEaseAudioPaused', 'false');
      setToggleLabel();
    }).catch((error) => {
      console.warn('Background audio playback blocked by browser.', error);
      showSnackbar('Tap anywhere to start Dolby Atmos audio.');
      document.body.addEventListener('click', function handleFirstInteraction() {
        backgroundAudio.play().catch(() => {});
      }, { once: true });
    });
  };

  setToggleLabel();

  if (!storedAudioPaused) {
    playBackgroundAudio();
  } else {
    backgroundAudio.pause();
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (backgroundAudio.paused) {
        playBackgroundAudio();
      } else {
        backgroundAudio.pause();
        localStorage.setItem('shopEaseAudioPaused', 'true');
        setToggleLabel();
        showSnackbar('Music paused.');
      }
    });
  }
}

const header = document.querySelector('.site-header');
const compactHeaderThreshold = 100;
if (header) {
  const updateHeaderState = () => {
    if (window.scrollY > compactHeaderThreshold) {
      header.classList.add('header-compact');
    } else {
      header.classList.remove('header-compact');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState);
}

// Ensure order links use the actual product image shown on the products page.
const productCards = document.querySelectorAll('.product-card[href*="order.html"]');
productCards.forEach((card) => {
  const cardImage = card.querySelector('img');
  if (!cardImage) return;

  try {
    const orderUrl = new URL(card.href, window.location.href);
    orderUrl.searchParams.set('image', cardImage.src);
    card.href = orderUrl.pathname + orderUrl.search;
  } catch (error) {
    // Ignore URL construction issues and keep the original href.
  }
});

const urlParams = new URLSearchParams(window.location.search);
const selectedProduct = urlParams.get('product');
const selectedPrice = urlParams.get('price');

const orderProductInput = document.getElementById('orderProduct');
const selectedProductText = document.getElementById('selectedProduct');
const selectedProductImage = document.getElementById('selectedProductImage');
const selectedImageSrc = urlParams.get('image');
if (orderProductInput) {
  orderProductInput.value = selectedProduct ? `${selectedProduct} ${selectedPrice ? `- $${selectedPrice}` : ''}` : 'No product selected';
}
if (selectedProductText) {
  selectedProductText.textContent = selectedProduct ? `${selectedProduct} ${selectedPrice ? `($${selectedPrice})` : ''}` : 'No product selected. Please go back to products and choose an item.';
}
const orderHeroImage = document.querySelector('.hero-section .hero-image img');
if (selectedProductImage) {
  if (selectedImageSrc) {
    selectedProductImage.src = selectedImageSrc;
    selectedProductImage.alt = selectedProduct ? selectedProduct : 'Selected product';
    selectedProductImage.style.display = 'block';
    if (orderHeroImage) {
      orderHeroImage.src = selectedImageSrc;
      orderHeroImage.alt = selectedProduct ? selectedProduct : 'Selected product';
    }
  } else {
    selectedProductImage.style.display = 'none';
  }
}

const contactForm = document.querySelector('.contact-form');
const orderForm = document.querySelector('.order-form');

function getSavedOrders() {
  try {
    return JSON.parse(localStorage.getItem('shopEaseOrders') || '[]');
  } catch (error) {
    return [];
  }
}

function saveOrder(order) {
  const orders = getSavedOrders();
  orders.unshift(order);
  localStorage.setItem('shopEaseOrders', JSON.stringify(orders));
}

function formatDateLabel(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function renderOrderHistory() {
  const orders = getSavedOrders();
  const orderHistoryList = document.getElementById('orderHistoryList');
  const latestOrderCard = document.getElementById('latestOrderCard');

  if (latestOrderCard) {
    if (orders.length === 0) {
      latestOrderCard.innerHTML = `
        <article class="card">
          <h3>No orders yet</h3>
          <p>Complete a purchase first and your latest order will appear here.</p>
          <a href="products.html" class="btn-secondary">Start shopping</a>
        </article>`;
    } else {
      const latest = orders[0];
      latestOrderCard.innerHTML = `
        <article class="card order-selected-card">
          <h3>Latest order</h3>
          ${latest.image ? `<img src="${latest.image}" alt="${latest.product}" />` : ''}
          <p><strong>${latest.product}</strong></p>
          <p>${latest.price ? `<strong>Price:</strong> $${latest.price}` : ''}</p>
          <p><strong>Name:</strong> ${latest.name}</p>
          <p><strong>Payment:</strong> ${latest.payment}</p>
          <p class="muted">${formatDateLabel(latest.timestamp)}</p>
        </article>`;
    }
  }

  if (orderHistoryList) {
    if (orders.length === 0) {
      orderHistoryList.innerHTML = `
        <article class="card">
          <h3>No order history</h3>
          <p>Once you place an order, it will appear here so you can review it again.</p>
          <a href="products.html" class="btn-secondary">Start shopping</a>
        </article>`;
    } else {
      orderHistoryList.innerHTML = orders
        .map((order) => `
          <article class="card order-selected-card">
            <h3>${order.product}</h3>
            ${order.image ? `<img src="${order.image}" alt="${order.product}" />` : ''}
            <p><strong>Price:</strong> $${order.price}</p>
            <p><strong>Name:</strong> ${order.name}</p>
            <p><strong>Phone:</strong> ${order.phone}</p>
            <p><strong>Payment:</strong> ${order.payment}</p>
            <p class="muted">${formatDateLabel(order.timestamp)}</p>
          </article>
        `)
        .join('');
    }
  }
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showSnackbar('Thank you! We will get back to you soon.');
    event.target.reset();
  });
}

if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const payment = document.getElementById('paymentMethod').value;
    if (!name || !phone || !address || !payment) {
      showSnackbar('Please fill all order details.');
      return;
    }

    const orderData = {
      product: selectedProduct || 'Unspecified product',
      price: selectedPrice || '',
      image: selectedImageSrc || '',
      name,
      phone,
      address,
      payment,
      timestamp: Date.now(),
    };

    saveOrder(orderData);
    window.location.href = 'orders.html?success=true';
  });
}

if (document.getElementById('orderHistoryList') || document.getElementById('latestOrderCard')) {
  renderOrderHistory();
}

if (urlParams.get('success') === 'true') {
  showSnackbar('Order confirmed! You can review it on this page.');
}
