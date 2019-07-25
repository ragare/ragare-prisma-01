import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../src/prisma'

const userOne = {
    input: {
        name: "TestUser01",
        email: "testu01@example.com",
        password: bcrypt.hashSync('Estevia123')
    },
    user: undefined,
    jwt: undefined
}

const postOne = {
    input: {
        title: "Primer post",
        body: "Post 1 ......",
        published: true
    },
    post: undefined
}

const postTwo = {
    input: {
        title: "Segundo post",
        body: "Post 2 ......",
        published: false
    },
    post: undefined
}

const seedDatabase = async () => {
    // delete tes data
    await prisma.mutation.deleteManyPosts()
    await prisma.mutation.deleteManyUsers()

    // create user one
    userOne.user = await prisma.mutation.createUser({
        data: userOne.input
    })
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)

    // create post one
    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })

    // create post two
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })
}

export { seedDatabase as default, userOne, postOne, postTwo }