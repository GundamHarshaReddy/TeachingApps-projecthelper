"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./project-helper/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./project-helper/components/ui/card";
import { PlusIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Project {
  id: string;
  name: string;
  grade: string;
  domain: string;
  description: string;
  created_at: string;
}

export default function Home() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's recent projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) {
          console.error('Error fetching projects:', error);
        } else {
          setRecentProjects(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-rose-500 mb-4">
            Teaching Apps Project Helper
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, manage and get AI assistance for your educational projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-pink-600">Start a New Project</CardTitle>
              <CardDescription>
                Create a new project from scratch with our guided process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Fill out a simple form with project details including name, grade level, domain, and description.
                Our AI will help you develop and refine your ideas.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                asChild 
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <Link href="/project-helper/create">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Project
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-pink-600">Access Existing Projects</CardTitle>
              <CardDescription>
                Continue working on your previously created projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading your projects...</p>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-600 mb-1">Recent projects:</p>
                  {recentProjects.map(project => (
                    <Button 
                      key={project.id}
                      asChild 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      <Link href={`/project-helper/tools?projectId=${project.id}`}>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {project.grade} | {project.domain}
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-600">No projects found</p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                asChild 
                variant="secondary" 
                className="w-full"
              >
                <Link href="/project-helper">
                  View All Projects
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
