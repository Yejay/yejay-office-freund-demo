import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <SignUp
        appearance={{
          baseTheme: dark,
        }}
      />
    </div>
  );
}
