import { api } from "src/boot/axios";

export async function membersList (){
  const listt = []
 await api.get('member/list').then(res=>{

  res.data.members.forEach(member=>{
    listt.push({label:member.full_name , value:member.id})
  })

 }).catch(error=>{
  if (error.response != null ) {
    alert(error.response.data.message)
  }
 })
 return listt
}
