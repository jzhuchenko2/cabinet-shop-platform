import { PageHeader } from "@/components/ui/page-header";
import { selectDemoUser } from "./actions";

export default function SignInPage() {
  return (
    <main className="main">
      <PageHeader
        eyebrow="Access"
        title="Sign in"
        description="Supabase Auth will back this screen when credentials are connected. For now, select a seeded demo role."
      />
      <form action={selectDemoUser} className="card form">
        <div className="field">
          <label htmlFor="email">Demo user</label>
          <select id="email" name="email">
            <option value="admin@example.com">Owner/Admin - MVP Admin</option>
            <option value="manager@example.com">Manager - Morgan Manager</option>
            <option value="sam@example.com">Department Lead - Sam Rivera</option>
            <option value="casey@example.com">Employee - Casey Worker</option>
          </select>
        </div>
        <button className="button" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
