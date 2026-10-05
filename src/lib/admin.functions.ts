import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Enable/disable a reader account. The caller's admin role is verified server-side. */
export const setUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), disabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("You don't have permission to do that.");
    if (data.userId === context.userId) throw new Error("You can't disable your own account.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.disabled ? "876000h" : "none",
    });
    if (error) throw new Error("We couldn't update this account right now.");
    await supabaseAdmin.from("profiles").update({ disabled: data.disabled }).eq("id", data.userId);
    await supabaseAdmin.from("audit_log").insert({
      admin_id: context.userId,
      action: data.disabled ? "user.disabled" : "user.enabled",
      target_type: "user",
      target_id: data.userId,
    });
    return { ok: true };
  });
