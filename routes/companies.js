"use strict";

const express = require("express");
const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const router = express.Router();


router.get('/', async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name 
            FROM companies`
    );

    return res.json({ companies: results.rows });
})

router.get('/:code', async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name, description 
            FROM companies
            WHERE code = $1    
        `, [req.params.code]
    );
    console.log("results.rows", results.rows);

    if (results.rows.length === 0) {
        throw new NotFoundError();
    }

    return res.json({ company: results.rows[0] });
})

router.post('/', async function (req, res, next) {
    const { code, name, description } = req.body;
    const results = await db.query(
        `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description
        `, [code, name, description]
    );

    return res.json({ company: results.rows[0] });
})




module.exports = router;