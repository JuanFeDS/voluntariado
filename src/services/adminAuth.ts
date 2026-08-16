import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";

export interface AdminSession {
  email: string;
}

/** app_metadata solo lo puede fijar el servidor (SQL editor), nunca el propio usuario. */
function toAdminSession(session: Session | null): AdminSession | null {
  if (!session) return null;
  if (session.user.app_metadata?.is_admin !== true) return null;
  return { email: session.user.email ?? "" };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return toAdminSession(data.session);
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message === "Invalid login credentials") {
      throw new Error("Correo o contraseña incorrectos.");
    }
    throw error;
  }
  const admin = toAdminSession(data.session);
  if (!admin) {
    await supabase.auth.signOut();
    throw new Error("Esta cuenta no tiene permisos de administrador.");
  }
  return admin;
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}
