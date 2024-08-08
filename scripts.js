document.addEventListener('DOMContentLoaded', function () {

    if (document.getElementById('ukChart')) {
        fetchScotlandData();
        fetchUKData();
        fetchCovidData();
        fetchWorldData();
    }
    else{
        populateLinks();
    }
});

async function fetchScotlandData() {
    try {
        const response = await axios.get('https://covid-api.com/api/reports', {
            params: {
                date: '2023-03-09',
                iso: 'GBR',
                region_name: 'United Kingdom',
                region_province: 'Scotland'
            }
        });

        const data = response.data.data[0];  // Get the data for Scotland

        if (data) {
            console.log('Scotland data fetched successfully!');
            const totalCases = data.confirmed;
            const totalDeaths = data.deaths;
            console.log('Scotland Total Cases: ' + totalCases);
            console.log('Scotland Total Deaths: ' + totalDeaths);

            createScotlandPieChart('scotlandChart', 'Scotland COVID-19 Statistics', {
                cases: totalCases,
                deaths: totalDeaths
            });

            const lastUpdated = data.last_update;
            if (lastUpdated) {
                const formattedDate = new Date(lastUpdated).toLocaleString();
                document.getElementById('lastUpdatedScotland').innerText = `Last updated: ${formattedDate}`;
            } else {
                console.error('Last update time not available in the response');
            }
        } else {
            console.error('Scotland data not found');
        }
    } catch (error) {
        console.error('Error fetching Scotland data:', error);
    }
}

function createScotlandPieChart(canvasId, title, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cases', 'Deaths'],
            datasets: [{
                label: title,
                data: [data.cases, data.deaths],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw.toLocaleString()}`;
                        }
                    }
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        let label = ctx.chart.data.labels[ctx.dataIndex];
                        return `${label}: ${value.toLocaleString()}`;
                    },
                    color: '#000',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

async function fetchUKData() {
    try {
        const response = await axios.get('https://covid-19-data.p.rapidapi.com/country', {
            headers: {
                'x-rapidapi-key': 'bc11c21f11msh5da085223d2a02ap1f7855jsndcee8f1fa60d',
                'x-rapidapi-host': 'covid-19-data.p.rapidapi.com'
            },
            params: {
                name: 'UK'
            }
        });

        const ukData = response.data[0];
        console.log('UK data fetched successfully!');
        console.log('UK Total Cases: ' + ukData.confirmed);
        console.log('UK Total Deaths: ' + ukData.deaths);
        console.log('UK Total Recovered: ' + ukData.recovered);
        createUKChart('ukChart', 'UK COVID-19 Statistics', ukData);

        const lastChange = ukData.lastChange;
        const lastUpdate = ukData.lastUpdate;
        if (lastChange) {
            const formattedDate = new Date(lastChange).toLocaleString();
            document.getElementById('lastChangedUK').innerText = `Last changed: ${formattedDate}`;
        } else {
            console.error('Last change time not available in the response');
        }
        if (lastUpdate) {
            const formattedDate = new Date(lastUpdate).toLocaleString();
            document.getElementById('lastUpdatedUK').innerText = `Last updated: ${formattedDate}`;
        } else {
            console.error('Last update time not available in the response');
        }
    } catch (error) {
        console.error('Error fetching UK data:', error);
    }
}


function createUKChart(canvasId, title, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Cases', 'Total Deaths', 'Total Recovered', 'Active Cases'],
            datasets: [{
                label: title,
                data: [data.confirmed, data.deaths, data.recovered, data.confirmed - data.deaths - data.recovered],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value, context) => value.toLocaleString(),
                    color: 'black',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

async function fetchWorldData() {
    try {
        const response = await axios.get('https://disease.sh/v3/covid-19/countries');
        console.log('World data fetched successfully!');
        const countriesData = response.data;
        createWorldMap(countriesData);
    } catch (error) {
        console.error('Error fetching world data:', error);
    }
}

function createWorldMap(countriesData) {
    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    countriesData.forEach(country => {
        const { countryInfo: { lat, long }, cases, country: name } = country;
        console.log(name + ' Total Cases: ' + cases);

        L.circle([lat, long], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: Math.sqrt(cases) * 100
        }).bindPopup(`<b>${name}</b><br>Cases: ${cases.toLocaleString()}`).addTo(map);
    });
}
    

async function fetchCovidData() {
    try {
        const response = await axios.get('https://disease.sh/v3/covid-19/historical/all?lastdays=all');

        const covidData = response.data;
        console.log('Historical World data fetched successfully!');
        const dates = Object.keys(covidData.cases);
        const newCases = Object.values(covidData.cases).map((cases, index, array) => index === 0 ? 0 : cases - array[index - 1]);
        const newDeaths = Object.values(covidData.deaths).map((deaths, index, array) => index === 0 ? 0 : deaths - array[index - 1]);

        console.log('Example data: ' + dates[728] + ', New Cases: ' +  newCases[728] + ', New Deaths: ' + newDeaths[728]);

        createLineChart('covidChart', dates, newCases, newDeaths); 
    } catch (error) {
        console.error('Error fetching COVID-19 data:', error);
    }
}

function createLineChart(canvasId, labels, newCases, newDeaths) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id ${canvasId} not found`);
        return;
    }
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'New Cases',
                    data: newCases,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'New Deaths',
                    data: newDeaths,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function populateLinks() {
    const links = [
        { name: 'World Health Organization', url: 'https://www.who.int/' },
        { name: 'Johns Hopkins University', url: 'https://coronavirus.jhu.edu/' },
        { name: 'NHS', url: 'https://www.nhs.uk/' },
        { name: 'NHS Scotland', url: 'https://www.nhsinform.scot/' },
        { name: 'Public Health Scotland', url: 'https://www.publichealthscotland.scot/' },
        { name: 'UK Government', url: 'https://www.gov.uk/coronavirus' }
    ];

    const linksList = document.getElementById('linksList');
    if (linksList) {
        links.forEach(link => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.textContent = link.name;
            listItem.appendChild(anchor);
            linksList.appendChild(listItem);
        });
    }
}
