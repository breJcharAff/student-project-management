"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AuthManager } from "@/lib/auth";

// Define types for the data
interface Project {
  id: number;
  name: string;
  groups: Group[];
}

interface Group {
  id: number;
  name: string;
  deliverables: Deliverable[];
  reports: Report[];
  defenseTime: string;
}

interface Deliverable {
  id: number;
  filename: string;
}

interface Report {
  id: number;
  title: string;
}

interface EvaluationGrid {
  id: number;
  target: 'deliverable' | 'report' | 'defense';
  targetId: number;
  isFinal: boolean;
  globalComment: string;
  criteria: Criteria[];
  group: {
    id: number;
  };
}

interface Criteria {
  id: number;
  name: string;
  weight: number;
}

function AddCriteriaForm({ gridId, onCriteriaAdded }: { gridId: number, onCriteriaAdded: () => void }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        fetch(`/api/evaluation-grids/${gridId}/criteria`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthManager.getToken()}` },
        body: JSON.stringify({ criteria: [{ name, weight }] }),
      }
    )
    .then(res => res.json())
    .then(() => {
      onCriteriaAdded();
      setName("");
      setWeight(1);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
      <Input
        type="text"
        placeholder="Criteria Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        required
      />
      <Button type="submit">Add Criteria</Button>
    </form>
  );
}

export default function GradeProjectPage() {
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [evaluationGrids, setEvaluationGrids] = useState<EvaluationGrid[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const fetchEvaluationGrids = () => {
    if (projectId) {
            fetch(`/api/evaluation-grids/project/${projectId}`, { headers: { 'Authorization': `Bearer ${AuthManager.getToken()}` } })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setEvaluationGrids(data);
          }
        });
    }
  }

  useEffect(() => {
    if (projectId) {
      // Fetch project data
            fetch(`/api/projects/${projectId}`, { headers: { 'Authorization': `Bearer ${AuthManager.getToken()}` } })
        .then((res) => res.json())
        .then((data) => setProject(data));

      fetchEvaluationGrids();
    }
  }, [projectId]);

  const selectedGroup = project?.groups?.find((g) => g.id === selectedGroupId);
  const groupEvaluationGrids = evaluationGrids.filter(
    (eg) => eg.group.id === selectedGroupId
  );

  const handleCriteriaAdded = () => {
    fetchEvaluationGrids();
  }

  const finalizeEvaluation = (gridId: number) => {
        fetch(`/api/evaluation-grids/finalize/${gridId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${AuthManager.getToken()}` } })
      .then(() => fetchEvaluationGrids());
  }

    const renderEvaluationGrid = (target: 'deliverable' | 'report' | 'defense') => {
    const grid = groupEvaluationGrids.find((eg) => eg.target === target);

    if (!grid) {
      let targetExists = false;
      if (selectedGroup) {
        if (target === 'deliverable') {
          targetExists = selectedGroup.deliverables && selectedGroup.deliverables.length > 0;
        } else if (target === 'report') {
          targetExists = selectedGroup.reports && selectedGroup.reports.length > 0;
        } else if (target === 'defense') {
          targetExists = !!selectedGroup.defenseTime;
        }
      }

      if (targetExists) {
        return (
          <Button onClick={() => createEvaluationGrid(target)}>
            Create Evaluation Grid for {target}
          </Button>
        );
      } else {
        return <p>No {target} found for this group.</p>;
      }
    }

    return (
      <div>
        <p>Target: {getTargetName(grid)}</p>
        <p>Global Comment: {grid.globalComment}</p>
        <p>Is Final: {grid.isFinal ? "Yes" : "No"}</p>
        <ul>
          {(grid.criteria || []).map((c) => (
            <li key={c.id}>
              {c.name} (Weight: {c.weight})
            </li>
          ))}
        </ul>
        <AddCriteriaForm gridId={grid.id} onCriteriaAdded={handleCriteriaAdded} />
        {!grid.isFinal && (
          <Button onClick={() => finalizeEvaluation(grid.id)} className="mt-4">
            Finalize Evaluation
          </Button>
        )}
      </div>
    );
  };""

  const getTargetName = (grid: EvaluationGrid) => {
    console.log("Searching for target name with grid:", grid);
    if (!project) {
      console.log("Project data is not available yet.");
      return "";
    }
    console.log("Project data:", project);

    const group = project.groups.find(g => g.id === grid.group.id);
    console.log("Found group:", group);
    if (!group) {
      console.log("Group not found for grid:", grid);
      return "";
    }

    if (grid.target === 'deliverable') {
      console.log("Searching for deliverable with targetId:", grid.targetId);
      console.log("Deliverables in group:", group.deliverables);
      const deliverable = group.deliverables.find(d => d.id === grid.targetId);
      console.log("Found deliverable:", deliverable);
      return `Deliverable: ${deliverable?.filename}`;
    }
    if (grid.target === 'report') {
      const report = group.reports.find(r => r.id === grid.targetId);
      return `Report: ${report?.title}`;
    }
    if (grid.target === 'defense') {
      return `Defense: ${new Date(group.defenseTime).toLocaleString()}`;
    }
    return "";
  }

  const createEvaluationGrid = (target: 'deliverable' | 'report' | 'defense') => {
    if (!projectId || !selectedGroupId) return;

    let targetId;
    if (target === 'deliverable') {
        targetId = selectedGroup?.deliverables[0]?.id;
    } else if (target === 'report') {
        targetId = selectedGroup?.reports[0]?.id;
    } else {
        targetId = selectedGroupId;
    }


    if (!targetId) {
        console.error(`No ${target} found for the selected group.`);
        return;
    }


        fetch('/api/evaluation-grids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthManager.getToken()}` },
        body: JSON.stringify({
            projectId: Number(projectId),
            target,
            targetId,
            groupId: selectedGroupId,
        }),
    })
    .then(res => res.json())
    .then(newGrid => {
        setEvaluationGrids([...evaluationGrids, newGrid]);
    });
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Grade Project: {project?.name}</h1>
      <Select onValueChange={(value) => setSelectedGroupId(Number(value))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {project?.groups?.map((group) => (
            <SelectItem key={group.id} value={String(group.id)}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedGroup && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Group: {selectedGroup.name}</h2>
          <Tabs defaultValue="deliverables" className="mt-4">
            <TabsList>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="defense">Defense</TabsTrigger>
            </TabsList>
            <TabsContent value="deliverables">
              {renderEvaluationGrid('deliverable')}
            </TabsContent>
            <TabsContent value="reports">
              {renderEvaluationGrid('report')}
            </TabsContent>
            <TabsContent value="defense">
              {renderEvaluationGrid('defense')}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}