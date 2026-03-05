// Quick-search form redirects to jobs page and passes filters as query params.
const heroSearchForm = document.getElementById('heroSearchForm');

if (heroSearchForm) {
  heroSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(heroSearchForm);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (String(value).trim()) {
        params.set(key, String(value).trim());
      }
    }

    window.location.href = `/jobs.html${params.toString() ? `?${params.toString()}` : ''}`;
  });
}
