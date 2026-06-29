import { Circle } from "lucide-react";

export function OnlineStatus({ isOnline }: { isOnline: boolean }) {
    return (
        <div className="flex items-center gap-1 text-xs">
            <Circle
                className={`w-2 h-2 ${isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                    }`}
            />
            <span className={isOnline ? "text-green-600" : "text-gray-500"}>
                {isOnline ? "Online" : "Offline"}
            </span>
        </div>
    );
}
