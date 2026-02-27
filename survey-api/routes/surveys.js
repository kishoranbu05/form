const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const {
  createSurvey,
  createSurveyWithFiles,
  getMySurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
} = require('../controllers/surveyController');
const { protect, authorize } = require('../middleware/auth');
const {
  createSurveyValidator,
  updateSurveyValidator,
  paginationValidator,
} = require('../middleware/validators');
const { OPERATIONAL_ROLES } = require('../constants/roles');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Surveys (User)
 *   description: Survey record operations for authenticated users
 */

/**
 * @swagger
 * /surveys:
 *   get:
 *     summary: Get all surveys for the logged-in user
 *     tags: [Surveys (User)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Approved, Rejected] }
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Paginated list of user's surveys
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedSurveys'
 *       401:
 *         description: Unauthorized
 */
router.get('/', paginationValidator, getMySurveys);

/**
 * @swagger
 * /surveys:
 *   post:
 *     summary: Create a new survey record
 *     tags: [Surveys (User)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSurveyInput'
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyRecord'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authorize(...OPERATIONAL_ROLES), createSurveyValidator, createSurvey);
router.post(
  '/upload',
  authorize(...OPERATIONAL_ROLES),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
  ]),
  createSurveyWithFiles
);

/**
 * @swagger
 * /surveys/{id}:
 *   get:
 *     summary: Get a single survey by ID (own record only for users)
 *     tags: [Surveys (User)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Survey record ID
 *     responses:
 *       200:
 *         description: Survey record details
 *       403:
 *         description: Not authorized to view this record
 *       404:
 *         description: Survey record not found
 */
router.get('/:id', getSurveyById);

/**
 * @swagger
 * /surveys/{id}:
 *   put:
 *     summary: Update a survey (user can only update their own)
 *     tags: [Surveys (User)]
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
 *         description: Survey updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize(...OPERATIONAL_ROLES), updateSurveyValidator, updateSurvey);

/**
 * @swagger
 * /surveys/{id}:
 *   delete:
 *     summary: Delete a survey (user can only delete their own)
 *     tags: [Surveys (User)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.delete('/:id', authorize(...OPERATIONAL_ROLES), deleteSurvey);

module.exports = router;
