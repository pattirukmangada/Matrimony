import { useEffect,useState } from "react";
import { ProfileAPI } from "@/lib/api";

export default function FamilyDetailsPage(){

const [data,setData]=useState<any>({});
const [edit,setEdit]=useState(false);

useEffect(()=>{
 ProfileAPI.get().then(r=>setData(r.profile||{}))
},[])

const change=(e:any)=>{
 setData({...data,[e.target.name]:e.target.value})
}

const save=async()=>{
 await ProfileAPI.update(data)
 setEdit(false)
}

return(

<div className="bg-white p-6 rounded shadow max-w-xl">

<h2 className="text-xl font-bold mb-4">
Family Details
</h2>

<input name="father_name"
value={data.father_name||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full mb-2"
placeholder="Father Name"
/>

<input name="mother_name"
value={data.mother_name||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full mb-2"
placeholder="Mother Name"
/>

<input name="siblings"
value={data.siblings||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full mb-2"
placeholder="Siblings"
/>

<select name="family_type"
value={data.family_type||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full">

<option value="">Family Type</option>
<option value="joint">Joint</option>
<option value="nuclear">Nuclear</option>

</select>

{!edit && <button onClick={()=>setEdit(true)}
className="bg-blue-600 text-white px-4 py-2 mt-3 rounded">Edit</button>}

{edit && <button onClick={save}
className="bg-green-600 text-white px-4 py-2 mt-3 rounded">Save</button>}

</div>
)
}