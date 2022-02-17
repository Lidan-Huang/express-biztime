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


/** Add an invoice, returns:
 * {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post('/', async function (req, res) {
  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [req.body.comp_code, req.body.amt]
  );

  return res.json({ invoice: results.rows[0] });
});

/**Update an invoice, returns:
 * {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id", async function (req, res) {
  const { amt } = req.body;
  const results = await db.query(
    `UPDATE invoices
            SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date
        `, [amt, req.params.id]
  );

  if (results.rows.length === 0) {
    throw new NotFoundError();
  }
  return res.json({ invoice: results.rows[0] });
})


/** Delete an invoice, returns:
 * {status: "deleted"}
 */
router.delete("/:id", async function (req, res) {
  const results = await db.query(
    `DELETE FROM invoices
      WHERE id = $1
      RETURNING id
    `, [req.params.id]
  );

  if (results.rows.length === 0) {
    throw new NotFoundError();
  }

  return res.json({ status: "deleted" })
});

module.exports = router;