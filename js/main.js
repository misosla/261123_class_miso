// ===== 예식 날짜 설정 (여기만 바꾸면 달력/카운트다운이 함께 바뀝니다) =====
const WEDDING_DATE = new Date(2027, 4, 15, 13, 0, 0); // 월은 0부터 시작 (4 = 5월)

// ===== 예식장 주소 (지도와 길찾기 버튼에 사용) =====
const VENUE_NAME = '더채플 서울';
const VENUE_ADDRESS = '서울특별시 강남구 테헤란로 123';

// ===== 달력 그리기 =====
function renderCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const weddingDay = WEDDING_DATE.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  let html = `<p class="calendar-month">${year}년 ${month + 1}월</p>`;
  html += '<div class="calendar-grid">';

  dayNames.forEach((name, i) => {
    const cls = i === 0 ? 'sun' : i === 6 ? 'sat' : '';
    html += `<div class="day-name ${cls}">${name}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += '<div></div>';
  }

  for (let d = 1; d <= lastDate; d++) {
    const weekday = (firstDay + d - 1) % 7;
    const classes = ['date'];
    if (weekday === 0) classes.push('sun');
    if (weekday === 6) classes.push('sat');
    if (d === weddingDay) classes.push('wedding');
    html += `<div class="${classes.join(' ')}">${d}</div>`;
  }

  html += '</div>';
  document.getElementById('calendar').innerHTML = html;
}

// ===== D-day 카운트다운 =====
function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  const text = document.getElementById('dday-text');

  if (diff <= 0) {
    ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].forEach(id => {
      document.getElementById(id).textContent = 0;
    });
    text.innerHTML = '민준 ♥ 서연의 결혼식이 <strong>진행되었습니다</strong>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = days;
  document.getElementById('cd-hours').textContent = hours;
  document.getElementById('cd-mins').textContent = mins;
  document.getElementById('cd-secs').textContent = secs;

  text.innerHTML = `민준 ♥ 서연의 결혼식이 <strong>${days + 1}일</strong> 남았습니다`;
}

// ===== 스크롤 시 섹션 등장 =====
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ===== 사진 불러오기 (사진 파일이 없으면 임시 색상을 보여줌) =====
function initImages() {
  document.querySelectorAll('.cover-photo img, .gallery-item img').forEach(img => {
    const markMissing = () => img.classList.add('img-missing');
    if (img.complete && img.naturalWidth === 0) {
      markMissing();
    } else {
      img.addEventListener('error', markMissing);
    }
  });
}

// ===== 갤러리 모달 =====
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modal-image');
  const modalImg = document.getElementById('modal-img');
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const thumb = items[current].querySelector('img');

    if (thumb && !thumb.classList.contains('img-missing')) {
      modalImg.src = thumb.src;
      modalImg.classList.remove('img-missing');
      modalImage.style.background = 'none';
    } else {
      // 사진이 없으면 썸네일의 임시 색상을 그대로 표시
      modalImg.classList.add('img-missing');
      modalImage.style.background = getComputedStyle(items[current]).backgroundImage;
    }
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      show(i);
      modal.classList.add('open');
    });
  });

  document.getElementById('modal-prev').addEventListener('click', () => show(current - 1));
  document.getElementById('modal-next').addEventListener('click', () => show(current + 1));
  document.getElementById('modal-close').addEventListener('click', () => modal.classList.remove('open'));

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') modal.classList.remove('open');
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

// ===== 지도 =====
function initMap() {
  const query = encodeURIComponent(VENUE_ADDRESS);

  // 구글 지도 임베드 (API 키 없이 사용 가능)
  const iframe = document.createElement('iframe');
  iframe.src = `https://maps.google.com/maps?q=${query}&z=16&output=embed`;
  iframe.loading = 'lazy';
  iframe.title = `${VENUE_NAME} 위치`;
  document.getElementById('map').appendChild(iframe);

  // 길찾기 앱 바로가기
  document.getElementById('btn-naver').href = `https://map.naver.com/p/search/${query}`;
  document.getElementById('btn-kakao').href = `https://map.kakao.com/link/search/${query}`;
  document.getElementById('btn-google').href = `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// ===== 방명록 =====
// 주의: 지금은 이 브라우저(localStorage)에만 저장됩니다.
// 하객들끼리 서로의 글을 보려면 Firebase 같은 서버 저장소 연결이 필요합니다.
const GUESTBOOK_KEY = 'wedding-guestbook';

function loadGuestbook() {
  try {
    return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestbook(entries) {
  try {
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries));
  } catch {
    showToast('저장에 실패했습니다');
  }
}

function renderGuestbook() {
  const list = document.getElementById('guestbook-list');
  const entries = loadGuestbook();
  list.innerHTML = '';

  if (entries.length === 0) {
    list.innerHTML = '<li class="gb-empty">첫 번째 축하 메시지를 남겨주세요 💐</li>';
    return;
  }

  entries.forEach(entry => {
    // textContent를 사용해 입력한 글이 HTML로 해석되지 않도록 함
    const li = document.createElement('li');

    const head = document.createElement('div');
    head.className = 'gb-head';
    const name = document.createElement('span');
    name.className = 'gb-name';
    name.textContent = entry.name;
    const date = document.createElement('span');
    date.className = 'gb-date';
    date.textContent = entry.date;
    head.append(name, date);

    const message = document.createElement('p');
    message.className = 'gb-message';
    message.textContent = entry.message;

    const del = document.createElement('button');
    del.className = 'gb-delete';
    del.setAttribute('aria-label', '삭제');
    del.textContent = '×';
    del.addEventListener('click', () => {
      if (!confirm('이 메시지를 삭제할까요?')) return;
      saveGuestbook(loadGuestbook().filter(e => e.id !== entry.id));
      renderGuestbook();
    });

    li.append(head, message, del);
    list.appendChild(li);
  });
}

function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const nameInput = document.getElementById('gb-name');
  const messageInput = document.getElementById('gb-message');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    if (!name || !message) return;

    const now = new Date();
    const entries = loadGuestbook();
    entries.unshift({
      id: now.getTime(),
      name,
      message,
      date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
    });
    saveGuestbook(entries);
    renderGuestbook();

    form.reset();
    showToast('축하 메시지가 등록되었습니다');
  });

  renderGuestbook();
}

// ===== 계좌 아코디언 =====
function initAccordion() {
  document.querySelectorAll('.accordion').forEach(acc => {
    const header = acc.querySelector('.accordion-header');
    const body = acc.querySelector('.accordion-body');

    header.addEventListener('click', () => {
      const isOpen = acc.classList.toggle('open');
      body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0';
    });
  });
}

// ===== 토스트 메시지 =====
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== 클립보드 복사 =====
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // file:// 로 열었을 때 등 clipboard API를 쓸 수 없는 경우 대비
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await copyText(btn.dataset.copy);
      showToast('복사되었습니다');
    });
  });

  document.getElementById('btn-share').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: location.href });
      } catch { /* 사용자가 공유를 취소한 경우 */ }
    } else {
      await copyText(location.href);
      showToast('청첩장 링크가 복사되었습니다');
    }
  });
}

// ===== 실행 =====
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initFadeIn();
  initImages();
  initGallery();
  initMap();
  initGuestbook();
  initAccordion();
  initCopyButtons();
});
