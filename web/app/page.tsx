import { DiscordLoginForm } from "@/components/discord-login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <DiscordLoginForm />
      </div>
    </div>
  );
}
