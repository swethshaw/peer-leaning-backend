"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const miscControllers_1 = require("../controllers/miscControllers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, miscControllers_1.getGlobalLeaderboard);
router.get('/cohort/:cohortId', auth_1.protect, miscControllers_1.getCohortLeaderboard);
exports.default = router;
