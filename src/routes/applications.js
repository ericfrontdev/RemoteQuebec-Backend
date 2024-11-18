import express from 'express'
import multer from 'multer'
import path from 'path'
import { Application } from '../models/Application.js'
import { Job } from '../models/Job.js'
import { sendApplicationEmail } from '../services/email.js'

const router = express.Router()

// Configure multer pour le téléversement de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    )
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Type de fichier non valide. Utilisez PDF ou DOC/DOCX.'))
      return
    }
    cb(null, true)
  },
})

// Soumettre une candidature
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Offre d'emploi non trouvée",
      })
    }

    const application = new Application({
      jobId: job._id,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      coverLetter: req.body.coverLetter,
      resumePath: req.file.path,
    })

    await application.save()

    // Envoyer le courriel de notification
    await sendApplicationEmail(job, application, req.file)

    res.status(201).json({
      success: true,
      message: 'Candidature soumise avec succès',
    })
  } catch (error) {
    console.error('Erreur lors du traitement de la candidature:', error)
    res.status(500).json({
      success: false,
      message:
        'Une erreur est survenue lors du traitement de votre candidature',
    })
  }
})

// Obtenir les candidatures pour une offre
router.get('/job/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({
      jobId: req.params.jobId,
    }).sort({ appliedAt: -1 })
    res.json(applications)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
    })
  }
})

export const applicationRoutes = router
