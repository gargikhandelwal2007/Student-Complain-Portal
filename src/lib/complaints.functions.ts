import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth as requireSupabaseAuth } from "@/lib/require-auth";
import type { Database } from "@/integrations/supabase/types";

const statusSchema = z.enum(["open", "in_progress", "resolved", "closed"]);
const prioritySchema = z.enum(["low", "medium", "high"]);

const createComplaintSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  categoryId: z.string().min(1).max(100),
  priority: prioritySchema,
});


const updateComplaintSchema = z.object({
  id: z.string().uuid(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
});

const addNoteSchema = z.object({
  complaintId: z.string().uuid(),
  note: z.string().min(1).max(2000),
  isInternal: z.boolean().default(false),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(200),
  studentId: z.string().max(100).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileResult, roleResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (roleResult.error) throw roleResult.error;

    const roles = (roleResult.data ?? []).map((r) => r.role);

    return {
      profile: profileResult.data,
      role: roles.includes("admin") ? ("admin" as const) : ("student" as const),
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        student_id: data.studentId ?? null,
        department: data.department ?? null,
      })
      .eq("id", userId);

    if (error) throw error;
    return { ok: true };
  });

export const listComplaints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const roleResult = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = (roleResult.data ?? []).some((r) => r.role === "admin");

    let query = supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("student_id", userId);
    }

    const { data: complaints, error } = await query;
    if (error) throw error;

    const studentIds = Array.from(new Set((complaints ?? []).map((c) => c.student_id)));
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, student_id")
      .in("id", studentIds.length ? studentIds : [userId]);

    if (profilesError) throw profilesError;

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return {
      complaints: (complaints ?? []).map((c) => ({
        ...c,
        profiles: profileMap.get(c.student_id) ?? null,
      })),
      isAdmin,
    };
  });


export const getComplaint = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const roleResult = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = (roleResult.data ?? []).some((r) => r.role === "admin");

    let complaintQuery = supabase
      .from("complaints")
      .select("*")
      .eq("id", data.id);

    if (!isAdmin) {
      complaintQuery = complaintQuery.eq("student_id", userId);
    }

    const { data: complaint, error: complaintError } = await complaintQuery.maybeSingle();
    if (complaintError) throw complaintError;
    if (!complaint) throw new Error("Complaint not found");

    const { data: studentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, student_id")
      .eq("id", complaint.student_id)
      .maybeSingle();

    if (profileError) throw profileError;

    let notesQuery = supabase
      .from("complaint_notes")
      .select("*")
      .eq("complaint_id", data.id);

    if (!isAdmin) {
      notesQuery = notesQuery.eq("is_internal", false);
    }

    notesQuery = notesQuery.order("created_at", { ascending: true });

    const { data: notes, error: notesError } = await notesQuery;
    if (notesError) throw notesError;

    const authorIds = Array.from(new Set((notes ?? []).map((n) => n.author_id)));
    const { data: noteProfiles, error: noteProfilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds.length ? authorIds : [userId]);

    if (noteProfilesError) throw noteProfilesError;

    const profileMap = new Map((noteProfiles ?? []).map((p) => [p.id, p]));

    return {
      complaint: {
        ...complaint,
        profiles: studentProfile,
      },
      notes: (notes ?? []).map((n) => ({
        ...n,
        profiles: profileMap.get(n.author_id) ?? null,
      })),
      isAdmin,
    };
  });


export const createComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createComplaintSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert({
        student_id: userId,
        title: data.title,
        description: data.description,
        category: data.categoryId,
        priority: data.priority,
        status: "open",
      })
      .select("*")
      .single();

    if (error) throw error;
    return complaint;
  });

export const listComplaintCategories = createServerFn({ method: "GET" }).handler(async () => {
  return [
    { id: "academic", name: "Academic Issues" },
    { id: "facilities", name: "Facilities" },
    { id: "harassment", name: "Harassment / Bullying" },
    { id: "it", name: "IT / Technology" },
    { id: "financial", name: "Financial / Fees" },
    { id: "transport", name: "Transport" },
    { id: "other", name: "Other" },
  ];
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).some((r) => r.role === "admin")
      ? ("admin" as const)
      : ("student" as const);
  });


export const updateComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateComplaintSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const update: Partial<Database["public"]["Tables"]["complaints"]["Update"]> = {};
    if (data.status) update.status = data.status;
    if (data.priority) update.priority = data.priority;

    const { data: complaint, error } = await supabase
      .from("complaints")
      .update(update)
      .eq("id", data.id)
      .select("*")
      .single();

    if (error) throw error;
    return complaint;
  });

export const addComplaintNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => addNoteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: note, error } = await supabase
      .from("complaint_notes")
      .insert({
        complaint_id: data.complaintId,
        author_id: userId,
        note: data.note,
        is_internal: data.isInternal,
      })
      .select("*, profiles(full_name)")
      .single();

    if (error) throw error;
    return note;
  });

export const ensureAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingAdmin } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (existingAdmin) {
      return { isAdmin: true, promoted: false };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (error) throw error;

    return { isAdmin: true, promoted: true };
  });
