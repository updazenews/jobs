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

    state.jobs = snapshot.docs
      .map((docRef) => normalizeJob(docRef.id, docRef.data()))
      .filter((job) => !isExpired(job.closingDate));

    applyFilters();
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
  return {
    id,
    title: data.title || 'Untitled role',
    company: data.company || 'Unknown company',
    location: data.location || 'South Africa',
    type: String(data.jobType || data.workType || 'full-time').toLowerCase(),
    industry: String(data.industry || 'general').toLowerCase(),
    postedAt: toDate(data.postedAt) || new Date(),
    closingDate: toDate(data.closingDate),
    description: data.description || '',
    applyUrl: data.url || `/details.html?id=${encodeURIComponent(id)}`,
    skills: Array.isArray(data.skills) ? data.skills : [],
  };
}

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  return new Date(value);
}

function isExpired(closingDate) {
  if (!closingDate) return false;
  const end = new Date(closingDate);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
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
    const text = `${job.title} ${job.company} ${job.skills.join(' ')}`.toLowerCase();
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
          <p class="job-meta mb-3">
            <i class="bi bi-geo-alt"></i> ${escapeHTML(job.location)} &nbsp;•&nbsp;
            <i class="bi bi-calendar3"></i> Posted ${formatDate(job.postedAt)}
          </p>
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

function setLoading(on) { loadingSpinner.classList.toggle('d-none', !on); }
function hideStates() { emptyState.classList.add('d-none'); errorState.classList.add('d-none'); }
function formatDate(date) { return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }); }
function escapeHTML(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function escapeAttr(v) { return escapeHTML(v).replace(/`/g, '&#096;'); }
