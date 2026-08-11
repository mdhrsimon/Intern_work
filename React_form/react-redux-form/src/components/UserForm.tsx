import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/actions";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(
      setUser({
        name,
        email,
        education,
        dateOfBirth,
      })
    );

    navigate("/display");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5 rounded-lg border bg-white p-8 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Education
        </label>

        <input
          type="text"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="w-full rounded border px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Date of Birth
        </label>

        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full rounded border px-4 py-3"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-black px-4 py-3 text-white hover:bg-gray-800"
      >
        Submit
      </button>
    </form>
  );
};

export default UserForm;