
(function () {
    let activeTooltip = null;
    let hideTimeout = null; // 用于管理3秒后自动隐藏
    //定义小数点后保留位数
    const decimalPlaces = 3;
    // 示例用法

    const strategies = new Map([
        ['cn.tradingview.com', getTradingViewElements],
        ['cn.investing.com', getInvestingComElements]
    ]);


    // 创建工具提示
    function createTooltip(data, event) {
        // 先移除任何已有的工具提示
        if (activeTooltip) {
            removeTooltip();
        }


        const tooltip = document.createElement('div');
        tooltip.className = 'gold-price-tooltip';
        tooltip.innerHTML = `
      <div class="tooltip-row">
        <span class="tooltip-label">金盎司/美元:</span> 
        <span class="tooltip-data">${data.oneOzGoldToDollar.toFixed(decimalPlaces)}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">实时汇率:</span> 
        <span class="tooltip-data">1 USD = ${data.exchangeRate.toFixed(decimalPlaces)} CNY</span>
      </div>
       <div class="tooltip-row">
        <span class="tooltip-label">克/美元:</span> 
        <span class="tooltip-data highlight-price">$${data.usdPricePerGram.toFixed(decimalPlaces)}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">克/人民币:</span> 
        <span class="tooltip-data highlight-price">¥${data.cnyPricePerGram.toFixed(decimalPlaces)}</span>
      </div>
    `;

        // 设置工具提示位置
        // tooltip.style.left = `${event.clientX + 5}px`;
        // tooltip.style.top = `${event.clientY + 5}px`;


        // 设置 Tooltip 的宽度和高度（如果是动态内容，需先确保渲染后才能获取）
        tooltip.style.position = 'absolute'; // 确保位置类型为绝对定位
        tooltip.style.transform = 'translate(-50%, -50%)'; // 使用 CSS 平移实现居中

        // 计算屏幕中心的位置
        const centerX = window.innerWidth / 2; // 水平居中
        const centerY = window.innerHeight / 2; // 垂直居中

        // 将 Tooltip 放置到屏幕正中间
        tooltip.style.left = `${centerX}px`;
        tooltip.style.top = `${centerY}px`;

        document.body.appendChild(tooltip);
        activeTooltip = tooltip;

        // 3秒后自动移除工具提示
        hideTimeout = setTimeout(removeTooltip, 10000);


    }

    // 移除工具提示
    function removeTooltip() {
        if (activeTooltip) {
            document.body.removeChild(activeTooltip);
            activeTooltip = null;
        }
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }

    let targetElement = fetchElementsForCurrentDomain();

    // 页面点击事件监听器
    /*    
     document.body.addEventListener('click', async (event) => {
    
            if (targetElement) {
                // 如果有现存的工具提示，先移除
                removeTooltip();
                try {
                    // 发送消息到后台脚本请求价格转换
                    const response = await chrome.runtime.sendMessage({
                        action: 'convertPrice',
                        price: targetElement.item(0).textContent.replace(/,/g, ''),
                        domain: new URL(window.location.href).hostname.replace(/^(www\.)?/, '').replace(/^www\./, '').replace(/^([^\.]+\.[^\.]+)$/, '$1')
                    });
    
                    // 创建新的工具提示
                    createTooltip(response, event);
                } catch (error) {
                    console.error('价格转换错误:', error);
                }
            } else {
                // 点击非目标元素时，移除工具提示
                removeTooltip();
            }
        });
     */

    // 创建MutationObserver实例
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(async (mutation) => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                if (targetElement) {
                    // 如果有现存的工具提示，先移除
                    removeTooltip();
                    try {
                        // 发送消息到后台脚本请求价格转换
                        const response = await chrome.runtime.sendMessage({
                            action: 'convertPrice',
                            price: targetElement.item(0).textContent.replace(/,/g, ''),
                            domain: new URL(window.location.href).hostname.replace(/^(www\.)?/, '').replace(/^www\./, '').replace(/^([^\.]+\.[^\.]+)$/, '$1')
                        });

                        // 创建新的工具提示
                        createTooltip(response);
                    } catch (error) {
                        console.error('价格转换错误:', error);
                    }
                } else {
                    // 点击非目标元素时，移除工具提示
                    removeTooltip();
                }
            }
        });
    });

    // 配置观察选项
    const config = {
        characterData: true, // 监听节点内容或文本变化
        childList: true, // 监听子节点变化（包括文本节点添加/删除）
        subtree: true // 监听子孙节点
    };

    // 开始观察
    observer.observe(targetElement.item(0), config);


    function fetchElementsForCurrentDomain() {
        // 获取当前页面的一级域名
        const domain = new URL(window.location.href).hostname.replace(/^(www\.)?/, '');
        // 查找对应的策略函数
        const strategy = strategies.get(domain);
        if (strategy) {
            // 执行策略函数
            const elements = strategy();
            if (elements && elements.length > 0) {
                return elements;
            } else {
                console.log('No matching elements found.');
            }
        } else {
            console.log('Unsupported domain.');
        }
    }



    function getTradingViewElements() {
        return document.querySelectorAll('.last-JWoJqCpY.js-symbol-last');
    }

    function getInvestingComElements() {
        return document.querySelectorAll('.text-5xl\\/9.font-bold');
    }





})();
