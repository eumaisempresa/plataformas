(async()=>{
  try{
    /* Reforça o tema claro nesta página mesmo se o navegador estiver servindo CSS antigo em cache. */
    document.documentElement.style.setProperty('background','#f2f5f8','important');
    document.body.style.setProperty('background','linear-gradient(180deg,#f8fafc 0%,#eef3f7 100%)','important');
    document.body.style.setProperty('color','#142235','important');

    const d=await Data.dashboard();
    const tasks=d.tasks||[];
    const projects=d.projects||[];
    const prior=d.priorities||[];
    const comps=d.competencies||[];
    const sc=d.scenarios||[];

    const open=tasks.filter(x=>!['CONCLUÍDO','CONCLUIDO','DONE'].includes(String(x.status).toUpperCase()));
    const activeProjects=projects.filter(x=>!['CONCLUÍDO','CONCLUIDO','DONE'].includes(String(x.status).toUpperCase())).length;
    const done=tasks.filter(x=>['CONCLUÍDO','CONCLUIDO','DONE'].includes(String(x.status).toUpperCase())).length;
    const completion=tasks.length?Math.round(done/tasks.length*100):0;
    const avg=comps.length?Math.round(comps.reduce((a,c)=>a+Number(c.current_level||0),0)/comps.length):0;
    const topComps=[...comps].sort((a,b)=>Number(b.current_level||0)-Number(a.current_level||0)).slice(0,6);

    page.innerHTML=`
      <div class="hero">
        <div class="muted">PAINEL EXECUTIVO</div>
        <h2>O que merece sua atenção hoje?</h2>
        <p class="muted">Uma visão objetiva da direção, execução e evolução da sua carreira.</p>
      </div>

      <div class="grid" style="margin-top:18px">
        <div class="card span3">
          <div class="kpi-label">Projetos ativos</div>
          <div class="metric">${activeProjects}</div>
          <div class="kpi-foot">${projects.length} cadastrados</div>
        </div>

        <div class="card span3">
          <div class="kpi-label">Ações abertas</div>
          <div class="metric">${open.length}</div>
          <div class="kpi-foot">${done} concluídas</div>
        </div>

        <div class="card span3">
          <div class="kpi-label">Nível médio</div>
          <div class="metric">${avg}</div>
          <div class="kpi-foot">competências atuais</div>
        </div>

        <div class="card span3">
          <div class="kpi-label">Execução</div>
          <div class="metric">${completion}%</div>
          <div class="progress" style="margin-top:9px"><i style="width:${completion}%"></i></div>
        </div>

        <div class="card span8">
          <div class="section-title">
            <div>
              <h2>Mapa de competências</h2>
              <div class="muted">Nível atual das principais competências.</div>
            </div>
            <a class="link" href="${EU_CONFIG.BASE_PATH}/competencias/">Ver todas</a>
          </div>

          <div class="bar-chart">
            ${
              topComps.map(c=>`
                <div class="bar-row">
                  <b>${UI.esc(c.name)}</b>
                  <div class="bar-track">
                    <i style="width:${Math.min(100,Number(c.current_level||0)*10)}%"></i>
                  </div>
                  <span>${UI.esc(c.current_level||0)}/10</span>
                </div>
              `).join('')
              || '<div class="empty">Ainda não há competências cadastradas.</div>'
            }
          </div>
        </div>

        <div class="card span4" style="display:flex;align-items:center;gap:18px">
          <div class="donut" style="--value:${completion}" data-label="${completion}%"></div>
          <div>
            <h3>Execução</h3>
            <p class="muted">Progresso das ações cadastradas no sistema.</p>
          </div>
        </div>

        <div class="card span6">
          <div class="section-title">
            <div>
              <h2>Prioridades</h2>
              <div class="muted">O que está demandando decisão.</div>
            </div>
            <a class="link" href="${EU_CONFIG.BASE_PATH}/prioridades/">Abrir matriz</a>
          </div>
          ${
            prior.filter(x=>String(x.done)!=='true').slice(0,5).map(x=>`
              <div class="item">
                <b>${UI.esc(x.title)}</b>
                <div class="muted">${UI.esc(x.impact||'Impacto não definido')} · ${UI.esc(x.effort||'Esforço não definido')}</div>
              </div>
            `).join('')
            || '<div class="empty">Nenhuma prioridade aberta.</div>'
          }
        </div>

        <div class="card span6">
          <div class="section-title">
            <div>
              <h2>Próximas ações</h2>
              <div class="muted">A execução mais próxima.</div>
            </div>
            <a class="link" href="${EU_CONFIG.BASE_PATH}/kanban/">Abrir Kanban</a>
          </div>
          ${
            open.slice(0,5).map(x=>`
              <div class="item">
                <b>${UI.esc(x.title)}</b>
                <div class="muted">${UI.esc(x.status)} · ${UI.esc(x.due_date||'sem prazo')}</div>
              </div>
            `).join('')
            || '<div class="empty">Nenhuma ação aberta.</div>'
          }
        </div>

        <div class="card span12">
          <div class="section-title">
            <div>
              <h2>Cenários de carreira</h2>
              <div class="muted">Destinos possíveis e seu peso estratégico.</div>
            </div>
            <a class="link" href="${EU_CONFIG.BASE_PATH}/direcao/">Gerenciar direção</a>
          </div>

          <div class="grid">
            ${
              sc.slice(0,4).map(x=>`
                <div class="item span3">
                  <b>${UI.esc(x.name)}</b>
                  <div class="muted">${UI.esc(x.horizon)} · alvo ${UI.esc(x.target_year)}</div>
                  <div class="progress" style="margin-top:10px">
                    <i style="width:${Math.min(100,Number(x.weight||0)*10)}%"></i>
                  </div>
                </div>
              `).join('')
              || '<div class="empty span12">Cadastre seus cenários de carreira.</div>'
            }
          </div>
        </div>
      </div>
    `;
  }catch(e){
    page.innerHTML=`<div class="message err">${UI.esc(e.message)}</div>`;
  }
})();
