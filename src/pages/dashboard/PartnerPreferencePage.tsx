import { useEffect, useState } from "react";
import { request } from "@/lib/api";

export default function PartnerPreferencePage(){

 const [pref,setPref]=useState<any>({});
 const [edit,setEdit]=useState(false);

 useEffect(()=>{
   request("/profile/preferences.php")
   .then(d=>setPref(d.preferences||{}))
 },[])

 const handleChange=(e:any)=>{
   setPref({...pref,[e.target.name]:e.target.value})
 }

 const save=async()=>{
   await request("/profile/preferences.php",{
     method:"POST",
     body:JSON.stringify(pref)
   })
   setEdit(false)
 }

 return(

 <div className="bg-white p-6 rounded shadow max-w-xl">

 <h2 className="text-xl font-bold mb-4">
 Partner Preferences
 </h2>

 <input name="preferred_age_min"
 value={pref.preferred_age_min||""}
 onChange={handleChange}
 disabled={!edit}
 className="border p-2 w-full mb-2"
 placeholder="Min Age"
/>

<input name="preferred_age_max"
 value={pref.preferred_age_max||""}
 onChange={handleChange}
 disabled={!edit}
 className="border p-2 w-full mb-2"
 placeholder="Max Age"
/>

<input name="preferred_religion"
 value={pref.preferred_religion||""}
 onChange={handleChange}
 disabled={!edit}
 className="border p-2 w-full mb-2"
 placeholder="Religion"
/>

<input name="preferred_education"
 value={pref.preferred_education||""}
 onChange={handleChange}
 disabled={!edit}
 className="border p-2 w-full mb-2"
 placeholder="Education"
/>

{!edit && (
<button onClick={()=>setEdit(true)}
className="bg-blue-600 text-white px-4 py-2 mt-3 rounded">
Edit
</button>
)}

{edit && (
<button onClick={save}
className="bg-green-600 text-white px-4 py-2 mt-3 rounded">
Save
</button>
)}

 </div>
 )
}