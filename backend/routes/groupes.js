
const router = require('express').Router();
const pool   = require('../db');
router.get('/',    async (req,res)=>{ try{res.json((await pool.query('SELECT * FROM groupes ORDER BY id')).rows);}catch(e){res.status(500).json({error:e.message});} });
router.post('/',   async (req,res)=>{ const{nom,filiereId,type,effectif}=req.body; try{res.json((await pool.query('INSERT INTO groupes(nom,filiere_id,type,effectif) VALUES($1,$2,$3,$4) RETURNING *',[nom,filiereId,type||'TD',effectif||30])).rows[0]);}catch(e){res.status(500).json({error:e.message});} });
router.put('/:id', async (req,res)=>{ const{nom,filiereId,type,effectif}=req.body; try{res.json((await pool.query('UPDATE groupes SET nom=$1,filiere_id=$2,type=$3,effectif=$4 WHERE id=$5 RETURNING *',[nom,filiereId,type,effectif,req.params.id])).rows[0]);}catch(e){res.status(500).json({error:e.message});} });
router.delete('/:id', async (req,res)=>{ try{await pool.query('DELETE FROM groupes WHERE id=$1',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});} });
module.exports = router;
