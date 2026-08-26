import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { listComplaintCategories, createComplaint } from "@/lib/complaints.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

const categoriesQueryOptions = queryOptions({
  queryKey: ["complaint-categories"],
  queryFn: () => listComplaintCategories(),
});

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title is too long"),
  categoryId: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high"]),
  description: z.string().min(20, "Please provide at least 20 characters"),
});

export const Route = createFileRoute("/_authenticated/complaints/new")({
  head: () => ({
    meta: [
      { title: "Submit Complaint — Student Complaint Portal" },
      { name: "description", content: "Submit a new complaint to the administration." },
      { property: "og:title", content: "Submit Complaint — Student Complaint Portal" },
      { property: "og:description", content: "Submit a new complaint to the administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQueryOptions);
  },
  component: NewComplaintPage,
});

function NewComplaintPage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useSuspenseQuery(categoriesQueryOptions);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      priority: "medium" as const,
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createComplaint({
        data: {
          title: values.title,
          categoryId: values.categoryId,
          priority: values.priority,
          description: values.description,
        },
      });
      toast.success("Complaint submitted successfully");
      navigate({ to: "/complaints/$id", params: { id: result.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit complaint");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit a complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of your complaint"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <select
                      id="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe your complaint in detail..."
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
