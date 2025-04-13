import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { coursesData } from "@/utils/coursesData";
import Title from "@/components/atoms/Title";

const CoursesSection = () => {
  return (
    <section className="px-4 py-4 md:px-8 bg-[#F8FCFD] rounded-xl mb-8">
      <div className="flex justify-center mb-6">
        <Title className="rotate-[-15deg]">Courses</Title>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:pb-6">
        {coursesData.map((course, index) => (
          <Card
            key={index}
            className="overflow-hidden transition-all hover:shadow-xl pt-0"
          >
            <Image
              src="/courses.svg"
              alt={course.imageAlt}
              className="w-full"
              width={100}
              height={100}
            />

            <CardHeader className="-mt-3 px-4">
              <CardTitle className="text-lg font-bold">
                {course.title}
              </CardTitle>
              <p className="text-sm -mt-1 font-bold">
                Duration: {course.duration}
              </p>
            </CardHeader>
            <CardContent className=" -mt-3 px-4">
              <p className="text-gray-600 text-[13px]">{course.description}</p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button
                variant="default"
                size="lg"
                className="bg-[#00D4FF] hover:bg-cyan-300 text-[#004755] font-semibold"
              >
                Join Course
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CoursesSection;
