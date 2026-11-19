const REFRESH_MS = 15 * 60 * 1000;
const WEATHER = {
  1: ['少云', 'fair'], 2: ['多云', 'cloud'], 3: ['阴', 'overcast'],
  45: ['雾', 'fog'], 48: ['冻雾', 'frost-fog'],
  51: ['小毛毛雨', 'drizzle'], 53: ['毛毛雨', 'drizzle'], 55: ['密集毛毛雨', 'drizzle'],
  56: ['轻度冻毛毛雨', 'freezing'], 57: ['强冻毛毛雨', 'freezing'],
  61: ['小雨', 'rain'], 63: ['中雨', 'rain'], 65: ['大雨', 'rain'],
  66: ['轻度冻雨', 'freezing'], 67: ['强冻雨', 'freezing'],
  71: ['小雪', 'snow'], 73: ['中雪', 'snow'], 75: ['大雪', 'snow'], 77: ['雪粒', 'grains'],
  80: ['小阵雨', 'rain'], 81: ['阵雨', 'rain'], 82: ['强阵雨', 'rain'],
  85: ['小阵雪', 'snow'], 86: ['强阵雪', 'snow'],
  95: ['雷阵雨', 'storm'], 96: ['雷暴伴冰雹', 'hail'], 99: ['雷暴伴强冰雹', 'hail']
};
const PARTICLES = { drizzle: 8, freezing: 10, rain: 12, storm: 14, snow: 8, grains: 10, hail: 9 };
const HEAVY_CODES = new Set([55, 57, 65, 67, 75, 82, 86, 99]);

export function describeWeather(code, day) {
  if (code === 0) return [day ? '晴' : '晴夜', day ? 'sun' : 'moon'];
  return WEATHER[code] || ['天气未知', 'unknown'];
}

function renderWeatherScene(node, kind, code, day) {
  const scene = `${kind}-${code}-${day}`;
  if (node.dataset.scene === scene) return;
  node.dataset.scene = scene;
  node.dataset.weather = kind;
  node.dataset.day = String(day);
  node.replaceChildren();
  const add = (className, parent = node) => {
    const shape = document.createElement('span');
    shape.className = className;
    parent.append(shape);
    return shape;
  };
  if (['sun', 'moon', 'fair'].includes(kind)) add('weather-orb');
  if (kind === 'sun' || kind === 'moon' || kind === 'unknown') return;
  if (kind === 'fog' || kind === 'frost-fog') {
    add('weather-mist');
    return;
  }
  const cloud = add('weather-cloud');
  for (let i = 0; i < 3; i++) add('weather-cloud-lobe', cloud);
  if (kind === 'storm' || kind === 'hail') add('weather-lightning');
  if (!PARTICLES[kind]) return;
  const fall = add('weather-precipitation');
  const count = PARTICLES[kind] + (HEAVY_CODES.has(code) ? 5 : 0);
  for (let i = 0; i < count; i++) {
    const particle = add('weather-particle', fall);
    particle.style.setProperty('--x', `${5 + (i * 37 % 90)}%`);
    particle.style.setProperty('--delay', `${-(i * .127)}s`);
    particle.style.setProperty('--duration', `${(kind === 'snow' ? 1.75 : .48) + (i % 5) * .09}s`);
    particle.style.setProperty('--rest', `${(i * 7 % 21)}px`);
  }
}

export function createWeatherLayer(stage, cities) {
  const layer = document.createElement('div');
  layer.className = 'weather-layer';
  layer.setAttribute('aria-hidden', 'true');
  stage.append(layer);
  const nodes = new Map();
  const readings = new Map();
  const status = document.getElementById('city-weather');
  let currentCity, updated = 0, busy = false;
  function showCity(city) {
    currentCity = city;
    const reading = readings.get(city.id);
    const wind = reading?.windy ? ` · ${reading.windLabel}` : '';
    status.textContent = reading ? `${city.name} · ${reading.label} · ${reading.temp} °C${wind}` : '天气暂未获取';
    status.title = reading ? `Open-Meteo · ${reading.time} UTC` : '';
  }
  for (const city of cities) {
    const node = document.createElement('span');
    node.className = 'city-weather-effect';
    node.hidden = true;
    layer.append(node);
    nodes.set(city.id, node);
  }
  async function refresh() {
    if (busy || Date.now() - updated < REFRESH_MS) return;
    busy = true;
    try {
      const query = new URLSearchParams({
        latitude: cities.map(city => city.lat).join(','),
        longitude: cities.map(city => city.lon).join(','),
        current: 'temperature_2m,weather_code,is_day,wind_speed_10m,wind_gusts_10m',
        wind_speed_unit: 'kmh',
        timezone: 'GMT'
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, {signal: AbortSignal.timeout(12000)});
      if (!response.ok) throw Error(`Weather HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length !== cities.length) throw Error('Incomplete city weather response');
      data.forEach(({ current }, i) => {
        if (!Number.isFinite(current?.weather_code) || !Number.isFinite(current.temperature_2m)) return;
        const city = cities[i];
        const [label, kind] = describeWeather(current.weather_code, current.is_day);
        const {wind_speed_10m: speed, wind_gusts_10m: gust} = current;
        const windy = speed >= 39 || gust >= 50;
        const windLabel = speed >= 39 ? `大风 ${Math.round(speed)} km/h` : `阵风 ${Math.round(gust)} km/h`;
        readings.set(city.id, { label, temp: Math.round(current.temperature_2m), time: current.time, windy, windLabel });
        const node = nodes.get(city.id);
        node.dataset.windy = String(windy);
        renderWeatherScene(node, kind, current.weather_code, current.is_day);
      });
      if (currentCity) showCity(currentCity);
      updated = Date.now();
    } catch (error) {
      console.warn('City weather unavailable', error);
    } finally { busy = false; }
  }
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  return {
    showCity,
    position(markers, selected) {
      const shown = [];
      for (const marker of [...markers].sort((a, b) => Number(b.city === selected) - Number(a.city === selected))) {
        const { city, screenPoint } = marker;
        const node = nodes.get(city.id);
        const overlaps = screenPoint && shown.some(point =>
          Math.abs(point.x - screenPoint.x) < 60 && Math.abs(point.y - screenPoint.y) < 46
        );
        node.hidden = !screenPoint || !readings.has(city.id) || overlaps;
        if (!node.hidden) {
          shown.push(screenPoint);
          node.style.transform = `translate(${screenPoint.x - 60}px, ${screenPoint.y - 43}px)`;
        }
      }
    }
  };
}
