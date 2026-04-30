"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicationController_1 = require("../controllers/applicationController");
const router = (0, express_1.Router)();
router.get('/user/:userId', applicationController_1.getUserApplications);
router.get('/project/:projectId', applicationController_1.getProjectApplications);
router.patch('/:id/status', applicationController_1.updateApplicationStatus);
exports.default = router;
