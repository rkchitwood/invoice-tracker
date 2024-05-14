const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('search', async function(req, res, next){
    try{
        const result = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`
        );
        return res.json({'companies': result.rows});
    }catch(err){
        return next(err);
    }
});

router.get('/:code', async function(req, res, next){
    try{
        const code = req.params.code;
        const result = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
            [code]
        );
        return res.json({'company': result.rows[0]});
    }catch(err){
        return next(err);
    }
});

router.post('/', async function(req, res, next){
    try{
        const { code, name, description } = req.body;
        const result = await db.query(
            `INERT INTO companies (code, name, description)
            VALUES($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json({'company': result.rows[0]});
    }catch(err){
        return next(err);
    }
});

router.put('/:code', async function(req, res, next){
    try{
        const { name, description } = req.body;
        const code = req.params.code;
        const result = await db.query(
            `UPDATE companies
            SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]
        );
        if(result.rows.length === 0){
            throw new ExpressError('no company found', 404)
        }else{
            return res.json({'company': result.rows[0]});
        }
    }catch(err){
        return next(err);
    }
})

router.delete('/:code', async function(req, res, next){
    try{
        let code = req.params.code;
        const result = await db.query(
            `DELETE FROM companies
            WHERE code=$1
            RETURNING code`,
            [code]
        );
        if(result.rows.length === 0 ){
            throw new ExpressError('no company found', 404)
        }else{
            return res.json({'status': 'deleted'});
        }
    }catch(err){
        return next(err);
    }
});

module.exports = router;