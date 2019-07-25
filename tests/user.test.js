import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { createUser, getUsers, login, getProfile } from './utils/operations'

const client = getClient()

beforeEach(seedDatabase)

test('Should create a new user', async () => {
    const variables = {
        data: {
            name: "Joan",
            email: "joan@example.com",
            password: "123estevia"
        }
    }

    const response = await client.mutate({
        mutation: createUser,
        variables
    })
    const userExists = await prisma.exists.User({ id: response.data.createUser.user.id })
    expect(userExists).toBe(true)
})

test('Should expose public users profiles', async () => {
    const response = await client.query({
        query: getUsers
    })

    expect(response.data.users.length).toBe(1)
    expect(response.data.users[0].email).toBe(null)
    expect(response.data.users[0].name).toBe("TestUser01")
})


test('Should not login with bad credentials', async () => {
    const variables = {
        data: {
            email: "testu01@example.com",
            password: "badpassword"
        }
    }

    await expect(client.mutate({
        mutation: login,
        variables
    })).rejects.toThrow()
})

test('Should not create a user with a bad password', async () => {
    const variables = {
        data: {
            name: "Joan2",
            email: "joan2@example.com",
            password: "short"
        }
    }

    await expect(client.mutate({
        mutation: createUser,
        variables
    })).rejects.toThrow()
})

test('Should fetch user profile', async () => {
    const client = getClient(userOne.jwt)

    const { data } = await client.query({ query: getProfile })
    expect(data.me.id).toBe(userOne.user.id)
    expect(data.me.name).toBe(userOne.user.name)
    expect(data.me.email).toBe(userOne.user.email)
})