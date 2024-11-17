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
export async function monthlyChargeList (){
  const listt = []
 await api.get('monthly_charge/list').then(res=>{

  res.data.monthly_charges.forEach(monthly=>{
    listt.push({label:monthly.title , value:monthly.id})
  })

 }).catch(error=>{
  if (error.response != null ) {
    alert(error.response.data.message)
  }
 })
 return listt
}
export const fundAccTypeList = [
  {
    label:'قرض الحسنه',
    value:0
  },
  {
    label:'عادی',
    value:1
  }
]
