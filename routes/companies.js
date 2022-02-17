"use strict";

const express = require("express");
const db = require("../db.js");
const router = new express.Router();


router.get('/', async function(req, res) {
    const results = await db.query(
        `SECLECT code, name 
            FROM companies`
    );

    console.log(results);
    return res.json({companies: results.rows});
})





module.exports = router;