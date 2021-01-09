import * as d3 from 'd3';


export function railColor(feature) {
  const name = feature.properties["路線名"];

  // 東京メトロ
  if (name === "2号線日比谷線") return [181, 181, 173];
  if (name === "3号線銀座線") return [241, 154, 56];
  if (name === "4号線丸ノ内線" || name === "4号線丸ノ内線分岐線") return [226, 67, 64];
  if (name === "5号線東西線") return [68, 153, 187];
  if (name === "7号線南北線") return [77, 169, 155];
  if (name === "8号線有楽町線") return [189, 165, 119];
  if (name === "9号線千代田線") return [84, 184, 137];
  if (name === "11号線半蔵門線") return [139, 118, 208];
  if (name === "13号線副都心線") return [147, 97, 58];
  // 都営地下鉄
  if (name === "1号線浅草線") return [208, 78, 60];
  if (name === "6号線三田線") return [46, 106, 177];
  if (name === "10号線新宿線") return [179, 193, 70];
  if (name === "12号線大江戸線") return [182, 39, 93];

  // JR
  if (name === "山手線") return [154, 205, 50];
  if (name === "赤羽線（埼京線）" || name === "東北線（埼京線）") return [0, 172, 154];
  if (name === "東北線" || name === "根岸線") return [0, 178, 229]; // 京浜東北線は東北線でいいのか？
  if (name === "中央線" || name === "青梅線" || name === "五日市線") return [241, 90, 34];
  if (name === "総武線" || name === "南武線" || name === "鶴見線") return [255, 212, 0];
  if (name === "常磐線" || name === "成田線") return [0, 178, 97];
  if (name === "京葉線") return [201, 37, 47];
  if (name === "武蔵野線") return [241, 90, 34];
  if (name === "東海道線" || name === "伊東線" || name === "宇都宮線" || name === "高崎線") return [246, 139, 30];

  // 私鉄
  if (name === "京王線" || name === "競馬場線" || name === "高尾線" || name === "相模原線" || name === "動物園線") return [221, 0, 119];
  if (name === "井の頭線") return [0, 0, 136];
  if (name === "江ノ島線" || name === "小田原線" || name === "多摩線") return [34, 136, 204];

  // Other: default color
  return [150, 150, 150];
}


export function railDashArray(feature) {
  const company = feature.properties["運営会社"];

  if (company === "東日本旅客鉄道") return [3, 2]; // JR東日本

  // Default: not dashed
  return [1, 0];
}


export const colorInterpolates = {
  Turbo: d3.interpolateTurbo,
  Viridis: d3.interpolateViridis,
  Cividis: d3.interpolateCividis,
  Spectral: d3.interpolateSpectral,
  Inferno: d3.interpolateInferno
};
