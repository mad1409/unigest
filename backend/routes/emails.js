const router = require('express').Router();
const auth   = require('../middleware/auth');
const admin  = require('../middleware/admin');
const { sendEmail, templateResultats, templateBienvenue } = require('../utils/mailer');
const pool   = require('../db');

// POST — envoyer résultats par email
router.post('/resultats', auth, admin, async (req, res) => {
  const { semestre, anneeAcademique } = req.body;
  try {
    const delibs = await pool.query(`
      SELECT d.*, e.name as etudiant_name, u.id as user_id,
        et.email as etudiant_email
      FROM deliberations d
      JOIN etudiants et ON et.id = d.etudiant_id
      LEFT JOIN users u ON u.etudiant_id = d.etudiant_id
      WHERE d.semestre=$1 AND d.annee_academique=$2
        AND et.email IS NOT NULL AND et.email != ''
    `, [semestre, anneeAcademique]);

    let envoyes = 0;
    let erreurs = 0;

    for (const d of delibs.rows) {
      const statut  = d.statut_jury || d.statut;
      const html    = templateResultats(d.etudiant_name, semestre, statut, parseFloat(d.moyenne_generale).toFixed(2));
      const result  = await sendEmail({
        to: d.etudiant_email,
        subject: `Resultats Semestre ${semestre} — UniGest`,
        html,
      });
      if (result.success) envoyes++;
      else erreurs++;
    }

    res.json({ success: true, envoyes, erreurs, total: delibs.rows.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — tester l'envoi d'email
router.post('/test', auth, admin, async (req, res) => {
  const { to } = req.body;
  try {
    const result = await sendEmail({
      to: to || process.env.SES_FROM_EMAIL,
      subject: 'Test UniGest — SES fonctionne !',
      html: '<h1 style="color:#34d399;">UniGest SES</h1><p>L\'envoi d\'email fonctionne correctement !</p>',
    });
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
