const router = require('express').Router();
const pool   = require('../db');
const adminMw = require('../middleware/admin');

// GET — liste toutes les années
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM annees_academiques ORDER BY date_debut DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — créer une nouvelle année
router.post('/', adminMw, async (req, res) => {
  const { libelle, date_debut, date_fin } = req.body;
  if (!libelle || !date_debut || !date_fin)
    return res.status(400).json({ error: 'libelle, date_debut et date_fin requis' });
  try {
    const r = await pool.query(
      'INSERT INTO annees_academiques (libelle, date_debut, date_fin, active, tenant_id) VALUES ($1,$2,$3,false,$4) RETURNING *',
      [libelle, date_debut, date_fin, req.user.tenant_id || null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /:id/activer — activer une année + archiver l'ancienne + faire monter les étudiants
router.put('/:id/activer', adminMw, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = req.params.id;

    // 1. Désactiver toutes les autres années
    await client.query('UPDATE annees_academiques SET active=false');

    // 2. Activer la nouvelle
    await client.query('UPDATE annees_academiques SET active=true WHERE id=$1', [newId]);

    // 3. Archiver les notes et délibérations en leur assignant l'ancienne année active
    const ancienne = await client.query(
      'SELECT id FROM annees_academiques WHERE active=false ORDER BY date_debut DESC LIMIT 1'
    );
    if (ancienne.rows.length) {
      const ancienneId = ancienne.rows[0].id;
      await client.query(
        'UPDATE notes SET annee_id=$1 WHERE annee_id IS NULL', [ancienneId]
      );
      await client.query(
        'UPDATE deliberations SET annee_id=$1 WHERE annee_id IS NULL', [ancienneId]
      );
    }

    // 4. Faire monter les étudiants de niveau (L1→L2, L2→L3, M1→M2)
    const niveaux = [
      { de: 'Licence 1', vers: 'Licence 2' },
      { de: 'Licence 2', vers: 'Licence 3' },
      { de: 'Master 1',  vers: 'Master 2'  },
    ];
    for (const n of niveaux) {
      await client.query(`
        UPDATE etudiants SET filiere_id = filieres_cible.id, annee_id = $3
        FROM filieres AS filieres_source
        JOIN filieres AS filieres_cible ON filieres_cible.cycle = $2
          AND filieres_cible.domaine = filieres_source.domaine
          AND SPLIT_PART(filieres_cible.code, '-', 1) = SPLIT_PART(filieres_source.code, '-', 1)
        WHERE etudiants.filiere_id = filieres_source.id
          AND filieres_source.cycle = $1
      `, [n.de, n.vers, newId]);
    }

    // 5. Mettre à jour annee_academique texte sur les étudiants
    const annee = await client.query('SELECT libelle FROM annees_academiques WHERE id=$1', [newId]);
    await client.query(
      'UPDATE etudiants SET annee_academique=$1, annee_id=$2 WHERE annee_id IS NULL OR annee_id=$2',
      [annee.rows[0]?.libelle, newId]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Nouvelle année activée, étudiants mis à jour' });
  } catch(e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

// DELETE /:id
router.delete('/:id', adminMw, async (req, res) => {
  try {
    const check = await pool.query('SELECT active FROM annees_academiques WHERE id=$1', [req.params.id]);
    if (check.rows[0]?.active) return res.status(400).json({ error: 'Impossible de supprimer l année active' });
    await pool.query('DELETE FROM annees_academiques WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
