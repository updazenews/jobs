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

const state = {
  jobs: [],
  filteredJobs: [],
  currentPage: 1,
  pageSize: 6,
};

const categoryList = ['Technology', 'Healthcare', 'Education', 'Finance', 'Operations', 'Marketing'];

initialize();

async function initialize() {
  hydrateFiltersFromUrl();
  renderCategoryButtons();
  await loadJobs();
  wireEvents();
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

async function loadJobs() {
  setLoading(true);
  hideStates();

  try {
    // Placeholder API call requested by user. Query parameters are assembled from UI filters.
    const response = await fetch(`/api/jobs?${buildApiQuery().toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch /api/jobs');
    }

    const payload = await response.json();
    state.jobs = normalizeJobs(payload.jobs || payload || []);
  } catch (error) {
    // Fallback data so template remains functional without backend.
    console.warn('API unavailable. Using fallback data.', error);
    state.jobs = getFallbackJobs();
  } finally {
    setLoading(false);
  }

  applyFilters();
  renderFeaturedJobs();
}

function buildApiQuery() {
  const data = new FormData(filtersForm);
  const params = new URLSearchParams();

  for (const [key, value] of data.entries()) {
    if (String(value).trim()) {
      params.set(key, String(value).trim());
    }
  }

  return params;
}

function hydrateFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  ['q', 'location', 'type', 'industry', 'postedWithin'].forEach((key) => {
    const el = filtersForm.elements.namedItem(key);
    if (el && params.get(key)) {
      el.value = params.get(key);
    }
  });
}

function updateUrlFromFilters() {
  const params = buildApiQuery();
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
}

function applyFilters() {
  const values = Object.fromEntries(new FormData(filtersForm).entries());
  updateUrlFromFilters();

  state.filteredJobs = state.jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
    const qMatch = !values.q || text.includes(values.q.toLowerCase());
    const locationMatch = !values.location || job.location.toLowerCase().includes(values.location.toLowerCase());
    const typeMatch = !values.type || job.type.toLowerCase() === values.type.toLowerCase();
    const industryMatch = !values.industry || job.industry.toLowerCase() === values.industry.toLowerCase();
    const dateMatch = !values.postedWithin || postedWithinDays(job.postedAt) <= Number(values.postedWithin);

    return qMatch && locationMatch && typeMatch && industryMatch && dateMatch;
  });

  state.currentPage = 1;
  renderJobs();
}

function postedWithinDays(postedAt) {
  const date = new Date(postedAt);
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
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

  const start = (state.currentPage - 1) * state.pageSize;
  const end = start + state.pageSize;
  const pageItems = state.filteredJobs.slice(start, end);

  resultsCount.textContent = `${state.filteredJobs.length} jobs found`;

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
            <i class="bi bi-geo-alt"></i> ${escapeHTML(job.location)}
            &nbsp;•&nbsp;
            <i class="bi bi-calendar3"></i> Posted ${formatDate(job.postedAt)}
            &nbsp;•&nbsp;
            <i class="bi bi-briefcase"></i> ${escapeHTML(job.industry)}
          </p>

          <p class="mb-3">${escapeHTML(job.description)}</p>

          <div class="d-flex gap-2 flex-wrap">
            <a class="btn btn-outline-primary btn-sm" href="/details.html?id=${encodeURIComponent(job.id)}">View details</a>
            <a class="btn btn-primary btn-sm" href="${escapeAttribute(job.applyUrl)}" target="_blank" rel="noopener noreferrer">Apply now</a>
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
    pagination.insertAdjacentHTML('beforeend', `
      <li class="page-item ${page === state.currentPage ? 'active' : ''}">
        <button class="page-link" data-page="${page}" aria-label="Go to page ${page}">${page}</button>
      </li>
    `);
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
    .map((category) => `<button type="button" class="btn btn-sm btn-outline-secondary category-btn">${category}</button>`)
    .join('');

  categoryButtons.querySelectorAll('.category-btn').forEach((button) => {
    button.addEventListener('click', () => {
      filtersForm.industry.value = button.textContent.trim().toLowerCase();
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

  featuredJobsTrack.innerHTML = featured
    .map((job, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <article class="p-4 rounded-4 bg-light">
          <p class="text-uppercase small text-primary mb-1">Featured job</p>
          <h2 class="h5">${escapeHTML(job.title)}</h2>
          <p class="text-secondary mb-2">${escapeHTML(job.company)} • ${escapeHTML(job.location)}</p>
          <a href="${escapeAttribute(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">Apply now</a>
        </article>
      </div>
    `)
    .join('');
}

function setLoading(isLoading) {
  loadingSpinner.classList.toggle('d-none', !isLoading);
}

function hideStates() {
  emptyState.classList.add('d-none');
  errorState.classList.add('d-none');
}

function normalizeJobs(jobs) {
  return jobs.map((job, idx) => ({
    id: job.id ?? `job-${idx + 1}`,
    title: job.title ?? 'Untitled role',
    company: job.company ?? 'Unknown company',
    location: job.location ?? 'South Africa',
    type: (job.type ?? 'full-time').toLowerCase(),
    industry: (job.industry ?? 'technology').toLowerCase(),
    postedAt: job.postedAt ?? new Date().toISOString(),
    description: job.description ?? 'No description provided.',
    applyUrl: job.applyUrl ?? `/details.html?id=${encodeURIComponent(job.id ?? `job-${idx + 1}`)}`,
    skills: Array.isArray(job.skills) ? job.skills : [],
    featured: Boolean(job.featured),
  }));
}

function getFallbackJobs() {
  return normalizeJobs([
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechNova',
      location: 'Cape Town',
      type: 'full-time',
      industry: 'technology',
      postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      description: 'Build responsive web interfaces with modern JavaScript frameworks.',
      applyUrl: 'https://example.com/apply/frontend-developer',
      skills: ['javascript', 'css', 'react'],
      featured: true,
    },
    {
      id: '2',
      title: 'Marketing Intern',
      company: 'BrightReach',
      location: 'Johannesburg',
      type: 'internship',
      industry: 'marketing',
      postedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      description: 'Support social campaigns and market research projects.',
      applyUrl: 'https://example.com/apply/marketing-intern',
      skills: ['social media', 'copywriting'],
      featured: true,
    },
    {
      id: '3',
      title: 'Nurse Assistant',
      company: 'WellCare Clinic',
      location: 'Durban',
      type: 'part-time',
      industry: 'healthcare',
      postedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      description: 'Assist with patient intake, records, and daily clinical support.',
      applyUrl: 'https://example.com/apply/nurse-assistant',
      skills: ['care', 'records'],
      featured: false,
    },
    {
      id: '4',
      title: 'Remote Data Analyst',
      company: 'InsightIQ',
      location: 'Remote',
      type: 'remote',
      industry: 'finance',
      postedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
      description: 'Analyze business and finance datasets and prepare dashboards.',
      applyUrl: 'https://example.com/apply/data-analyst',
      skills: ['sql', 'excel', 'power bi'],
      featured: true,
    },
  ]);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, '&#096;');
}
