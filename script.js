const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbyztosGiuGrRD4gzofMInbvVJpYEwqWWOuSapDhewCLmrPpmivNd1k8bj_2hVSwPGmoXA/exec";
const MEMORY_API_URL = "https://script.google.com/macros/s/AKfycbyOBCRYMtViaZ7ZLo3qoju3PBjfHliOEKlwUeIvLEICKjW12t5gFnZ3kdDgN53_XQQ8/exec";
const CLOUDINARY_CLOUD_NAME = "dy41xrm4i";
const CLOUDINARY_UPLOAD_PRESET = "hope21_videos";
const MEMORY_WALL_TEST_MODE = true;
const MEMORY_WALL_OPEN_DATE = new Date("2026-12-19T00:00:00+02:00");

const eventDate = new Date('2026-12-19T11:30:00+02:00');
const GUEST_LIST_HIDE_DATE = new Date('2026-12-19T00:00:00+02:00');
const daysEl = document.getElementById('days');

let verifiedGuest = null;

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

function normalizeName(s) {
  return String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
}

async function rsvpApi(action, data = {}) {
  const response = await fetch(RSVP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...data })
  });
  return await response.json();
}

async function memoryApi(action, data = {}) {
  const response = await fetch(MEMORY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...data })
  });
  return await response.json();
}


function updateGuestListVisibility() {
  const guestListSection = document.getElementById("guestListSection");
  if (!guestListSection) return;

  const shouldHide = new Date() >= GUEST_LIST_HIDE_DATE;
  guestListSection.style.display = shouldHide ? "none" : "";
}

async function renderGuests() {
  const list = document.getElementById('list');
  const count = document.getElementById('count');
  if (!list || !count) return;

  try {
    const result = await rsvpApi("listPublic");
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
    const f = new FormData(e.target);
    const guest = {
      name: f.get('name').trim(),
      surname: f.get('surname').trim(),
      phone: f.get('phone').trim(),
      song: f.get('song').trim()
    };

    try {
      msg.textContent = "Saving RSVP...";
      await rsvpApi("addGuest", { guest });
      e.target.reset();
      msg.textContent = `✓ Thank you, ${guest.name}. You're officially on the guest list.`;
      renderGuests();
    } catch {
      msg.textContent = "Could not save RSVP. Please try again.";
    }
  });
}

updateGuestListVisibility();
renderGuests();
setInterval(updateGuestListVisibility, 60000);
setInterval(renderGuests, 30000);

function setupMemoryWall() {
  const locked = document.getElementById("memoryLocked");
  const open = document.getElementById("memoryOpen");
  if (!locked || !open) return;

  const isOpen = MEMORY_WALL_TEST_MODE || new Date() >= MEMORY_WALL_OPEN_DATE;
  locked.style.display = isOpen ? "none" : "block";
  open.style.display = isOpen ? "block" : "none";

  setMemoryControls(false);

  document.getElementById("verifyGuestBtn")?.addEventListener("click", verifyMemoryGuest);
  document.getElementById("memoryName")?.addEventListener("input", () => {
    verifiedGuest = null;
    setMemoryControls(false);
    const badge = document.getElementById("verifiedBadge");
    if (badge) badge.style.display = "none";
  });
  document.getElementById("photoInput")?.addEventListener("change", e => uploadMemoryFile(e.target.files[0], "photo"));
  document.getElementById("videoInput")?.addEventListener("change", e => uploadMemoryFile(e.target.files[0], "video"));
  document.getElementById("sendMessageBtn")?.addEventListener("click", sendMemoryMessage);
}

function setMemoryControls(enabled) {
  const photoInput = document.getElementById("photoInput");
  const videoInput = document.getElementById("videoInput");
  const messageBtn = document.getElementById("sendMessageBtn");
  const photoLabel = document.getElementById("photoLabel");
  const videoLabel = document.getElementById("videoLabel");

  if (photoInput) photoInput.disabled = !enabled;
  if (videoInput) videoInput.disabled = !enabled;
  if (messageBtn) messageBtn.disabled = !enabled;

  photoLabel?.classList.toggle("disabled", !enabled);
  videoLabel?.classList.toggle("disabled", !enabled);
}

function getMemoryName() {
  return (document.getElementById("memoryName")?.value || "").trim();
}

function setMemoryStatus(text) {
  const status = document.getElementById("memoryStatus");
  if (status) status.textContent = text;
}

async function verifyMemoryGuest() {
  const enteredName = getMemoryName();

  if (!enteredName) {
    setMemoryStatus("Please enter your full RSVP name first.");
    return;
  }

  try {
    setMemoryStatus("Verifying guest...");
    const result = await rsvpApi("listPublic");
    const guests = result.guests || [];
    const target = normalizeName(enteredName);

    const found = guests.find(g => normalizeName(`${g.name} ${g.surname}`) === target);

    if (found) {
      verifiedGuest = found;
      setMemoryControls(true);
      const badge = document.getElementById("verifiedBadge");
      if (badge) badge.style.display = "block";
      setMemoryStatus(`✓ Guest verified. Welcome, ${found.name}.`);
    } else {
      verifiedGuest = null;
      setMemoryControls(false);
      const badge = document.getElementById("verifiedBadge");
      if (badge) badge.style.display = "none";
      setMemoryStatus("Verification failed. Please enter your name exactly as used for RSVP.");
    }
  } catch {
    verifiedGuest = null;
    setMemoryControls(false);
    setMemoryStatus("Could not verify guest. Please check your connection and try again.");
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadMemoryFile(file, type) {
  if (!file) return;

  if (!verifiedGuest) {
    setMemoryStatus("Please verify your name before uploading.");
    return;
  }

  const fullName = `${verifiedGuest.name} ${verifiedGuest.surname}`.trim();

  if (type === "video") {
    await uploadVideoToCloudinary(file, fullName);
    return;
  }

  try {
    setMemoryStatus("Uploading photo...");
    const base64 = await fileToBase64(file);
    const result = await memoryApi("uploadMemory", {
      name: fullName,
      type: "photo",
      fileName: file.name,
      mimeType: file.type,
      base64
    });
    setMemoryStatus(result.ok ? "✓ Photo uploaded for Hope." : "Upload failed. Please try again.");
  } catch {
    setMemoryStatus("Upload failed. Please try again.");
  }
}

async function uploadVideoToCloudinary(file, fullName) {
  if (file.size > 80 * 1024 * 1024) {
    setMemoryStatus("Video is too large. Please keep it short, ideally around 10 seconds.");
    return;
  }

  try {
    setMemoryStatus("Uploading video...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "hope21/videos");
    formData.append("resource_type", "video");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
      setMemoryStatus("Video upload failed. Please try again.");
      return;
    }

    const mp4Url = result.secure_url.replace("/upload/", "/upload/f_mp4,q_auto/");

    const logResult = await memoryApi("saveCloudinaryVideo", {
      name: fullName,
      type: "video",
      fileName: file.name,
      cloudinaryUrl: mp4Url,
      originalUrl: result.secure_url,
      publicId: result.public_id,
      status: "READY"
    });

    setMemoryStatus(logResult.ok ? "✓ Video uploaded for Hope." : "Video uploaded, but could not be logged.");
  } catch {
    setMemoryStatus("Video upload failed. Please try again.");
  }
}

async function sendMemoryMessage() {
  if (!verifiedGuest) {
    setMemoryStatus("Please verify your name before sending a message.");
    return;
  }

  const messageEl = document.getElementById("memoryMessage");
  const message = (messageEl?.value || "").trim();

  if (!message) {
    setMemoryStatus("Please write a message first.");
    return;
  }

  const fullName = `${verifiedGuest.name} ${verifiedGuest.surname}`.trim();

  try {
    setMemoryStatus("Sending message...");
    const result = await memoryApi("saveMessage", { name: fullName, message });
    if (result.ok) {
      messageEl.value = "";
      setMemoryStatus("✓ Message saved for Hope.");
    } else {
      setMemoryStatus("Message could not be saved.");
    }
  } catch {
    setMemoryStatus("Message could not be saved.");
  }
}

setupMemoryWall();

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
