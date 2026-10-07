import { LandingPage } from "@/components/marketing/landing-page";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "StudyFlow — Assignment workspace for university students",
  description:
    "Brief, notes, research, and claim–evidence in one place. Structure first — you write the essay.",
};

export default async function Home() {
  const session = await getSession();
  return <LandingPage authenticated={Boolean(session)} />;
}
