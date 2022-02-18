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

const testAdd = { code: "Twitter", name: "twitter", description: "test add" };
const testPut = { name: "Testtwitter", description: "test put" };



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

  it("Responds with 404 if can't find company", async function () {
    const response = await request(app).get(`/companies/rithm`);
    expect(response.statusCode).toEqual(404);
  });
});


describe("POST /companies", function () {
  it("Add one company", async function () {
    const resp = await request(app).post('/companies')
      .send(testAdd);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ company: testAdd });
  });
});

describe("PUT /companies/[code]", function () {
  it("Add one company", async function () {
    const resp = await request(app).put(`/companies/${testCompany.code}`)
      .send(testPut);
    expect(resp.statusCode).toEqual(200);
    let testOutput = { ...testPut };
    testOutput.code = testCompany.code;
    expect(resp.body).toEqual({ company: testOutput });
  });

  it("Responds with 404 if can't find company", async function () {
    const response = await request(app).put(`/companies/rithm`)
      .send(testPut);
    expect(response.statusCode).toEqual(404);
  });
});

describe("DELETE /companies/[code]", function () {
  it("Delete one company", async function () {
    const resp = await request(app).delete(`/companies/${testCompany.code}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ status: "deleted" });
  });

  it("Responds with 404 if can't find company", async function () {
    const response = await request(app).delete(`/companies/rithm`);
    expect(response.statusCode).toEqual(404);
  });
});
