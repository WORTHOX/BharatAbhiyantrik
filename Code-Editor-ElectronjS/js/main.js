const library_div = document.querySelector('#library');
const columns = document.querySelector('#columns');
const tbody = document.querySelector('.tbody');
const ctx = document.getElementById('myChart');

const explorerContainer = document.querySelector(".explorerContainer");
const openExploreContainer = document.querySelector(".open-explorer");
const graphContainer = document.querySelector('.graphContainer .graph');
const metadata = document.querySelector('.graphContainer .metadata');

const BASE_URL = "https://bharat-abhiyantrik.vercel.app";

let LIBRARIES = [];
let TABLES = [];

const getLibrary = async () => {
    let res = await fetch(`${BASE_URL}/library`);
    let data = await res.json();
    LIBRARIES = data;
    return data;
}

const getTable = async (id) => {
    let res = await fetch(`${BASE_URL}/table/${id}`);
    TABLES = await res.json();
    let table_lst = "";
    TABLES.forEach((table,idx) => {
        table_lst += `<li class="list-group-item table_li" data-id="${idx}">${table.name}</li>`;
    });
    return table_lst;
}

const createAccordion = (id,name) => {
    let accordion_div = document.createElement('div');
    accordion_div.classList.add("accordion-item");
    
    let h2 = document.createElement('h2');
    h2.classList.add('accordion-header');
    accordion_div.appendChild(h2);

    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('accordion-button','collapsed');
    button.setAttribute('data-bs-toggle','collapse');
    button.setAttribute('data-bs-target',`#${id}`);
    button.setAttribute('aria-expanded',`true`);
    button.innerHTML = name;

    h2.appendChild(button);

    let accordion_content = document.createElement('div');
    accordion_content.classList.add('accordion-collapse','collapse');
    accordion_content.setAttribute('id', id );

    let accordion_body = document.createElement('div');
    accordion_body.classList.add('accordion-body');

    let ul = document.createElement('ul');
    ul.classList.add('list-group');

    TABLES.forEach((table,idx) => {
        let li = document.createElement('li');
        li.classList.add('list-group-item','table_li');
        li.setAttribute('data-id',table._id);
        li.innerHTML = table.name;

        li.addEventListener('dblclick',async(e)=>{
            columns.innerHTML = "";
            tbody.innerHTML = "";
            graphContainer.innerHTML = "";
            metadata.innerHTML = `<table class="table"></table>`;
            let id = e.target.getAttribute('data-id');
            let table;
            try {
                let res = await fetch(`${BASE_URL}/table/content/${id}`);
                table = await res.json();
                table[0].column_names.forEach((element) => {
                    columns.innerHTML += `<th>${element}</th>`;
                });
            } catch (error) {
                console.log(error);
            }
            

            try {

                let res = await fetch(`${BASE_URL}/row/table/${id}`);
                let rows = await res.json();
                // console.log(rows);
                rows.forEach((row,i)=>{
                    let r = document.createElement('tr');
                    r.setAttribute('data-table-id',id);
                    r.setAttribute('data-id',i);
                    table[0].column_names.forEach((c) => {
                        if(row.column[c] !== undefined)
                            r.innerHTML += `<td>${row.column[c]}</td>`;
                    }
                    );
                    
                    r.addEventListener('dblclick',async (e) => {
                        let id = r.getAttribute('data-table-id');
                        let row_id = r.getAttribute('data-id');
                        let res = await fetch(`${BASE_URL}/row/table/${id}`);
                        let rows = await res.json();

                        const row = rows[row_id];
                    
                        console.log(row);
                        // console.log(row.graph_values['y-values']);
                        let glabels = [];
                        let gdata = [];

                        for(let i = 0; i<row.graph_values['x-values'].length; i++){
                            if(row.graph_values['x-values'][i] !== '0' && row.graph_values['y-values'][i] !== '0'){
                                glabels.push(row.graph_values['x-values'][i]);
                                gdata.push(row.graph_values['y-values'][i]);
                            }
                        }

                        const data = {
                            labels: glabels,
                            datasets: [{
                              label: row.column.Material,
                              data: gdata,
                              fill: false,
                              borderColor: 'rgb(75, 192, 192)',
                              tension: 0.1
                            }],
                            options: {
                                events: ['mousemove','click'],
                                plugins: {
                                    tooltip: {
                                        events: ['mousemove']
                                    }
                                },
                                interaction: {
                                    mode: 'point'
                                }
                        
                            }
                          };
                        
                        const canvas = document.createElement('canvas');
                        graphContainer.innerHTML = '';
                        graphContainer.appendChild(canvas);
                        
                        new Chart(canvas, {
                            type: 'line',
                            data: data,
                            options: {
                                maintainAspectRatio: false,
                            }
                        });
                        
                        const table = metadata.querySelector('.table');
                        table.innerHTML = '';
                        for(let prop in row.metadata){
                            table.innerHTML += `<tr>
                                                    <td>${prop}</td>
                                                    <td>${row.metadata[prop]}</td>
                                                </tr>`;
                        }
                        
                        explorerContainer.classList.add('close');
                    },false);
                    tbody.appendChild(r);
                });

                
                
            } catch (error) {
                console.log(error);
            }

           
        });

        ul.appendChild(li);
    });

    accordion_body.appendChild(ul);
    accordion_content.appendChild(accordion_body);
    accordion_div.appendChild(accordion_content);

    library_div.appendChild(accordion_div);
}

openExploreContainer.addEventListener('click',() => {
    explorerContainer.classList.remove("close");
})

window.addEventListener('load',async()=>{
    await getLibrary();
    LIBRARIES.forEach(async(library,idx) => {
        let table_lst = await getTable(library._id);
        let id = library.name.replaceAll(' ','-');
        createAccordion(id,library.name);
    //     let content = `<div class="accordion-item">
    //     <h2 class="accordion-header">
    //       <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="true" aria-controls="collapseOne">
    //         ${library.name}
    //       </button>
    //     </h2>
    //     <div id="${id}" class="accordion-collapse collapse">
    //       <div class="accordion-body">
    //         <ul class="list-group">
    //             ${table_lst}
    //         </ul>
    //       </div>
    //     </div>
    //   </div>`;

    //   library_div.innerHTML += content;

    });
})