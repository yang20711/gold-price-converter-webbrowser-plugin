// 使用ts语法，引入dexie.js和GoldPriceDB.js
importScripts('js/global.js', 'js/dexie.js', 'js/gold-price-db.js');

// 创建数据库实例
const goldPriceDB = new GoldPriceDB();

/**
 * 处理消息传递中的错误
 * @param {Error} error - 错误对象
 * @param {Function} sendResponse - 发送响应的函数
 */
function handleError(error, sendResponse) {
  console.error('错误:', error);
  sendResponse({ error: '操作失败: ' + error.message });
}

// 监听消息传递
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理转换价格的请求
  if (request.action === 'convertPrice') {
    const oneOzGoldToDollar = parseFloat(request.price);

    // 获取汇率并计算价格
    fetch(GOLD_CONFIG.EXCHANGE_RATE_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应错误');
        }
        return response.json();
      })
      .then(data => {
        if (!data || !data.rates || typeof data.rates.CNY !== 'number') {
          throw new Error('无效的汇率数据');
        }

        const exchangeRate = data.rates.CNY;
        const usdPricePerGram = oneOzGoldToDollar / GOLD_CONFIG.WEIGHTS.OUNCE_TO_GRAMS;
        const cnyPricePerGram = usdPricePerGram * exchangeRate;

        const resData = {
          oneOzGoldToDollar: oneOzGoldToDollar,
          exchangeRate: exchangeRate,
          usdPricePerGram: usdPricePerGram,
          cnyPricePerGram: cnyPricePerGram,
          source: request.domain
        };

        // 将数据添加到数据库
        return goldPriceDB.addGoldPrice(resData, 3)
          .then(() => resData)
          .catch(error => {
            handleError(new Error('数据库操作错误: ' + error), sendResponse);
          });
      })
      .then(resData => {
        if (resData) {
          sendResponse(resData);
        }
      })
      .catch(error => {
        handleError(error, sendResponse);
      });

    return true;
  } else if (request.action === 'getGoldPriceData') {
    // 处理获取黄金价格数据的请求
    goldPriceDB.goldPriceItems.toArray()
      .then(data => {
        sendResponse({ data });
      })
      .catch(error => {
        handleError(new Error('获取黄金价格数据错误: ' + error), sendResponse);
      });

    return true;
  } else if (request.action === 'dbInstance') {
     goldPriceDB.goldPriceItems.orderBy('source')
      .distinct()
      .uniqueKeys().then(data => {
        sendResponse({ data });
      })
      .catch(error => {
        handleError(new Error('获取黄金价格数据错误: ' + error), sendResponse);
      });
    return true;
  }
});