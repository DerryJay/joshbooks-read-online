/** Small, dependency-free validation helpers shared by the auth forms. */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailError(email: string): string | null {
  if (!email.trim()) return "Please enter your email address.";
  if (!EMAIL_PATTERN.test(email.trim())) return "That doesn't look like a valid email address.";
  return null;
}

export function passwordError(password: string): string | null {
  if (!password) return "Please enter a password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return "Include both a lowercase and an uppercase letter.";
  }
  if (!/\d/.test(password)) return "Include at least one number.";
  return null;
}

export function nameError(name: string): string | null {
  if (!name.trim()) return "Please enter your full name.";
  if (name.trim().length < 2) return "That name looks too short.";
  return null;
}

/** Turns provider errors into calm, human sentences. */
export function friendlyAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) {
    return "That email and password don't match an account.";
  }
  if (text.includes("email not confirmed")) {
    return "Please confirm your email address first — check your inbox for the link.";
  }
  if (text.includes("already registered") || text.includes("already been registered")) {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (text.includes("rate limit") || text.includes("too many")) {
    return "Too many attempts just now. Please wait a moment and try again.";
  }
  return message || "Something went wrong. Please try again.";
}
