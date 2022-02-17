"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");

const db = require("../db.js");

const testCompany = {
  code: "TEST",
  name: "test",
  description: "Initial test company"
};
const testInvoice = {
  comp_code: testCompany.code,
  amt: 123
}

beforeEach(function () {
  db.query(`INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
  `, [testCompany.code, testCompany.name, testCompany.description]);
  db.query(`INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2)
  `, [testInvoice.comp_code, testInvoice.amt]);
});

afterEach(function () {

});