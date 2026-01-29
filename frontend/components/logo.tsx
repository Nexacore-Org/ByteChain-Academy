import { LayersIcon } from "lucide-react";
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-[#002328] border border-[#015A48] flex items-center justify-center">
          <LayersIcon className="text-[#00D88B]" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-white font-semibold text-lg">Bytechain Academy</span>
        <span className="text-gray-400 text-xs">Web3 Education Platform</span>
      </div>
    </div>
  )
}
