
const express = require('express');

// Sanitiser les strings pour éviter XSS
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
}

// Valider et sanitiser le body
function validateBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, val] of Object.entries(req.body)) {
      if (typeof val === 'string') {
        req.body[key] = sanitize(val);
      }
    }
  }
  next();
}

module.exports = { sanitize, validateBody };
