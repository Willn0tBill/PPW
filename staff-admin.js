(()=>{
const SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co";
const SUPABASE_KEY="sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
let rows=[];
function panel(){
 const admin=document.getElementById("adminView");if(!admin||document.getElementById("staffAdminPanel"))return;
 const section=document.createElement("section");section.id="staffAdminPanel";section.className="editor-panel staff-admin-panel";
 section.innerHTML=`<div class="panel-heading"><div><p class="eyebrow">NEWSROOM</p><h2>Staff Section</h2></div><button id="saveStaffBtn" class="primary-btn" type="button">Save Staff</button></div><p class="staff-admin-help">Change the names and roles shown in the PPW Staff section on the main website. Turn a row off to hide it.</p><div id="staffAdminList" class="staff-admin-list"><div class="empty-state">Loading staff...</div></div><p id="staffAdminMessage" class="message"></p>`;
 admin.appendChild(section);load();
}
async function load(){
 const list=document.getElementById("staffAdminList");if(!list)return;
 const {data,error}=await db.from("staff_members").select("id,name,role,bio,sort_order,active").order("sort_order",{ascending:true});
 if(error){list.innerHTML=`<div class="empty-state">Could not load staff: ${esc(error.message)}</div>`;return}
 rows=data||[];
 if(!rows.length){rows=[1,2,3].map((n,i)=>({id:null,name:`Staff Member ${n}`,role:"Staff Member",bio:"",sort_order:i+1,active:true}))}
 list.innerHTML=rows.map((s,i)=>`<div class="staff-admin-row" data-index="${i}"><div class="staff-admin-number">${String(i+1).padStart(2,"0")}</div><label>Name<input data-field="name" maxlength="100" value="${esc(s.name)}" placeholder="Staff name"></label><label>Role<input data-field="role" maxlength="100" value="${esc(s.role)}" placeholder="Editor, Writer, Photographer..."></label><label class="staff-admin-bio">Bio<input data-field="bio" maxlength="240" value="${esc(s.bio)}" placeholder="Optional short bio"></label><label class="staff-admin-active"><input data-field="active" type="checkbox" ${s.active?"checked":""}> Show</label></div>`).join("");
}
async function save(){
 const list=document.getElementById("staffAdminList"),msg=document.getElementById("staffAdminMessage");if(!list)return;
 msg.textContent="Saving staff...";msg.className="message";
 const items=[...list.querySelectorAll(".staff-admin-row")].map((row,i)=>{const val=f=>row.querySelector(`[data-field="${f}"]`);return{id:rows[i]?.id||null,name:val("name").value.trim()||`Staff Member ${i+1}`,role:val("role").value.trim()||"Staff Member",bio:val("bio").value.trim(),sort_order:i+1,active:val("active").checked,updated_at:new Date().toISOString()}});
 try{
  for(const item of items){if(item.id){const {error}=await db.from("staff_members").update({name:item.name,role:item.role,bio:item.bio,sort_order:item.sort_order,active:item.active,updated_at:item.updated_at}).eq("id",item.id);if(error)throw error}else{const {error}=await db.from("staff_members").insert({name:item.name,role:item.role,bio:item.bio,sort_order:item.sort_order,active:item.active});if(error)throw error}}
  msg.textContent="Staff section saved.";msg.className="message success";await load();
 }catch(err){msg.textContent=err.message||"Could not save staff.";msg.className="message error"}
}
document.addEventListener("click",e=>{if(e.target.id==="saveStaffBtn")save()});
function boot(){panel();const obs=new MutationObserver(()=>panel());const admin=document.getElementById("adminView");if(admin)obs.observe(admin,{attributes:true,attributeFilter:["class"]})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
