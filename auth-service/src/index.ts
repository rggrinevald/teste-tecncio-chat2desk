import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from './routes/auth.routes'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/auth', authRouter)

app.use(
  (
    _req: express.Request,
    res: express.Response
  ) => {
    res.status(404).json({ error: 'Rota não encontrada' })
  }
)

const PORT = Number(process.env.PORT ?? 8082)

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`)
})
