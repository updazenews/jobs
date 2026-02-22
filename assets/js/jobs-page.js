import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '/assets/js/jobs.js';

const jobsContainer = document.getElementById('jobsContainer');
const resultsCount = document.getElementById('resultsCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const pagination = document.getElementById('pagination');
const filtersForm = document.getElementById('filtersForm');
const resetFiltersBtn = document.getElementById('resetFilters');
const categoryButtons = document.getElementById('categoryButtons');
const featuredJobsTrack = document.getElementById('featuredJobsTrack');

const state = { jobs: [], filteredJobs: [], currentPage: 1, pageSize: 6 };
const categoryList = ['technology', 'healthcare', 'education', 'finance', 'operations', 'marketing'];

initialize();

async function initialize() {
  hydrateFiltersFromUrl();
  renderCategoryButtons();
  wireEvents();
  await loadJobsFromFirebase();
}

function wireEvents() {
  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });

  resetFiltersBtn.addEventListener('click', () => {
    filtersForm.reset();
    state.currentPage = 1;
    updateUrlFromFilters();
    applyFilters();
  });
}

async function loadJobsFromFirebase() {
  setLoading(true);
  hideStates();

  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('active', '==', true), orderBy('postedAt', 'desc'));
    const snapshot = await getDocs(q);

    state.jobs = snapshot.docs.map((docRef) => normalizeJob(docRef.id, docRef.data()));
    applyFilters();
    renderFeaturedJobs();
  } catch (error) {
    console.error('Error loading jobs from Firebase:', error);
    errorState.classList.remove('d-none');
    resultsCount.textContent = 'Unable to load jobs';
    state.jobs = [];
    state.filteredJobs = [];
    jobsContainer.innerHTML = '';
    pagination.innerHTML = '';
    emptyState.classList.remove('d-none');
  } finally {
    setLoading(false);
  }
}

function normalizeJob(id, data) {
  const postedAt = data.postedAt?.toDate ? data.postedAt.toDate() : new Date(data.postedAt || Date.now());

  return {
    id,
    title: data.title || 'Untitled role',
    company: data.company || 'Unknown company',
    location: data.location || 'South Africa',
    type: String(data.jobType || data.workType || 'full-time').toLowerCase(),
    industry: String(data.industry || 'general').toLowerCase(),
    postedAt,
    description: data.description || 'No description provided.',
    applyUrl: data.url || `/details.html?id=${encodeURIComponent(id)}`,
    skills: Array.isArray(data.skills) ? data.skills : [],
    featured: Boolean(data.featured),
  };
}

function hydrateFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  ['q', 'location', 'type', 'industry', 'postedWithin'].forEach((key) => {
    const el = filtersForm.elements.namedItem(key);
    if (el && params.get(key)) el.value = params.get(key);
  });
}

function updateUrlFromFilters() {
  const data = new FormData(filtersForm);
  const params = new URLSearchParams();
  for (const [key, value] of data.entries()) if (String(value).trim()) params.set(key, String(value).trim());
  window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
}

function applyFilters() {
  const values = Object.fromEntries(new FormData(filtersForm).entries());
  updateUrlFromFilters();

  state.filteredJobs = state.jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
    const qMatch = !values.q || text.includes(values.q.toLowerCase());
    const locationMatch = !values.location || job.location.toLowerCase().includes(values.location.toLowerCase());
    const typeMatch = !values.type || job.type === values.type.toLowerCase();
    const industryMatch = !values.industry || job.industry === values.industry.toLowerCase();
    const dateMatch = !values.postedWithin || postedWithinDays(job.postedAt) <= Number(values.postedWithin);
    return qMatch && locationMatch && typeMatch && industryMatch && dateMatch;
  });

  state.currentPage = 1;
  renderJobs();
}

function postedWithinDays(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function renderJobs() {
  jobsContainer.innerHTML = '';
  errorState.classList.add('d-none');

  if (!state.filteredJobs.length) {
    resultsCount.textContent = '0 jobs found';
    emptyState.classList.remove('d-none');
    pagination.innerHTML = '';
    return;
  }

  emptyState.classList.add('d-none');
  resultsCount.textContent = `${state.filteredJobs.length} jobs found`;

  const start = (state.currentPage - 1) * state.pageSize;
  const pageItems = state.filteredJobs.slice(start, start + state.pageSize);

  pageItems.forEach((job) => {
    jobsContainer.insertAdjacentHTML('beforeend', `
      <article class="col-12">
        <div class="job-card p-3 p-md-4 shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
            <div>
              <h2 class="h5 mb-1">${escapeHTML(job.title)}</h2>
              <p class="mb-0 text-secondary">${escapeHTML(job.company)}</p>
            </div>
            <span class="badge text-bg-primary text-capitalize">${escapeHTML(job.type)}</span>
          </div>
          <p class="job-meta mb-2">
            <i class="bi bi-geo-alt"></i> ${escapeHTML(job.location)} &nbsp;•&nbsp;
            <i class="bi bi-calendar3"></i> Posted ${formatDate(job.postedAt)} &nbsp;•&nbsp;
            <i class="bi bi-briefcase"></i> ${escapeHTML(job.industry)}
          </p>
          <p class="mb-3">${escapeHTML(job.description)}</p>
          <div class="d-flex gap-2 flex-wrap">
            <a class="btn btn-outline-primary btn-sm" href="/details.html?id=${encodeURIComponent(job.id)}">View details</a>
            <a class="btn btn-primary btn-sm" href="${escapeAttr(job.applyUrl)}" target="_blank" rel="noopener noreferrer">Apply now</a>
          </div>
        </div>
      </article>
    `);
  });

  renderPagination();
}

function renderPagination() {
  const pageCount = Math.ceil(state.filteredJobs.length / state.pageSize);
  pagination.innerHTML = '';
  if (pageCount <= 1) return;

  for (let page = 1; page <= pageCount; page += 1) {
    pagination.insertAdjacentHTML('beforeend', `<li class="page-item ${page === state.currentPage ? 'active' : ''}"><button class="page-link" data-page="${page}">${page}</button></li>`);
  }

  pagination.querySelectorAll('button[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentPage = Number(button.dataset.page);
      renderJobs();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderCategoryButtons() {
  categoryButtons.innerHTML = categoryList
    .map((c) => `<button type="button" class="btn btn-sm btn-outline-secondary category-btn text-capitalize">${c}</button>`)
    .join('');

  categoryButtons.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filtersForm.industry.value = btn.textContent.trim().toLowerCase();
      applyFilters();
    });
  });
}

function renderFeaturedJobs() {
  const featured = state.jobs.filter((job) => job.featured).slice(0, 4);
  if (!featured.length) {
    featuredJobsTrack.innerHTML = '<div class="carousel-item active"><div class="featured-placeholder p-4 rounded-4 bg-light text-center">No featured jobs available.</div></div>';
    return;
  }

  featuredJobsTrack.innerHTML = featured.map((job, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <article class="p-4 rounded-4 bg-light">
        <p class="text-uppercase small text-primary mb-1">Featured job</p>
        <h2 class="h5">${escapeHTML(job.title)}</h2>
        <p class="text-secondary mb-2">${escapeHTML(job.company)} • ${escapeHTML(job.location)}</p>
        <a href="${escapeAttr(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">Apply now</a>
      </article>
    </div>`).join('');
}

function setLoading(on) { loadingSpinner.classList.toggle('d-none', !on); }
function hideStates() { emptyState.classList.add('d-none'); errorState.classList.add('d-none'); }
function formatDate(date) { return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }); }
function escapeHTML(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function escapeAttr(v) { return escapeHTML(v).replace(/`/g, '&#096;'); }
