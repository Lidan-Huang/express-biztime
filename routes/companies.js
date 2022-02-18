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
});

/** Get a company data,
 * {company: {code, name, description, 
 *  invoices: [{id, amt, paid, add_date, paid_date, comp_code}, ...]}}
 */
router.get('/:code', async function (req, res, next) {
    const companyResults = await db.query(
        `SELECT code, name, description 
            FROM companies
            WHERE code = $1    
        `, [req.params.code]
    );

    if (companyResults.rows.length === 0) {
        throw new NotFoundError();
    }

    const company = companyResults.rows[0];

    const invoiceResults = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, comp_code 
            FROM invoices
            WHERE comp_code = $1      
        `, [req.params.code]
    );

    company.invoices = invoiceResults.rows;

    return res.json({ company });
});

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
});

/** Update company, returns:
 * {company: {code, name, description}}
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
});

/** Delete company, returns:
 * {status: "deleted"}
 */
router.delete('/:code', async function (req, res, next) {
    const results = await db.query(
        `DELETE FROM companies
            WHERE code = $1
            RETURNING code
        `, [req.params.code]
    );
    if (results.rows.length === 0) {
        throw new NotFoundError();
    }
    return res.json({ status: "deleted" });
});



module.exports = router;