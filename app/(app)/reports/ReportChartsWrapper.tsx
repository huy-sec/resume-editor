"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type ReportCharts from "./ReportCharts";

const ReportChartsClient = dynamic(() => import("./ReportCharts"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Loading charts...
    </div>
  ),
});

export default function ReportChartsWrapper(props: ComponentProps<typeof ReportCharts>) {
  return <ReportChartsClient {...props} />;
}
