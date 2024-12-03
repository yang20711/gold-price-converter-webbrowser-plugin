
document.addEventListener("DOMContentLoaded", () => {
    async function fetchExchangeRate() {
        try {
            const response = await fetch(GOLD_CONFIG.EXCHANGE_RATE_URL);
            if (!response.ok) {
                throw new Error('网络响应失败');
            }
            const data = await response.json();
            return data.rates.CNY;
        } catch (error) {
            console.error('汇率获取失败', error);
            return null;
        }
    }

    async function fetchGoldPrice() {
        const currencyType = document.getElementById('currency-type').value;
        const manualPriceInput = parseFloat(document.getElementById('price-input').value);
        const exchangeRateElement = document.getElementById('exchange-rate');
        const resultElement = document.getElementById('calculation-result');

        try {
            const exchangeRate = await fetchExchangeRate();

            if (!exchangeRate) {
                resultElement.innerHTML = '<span style="color:red">汇率获取失败</span>';
                return;
            }

            const goldPricePerOunce = manualPriceInput;

            if (isNaN(goldPricePerOunce)) {
                resultElement.innerHTML = '<span style="color:red">请输入有效的金价</span>';
                return;
            }

            //获取result-box元素，设置可见
            document.getElementById('infoPanel').style.display = 'block';


            let usdPerGram, cnyPerGram;

            if (currencyType === 'USD') {
                usdPerGram = goldPricePerOunce / GOLD_CONFIG.WEIGHTS.OUNCE_TO_GRAMS;
                cnyPerGram = usdPerGram * exchangeRate;
            } else {
                cnyPerGram = goldPricePerOunce / GOLD_CONFIG.WEIGHTS.OUNCE_TO_GRAMS;
                usdPerGram = cnyPerGram / exchangeRate;
            }

            exchangeRateElement.innerHTML = `
                实时汇率: 1美元 = ${exchangeRate.toFixed(2)} 人民币<br>
                金价: ${goldPricePerOunce.toFixed(2)} 美元/盎司
            `;

            resultElement.innerHTML = `
                美元价格: ${usdPerGram.toFixed(2)} 美元/克<br>
                人民币价格: <span style="color:green">${cnyPerGram.toFixed(2)} 人民币/克</span>
            `;
        } catch (error) {
            resultElement.innerHTML = '计算出错，请稍后再试';
        }
    }

    document.getElementById('fetch-gold-price-btn').addEventListener('click', fetchGoldPrice);
    // 当按下回车键时也调用 fetchGoldPrice
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {  // 检查是否按下了回车键
            event.preventDefault();  // 阻止默认行为，例如表单提交
            fetchGoldPrice();
        }
    });


});


