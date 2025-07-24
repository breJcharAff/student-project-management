"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AuthManager, type User } from "@/lib/auth";

// Types
interface Student {
  id: number;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  students: Student[];
  grade: number | null;
}

interface Project {
  id: number;
  name: string;
  reportNeeded: boolean;
  groups: Group[];
}

interface Criteria {
  id: number;
  name: string;
  weight: number;
}

interface Grade {
  id: number;
  grade: number;
  comment: string;
  group?: {
    id: number;
    name: string;
  };
  student?: {
    id: number;
    name: string;
  };
}

interface EvaluationGrid {
  id: number;
  title: string;
  globalComment: string | null;
  isFinal: boolean;
  globalScore: number | null;
  target: "deliverable" | "report" | "defense";
  criteria: Criteria[];
  grades: Grade[];
}

export default function GradeProjectPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(AuthManager.getUser());
  }, []);
  const [project, setProject] = useState<Project | null>(null);
  const [evaluationGrids, setEvaluationGrids] = useState<EvaluationGrid[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      apiClient.getProject(params.id).then((res) => {
        if (res.data) setProject(res.data);
      });
      apiClient.getEvaluationGridsByProject(params.id).then((res) => {
        if (res.data) setEvaluationGrids(res.data);
      });
    }
  }, [user, params.id]);

  const selectedGroup =
    project?.groups.find((g) => g.id.toString() === selectedGroupId) || null;

  const handleAddGrade = (
    target: "deliverable" | "report" | "defense",
    criteriaId: number,
    grade: number,
    comment: string,
    studentId?: number
  ) => {
    if (!selectedGroupId) return;

    const payload = {
      target,
      grades: [
        {
          criteriaId,
          grade,
          comment,
          studentId,
        },
      ],
    };

    apiClient
      .evaluateGroup(selectedGroupId, payload)
      .then(() => {
        // Refresh data
        apiClient.getEvaluationGridsByProject(params.id).then((res) => {
          if (res.data) setEvaluationGrids(res.data);
        });
      })
      .catch(console.error);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>

      <div className="mb-4">
        <Select onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {project.groups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGroup && (
        <div>
          <p>
            <span className="font-semibold">Students:</span>{" "}
            {selectedGroup.students.map((s) => s.name).join(", ")}
          </p>
          <p>
            <span className="font-semibold">Grade:</span>{" "}
            {selectedGroup.grade || "Not graded yet"}
          </p>
        </div>
      )}

      <Tabs defaultValue="deliverable" className="mt-4">
        <TabsList>
          <TabsTrigger value="deliverable">Deliverable</TabsTrigger>
          {project.reportNeeded && <TabsTrigger value="report">Report</TabsTrigger>}
          <TabsTrigger value="defense">Defense</TabsTrigger>
        </TabsList>

        {evaluationGrids.map((grid) => (
          <TabsContent key={grid.target} value={grid.target}>
            <div className="p-4 border rounded-md">
              <h2 className="text-xl font-semibold">{grid.title}</h2>
              <p>
                <span className="font-semibold">Global Comment:</span>{" "}
                {grid.globalComment || "None"}
              </p>
              <p>
                <span className="font-semibold">Final:</span>{" "}
                {grid.isFinal ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">Global Score:</span>{" "}
                {grid.globalScore || "Not calculated"}
              </p>

              <h3 className="text-lg font-semibold mt-4">Criteria</h3>
              <ul>
                {grid.criteria.map((c) => (
                  <li key={c.id}>
                    {c.name} (Weight: {c.weight})
                  </li>
                ))}
              </ul>

              {selectedGroup && (
                <>
                  <h3 className="text-lg font-semibold mt-4">
                    Existing Grades
                  </h3>
                  <ul>
                    {grid.grades
                      .filter(
                        (g) =>
                          g.group?.id.toString() === selectedGroupId ||
                          selectedGroup.students.some(
                            (s) => s.id === g.student?.id
                          )
                      )
                      .map((g) => (
                        <li key={g.id}>
                          <span className="font-semibold">
                            Target:
                          </span>{" "}
                          {g.group?.name || g.student?.name || "N/A"},{" "}
                          <span className="font-semibold">Grade:</span> {g.grade},{" "}
                          <span className="font-semibold">Comment:</span>{" "}
                          {g.comment}
                        </li>
                      ))}
                  </ul>
                  <AddGradeForm
                    grid={grid}
                    selectedGroup={selectedGroup}
                    onAddGrade={handleAddGrade}
                  />
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface AddGradeFormProps {
  grid: EvaluationGrid;
  selectedGroup: Group;
  onAddGrade: (
    target: "deliverable" | "report" | "defense",
    criteriaId: number,
    grade: number,
    comment: string,
    studentId?: number
  ) => void;
}

function AddGradeForm({ grid, selectedGroup, onAddGrade }: AddGradeFormProps) {
  const [grade, setGrade] = useState(0);
  const [comment, setComment] = useState("");
  const [criteriaId, setCriteriaId] = useState<number | null>(null);
  const [gradeStudent, setGradeStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (criteriaId) {
      onAddGrade(
        grid.target,
        criteriaId,
        grade,
        comment,
        gradeStudent ? selectedStudentId : undefined
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold">Add Grade</h3>
      <div className="flex items-center space-x-2">
        <Switch
          id="grade-student"
          checked={gradeStudent}
          onCheckedChange={setGradeStudent}
        />
        <Label htmlFor="grade-student">Grade only a student in the group</Label>
        {gradeStudent && (
          <Select
            onValueChange={(value) => setSelectedStudentId(Number(value))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {selectedGroup.students.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label htmlFor="criteria">Criteria</Label>
        <Select onValueChange={(value) => setCriteriaId(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select criteria" />
          </SelectTrigger>
          <SelectContent>
            {grid.criteria.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="grade">Grade</Label>
        <Input
          id="grade"
          type="number"
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          min="0"
          max="20"
        />
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Input
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <Button type="submit">Validate Grade</Button>
    </form>
  );
}
