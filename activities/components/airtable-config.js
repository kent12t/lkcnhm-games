// Airtable
var Airtable = require("airtable");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "", //refer .env for API KEY
});
var base = "";