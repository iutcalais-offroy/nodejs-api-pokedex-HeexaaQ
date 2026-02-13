import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import { cardRouter } from './routes/card.routes'
import deckRouter from './routes/deck.routes'

// Create Express app
export const app = express()

// Middlewares
app.use(
  cors({
    origin: true, // Autorise toutes les origines
    credentials: true,
  }),
)

app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/api/cards', cardRouter)

app.use('/api/decks', deckRouter)

// Serve static files (Socket.io test client)
app.use(express.static('public'))

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TCG Backend Server is running' })
})

// Start server only if this file is run directly (not imported for tests)
if (require.main === module) {
  // Create HTTP server
  const httpServer = createServer(app)

  // Start server - bind to 0.0.0.0 to accept external connections (required for Railway)
  try {
    const PORT = process.env.PORT || 3000
    const HOST = '0.0.0.0'

    httpServer.listen(Number(PORT), HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}
