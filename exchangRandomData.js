const randomDatas = {};

const EXCHANGE = {
  서울거래소: "EXC_SEOUL",
  인천거래소: "EXC_INCHEON",
  세종거래소: "EXC_SEJONG",
  대전거래소: "EXC_DAEJEON",
  강원거래소: "EXC_GANGWON",
  광주거래소: "EXC_GWANGJU",
  부산거래소: "EXC_BUSAN",
  울산거래소: "EXC_ULSAN",
  대구거래소: "EXC_DAEGU",
};

const basedDatas = [
  { ticker: "PAPE_NEWS", data: [136, 0.0, -6.6, 11.0, 0.7, 6.6, -4.4, -2.2] },
  {
    ticker: "PAPE_BOAD",
    data: [97, 1.0, -9.3, -18.6, -22.7, -9.3, -13.4, -17.5],
  },
  { ticker: "FLAK_PE", data: [694, 1.7, 3.7, -2.9, 2.9, 2.0, 4.2, 3.6] },
  { ticker: "FLAK_PP", data: [604, -6.8, -12.1, -0.8, -1.7, -4.3, 1.0, -7.8] },
  { ticker: "PELL_PE", data: [850, -4.7, 2.2, -2.0, -12.6, 6.7, -0.6, -2.5] },
  { ticker: "PELL_PP", data: [752, -1.7, 2.8, -1.9, -2.9, -0.5, -1.3, -2.5] },
  { ticker: "EPS_ING", data: [903, 20.8, 11.6, 13.4, 18.6, 14.0, 4.1, 8.0] },
  { ticker: "COMP_PET", data: [439, 7.1, 3.0, 0.9, 7.7, -2.5, -19.6, -1.8] },
  { ticker: "COMP_PE", data: [484, 4.1, -7.2, 2.1, 1.0, -7.6, -12.6, -8.9] },
  { ticker: "COMP_PP", data: [437, 4.6, -10.8, 1.6, 30.9, -10.8, -9.6, -10.5] },
  {
    ticker: "GLSSB_CULLET_WHITE",
    data: [71, 28.2, 11.3, 1.4, -1.4, -4.2, -18.3, 21.1],
  },
  {
    ticker: "GLSSB_CULLET_BROWN",
    data: [42, 38.1, 38.1, 7.1, -4.8, -19.0, -2.4],
  },
  {
    ticker: "GLSSB_CULLET_GREEN",
    data: [29, 31.0, 20.7, 17.2, 10.3, 3.4, 17.2],
  },
  { ticker: "MTAL_SCRP", data: [368, 0.8, 3.0, 2.7, 4.9, -14.9, 0.3, 13.6] },
  { ticker: "MTAL_CAN", data: [282, 2.1, -2.8, 9.6, 0.7, -16.3, 6.4, 1.1] },
  {
    ticker: "MTAL_ALCAN",
    data: [1339, -6.0, -4.6, -2.2, -4.7, -8.4, -5.8, -2.8],
  },
  { ticker: "TIRE_POWD", data: [250, -4.0, 8.0, 4.4] },
];

const randoms = Object.keys(EXCHANGE).map((key, idx) => {
  randomDatas[key].data = basedDatas[idx];
});

console.log(randomDatas);
