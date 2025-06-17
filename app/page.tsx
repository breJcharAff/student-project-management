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
                <Button variant="outline">Connexion</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="bg-gradient-to-r from-slate-100 to-slate-200 py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-6">Système de gestion de projets étudiants</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Une plateforme complète pour que les enseignants gèrent les projets étudiants et que les étudiants collaborent et soumettent leur travail.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button size="lg">
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-12 text-center">Fonctionnalités clés</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard
                    icon={<Users className="h-10 w-10" />}
                    title="Gestion des groupes"
                    description="Créez et gérez des groupes d'étudiants avec des options de configuration flexibles."
                />
                <FeatureCard
                    icon={<FileText className="h-10 w-10" />}
                    title="Suivi des livrables"
                    description="Définissez les livrables avec des échéances et une vérification automatique."
                />
                <FeatureCard
                    icon={<BookOpen className="h-10 w-10" />}
                    title="Rapports en ligne"
                    description="Les étudiants peuvent rédiger des rapports en ligne avec un éditeur de texte enrichi."
                />
                <FeatureCard
                    icon={<Calendar className="h-10 w-10" />}
                    title="Planification des soutenances"
                    description="Organisez le planning des présentations et générez des feuilles de présence."
                />
              </div>
            </div>
          </section>

          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center">Pour les enseignants & les étudiants</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4">Interface Enseignant</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Créer et gérer des classes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Définir les exigences du projet et les échéances</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Examiner les soumissions et détecter le plagiat</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Créer des critères d’évaluation personnalisés</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4">Interface Étudiant</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Rejoindre ou créer un groupe de projet</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Soumettre les livrables avec validation préalable</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Rédiger et modifier les rapports en collaboration</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-slate-100 p-1 rounded-full mr-3 mt-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Consulter les notes et les retours</span>
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
                <p className="text-slate-300">Système de gestion de projets étudiants</p>
              </div>
              <div className="text-slate-300">&copy; {new Date().getFullYear()} ProjectHub. Tous droits réservés.</div>
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
