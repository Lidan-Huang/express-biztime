"use strict";

const express = require("express");
const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const router = express.Router();

/** Get all the companies' code and name:
 * {companies: [{code, name}, ...]}
 */
router.get('/', async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name 
            FROM companies`
    );

    return res.json({ companies: results.rows });
})

/** Get a company data,
 * {company: {code, name, description}}
 */
router.get('/:code', async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name, description 
            FROM companies
            WHERE code = $1    
        `, [req.params.code]
    );

    if (results.rows.length === 0) {
        throw new NotFoundError();
    }

    return res.json({ company: results.rows[0] });
})

/** Add a new company, and returns:
 * {company: {code, name, description}}
*/
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
f
/** If the company exists, update the data according the client given, or
 * return error message
 */
router.put('/:code', async function (req, res, next) {
    const { name, description } = req.body;
    const results = await db.query(
        `UPDATE companies
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description
        `, [name, description, req.params.code]
    );
    
    if (results.rows.length === 0) {
        throw new NotFoundError();
    }
    return res.json({ company: results.rows[0] });
})

/** Delete a company according given code, and return a message; if the 
 *  code doesn't match, return error message of 404.
 */
router.delete('/:code', async function (req, res, next) {
    const getResults = await db.query(
        `SELECT code, name, description 
            FROM companies
            WHERE code = $1    
        `, [req.params.code]
    );

    if (getResults.rows.length === 0) {
        throw new NotFoundError();
    }

    const deleteResults = await db.query(
        `DELETE FROM companies
            WHERE code = $1
        `, [req.params.code]
    );
    return res.json({ status: "deleted" });
})


module.exports = router;