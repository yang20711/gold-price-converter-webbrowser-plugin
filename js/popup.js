document.getElementById('goldPriceCalculatorBtn').addEventListener('click', () => {
    // 打开金价计算器页面
    chrome.tabs.create({ url: chrome.runtime.getURL('gold-price-calculator.html') });
    window.close();  // 关闭弹出菜单
});

document.getElementById('goldPriceChartBtn').addEventListener('click', () => {
    // 打开金价历史价格图表页面
    chrome.tabs.create({ url: chrome.runtime.getURL('gold-price-chart.html') });
    window.close();  // 关闭弹出菜单
});
document.getElementById('investingBtn').addEventListener('click', () => {
    // 打开金价历史价格图表页面
    window.close();  // 关闭弹出菜单
    window.open('https://cn.investing.com/currencies/xau-usd-chart');
});

