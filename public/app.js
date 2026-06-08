// ==========================================================================
// SlotSphere Client Application - Casino Portal V2
// ==========================================================================

// 1. Core Casino Directory Data
const casinosData = [
  {
    id: "spinzilla",
    name: "Spinzilla Casino",
    logoColor: "#a855f7", // Purple
    matchPercent: 200,
    maxBonus: 300,
    wagering: 30,
    payoutHours: 1,
    rating: 4.9,
    gameCount: "2,500+",
    licensing: "UKGC & Gibraltar",
    tags: ["crypto", "fast-payout", "high-match"],
    terms: "New players only. Min deposit $10. 30x wagering requirement. Neteller/Skrill excluded. T&Cs apply. 18+"
  },
  {
    id: "cryptowild",
    name: "CryptoWild Casino",
    logoColor: "#06b6d4", // Cyan
    matchPercent: 200,
    maxBonus: 1000,
    wagering: 35,
    payoutHours: 0.2, // Instant
    rating: 4.9,
    gameCount: "4,000+",
    licensing: "Curacao eGaming",
    tags: ["crypto", "fast-payout", "high-match"],
    terms: "18+ only. Play responsibly. Match up to 1 BTC/1000$. 35x wagering. Instant crypto withdrawals. T&Cs apply."
  },
  {
    id: "vegasvibe",
    name: "VegasVibe Casino",
    logoColor: "#f59e0b", // Gold
    matchPercent: 150,
    maxBonus: 500,
    wagering: 35,
    payoutHours: 4,
    rating: 4.8,
    gameCount: "1,800+",
    licensing: "MGA (Malta)",
    tags: ["fast-payout"],
    terms: "Min deposit $20. 35x wagering on bonus. Validity 30 days. Max bet with bonus $5. T&Cs apply. 18+"
  },
  {
    id: "neonslots",
    name: "Neon Slots",
    logoColor: "#ec4899", // Pink
    matchPercent: 100,
    maxBonus: 200,
    wagering: 25,
    payoutHours: 2,
    rating: 4.7,
    gameCount: "3,000+",
    licensing: "UKGC",
    tags: ["crypto", "fast-payout"],
    terms: "First deposit only. 25x wagering on deposit + bonus. Fast withdrawals to e-wallets. T&Cs apply. 18+"
  },
  {
    id: "grandfortune",
    name: "Grand Fortune",
    logoColor: "#eab308", // Yellow
    matchPercent: 300,
    maxBonus: 1500,
    wagering: 40,
    payoutHours: 24,
    rating: 4.6,
    gameCount: "1,200+",
    licensing: "Gibraltar",
    tags: ["high-match"],
    terms: "300% matched deposit up to $1500. 40x wagering required before conversion. Min deposit $50. T&Cs apply. 18+"
  },
  {
    id: "royalcrest",
    name: "Royal Crest",
    logoColor: "#10b981", // Green
    matchPercent: 100,
    maxBonus: 150,
    wagering: 20,
    payoutHours: 12,
    rating: 4.5,
    gameCount: "900+",
    licensing: "UKGC & MGA",
    tags: [],
    terms: "Low wagering match bonus of 20x. Min deposit $10. Valid for 14 days. T&Cs apply. 18+"
  }
];

// Slots List for Spinner Wheel
const slotsData = [
  { name: "Mega Moolah", desc: "Huge progressive jackpot record holder." },
  { name: "Starburst", desc: "Classic high-energy arcade slot by NetEnt." },
  { name: "Book of Dead", desc: "Explore ancient Egypt with high volatility." },
  { name: "Sweet Bonanza", desc: "Fruity cluster payouts with massive multipliers." },
  { name: "Gonzo's Quest", desc: "Avalanche reels with multiplying payouts." },
  { name: "Gates of Olympus", desc: "Tumble wins presided by Zeus himself." }
];

// 2. Application State
let currentDeposit = 100;
let activeFilter = "all";
let activeSort = "rating";
let searchQuery = "";
let selectedForComparison = [];

// DOM Element Selectors
const depositSlider = document.getElementById("deposit-slider");
const calcValDisplay = document.getElementById("calc-val-display");
const avgBonusCalc = document.getElementById("avg-bonus-calc");
const avgTotalCalc = document.getElementById("avg-total-calc");

const casinoGrid = document.getElementById("casino-grid");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".btn-filter");
const sortSelect = document.getElementById("sort-select");

const compareBar = document.getElementById("compare-bar");
const compareCount = document.getElementById("compare-count");
const btnTriggerCompare = document.getElementById("btn-trigger-compare");
const compareModal = document.getElementById("compare-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalOverlay = document.getElementById("modal-overlay");
const compareTableContainer = document.getElementById("compare-table-container");

const spinButton = document.getElementById("spin-button");
const wheelDisc = document.getElementById("wheel-disc");
const spinResultBox = document.getElementById("spin-result");
const pickedSlotName = document.getElementById("picked-slot-name");
const pickedSlotDesc = document.getElementById("picked-slot-desc");

const themeToggleBtn = document.getElementById("theme-toggle-btn");
const sunIcon = themeToggleBtn.querySelector(".sun-icon");
const moonIcon = themeToggleBtn.querySelector(".moon-icon");

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

// 3. Calculator Event Handlers
function updateCalculator(deposit) {
  currentDeposit = parseInt(deposit, 10);
  calcValDisplay.textContent = `$${currentDeposit}`;
  
  // Calculate average bonus
  let totalBonus = 0;
  casinosData.forEach(c => {
    totalBonus += Math.min(currentDeposit * (c.matchPercent / 100), c.maxBonus);
  });
  const avgBonus = Math.round(totalBonus / casinosData.length);
  avgBonusCalc.textContent = `+$${~~avgBonus}`;
  avgTotalCalc.textContent = `$${currentDeposit + avgBonus}`;
  
  // Update calculator fields inside current rendered cards
  document.querySelectorAll(".casino-card").forEach(card => {
    const cardId = card.dataset.id;
    const casino = casinosData.find(c => c.id === cardId);
    if (casino) {
      const matchBonus = Math.min(currentDeposit * (casino.matchPercent / 100), casino.maxBonus);
      const totalPlay = currentDeposit + matchBonus;
      
      const valElement = card.querySelector(".calc-output-val");
      if (valElement) {
        valElement.textContent = `$${totalPlay}`;
      }
    }
  });
}

// 4. Listing Card Renderer
function renderCasinoCards() {
  // Filter
  let filtered = casinosData.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "crypto") return c.tags.includes("crypto") && matchesSearch;
    if (activeFilter === "fast-payout") return c.tags.includes("fast-payout") && matchesSearch;
    if (activeFilter === "high-match") return c.matchPercent >= 200 && matchesSearch;
    return matchesSearch;
  });
  
  // Sort
  filtered.sort((a, b) => {
    if (activeSort === "rating") return b.rating - a.rating;
    if (activeSort === "bonus") return b.maxBonus - a.maxBonus;
    if (activeSort === "payout") return a.payoutHours - b.payoutHours;
    return 0;
  });
  
  // Render
  casinoGrid.innerHTML = "";
  if (filtered.length === 0) {
    casinoGrid.innerHTML = `<div class="glass" style="padding: 40px; text-align: center; border-radius: 12px; color: var(--text-muted);">No operators match your filter criteria.</div>`;
    return;
  }
  
  filtered.forEach(c => {
    const matchBonus = Math.min(currentDeposit * (c.matchPercent / 100), c.maxBonus);
    const totalPlay = currentDeposit + matchBonus;
    const isChecked = selectedForComparison.includes(c.id) ? "checked" : "";
    
    const card = document.createElement("div");
    card.className = "casino-card glass";
    card.dataset.id = c.id;
    
    // Create badges
    let badgeHTML = "";
    if (c.tags.includes("crypto")) badgeHTML += `<span class="badge badge-crypto">Crypto Friendly</span>`;
    if (c.tags.includes("fast-payout")) badgeHTML += `<span class="badge">Instant Payout</span>`;
    if (c.matchPercent >= 200) badgeHTML += `<span class="badge" style="background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); border-color: rgba(168, 85, 247, 0.3);">${c.matchPercent}% Match</span>`;
    
    card.innerHTML = `
      <div class="card-logo-box">
        <div class="card-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="${c.logoColor}" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="4" />
            <circle cx="12" cy="12" r="6" />
            <path d="M12 9v6M9 12h6" />
          </svg>
        </div>
        <label class="compare-checkbox-label">
          <input type="checkbox" class="compare-chk" data-id="${c.id}" ${isChecked}> Compare
        </label>
      </div>
      
      <div class="card-offer-box">
        <h4 class="card-title">${c.name}</h4>
        <span class="card-bonus-highlight">${c.matchPercent}% Up To $${c.maxBonus}</span>
        <div class="card-meta-list">${badgeHTML}</div>
      </div>
      
      <div class="card-stats-box">
        <div class="stat-row">
          <span class="stat-label">Rating</span>
          <span class="stat-value text-gold">★ ${c.rating}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Payout Speed</span>
          <span class="stat-value">${c.payoutHours < 1 ? 'Instant' : c.payoutHours + 'h'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Wagering</span>
          <span class="stat-value">${c.wagering}x</span>
        </div>
      </div>
      
      <div class="card-calc-output">
        <span class="calc-output-label">Your Total Play Money</span>
        <span class="calc-output-val">$${totalPlay}</span>
        <span class="calc-output-label" style="font-size: 0.62rem;">(On $${currentDeposit} Deposit)</span>
      </div>
      
      <div class="card-action-box">
        <a href="#" class="btn btn-primary btn-sm" onclick="alert('Redirecting securely to ${c.name}...'); return false;">Claim Bonus &rarr;</a>
        <p class="terms-excerpt">${c.terms}</p>
      </div>
    `;
    
    // Add checkbox toggle listener
    card.querySelector(".compare-chk").addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      if (e.target.checked) {
        if (selectedForComparison.length >= 3) {
          alert("You can compare up to 3 casinos side-by-side.");
          e.target.checked = false;
          return;
        }
        if (!selectedForComparison.includes(id)) {
          selectedForComparison.push(id);
        }
      } else {
        selectedForComparison = selectedForComparison.filter(item => item !== id);
      }
      updateComparisonBar();
    });
    
    casinoGrid.appendChild(card);
  });
}

// 5. Compare Bar Update Logic
function updateComparisonBar() {
  if (selectedForComparison.length > 0) {
    compareBar.style.display = "flex";
    compareCount.textContent = selectedForComparison.length;
  } else {
    compareBar.style.display = "none";
  }
}

// 6. Side-by-Side Comparison Generator
function generateComparisonMatrix() {
  if (selectedForComparison.length === 0) return;
  
  const selectedCasinos = casinosData.filter(c => selectedForComparison.includes(c.id));
  
  let tableHTML = `
    <table class="comparison-matrix">
      <thead>
        <tr>
          <th>Attribute</th>
  `;
  
  selectedCasinos.forEach(c => {
    tableHTML += `
      <th>
        <div class="matrix-header-cell">
          <div class="matrix-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="${c.logoColor}" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="4" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <strong>${c.name}</strong>
        </div>
      </th>
    `;
  });
  
  tableHTML += `
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Review Rating</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td class="text-gold">★ ${c.rating} / 5.0</td>`;
  });
  
  tableHTML += `
        </tr>
        <tr>
          <td><strong>Offer details</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td><strong class="text-cyan">${c.matchPercent}%</strong> match up to <strong>$${c.maxBonus}</strong></td>`;
  });
  
  tableHTML += `
        </tr>
        <tr>
          <td><strong>Wagering Requirement</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td>${c.wagering}x</td>`;
  });
  
  tableHTML += `
        </tr>
        <tr>
          <td><strong>Withdrawal Speed</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td>${c.payoutHours < 1 ? 'Instant' : c.payoutHours + ' Hours'}</td>`;
  });
  
  tableHTML += `
        </tr>
        <tr>
          <td><strong>Licensing Authority</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td>${c.licensing}</td>`;
  });
  
  tableHTML += `
        </tr>
        <tr>
          <td><strong>Games Available</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td>${c.gameCount} Slots & Tables</td>`;
  });
  
  tableHTML += `
        </tr>
        <tr>
          <td><strong>Action</strong></td>
  `;
  selectedCasinos.forEach(c => {
    tableHTML += `<td><a href="#" class="btn btn-primary btn-sm" onclick="alert('Redirecting securely to ${c.name}...'); return false;">Play Now</a></td>`;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  compareTableContainer.innerHTML = tableHTML;
}

// 7. Interactive Slot Recommendation Wheel
let wheelSpinning = false;
function spinWheel() {
  if (wheelSpinning) return;
  
  wheelSpinning = true;
  spinResultBox.style.display = "none";
  
  // Choose random slot
  const randomIndex = Math.floor(Math.random() * slotsData.length);
  const pickedSlot = slotsData[randomIndex];
  
  // Segment size is 60deg (6 segments)
  // Segments are arranged megamoolah, starburst, bookofdead, sweetbonanza, gonzosquest, gatesofolympus
  // starburst is segment index 1.
  // Mega Moolah is index 0.
  // Starburst is index 1.
  // Book of Dead is index 2.
  // Sweet Bonanza is index 3.
  // Gonzo's Quest is index 4.
  // Gates of Olympus is index 5.
  
  // Calculate destination angle to align segment center with arrow (pointing up, i.e. 0 / 360 deg)
  // Segment center is offset from segment boundaries.
  // Segment i spans from 30deg + 60*i to 90deg + 60*i?
  // Let's just rotate random amount and point to index.
  const rotations = 5; // number of full rotations
  const segmentAngle = 360 / slotsData.length;
  // Segment 0 center is at 30 deg, segment 1 center is at 90 deg, etc.
  // Target rotation: we want segment `randomIndex` to land at 0 deg (top).
  // Currently segment i is drawn at rotation calc(60deg * i).
  // To align it to top, we must rotate wheel by: -60*i - 30 deg.
  const targetAngle = 360 * rotations - (segmentAngle * randomIndex) - (segmentAngle / 2);
  
  wheelDisc.style.transform = `rotate(${targetAngle}deg)`;
  
  setTimeout(() => {
    pickedSlotName.textContent = pickedSlot.name;
    pickedSlotDesc.textContent = pickedSlot.desc;
    spinResultBox.style.display = "flex";
    wheelSpinning = false;
  }, 4000); // Must match --transition-wheel CSS transition time
}

// 8. Event Listeners Initialization
function initEventListeners() {
  // Slider
  depositSlider.addEventListener("input", (e) => {
    updateCalculator(e.target.value);
  });
  
  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderCasinoCards();
  });
  
  // Filters
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderCasinoCards();
    });
  });
  
  // Navigation filters
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const filter = e.target.dataset.nav;
      if (filter) {
        e.preventDefault();
        
        // Update regular filter buttons visually
        filterButtons.forEach(b => b.classList.remove("active"));
        const matchingBtn = document.querySelector(`.btn-filter[data-filter="${filter}"]`);
        if (matchingBtn) matchingBtn.classList.add("active");
        
        // Update nav active styling
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        e.target.classList.add("active");
        
        activeFilter = filter;
        renderCasinoCards();
        
        // Close mobile menu if open
        mobileMenu.style.display = "none";
        
        // Scroll to listings
        document.getElementById("casinos").scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  
  // Sort
  sortSelect.addEventListener("change", (e) => {
    activeSort = e.target.value;
    renderCasinoCards();
  });
  
  // Compare Button Modal triggers
  btnTriggerCompare.addEventListener("click", () => {
    generateComparisonMatrix();
    compareModal.classList.add("active");
    compareModal.setAttribute("aria-hidden", "false");
  });
  
  closeModalBtn.addEventListener("click", () => {
    compareModal.classList.remove("active");
    compareModal.setAttribute("aria-hidden", "true");
  });
  
  modalOverlay.addEventListener("click", () => {
    compareModal.classList.remove("active");
    compareModal.setAttribute("aria-hidden", "true");
  });
  
  // Wheel
  spinButton.addEventListener("click", spinWheel);
  
  // Theme Toggle
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    if (isLight) {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
    } else {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
    }
  });
  
  // Mobile Menu Toggle
  menuToggle.addEventListener("click", () => {
    const isVisible = mobileMenu.style.display === "flex";
    mobileMenu.style.display = isVisible ? "none" : "flex";
  });
}

// 9. Startup Execution
window.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  updateCalculator(depositSlider.value);
  renderCasinoCards();
});
