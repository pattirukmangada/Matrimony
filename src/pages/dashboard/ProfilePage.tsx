import { useEffect, useState } from "react";
import { ProfileAPI } from "@/lib/api";

export default function ProfilePage() {

  const [profile, setProfile] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadProfile = async () => {
      try {
        const data = await ProfileAPI.get();
        setProfile(data.profile || {});
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

  }, []);

  const handleChange = (e: any) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {

    try {

      await ProfileAPI.update(profile);

      setEditing(false);

      alert("Profile updated successfully");

    } catch (err) {
      console.error("Update failed", err);
      alert("Profile update failed");
    }

  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (

    <div className="bg-white p-6 rounded shadow max-w-xl">

      <h2 className="text-xl font-bold mb-5">
        My Profile
      </h2>

      {profile.profile_image && (
        <img
          src={profile.profile_image}
          className="w-32 mb-4 rounded"
        />
      )}

      {/* NAME */}
      <div className="mb-3">
        <label>Name</label>
        <input
          type="text"
          name="full_name"
          value={profile.full_name || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full"
        />
      </div>

      {/* GENDER */}
      <div className="mb-3">
        <label>Gender</label>
        <select
          name="gender"
          value={profile.gender || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full"
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* DOB */}
      <div className="mb-3">
        <label>Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          value={profile.date_of_birth || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full"
        />
      </div>

      {/* EDUCATION */}
      <div className="mb-3">
        <label>Education</label>
        <input
          type="text"
          name="education"
          value={profile.education || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full"
        />
      </div>

      {/* PROFESSION */}
      <div className="mb-3">
        <label>Profession</label>
        <input
          type="text"
          name="profession"
          value={profile.profession || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full"
        />
      </div>

      {/* CITY */}
      <div className="mb-3">
        <label>City</label>
        <input
          type="text"
          name="city"
          value={profile.city || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full"
        />
      </div>

      {/* BUTTONS */}

      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 mt-3 rounded"
        >
          Edit Profile
        </button>
      )}

      {editing && (
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 mt-3 rounded"
        >
          Save
        </button>
      )}

    </div>

  );

}