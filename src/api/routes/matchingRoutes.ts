import { Router } from "express";
import { matchingControllers } from "../controllers/matchingControllers";
import { checkAuthenticated } from "../middlewares/auth";
import { checkEmployer, checkCompany, checkJobSeeker, checkAdmin } from "../middlewares/rolesChecker";
import { validateData } from "../middlewares/validationMiddleware";
import { matchStatusSchema, hiringMatchSeekerSchema, findingMatchHirerSchema } from "../schemas/requestBodySchema";

const matchingRoutes = Router();

/**
 * Hiring Post Matching Routes
 * These routes handle the matching process for job hiring posts
 */

// Job seeker matches with a hiring post
// POST: Creates a match and adds the job seeker (INPROGRESS status)
// GET: Retrieves all matches for a hiring post
matchingRoutes.route('/hiring/:postId/match')
  .post(
    checkAuthenticated,
    checkJobSeeker,
    matchingControllers.instance().matchWithHiringPost
  )
  .get(checkAuthenticated, matchingControllers.instance().getHiringPostMatches);

// Update the status of a job seeker's application
// PUT: Updates match status (INPROGRESS, ACCEPTED, DENIED)
matchingRoutes.route('/hiring/match/:matchId/status')
  .put(
    checkAuthenticated,
    checkEmployer,
    validateData(matchStatusSchema),
    matchingControllers.instance().updateHiringMatchStatus
  );

// Delete a hiring match (only by the job seeker who created it)
matchingRoutes.route('/hiring/match/:matchId')
  .delete(
    checkAuthenticated,
    checkJobSeeker,
    matchingControllers.instance().deleteHiringMatch
  );

/**
 * Finding Post Matching Routes
 * These routes handle the matching process for job finding posts
 */

// Create and retrieve matches for a specific finding post
// GET: Retrieves the match for a finding post
// POST: Creates a new match for a finding post
matchingRoutes.route('/finding/:postId/match')
  .get(checkAuthenticated, matchingControllers.instance().getFindingPostMatch)
  .post(
    checkAuthenticated,
    matchingControllers.instance().matchWithFindingPost
  );

// Update the status of a finding post match
// PUT: Updates match status (INPROGRESS, ACCEPTED, DENIED)
matchingRoutes.route('/finding/match/:matchId/status')
  .put(
    checkAuthenticated,
    validateData(matchStatusSchema),
    matchingControllers.instance().updateFindingMatchStatus
  );

// Delete a finding match (only by the employer/company who created it)
matchingRoutes.route('/finding/match/:matchId')
  .delete(
    checkAuthenticated,
    matchingControllers.instance().deleteFindingMatch
  );

/**
 * Tracking Routes
 * These routes handle tracking of matches for users and admins
 */

// Get user's own matching/tracking status
// GET: Retrieves all matches (both hiring and finding) for the authenticated user
matchingRoutes.route('/user/tracking')
  .get(
    checkAuthenticated,
    matchingControllers.instance().getUserMatchingStatus
  );
// Admin route to view all matching/tracking status
// GET: Retrieves all matches in the system (admin only)
matchingRoutes.route('/admin/tracking')
  .get(
    checkAuthenticated,
    checkAdmin,
    matchingControllers.instance().getAllMatchingStatus
  );

export default matchingRoutes; 