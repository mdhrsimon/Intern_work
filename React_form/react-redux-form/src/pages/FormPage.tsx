import UserForm from "../components/UserForm";
import Navbar from "../components/Navbar";

const FormPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="px-4 py-8 flex flex-col items-center">
        <UserForm />
      </main>
    </div>
  );
};

export default FormPage;