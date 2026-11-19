import * as THREE from './vendor/three.module.min.js';

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i], [bx, by] = ring[j];
    if ((ay > lat) !== (by > lat) && lon < (bx - ax) * (lat - ay) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside;
}

export function createCountryLayer(countries, globe, radius, toVector) {
  const tooltip = document.createElement('div');
  tooltip.className = 'country-tooltip';
  tooltip.hidden = true;
  tooltip.setAttribute('aria-hidden', 'true');
  document.getElementById('globe-stage').append(tooltip);

  const allLines = [];
  const seen = new Set();
  const entries = countries.map(country => {
    const segments = [];
    const polygons = country.polygons.map(rings => {
      for (const ring of rings) {
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1], b = ring[i];
          if (Math.abs(a[0] - b[0]) > 180 || (Math.abs(a[0]) === 180 && a[0] === b[0])) continue;
          const key = [a.join(','), b.join(',')].sort().join('/');
          const unique = !seen.has(key);
          seen.add(key);
          const pieces = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.5));
          for (let step = 0; step < pieces; step++) {
            const points = [step, step + 1].flatMap(n => {
              const t = n / pieces;
              return toVector(a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t, radius * 1.013).toArray();
            });
            segments.push(...points);
            if (unique) allLines.push(...points);
          }
        }
      }
      const lons = rings[0].map(p => p[0]), lats = rings[0].map(p => p[1]);
      return { rings, west: Math.min(...lons), east: Math.max(...lons), south: Math.min(...lats), north: Math.max(...lats) };
    });
    return { country, polygons, segments };
  });

  const geometry = vertices => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const borders = new THREE.LineSegments(geometry(allLines), new THREE.LineBasicMaterial({
    color: '#435c48', transparent: true, opacity: .48, depthWrite: false
  }));
  const outline = new THREE.LineSegments(geometry([]), new THREE.LineBasicMaterial({ color: '#855027', depthWrite: false }));
  outline.scale.setScalar(1.002);
  outline.renderOrder = 2;
  globe.add(borders, outline);
  let selected;
  const ray = new THREE.Raycaster(), sphere = new THREE.Sphere(), hit = new THREE.Vector3();
  const pointer = new THREE.Vector2(), scale = new THREE.Vector3();

  function clear() {
    tooltip.hidden = true;
    outline.visible = false;
  }
  return {
    clear,
    update(cursor, rect, camera) {
      if (!cursor || !rect.width || !rect.height) return clear();
      const x = cursor.x - rect.left, y = cursor.y - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return clear();
      pointer.set(x / rect.width * 2 - 1, 1 - y / rect.height * 2);
      ray.setFromCamera(pointer, camera);
      globe.getWorldPosition(sphere.center);
      sphere.radius = radius * globe.getWorldScale(scale).x;
      if (!ray.ray.intersectSphere(sphere, hit)) return clear();
      globe.worldToLocal(hit).normalize();
      const lat = THREE.MathUtils.radToDeg(Math.asin(hit.y));
      const lon = THREE.MathUtils.radToDeg(Math.atan2(hit.x, hit.z));
      const entry = entries.find(item => item.polygons.some(({rings, west, east, south, north}) =>
        lon >= west && lon <= east && lat >= south && lat <= north &&
        pointInRing(lon, lat, rings[0]) && !rings.slice(1).some(r => pointInRing(lon, lat, r))
      ));
      if (!entry) return clear();
      if (entry !== selected) {
        selected = entry;
        outline.geometry.dispose();
        outline.geometry = geometry(entry.segments);
        tooltip.textContent = entry.country.name === entry.country.english
          ? entry.country.name : `${entry.country.name} · ${entry.country.english}`;
      }
      outline.visible = true;
      tooltip.hidden = false;
      const dx = x + tooltip.offsetWidth + 16 > rect.width ? -tooltip.offsetWidth - 12 : 14;
      const dy = y + tooltip.offsetHeight + 16 > rect.height ? -tooltip.offsetHeight - 12 : 14;
      tooltip.style.transform = `translate(${x + dx}px, ${y + dy}px)`;
    }
  };
}
