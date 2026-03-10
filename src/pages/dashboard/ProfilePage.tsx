import { useEffect, useState } from "react";
import { ProfileAPI } from "@/lib/api";

export default function ProfilePage() {

  const [profile,setProfile] = useState<any>({});
  const [imageFile,setImageFile] = useState<File | null>(null);
  const [editing,setEditing] = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadProfile = async()=>{
      try{
        const data = await ProfileAPI.get();
        setProfile(data.profile || {});
      }catch(err){
        console.error("Profile load error",err);
      }finally{
        setLoading(false);
      }
    }

    loadProfile();

  },[])

  /* PROFILE COMPLETION */

  const calculateCompletion = ()=>{

    const fields = Object.values(profile);

    const filled = fields.filter(
      (v)=>v !== null && v !== "" && v !== undefined
    ).length;

    const total = 30;

    return Math.round((filled / total) * 100);

  }

  const completion = calculateCompletion();

  const handleChange=(e:any)=>{
    const {name,value}=e.target;

    setProfile({
      ...profile,
      [name]:value
    })
  }

  const handleImage=(e:any)=>{
    setImageFile(e.target.files[0]);
  }

  const handleSave = async()=>{

    try{

      const formData = new FormData();

      Object.keys(profile).forEach(key=>{
        formData.append(key,profile[key] ?? "");
      })

      if(imageFile){
        formData.append("profile_image",imageFile);
      }

      await fetch("/backend/api/profile/update.php",{
        method:"POST",
        body:formData
      })

      setEditing(false);

      alert("Profile updated successfully")

    }catch(err){

      console.error(err);
      alert("Profile update failed")

    }

  }

  if(loading){
    return <div className="p-6">Loading profile...</div>
  }

  return(

  <div className="space-y-6">

    {/* PROFILE COMPLETION */}

    <div className="bg-white p-4 rounded shadow">

      <h3 className="font-semibold mb-2">
        Profile Completion
      </h3>

      <div className="w-full bg-gray-200 h-3 rounded">

        <div
        className="bg-green-500 h-3 rounded"
        style={{width:`${completion}%`}}
        />

      </div>

      <p className="text-sm mt-2">
        {completion}% completed
      </p>

    </div>

    {/* PROFILE CARD */}

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-2xl font-bold mb-6">
        My Profile
      </h2>

      {profile.profile_image && (
        <img
          src={profile.profile_image}
          className="w-32 h-32 object-cover rounded mb-4"
        />
      )}

      {editing && (
        <input
          type="file"
          onChange={handleImage}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input label="Name" name="full_name" value={profile.full_name} editing={editing} handleChange={handleChange}/>

        <Input label="Gender" name="gender" value={profile.gender} editing={editing} handleChange={handleChange} type="select" options={["male","female"]}/>

        <Input label="Date of Birth" name="date_of_birth" value={profile.date_of_birth} editing={editing} handleChange={handleChange} type="date"/>

        <Input label="Height (cm)" name="height_cm" value={profile.height_cm} editing={editing} handleChange={handleChange}/>

        <Input label="Weight (kg)" name="weight_kg" value={profile.weight_kg} editing={editing} handleChange={handleChange}/>

        <Input label="Religion" name="religion" value={profile.religion} editing={editing} handleChange={handleChange}/>

        <Input label="Caste" name="caste" value={profile.caste} editing={editing} handleChange={handleChange}/>

        <Input label="Mother Tongue" name="mother_tongue" value={profile.mother_tongue} editing={editing} handleChange={handleChange}/>

        <Input label="Marital Status" name="marital_status" value={profile.marital_status} editing={editing} handleChange={handleChange}/>

        <Input label="City" name="city" value={profile.city} editing={editing} handleChange={handleChange}/>

        <Input label="State" name="state" value={profile.state} editing={editing} handleChange={handleChange}/>

        <Input label="Country" name="country" value={profile.country} editing={editing} handleChange={handleChange}/>

        <Input label="Education" name="education" value={profile.education} editing={editing} handleChange={handleChange}/>

        <Input label="Profession" name="profession" value={profile.profession} editing={editing} handleChange={handleChange}/>

        <Input label="Company" name="company" value={profile.company} editing={editing} handleChange={handleChange}/>

        <Input label="Annual Income" name="annual_income" value={profile.annual_income} editing={editing} handleChange={handleChange}/>

        <Input label="Nakshatra" name="nakshatra" value={profile.nakshatra} editing={editing} handleChange={handleChange}/>

        <Input label="Rasi" name="rasi" value={profile.rasi} editing={editing} handleChange={handleChange}/>

        <Input label="Gotra" name="gotra" value={profile.gotra} editing={editing} handleChange={handleChange}/>

        <Input label="Father Name" name="father_name" value={profile.father_name} editing={editing} handleChange={handleChange}/>

        <Input label="Mother Name" name="mother_name" value={profile.mother_name} editing={editing} handleChange={handleChange}/>

        <Input label="Siblings" name="siblings" value={profile.siblings} editing={editing} handleChange={handleChange}/>

        <Input label="Family Type" name="family_type" value={profile.family_type} editing={editing} handleChange={handleChange}/>

        <Input label="Family Status" name="family_status" value={profile.family_status} editing={editing} handleChange={handleChange}/>

        <Input label="Family Income" name="family_income" value={profile.family_income} editing={editing} handleChange={handleChange}/>

        <Input label="Diet" name="diet" value={profile.diet} editing={editing} handleChange={handleChange} type="select" options={["veg","non_veg","eggetarian"]}/>

        <Input label="Smoking" name="smoking" value={profile.smoking} editing={editing} handleChange={handleChange} type="select" options={["no","occasionally","yes"]}/>

        <Input label="Drinking" name="drinking" value={profile.drinking} editing={editing} handleChange={handleChange} type="select" options={["no","occasionally","yes"]}/>

        <Input label="Manglik" name="manglik" value={profile.manglik} editing={editing} handleChange={handleChange} type="select" options={["yes","no","dont_know"]}/>

      </div>

      <div className="mt-4">
        <label className="block font-medium mb-1">
          About Me
        </label>

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
          onClick={()=>setEditing(true)}
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

  </div>

  )

}

function Input({label,name,value,editing,handleChange,type="text",options=[]}:any){

  return(

  <div>

    <label className="block font-medium mb-1">
      {label}
    </label>

    {type==="select" ? (

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

    ):(
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