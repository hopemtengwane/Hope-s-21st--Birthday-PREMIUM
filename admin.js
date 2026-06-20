const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbyztosGiuGrRD4gzofMInbvVJpYEwqWWOuSapDhewCLmrPpmivNd1k8bj_2hVSwPGmoXA/exec";
const ADMIN_PIN = "01October";

async function api(action, data = {}) {
  const response = await fetch(RSVP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, pin: ADMIN_PIN, ...data })
  });
  return await response.json();
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[m]));
}

async function render() {
  const q = document.getElementById('q').value.toLowerCase();
  const rows = document.getElementById('rows');

  if (RSVP_API_URL.includes("PASTE_YOUR")) {
    rows.innerHTML = "<tr><td colspan='5'>RSVP system not connected yet.</td></tr>";
    return;
  }

  try {
    const result = await api("listAdmin");
    const guests = result.guests || [];
    rows.innerHTML = "";
    guests
      .filter(g => `${g.name} ${g.surname} ${g.phone} ${g.song}`.toLowerCase().includes(q))
      .forEach(g => {
        rows.innerHTML += `<tr>
          <td><input data-id="${g.id}" data-f="name" value="${esc(g.name)}"></td>
          <td><input data-id="${g.id}" data-f="surname" value="${esc(g.surname)}"></td>
          <td><input data-id="${g.id}" data-f="phone" value="${esc(g.phone)}"></td>
          <td><input data-id="${g.id}" data-f="song" value="${esc(g.song)}"></td>
          <td><button data-del="${g.id}">Delete</button></td>
        </tr>`;
      });
  } catch {
    rows.innerHTML = "<tr><td colspan='5'>Guest list could not load.</td></tr>";
  }
}

document.addEventListener('input', async e => {
  if (e.target.id === 'q') return render();
  if (e.target.dataset.id) {
    await api("updateGuest", {
      id: e.target.dataset.id,
      field: e.target.dataset.f,
      value: e.target.value
    });
  }
});

document.addEventListener('click', async e => {
  if (e.target.dataset.del) {
    await api("deleteGuest", { id: e.target.dataset.del });
    render();
  }
});

document.getElementById('export').onclick = async () => {
  const result = await api("listAdmin");
  const guests = result.guests || [];
  const rows = [['Name','Surname','Phone','Song','Submitted At'], ...guests.map(g => [g.name,g.surname,g.phone,g.song,g.submittedAt])];
  const csv = rows.map(r => r.map(v => `"${String(v || '').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hope-21-rsvps.csv';
  a.click();
  URL.revokeObjectURL(url);
};

render();
setInterval(render, 30000);
