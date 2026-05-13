import { PageHeader } from "@/components/ui/page-header";

export default function SignInPage() {
  return (
    <main className="main">
      <PageHeader
        eyebrow="Access"
        title="Sign in"
        description="Supabase Auth will back this screen when credentials are connected."
      />
      <form className="card form">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@shop.com" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <button className="button" type="button">
          Sign in
        </button>
      </form>
    </main>
  );
}

