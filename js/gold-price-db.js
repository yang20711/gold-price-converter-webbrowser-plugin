class GoldPriceDB {
    constructor() {
        this.db = new Dexie('goldPrice');
        this._initialize();
    }

    // 初始化数据库
    _initialize() {
        this.db.version(2).stores({
            goldPriceItems: '++id,cnyPricePerGram,usdPricePerGram,exchangeRate,oneOzGoldToDollar,*source,dataTime',
        });
        this.db.open().catch((err) => {
            console.error('Failed to open the database:', err);
        });
    }

    /**
     * 添加金价数据
     * @param {Object} data - 金价数据
     * @param {number} data.cnyPricePerGram - 每克人民币价格
     * @param {number} data.usdPricePerGram - 每克美元价格
     * @param {number} data.exchangeRate - 汇率
     * @param {number} data.oneOzGoldToDollar - 每盎司金价 (美元)
     * @param {number} [decimalPlaces=2] - 小数位数（可选，默认2位）
     * @returns {Promise<number>} 新记录的 ID
     */
    async addGoldPrice(data, decimalPlaces = 2) {
        try {
            const newItem = {
                cnyPricePerGram: parseFloat(data.cnyPricePerGram).toFixed(decimalPlaces),
                usdPricePerGram: parseFloat(data.usdPricePerGram).toFixed(decimalPlaces),
                exchangeRate: parseFloat(data.exchangeRate).toFixed(decimalPlaces),
                oneOzGoldToDollar: parseFloat(data.oneOzGoldToDollar).toFixed(decimalPlaces),
                source: data.source,
                dataTime: new Date().toLocaleString(),
            };
            const id = await this.db.goldPriceItems.add(newItem);
            return id;
        } catch (error) {
            console.error('Error adding gold price:', error);
            throw error;
        }
    }
    /**
     * 获取金价数据
     */
    get goldPriceItems() {
        return this.db.goldPriceItems;
        
    }
}
