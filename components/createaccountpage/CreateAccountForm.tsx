import Link from "next/link";

const LABEL_CLS =
  "text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 block";
const INPUT_CLS =
  "w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2.5 text-on-surface text-sm focus:ring-0 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40";

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className={LABEL_CLS}>{label}</label>
      <input placeholder={placeholder} type={type} className={INPUT_CLS} />
    </div>
  );
}

export default function CreateAccountForm() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-white rounded-2xl p-10 shadow-sm w-full max-w-md mx-auto">
        <h1 className="font-headline text-4xl text-on-surface text-center mb-3 leading-tight">
          Create your
          <br />
          account
        </h1>
        <p className="text-on-surface-variant text-sm text-center mb-8">
          Join the leading retail intelligence platform.
        </p>
        <form className="flex flex-col gap-5" action="#">
          <div className="grid grid-cols-2 gap-4">
            <Field label="FIRST NAME" placeholder="John" />
            <Field label="LAST NAME" placeholder="Doe" />
          </div>
          <Field
            label="EMAIL ADDRESS"
            placeholder="analyst@ptg-retail.com"
            type="email"
          />
          <Field label="PASSWORD" placeholder="••••••••" type="password" />
          <button
            type="submit"
            className="w-full bg-lime-500 hover:bg-lime-400 active:bg-lime-600 text-white font-bold py-4 rounded-full text-sm tracking-widest transition-colors cursor-pointer border-0 mt-2"
          >
            CREATE ACCOUNT
          </button>
        </form>
        <hr className="border-outline-variant/20 my-6" />
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-sm text-on-surface-variant">
            Already have an account?
          </span>
          <Link
            href="/loginpage/loginPage"
            className="text-sm text-primary font-semibold hover:underline no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
