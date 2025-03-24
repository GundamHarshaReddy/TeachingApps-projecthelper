"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { createProjectInDB } from "../actions/projects";

interface ProjectFormData {
  projectName: string;
  grade: string;
  projectDomain: string;
  description: string;
}

interface FormErrors {
  projectName?: string;
  grade?: string;
  projectDomain?: string;
  description?: string;
}

const initialFormData: ProjectFormData = {
  projectName: "",
  grade: "",
  projectDomain: "",
  description: ""
};

export default function CreateProject() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user selects
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
      isValid = false;
    }

    if (!formData.grade) {
      newErrors.grade = "Grade level is required";
      isValid = false;
    }

    if (!formData.projectDomain) {
      newErrors.projectDomain = "Project domain is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Project description is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Submit data to Supabase using server action
      const projectId = await createProjectInDB({
        projectName: formData.projectName,
        grade: formData.grade,
        projectDomain: formData.projectDomain,
        description: formData.description
      });
      
      // Navigate to tools page with project ID
      router.push(`/project-helper/tools?projectId=${projectId}`);
    } catch (err) {
      setServerError("Failed to create project. Please try again.");
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-4 max-w-2xl px-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>
            Fill out the details below to create your new project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-base">Project Name</Label>
              <Input
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
                className={errors.projectName ? "border-red-500" : ""}
                required
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-base">Grade Level</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => handleSelectChange("grade", value)}
                required
              >
                <SelectTrigger id="grade" className={errors.grade ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary School</SelectItem>
                  <SelectItem value="middle">Middle School</SelectItem>
                  <SelectItem value="high">High School</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDomain" className="text-base">Project Domain</Label>
              <Select
                value={formData.projectDomain}
                onValueChange={(value) => handleSelectChange("projectDomain", value)}
                required
              >
                <SelectTrigger id="projectDomain" className={errors.projectDomain ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software Development</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="arts">Arts & Humanities</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.projectDomain && (
                <p className="text-red-500 text-sm mt-1">{errors.projectDomain}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Project Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project and goals"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-md text-sm">
                {serverError}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 