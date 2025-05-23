import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Calendar, FileText, Users } from "lucide-react"

export default function Home() {
  return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">ProjectHub</h1>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="bg-gradient-to-r from-slate-100 to-slate-200 py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-6">Student Project Management System</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                A comprehensive platform for teachers to manage student projects and for students to collaborate and
                submit their work.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button size="lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard
                    icon={<Users className="h-10 w-10" />}
                    title="Group Management"
                    description="Create and manage student groups with flexible configuration options."
                />
                <FeatureCard
                    icon={<FileText className="h-10 w-10" />}
                    title="Deliverable Tracking"
                    description="Set up deliverables with deadlines and automatic verification."
                />
                <FeatureCard
                    icon={<BookOpen className="h-10 w-10" />}
                    title="Online Reports"
                    description="Students can write reports online with a rich text editor."
                />
                <FeatureCard
                    icon={<Calendar className="h-10 w-10" />}
                    title="Presentation Scheduling"
                    description="Organize presentation schedules and generate attendance sheets."
                />
              </div>
            </div>
          </section>

          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center">For Teachers & Students</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4">Teacher Interface</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Create and manage classes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Define project requirements and deadlines</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Review submissions and detect plagiarism</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Create custom grading criteria</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4">Student Interface</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Join or create project groups</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Submit deliverables with pre-submission validation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Write and edit reports collaboratively</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>View grades and feedback</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-slate-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">ProjectHub</h2>
                <p className="text-slate-300">Student Project Management System</p>
              </div>
              <div className="text-slate-300">&copy; {new Date().getFullYear()} ProjectHub. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </div>
  )
}

function FeatureCard({
                       icon,
                       title,
                       description,
                     }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col items-center text-center">
        <div className="bg-slate-100 p-3 rounded-full mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>
  )
}
