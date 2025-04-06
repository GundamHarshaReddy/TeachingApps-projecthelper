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
  subject: string;
  interests: string; 
  toolsOrSkills: string;
  skillLevel: string;
  targetAudience: string;
}

interface FormErrors {
  projectName?: string;
  grade?: string;
  projectDomain?: string;
  subject?: string;
  interests?: string;
  toolsOrSkills?: string;
  skillLevel?: string;
  targetAudience?: string;
}

const initialFormData: ProjectFormData = {
  projectName: "",
  grade: "",
  projectDomain: "",
  subject: "",
  interests: "",
  toolsOrSkills: "",
  skillLevel: "intermediate",
  targetAudience: ""
};

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) { return "st"; }
  if (j === 2 && k !== 12) { return "nd"; }
  if (j === 3 && k !== 13) { return "rd"; }
  return "th";
}

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

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError(null);

    try {
      const projectId = await createProjectInDB({
        projectName: formData.projectName,
        grade: formData.grade,
        projectDomain: formData.projectDomain,
        subject: formData.subject,
        interests: formData.interests,
        toolsOrSkills: formData.toolsOrSkills,
        skillLevel: formData.skillLevel,
        targetAudience: formData.targetAudience
      });
      
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
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i} value={`${i + 1}`}>
                      {`${i + 1}${getOrdinalSuffix(i + 1)} Grade`}
                    </SelectItem>
                  ))}
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
              <Label htmlFor="subject" className="text-base">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Biology, Literature"
                className={errors.subject ? "border-red-500" : ""}
                required
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests" className="text-base">Interests or Topic</Label>
              <Input
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Specific interests or topics related to this project"
                className={errors.interests ? "border-red-500" : ""}
              />
              {errors.interests && (
                <p className="text-red-500 text-sm mt-1">{errors.interests}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolsOrSkills" className="text-base">Tools or Skills Known</Label>
              <Input
                id="toolsOrSkills"
                name="toolsOrSkills"
                value={formData.toolsOrSkills}
                onChange={handleChange}
                placeholder="Tools, technologies or skills relevant to this project"
                className={errors.toolsOrSkills ? "border-red-500" : ""}
              />
              {errors.toolsOrSkills && (
                <p className="text-red-500 text-sm mt-1">{errors.toolsOrSkills}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base">Skill Level</Label>
                <Select
                  value={formData.skillLevel}
                  onValueChange={(value) => handleSelectChange("skillLevel", value)}
                >
                  <SelectTrigger id="skillLevel" className={errors.skillLevel ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {errors.skillLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.skillLevel}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-base">Target Audience</Label>
              <Input
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="Who is this project intended for?"
                className={errors.targetAudience ? "border-red-500" : ""}
              />
              {errors.targetAudience && (
                <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>
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