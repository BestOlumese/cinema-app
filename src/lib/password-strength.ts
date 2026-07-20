export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
};

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const clamped = Math.min(4, Math.max(0, password.length === 0 ? 0 : score - 1)) as
    | 0
    | 1
    | 2
    | 3
    | 4;

  const labels: PasswordStrength["label"][] = [
    "Very weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  return { score: clamped, label: labels[clamped] };
}
