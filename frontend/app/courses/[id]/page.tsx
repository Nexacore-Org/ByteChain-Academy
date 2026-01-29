export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Course Detail</h1>
        <p className="text-gray-400">Course ID: {params.id}</p>
        <p className="text-gray-400 mt-4">
          This is a placeholder for the course detail page. The course content will be implemented in a future issue.
        </p>
      </div>
    </div>
  )
}
