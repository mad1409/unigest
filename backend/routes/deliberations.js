
const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const admin  = require('../middleware/admin');

// GET — toutes les délibérations
router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT d.*, e.name as etudiant_name, e.matricule,
        f.code as filiere_code, f.name as filiere_name
      FROM deliberations d
      JOIN etudiants e ON e.id = d.etudiant_id
      LEFT JOIN filieres f ON f.id = e.filiere_id
      ORDER BY d.created_at DESC
    `);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — calculer automatiquement les délibérations
router.post('/calculer', auth, admin, async (req, res) => {
  const { semestre, anneeAcademique, seuilAdmis, seuilRattrapage } = req.body;
  const seuil1 = parseFloat(seuilAdmis)      || 10;
  const seuil2 = parseFloat(seuilRattrapage) || 8;

  try {
    // Récupérer tous les étudiants avec leurs notes pour ce semestre
    const etudiants = await pool.query(
      'SELECT * FROM etudiants WHERE archive IS NOT TRUE'
    );

    let resultats = [];

    for (const etu of etudiants.rows) {
      // Récupérer les UEs du semestre de la filière de l'étudiant
      const ues = await pool.query(`
        SELECT u.*, m.id as matiere_id, m.name as matiere_name,
          m.credit_ecue, m.coefficient
        FROM ues u
        JOIN matieres m ON m.ue_id = u.id
        WHERE u.semestre = $1
          AND $2 = ANY(u.filiere_ids)
      `, [semestre, etu.filiere_id]);

      if (!ues.rows.length) continue;

      // Récupérer les notes
      const notes = await pool.query(`
        SELECT n.*, m.credit_ecue, m.coefficient
        FROM notes n
        JOIN matieres m ON m.id = n.matiere_id
        WHERE n.etudiant_id = $1
          AND n.semestre = $2
          AND n.annee_academique = $3
      `, [etu.id, semestre, anneeAcademique]);

      // Calculer moyenne
      let totalPoints  = 0;
      let totalCredits = 0;
      let creditsValides = 0;

      for (const ue of ues.rows) {
        const note = notes.rows.find(n => n.matiere_id === ue.matiere_id);
        const credit = parseFloat(ue.credit_ecue) || 1;

        if (note) {
          const nc = parseFloat(note.note_classe) || 0;
          const ne = note.note_examen !== null ? parseFloat(note.note_examen) : null;
          const nm = ne !== null ? (nc + 2*ne) / 3 : nc;

          totalPoints  += nm * credit;
          totalCredits += credit;
          if (nm >= seuil1) creditsValides += credit;
        } else {
          totalCredits += credit;
        }
      }

      const moyenne = totalCredits > 0 ? totalPoints / totalCredits : 0;

      let statut = 'ajourne';
      if (moyenne >= seuil1) statut = 'admis';
      else if (moyenne >= seuil2) statut = 'rattrapage';

      // Insérer ou mettre à jour
      await pool.query(`
        INSERT INTO deliberations
          (etudiant_id, semestre, annee_academique, moyenne_generale,
           credits_valides, credits_total, statut)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (etudiant_id, semestre, annee_academique)
        DO UPDATE SET
          moyenne_generale = $4, credits_valides = $5,
          credits_total = $6, statut = $7
      `, [etu.id, semestre, anneeAcademique,
          moyenne.toFixed(2), creditsValides, totalCredits, statut]);

      resultats.push({
        etudiantId: etu.id,
        name: etu.name,
        matricule: etu.matricule,
        moyenne: moyenne.toFixed(2),
        statut,
        creditsValides,
        creditsTotal: totalCredits,
      });
    }

    res.json({ success: true, count: resultats.length, resultats });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — modifier le statut manuellement (décision jury)
router.put('/:id/jury', auth, admin, async (req, res) => {
  const { statutJury, observations } = req.body;
  try {
    await pool.query(`
      UPDATE deliberations
      SET statut_jury=$1, observations=$2,
          delibere_par=$3, delibere_le=NOW()
      WHERE id=$4
    `, [statutJury, observations||null, req.user.id, req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
