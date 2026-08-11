import UserForm from "../components/UserForm";

const FormPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          User Information
        </h1>

        <UserForm />
      </div>
    </div>
  );
};

export default FormPage;