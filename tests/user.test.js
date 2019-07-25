import 'cross-fetch/polyfill'
import ApolloBoost, { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import bcrypt from 'bcryptjs'
import { getIntrospectionQuery } from 'graphql';

const client = new ApolloBoost({
    uri: 'http://localhost:4000'
})

beforeEach(async () => {
    await prisma.mutation.deleteManyPosts()
    await prisma.mutation.deleteManyUsers()
    const user = await prisma.mutation.createUser({
        data: {
            name: "TestUser01",
            email: "testu01@example.com",
            password: bcrypt.hashSync('Estevia123')
        }
    })
    await prisma.mutation.createPost({
        data: {
            title: "Primer post",
            body: "Post 1 ......",
            published: true,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    })
    await prisma.mutation.createPost({
        data: {
            title: "Segundo post",
            body: "Post 2 ......",
            published: true,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    })
})


test('Should create a new user', async () => {
    const createUser = gql`
        mutation
        {
            createUser(
                data: {
                    name: "Joan",
                    email: "joan@example.com",
                    password: "123estevia"
                }
            ){
                token
                user {
                    id
                }
            }           
        }
    `
    const response = await client.mutate({
        mutation: createUser
    })
    const userExists = await prisma.exists.User({ id: response.data.createUser.user.id })
    expect(userExists).toBe(true)
})

test('Should expose public users profiles', async () => {
    const gerUsers = gql`
        query {
            users {
                id
                name
                email
            }
        }
    `
    const response = await client.query({
        query: getUsers
    })

    expect(response.data.users.length).toBe(1)
    expect(response.data.users[0].email).toBe(null)
    expect(response.data.users[0].name).toBe("TestUser01")
})

test('Should expose only published posts', async () => {
    const getPosts = gql`
        query {
            posts {
                id
                title
                body
                published
            }
        }
    `
    const response = await client.query({ query: getPosts })
    expect(response.data.posts.length).toBe(2)
    expect(response.data.posts[0].published).toBe(true)
})

test('Should not login with bad credentials', async () => {
    const login = gql`
        mutation {
            login(
                data: {
                    email: "testu01@example.com",
                    password: "badpassword"
                }
            ){
                token
                user {
                    id
                    name
                }
            }
        }
    `
    expect(client.mutate({ mutation: login })).rejects.toThrow()
})