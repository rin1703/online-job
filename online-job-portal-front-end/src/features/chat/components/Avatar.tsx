export function Avatar({ name, role }: { name: string; role: "job_seeker" | "recruiter" | string }) {
    const initial = name.charAt(0).toUpperCase();
    const bgColor = role === "recruiter" ? "bg-purple-500" : "bg-green-500";

    return (
        <div
            className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold shadow-md`}
        >
            {initial}
        </div>
    );
}
