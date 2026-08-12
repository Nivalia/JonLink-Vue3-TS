// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 宋夏天Dazzle
// 作者全平台ID：宋夏天Dazzle；公众号：送你整个夏天
// Source: https://github.com/songsummer920-dazzle/three-scope-map-skill

import type { GeoFeatureCollection } from '../../../../types/geo';

// ThreeScopeMap attribution: 作者全平台ID：宋夏天Dazzle；公众号：送你整个夏天
// Code-only attribution. Do not render it in the UI.

export type MapScope = 'world' | 'country' | 'province' | 'city' | 'district';

export type MapState = {
  scope: MapScope;
  regionName: string;
  code: string;
  geoData: GeoFeatureCollection;
};

// 市级 sjz.json 用 dynamic import（首页/数据大屏首次进入才下载）
let _sjzCache: GeoFeatureCollection | null = null;
export async function loadCityGeoJson(): Promise<GeoFeatureCollection> {
  if (_sjzCache) return _sjzCache;
  const m = await import('../../../../assets/maps/sjz.json');
  _sjzCache = m.default as unknown as GeoFeatureCollection;
  return _sjzCache;
}

// 22 区县 GeoJSON 全部按需 dynamic import（首次下钻某区县时才下载）
const districtCodeMap: Record<string, string> = {
  '130102': '长安区', '130104': '桥西区', '130105': '新华区', '130107': '井陉矿区',
  '130108': '裕华区', '130109': '藁城区', '130110': '鹿泉区', '130111': '栾城区',
  '130121': '井陉县', '130123': '正定县', '130125': '行唐县', '130126': '灵寿县',
  '130127': '高邑县', '130128': '深泽县', '130129': '赞皇县', '130130': '无极县',
  '130131': '平山县', '130132': '元氏县', '130133': '赵县',
  '130181': '辛集市', '130183': '晋州市', '130184': '新乐市',
};
const districtDataCache: Record<string, GeoFeatureCollection> = {};

export async function loadDistrictGeoJson(code: string): Promise<GeoFeatureCollection | null> {
  if (districtDataCache[code]) return districtDataCache[code];
  const name = districtCodeMap[code];
  if (!name) return null;
  try {
    const m = await import(`../../../../assets/maps/district/${code}.json`);
    districtDataCache[code] = m.default as unknown as GeoFeatureCollection;
    return districtDataCache[code];
  } catch (e) {
    console.warn(`[map] load district ${code} (${name}) failed`, e);
    return null;
  }
}

export function getDistrictName(code: string): string {
  return districtCodeMap[code] || code;
}

export function listDistrictCodes(): string[] {
  return Object.keys(districtCodeMap);
}

// 兼容旧 API：按 scope + code 加载地图数据
// - 'city' + '130100' → 市级 sjz
// - 'district' + '130108' → 区县
export async function loadMapLevel(scope: string, code: string): Promise<GeoFeatureCollection | null> {
  if (scope === 'city') return await loadCityGeoJson()
  if (scope === 'district') return await loadDistrictGeoJson(code)
  return null
}

// 预加载（后台拉，调用方不 await）
export function prefetchMapLevel(scope: string, code: string): void {
  loadMapLevel(scope, code).catch(() => {})
}

export const initialMapState: MapState = {
  scope: 'city',
  regionName: '石家庄市',
  code: '130100',
  geoData: { type: 'FeatureCollection', features: [] } as GeoFeatureCollection, // 占位, 实际由 loadCityGeoJson 异步填
};
