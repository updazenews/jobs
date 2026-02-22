import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db, auth } from '../../../assets/js/jobs.js';

document.addEventListener('DOMContentLoaded', async () => {
  const jobsTableBody = document.getElementById('tbJobs');
  const loadingDiv = document.getElementById('loadingDiv');
  const uploadInput = document.getElementById('uploadBtn');
  const btnSave = document.getElementById('btnSaveJob');
  const headerSection = document.querySelector('main .border-bottom');

  const jobsState = { all: [], visible: [] };

  // Admin UX enhancement: search + stats injected without heavy HTML changes.
  headerSection?.insertAdjacentHTML('beforeend', `
    <div class="admin-jobs-toolbar py-3 w-100">
      <div class="row g-2 align-items-center">
        <div class="col-12 col-md-6">
          <input id="adminJobSearch" class="form-control" type="search" placeholder="Search title, company, location" />
        </div>
        <div class="col-12 col-md-6 text-md-end">
          <span class="badge text-bg-primary me-2" id="statTotal">Total: 0</span>
          <span class="badge text-bg-success" id="statActive">Active: 0</span>
        </div>
      </div>
    </div>
  `);

  const searchInput = document.getElementById('adminJobSearch');
  const statTotal = document.getElementById('statTotal');
  const statActive = document.getElementById('statActive');

  searchInput?.addEventListener('input', () => applySearch(searchInput.value));

  await loadJobs();

  async function loadJobs() {
    loadingDiv.style.display = 'block';
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      const snapshot = await getDocs(q);

      jobsState.all = snapshot.docs.map((docRef) => normalizeJob(docRef.id, docRef.data()));
      jobsState.visible = [...jobsState.all];
      renderRows(jobsState.visible);
      renderStats();
    } catch (error) {
      console.error('Error fetching jobs in admin:', error);
      jobsTableBody.innerHTML = '<tr><td colspan="8" class="text-danger">Unable to load jobs.</td></tr>';
    } finally {
      loadingDiv.style.display = 'none';
    }
  }

  function normalizeJob(id, data) {
    return {
      id,
      title: data.title || 'Untitled',
      company: data.company || '-',
      location: data.location || '-',
      jobType: data.jobType || data.workType || '-',
      postedAt: toDate(data.postedAt),
      closingDate: toDate(data.closingDate),
      description: data.description || '',
      requirements: data.requirements || '',
      url: data.url || '',
      active: data.active !== false,
    };
  }

  function toDate(value) {
    if (!value) return null;
    if (value.toDate) return value.toDate();
    return new Date(value);
  }

  function applySearch(term) {
    const q = String(term || '').toLowerCase().trim();
    jobsState.visible = !q
      ? [...jobsState.all]
      : jobsState.all.filter((job) => `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(q));

    renderRows(jobsState.visible);
  }

  function renderStats() {
    statTotal.textContent = `Total: ${jobsState.all.length}`;
    statActive.textContent = `Active: ${jobsState.all.filter((job) => job.active).length}`;
  }

  function renderRows(jobs) {
    jobsTableBody.innerHTML = '';

    if (!jobs.length) {
      jobsTableBody.innerHTML = '<tr><td colspan="8" class="text-muted">No jobs found.</td></tr>';
      return;
    }

    jobs.forEach((job) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHTML(job.title)}</td>
        <td>${escapeHTML(job.company)}</td>
        <td>${escapeHTML(job.location)}</td>
        <td>${escapeHTML(job.jobType)}</td>
        <td>${job.postedAt ? job.postedAt.toLocaleDateString('en-ZA') : '-'}</td>
        <td>${job.closingDate ? job.closingDate.toLocaleDateString('en-ZA') : '-'}</td>
        <td>${job.active ? '<span class="badge text-bg-success">Yes</span>' : '<span class="badge text-bg-secondary">No</span>'}</td>
        <td>
          <a class="btn btn-sm btn-primary" href="././edit?id=${job.id}">Edit</a>
          <button class="btn btn-sm btn-danger delete-job" data-id="${job.id}" data-title="${escapeHTML(job.title)}">Archive</button>
        </td>
      `;
      jobsTableBody.appendChild(row);
    });
  }

  document.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete-job')) return;

    const id = event.target.dataset.id;
    const title = event.target.dataset.title;
    if (!confirm(`Archive "${title}"?`)) return;

    try {
      await updateDoc(doc(db, 'jobs', id), { active: false, deletedAt: new Date() });
      jobsState.all = jobsState.all.map((job) => (job.id === id ? { ...job, active: false } : job));
      applySearch(searchInput?.value || '');
      renderStats();
    } catch (error) {
      console.error('Error archiving job:', error);
      alert('Could not archive this job.');
    }
  });

  btnSave?.addEventListener('click', async () => {
    const title = document.getElementById('inputJobTitle').value.trim();
    const company = document.getElementById('inputCompanyName').value.trim();
    const location = document.getElementById('inputLocation').value.trim();
    const jobType = document.getElementById('inputJobType').value;
    const workType = document.getElementById('inputWorkType').value;
    const description = document.getElementById('inputJobDescription').value.trim();
    const requirements = document.getElementById('inputJobRequirements').value.trim();
    const url = document.getElementById('inputUrl').value.trim();
    const closingDateValue = document.getElementById('inputClosingDate').value;

    if (!title || !company) {
      alert('Title and Company are required.');
      return;
    }

    try {
      const newDoc = doc(collection(db, 'jobs'));
      await setDoc(newDoc, {
        title,
        company,
        location,
        jobType,
        workType,
        description,
        requirements,
        url,
        postedAt: new Date(),
        closingDate: closingDateValue ? new Date(closingDateValue) : null,
        active: true,
        createdBy: auth.currentUser?.uid || 'unknown',
      });

      await loadJobs();
      alert('Job post created successfully.');
    } catch (error) {
      console.error('Error adding job post:', error);
      alert('Failed to add job post.');
    }
  });

  uploadInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const spinner = document.getElementById('loadingSpinner');
    spinner.style.visibility = 'visible';

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          for (const row of results.data) {
            await setDoc(doc(collection(db, 'jobs')), {
              title: row.title || '',
              company: row.company || '',
              location: row.location || '',
              jobType: row.jobType || '',
              workType: row.workType || '',
              description: row.description || '',
              requirements: row.requirements || '',
              url: row.url || '',
              industry: row.industry || 'general',
              postedAt: new Date(),
              closingDate: row.closingDate ? new Date(row.closingDate) : null,
              active: true,
              createdBy: auth.currentUser?.uid || 'unknown',
            });
          }
          await loadJobs();
        } catch (error) {
          console.error('Error uploading CSV data:', error);
          alert('CSV upload failed.');
        } finally {
          spinner.style.visibility = 'hidden';
          uploadInput.value = '';
        }
      },
    });
  });
});

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
