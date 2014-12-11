var qs = require('querystring');
var sys = require('sys');
var express = require('express');
var app = express();
var formidable = require('formidable');
app.use(express.json());
app.use(express.urlencoded());

module.exports = app;
