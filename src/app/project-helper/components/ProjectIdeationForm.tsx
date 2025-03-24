"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ProjectIdeationFormProps {
  onSubmit: (formData: {
    subject: string;
    projectDomain: string;
    interests: string;
    tools: string;
    skillLevel: string;
    projectDuration: string;
    targetAudience: string;
    grade: string;
    detailedExplanation: string;
  }) => void;
  isLoading: boolean;
}

export default function ProjectIdeationForm({
  onSubmit,
  isLoading,
}: ProjectIdeationFormProps) {
  const [subject, setSubject] = useState("");
  const [interests, setInterests] = useState("");
  const [tools, setTools] = useState("");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [projectDuration, setProjectDuration] = useState("30-60 days");
  const [targetAudience, setTargetAudience] = useState("");
  const [grade, setGrade] = useState("");
  const [detailedExplanation, setDetailedExplanation] = useState("");
  const [projectDomain, setProjectDomain] = useState("technical");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      subject,
      projectDomain,
      interests,
      tools,
      skillLevel,
      projectDuration,
      targetAudience,
      grade,
      detailedExplanation,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Computer Science, Biology"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="projectDomain">Project Domain</Label>
          <Select value={projectDomain} onValueChange={setProjectDomain}>
            <SelectTrigger id="projectDomain" className="mt-1">
              <SelectValue placeholder="Technical" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="non-technical">Non-Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="interests">Interests</Label>
          <Input
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., Machine Learning, Environmental Science"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tools">Tools Known</Label>
          <Input
            id="tools"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            placeholder="e.g., Python, React"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="skillLevel">Skill Level</Label>
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger id="skillLevel" className="mt-1">
              <SelectValue placeholder="Intermediate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="projectDuration">Project Duration (days)</Label>
          <Select value={projectDuration} onValueChange={setProjectDuration}>
            <SelectTrigger id="projectDuration" className="mt-1">
              <SelectValue placeholder="30-60 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-7 days">1-7 days</SelectItem>
              <SelectItem value="7-30 days">7-30 days</SelectItem>
              <SelectItem value="30-60 days">30-60 days</SelectItem>
              <SelectItem value="60-90 days">60-90 days</SelectItem>
              <SelectItem value="90+ days">90+ days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Students, Professionals, General Public"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="grade">Grade Level</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger id="grade" className="mt-1">
              <SelectValue placeholder="Select grade level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elementary">Elementary School</SelectItem>
              <SelectItem value="middle">Middle School</SelectItem>
              <SelectItem value="high">High School</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="detailedExplanation">Detailed Project Explanation</Label>
        <Textarea
          id="detailedExplanation"
          value={detailedExplanation}
          onChange={(e) => setDetailedExplanation(e.target.value)}
          placeholder="Provide a detailed explanation of your project idea, including any specific requirements or goals."
          className="mt-1 min-h-[150px]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-black text-white"
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Generate Project Idea"}
      </Button>
    </form>
  );
} 