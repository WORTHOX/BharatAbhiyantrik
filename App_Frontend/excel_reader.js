const table_import_xlsx = document.querySelector("#table_import_xlsx");
const data_import_xlsx = document.querySelector("#data_import_xlsx");
let workbook;

const titleToNumber = (columnTitle) => {
  const n = columnTitle.length;
  let p = 0;
  let ans = 0;

  for (let i = n - 1; i >= 0; i--) {
    const val = columnTitle.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
    ans += Math.pow(26, p++) * (val);
  }

  return ans;
};

const convertToTitle = (columnNumber) => {
  let ans = '';

  while (columnNumber > 0) {
    columnNumber--;
    ans = String.fromCharCode(columnNumber % 26 + 'A'.charCodeAt(0)) + ans;
    columnNumber = Math.floor(columnNumber / 26);
  }

  return ans;
};

const loadSheet = (sheetnum,getColumn=false) => {
  const xlCol = [];
  const sheetName = workbook.SheetNames[sheetnum];
  const worksheet = workbook.Sheets[sheetName];
  const rowIndex = 1;
  // console.table(Object.entries(worksheet).slice(0,10));
  const taleInfo = worksheet['!ref'];
  console.log(taleInfo);
  const start = taleInfo.split(':')[0].replace(/\d/g, '');
  let end = taleInfo.split(':')[1];

  const numRows = +(end.replace(/\D/g, ''));
  end = end.replace(/\d/g, '');

  console.log(start, end, numRows);

  const loopStart = titleToNumber(start);
  const loopEnd = titleToNumber(end);

  for (let i = loopStart; i<=loopEnd; i++) {
    xlCol.push(convertToTitle(i));
  }


  let columnNames = [];
  for (const col of xlCol) {
    const value = worksheet[`${col}1`];
    columnNames.push(value ? value.v : '');
  }

  if(getColumn) return columnNames;


  // create x-axis and y-axis data
  let data = [];
  for (let curr = 2; curr<=numRows; curr++) {
    let obj = {};
    let values = [];
    for (const col of xlCol) {
      const key = worksheet[`${col}1`];
      const value = worksheet[`${col}${curr}`];
      if(key && value){
        obj[key.v] = value.v;
        if(value.v)
          values.push(value.v);
      }
    }
    if(sheetnum != 3)
      data.push(obj);
    else
      data.push(values);
  }
  return data;
};

function makeRequest(method, url, success, error) {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', url, true);
  httpRequest.responseType = 'arraybuffer';

  httpRequest.open(method, url);
  httpRequest.onload = function() {
    success(httpRequest.response);
  };
  httpRequest.onerror = function() {
    error(httpRequest.response);
  };
  httpRequest.send();
}

function convertDataToWorkbook(dataRows) {
  /* convert data to binary string */
  const data = new Uint8Array(dataRows);
  const arr = [];

  for (let i = 0; i !== data.length; ++i) {
    arr[i] = String.fromCharCode(data[i]);
  }

  const bstr = arr.join('');

  return window.XLSX.read(bstr, {type: 'binary'});
}

function importExcel() {
  makeRequest(
      'GET',
      '/table.xlsx',
      // success
      function(data) {
        workbook = convertDataToWorkbook(data);
      },
      // error
      function(error) {
        throw error;
      },
  );
}

table_import_xlsx.addEventListener('click',() => {
  const metaData = loadSheet(2,true);
  const column = loadSheet(1,true);

  metadata_input.value = metaData.join(", ");
  column_name.value = column.join(", ");

  console.log(metaData);
  console.log(column);

});

data_import_xlsx.addEventListener('click',async() => {
   const metaData = loadSheet(2,false);
   const columnData = loadSheet(1,false);
   const xValues = loadSheet(3,true);
   const yValues = loadSheet(3,false);


   const table_idx = document.querySelector(".table_select").value;
   const table_id = TABLES[table_idx]._id;

   const graph_range = {
    'x-start': -1,
    'x-end': -1,
    'y-start': -1,
    'y-end': -1,
  };
   
   for(let i = 0; i<metaData.length; i++){
    const metadata = metaData[i];
    const column = columnData[i];
    const graph_values = {
      'x-values': xValues,
      'y-values': yValues[i]
    };
   
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
          // alert("created");
      } catch (error) {
          // alert("error");
          console.log(i);
      }
   }

})

window.onload = () => {
  importExcel();
};