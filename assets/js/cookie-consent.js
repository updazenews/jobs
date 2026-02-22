(function () {
  const STORAGE_KEY = 'sebenza_cookie_notice_ack';

  if (localStorage.getItem(STORAGE_KEY) === '1') {
    return;
  }

  const banner = document.createElement('div');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.style.position = 'fixed';
  banner.style.left = '1rem';
  banner.style.right = '1rem';
  banner.style.bottom = '1rem';
  banner.style.zIndex = '9999';
  banner.style.background = '#111827';
  banner.style.color = '#ffffff';
  banner.style.padding = '0.85rem 1rem';
  banner.style.borderRadius = '0.75rem';
  banner.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
  banner.style.display = 'flex';
  banner.style.alignItems = 'center';
  banner.style.justifyContent = 'space-between';
  banner.style.gap = '0.75rem';
  banner.style.flexWrap = 'wrap';

  const message = document.createElement('p');
  message.style.margin = '0';
  message.style.fontSize = '0.95rem';
  message.textContent = 'We are collecting cookies to keep the website running.';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'OK';
  button.style.border = '0';
  button.style.padding = '0.45rem 0.9rem';
  button.style.borderRadius = '0.5rem';
  button.style.background = '#2563eb';
  button.style.color = '#fff';
  button.style.cursor = 'pointer';
  button.addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, '1');
    banner.remove();
  });

  banner.appendChild(message);
  banner.appendChild(button);
  document.body.appendChild(banner);
})();
