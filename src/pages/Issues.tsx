import React from "react";
import IssueGallery from "../components/IssueGallery";

const Issues: React.FC = () => {
  return (
    <div className="py-12 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#041018] dark:via-[#041421] dark:to-[#02161c]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-100">All Issues</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Browse the archive, preview covers and download issue PDFs.
          </p>
        </div>
      </div>

      <IssueGallery />
    </div>
  );
};

export default Issues;
