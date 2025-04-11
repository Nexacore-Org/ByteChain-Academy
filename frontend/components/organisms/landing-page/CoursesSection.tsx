import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { coursesData } from "@/utils/coursesData";



const CoursesSection = () => {
  return (
    <section className="px-4 pb-14 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <h2 className="text-white rounded-full rotate-[-15deg] my-4 bg-[#0066CC] px-6 py-2 w-fit">
            Courses
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coursesData.map((course, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl"
            >
              <Image
                src="/course.png"
                alt={course.imageAlt}
                className="w-full h-48 object-cover"
                width={300}
                height={200}
              />
              <div className="p-6">
                <h3 className="text- font-semibold mb-1">{course.title}</h3>
                <p className="text-sm text-gray-900 font-semibold  mb-2">
                  Duration: {course.duration}
                </p>
                <p className="text-gray-600 mb-4 text-xs">
                  {course.description}
                </p>
                <div className="flex items-center justify-center">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#00D4FF] hover:bg-cyan-300 text-gray-900"
                  >
                    Join Course
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
