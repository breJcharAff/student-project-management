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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { AuthManager, type User } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";

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
  deliverables?: any[]; // Assuming deliverables exist for filtering
  reports?: any[]; // Assuming reports exist for filtering
  defenseTime?: string | null; // Assuming defenseTime exists for filtering
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
  const { toast } = useToast();

  useEffect(() => {
    setUser(AuthManager.getUser());
  }, []);
  const [project, setProject] = useState<Project | null>(null);
  const [evaluationGrids, setEvaluationGrids] = useState<EvaluationGrid[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [globalComment, setGlobalComment] = useState<string>("");

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

  const filteredEvaluationGrids = React.useMemo(() => {
    if (!selectedGroupId || !evaluationGrids) return [];

    return evaluationGrids.filter((grid) => {
      return grid.group?.id.toString() === selectedGroupId;
    });
  }, [selectedGroupId, evaluationGrids]);

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

  const handleFinalizeEvaluation = async (evaluationGridId: number, globalComment: string) => {
    try {
      await apiClient.finalizeEvaluationGrid(evaluationGridId, { globalComment });
      toast({
        title: "Evaluation Finalized",
        description: "The evaluation grid has been successfully finalized.",
      });
      // Refresh evaluation grids after finalization
      apiClient.getEvaluationGridsByProject(params.id).then((res) => {
        if (res.data) setEvaluationGrids(res.data);
      });
    } catch (error) {
      console.error("Failed to finalize evaluation grid", error);
      toast({
        title: "Error",
        description: "Failed to finalize evaluation grid.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="group-select" className="sr-only">Select a group</Label>
            <Select onValueChange={setSelectedGroupId}>
              <SelectTrigger id="group-select" className="w-[280px]">
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
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p className="text-lg font-semibold mb-2">Selected Group: {selectedGroup.name}</p>
              <p className="text-sm">
                <span className="font-semibold">Students:</span>{" "}
                {selectedGroup.students.map((s) => s.name).join(", ")}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Overall Grade:</span>{" "}
                {selectedGroup.grade !== null ? selectedGroup.grade : "Not graded yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Grids</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deliverable" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deliverable">Deliverable</TabsTrigger>
                {project.reportNeeded && <TabsTrigger value="report">Report</TabsTrigger>}
                <TabsTrigger value="defense">Defense</TabsTrigger>
              </TabsList>

              {filteredEvaluationGrids.map((grid) => (
                <TabsContent key={grid.target} value={grid.target} className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{grid.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        <span className="font-semibold">Global Comment:</span>{" "}
                        {grid.globalComment || "None"}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Final:</span>{" "}
                        {grid.isFinal ? "Yes" : "No"}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Global Score:</span>{" "}
                        {grid.globalScore !== null ? grid.globalScore : "Not calculated"}
                      </p>

                      <h3 className="text-md font-semibold mt-4">Criteria</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {grid.criteria.map((c) => (
                          <li key={c.id}>
                            {c.name} (Weight: {c.weight})
                          </li>
                        ))}
                      </ul>

                      <h3 className="text-md font-semibold mt-4">Existing Grades</h3>
                      <ul className="space-y-2 text-sm">
                        {grid.grades
                          .filter(
                            (g) =>
                              g.group?.id.toString() === selectedGroupId ||
                              selectedGroup.students.some(
                                (s) => s.id === g.student?.id
                              )
                          )
                          .map((g) => (
                            <li key={g.id} className="p-2 border rounded-md bg-gray-50">
                              <span className="font-semibold">
                                Target:
                              </span>{" "}
                              {g.group?.name || g.student?.name || "N/A"},{" "}
                              <span className="font-semibold">Grade:</span> {g.grade},{" "}
                              <span className="font-semibold">Comment:</span>{" "}
                              {g.comment}
                            </li>
                          ))}
                          {grid.grades.filter(
                            (g) =>
                              g.group?.id.toString() === selectedGroupId ||
                              selectedGroup.students.some(
                                (s) => s.id === g.student?.id
                              )
                          ).length === 0 && <p className="text-sm text-gray-500">No grades recorded for this group/student in this grid.</p>}
                      </ul>
                      <AddGradeForm
                        grid={grid}
                        selectedGroup={selectedGroup}
                        onAddGrade={handleAddGrade}
                      />
                      {!grid.isFinal && (
                        <div className="flex items-end space-x-2 mt-4">
                          <div className="flex-grow">
                            <Label htmlFor={`global-comment-${grid.id}`}>Global Comment</Label>
                            <Input
                              id={`global-comment-${grid.id}`}
                              value={globalComment}
                              onChange={(e) => setGlobalComment(e.target.value)}
                              placeholder="Add a global comment (optional)"
                            />
                          </div>
                          <Button
                            onClick={() => handleFinalizeEvaluation(grid.id, globalComment)}
                            className="w-auto"
                          >
                            Finalize Evaluation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Add New Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                      <SelectValue placeholder="Select a student"/>
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
                  <SelectValue placeholder="Select criteria"/>
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
        </CardContent>
      </Card>
  );
}
