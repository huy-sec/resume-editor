import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const resumes = await prisma.tailoredResume.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your tailored resumes</p>
        </div>
        <Link
          href="/tailor"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Tailor New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📄</div>
          <p className="text-lg font-medium text-gray-500">No tailored resumes yet</p>
          <p className="text-sm mt-1 mb-4">Build your profile and tailor your first resume</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/profile"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Set up profile
            </Link>
            <Link
              href="/tailor"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Tailor a resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {resumes.map((r) => (
            <Link
              key={r.id}
              href={`/tailor/${r.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {r.jobTitle || "Untitled Role"}
                  </h3>
                  <p className="text-gray-500 text-sm">{r.company || "Unknown Company"}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      r.humanizationScore >= 80
                        ? "text-green-600"
                        : r.humanizationScore >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.humanizationScore}%
                  </div>
                  <div className="text-xs text-gray-400">Human score</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
