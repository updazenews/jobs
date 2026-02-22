import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db, auth } from '../../../assets/js/jobs.js';

document.addEventListener('DOMContentLoaded', async () => {
  const jobsTableBody = document.getElementById('tbJobs');
  const loadingDiv = document.getElementById('loadingDiv');
  const uploadInput = document.getElementById('uploadBtn');
  const btnSave = document.getElementById('btnSaveJob');
  const addJobModalEl = document.getElementById('exampleModal');
  const addJobModal = addJobModalEl && window.bootstrap ? window.bootstrap.Modal.getOrCreateInstance(addJobModalEl) : null;
  const headerSection = document.querySelector('main .border-bottom');

  const jobsState = { all: [], visible: [], view: 'active' };

  headerSection?.insertAdjacentHTML('beforeend', `
    <div class="admin-jobs-toolbar py-3 w-100">
      <div class="row g-2 align-items-center">
        <div class="col-12 col-md-5">
          <input id="adminJobSearch" class="form-control" type="search" placeholder="Search title, company, location" />
        </div>
        <div class="col-12 col-md-4">
          <div class="btn-group w-100" role="group" aria-label="View jobs filter">
            <button class="btn btn-outline-primary active" id="viewActive" type="button">Active jobs</button>
            <button class="btn btn-outline-secondary" id="viewArchive" type="button">Archives</button>
          </div>
        </div>
        <div class="col-12 col-md-3 text-md-end">
          <span class="badge text-bg-primary me-2" id="statTotal">Total: 0</span>
          <span class="badge text-bg-success" id="statActive">Active: 0</span>
        </div>
      </div>
    </div>
  `);

  const searchInput = document.getElementById('adminJobSearch');
  const statTotal = document.getElementById('statTotal');
  const statActive = document.getElementById('statActive');
  const viewActiveBtn = document.getElementById('viewActive');
  const viewArchiveBtn = document.getElementById('viewArchive');

  searchInput?.addEventListener('input', () => applyViewAndSearch());
  viewActiveBtn?.addEventListener('click', () => setView('active'));
  viewArchiveBtn?.addEventListener('click', () => setView('archive'));

  await loadJobs();

  function setView(view) {
    jobsState.view = view;
    viewActiveBtn.classList.toggle('active', view === 'active');
    viewActiveBtn.classList.toggle('btn-outline-primary', view !== 'active');
    viewActiveBtn.classList.toggle('btn-primary', view === 'active');
    viewArchiveBtn.classList.toggle('active', view === 'archive');
    viewArchiveBtn.classList.toggle('btn-outline-secondary', view !== 'archive');
    viewArchiveBtn.classList.toggle('btn-secondary', view === 'archive');
    applyViewAndSearch();
  }

  async function loadJobs() {
    loadingDiv.style.display = 'block';
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      const snapshot = await getDocs(q);

      jobsState.all = snapshot.docs.map((docRef) => normalizeJob(docRef.id, docRef.data()));
      renderStats();
      applyViewAndSearch();
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
      url: data.url || '',
      active: data.active !== false,
    };
  }

  function toDate(value) {
    if (!value) return null;
    if (value.toDate) return value.toDate();
    return new Date(value);
  }

  function isExpired(job) {
    if (!job.closingDate) return false;
    const end = new Date(job.closingDate);
    end.setHours(23, 59, 59, 999);
    return end < new Date();
  }

  function isArchived(job) {
    return !job.active || isExpired(job);
  }

  function applyViewAndSearch() {
    const searchTerm = String(searchInput?.value || '').toLowerCase().trim();

    let viewList = jobsState.all.filter((job) => (jobsState.view === 'archive' ? isArchived(job) : job.active && !isExpired(job)));

    if (searchTerm) {
      viewList = viewList.filter((job) => `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(searchTerm));
    }

    jobsState.visible = viewList;
    renderRows(viewList);
  }

  function renderStats() {
    statTotal.textContent = `Total: ${jobsState.all.length}`;
    statActive.textContent = `Active: ${jobsState.all.filter((job) => job.active && !isExpired(job)).length}`;
  }

  function renderRows(jobs) {
    jobsTableBody.innerHTML = '';

    if (!jobs.length) {
      jobsTableBody.innerHTML = `<tr><td colspan="8" class="text-muted">No ${jobsState.view === 'archive' ? 'archived' : 'active'} jobs found.</td></tr>`;
      return;
    }

    jobs.forEach((job) => {
      const statusBadge = isArchived(job)
        ? '<span class="badge text-bg-secondary">Archived</span>'
        : '<span class="badge text-bg-success">Active</span>';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a class="text-decoration-none" href="/details.html?id=${job.id}" target="_blank" rel="noopener noreferrer">${escapeHTML(job.title)}</a></td>
        <td>${escapeHTML(job.company)}</td>
        <td>${escapeHTML(job.location)}</td>
        <td>${escapeHTML(job.jobType)}</td>
        <td>${job.postedAt ? job.postedAt.toLocaleDateString('en-ZA') : '-'}</td>
        <td>${job.closingDate ? job.closingDate.toLocaleDateString('en-ZA') : '-'}</td>
        <td>${statusBadge}</td>
        <td>
          <a class="btn btn-sm btn-primary" href="././edit?id=${job.id}">Edit</a>
          ${isArchived(job) ? '' : `<button class="btn btn-sm btn-danger delete-job" data-id="${job.id}" data-title="${escapeHTML(job.title)}">Archive</button>`}
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
      renderStats();
      applyViewAndSearch();
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

    if (!title || !company || !location || !description || !requirements) {
      alert('Please complete all required fields before saving.');
      return;
    }

    if (url && !/^https?:\/\//i.test(url)) {
      alert('Application URL must start with http:// or https://');
      return;
    }

    if (closingDateValue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(closingDateValue);
      if (selected < today) {
        alert('Closing date cannot be in the past for a new job post.');
        return;
      }
    }

    try {
      btnSave.disabled = true;
      btnSave.textContent = 'Saving...';

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
      addJobModal?.hide();
      addJobModalEl?.querySelector('form')?.reset();
      alert('Job post created successfully.');
    } catch (error) {
      console.error('Error adding job post:', error);
      alert('Failed to add job post.');
    } finally {
      btnSave.disabled = false;
      btnSave.textContent = 'Save changes';
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
