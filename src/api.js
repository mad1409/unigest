
function normalizeNote(n) {
  if (!n) return n;
  return {
    id:          n.id,
    etudiantId:  n.etudiant_id  || n.etudiantId,
    ueId:        n.ue_id        || n.ueId,
    matiereId:   n.matiere_id   || n.matiereId,
    noteClasse:  n.note_classe  !== undefined ? n.note_classe  : n.noteClasse,
    noteExamen:  n.note_examen  !== undefined ? n.note_examen  : n.noteExamen,
    semestre:    n.semestre,
  };
}


const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  try { return JSON.parse(localStorage.getItem('unigest_session'))?.token || ''; }
  catch { return ''; }
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

export const api = {
  getSites:       ()           => request('GET',    '/sites'),
  createSite:     (data)       => request('POST',   '/sites', data),
  updateSite:     (id, data)   => request('PUT',    '/sites/'+id, data),
  deleteSite:     (id)         => request('DELETE', '/sites/'+id),
  getCalendrier:     (annee)      => request('GET',    '/calendrier?annee='+(annee||'2025/2026')),
  getCalendrierPublic:(annee)      => fetch((import.meta.env.VITE_API_URL||'/api')+'/calendrier/public?annee='+(annee||'2025/2026')).then(r=>r.json()),
  createEvenement:   (data)       => request('POST',   '/calendrier', data),
  updateEvenement:   (id, data)   => request('PUT',    '/calendrier/'+id, data),
  deleteEvenement:   (id)         => request('DELETE', '/calendrier/'+id),
  getDeliberations:    ()                          => request('GET',  '/deliberations'),
  calculerDeliberation:(data)                       => request('POST', '/deliberations/calculer', data),
  updateJury:          (id, data)                   => request('PUT',  '/deliberations/'+id+'/jury', data),
  getPublicParametres: () => fetch(BASE.replace('/api','') + '/api/parametres/public').then(r=>r.json()).catch(()=>({})),
  // Auth
  login:          (id, password, role) => request('POST', '/auth/login',          { id, password, role }),
  resetEtudiantPassword: (etudiantId, newPassword) => request('POST', '/auth/reset-etudiant', { etudiantId, newPassword }),
  changePassword: (userId, oldPassword, newPassword) => request('POST', '/auth/change-password', { userId, oldPassword, newPassword }),

  // Données
  getFilieres:    ()       => request('GET',    '/filieres'),
  createFiliere:  (data)   => request('POST',   '/filieres',    data),
  updateFiliere:  (id, d)  => request('PUT',    '/filieres/'+id, d),
  deleteFiliere:  (id)     => request('DELETE', '/filieres/'+id),

  getEtudiants:   ()       => request('GET',    '/etudiants'),
  createEtudiant: (data)   => request('POST',   '/etudiants',    data),
  updateEtudiant: (id, d)  => request('PUT',    '/etudiants/'+id, d),
  deleteEtudiant: (id)     => request('DELETE', '/etudiants/'+id),

  getUEs:         ()       => request('GET',    '/ues'),
  createUE:       (data)   => request('POST',   '/ues',    data),
  updateUE:       (id, d)  => request('PUT',    '/ues/'+id, d),
  deleteUE:       (id)     => request('DELETE', '/ues/'+id),

  getNotes:       async (params) => {
    const notes = await request('GET', '/notes?' + new URLSearchParams(params));
    return Array.isArray(notes) ? notes.map(normalizeNote) : notes;
  },
  saveNote:       (data)   => request('POST',   '/notes',  data),
  deleteNote:     (id)     => request('DELETE', '/notes/'+id),

  getEDT:         ()       => request('GET',    '/edt'),
  createEDT:      (data)   => request('POST',   '/edt',    data),
  updateEDT:      (id, d)  => request('PUT',    '/edt/'+id, d),
  deleteEDT:      (id)     => request('DELETE', '/edt/'+id),
  createSlot:     (edtId, data) => request('POST',   '/edt/'+edtId+'/slots', data),
  updateSlot:     (edtId, slotId, d) => request('PUT', '/edt/'+edtId+'/slots/'+slotId, d),
  deleteSlot:     (edtId, slotId)    => request('DELETE', '/edt/'+edtId+'/slots/'+slotId),

  getGroupes:     ()       => request('GET',    '/groupes'),
  createGroupe:   (data)   => request('POST',   '/groupes',    data),
  updateGroupe:   (id, d)  => request('PUT',    '/groupes/'+id, d),
  deleteGroupe:   (id)     => request('DELETE', '/groupes/'+id),

  getProfesseurs: ()       => request('GET',    '/professeurs'),
  createProf:     (data)   => request('POST',   '/professeurs',    data),
  updateProf:     (id, d)  => request('PUT',    '/professeurs/'+id, d),
  deleteProf:     (id)     => request('DELETE', '/professeurs/'+id),

  getUsers:       ()       => request('GET',    '/users'),
  createUser:     (data)   => request('POST',   '/users',    data),
  resetPassword:  (id, newPassword) => request('PUT', '/users/'+id+'/password', { newPassword }),
  deleteUser:     (id)     => request('DELETE', '/users/'+id),

  getParametres:  ()       => request('GET',    '/parametres'),
  updateParametres: (d)    => request('PUT',    '/parametres', d),
};
