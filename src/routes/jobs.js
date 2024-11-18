import express from 'express'
import { Job } from '../models/Job.js'

const router = express.Router()

// Get all jobs
router.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 })
    res.json(jobs)
    console.log(jobs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single job
router.get('/api/jobs:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    res.json(job)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create job
router.post('/api/jobs', async (req, res) => {
  const job = new Job(req.body)
  try {
    const newJob = await job.save()
    res.status(201).json(newJob)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update job
router.put('/api/jobs:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    Object.assign(job, req.body)
    const updatedJob = await job.save()
    res.json(updatedJob)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete job
router.delete('/api/jobs:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    await job.deleteOne()
    res.json({ message: 'Job deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export const jobRoutes = router
