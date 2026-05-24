import LoginMiniNav from "@/components/loginpage/LoginMiniNav";
import LoginFormCard from "@/components/loginpage/LoginFormCard";
import LoginImagesStrip from "@/components/loginpage/LoginImagesStrip";

export default function LoginPage() {
  return (
    <div className="bg-auth-surface text-on-surface min-h-screen">
      <LoginMiniNav />
      <main>
        <div className="flex items-center justify-center min-h-screen px-4 pt-16 pb-10">
          <LoginFormCard />
        </div>
        <div className="pb-16">
          <LoginImagesStrip />
        </div>
      </main>
    </div>
  );
}
