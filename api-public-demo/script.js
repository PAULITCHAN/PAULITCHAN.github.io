const API_BASE = 'https://rickandmortyapi.com/api/character';
let currentPage = 1;
let lastPage = 1;
let currentQuery = '';
const cardsRow = document.getElementById('cardsRow');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const resultsInfo = document.getElementById('resultsInfo');
const clearBtn = document.getElementById('clearBtn');

async function fetchCharacters(page = 1, name = ''){
  const url = new URL(API_BASE);
  url.searchParams.set('page', page);
  if (name) url.searchParams.set('name', name);
  try{
    showLoading();
    const res = await fetch(url.toString());
    if (!res.ok) throw res;
    const data = await res.json();
    lastPage = data.info.pages || 1;
    renderCharacters(data.results || []);
    renderPagination(page, lastPage);
    resultsInfo.textContent = `Page ${page} of ${lastPage} — ${data.info.count} results`;
  }catch(err){
    if (err.status === 404){
      renderCharacters([]);
      renderPagination(1,1);
      resultsInfo.textContent = 'No results found.';
    }else{
      console.error(err);
      resultsInfo.textContent = 'Error fetching data.';
    }
  }finally{
    hideLoading();
  }
}

function renderCharacters(items){
  cardsRow.innerHTML = '';
  if (!items.length){
    cardsRow.innerHTML = `<div class="col-12"><div class="alert alert-warning">No characters found.</div></div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${item.image}" class="card-img-top" alt="${item.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${item.name}</h5>
          <p class="mb-1 text-muted small">${item.species} • ${item.status}</p>
          <p class="mb-2 small">Location: ${item.location.name}</p>
          <div class="mt-auto"><a href="#" class="btn btn-sm btn-primary" data-id="${item.id}">Details</a></div>
        </div>
      </div>
    `;
    fragment.appendChild(col);
  });
  cardsRow.appendChild(fragment);
}

function renderPagination(page, total){
  pagination.innerHTML = '';
  const prev = createPageItem('Previous', page > 1 ? page - 1 : null);
  pagination.appendChild(prev);
  const start = Math.max(1, page - 2);
  const end = Math.min(total, page + 2);
  for(let i=start;i<=end;i++){
    const p = createPageItem(i, i === page ? null : i, i === page);
    pagination.appendChild(p);
  }
  const next = createPageItem('Next', page < total ? page + 1 : null);
  pagination.appendChild(next);
}

function createPageItem(label, targetPage, active = false){
  const li = document.createElement('li');
  li.className = 'page-item' + (active ? ' active' : '') + (targetPage===null ? ' disabled' : '');
  const a = document.createElement('a');
  a.className = 'page-link';
  a.href = '#';
  a.textContent = label;
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    if (targetPage) {
      currentPage = targetPage;
      fetchCharacters(currentPage, currentQuery);
      window.scrollTo({top:0,behavior:'smooth'});
    }
  });
  li.appendChild(a);
  return li;
}

let searchTimer = null;
searchInput.addEventListener('input', ()=>{
  clearTimeout(searchTimer);
  searchTimer = setTimeout(()=>{
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchCharacters(currentPage, currentQuery);
  }, 400);
});

clearBtn.addEventListener('click', ()=>{
  searchInput.value = '';
  currentQuery = '';
  currentPage = 1;
  fetchCharacters(1,'');
});

function showLoading(){
  // simple placeholder while fetching
  cardsRow.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
}
function hideLoading(){ /* no-op for now */ }

// initial load
fetchCharacters(1,'');
