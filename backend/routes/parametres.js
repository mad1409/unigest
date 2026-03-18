
const router = require('express').Router();
const pool   = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM parametres LIMIT 1');
    res.json(r.rows[0] || {});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/', async (req, res) => {
  const { nomEtablissement, anneeAcademique, anneeActive, semestreActif, anneesDisponibles, logo, semestresCycles } = req.body;
  try {
    const annees = Array.isArray(anneesDisponibles)
      ? anneesDisponibles.join(",")
      : (anneesDisponibles||"2025/2026");
    await pool.query(`
      UPDATE parametres SET
        nom_etablissement=$1, annee_academique=$2, annee_active=$3,
        semestre_actif=$4, annees_disponibles=$5, logo=$6, semestres_par_cycle=$7
      WHERE id=1
    `, [nomEtablissement, anneeAcademique||anneeActive, anneeActive||anneeAcademique,
        parseInt(semestreActif)||1, annees, logo||null,
        JSON.stringify(semestresCycles||{"L1":1,"L2":3,"L3":5,"M1":7,"M2":9})]);
    const r = await pool.query('SELECT * FROM parametres LIMIT 1');
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
