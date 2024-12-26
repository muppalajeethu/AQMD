const apiUrl = 'https://api.thingspeak.com/channels/1596152/feeds.json?results=10';

const updateDashboard = async () => {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const latestFeed = data.feeds[data.feeds.length - 1];
        const metricFields = Object.keys(latestFeed).filter(field => field.startsWith('field'));

        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = '';

        const lastUpdatedTime = new Date(latestFeed.created_at);
        document.getElementById('last-updated').textContent = `Last updated: ${lastUpdatedTime.toLocaleString()}`;

        for (const field of metricFields) {
            const metricCard = createMetricCard(field, latestFeed[field], data);
            dashboard.appendChild(metricCard);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('last-updated').textContent = "Error loading data.";
    }
};

const createMetricCard = (field, value, data) => {
    const metricCard = document.createElement('div');
    metricCard.classList.add('metric-card');

    const metricHeader = document.createElement('h2');
    metricHeader.textContent = getFieldName(field);
    metricCard.appendChild(metricHeader);

    const canvas = document.createElement('canvas');
    metricCard.appendChild(canvas);

    const chartData = data.feeds.slice(-10).map(feed => ({
        time: new Date(feed.created_at),
        value: feed[field]
    }));

    createChart(canvas.getContext('2d'), chartData, getFieldName(field));

    return metricCard;
};

const getFieldName = (field) => {
    switch (field) {
        case 'field1':
            return 'PM2.5';
        case 'field2':
            return 'PM10';
        case 'field3':
            return 'Ozone';
        case 'field4':
            return 'Humidity';
        case 'field5':
            return 'Temperature';
        case 'field6':
            return 'CO';
        default:
            return 'Unknown';
    }
};

const createChart = (ctx, data, label) => {
    const currentTime = new Date();
    const labels = data.map((_, index) => {
        const time = new Date(currentTime - (9 - index) * 60 * 60 * 1000); 
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const values = data.map(point => point.value);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
};

updateDashboard();
setInterval(updateDashboard, 60 * 60 * 1000); 