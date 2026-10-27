'use strict';

const quotes = [
  { id: 1, text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Programming" },
  { id: 2, text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "Programming" },
  { id: 3, text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", category: "Programming" },
  { id: 4, text: "Make it work, make it right, make it fast, in that order.", author: "Kent Beck", category: "Programming" },
  { id: 5, text: "Code is like a garden: a little trimming every day keeps the weeds from taking over.", author: "CodeQuote Original", category: "Programming" },
  { id: 6, text: "A good commit message is a kind note to your future self.", author: "CodeQuote Original", category: "Programming" },

  { id: 7, text: "The only way to learn a new programming language is by writing programs in it.", author: "Brian Kernighan & Dennis Ritchie", category: "Learning" },
  { id: 8, text: "Every expert was once a beginner who refused to quit.", author: "CodeQuote Original", category: "Learning" },
  { id: 9, text: "You don't learn to code by watching. You learn by building, breaking and fixing.", author: "CodeQuote Original", category: "Learning" },
  { id: 10, text: "The best way to understand a concept is to explain it to someone else.", author: "CodeQuote Original", category: "Learning" },
  { id: 11, text: "Confusion is the first sign that your brain is making room for something new.", author: "CodeQuote Original", category: "Learning" },

  { id: 12, text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Creativity" },
  { id: 13, text: "Programming is the art of turning ideas into something real.", author: "CodeQuote Original", category: "Creativity" },
  { id: 14, text: "Constraints are not cages. They are the canvas on which clever solutions are painted.", author: "CodeQuote Original", category: "Creativity" },
  { id: 15, text: "Every great app began as a rough sketch and a stubborn idea.", author: "CodeQuote Original", category: "Creativity" },
  { id: 16, text: "Stay curious: the best features start with a simple 'what if?'", author: "CodeQuote Original", category: "Creativity" },

  { id: 17, text: "Premature optimization is the root of all evil.", author: "Donald Knuth", category: "Discipline" },
  { id: 18, text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Discipline" },
  { id: 19, text: "Small steps every day beat giant leaps once a month.", author: "CodeQuote Original", category: "Discipline" },
  { id: 20, text: "Consistency compiles into mastery.", author: "CodeQuote Original", category: "Discipline" },
  { id: 21, text: "Discipline is writing the test today so you don't debug at midnight.", author: "CodeQuote Original", category: "Discipline" },

  { id: 22, text: "The most dangerous phrase in the language is, 'We've always done it this way.'", author: "Grace Hopper", category: "Motivation" },
  { id: 23, text: "A bug is not a failure. It is the program telling you what to learn next.", author: "CodeQuote Original", category: "Motivation" },
  { id: 24, text: "Failure is just a failing test on the way to a passing build.", author: "CodeQuote Original", category: "Motivation" },
  { id: 25, text: "Keep pushing. Every green checkmark started as a red error.", author: "CodeQuote Original", category: "Motivation" },
  { id: 26, text: "Believe in the version of you that finishes the project.", author: "CodeQuote Original", category: "Motivation" }
];

const STORAGE_KEY = 'codequote-favorites';
let favorites = new Set(loadFavorites());   
let featuredId = null;                      
let activeCategory = 'All';                 
let searchTerm = '';                        

const els = {
  toast: document.getElementById('toast'),
  menuToggle: document.getElementById('menuToggle'),
  navLinks: document.getElementById('navLinks'),
  favCount: document.getElementById('favCount'),
  inspireBtn: document.getElementById('inspireBtn'),
  featuredCard: document.getElementById('featuredCard'),
  featuredText: document.getElementById('featuredText'),
  featuredAuthor: document.getElementById('featuredAuthor'),
  featuredCategory: document.getElementById('featuredCategory'),
  featuredFav: document.getElementById('featuredFav'),
  dailyDate: document.getElementById('dailyDate'),
  dailyCard: document.getElementById('dailyCard'),
  searchInput: document.getElementById('searchInput'),
  filters: document.getElementById('filters'),
  resultsCount: document.getElementById('resultsCount'),
  quoteGrid: document.getElementById('quoteGrid'),
  emptyState: document.getElementById('emptyState'),
  resetBtn: document.getElementById('resetBtn'),
  favGrid: document.getElementById('favGrid'),
  favEmpty: document.getElementById('favEmpty'),
  year: document.getElementById('year')
};

function findQuote(id) {
  return quotes.find(function (q) { return q.id === id; });
}

function escapeHTML(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, function (ch) { return map[ch]; });
}

function formatQuote(q, withAuthor) {
  return withAuthor ? '\u201C' + q.text + '\u201D \u2014 ' + q.author : q.text;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

let toastTimer = null;
function showToast(message, isError) {
  els.toast.textContent = message;
  els.toast.classList.toggle('is-error', Boolean(isError));
  els.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    els.toast.classList.remove('is-visible');
  }, 2600);
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) { return []; }
    return parsed.filter(function (id) { return Boolean(findQuote(id)); });
  } catch (error) {
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch (error) {
    showToast('Could not save favorites in this browser.', true);
  }
}

function getRandomQuote(excludeId) {
  const pool = quotes.filter(function (q) { return q.id !== excludeId; });
  return pool[Math.floor(Math.random() * pool.length)];
}

function getDailyQuote(date) {
  const d = date || new Date();
  const dayNumber = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return quotes[dayNumber % quotes.length];
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.top = '0';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(helper);
  }
  if (!copied) { throw new Error('Copy command failed'); }
}

async function copyQuote(id, withAuthor) {
  const q = findQuote(id);
  if (!q) { return; }
  try {
    await copyToClipboard(formatQuote(q, withAuthor));
    showToast(withAuthor ? 'Quote and author copied!' : 'Quote text copied!');
  } catch (error) {
    showToast('Could not copy. Please select the text and copy it manually.', true);
  }
}

async function shareQuote(id) {
  const q = findQuote(id);
  if (!q) { return; }
  const text = formatQuote(q, true);

  if (navigator.share) {
    try {
      await navigator.share({ title: 'CodeQuote', text: text });
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') { return; } 
    }
  }
  try {
    await copyToClipboard(text);
    showToast('Sharing is not available here, so the quote was copied instead.');
  } catch (error) {
    showToast('Could not share or copy this quote.', true);
  }
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast('Removed from favorites');
  } else {
    favorites.add(id);
    showToast('Saved to favorites');
  }
  saveFavorites();
  renderAll();
}
function cardHTML(q, extraClass) {
  const isFav = favorites.has(q.id);
  const author = escapeHTML(q.author);
  return '' +
    '<article class="quote-card glass ' + (extraClass || '') + '">' +
      '<span class="tag">' + escapeHTML(q.category) + '</span>' +
      '<blockquote><p>\u201C' + escapeHTML(q.text) + '\u201D</p></blockquote>' +
      '<p class="author">\u2014 ' + author + '</p>' +
      '<div class="card-actions">' +
        '<button class="icon-btn" type="button" data-action="copy" data-id="' + q.id + '"' +
          ' aria-label="Copy quote by ' + author + '">Copy</button>' +
        '<button class="icon-btn fav-btn' + (isFav ? ' is-fav' : '') + '" type="button"' +
          ' data-action="favorite" data-id="' + q.id + '" aria-pressed="' + isFav + '"' +
          ' aria-label="' + (isFav ? 'Remove from favorites' : 'Add to favorites') + ': quote by ' + author + '">' +
          (isFav ? '\u2665 Saved' : '\u2661 Save') +
        '</button>' +
      '</div>' +
    '</article>';
}

function renderFeatured(animate) {
  const q = findQuote(featuredId);
  els.featuredText.textContent = q.text;
  els.featuredAuthor.textContent = q.author;
  els.featuredCategory.textContent = q.category;

  const isFav = favorites.has(q.id);
  els.featuredFav.textContent = isFav ? '\u2665 Saved' : '\u2661 Save';
  els.featuredFav.classList.toggle('is-fav', isFav);
  els.featuredFav.setAttribute('aria-pressed', String(isFav));

  if (animate) {
    els.featuredCard.classList.remove('swap');
    void els.featuredCard.offsetWidth; 
    els.featuredCard.classList.add('swap');
  }
}

function renderDaily() {
  const today = new Date();
  els.dailyDate.textContent = today.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  els.dailyCard.innerHTML = cardHTML(getDailyQuote(today), 'daily-card');
}

function getFilteredQuotes() {
  const term = searchTerm.trim().toLowerCase();
  return quotes.filter(function (q) {
    const categoryMatch = activeCategory === 'All' || q.category === activeCategory;
    const searchMatch = !term || [q.text, q.author, q.category].some(function (field) {
      return field.toLowerCase().indexOf(term) !== -1;
    });
    return categoryMatch && searchMatch;
  });
}

function renderExplorer() {
  const results = getFilteredQuotes();
  els.quoteGrid.innerHTML = results.map(function (q) { return cardHTML(q); }).join('');
  els.emptyState.hidden = results.length > 0;
  els.resultsCount.textContent = results.length > 0
    ? 'Showing ' + results.length + ' of ' + quotes.length + ' quotes'
    : '';
}

function renderFavorites() {
  const saved = quotes.filter(function (q) { return favorites.has(q.id); });
  els.favGrid.innerHTML = saved.map(function (q) { return cardHTML(q); }).join('');
  els.favEmpty.hidden = saved.length > 0;
}

function updateFavCount() {
  els.favCount.textContent = favorites.size;
}

function renderAll() {
  renderFeatured(false);
  renderDaily();
  renderExplorer();
  renderFavorites();
  updateFavCount();
}

document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');
  if (!button) { return; }

  const action = button.dataset.action;
  const id = button.dataset.id ? Number(button.dataset.id) : featuredId;

  if (action === 'new') {
    featuredId = getRandomQuote(featuredId).id;
    renderFeatured(true);
  } else if (action === 'copy-text') {
    copyQuote(id, false);
  } else if (action === 'copy-full' || action === 'copy') {
    copyQuote(id, true);
  } else if (action === 'share') {
    shareQuote(id);
  } else if (action === 'favorite') {
    const container = button.closest('#quoteGrid, #favGrid, #dailyCard');
    toggleFavorite(id);
    if (container) {
      const again = container.querySelector('[data-action="favorite"][data-id="' + id + '"]');
      if (again) { again.focus(); }
    }
  }
});

els.inspireBtn.addEventListener('click', function () {
  featuredId = getRandomQuote(featuredId).id;
  renderFeatured(true);
  scrollToSection('featured');
});

els.filters.addEventListener('click', function (event) {
  const chip = event.target.closest('.chip');
  if (!chip) { return; }
  activeCategory = chip.dataset.category;
  els.filters.querySelectorAll('.chip').forEach(function (c) {
    const active = c === chip;
    c.classList.toggle('is-active', active);
    c.setAttribute('aria-pressed', String(active));
  });
  renderExplorer();
});

els.searchInput.addEventListener('input', function () {
  searchTerm = els.searchInput.value;
  renderExplorer();
});
els.resetBtn.addEventListener('click', function () {
  searchTerm = '';
  activeCategory = 'All';
  els.searchInput.value = '';
  els.filters.querySelectorAll('.chip').forEach(function (c) {
    const isAll = c.dataset.category === 'All';
    c.classList.toggle('is-active', isAll);
    c.setAttribute('aria-pressed', String(isAll));
  });
  renderExplorer();
  els.searchInput.focus();
});

function closeMenu() {
  els.navLinks.classList.remove('is-open');
  els.menuToggle.setAttribute('aria-expanded', 'false');
}
els.menuToggle.addEventListener('click', function () {
  const open = els.navLinks.classList.toggle('is-open');
  els.menuToggle.setAttribute('aria-expanded', String(open));
});
els.navLinks.addEventListener('click', function (event) {
  if (event.target.closest('a')) { closeMenu(); }
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') { closeMenu(); }
});

els.year.textContent = new Date().getFullYear();
featuredId = getRandomQuote().id;
renderAll();