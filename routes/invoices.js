"use strict";

const express = require("express");
const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const router = express.Router();

/** Get info on all invoices, returns:
 * {invoices: [{id, comp_code}, ...]}
 */
router.get('/', async function (req, res, next) {
  const results = await db.query(
    `SELECT id, comp_code 
            FROM invoices`
  );

  return res.json({ invoices: results.rows });
});

/** Get single invoice, returns:
 * {invoice: {id, amt, paid, add_date, paid_date, company: 
 *  {code, name, description}}
 */
router.get("/:id", async function (req, res, next) {
  const invoiceResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code 
      FROM invoices
      WHERE id = $1      
    `, [req.params.id]
  );
  if (invoiceResults.rows.length === 0) {
    throw new NotFoundError();
  }

  const invoice = invoiceResults.rows[0];

  const companyResults = await db.query(
    `SELECT code, name, description 
        FROM companies
        WHERE code = $1    
    `, [invoice.comp_code]
  );

  invoice.comp_code = undefined;
  invoice.company = companyResults.rows[0];

  return res.json({ invoice });
});


module.exports = router;