const nav_options = document.querySelectorAll('input[name=nav_option]');
// For library Input
const library_submit = document.querySelector('#library_submit');
const library_input = document.querySelector('#library_input');

// For Library select (Table , Add Data)
const library_select = document.querySelectorAll('.library_select');

// For Table Input
const table_name = document.querySelector('#table_name');
const metadata_input = document.querySelector('#metadata');
const column_name = document.querySelector('#column_name');
const selection_option = document.querySelector('#selection_option');
const table_submit = document.querySelector('#table_submit');

// For Table Select (Add Data)
const table_select = document.querySelector('.table_select');

// For table form
const table_form = document.querySelector('.table_form');

//Base URL for API
const BASE_URL = "https://bharat-abhiyantrik.vercel.app";

// For Library data from DB
let LIBRARIES = [];
let TABLES = [];

// Loading all libraries
const getLibrary = async () => {
    let res = await fetch(`${BASE_URL}/library`);
    let data = await res.json();
    LIBRARIES = data;
    return data;
}

// Setting option in select (Library)
const loadLibrary = async () => {
    let libraries = await getLibrary();
    libraries.forEach((library,idx)=>{
        let option = `<option value="${idx}">${library.name}</option>`;
        library_select.forEach((e)=>{
            e.innerHTML += option;
        })
    });
}


nav_options.forEach((nav_option) => {
    nav_option.addEventListener('change',()=>{
        const active_content = document.querySelector('.content.active');
        if(active_content)
            active_content.classList.remove('active');
        
        const content = nav_option.getAttribute('data-content');
        const div_content = document.querySelector(`.${content}`);

        div_content.classList.add('active');
    })
});

// Handling Library Creation
library_submit.addEventListener('click',async()=>{
    library_submit.setAttribute('disabled','true');
    library_input.setAttribute('disabled','true');
    let name = library_input.value;

    
    if(!name){
        alert("Please enter the library name")
        return;
    }

    let obj = JSON.stringify({
        name,
    });

    try {
        let res = await fetch(`${BASE_URL}/create/library`,{
            method: "POST",
            body: obj,
            headers: {
                "Content-Type": "application/json",
            },
        });
        alert("Created");
    } catch (error) {
        console.log(error);
    }finally{
        library_submit.removeAttribute('disabled');
        library_input.removeAttribute('disabled');
    }
});

// Handling Table Creation
table_submit.addEventListener('click',async()=>{
    let library_idx = library_select[0] ? library_select[0].value : undefined;
    let name = table_name.value;
    let metadata = (metadata_input.value).split(", ");
    let column_names = (column_name.value).split(", ");
    let selection_options = (selection_option.value).split(", ");

    if(isNaN(library_idx)){
        alert("Please select library");
        return;
    }

    if(!name){
        alert("Please enter the table name");
        return;
    }

    if(!metadata[0].length){
        alert("Please enter the metadata");
        return;
    }

    if(!column_names[0].length){
        alert("Please enter the column names");
        return;
    }

    if(!selection_options[0].length){
        alert("Please enter the selection columns");
        return;
    }

    let obj = JSON.stringify({
        name,
        library_id: LIBRARIES[library_idx]._id,
        metadata,
        column_names,
        selection_options,
    });

    try {
        await fetch(`${BASE_URL}/create/table`,{
            method: "POST",
            body: obj,
            headers:{
                'Content-Type': 'application/json'
            }
        });
        alert("Added");
    } catch (error) {
        alert("Error");
        console.log(error);
    }
})

// For Dependent DropDown

library_select[1].addEventListener('change',async()=>{
    table_select.setAttribute('disabled','true');
    library_select[1].setAttribute('disabled','true');
    let idx = library_select[1].value;
    if(isNaN(idx)){
        alert("Please select the library");
        return;
    }
    try {
        let id = LIBRARIES[idx]._id;
        let res = await fetch(`${BASE_URL}/table/${id}`);
        let data = await res.json();
        TABLES = data;

        let first_element = table_select.firstElementChild;
        table_select.innerHTML = '';
        table_select.appendChild(first_element);
        TABLES.forEach((table,idx) => {
            table_select.innerHTML += `<option value="${idx}">${table.name}</option>`;
        });
    } catch (error) {
        console.log(error);
    }finally{
        table_select.removeAttribute('disabled');
        library_select[1].removeAttribute('disabled');
    }
});

table_select.addEventListener('change',()=>{
    table_select.setAttribute('disabled','true');
    table_form.innerHTML = '';
    let idx = table_select.value;
    let table = TABLES[idx];

    // For MetaData
    let meta_data_div = document.createElement('div');
    meta_data_div.innerHTML += '<h4>Metadata</h4>';
    meta_data_div.classList.add('metadata_input');

    table.metadata.forEach((e) => {
        let id = e.replaceAll(' ','-');
        meta_data_div.innerHTML += `<div><label for="${id}">${e}</label> <textarea type="text" class="form-control" row="500" id="${id}"></textarea></div>`;    
    });

    let column_name_div = document.createElement('div');
    column_name_div.innerHTML = '<h4>Table Data</h4>';
    column_name_div.classList.add('column_names_input');
    table.column_names.forEach((e)=>{
        let id = e.replace(' ','-');
        column_name_div.innerHTML += `<div><label for="${id}">${e}</label> <textarea type="text" class="form-control" row="500" id="${id}"></textarea></div>`;    
    });

    table_form.appendChild(meta_data_div);
    table_form.appendChild(column_name_div);

    let graph_range_div = document.createElement('div');
    graph_range_div.classList.add('graph_range');
    graph_range_div.innerHTML = '<h4>Graph Range Values</h4>';
    graph_range_div.innerHTML += `
            <div>
                <label for="x-start">X-axis Start</label>
                <textarea type="text" class="form-control" row="500" id="x-start"></textarea>
            </div>
            <div>
                <label for="x-end">X-axis End</label>
                <textarea type="text" class="form-control" row="500" id="x-end"></textarea>
            </div>
            <div>
                <label for="y-start">Y-axis Start</label>
                <textarea type="text" class="form-control" row="500" id="y-start"></textarea>
            </div>
            <div>
                <label for="y-end">Y-axis End</label>
                <textarea type="text" class="form-control" row="500" id="y-end"></textarea>
            </div>
    `;

    let graph_values_div = document.createElement('div');
    graph_values_div.classList.add('graph_values');
    graph_values_div.innerHTML = '<h4>Graph Values Values</h4>';
    graph_values_div.innerHTML += `
            <div>
                <label for="x-values">X-axis Values</label>
                <textarea type="text" class="form-control" row="500" id="x-values"></textarea>
            </div>
            <div>
                <label for="y-values">Y-axis Values</label>
                <textarea type="text" class="form-control" row="500" id="y-values"></textarea>
            </div>
    `;


    table_form.appendChild(graph_range_div);
    table_form.appendChild(graph_values_div);

    let table_form_submit = document.createElement('button');
    table_form_submit.classList.add('btn','btn-success','mt-3');
    table_form_submit.innerText = 'Submit';

    table_form.appendChild(table_form_submit);

    table_form_submit.addEventListener('click',async()=>{
        table_form_submit.setAttribute('disabled',true);
        let table_id = table._id;
        let metadata = {};
        let column = {};
        let graph_range = {};
        let graph_values = {};
        table.metadata.forEach((e)=>{
            let id = e.replaceAll(' ','-');
            let input = meta_data_div.querySelector(`#${id}`);
            if(input) metadata[e] = input.value;
        });

        table.column_names.forEach((e)=>{
            let id = e.replaceAll(' ','-');
            let input = column_name_div.querySelector(`#${id}`);
            if(input) column[e] = input.value;
        });

        graph_range['x-start'] = graph_range_div.querySelector('#x-start').value;
        graph_range['x-end'] = graph_range_div.querySelector('#x-end').value;
        graph_range['y-start'] = graph_range_div.querySelector('#y-start').value;
        graph_range['y-end'] = graph_range_div.querySelector('#y-end').value;

        graph_values['x-values'] = (graph_values_div.querySelector('#x-values').value).split(", ");
        graph_values['y-values'] = (graph_values_div.querySelector('#y-values').value).split(", ");

        let obj = JSON.stringify({
            table_id,
            metadata,
            column,
            graph_range,
            graph_values
        });

        try {
            await fetch(`${BASE_URL}/create/row`,{
                method: "POST",
                body: obj,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            alert("created");
        } catch (error) {
            alert("error");
        }finally{
            table_form_submit.removeAttribute('disabled');
        }
        
    })

    // table_form.innerHTML += `<button class="btn btn-success mt-3" id="table_submit">Submit</button>`;
    table_select.removeAttribute('disabled');
});



window.addEventListener('load',async ()=>{
    await loadLibrary();
})