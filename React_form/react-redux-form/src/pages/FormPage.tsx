import UserForm from "../components/UserForm";
import { Link } from "react-router-dom";
import {Button} from "@/components/ui/button";
const FormPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex flex-col items-center">
      <div className="mb-6 w-full max-w-3xl">
        <Link to="/">
          <Button variant="outline" size="lg">
            Back to List
          </Button>
        </Link>
        <Link to="/my-submission">
          <Button variant="outline">My submission</Button>
        </Link>
      </div>
      <UserForm />
    </div>
  );
};

export default FormPage;