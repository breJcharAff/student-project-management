import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GradeProjectPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Button asChild>
                <Link href={`/dashboard/projects/${params.id}/grade/reports`}>
                    View Reports to Grade
                </Link>
            </Button>
        </div>
    );
}
