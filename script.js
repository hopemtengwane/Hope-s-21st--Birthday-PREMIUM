const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbwyeI7esEoeE35scMaA703Z87U0PDTMLSsGSLFmuIhK1D6j-6fHRA4bOJrVA4oKy7VSIQ/exec";
const eventDate = new Date('2026-12-19T11:30:00+02:00');
const daysEl = document.getElementById('days');

function updateDays() {
  const d = Math.max(0, Math.ceil((eventDate - new Date()) / 86400000));
  if (daysEl) daysEl.textContent = d;
}
updateDays();
setInterval(updateDays, 3600000);

const obs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .18 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

const esc = s => String(s || '').replace(/[&<>"']/g, m => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
}[m]));

async function api(action, data = {}) {
  const response = await fetch(RSVP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...data })
  });
  return await response.json();
}

async function renderGuests() {
  const list = document.getElementById('list');
  const count = document.getElementById('count');
  if (!list || !count) return;

  if (RSVP_API_URL.includes("PASTE_YOUR")) {
    list.innerHTML = "<div class='guest'>RSVP system not connected yet.</div>";
    return;
  }

  try {
    const result = await api("listPublic");
    const guests = result.guests || [];
    count.textContent = guests.length;
    list.innerHTML = guests.length
      ? guests.map(g => `<div class='guest'>✓ ${esc(g.name)} ${esc(g.surname)}</div>`).join('')
      : `<div class='guest'>No RSVPs yet.</div>`;
  } catch {
    list.innerHTML = "<div class='guest'>Guest list could not load.</div>";
  }
}

const form = document.getElementById('form');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('msg');

    if (RSVP_API_URL.includes("PASTE_YOUR")) {
      msg.textContent = "RSVP system not connected yet.";
      return;
    }

    const f = new FormData(e.target);
    const guest = {
      name: f.get('name').trim(),
      surname: f.get('surname').trim(),
      phone: f.get('phone').trim(),
      song: f.get('song').trim()
    };

    try {
      msg.textContent = "Saving RSVP...";
      await api("addGuest", { guest });
      e.target.reset();
      msg.textContent = `✓ Thank you, ${guest.name}. You're officially on the guest list.`;
      renderGuests();
    } catch {
      msg.textContent = "Could not save RSVP. Please try again.";
    }
  });
}

renderGuests();
setInterval(renderGuests, 30000);

const loader = document.getElementById('loader');
const enter = document.getElementById('enterBtn');
const music = document.getElementById('music');
const musicBtn = document.getElementById('musicBtn');
let playing = false;

if (enter) {
  enter.onclick = () => {
    loader.classList.add('hide');
    if (music) {
      music.play().then(() => {
        playing = true;
        if (musicBtn) musicBtn.textContent = 'Ⅱ';
      }).catch(() => {});
    }
  };
}

if (musicBtn) {
  musicBtn.onclick = () => {
    if (playing) {
      music.pause();
      musicBtn.textContent = '♪';
      playing = false;
    } else {
      music.play().then(() => {
        musicBtn.textContent = 'Ⅱ';
        playing = true;
      }).catch(() => alert('Tap again to allow music.'));
    }
  };
}
