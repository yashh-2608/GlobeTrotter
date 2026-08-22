import { prisma } from "../config/prisma.js"
import { ApiError } from "../utils/api-error.js"

interface CreatePostInput {
  tripId?: string
  caption: string
  images?: string[]
  location?: string
}

export async function listCommunityPosts(sort: string) {
  return prisma.communityPost.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          city: true,
          country: true,
        },
      },
      trip: {
        select: {
          id: true,
          title: true,
          coverImage: true,
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy:
      sort === "popular"
        ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
        : { createdAt: "desc" },
  })
}

export async function createCommunityPost(userId: string, input: CreatePostInput) {
  return prisma.communityPost.create({
    data: {
      userId,
      tripId: input.tripId,
      caption: input.caption,
      images: input.images ?? [],
      location: input.location,
    },
  })
}

export async function toggleLike(userId: string, postId: string) {
  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    })

    return { liked: false }
  }

  await prisma.like.create({
    data: {
      postId,
      userId,
    },
  })

  return { liked: true }
}

export async function addComment(userId: string, postId: string, content: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  })

  if (!post) {
    throw new ApiError(404, "Post not found")
  }

  return prisma.comment.create({
    data: {
      postId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  })
}
