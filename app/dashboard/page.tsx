"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, FileClock, Info } from "lucide-react"
import Link from "next/link"

interface User {
    id: number
    email: string
    name: string
    role: string
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Récupère l'utilisateur depuis le localStorage
        const storedUser = localStorage.getItem("currentUser")
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
            } catch (error) {
                console.error("Erreur lors de l’analyse des données utilisateur :", error)
            }
        }
    }, [])

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Chargement...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Tableau de bord</h1>
                {user.role === "teacher" && (
                    <Button>
                        <Link href="/dashboard/projects/new">Créer un nouveau projet</Link>
                    </Button>
                )}
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Bienvenue sur ProjectHub, {user.name} !</AlertTitle>
                <AlertDescription>
                    {user.role === "teacher"
                        ? "Gérez vos classes et projets depuis ce tableau de bord."
                        : "Consultez vos projets et vos remises depuis ce tableau de bord."}
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Projets actifs</TabsTrigger>
                    <TabsTrigger value="upcoming">Échéances à venir</TabsTrigger>
                    <TabsTrigger value="recent">Activité récente</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <ProjectCard
                            title="Développement Web"
                            description="Créer une application web full-stack"
                            deadline="22 mai 2025"
                            status="En cours"
                            href="/dashboard/projects/1"
                        />
                        <ProjectCard
                            title="Design d'application mobile"
                            description="Concevoir l'interface utilisateur/UX d'une application mobile"
                            deadline="19 juin 2025"
                            status="Non commencé"
                            href="/dashboard/projects/2"
                        />
                        <ProjectCard
                            title="Systèmes de bases de données"
                            description="Implémenter un système de base de données avec des requêtes"
                            deadline="10 juillet 2025"
                            status="En cours"
                            href="/dashboard/projects/3"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    <div className="grid gap-4">
                        <DeadlineCard
                            project="Développement Web"
                            deliverable="Prototype Frontend"
                            deadline="22 mai 2025 - 23:59"
                            daysLeft={7}
                        />
                        <DeadlineCard
                            project="Design d'application mobile"
                            deliverable="Maquettes"
                            deadline="19 juin 2025 - 23:59"
                            daysLeft={14}
                        />
                        <DeadlineCard
                            project="Systèmes de bases de données"
                            deliverable="Conception du schéma"
                            deadline="10 juillet 2025 - 23:59"
                            daysLeft={21}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                    <div className="grid gap-4">
                        <ActivityCard
                            title="Projet créé"
                            description="Le projet Développement Web a été créé"
                            timestamp="il y a 2 jours"
                        />
                        <ActivityCard
                            title="Remise effectuée"
                            description="Vous avez soumis 'Document des exigences' pour Design d'application mobile"
                            timestamp="il y a 3 jours"
                        />
                        <ActivityCard
                            title="Groupe formé"
                            description="Vous avez rejoint le Groupe 3 pour Systèmes de bases de données"
                            timestamp="il y a 1 semaine"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ProjectCard({
                         title,
                         description,
                         deadline,
                         status,
                         href,
                     }: {
    title: string
    description: string
    deadline: string
    status: string
    href: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Date limite :</span>
                        <span className="font-medium">{deadline}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Statut :</span>
                        <span className="font-medium">{status}</span>
                    </div>
                    <Button variant="outline" className="mt-2 w-full" asChild>
                        <Link href={href}>Voir le projet</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function DeadlineCard({
                          project,
                          deliverable,
                          deadline,
                          daysLeft,
                      }: {
    project: string
    deliverable: string
    deadline: string
    daysLeft: number
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${daysLeft <= 7 ? "bg-red-100" : "bg-slate-100"}`}>
                        <FileClock className={`h-5 w-5 ${daysLeft <= 7 ? "text-red-500" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">{deliverable}</h3>
                        <p className="text-sm text-slate-500">{project}</p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm">{deadline}</span>
                            <span className={`text-sm font-medium ${daysLeft <= 7 ? "text-red-500" : "text-slate-500"}`}>
                  {daysLeft} jours restants
                </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ActivityCard({
                          title,
                          description,
                          timestamp,
                      }: {
    title: string
    description: string
    timestamp: string
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-slate-100">
                        <Clock className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-slate-500">{description}</p>
                        <p className="text-xs text-slate-400 mt-1">{timestamp}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
