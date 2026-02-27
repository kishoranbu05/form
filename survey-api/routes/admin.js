const express = require('express');
const router = express.Router();
const {
  getAllSurveys,
  getAdminSurveyById,
  adminUpdateSurvey,
  adminDeleteSurvey,
  approveSurvey,
  rejectSurvey,
  exportCSV,
  exportExcel,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { adminUpdateSurveyValidator, paginationValidator } = require('../middleware/validators');

// All routes: must be authenticated AND admin
router.use(protect, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations — manage all survey records
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats including totals and status breakdown
 *       403:
 *         description: Admin access required
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /admin/surveys:
 *   get:
 *     summary: Get all survey records with filters and pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Approved, Rejected] }
 *         description: Filter by status
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Filter survey date from (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Filter survey date to (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated survey records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedSurveys'
 */
router.get('/surveys', paginationValidator, getAllSurveys);

/**
 * @swagger
 * /admin/surveys/{id}:
 *   get:
 *     summary: Get any survey record by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey record details
 *       404:
 *         description: Survey not found
 */
router.get('/surveys/:id', getAdminSurveyById);

/**
 * @swagger
 * /admin/surveys/{id}:
 *   put:
 *     summary: Update any survey record (admin can change status)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSurveyInput'
 *     responses:
 *       200:
 *         description: Survey updated
 *       404:
 *         description: Not found
 */
router.put('/surveys/:id', adminUpdateSurveyValidator, adminUpdateSurvey);

/**
 * @swagger
 * /admin/surveys/{id}/approve:
 *   patch:
 *     summary: Approve a survey record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey approved
 *       404:
 *         description: Not found
 */
router.patch('/surveys/:id/approve', approveSurvey);

/**
 * @swagger
 * /admin/surveys/{id}/reject:
 *   patch:
 *     summary: Reject a survey record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey rejected
 *       404:
 *         description: Not found
 */
router.patch('/surveys/:id/reject', rejectSurvey);

/**
 * @swagger
 * /admin/surveys/{id}:
 *   delete:
 *     summary: Delete any survey record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey deleted
 *       404:
 *         description: Not found
 */
router.delete('/surveys/:id', adminDeleteSurvey);

/**
 * @swagger
 * /admin/export/csv:
 *   get:
 *     summary: Export all survey records as CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Approved, Rejected] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/csv', exportCSV);

/**
 * @swagger
 * /admin/export/excel:
 *   get:
 *     summary: Export all survey records as Excel (.xlsx)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Approved, Rejected] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/excel', exportExcel);

module.exports = router;
