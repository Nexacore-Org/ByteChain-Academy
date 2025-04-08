import { Skeleton } from "./skeleton";

const LandingPageSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 md:gap-8 items-center w-full">
            {/* Hero Section */}
            <div className="w-full flex items-center justify-between max-w-5xl mx-auto">

                <div className="flex flex-col gap-1 w-full my-4 max-w-[420px]">
                    <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-[75%] h-[15px] rounded-full" />
                    <div className="flex items-center justify-between w-full mt-4 gap-[10px]">
                        <Skeleton className="bg-[#94A3B8] w-[186px] h-[56px] rounded-[20px]" />
                        <Skeleton className="bg-[#94A3B8] w-[186px] h-[56px] rounded-[20px]" />
                    </div>
                </div>
                <Skeleton className="bg-[#94A3B8] min-w-[429px] h-[538px] rounded-tl-[200px] my-4" />
            </div>
            <div className="w-full md:max-w-5xl mx-auto">
                {/* About us */}
                <div className="text-left text-xl mb-16 flex flex-col items-center justify-center w-full">
                    <Skeleton className="bg-[#94A3B8] w-[148px] h-[60px] rotate-[-15deg] rounded-full my-4" />

                    <div className="flex flex-col gap-1 w-full my-4">
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-[75%] h-[15px] rounded-full" />
                    </div>

                    <div className="flex flex-col gap-1 w-full my-4">
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-[50%] h-[15px] rounded-full" />
                    </div>

                    <Skeleton className="bg-[#94A3B8] w-[155px] h-[56px] rounded-[20px] self-end md:mr-20" />
                </div>
                {/* What we offer */}
                <div className="text-left text-xl mb-16 flex flex-col items-center justify-center">

                    <Skeleton className="bg-[#94A3B8] w-[178px] h-[60px] rotate-[15deg] rounded-full my-4" />

                    <div className="flex flex-col gap-1 w-full my-4">
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-[50%] h-[15px] rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 w-full mt-4 mb-2">
                        <Skeleton className="bg-[#94A3B8] w-[250px] h-[15px] rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-[50%] h-[15px] rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 w-full mt-4 mb-2">
                        <Skeleton className="bg-[#94A3B8] w-[250px] h-[15px] rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-full h-[15px] rounded-full" />
                        <Skeleton className="bg-[#94A3B8] w-[50%] h-[15px] rounded-full" />
                    </div>
                </div>
            </div>
            {/* Courses Section */}
            <div className="w-full max-w-7xl mx-auto">
                <div className='flex justify-center mb-6'>
                    <Skeleton className="bg-[#94A3B8] w-[120px] h-[40px] rotate-[-15deg] rounded-full my-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4).fill(null).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white border rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl"
                        >
                            <Skeleton className="bg-[#94A3B8] w-full h-48 object-cover rounded-none" />
                            <div className="p-6 flex flex-col gap-3">
                                <Skeleton className="bg-[#94A3B8] w-full h-[20px]" />
                                <Skeleton className="bg-[#94A3B8] w-full h-[10px]" />
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]" />
                                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]" />
                                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]" />
                                </div>
                                <div className="flex items-center justify-center">
                                    <Skeleton className="bg-[#94A3B8] w-[100px] h-[30px]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Currency Hub */}
            <div className="flex flex-col justify-center items-center px-4 w-full">
                <div className='flex justify-center '>
                    <Skeleton className="bg-[#94A3B8] w-[120px] h-[40px] rotate-[15deg] rounded-full my-4" />
                </div>
                <div className="w-full max-w-5xl mx-auto my-8 overflow-x-auto flex flex-col gap-3">
                    <div className="w-full min-w-[700px]">
                        {Array(4).fill(null).map((_, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-[0.5fr_0.5fr_2fr_1.5fr_1fr_1fr_1fr_2fr_2fr] gap-4 p-3 text-gray-800 border-b-2 items-center"
                            >
                                <Skeleton className='size-[20px] bg-[#94A3B8] ' />

                                <Skeleton className='size-[20px] bg-[#94A3B8] ' />

                                <div className='flex gap-2'>
                                    <Skeleton className='w-[50px] h-[20px] bg-[#94A3B8] ' />{' '}
                                    <Skeleton className='w-[25px] h-[20px] bg-[#94A3B8] ' />
                                </div>


                                <div>
                                    <Skeleton className='w-full h-[20px] bg-[#94A3B8] ' />
                                </div>
                                <div>
                                    <Skeleton className='w-full h-[20px] bg-[#94A3B8] ' />
                                </div>
                                <div>
                                    <Skeleton className='w-full h-[20px] bg-[#94A3B8] ' />
                                </div>
                                <div>
                                    <Skeleton className='w-full h-[20px] bg-[#94A3B8] ' />
                                </div>
                                <div>
                                    <Skeleton className='w-full h-[20px] bg-[#94A3B8] ' />
                                </div>
                                <div>
                                    <Skeleton className='w-full h-[20px] bg-[#94A3B8] ' />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Skeleton className="bg-[#94A3B8] w-[186px] h-[56px] rounded-[20px] self-end md:mr-20" />
                </div>

            </div>

            {/* Who its for */}
            <div className="bg-[#98E5FE] flex flex-col justify-center items-center space-y-7 p-5 rounded-lg shadow-lg w-full md:max-w-5xl">
                <div className='flex justify-center mb-6'>
                    <Skeleton className="bg-[#94A3B8] w-[120px] h-[40px] rotate-[-15deg] rounded-full my-4" />
                </div>
                <div className='flex flex-col gap-1 mb-6 w-full'>
                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]  rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]  rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]  rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]  rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]  rounded-full" />
                    <Skeleton className="bg-[#94A3B8] w-full h-[10px]  rounded-full" />
                </div>
            </div>
        </div>
    );
}

export default LandingPageSkeleton;