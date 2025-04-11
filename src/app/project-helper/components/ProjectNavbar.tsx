"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { PlusIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  grade?: string;
  domain?: string;
}

interface ProjectNavbarProps {
  project?: Project | null;
  showHome?: boolean;
  showNewProject?: boolean;
  backUrl?: string;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) { return "st"; }
  if (j === 2 && k !== 12) { return "nd"; }
  if (j === 3 && k !== 13) { return "rd"; }
  return "th";
}

export default function ProjectNavbar({
  project = null,
  showHome = true,
  showNewProject = true,
}: ProjectNavbarProps) {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between border-b pb-4 mb-8">
      <div className="flex items-center gap-4">
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
              {project.grade && (
                <span>
                  {project.grade}{getOrdinalSuffix(parseInt(project.grade, 10))} Grade
                </span>
              )}
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