import { LandingPage } from "@/components/marketing/landing-page";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "StudyFlow — Evidence-based assignment workflow",
  description:
    "Turn every assignment into a clear, evidence-based workflow. Notes, research, claim–evidence, and outline coaching — never ghostwriting.",
};

export default async function Home() {
  const session = await getSession();
  return <LandingPage authenticated={Boolean(session)} />;
}
