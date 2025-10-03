const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const certificateController = require('../controllers/certificateController');

const router = express.Router();

// Generate certificate for a test attempt
router.post('/generate', 
  authenticate,
  certificateController.generateCertificate
);

// Get student's certificates
router.get('/my-certificates', 
  authenticate,
  certificateController.getMyCertificates
);

// Get certificate by ID
router.get('/:id', 
  authenticate,
  certificateController.getCertificateById
);

// Download certificate
router.get('/:id/download', 
  authenticate,
  certificateController.downloadCertificate
);

// Verify certificate by code
router.get('/verify/:verificationCode', 
  certificateController.verifyCertificate
);

// Get all certificates (admin only)
router.get('/', 
  authenticate,
  requireAdmin,
  certificateController.getAllCertificates
);

// Revoke certificate (admin only)
router.put('/:id/revoke', 
  authenticate,
  requireAdmin,
  certificateController.revokeCertificate
);

// Renew certificate (admin only)
router.put('/:id/renew', 
  authenticate,
  requireAdmin,
  certificateController.renewCertificate
);

module.exports = router;
