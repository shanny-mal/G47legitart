import React from "react";
import IssueGallery from "../components/IssueGallery";

const Issues: React.FC = () => {
  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-serif">All Issues</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Browse the archive and download issue PDFs.
        </p>
      </div>
      <IssueGallery />
    </div>
  );
};

export default Issues;
