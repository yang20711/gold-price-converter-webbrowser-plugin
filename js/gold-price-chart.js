// gold-price-chart.js

function fetchSourceData() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'dbInstance' }, (response) => {
            if (response.error) {
                console.error('Error fetching data:', response.error);
                chartInfoElement.innerHTML = `
            <div>无法加载数据，请稍后重试</div>
          `;
                reject(response.error);
                return;
            }
            resolve(response.data);
        });
    });
}



// 计算价格变化百分比
function calculatePriceChange(prices) {
    // 如果价格数组长度小于2，则返回0
    if (prices.length < 2) return 0;
    // 获取第一个和最后一个价格
    const firstPrice = Number(prices[0]);
    const lastPrice = Number(prices[prices.length - 1]);

    // 如果价格无效或第一个价格为0，则返回0
    if (isNaN(firstPrice) || isNaN(lastPrice) || firstPrice === 0) return 0;

    // 计算并返回价格变化百分比
    return ((lastPrice - firstPrice) / firstPrice) * 100;
}



document.addEventListener('DOMContentLoaded', () => {
    // 获取显示图表信息的DOM元素
    const chartInfoElement = document.getElementById('chartInfo');


    // 向后台发送消息请求获取黄金价格数据
    chrome.runtime.sendMessage({ action: 'getGoldPriceData' }, (response) => {
        if (response.error) {
            console.error('Error fetching data:', response.error);
            chartInfoElement.innerHTML = `
                <div class="text-red-500 font-semibold">
                    无法加载数据，请稍后重试
                </div>
            `;
            return;
        }

        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
            console.error('Invalid or empty data:', data);
            chartInfoElement.innerHTML = `
                <div class="text-red-500 font-semibold">
                    数据格式错误，无法显示图表
                </div>
            `;
            return;
        }

        // 根据 source 分组数据
        const groupedData = {};
        data.forEach(item => {
            const { source, cnyPricePerGram, dataTime } = item;
            if (!groupedData[source]) {
                groupedData[source] = { labels: [], prices: [] };
            }
            groupedData[source].labels.push(dataTime);
            groupedData[source].prices.push(Number(cnyPricePerGram));
        });

        // 动态生成颜色
        const colorPalette = [
            'rgba(37, 99, 235, 1)',
            'rgba(220, 38, 38, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(236, 72, 153, 1)'
        ];
        const backgroundPalette = colorPalette.map(color => color.replace('1)', '0.1)'));
        const sources = Object.keys(groupedData);

        // 动态生成 datasets
        const datasets = sources.map((source, index) => ({
            label: source,
            data: groupedData[source].prices,
            borderColor: colorPalette[index % colorPalette.length],
            backgroundColor: backgroundPalette[index % backgroundPalette.length],
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: colorPalette[index % colorPalette.length],
            pointBorderColor: colorPalette[index % colorPalette.length],
            pointRadius: 5,
            pointHoverRadius: 8
        }));

        const labels = [...new Set(data.map(item => item.dataTime))].sort(); // 按时间排序

        /*   const labels = [...new Set(data.map(item => {
            const date = new Date(item.dataTime.replace(/-/g, '/')); // 确保兼容性
            // 格式化
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

        }))].sort(); // 按时间排序 */

        const prices = data.map(item => Number(item.cnyPricePerGram));
        // 获取最新的价格
        const latestPrice = prices[prices.length - 1] || 0;
        // 计算价格变化百分比
        const priceChange = calculatePriceChange(prices);

        // 显示最新的价格和价格变化
        chartInfoElement.innerHTML = `
            <div class="flex justify-center space-x-4">
                <div>
                    <span class="font-medium">最新价格：</span>
                    <span class="text-xl font-bold text-blue-600">¥${Number(latestPrice).toFixed(2)}</span>
                </div>
                <div>
                    <span class="font-medium">价格变动：</span>
                    <span class="${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${priceChange >= 0 ? '↑' : '↓'} ${Math.abs(priceChange).toFixed(2)}%
                    </span>
                </div>
            </div>
        `;


        const ctx = document.getElementById('goldPriceChart').getContext('2d');

        new Chart(ctx, {
            legend: '国际金价',
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '日期',
                            color: '#4a5568',
                            font: { weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#718096' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '价格 (人民币/克)',
                            color: '#4a5568',
                            font: { weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            color: '#718096',
                            callback: value => `¥${value.toFixed(2)}`
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true, // 启用标题
                        text: '国际多渠道金价曲线图', // 标题内容
                        font: {
                            size: 18, // 字体大小
                            weight: 'bold' // 字体粗细
                        },
                        color: '#333333', // 标题颜色
                        padding: {
                            top: 10, // 标题上方间距
                            bottom: 10 // 标题下方间距
                        },
                        align: 'center' // 标题对齐方式：'start', 'center', 'end'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#4a5568' }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(45, 55, 72, 0.9)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        callbacks: {
                            label: tooltipItem => `价格：¥${tooltipItem.raw.toFixed(2)}`
                        }
                    }
                }
            }
        });
    });

});

