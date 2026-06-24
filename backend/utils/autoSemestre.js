const pool = require('../db');

async function updateSemestresAuto() {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Vérifier si un examen vient de se terminer dans le calendrier
    const examens = await pool.query(`
      SELECT * FROM calendrier 
      WHERE type = 'examen' 
      AND date_fin::date < $1
      AND date_fin::date >= $1 - INTERVAL '2 days'
    `, [today]);

    if (!examens.rows.length) {
      console.log('[AUTO-SEMESTRE] Aucun examen terminé récemment');
      return;
    }

    console.log('[AUTO-SEMESTRE] Examen terminé détecté:', examens.rows[0].titre);

    // Récupérer le semestre actuel des paramètres
    const params = await pool.query('SELECT * FROM parametres LIMIT 1');
    const semestreActuel = params.rows[0]?.semestre_actif || 1;

    // Mapping cycles → semestres
    const cycleSemestres = {
      'Licence 1': { actuel: 1, suivant: 2 },
      'Licence 2': { actuel: 3, suivant: 4 },
      'Licence 3': { actuel: 5, suivant: 6 },
      'Master 1':  { actuel: 7, suivant: 8 },
      'Master 2':  { actuel: 9, suivant: 10 },
    };

    // Pour chaque cycle, mettre à jour si le semestre actuel correspond
    for (const [cycle, sems] of Object.entries(cycleSemestres)) {
      if (semestreActuel === sems.actuel) {
        // Mettre à jour le semestre actif
        await pool.query(
          `UPDATE parametres SET semestre_actif = $1`,
          [sems.suivant]
        );
        console.log(`[AUTO-SEMESTRE] ${cycle}: S${sems.actuel} → S${sems.suivant}`);
        break;
      }
    }

    // Logger l'action
    await pool.query(`
      INSERT INTO audit_logs (user_id, user_role, action, table_name, details)
      VALUES ('system', 'system', 'AUTO_SEMESTRE', 'parametres', $1)
    `, [JSON.stringify({ 
      ancienSemestre: semestreActuel, 
      examens: examens.rows.map(e => e.titre) 
    })]);

  } catch(e) {
    console.error('[AUTO-SEMESTRE] Erreur:', e.message);
  }
}

module.exports = { updateSemestresAuto };
