import LoginMiniNav from "@/components/loginpage/LoginMiniNav";
import CreateAccountForm from "@/components/createaccountpage/CreateAccountForm";

export default function CreateAccountPage() {
  return (
    <div className="bg-auth-surface text-on-surface min-h-screen">
      <LoginMiniNav />
      <main>
        <CreateAccountForm />
      </main>
    </div>
  );
}
