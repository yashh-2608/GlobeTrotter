import { ApiError } from "./api-error.js"

export function routeParam(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value) throw new ApiError(400, "Invalid route parameter")
  return value
}
