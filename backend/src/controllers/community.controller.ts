import type { Response } from "express"
import { z } from "zod"
import type { AuthenticatedRequest } from "../types/auth.js"
import {
  addComment,
  createCommunityPost,
  listCommunityPosts,
  toggleLike,
} from "../services/community.service.js"

const postSchema = z.object({
  tripId: z.string().optional(),
  caption: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  location: z.string().optional(),
})

const commentSchema = z.object({
  content: z.string().min(1),
})

export async function listCommunityController(req: AuthenticatedRequest, res: Response) {
  const posts = await listCommunityPosts(req.query.sort?.toString() ?? "recent")
  res.json(posts)
}

export async function createCommunityController(req: AuthenticatedRequest, res: Response) {
  const input = postSchema.parse(req.body)
  const post = await createCommunityPost(req.user!.id, input)
  res.status(201).json(post)
}

export async function likePostController(req: AuthenticatedRequest, res: Response) {
  const result = await toggleLike(req.user!.id, req.params.id)
  res.json(result)
}

export async function commentPostController(req: AuthenticatedRequest, res: Response) {
  const input = commentSchema.parse(req.body)
  const comment = await addComment(req.user!.id, req.params.id, input.content)
  res.status(201).json(comment)
}
