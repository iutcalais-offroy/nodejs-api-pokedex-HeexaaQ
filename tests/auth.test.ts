import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/index'
import { prismaMock } from './vitest.setup'
import bcrypt from 'bcryptjs'

describe('POST /auth/sign-up', () => {
  it('should sign up a new user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce({
      id: 1,
      username: 'tcguser',
      email: 'tcg@test.com',
      password: await bcrypt.hash('testpassword', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await request(app)
      .post('/api/auth/sign-up')
      .send({
        username: 'tcguser',
        email: 'tcg@test.com',
        password: 'testpassword',
      })
      .expect(201)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('user')
  })

  // it('should not sign up with existing email', async () => {
  //   prismaMock.user.findUnique.mockResolvedValueOnce({
  //     ...mockUser,
  //     email: 'red@example.com',
  //     username: 'red',
  //   })

  //   const response = await request(app)
  //     .post('/api/auth/sign-up')
  //     .send({
  //       username: 'red',
  //       email: 'red@example.com',
  //       password: 'password123',
  //     })
  //     .expect(409)
  //   expect(response.body).toHaveProperty('error', 'Email already in use')
  // })

  // // it('should not sign up with missing fields', async () => {
  //   const response = await request(app)
  //     .post('/api/auth/sign-up')
  //     .send({
  //       username: 'incompleteuser',
  //       email: '',
  //       password: 'testpassword',
  //     })
  //     .expect(400)
  //   expect(response.body).toHaveProperty('error', 'Missing required fields')
  // })
})

describe('POST /auth/sign-in', () => {
  it('should sign in an existing user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: 'blue@example.com',
      username: 'blue',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await request(app)
      .post('/api/auth/sign-in')
      .send({
        email: 'blue@example.com',
        password: 'password123',
      })
      .expect(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('user')
  })

  // it('should not sign in with invalid credentials', async () => {
  //   const hashedPassword = await bcrypt.hash('password123', 10)
  //   prismaMock.user.findUnique.mockResolvedValueOnce({
  //     id: 1,
  //     email: 'blue@example.com',
  //     username: 'blue',
  //     password: hashedPassword,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   })

  //   const response = await request(app)
  //     .post('/api/auth/sign-in')
  //     .send({
  //       email: 'blue@example.com',
  //       password: 'wrongpassword',
  //     })
  //     .expect(401)
  //   expect(response.body).toHaveProperty('error', 'Invalid credentials')
  // })

  // // it('should not sign in with missing fields', async () => {
  //   const response = await request(app)
  //     .post('/api/auth/sign-in')
  //     .send({
  //       email: '',
  //       password: 'password123',
  //     })
  //     .expect(400)
  //   expect(response.body).toHaveProperty('error', 'Missing required fields')
  // })

  // it('should not sign in with non-existent user', async () => {
  //   prismaMock.user.findUnique.mockResolvedValueOnce(null)

  //   const response = await request(app)
  //     .post('/api/auth/sign-in')
  //     .send({
  //       email: 'nonexistent@test.com',
  //       password: 'password123',
  //     })
  //     .expect(401)
  //   expect(response.body).toHaveProperty('error', 'Invalid credentials')
  // })
})

// describe('Error handling - 500 errors', () => {
//   it('should return 500 when database fails on sign-up', async () => {
//     prismaMock.user.findUnique.mockRejectedValueOnce(new Error('DB Error'))

//     const response = await request(app)
//       .post('/api/auth/sign-up')
//       .send({
//         username: 'erroruser',
//         email: 'error@test.com',
//         password: 'password123',
//       })
//       .expect(500)

//     expect(response.body).toHaveProperty('error', 'Internal server error')
//   })

//   it('should return 500 when database fails on sign-in', async () => {
//     prismaMock.user.findUnique.mockRejectedValueOnce(new Error('DB Error'))

//     const response = await request(app)
//       .post('/api/auth/sign-in')
//       .send({
//         email: 'blue@example.com',
//         password: 'password123',
//       })
//       .expect(500)

//     expect(response.body).toHaveProperty('error', 'Internal server error')
//   })
// })
