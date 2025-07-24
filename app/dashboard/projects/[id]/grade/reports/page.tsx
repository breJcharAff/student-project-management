"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";

interface Group {
    id: number;
    name: string;
}

interface ReportPart {
    id: number;
    title: string;
    content: string;
    format: string;
}

export default function GradeReportsPage({ params }: { params: { id: string } }) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [reportParts, setReportParts] = useState<ReportPart[]>([]);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await apiClient.getProject(params.id);
                if (response.data) {
                    setGroups(response.data.groups);
                } else if (response.error) {
                    setError("Failed to fetch project data.");
                    toast.error("Failed to fetch project data.");
                }
            } catch (err) {
                setError("An unexpected error occurred.");
                toast.error("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [params.id]);

    useEffect(() => {
        if (selectedGroup) {
            setReportParts([]);
            setSelectedPart(null);
            const fetchReportParts = async () => {
                try {
                    const response = await apiClient.getReportPartsByGroup(selectedGroup);
                    if (response.data) {
                        setReportParts(response.data);
                    } else if (response.error) {
                        setError("Failed to fetch report parts.");
                        toast.error("Failed to fetch report parts.");
                    }
                } catch (err) {
                    setError("An unexpected error occurred.");
                    toast.error("An unexpected error occurred.");
                }
            };
            fetchReportParts();
        }
    }, [selectedGroup]);

    const renderContent = () => {
        if (!selectedGroup) {
            return <p>Please select a group to see the reports.</p>;
        }
        
        if (error) return <p className="text-red-500">{error}</p>;

        if (reportParts.length === 0) {
            return <p>No report parts found for this group.</p>;
        }

        const partToDisplay = reportParts.find(part => part.id.toString() === selectedPart);

        return (
            <div className="space-y-4">
                {selectedPart === "all" ? (
                    reportParts.map(part => (
                        <div key={part.id} className="prose dark:prose-invert max-w-none">
                            <h3 className="font-semibold text-lg border-b pb-2 mb-2">{part.title}</h3>
                            <MDEditor.Markdown source={part.content} />
                        </div>
                    ))
                ) : partToDisplay ? (
                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-2">{partToDisplay.title}</h3>
                        <MDEditor.Markdown source={partToDisplay.content} />
                    </div>
                ) : (
                    <p>Select a report part to view its content.</p>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Grade Reports</h1>
            <div className="flex space-x-4 mb-4">
                <Select onValueChange={setSelectedGroup} value={selectedGroup || ""}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a Group" />
                    </SelectTrigger>
                    <SelectContent>
                        {loading ? (
                            <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                        ) : (
                            groups.map(group => (
                                <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>

                <Select onValueChange={setSelectedPart} value={selectedPart || ""} disabled={!selectedGroup || reportParts.length === 0}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a Report Part" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Parts</SelectItem>
                        {reportParts.map(part => (
                            <SelectItem key={part.id} value={String(part.id)}>{part.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Report Content</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
