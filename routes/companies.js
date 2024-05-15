const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');
let router = new express.Router();

router.get('/', async function(req, res, next){
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

//when viewing details for a company, you can see the names of the industries for that company
router.get('/:code', async function(req, res, next){
    try{
        const code = req.params.code;
        const compResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
            [code]
        );
        if(compResult.rows.length === 0){
            throw new ExpressError('no company found', 404);
        }
        const invResult = await db.query(
            `SELECT id
            FROM invoices
            WHERE comp_code=$1`,
            [code]
        );
        const indResult = await db.query(
            `SELECT i.name
            FROM industries AS i
                LEFT JOIN industry_companies AS ic
                    ON i.id=ic.industry_id
                LEFT JOIN companies AS c
                    ON ic.company_id = c.id
            WHERE c.id=$1`,
            [code]
        );
        const company = compResult.rows[0];
        const invoices = invResult.rows;
        const industries = indResult.rows;
        company.invoices = invoices.map(inv => inv.id);
        company.industries = industries.map(ind => ind.id)
        return res.json({'company': company});
    }catch(err){
        return next(err);
    }
});

router.post('/', async function(req, res, next){
    try{
        const { name, description } = req.body;
        const code = slugify(name, {lower: true});
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