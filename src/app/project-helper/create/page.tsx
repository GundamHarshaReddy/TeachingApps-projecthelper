"use client";

import CreateProject from "../components/CreateProject";
import ProjectNavbar from "../components/ProjectNavbar";

export default function CreateProjectPage() {
  return (
    <>
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <ProjectNavbar showNewProject={false} />
        <h1 className="text-3xl font-bold text-pink-600 mb-8">Create New Project</h1>
      </div>
      <CreateProject />
    </>
  );
} 