import type { Education } from "../types/user";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

interface EducationListProps {
  education: Education[];
}

const EducationList = ({
  education,
}: EducationListProps) => {
  return (
    <div className="mt-10">

      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          Education
        </h2>

        <p className="mt-1 text-base text-muted-foreground">
          Educational qualifications.
        </p>
      </div>

      <div className="space-y-4">

        {education.map((item, index) => (
          <Card
            key={index}
            className="bg-muted/30"
          >

            <CardContent className="pt-6">

              <div className="mb-4">
                <p className="text-base font-semibold">
                  Education {index + 1}
                </p>
              </div>

              <Separator className="mb-5" />

              <div className="grid gap-5 md:grid-cols-3">

                <div>
                  <p className="text-base text-muted-foreground">
                    Degree
                  </p>

                  <p className="mt-1 text-lg font-medium">
                    {item.degree}
                  </p>
                </div>

                <div>
                  <p className="text-base text-muted-foreground">
                    Institute
                  </p>

                  <p className="mt-1 text-lg font-medium">
                    {item.institute}
                  </p>
                </div>

                <div>
                  <p className="text-base text-muted-foreground">
                    Year Passed
                  </p>

                  <p className="mt-1 text-lg font-medium">
                    {item.yearPassed}
                  </p>
                </div>

              </div>

            </CardContent>

          </Card>
        ))}

      </div>

    </div>
  );
};

export default EducationList;