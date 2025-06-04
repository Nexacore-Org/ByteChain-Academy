import { cn } from "@/lib/utils";

const Title = ({ className, ...props }: React.ComponentProps<"h2">) => {
  return (
    <h2
      data-slot="h2"
      className={cn(
        "text-white text-xl rounded-full my-4 bg-[#0066CC] px-6 py-2 w-fit",
        className,
      )}
      {...props}
    />
  );
};

export default Title;
