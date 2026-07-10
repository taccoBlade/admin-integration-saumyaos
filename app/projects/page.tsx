import { Suspense } from "react"
import { getProjects } from "@/lib/content"
import { ProjectsContent } from "./projects-client"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090b]" />}>
      <ProjectsContent projects={projects} />
    </Suspense>
  )
}
