"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Define types for our data to ensure type safety
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
        if (loading) return <p>Loading...</p>;
        if (error) return <p>{error}</p>;

        const partToDisplay = reportParts.find(part => part.title === selectedPart);

        return (
            <div>
                {selectedPart === "all" ? (
                    reportParts.map(part => (
                        <div key={part.id}>
                            <h3>{part.title}</h3>
                            <div dangerouslySetInnerHTML={{ __html: part.content }} />
                        </div>
                    ))
                ) : partToDisplay ? (
                    <div>
                        <h3>{partToDisplay.title}</h3>
                        <div dangerouslySetInnerHTML={{ __html: partToDisplay.content }} />
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
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Group" />
                    </SelectTrigger>
                    <SelectContent>
                        {groups.map(group => (
                            <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setSelectedPart} value={selectedPart || ""} disabled={!selectedGroup}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Report Part" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
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
