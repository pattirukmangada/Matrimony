import { useEffect,useState } from "react";
import { ProfileAPI } from "@/lib/api";

export default function HoroscopePage(){

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
Horoscope Details
</h2>

<input name="nakshatra"
value={data.nakshatra||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full mb-2"
placeholder="Nakshatra"
/>

<input name="rasi"
value={data.rasi||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full mb-2"
placeholder="Rasi"
/>

<input name="gotra"
value={data.gotra||""}
onChange={change}
disabled={!edit}
className="border p-2 w-full mb-2"
placeholder="Gotra"
/>

{!edit && <button onClick={()=>setEdit(true)}
className="bg-blue-600 text-white px-4 py-2 mt-3 rounded">Edit</button>}

{edit && <button onClick={save}
className="bg-green-600 text-white px-4 py-2 mt-3 rounded">Save</button>}

</div>
)
}