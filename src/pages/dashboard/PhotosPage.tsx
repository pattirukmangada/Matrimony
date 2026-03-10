import { useState } from "react";

export default function PhotosPage() {

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    console.log("Uploading:", file);
  };

  return (
    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-bold mb-5">
        My Photos
      </h2>

      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 mt-3 rounded"
      >
        Upload
      </button>

    </div>
  );
}