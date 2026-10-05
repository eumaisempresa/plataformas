(async()=>{
  let [sc,car,comps]=await Promise.all([Data.list('scenarios'),Data.list('career'),Data.list('competencies')]);
  const selectedIds=x=>UI.jsonArray(x.competency_ids_json);
  const compMap=Object.fromEntries(comps.map(c=>[c.competency_id,c]));
  function render(){
    page.innerHTML=`<div class="grid">
      <section class="card span6"><div class="section-title"><div><h2>Cenários</h2><div class="muted">Possíveis destinos profissionais e suas capacidades críticas.</div></div><button class="btn primary" id="newSc">+ cenário</button></div>
        <div class="list">${sc.map(x=>`<div class="item"><div class="section-title"><div><b>${UI.esc(x.name)}</b><div class="muted">${UI.esc(x.horizon)} · ${UI.esc(x.target_year)} · peso ${UI.esc(x.weight)}</div></div><button class="btn" data-edit-sc="${x.scenario_id}">Editar</button></div><p>${UI.esc(x.description)}</p><div>${UI.badges(selectedIds(x),compMap)}</div></div>`).join('')||'<div class="empty">Crie seu primeiro cenário.</div>'}</div>
      </section>
      <section class="card span6"><div class="section-title"><div><h2>Trajetória</h2><div class="muted">Marcos reais e projetados da sua carreira.</div></div><button class="btn primary" id="newEv">+ marco</button></div>
        <div class="timeline list">${car.map(x=>`<div class="item"><div class="section-title"><div><b>${UI.esc(x.year)} · ${UI.esc(x.label)}</b><div class="muted">${UI.esc(x.type)} · nível ${UI.esc(x.level)}</div></div><button class="btn" data-edit-ev="${x.event_id}">Editar</button></div><p>${UI.esc(x.note)}</p></div>`).join('')||'<div class="empty">Adicione marcos da sua trajetória.</div>'}</div>
      </section>
    </div>
    <div class="modal" id="modal"><div class="card" id="modalCard"></div></div>`;
    newSc.onclick=()=>editSc({}); newEv.onclick=()=>editEv({});
    page.querySelectorAll('[data-edit-sc]').forEach(b=>b.onclick=()=>editSc(sc.find(x=>x.scenario_id===b.dataset.editSc)));
    page.querySelectorAll('[data-edit-ev]').forEach(b=>b.onclick=()=>editEv(car.find(x=>x.event_id===b.dataset.editEv)));
  }
  function compOptions(ids){return comps.map(c=>`<label style="display:flex;gap:8px;align-items:center;padding:8px;border:1px solid var(--line);border-radius:10px;background:#fafcfd"><input type="checkbox" name="competencies" value="${c.competency_id}" ${ids.includes(c.competency_id)?'checked':''}><span><b>${UI.esc(c.name)}</b><small class="muted" style="display:block">Atual ${UI.esc(c.current_level)} → alvo ${UI.esc(c.target_level)}</small></span></label>`).join('')||'<div class="empty">Cadastre competências primeiro.</div>'}
  async function editSc(x){
    modal.classList.add('open'); const ids=selectedIds(x);
    modalCard.innerHTML=`<h2>${x.scenario_id?'Editar':'Novo'} cenário</h2><form id="f" class="form two"><div class="field"><label>Nome</label><input name="name" value="${UI.esc(x.name)}" required></div><div class="field"><label>Horizonte</label><input name="horizon" value="${UI.esc(x.horizon)}"></div><div class="field"><label>Ano alvo</label><input name="target_year" value="${UI.esc(x.target_year)}"></div><div class="field"><label>Peso</label><input name="weight" type="number" min="0" max="10" value="${UI.esc(x.weight||1)}"></div><div class="field"><label>Status</label><select name="status"><option ${x.status==='ATIVO'||!x.status?'selected':''}>ATIVO</option><option ${x.status==='PAUSADO'?'selected':''}>PAUSADO</option><option ${x.status==='DESCARTADO'?'selected':''}>DESCARTADO</option></select></div><div class="field" style="grid-column:1/-1"><label>Descrição</label><textarea name="description">${UI.esc(x.description)}</textarea></div><div style="grid-column:1/-1"><label style="display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:7px">Competências necessárias</label><div class="form two">${compOptions(ids)}</div></div><div class="row" style="grid-column:1/-1"><button class="btn primary">Salvar</button><button type="button" class="btn" id="cancel">Cancelar</button></div></form>`;
    cancel.onclick=()=>modal.classList.remove('open');
    f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);const data=Object.fromEntries(fd);data.competency_ids_json=[...f.querySelectorAll('input[name="competencies"]:checked')].map(i=>i.value);await Data.save('scenarios',data,x.scenario_id);sc=await Data.list('scenarios');modal.classList.remove('open');render()}
  }
  async function editEv(x){
    modal.classList.add('open');
    modalCard.innerHTML=`<h2>${x.event_id?'Editar':'Novo'} marco da trajetória</h2><form id="f" class="form"><div class="form two"><div class="field"><label>Ano</label><input name="year" value="${UI.esc(x.year)}" required></div><div class="field"><label>Nível</label><input name="level" type="number" value="${UI.esc(x.level)}"></div></div><div class="field"><label>Título</label><input name="label" value="${UI.esc(x.label)}" required></div><div class="field"><label>Tipo</label><select name="type"><option ${x.type==='REAL'||!x.type?'selected':''}>REAL</option><option ${x.type==='PROJETADO'?'selected':''}>PROJETADO</option></select></div><div class="field"><label>Nota</label><textarea name="note">${UI.esc(x.note)}</textarea></div><div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" id="cancel">Cancelar</button></div></form>`;
    cancel.onclick=()=>modal.classList.remove('open');
    f.onsubmit=async e=>{e.preventDefault();await Data.save('career',Object.fromEntries(new FormData(f)),x.event_id);car=await Data.list('career');modal.classList.remove('open');render()}
  }
  render()
})().catch(e=>page.innerHTML=`<div class="message err">${UI.esc(e.message)}</div>`);
