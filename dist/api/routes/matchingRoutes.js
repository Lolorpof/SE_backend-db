"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchingControllers_1 = require("../controllers/matchingControllers");
const auth_1 = require("../middlewares/auth");
const rolesChecker_1 = require("../middlewares/rolesChecker");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const requestBodySchema_1 = require("../schemas/requestBodySchema");
const matchingRoutes = (0, express_1.Router)();
/**
 * Hiring Post Matching Routes
 * These routes handle the matching process for job hiring posts
 */
// Job seeker matches with a hiring post
// POST: Creates a match and adds the job seeker (INPROGRESS status)
// GET: Retrieves all matches for a hiring post
matchingRoutes.route('/hiring/:postId/match')
    .post(auth_1.checkAuthenticated, rolesChecker_1.checkJobSeeker, matchingControllers_1.matchingControllers.instance().matchWithHiringPost)
    .get(auth_1.checkAuthenticated, matchingControllers_1.matchingControllers.instance().getHiringPostMatches);
// Update the status of a job seeker's application
// PUT: Updates match status (INPROGRESS, ACCEPTED, DENIED)
matchingRoutes.route('/hiring/match/:matchId/status')
    .put(auth_1.checkAuthenticated, rolesChecker_1.checkEmployer, (0, validationMiddleware_1.validateData)(requestBodySchema_1.matchStatusSchema), matchingControllers_1.matchingControllers.instance().updateHiringMatchStatus);
// Delete a hiring match (only by the job seeker who created it)
matchingRoutes.route('/hiring/match/:matchId')
    .delete(auth_1.checkAuthenticated, rolesChecker_1.checkJobSeeker, matchingControllers_1.matchingControllers.instance().deleteHiringMatch);
/**
 * Finding Post Matching Routes
 * These routes handle the matching process for job finding posts
 */
// Create and retrieve matches for a specific finding post
// GET: Retrieves the match for a finding post
// POST: Creates a new match for a finding post
matchingRoutes.route('/finding/:postId/match')
    .get(auth_1.checkAuthenticated, matchingControllers_1.matchingControllers.instance().getFindingPostMatch)
    .post(auth_1.checkAuthenticated, matchingControllers_1.matchingControllers.instance().matchWithFindingPost);
// Update the status of a finding post match
// PUT: Updates match status (INPROGRESS, ACCEPTED, DENIED)
matchingRoutes.route('/finding/match/:matchId/status')
    .put(auth_1.checkAuthenticated, (0, validationMiddleware_1.validateData)(requestBodySchema_1.matchStatusSchema), matchingControllers_1.matchingControllers.instance().updateFindingMatchStatus);
// Delete a finding match (only by the employer/company who created it)
matchingRoutes.route('/finding/match/:matchId')
    .delete(auth_1.checkAuthenticated, matchingControllers_1.matchingControllers.instance().deleteFindingMatch);
/**
 * Tracking Routes
 * These routes handle tracking of matches for users and admins
 */
// Get user's own matching/tracking status
// GET: Retrieves all matches (both hiring and finding) for the authenticated user
matchingRoutes.route('/user/tracking')
    .get(auth_1.checkAuthenticated, matchingControllers_1.matchingControllers.instance().getUserMatchingStatus);
// Admin route to view all matching/tracking status
// GET: Retrieves all matches in the system (admin only)
matchingRoutes.route('/admin/tracking')
    .get(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, matchingControllers_1.matchingControllers.instance().getAllMatchingStatus);
exports.default = matchingRoutes;
