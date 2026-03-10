import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h1 className="text-xl font-bold mb-8">
        Matrimony
      </h1>

      <nav className="space-y-4">

        <Link to="/dashboard/profile">
          Profile
        </Link>

        <Link to="/dashboard/personal">
          Personal Details
        </Link>

        <Link to="/dashboard/preference">
          Partner Preference
        </Link>

        <Link to="/dashboard/photos">
          Photos
        </Link>

      </nav>

    </div>
  );
}