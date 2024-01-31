//Loading cities from CSV file into <select>


const csvFilePath = 'city_coordinates.csv';

fetch(csvFilePath)
  .then(response => response.text())
  .then(data => {
    const select = document.getElementById('citySelect');
    const rows = data.split('\n');

    rows.forEach(row => {
      const columns = row.split(',');
      if (columns[2] != 'city') {
        const optionElement = document.createElement('option');
        optionElement.value = JSON.stringify([columns[1], columns[0]]);
        if (columns.length == 4){
        optionElement.textContent = columns[2] + ', ' + columns[3];
        }
        else {
          optionElement.textContent = columns[2];
        }
        select.appendChild(optionElement);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching CSV file:', error);
  });




const select = document.getElementById('citySelect');

document.addEventListener("DOMContentLoaded", function() {

  select.addEventListener('change', function() {

    document.getElementById("forecast").style.display = "none";
    document.getElementById("loading-container").style.display = "flex";

    const startTime = new Date().getTime();

    const selectedOption = select.options[select.selectedIndex];
    const arrayAsString = selectedOption.value;
  
    const parsedArray = JSON.parse(arrayAsString);

    const baseUrl = 'https://www.7timer.info/bin/api.pl';

    const searchParams = {
      lon: parsedArray[0],
      lat: parsedArray[1],
      ac: 0,
      unit: 'metric',
      product: 'civillight',
      output: 'json',
      tzshift: 0
    };

  

    function buildUrlWithSearchParams(baseUrl, params) {
      const url = new URL(baseUrl);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      return url.href;
    }

    const updatedUrl = buildUrlWithSearchParams(baseUrl, searchParams);
  
    fetch(updatedUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request failed with status: ' + response.status);
        }
      })
      .then(jsonData => {
        const endTime = new Date().getTime();

        const processingTime = endTime - startTime;
        const extractedData = jsonData.dataseries.map(item => [item.date, item.weather, item.temp2m.max, item.temp2m.min]);
  
  
        forecast.innerHTML = '';
    
        
        setTimeout(function() { 
          
          for (let i = 0; i < 7; i++) {
            //Adding a Square
            const forecast = document.getElementById('forecast');
            const day = document.createElement('div');
            day.classList.add('day');
            forecast.appendChild(day);

            //Adding a Date
            const date = document.createElement('p');
            let strDate = extractedData[i][0].toString();
            strDate = strDate.substring(0, 4) + '/' + strDate.substring(4, 6) + '/' + strDate.substring(6);
            let innerDate = new Date(strDate);
            date.innerHTML = innerDate.toString().substring(0, 10);
            day.appendChild(date);

            //Adding an Icon
            const icon = document.createElement('img');
            const imgDescription = document.createElement('p');
            if (extractedData[i][1] == 'clear') {
              icon.src = 'images/sun.png';
              imgDescription.innerHTML = '<br>Clear';
            }
            if (extractedData[i][1] == 'pcloudy' || extractedData[i][1] == 'mcloudy') {
              icon.src = 'images/pcloud.png';
              imgDescription.innerHTML = '<br>Partly Cloudy';
            }
            if (extractedData[i][1] == 'cloudy') {
              icon.src = 'images/cloud.png';
              imgDescription.innerHTML = '<br>Cloudy'
            }
            if (extractedData[i][1] == 'lightrain' || extractedData[i][1] == 'ishower' || extractedData[i][1] == 'oshower' || extractedData[i][1] == 'humid') {
              icon.src = 'images/rainy.png';
              imgDescription.innerHTML = '<br>Rain';
            }
            if (extractedData[i][1] == 'lightsnow') {
              icon.src = 'images/snowflake.png';
              imgDescription.innerHTML = '<br>Snow';
            }
            if (extractedData[i][1] == 'ts' || extractedData[i][1] == 'tsrain') {
              icon.src = 'images/thunderstorm.png';
              imgDescription.innerHTML = '<br>Thunderstorm';
            }
            day.appendChild(icon);
            day.appendChild(imgDescription);

            //Adding Temperatures
            const temp = document.createElement('p');
            temp.classList.add('temp');
            let max = 'High: ' + extractedData[i][2].toString() + '&#8451;';
            let min = 'Low: ' + extractedData[i][3].toString() + '&#8451;'
            temp.innerHTML = max + '<br><br>' + min;
            day.appendChild(temp);
          }

          document.getElementById("loading-container").style.display = "none";

          document.getElementById("forecast").style.display = "grid";
        }, processingTime);
 
    
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
})
