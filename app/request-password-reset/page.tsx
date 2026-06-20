import RequestPasswordResetForm from "@/components/auth/RequestPasswordResetForm";

export default function RequestPasswordResetPage(){

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-6">
          パスワード再設定
        </h1>

        <RequestPasswordResetForm />

      </div>
    </div>
  );
}