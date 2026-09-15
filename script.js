
const SPA_DATA = {
  categories: [
    { id: "all", name: "All Dishes", icon: "fa-utensils" },
    { id: "pizza", name: "Pizza", icon: "fa-pizza-slice" },
    { id: "burger", name: "Burgers", icon: "fa-burger" },
    { id: "biryani", name: "Biryani", icon: "fa-bowl-rice" },
    { id: "dessert", name: "Desserts", icon: "fa-cake-candles" },
    { id: "pasta", name: "Pasta", icon: "fa-plate-wheat" },
    { id: "drink", name: "Drinks", icon: "fa-glass-water" },
    { id: "salads", name: "Salads", icon: "fa-bowl-food" }
  ],

  dishes: [
    {
      id: "dish-1",
      name: "Truffle Pizza Margherita",
      category: "pizza",
      price: 299,
      rating: 4.9,
      tags: "pizza fast food",
      prepTime: "20-25 mins",
      isVeg: true,
      image: "pizza.jpg",
      description: "Crispy hand-stretched sourdough crust topped with San Marzano tomato sauce, fresh buffalo mozzarella, aromatic basil, and black truffle drizzle."
    },
    {
      id: "dish-2",
      name: "Smoky Double Angus Burger",
      category: "burger",
      price: 199,
      rating: 4.8,
      tags: "burger fast food",
      prepTime: "15-20 mins",
      isVeg: false,
      image: "burger.webp",
      description: "Two prime grilled patties layered with aged smoked cheddar, crisp romaine lettuce, caramelized shallots, and house secret burger sauce in a brioche bun."
    },
    {
      id: "dish-3",
      name: "Royal Hyderabadi Dum Biryani",
      category: "biryani",
      price: 249,
      rating: 4.9,
      tags: "biryani",
      prepTime: "25-30 mins",
      isVeg: false,
      image: "BIRYANI.jpeg",
      description: "Slow-cooked saffron basmati rice layered with tender marinated chicken, golden caramelized onions, mint, and secret royal Mughlai spices."
    },
    {
      id: "dish-4",
      name: "Belgian Dark Chocolate Fudge Cake",
      category: "dessert",
      price: 149,
      rating: 4.7,
      tags: "dessert cake",
      prepTime: "10-15 mins",
      isVeg: true,
      image: "cake.jpg",
      description: "Decadent multi-layered Belgian chocolate sponge coated in warm glossy fudge ganache and garnished with fresh seasonal forest berries."
    },
    {
      id: "dish-5",
      name: "Penne Alfredo al Tartufo",
      category: "pasta",
      price: 219,
      rating: 4.7,
      tags: "pasta salads fast food",
      prepTime: "18-22 mins",
      isVeg: true,
      image: "pasta.jpg",
      description: "Al dente Italian penne tossed in rich parmesan cream sauce with sauteed garlic mushrooms, cracked pepper, and fresh Italian herbs."
    },
    {
      id: "dish-6",
      name: "The Grand Banquet Platter",
      category: "biryani",
      price: 349,
      rating: 4.9,
      tags: "biryani drink dinner",
      prepTime: "30-35 mins",
      isVeg: false,
      image: "RESTAURANT.jpeg",
      description: "Chef's gourmet sharing platter featuring royal chicken dum biryani, butter naan, chicken tikka, and refreshing mocktail drinks."
    }
  ]
};
class AppStore {
  constructor() {
    this.cart = this.loadCart();
    this.activeOrder = this.loadOrder();
    this.activeCategory = "all";
    this.searchQuery = "";
    this.sortBy = "default";
  }

  loadCart() {
    try {
      const stored = localStorage.getItem("foodie_spa_cart");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem("foodie_spa_cart", JSON.stringify(this.cart));
    } catch (e) {}
    this.updateCartBadge();
  }

  loadOrder() {
    try {
      const stored = localStorage.getItem("foodie_spa_order");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  saveOrder(order) {
    this.activeOrder = order;
    try {
      localStorage.setItem("foodie_spa_order", JSON.stringify(order));
    } catch (e) {}
  }

  addToCart(dishId, qty = 1) {
    const dish = SPA_DATA.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = this.cart.find(item => item.id === dishId);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: qty
      });
    }
    this.saveCart();
    showToast(`${dish.name} added to cart!`);
  }

  updateQuantity(dishId, delta) {
    const item = this.cart.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(dishId);
    } else {
      this.saveCart();
    }
  }

  removeFromCart(dishId) {
    const index = this.cart.findIndex(i => i.id === dishId);
    if (index !== -1) {
      const removed = this.cart.splice(index, 1)[0];
      this.saveCart();
      showToast(`Removed ${removed.name} from cart.`);
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartTotalCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  updateCartBadge() {
    const badge = document.getElementById("cartCount");
    const cartBtn = document.getElementById("cartBtn");
    const totalCount = this.getCartTotalCount();

    if (badge) badge.textContent = totalCount;
    if (cartBtn) cartBtn.setAttribute("aria-label", `Shopping Cart, ${totalCount} items`);
  }
}

const store = new AppStore();

class SPAManager {
  constructor() {
    this.appContainer = document.getElementById("app");
    this.routeAnnouncer = document.getElementById("routeAnnouncer");
    
    // Route mappings
    this.routes = {
      "#/": { render: () => this.renderHome(), title: "Home" },
      "#/menu": { render: () => this.renderMenu(), title: "Explore Menu" },
      "#/cart": { render: () => this.renderCart(), title: "Your Cart" },
      "#/tracking": { render: () => this.renderTracking(), title: "Live Order Tracking" },
      "#/about": { render: () => this.renderAbout(), title: "About Us" },
      "#/contact": { render: () => this.renderContact(), title: "Contact Us" }
    };

    this.init();
  }

  init() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-link]");
      if (link) {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#/")) {
          e.preventDefault();
          this.navigateTo(href);
        }
      }
    });

    window.addEventListener("hashchange", () => this.handleRoute());
    window.addEventListener("popstate", () => this.handleRoute());

    if (!window.location.hash || window.location.hash === "#") {
      window.location.hash = "#/";
    } else {
      this.handleRoute();
    }

    store.updateCartBadge();
    this.setupMobileMenu();
    this.setupNavbarScroll();
    this.setupDishModal();
  }

  navigateTo(routeHash) {
    if (window.location.hash === routeHash) {
      this.handleRoute();
    } else {
      window.location.hash = routeHash;
    }
  }

  handleRoute() {
    const rawHash = window.location.hash || "#/";
    
    const currentPath = rawHash.split("?")[0];
    const route = this.routes[currentPath];

    
    this.updateActiveNavLinks(currentPath);

    if (route) {
      document.title = `Foodie SPA — ${route.title}`;
      if (this.routeAnnouncer) {
        this.routeAnnouncer.textContent = `Navigated to ${route.title}`;
      }
      route.render();
    } else {
      document.title = "Foodie SPA — 404 Not Found";
      if (this.routeAnnouncer) {
        this.routeAnnouncer.textContent = "Page not found";
      }
      this.renderNotFound();
    }

    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateActiveNavLinks(path) {
    const navLinks = document.querySelectorAll(".nav-link, #cartBtn");
    navLinks.forEach(link => {
      const routeAttr = link.getAttribute("data-route") || link.getAttribute("href");
      if (routeAttr === path) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });

    // Close mobile nav menu if open
    const menu = document.getElementById("navMenu");
    const toggleBtn = document.getElementById("menuToggle");
    if (menu && menu.classList.contains("open")) {
      menu.classList.remove("open");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    }
  }


  renderHome() {
    const featuredDishes = SPA_DATA.dishes.slice(0, 6);

    const html = `
      <div class="spa-view">
        <section class="hero" aria-labelledby="heroTitle">
          <div class="hero-text">
            <h1 id="heroTitle">Delicious Food!!<br>
               <span> Delivered Fast..</span>
            </h1>
            <p>Experience our interactive Single Page Application. Order your favourite meals with instant routing, live tracking, and zero page reloads.</p>
            
            <div class="hero-cta-group">
                <a href="#/menu" class="cta-primary-btn" data-link>
                    <i class="fa-solid fa-utensils" aria-hidden="true"></i> Explore Full Menu
                </a>
                <a href="#/tracking" class="cta-secondary-btn" data-link>
                    <i class="fa-solid fa-location-dot" aria-hidden="true"></i> Track Live Order
                </a>
            </div>

            <form class="search-box" role="search" aria-label="Find restaurants and dishes" onsubmit="event.preventDefault(); spa.handleHomeSearch();">
                <div class="input-wrapper">
                    <label for="locationInput" class="sr-only">Delivery Location</label>
                    <input type="text" id="locationInput" placeholder="Enter your delivery location" autocomplete="street-address">
                </div>
                <div class="input-wrapper">
                    <label for="homeSearchInput" class="sr-only">Search food or restaurant</label>
                    <input type="text" id="homeSearchInput" placeholder="Search pizza, burger, biryani..." autocomplete="off">
                </div>
                <button type="submit" id="searchBtn" aria-label="Search restaurants">Search</button>
            </form>
            <p class="search-feedback" id="searchFeedback" role="status" aria-live="polite" aria-atomic="true"></p>
          </div>
          <div class="hero-image">
            <img src="pasta.jpg" 
                 alt="Freshly cooked Italian pasta with herbs and tomatoes" 
                 width="400" 
                 height="400"
                 fetchpriority="high"
                 decoding="async">
          </div>
        </section>

        <!-- Categories Section -->
        <section class="categories" id="categories" aria-labelledby="categoriesHeading">
            <h2 id="categoriesHeading">Popular Categories :</h2>
            <div class="category-container" id="categoryContainer" role="region" aria-label="Food category filters">
                ${SPA_DATA.categories.filter(c => c.id !== "all").map(cat => `
                  <button type="button" class="card" data-category="${cat.id}" onclick="spa.filterFromHome('${cat.id}')" aria-label="Filter by ${cat.name}">
                      <i class="fa-solid ${cat.icon}" aria-hidden="true"></i>
                      <p>${cat.name}</p>
                  </button>
                `).join("")}
            </div>
        </section>  

        <!-- Popular Dishes Section -->
        <section class="restaurants" id="restaurants" aria-labelledby="restaurantsHeading">
            <div class="section-header-flex">
                <h2 id="restaurantsHeading">Popular Restaurants & Dishes :</h2>
                <a href="#/menu" class="view-all-link" data-link>View Full Menu <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </div>
            
            <div class="restaurant-container">
                ${featuredDishes.map(dish => this.generateDishCardHTML(dish)).join("")}
            </div>
        </section>

        <!-- Features / Why Choose Us -->
        <section class="features-section" id="about" aria-labelledby="featuresHeading">
            <h2 id="featuresHeading">Why Choose Foodie SPA?</h2>
            <div class="features-container">
                <div class="feature-box">
                    <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                    <h3>Zero Full-Page Reloads</h3>
                    <p>Instant client-side routing engineered with the browser History API & hash navigation.</p>
                </div>
                <div class="feature-box">
                    <i class="fa-solid fa-truck-fast" aria-hidden="true"></i>
                    <h3>30-Min Fast Delivery</h3>
                    <p>Live interactive order tracking with real-time status updates and progress stepper.</p>
                </div>
                <div class="feature-box">
                    <i class="fa-solid fa-award" aria-hidden="true"></i>
                    <h3>Hygiene & Quality Assured</h3>
                    <p>Every restaurant partner follows rigorous hygiene protocols and safety certifications.</p>
                </div>
            </div>
        </section>
      </div>
    `;

    this.appContainer.innerHTML = html;
    this.renderStarRatings();
  }

  renderMenu() {
    const categoriesHTML = SPA_DATA.categories.map(cat => `
      <button type="button" class="filter-pill ${store.activeCategory === cat.id ? 'active' : ''}" 
              onclick="spa.setMenuCategory('${cat.id}')" 
              aria-pressed="${store.activeCategory === cat.id}">
        <i class="fa-solid ${cat.icon}" aria-hidden="true"></i> ${cat.name}
      </button>
    `).join("");

    const filteredDishes = this.getFilteredDishes();

    const html = `
      <div class="spa-view">
        <div class="page-header-banner">
          <h1>Our Delicious Menu</h1>
          <p>Explore chef-crafted artisan meals prepared fresh on every order. Filter by category, search favorites, or sort by price and ratings.</p>
        </div>

        <div class="menu-controls">
          <div class="filter-pills-row">
            ${categoriesHTML}
          </div>

          <div class="menu-sort-wrapper">
            <label for="sortSelect">Sort By:</label>
            <select id="sortSelect" class="sort-select" onchange="spa.setSortBy(this.value)">
              <option value="default" ${store.sortBy === 'default' ? 'selected' : ''}>Recommended</option>
              <option value="price-low" ${store.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-high" ${store.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${store.sortBy === 'rating' ? 'selected' : ''}>Top Rated</option>
            </select>
          </div>
        </div>

        <section class="restaurants" style="background:transparent; padding-top:0;">
          <div class="restaurant-container" id="menuDishesContainer">
            ${filteredDishes.length > 0 
              ? filteredDishes.map(dish => this.generateDishCardHTML(dish)).join("") 
              : `<p class="no-results" style="grid-column: 1/-1;">No dishes found matching your selection.</p>`}
          </div>
        </section>
      </div>
    `;

    this.appContainer.innerHTML = html;
    this.renderStarRatings();
  }

  getFilteredDishes() {
    let list = [...SPA_DATA.dishes];

  
    if (store.activeCategory && store.activeCategory !== "all") {
      list = list.filter(d => d.category === store.activeCategory);
    }

    if (store.searchQuery.trim() !== "") {
      const q = store.searchQuery.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.tags.toLowerCase().includes(q));
    }

    
    if (store.sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (store.sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (store.sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }

  setMenuCategory(catId) {
    store.activeCategory = catId;
    this.renderMenu();
  }

  setSortBy(val) {
    store.sortBy = val;
    this.renderMenu();
  }

  filterFromHome(catId) {
    store.activeCategory = catId;
    this.navigateTo("#/menu");
  }

  handleHomeSearch() {
    const input = document.getElementById("homeSearchInput");
    if (input) {
      store.searchQuery = input.value.trim();
      this.navigateTo("#/menu");
    }
  }

  renderCart() {
    const cart = store.cart;
    const subtotal = store.getCartSubtotal();
    const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 40;
    const taxes = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + deliveryFee + taxes;

    if (cart.length === 0) {
      this.appContainer.innerHTML = `
        <div class="spa-view cart-view-container">
          <div class="page-header-banner">
            <h1>Your Shopping Cart</h1>
            <p>Review selected delicacies and proceed with fast delivery checkout.</p>
          </div>
          <div class="cart-items-card empty-cart-state">
            <i class="fa-solid fa-cart-arrow-down" aria-hidden="true"></i>
            <h3>Your cart is empty!</h3>
            <p>Explore our wide selection of delicious dishes and add your favorites.</p>
            <a href="#/menu" class="cta-primary-btn" data-link>Explore Our Menu</a>
          </div>
        </div>
      `;
      return;
    }

    const itemsHTML = cart.map(item => `
      <div class="cart-table-row">
        <div class="cart-dish-info">
          <img src="${item.image}" alt="${item.name}" class="cart-dish-thumb">
          <div>
            <div class="cart-dish-name">${item.name}</div>
            <div class="cart-dish-unit-price">₹${item.price} each</div>
          </div>
        </div>

        <div class="cart-qty-controls">
          <button type="button" class="qty-btn" onclick="spa.updateCartQty('${item.id}', -1)" aria-label="Decrease quantity of ${item.name}">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button type="button" class="qty-btn" onclick="spa.updateCartQty('${item.id}', 1)" aria-label="Increase quantity of ${item.name}">+</button>
        </div>

        <div class="cart-dish-total">₹${item.price * item.quantity}</div>

        <div>
          <button type="button" class="cart-delete-btn" onclick="spa.removeFromCart('${item.id}')" aria-label="Remove ${item.name} from cart">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `).join("");

    const html = `
      <div class="spa-view cart-view-container">
        <div class="page-header-banner">
          <h1>Your Shopping Cart</h1>
          <p>Review items, adjust quantities, and place your order with dynamic instant checkout.</p>
        </div>

        <div class="cart-layout-grid">
          <div class="cart-items-card">
            <div class="cart-table-header">
              <span>Dish Item</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span></span>
            </div>
            ${itemsHTML}
          </div>

          <div class="order-summary-box">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Item Subtotal:</span>
              <span>₹${subtotal}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee:</span>
              <span>${deliveryFee === 0 ? '<strong class="free-delivery-badge">FREE</strong>' : '₹' + deliveryFee}</span>
            </div>
            <div class="summary-row">
              <span>Taxes (5% GST):</span>
              <span>₹${taxes}</span>
            </div>
            <div class="summary-row total-row">
              <span>Grand Total:</span>
              <span>₹${grandTotal}</span>
            </div>

            <button type="button" class="checkout-action-btn" onclick="spa.handleCheckout(${grandTotal})">
              Proceed to Place Order &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    this.appContainer.innerHTML = html;
  }

  updateCartQty(dishId, delta) {
    store.updateQuantity(dishId, delta);
    this.renderCart();
  }

  removeFromCart(dishId) {
    store.removeFromCart(dishId);
    this.renderCart();
  }

  handleCheckout(totalAmount) {
    const orderId = "FD-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId: orderId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: totalAmount,
      statusStep: 2, 
      etaMinutes: 24,
      items: [...store.cart]
    };

    store.saveOrder(newOrder);
    store.clearCart();

    showToast("Order placed successfully! Redirecting to live tracking... 🎉");
    setTimeout(() => {
      this.navigateTo("#/tracking");
    }, 1200);
  }

  renderTracking() {
    let order = store.activeOrder;

   
    if (!order) {
      order = {
        orderId: "FD-849201",
        time: "Just now",
        total: 448,
        statusStep: 2, 
        etaMinutes: 22,
        items: [
          { name: "Truffle Pizza Margherita", quantity: 1, price: 299 },
          { name: "Belgian Dark Chocolate Fudge Cake", quantity: 1, price: 149 }
        ]
      };
      store.saveOrder(order);
    }

    const steps = [
      { num: 1, label: "Order Confirmed", icon: "fa-receipt" },
      { num: 2, label: "In The Kitchen", icon: "fa-fire-burner" },
      { num: 3, label: "Out for Delivery", icon: "fa-motorcycle" },
      { num: 4, label: "Delivered", icon: "fa-house-circle-check" }
    ];

    const stepNodesHTML = steps.map(s => {
      let statusClass = "";
      if (s.num < order.statusStep) statusClass = "completed";
      else if (s.num === order.statusStep) statusClass = "active";

      return `
        <div class="step-node ${statusClass}">
          <div class="step-circle">
            <i class="fa-solid ${s.num < order.statusStep ? 'fa-check' : s.icon}" aria-hidden="true"></i>
          </div>
          <span class="step-label">${s.label}</span>
        </div>
      `;
    }).join("");

    const progressWidthPercent = ((order.statusStep - 1) / (steps.length - 1)) * 100;

    const html = `
      <div class="spa-view tracking-view-container">
        <div class="page-header-banner">
          <h1>Live Order Tracking</h1>
          <p>Real-time delivery simulation with GPS dispatcher updates and status progression.</p>
        </div>

        <div class="tracking-card">
          <div class="tracking-header">
            <div>
              <span class="order-id-badge">ORDER ${order.orderId}</span>
              <p style="margin-top:6px; color:var(--text-muted);">Placed at: ${order.time}</p>
            </div>
            <div style="text-align:right;">
              <span style="font-size:13px; color:var(--text-muted); display:block;">ESTIMATED ARRIVAL</span>
              <span class="eta-highlight" id="etaCountdown">${order.etaMinutes} mins</span>
            </div>
          </div>

          <div class="stepper-progress">
            <div class="stepper-progress-bar" style="width: ${progressWidthPercent}%;"></div>
            ${stepNodesHTML}
          </div>

          <div class="delivery-partner-card">
            <div class="rider-avatar">
              <i class="fa-solid fa-person-biking" aria-hidden="true"></i>
            </div>
            <div style="flex:1;">
              <h4 style="margin-bottom:2px;">Rajesh Kumar (Delivery Partner)</h4>
              <p style="color:var(--text-muted); font-size:13px;">Hygiene verified & vaccinated • Assigned Bike 42</p>
            </div>
            <button type="button" class="cta-secondary-btn" onclick="showToast('Calling driver: +91 98765 43210 📞')" style="padding:8px 16px; font-size:13px;">
              <i class="fa-solid fa-phone" aria-hidden="true"></i> Call Driver
            </button>
          </div>
        </div>

        <div style="text-align:center; margin-top:20px;">
          <a href="#/menu" class="cta-primary-btn" data-link>Order More Food</a>
        </div>
      </div>
    `;

    this.appContainer.innerHTML = html;
  }

  renderAbout() {
    this.appContainer.innerHTML = `
      <div class="spa-view">
        <div class="page-header-banner">
          <h1>About Foodie Kitchens</h1>
          <p>Crafting culinary delight with hyper-local delivery, farm-fresh produce, and master chefs.</p>
        </div>

        <section class="features-section" style="padding-top:0;">
          <div class="features-container">
            <div class="feature-box">
              <i class="fa-solid fa-seedling" aria-hidden="true"></i>
              <h3>100% Fresh Produce</h3>
              <p>Locally sourced fresh organic ingredients delivered directly from verified farm cooperatives.</p>
            </div>
            <div class="feature-box">
              <i class="fa-solid fa-kitchen-set" aria-hidden="true"></i>
              <h3>Certified Master Chefs</h3>
              <p>Every dish is perfected under master culinary guidance with authentic spice recipes.</p>
            </div>
            <div class="feature-box">
              <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
              <h3>Safety & Temperature Control</h3>
              <p>State-of-the-art thermal delivery bags ensuring hot piping meals at your doorstep.</p>
            </div>
          </div>
        </section>

        <section style="padding: 0 6% 60px; max-width:850px; margin:0 auto; text-align:center;">
          <h2 style="margin-bottom:15px;">Our Single Page Application Vision</h2>
          <p style="color:var(--text-muted); line-height:1.8; font-size:16px;">
            Foodie SPA is designed to give customers a native-app-like web experience. Without ever refreshing the page, users can navigate effortlessly across menu items, manage their cart, track real-time orders, and explore chef stories.
          </p>
          <div style="margin-top:25px;">
            <a href="#/menu" class="cta-primary-btn" data-link>Discover Today's Menu</a>
          </div>
        </section>
      </div>
    `;
  }

  renderContact() {
    this.appContainer.innerHTML = `
      <div class="spa-view contact-container">
        <div class="page-header-banner">
          <h1>Contact Customer Support</h1>
          <p>Have questions, feedback, or a partnership inquiry? Drop us a message below.</p>
        </div>

        <div class="contact-form-card">
          <form onsubmit="event.preventDefault(); spa.handleContactSubmit();">
            <div class="form-group">
              <label for="contactName">Your Name</label>
              <input type="text" id="contactName" class="form-control" placeholder="Enter your full name" required>
            </div>

            <div class="form-group">
              <label for="contactEmail">Email Address</label>
              <input type="email" id="contactEmail" class="form-control" placeholder="name@example.com" required>
            </div>

            <div class="form-group">
              <label for="contactSubject">Subject</label>
              <input type="text" id="contactSubject" class="form-control" placeholder="Order inquiry, feedback, etc." required>
            </div>

            <div class="form-group">
              <label for="contactMessage">Message</label>
              <textarea id="contactMessage" class="form-control" placeholder="How can our support team assist you today?" required></textarea>
            </div>

            <button type="submit" class="cta-primary-btn" style="width:100%; justify-content:center;">
              Send Message
            </button>
          </form>
        </div>
      </div>
    `;
  }

  handleContactSubmit() {
    showToast("Thank you! Your message has been received. Our team will contact you shortly. ✉️");
    setTimeout(() => {
      this.navigateTo("#/");
    }, 1500);
  }

  renderNotFound() {
    this.appContainer.innerHTML = `
      <div class="spa-view not-found-view">
        <div class="error-code">404</div>
        <h2>Oops! Page Not Found</h2>
        <p>The route you are looking for does not exist or has been moved within our Single Page Application.</p>
        <a href="#/" class="cta-primary-btn" data-link>
          <i class="fa-solid fa-house" aria-hidden="true"></i> Return to Home
        </a>
      </div>
    `;
  }


  generateDishCardHTML(dish) {
    return `
      <article class="restaurant-card reveal" data-dish-id="${dish.id}">
        <div style="position:relative; cursor:pointer;" onclick="spa.openModal('${dish.id}')">
          <img src="${dish.image}" 
               alt="${dish.name}" 
               width="300" 
               height="200" 
               loading="lazy" 
               decoding="async">
          <span style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.7); color:#fff; font-size:11px; font-weight:700; padding:3px 8px; border-radius:4px;">
            <i class="fa-solid fa-clock" aria-hidden="true"></i> ${dish.prepTime}
          </span>
        </div>
        <h3 onclick="spa.openModal('${dish.id}')" style="cursor:pointer;">${dish.name}</h3>
        <p>${dish.description.substring(0, 50)}...</p>
        <div class="rating" data-rating="${dish.rating}" aria-label="Rating: ${dish.rating} out of 5 stars"></div>
        <div class="card-footer">
          <span class="price" aria-label="Price: ${dish.price} rupees">₹${dish.price}</span>
          <button type="button" class="add-cart-btn" onclick="store.addToCart('${dish.id}')" aria-label="Add ${dish.name} to Cart">
            Add to Cart
          </button>
        </div>
      </article>
    `;
  }

  renderStarRatings() {
    const ratingContainers = document.querySelectorAll(".rating[data-rating]");
    ratingContainers.forEach(container => {
      const rating = parseFloat(container.dataset.rating);
      const fullStars = Math.round(rating);

      let starsHTML = "";
      for (let i = 1; i <= 5; i++) {
        const filledClass = i <= fullStars ? "filled" : "";
        starsHTML += `<i class="fa-solid fa-star ${filledClass}" aria-hidden="true"></i>`;
      }
      starsHTML += `<span class="rating-number" aria-hidden="true">${rating.toFixed(1)}</span>`;
      container.innerHTML = starsHTML;
    });
  }

  setupDishModal() {
    const modal = document.getElementById("dishModal");
    const closeBtn = document.getElementById("modalCloseBtn");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => this.closeModal());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) this.closeModal();
      });
    }
  }

  openModal(dishId) {
    const dish = SPA_DATA.dishes.find(d => d.id === dishId);
    const modal = document.getElementById("dishModal");
    const modalContent = document.getElementById("modalContent");
    if (!dish || !modal || !modalContent) return;

    modalContent.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}" class="modal-img">
      <div class="modal-body-pad">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--primary); letter-spacing:0.5px;">${dish.category}</span>
          <span style="font-size:13px; font-weight:700; color:#f59e0b;"><i class="fa-solid fa-star" aria-hidden="true"></i> ${dish.rating}</span>
        </div>
        <h3 id="modalTitle">${dish.name}</h3>
        <p>${dish.description}</p>
        <div class="modal-footer-row">
          <span class="price" style="font-size:22px;">₹${dish.price}</span>
          <button type="button" class="cta-primary-btn" onclick="store.addToCart('${dish.id}'); spa.closeModal();">
            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Add to Cart
          </button>
        </div>
      </div>
    `;

    modal.hidden = false;
  }

  closeModal() {
    const modal = document.getElementById("dishModal");
    if (modal) modal.hidden = true;
  }

  setupMobileMenu() {
    const toggleBtn = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");
    if (!toggleBtn || !menu) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen);
      toggleBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
  }

  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 30);
    });
  }
}


let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

let spa;
document.addEventListener("DOMContentLoaded", () => {
  spa = new SPAManager();
});
