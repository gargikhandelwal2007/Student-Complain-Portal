import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ClipboardList, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Complaint Portal" },
      { name: "description", content: "Submit, track, and resolve student complaints quickly and transparently." },
      { property: "og:title", content: "Student Complaint Portal" },
      { property: "og:description", content: "Submit, track, and resolve student complaints quickly and transparently." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary">
            <GraduationCap className="h-7 w-7" />
            <span>Student Complaint Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                A simpler way to handle student complaints
              </h1>
              <p className="text-lg text-muted-foreground">
                Submit complaints, track their progress, and get timely updates — all in one place.
                For students and administrators.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<ClipboardList className="h-6 w-6 text-primary" />}
                title="Easy Submission"
                description="Submit complaints with category, priority, and details in seconds."
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6 text-primary" />}
                title="Real-time Updates"
                description="Track status changes and read admin notes as issues progress."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                title="Role-based Access"
                description="Students see their own complaints; admins manage everything."
              />
              <FeatureCard
                icon={<GraduationCap className="h-6 w-6 text-primary" />}
                title="Built for Schools"
                description="Designed for universities, colleges, and student services."
              />
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Ready to streamline complaint management?</h2>
            <p className="mt-2 text-muted-foreground">Create a free account and submit your first complaint today.</p>
            <Button className="mt-6" size="lg" asChild>
              <Link to="/auth">Create account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Student Complaint Portal. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
