import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase'
import getClient from './utils/getClient'
import prisma from '../src/prisma'
import { getPosts, getMyPosts, updatePost, createPost, deletePost } from './utils/operations'
const client = getClient()

beforeEach(seedDatabase)

test('Should expose only published posts', async () => {

    const response = await client.query({ query: getPosts })
    expect(response.data.posts.length).toBe(1)
    expect(response.data.posts[0].published).toBe(true)
})

test('Should return my posts published or not', async () => {
    const client = getClient(userOne.jwt)

    const { data } = await client.query({ query: getMyPosts })
    expect(data.myPosts.length).toBe(2)
})

test('Should be able to update own post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postOne.post.id,
        data: {
            published: false
        }
    }

    const { data } = await client.mutate({ mutation: updatePost, variables })
    const postExists = await prisma.exists.Post({
        id: postOne.post.id,
        published: false
    })

    expect(data.updatePost.published).toBe(false)
    expect(postExists).toBe(true)
})

test('Should create a post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        data: {
            title: "This is a new test post",
            body: "The body for created test post",
            published: true
        }
    }

    const { data } = await client.mutate({ mutation: createPost, variables })
    const post = await prisma.query.post({ where: { id: data.createPost.id } })
    expect(post.title).toBe('This is a new test post')
    expect(post.body).toBe('The body for created test post')
    expect(post.published).toBe(true)
})

test('Should delete a post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postTwo.post.id
    }
    const response = await client.mutate({ mutation: deletePost, variables })
    const postExists = await prisma.exists.Post({ id: postTwo.post.id })
    expect(postExists).toBe(false)
})