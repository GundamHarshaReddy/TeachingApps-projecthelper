"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { PlusIcon, ChevronLeftIcon, HomeIcon } from "lucide-react";

interface Project {
  id: string;
  name: string;
  grade?: string;
  domain?: string;
}

interface ProjectNavbarProps {
  project?: Project | null;
  showBack?: boolean;
  showHome?: boolean;
  showNewProject?: boolean;
}

export default function ProjectNavbar({
  project = null,
  showBack = true,
  showHome = true,
  showNewProject = true,
}: ProjectNavbarProps) {
  return (
    <div className="flex items-center justify-between border-b pb-4 mb-8">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Link href="/project-helper">
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        )}
        
        {showHome && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Link href="/">
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </Link>
          </Button>
        )}
      </div>

      {project && (
        <div className="flex-1 flex items-center mx-4">
          <div className="text-lg font-medium text-pink-600 ml-2 truncate">
            {project.name}
          </div>
          {(project.grade || project.domain) && (
            <div className="ml-2 text-xs text-gray-500">
              {project.grade && <span>{project.grade}</span>}
              {project.grade && project.domain && <span> • </span>}
              {project.domain && <span>{project.domain}</span>}
            </div>
          )}
        </div>
      )}

      {showNewProject && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <Link href="/project-helper/create">
            <PlusIcon className="h-4 w-4 mr-1" />
            New Project
          </Link>
        </Button>
      )}
    </div>
  );
} 