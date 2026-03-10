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

    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: value
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

    <div className="bg-white p-6 rounded shadow w-full">

      <h2 className="text-2xl font-bold mb-6">
        My Profile
      </h2>

      {profile.profile_image && (
        <img
          src={profile.profile_image}
          className="w-32 h-32 object-cover rounded mb-6"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input label="Gender" name="gender" value={profile.gender} editing={editing} handleChange={handleChange} type="select" options={["male","female"]} />

        <Input label="Date of Birth" name="date_of_birth" value={profile.date_of_birth} editing={editing} handleChange={handleChange} type="date" />

        <Input label="Height (cm)" name="height_cm" value={profile.height_cm} editing={editing} handleChange={handleChange} />

        <Input label="Religion" name="religion" value={profile.religion} editing={editing} handleChange={handleChange} />

        <Input label="Caste" name="caste" value={profile.caste} editing={editing} handleChange={handleChange} />

        <Input label="Mother Tongue" name="mother_tongue" value={profile.mother_tongue} editing={editing} handleChange={handleChange} />

        <Input label="Marital Status" name="marital_status" value={profile.marital_status} editing={editing} handleChange={handleChange} />

        <Input label="City" name="city" value={profile.city} editing={editing} handleChange={handleChange} />

        <Input label="State" name="state" value={profile.state} editing={editing} handleChange={handleChange} />

        <Input label="Country" name="country" value={profile.country} editing={editing} handleChange={handleChange} />

        <Input label="Education" name="education" value={profile.education} editing={editing} handleChange={handleChange} />

        <Input label="Profession" name="profession" value={profile.profession} editing={editing} handleChange={handleChange} />

        <Input label="Company" name="company" value={profile.company} editing={editing} handleChange={handleChange} />

        <Input label="Annual Income" name="annual_income" value={profile.annual_income} editing={editing} handleChange={handleChange} />

        <Input label="Nakshatra" name="nakshatra" value={profile.nakshatra} editing={editing} handleChange={handleChange} />

        <Input label="Rasi" name="rasi" value={profile.rasi} editing={editing} handleChange={handleChange} />

        <Input label="Gotra" name="gotra" value={profile.gotra} editing={editing} handleChange={handleChange} />

        <Input label="Father Name" name="father_name" value={profile.father_name} editing={editing} handleChange={handleChange} />

        <Input label="Mother Name" name="mother_name" value={profile.mother_name} editing={editing} handleChange={handleChange} />

        <Input label="Siblings" name="siblings" value={profile.siblings} editing={editing} handleChange={handleChange} />

        <Input label="Family Type" name="family_type" value={profile.family_type} editing={editing} handleChange={handleChange} />

      </div>

      {/* About Me */}
      <div className="mt-4">
        <label className="block font-medium mb-1">About Me</label>
        <textarea
          name="about_me"
          value={profile.about_me || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full rounded"
          rows={4}
        />
      </div>

      <div className="mt-6">

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            Edit Profile
          </button>
        )}

        {editing && (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            Save
          </button>
        )}

      </div>

    </div>

  );

}

/* Reusable Input Component */

function Input({ label, name, value, editing, handleChange, type="text", options=[] }: any){

  return (

    <div>

      <label className="block font-medium mb-1">{label}</label>

      {type === "select" ? (

        <select
          name={name}
          value={value || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full rounded"
        >
          <option value="">Select</option>
          {options.map((o:any)=>
            <option key={o} value={o}>{o}</option>
          )}
        </select>

      ) : (

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 w-full rounded"
        />

      )}

    </div>

  )

}