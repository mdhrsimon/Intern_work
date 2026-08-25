import type { User } from "../types/user";

interface UserInformationProps {
  user: User;
}

const UserInformation = ({
  user,
}: UserInformationProps) => {
  return (
    <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">

      <div>
        <p className="text-base text-muted-foreground">
          Full Name
        </p>

        <p className="mt-1 text-lg font-medium">
          {user.fullName}
        </p>
      </div>

      <div>
        <p className="text-base text-muted-foreground">
          Email
        </p>

        <p className="mt-1 break-all text-lg font-medium">
          {user.email}
        </p>
      </div>

      <div>
        <p className="text-base text-muted-foreground">
          Phone
        </p>

        <p className="mt-1 text-lg font-medium">
          {user.phone}
        </p>
      </div>

      <div>
        <p className="text-base text-muted-foreground">
          Date of Birth
        </p>

        <p className="mt-1 text-lg font-medium">
          {user.dateOfBirth}
        </p>
      </div>

      <div>
        <p className="text-base text-muted-foreground">
          Address
        </p>

        <p className="mt-1 text-lg font-medium">
          {user.address}
        </p>
      </div>

      <div>
        <p className="text-base text-muted-foreground">
          Gender
        </p>

        <p className="mt-1 text-lg font-medium">
          {user.gender}
        </p>
      </div>

    </div>
  );
};

export default UserInformation;