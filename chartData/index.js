const axios = require("axios");
const { WebSocket } = require("ws");
const { tradeSocket } = require("../socket");

const COIN_LIST = [
  "KRW-BTC",
  "KRW-ETH",
  "KRW-XRP",
  "KRW-ADA",
  "KRW-DOGE",
  "KRW-ATOM",
  "KRW-SOL",
  "KRW-ETC",
  "KRW-MATIC",
];

const CANDLE_SIZE = 180;
 
class CandleData {
  constructor() {
    this.candle = {};
    this.list = [...COIN_LIST];
    this.initData();
    this.lastCandleTime = "";
  }

  pushData = (ticker, data) => {
    this.candle[ticker] = data;
  };

  initData = async function () {
    await this.list.forEach(async (ticker) => {
      setTimeout(async () => {
        const { data, token } = await this.getCandleData(
          ticker,
          1,
          CANDLE_SIZE
        );
        let temp = "";
        const ohlc = [];
        const volume = [];
        data.forEach(
          (
            {
              opening_price,
              high_price,
              low_price,
              trade_price,
              timestamp,
              candle_acc_trade_price,
              candle_date_time_kst,
            },
            idx
          ) => {
            if (idx === 0) temp = candle_date_time_kst;
            ohlc.push({
              x: timestamp,
              y: [opening_price, high_price, low_price, trade_price],
            });
            volume.push({
              x: timestamp,
              y: candle_acc_trade_price,
            });
          }
        );
        this.candle[token] = { ohlc, volume };
        this.lastCandle = temp;
      }, 500);
    });
  };

  updateOneCandle = async function () {
    await this.list.forEach(async (ticker) => {
      try {
        setTimeout(async () => {
          const { data, token } = await this.getCandleData(ticker, 1, 1);
          const ohlc = [];
          const volume = [];
          let temp = "";
          data.forEach(
            ({
              opening_price,
              high_price,
              low_price,
              trade_price,
              timestamp,
              candle_acc_trade_price,
              candle_date_time_kst,
            }) => {
              if (this.lastCandleTime !== candle_date_time_kst) {
                ohlc.push({
                  x: timestamp,
                  y: [opening_price, high_price, low_price, trade_price],
                });
                volume.push({
                  x: timestamp,
                  y: candle_acc_trade_price,
                });
                this.candle[token].ohlc.pop();
                this.candle[token].volume.pop();
              }
              temp = candle_date_time_kst;
            }
          );
          this.lastCandleTime = temp;
          this.candle[token] = {
            ohlc: [...ohlc, ...this.candle[token].ohlc],
            volume: [...volume, ...this.candle[token].volume],
          };
        }, 1200);
      } catch (error) {console.error(error);}
    });
  };

  getInitCandle = () => this.candle;

  getCandleData = async function (
    token = "KRW-BTC",
    minutes = "5",
    count = 200
  ) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `https://api.upbit.com/v1/candles/minutes/${minutes}?market=` +
            `${token}` +
            `&count=${count}`
        )
        .then((res) => resolve({ data: res.data, token }))
        .catch((err) => reject(err));
    });
  };
}
class CoinData {
  constructor() {
    this.price = {};
    this.orderBook = {};
    this.list = [...COIN_LIST];
    this.ws = this.initSocket();
  }

  getInitPrice = () => this.price;

  updatePrice = function (ticker, data) {
    this.price[ticker] = data;
  };

  updateOrderBook = function (ticker, data) {
    this.orderBook[ticker] = data;
  };

  initSocket = function () {
    const ws = new WebSocket("wss://api.upbit.com/websocket/v1");

    ws.binaryType = "arraybuffer";

    const filterRequest = function () {
      const ticker = [...COIN_LIST];
      const addedKrwTicker = ticker.map((oneTicker) => `${oneTicker}`);
      const toJson = JSON.stringify(addedKrwTicker);
      const sendData = (toJson) =>
        `
    [ {"ticket":"UNIQUE_TICKET_ONE"},
      {"type":"ticker","codes": ${toJson}},
      {"type":"orderbook","codes":${toJson}}]`;

      if (ws === undefined) {
        alert("no connect exists");
        return;
      }
      ws.send(sendData(toJson));
    };

    ws.on("connection", function (e) {
      filterRequest();
    });

    ws.on("close", function (e) {
      filterRequest();
    });

    ws.on("open", function (e) {
      filterRequest();
    });
    return ws;
  };
}

const stringToJson = (e) => {
  const enc = new TextDecoder("utf-8");
  const arr = new Uint8Array(e);
  const str_d = enc.decode(arr);
  return JSON.parse(str_d);
};
const candleData = new CandleData();

const coinData = new CoinData();
coinData.initSocket();

coinData.ws.on("message", function (e) {
  const data = stringToJson(e);
  if (data.type === "ticker") {
    const {
      code,
      trade_price,
      change,
      change_rate,
      change_price,
      acc_trade_price_24h,
    } = data;
    const newData = {
      code,
      trade_price,
      change,
      change_rate,
      change_price,
      acc_trade_price_24h,
    };
    coinData.updatePrice(code, newData);
    tradeSocket.emit("price", newData);

    if (candleData.candle[code] !== undefined) {
      const newCoin = candleData.candle[code]?.ohlc;
      if (newCoin[0].x - newCoin[1].x > 40000) {
        const delOhlc = newCoin.shift();
        delOhlc.y[3] = trade_price;
        if (delOhlc.y[1] < trade_price) delOhlc.y[1] = trade_price;
        else if (delOhlc.y[2] > trade_price) delOhlc.y[2] = trade_price;
        const ohlc = [{ ...delOhlc, y: delOhlc.y }, ...newCoin];
        candleData.candle[code] = { ...candleData.candle[code], ohlc };
      } else {
        const delOhlc = newCoin[0];
        delOhlc.y[3] = trade_price;
        if (delOhlc.y[1] < trade_price) delOhlc.y[1] = trade_price;
        else if (delOhlc.y[2] > trade_price) delOhlc.y[2] = trade_price;
        const ohlc = [...newCoin];
        candleData.candle[code] = { ...candleData.candle[code], ohlc };
      }
      tradeSocket.emit("candle", candleData.candle);
    }
  }
  if (data.type === "orderbook") {
    const { code, orderbook_units, total_ask_size, total_bid_size } = data;
    const newData = {
      code,
      orderbook_units,
      total_ask_size,
      total_bid_size,
    };
    coinData.updateOrderBook(code, newData);
    tradeSocket.emit("order", newData);
  }
});

setInterval(async () => {
  await candleData.updateOneCandle();
  tradeSocket.emit("candle", candleData.candle);
  console.log(candleData.candle["KRW-BTC"].volume.length);
}, 12000);

module.exports = { coinData, candleData };
