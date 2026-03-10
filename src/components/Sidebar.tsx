import { Link } from "react-router-dom";

export default function Sidebar() {

  return (

    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h1 className="text-2xl font-bold mb-8">
        Matrimony
      </h1>

      <nav className="flex flex-col space-y-4">

        <Link
          to="/dashboard/profile"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Profile
        </Link>

        <Link
          to="/dashboard/personal"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Personal Details
        </Link>

        <Link
          to="/dashboard/preference"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Partner Preference
        </Link>

        <Link
          to="/dashboard/photos"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Photos
        </Link>

      </nav>

    </div>

  );

}