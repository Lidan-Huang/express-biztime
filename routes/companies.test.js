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
  amt: "123.00"
}
testCompany.invoices = [{
  add_date: expect.any(String),
  amt: testInvoice.amt,
  comp_code: testCompany.code,
  id: expect.any(Number),
  paid: false,
  paid_date: null,
}]

beforeEach(async function () {
  await db.query(`INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
  `, [testCompany.code, testCompany.name, testCompany.description]);
  await db.query(`INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2)
  `, [testInvoice.comp_code, testInvoice.amt]);
});

afterEach(async function () {
  await db.query(`
    DELETE FROM companies
  `);
  await db.query(`
    DELETE FROM invoices
  `);
});


describe("GET /companies", function () {
  it("Get all companies data", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { code: testCompany.code, name: testCompany.name }
      ]
    });
  });
});


describe("GET /companies/[code]", function () {
  it("Get one companies' data", async function () {
    const resp = await request(app).get(`/companies/${testCompany.code}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ company: testCompany });
  });
});