import { Part } from "./part"

export type Project = {
  name: string
  notes: string
  parts: Part[]
  _id?: string
  completed: boolean
}