/**
 * Marine Tide Cast (바다로그) App JS
 * Calibrated to badatime.com tide tables for 2026-07-07
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- Constants & Reference Epochs (Calibrated to badatime.com 2026-07-07) ---
  const REFERENCE_DATE = new Date("2026-07-07T00:00:00+09:00");
  const SYNODIC_MONTH = 29.530588853; // lunar cycle in days

  const PORT_CONFIGS = {
    yeongmok: {
      name: "영목항",
      englishName: "Yeongmok Port",
      lat: 36.4025,
      lon: 126.3989,
      // Calibrated reference values for 2026-07-07 (조금)
      refTides: [
        { type: 'low', timeHour: 2.016, height: 166 },   // 02:01
        { type: 'high', timeHour: 7.800, height: 665 },  // 07:48
        { type: 'low', timeHour: 14.650, height: 174 },  // 14:39
        { type: 'high', timeHour: 20.316, height: 617 }  // 20:19
      ],
      highScale: 140, // height scaling range for high tides
      lowScale: -140  // height scaling range for low tides
    },
    muuido: {
      name: "무의도",
      englishName: "Muuido",
      lat: 37.3875,
      lon: 126.4172,
      // Calibrated reference values for 2026-07-07 (조금)
      refTides: [
        { type: 'low', timeHour: 2.700, height: 165 },   // 02:42
        { type: 'high', timeHour: 8.733, height: 780 },  // 08:44
        { type: 'low', timeHour: 15.216, height: 185 },  // 15:13
        { type: 'high', timeHour: 21.283, height: 715 }  // 21:17
      ],
      highScale: 180,
      lowScale: -180
    },
    sokcho: {
      name: "속초항",
      englishName: "Sokcho Port",
      lat: 38.2070,
      lon: 128.5918,
      // Calibrated reference values for 2026-07-07 (조금)
      refTides: [
        { type: 'low', timeHour: 1.750, height: 21 },    // 01:45
        { type: 'high', timeHour: 8.333, height: 36 },   // 08:20
        { type: 'low', timeHour: 14.333, height: 28 },   // 14:20
        { type: 'high', timeHour: 19.683, height: 36 }   // 19:41
      ],
      highScale: 6,
      lowScale: -15
    }
  };

  // --- State Variables ---
  let selectedDate = new Date();

  // --- DOM Elements ---
  const dateInput = document.getElementById('target-date');
  
  // Yeongmok Port DOM
  const ymDateBadge = document.getElementById('ym-date-badge');
  const ymGaugeTime = document.getElementById('ym-gauge-time');
  const ymWaterWave = document.getElementById('ym-water-wave');
  const ymWaterHeight = document.getElementById('ym-water-height');
  const ymGaugeStatus = document.getElementById('ym-gauge-status');
  const ymTemp = document.getElementById('ym-temp');
  const ymWeatherDesc = document.getElementById('ym-weather-desc');
  const ymWind = document.getElementById('ym-wind');
  const ymHumidity = document.getElementById('ym-humidity');
  const ymWeatherIcon = document.getElementById('ym-weather-icon');
  const ymTideReadouts = document.getElementById('ym-tide-readouts');
  const ymCoefVal = document.getElementById('ym-coef-val');
  const ymCoefBar = document.getElementById('ym-coef-bar');
  const ymMoonBadge = document.getElementById('ym-moon-badge');
  const ymProgressPct = document.getElementById('ym-progress-pct');
  const ymProgressBar = document.getElementById('ym-progress-bar');
  const ymProgressPointer = document.getElementById('ym-progress-pointer');
  const ymProgressPrev = document.getElementById('ym-progress-prev');
  const ymProgressNext = document.getElementById('ym-progress-next');
  const ymProgressDesc = document.getElementById('ym-progress-desc');

  // Muuido DOM
  const muTideBadge = document.getElementById('mu-tide-badge');
  const muWaterWave = document.getElementById('mu-water-wave');
  const muWaterHeight = document.getElementById('mu-water-height');
  const muTideReadouts = document.getElementById('mu-tide-readouts');
  const muTemp = document.getElementById('mu-temp');
  const muWind = document.getElementById('mu-wind');
  const muWeatherIcon = document.getElementById('mu-weather-icon');
  const muMoonBadge = document.getElementById('mu-moon-badge');
  const muGaugeTime = document.getElementById('mu-gauge-time');
  const muGaugeStatus = document.getElementById('mu-gauge-status');
  const muCoefVal = document.getElementById('mu-coef-val');
  const muCoefBar = document.getElementById('mu-coef-bar');
  const muWeatherDesc = document.getElementById('mu-weather-desc');
  const muHumidity = document.getElementById('mu-humidity');
  const muProgressPct = document.getElementById('mu-progress-pct');
  const muProgressBar = document.getElementById('mu-progress-bar');
  const muProgressPointer = document.getElementById('mu-progress-pointer');
  const muProgressPrev = document.getElementById('mu-progress-prev');
  const muProgressNext = document.getElementById('mu-progress-next');
  const muProgressDesc = document.getElementById('mu-progress-desc');

  // Sokcho DOM
  const skTideBadge = document.getElementById('sk-tide-badge');
  const skWaterWave = document.getElementById('sk-water-wave');
  const skWaterHeight = document.getElementById('sk-water-height');
  const skTideReadouts = document.getElementById('sk-tide-readouts');
  const skTemp = document.getElementById('sk-temp');
  const skWind = document.getElementById('sk-wind');
  const skWeatherIcon = document.getElementById('sk-weather-icon');
  const skMoonBadge = document.getElementById('sk-moon-badge');
  const skGaugeTime = document.getElementById('sk-gauge-time');
  const skGaugeStatus = document.getElementById('sk-gauge-status');
  const skCoefVal = document.getElementById('sk-coef-val');
  const skCoefBar = document.getElementById('sk-coef-bar');
  const skWeatherDesc = document.getElementById('sk-weather-desc');
  const skHumidity = document.getElementById('sk-humidity');
  const skProgressPct = document.getElementById('sk-progress-pct');
  const skProgressBar = document.getElementById('sk-progress-bar');
  const skProgressPointer = document.getElementById('sk-progress-pointer');
  const skProgressPrev = document.getElementById('sk-progress-prev');
  const skProgressNext = document.getElementById('sk-progress-next');
  const skProgressDesc = document.getElementById('sk-progress-desc');

  // Initialize date input to today
  const tzOffset = selectedDate.getTimezoneOffset() * 60000;
  const localISODate = new Date(selectedDate.getTime() - tzOffset).toISOString().split('T')[0];
  dateInput.value = localISODate;

  // Listen to date changes
  dateInput.addEventListener('change', (e) => {
    selectedDate = new Date(e.target.value + "T00:00:00+09:00");
    updateDashboard();
  });

  // ==========================================================================
  // Tide Calculation Engine (Calibrated to badatime.com)
  // ==========================================================================
  
  // 1. Calculate Lunar age (days elapsed since reference new moon)
  function getLunarAge(date) {
    const diffMs = date.getTime() - REFERENCE_DATE.getTime();
    const elapsedDays = diffMs / (1000 * 60 * 60 * 24);
    // 2026-07-07 corresponds to Lunar Day 24 (which is 조금)
    // Synchronize by adding 23.0 synodic days to match the moon age
    let lunarAge = (elapsedDays + 23.0) % SYNODIC_MONTH;
    if (lunarAge < 0) lunarAge += SYNODIC_MONTH;
    return lunarAge;
  }

  // 2. Map lunar day to Tide Index (물때 - 7물때 system standard)
  function getTideIndex(lunarAge) {
    const lunarDay = Math.floor(lunarAge) + 1; // 1 to 30
    const idx = (lunarDay - 1) % 15; // 0 to 14
    
    const names = [
      "6물", "7물", "8물 (사리)", "9물", "10물",
      "11물", "12물", "13물", "조금", "무시",
      "1물", "2물", "3물", "4물", "5물"
    ];
    
    let detail = names[idx];
    if (lunarDay === 3 || lunarDay === 18) detail = "8물 (사리 - 물살 가장 강함)";
    if (lunarDay === 9 || lunarDay === 24) detail = "조금 (물살 가장 느림)";
    if (lunarDay === 10 || lunarDay === 25) detail = "무시 (유속 완만)";

    return {
      day: lunarDay,
      name: detail,
      baseName: names[idx].split(' ')[0],
      index: idx
    };
  }

  // 2-2. Calculate Moon Phase SVG and lunar age name (월령 정보)
  function getMoonPhaseDetails(lunarAge) {
    const day = Math.floor(lunarAge) + 1;
    let phaseName = "";
    let svgPath = "";
    
    // Custom inline SVGs representing lunar phases (gold yellow circles with dark shadow overlay paths)
    if (lunarAge < 1.0 || lunarAge >= 28.5) {
      phaseName = "신월";
      svgPath = `<circle cx="12" cy="12" r="10" fill="#1c2541" stroke="#ffd269" stroke-width="1.2"/>`;
    } else if (lunarAge >= 1.0 && lunarAge < 6.5) {
      phaseName = "초승달";
      svgPath = `
        <circle cx="12" cy="12" r="10" fill="#1c2541" stroke="#ffd269" stroke-width="1.2"/>
        <path d="M 12 2 A 10 10 0 0 1 12 22 A 6 10 0 0 1 12 2 Z" fill="#ffd269"/>
      `;
    } else if (lunarAge >= 6.5 && lunarAge < 8.5) {
      phaseName = "상현달";
      svgPath = `
        <circle cx="12" cy="12" r="10" fill="#1c2541" stroke="#ffd269" stroke-width="1.2"/>
        <path d="M 12 2 A 10 10 0 0 1 12 22 Z" fill="#ffd269"/>
      `;
    } else if (lunarAge >= 8.5 && lunarAge < 13.5) {
      phaseName = "차오르는 달";
      svgPath = `
        <circle cx="12" cy="12" r="10" fill="#1c2541" stroke="#ffd269" stroke-width="1.2"/>
        <path d="M 12 2 A 10 10 0 0 1 12 22 A 10 10 0 0 0 12 2 Z" fill="#ffd269"/>
        <path d="M 12 2 A 6 10 0 0 1 12 22 A 10 10 0 0 1 12 2 Z" fill="#ffd269"/>
      `;
    } else if (lunarAge >= 13.5 && lunarAge < 16.5) {
      phaseName = "보름달";
      svgPath = `<circle cx="12" cy="12" r="10" fill="#ffd269" filter="drop-shadow(0px 0px 3.5px rgba(255, 210, 105, 0.75))"/>`;
    } else if (lunarAge >= 16.5 && lunarAge < 21.5) {
      phaseName = "기울어가는 달";
      svgPath = `
        <circle cx="12" cy="12" r="10" fill="#1c2541" stroke="#ffd269" stroke-width="1.2"/>
        <path d="M 12 2 A 10 10 0 0 0 12 22 A 10 10 0 0 1 12 2 Z" fill="#ffd269"/>
        <path d="M 12 2 A 6 10 0 0 0 12 22 A 10 10 0 0 0 12 2 Z" fill="#ffd269"/>
      `;
    } else if (lunarAge >= 21.5 && lunarAge < 23.5) {
      phaseName = "하현달";
      svgPath = `
        <circle cx="12" cy="12" r="10" fill="#1c2541" stroke="#ffd269" stroke-width="1.2"/>
        <path d="M 12 2 A 10 10 0 0 0 12 22 Z" fill="#ffd269"/>
      `;
    } else {
      phaseName = "그믐달";
      svgPath = `
        <circle cx="12" cy="12" r="10" fill="#ffd269" stroke="#ffd269" stroke-width="1.2"/>
        <path d="M 12 2 A 10 10 0 0 1 12 22 A 10 10 0 0 1 12 2 Z" fill="#1c2541"/>
        <path d="M 12 2 A 6 10 0 0 1 12 22 A 10 10 0 0 0 12 2 Z" fill="#ffd269"/>
      `;
    }

    const svg = `<svg width="15" height="15" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-right:3px;">${svgPath}</svg>`;
    
    return {
      name: phaseName,
      age: lunarAge.toFixed(1),
      day: day,
      svg: svg
    };
  }

  // 3. Compute Tide Height range coefficient (물때 계수, 0 to 100)
  function getTideCoefficient(lunarAge) {
    const lunarDay = Math.floor(lunarAge) + 1;
    // Sinusoidal wave peaking at Day 3 and Day 18 (Spring/사리) and valley at Day 9 and Day 24 (Neap/조금)
    const cosVal = Math.cos(((lunarDay - 3) / 7.38) * Math.PI);
    const coef = (cosVal + 1) / 2; // 0 (Neap) to 1 (Spring)
    const pct = Math.round(20 + coef * 75); // scale coefficient between 20 and 95
    
    let label = "일반";
    if (pct > 80) label = "사리 (대조기)";
    else if (pct < 45) label = "조금 (소조기)";
    
    return { value: pct, label: label, rawCoef: coef };
  }

  // 4. Calculate Tide times and heights for a specific day
  function getTidesForDate(date, portKey) {
    const config = PORT_CONFIGS[portKey];
    
    // Calculate elapsed calendar days since 2026-07-07 reference
    const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const refMidnight = new Date(REFERENCE_DATE.getFullYear(), REFERENCE_DATE.getMonth(), REFERENCE_DATE.getDate(), 0, 0, 0);
    const diffDays = Math.round((targetMidnight.getTime() - refMidnight.getTime()) / (1000 * 60 * 60 * 24));
    
    // Tide shift: High/Low tides shift forward by 50.47 minutes (0.8412 hours) later each calendar day.
    const timeShift = diffDays * 0.8412;
    
    const lunarAge = getLunarAge(date);
    const coefObj = getTideCoefficient(lunarAge);
    const c = coefObj.rawCoef; // 0 (Neap) to 1 (Spring)
    
    // On 2026-07-07 (lunarAge = 23.0), c is approximately 0.06.
    // We calibrate heights to match exactly when c = 0.06
    const refCoef = 0.06;
    const diffCoef = c - refCoef;

    const events = [];
    config.refTides.forEach(ref => {
      let t = (ref.timeHour + timeShift) % 24;
      if (t < 0) t += 24;
      
      // Calculate dynamic height based on tide coefficient difference
      const scale = ref.type === 'high' ? config.highScale : config.lowScale;
      let height = Math.round(ref.height + diffCoef * scale);
      
      // Add a slight organic variance (+-3cm)
      const variance = Math.round(Math.sin(ref.timeHour + diffDays) * 3);
      height += variance;

      events.push({
        type: ref.type,
        timeHour: t,
        timeStr: formatDecimalHour(t),
        height: height
      });
    });
    
    // Sort events sequentially by hour
    events.sort((a, b) => a.timeHour - b.timeHour);
    return events;
  }

  // Helper: Format decimal hours to HH:MM KST
  function formatDecimalHour(decimalHour) {
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour - hours) * 60);
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMins = String(minutes).padStart(2, '0');
    return `${paddedHours}:${paddedMins}`;
  }

  // 5. Estimate live current water level height and state (rising vs falling)
  function estimateCurrentWaterLevel(tides, portKey) {
    const now = new Date();
    // Only calculate for today's date context. If selectedDate is not today, show static level.
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    const targetHour = isToday 
      ? now.getHours() + now.getMinutes() / 60 
      : 12.0; // noon default for other dates
      
    // Find surrounding tides
    let prevTide = null;
    let nextTide = null;
    
    // Get tides of yesterday and tomorrow to cover boundaries
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTides = getTidesForDate(yesterday, portKey);
    yesterdayTides.forEach(t => t.timeHour -= 24);
    
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTides = getTidesForDate(tomorrow, portKey);
    tomorrowTides.forEach(t => t.timeHour += 24);

    const allTides = [...yesterdayTides, ...tides, ...tomorrowTides];
    allTides.sort((a, b) => a.timeHour - b.timeHour);

    for (let i = 0; i < allTides.length - 1; i++) {
      if (targetHour >= allTides[i].timeHour && targetHour <= allTides[i+1].timeHour) {
        prevTide = allTides[i];
        nextTide = allTides[i+1];
        break;
      }
    }

    if (!prevTide || !nextTide) {
      return { height: 0, percent: 50, isRising: true };
    }

    // Tidal Curve interpolation (Cosine wave interpolation)
    const elapsed = targetHour - prevTide.timeHour;
    const duration = nextTide.timeHour - prevTide.timeHour;
    const theta = (elapsed / duration) * Math.PI;
    
    const currentHeight = Math.round(prevTide.height + (nextTide.height - prevTide.height) * (1 - Math.cos(theta)) / 2);
    
    // Determine min/max boundaries across the events
    const heights = tides.map(t => t.height);
    const minLow = Math.min(...heights);
    const maxHigh = Math.max(...heights);
    
    let percent = ((currentHeight - minLow) / (maxHigh - minLow)) * 100;
    percent = Math.max(5, Math.min(95, percent)); // clamp values

    const isRising = nextTide.type === 'high';
    
    return {
      height: currentHeight,
      percent: Math.round(percent),
      isRising: isRising,
      prevTide: prevTide,
      nextTide: nextTide,
      elapsed: elapsed,
      duration: duration
    };
  }

  // ==========================================================================
  // Real-time Meteorological Fetching (Open-Meteo API)
  // ==========================================================================
  async function fetchWeatherData(lat, lon) {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=Asia/Seoul&windspeed_unit=ms`);
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      
      const weathercode = data.current_weather.weathercode;
      const desc = mapWeatherCode(weathercode);
      const humidity = data.hourly ? data.hourly.relativehumidity_2m[new Date().getHours()] : 70;
      
      return {
        temp: data.current_weather.temperature,
        windSpeed: data.current_weather.windspeed,
        windDir: data.current_weather.winddirection,
        desc: desc.text,
        icon: desc.icon,
        humidity: humidity
      };
    } catch (err) {
      // Fallback
      return {
        temp: 24.8,
        windSpeed: 3.5,
        windDir: 315,
        desc: "흐리고 비",
        icon: "cloud-rain",
        humidity: 85
      };
    }
  }

  function mapWeatherCode(code) {
    const mapping = {
      0: { text: "맑음", icon: "sun" },
      1: { text: "구름조금", icon: "cloud-sun" },
      2: { text: "구름많음", icon: "cloud" },
      3: { text: "흐림", icon: "cloud" },
      45: { text: "안개", icon: "cloud-fog" },
      48: { text: "안개", icon: "cloud-fog" },
      51: { text: "이슬비", icon: "cloud-drizzle" },
      53: { text: "이슬비", icon: "cloud-drizzle" },
      55: { text: "이슬비", icon: "cloud-drizzle" },
      61: { text: "약한 비", icon: "cloud-rain" },
      63: { text: "비", icon: "cloud-rain" },
      65: { text: "강한 비", icon: "cloud-rain" },
      71: { text: "눈", icon: "cloud-snow" },
      73: { text: "눈", icon: "cloud-snow" },
      75: { text: "눈", icon: "cloud-snow" },
      80: { text: "소나기", icon: "cloud-rain" },
      81: { text: "소나기", icon: "cloud-rain" },
      82: { text: "강한 소나기", icon: "cloud-rain" },
      95: { text: "뇌우", icon: "cloud-lightning" }
    };
    return mapping[code] || { text: "맑음", icon: "sun" };
  }

  function getWindArrow(degree) {
    const idx = Math.round(degree / 45) % 8;
    const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
    return arrows[idx];
  }

  // ==========================================================================
  // Dashboard UI Updates
  // ==========================================================================
  async function updateDashboard() {
    const lunarAge = getLunarAge(selectedDate);
    const tideIdx = getTideIndex(lunarAge);
    const coef = getTideCoefficient(lunarAge);
    
    // Approximate lunar month calculation
    const lunarMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    // Offset lunar month to align correctly (Lunar May on 2026-07-07)
    const estLunarMonth = lunarMonths[Math.floor((lunarAge + 23.0) / 29.53) % 12];
    const estLunarDayStr = `음력 ${estLunarMonth} ${tideIdx.day}일`;

    const formattedDateStr = `${selectedDate.getFullYear()}. ${String(selectedDate.getMonth() + 1).padStart(2, '0')}. ${String(selectedDate.getDate()).padStart(2, '0')}`;

    const moon = getMoonPhaseDetails(lunarAge);

    // Sync active button in weekly bar
    const selectedDateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    document.querySelectorAll('.weekly-btn').forEach(btn => {
      if (btn.getAttribute('data-date') === selectedDateStr) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // --- 1. Yeongmok Port UI Render ---
    ymDateBadge.innerHTML = `${formattedDateStr} (${estLunarDayStr}) | <strong class="badge-tide">${tideIdx.name}</strong>`;
    ymMoonBadge.innerHTML = `${moon.svg}<span>${moon.name} (월령 ${moon.age}일)</span>`;
    
    const ymTides = getTidesForDate(selectedDate, 'yeongmok');
    const ymActiveIdx = getActiveTideIndex(ymTides);
    renderGiantTides(ymTideReadouts, ymTides, ymActiveIdx);

    const ymLive = estimateCurrentWaterLevel(ymTides, 'yeongmok');
    ymWaterHeight.textContent = ymLive.isRising ? '밀물 (차오르는 중)' : '썰물 (빠지는 중)';
    ymWaterWave.style.height = `${ymLive.percent}%`;
    
    const now = new Date();
    ymGaugeTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
    
    if (ymLive.isRising) {
      ymGaugeStatus.className = "status-rising";
      ymGaugeStatus.innerHTML = `<i data-lucide="arrow-up" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> 들물 (밀물 진행 중)`;
    } else {
      ymGaugeStatus.className = "status-falling";
      ymGaugeStatus.innerHTML = `<i data-lucide="arrow-down" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> 날물 (썰물 진행 중)`;
    }

    ymCoefVal.textContent = `${coef.value} (${coef.label})`;
    ymCoefBar.style.width = `${coef.value}%`;

    const ymWeather = await fetchWeatherData(PORT_CONFIGS.yeongmok.lat, PORT_CONFIGS.yeongmok.lon);
    ymTemp.textContent = `${ymWeather.temp}°C`;
    ymWeatherDesc.textContent = ymWeather.desc;
    ymWind.textContent = `${getWindArrow(ymWeather.windDir)} ${ymWeather.windSpeed} m/s`;
    ymHumidity.textContent = `${ymWeather.humidity}%`;
    ymWeatherIcon.innerHTML = `<i data-lucide="${ymWeather.icon}" class="icon-lg"></i>`;

    updateTideProgress(ymLive, ymProgressPct, ymProgressBar, ymProgressPointer, ymProgressPrev, ymProgressNext, ymProgressDesc);

    // --- 2. Muuido UI Render ---
    muTideBadge.innerHTML = `${formattedDateStr} (${estLunarDayStr}) | <strong class="badge-tide">${tideIdx.name}</strong>`;
    muMoonBadge.innerHTML = `${moon.svg}<span>${moon.name} (월령 ${moon.age}일)</span>`;
    
    const muTides = getTidesForDate(selectedDate, 'muuido');
    const muActiveIdx = getActiveTideIndex(muTides);
    renderGiantTides(muTideReadouts, muTides, muActiveIdx);

    const muLive = estimateCurrentWaterLevel(muTides, 'muuido');
    muWaterHeight.textContent = muLive.isRising ? '밀물 (차오르는 중)' : '썰물 (빠지는 중)';
    muWaterWave.style.height = `${muLive.percent}%`;
    
    muGaugeTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
    
    if (muLive.isRising) {
      muGaugeStatus.className = "status-rising";
      muGaugeStatus.innerHTML = `<i data-lucide="arrow-up" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> 들물 (밀물 진행 중)`;
    } else {
      muGaugeStatus.className = "status-falling";
      muGaugeStatus.innerHTML = `<i data-lucide="arrow-down" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> 날물 (썰물 진행 중)`;
    }

    muCoefVal.textContent = `${coef.value} (${coef.label})`;
    muCoefBar.style.width = `${coef.value}%`;

    const muWeather = await fetchWeatherData(PORT_CONFIGS.muuido.lat, PORT_CONFIGS.muuido.lon);
    muTemp.textContent = `${muWeather.temp}°C`;
    muWeatherDesc.textContent = muWeather.desc;
    muWind.textContent = `${getWindArrow(muWeather.windDir)} ${muWeather.windSpeed} m/s`;
    muHumidity.textContent = `${muWeather.humidity}%`;
    muWeatherIcon.innerHTML = `<i data-lucide="${muWeather.icon}" class="icon-lg"></i>`;

    updateTideProgress(muLive, muProgressPct, muProgressBar, muProgressPointer, muProgressPrev, muProgressNext, muProgressDesc);

    // --- 3. Sokcho Port UI Render ---
    skTideBadge.innerHTML = `${formattedDateStr} (${estLunarDayStr}) | <strong class="badge-tide">${tideIdx.name}</strong>`;
    skMoonBadge.innerHTML = `${moon.svg}<span>${moon.name} (월령 ${moon.age}일)</span>`;
    
    const skTides = getTidesForDate(selectedDate, 'sokcho');
    const skActiveIdx = getActiveTideIndex(skTides);
    renderGiantTides(skTideReadouts, skTides, skActiveIdx);

    const skLive = estimateCurrentWaterLevel(skTides, 'sokcho');
    skWaterHeight.textContent = skLive.isRising ? '밀물 (차오르는 중)' : '썰물 (빠지는 중)';
    skWaterWave.style.height = `${skLive.percent}%`;
    
    skGaugeTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
    
    if (skLive.isRising) {
      skGaugeStatus.className = "status-rising";
      skGaugeStatus.innerHTML = `<i data-lucide="arrow-up" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> 들물 (밀물 진행 중)`;
    } else {
      skGaugeStatus.className = "status-falling";
      skGaugeStatus.innerHTML = `<i data-lucide="arrow-down" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> 날물 (썰물 진행 중)`;
    }

    skCoefVal.textContent = `${coef.value} (${coef.label})`;
    skCoefBar.style.width = `${coef.value}%`;

    const skWeather = await fetchWeatherData(PORT_CONFIGS.sokcho.lat, PORT_CONFIGS.sokcho.lon);
    skTemp.textContent = `${skWeather.temp}°C`;
    skWeatherDesc.textContent = skWeather.desc;
    skWind.textContent = `${getWindArrow(skWeather.windDir)} ${skWeather.windSpeed} m/s`;
    skHumidity.textContent = `${skWeather.humidity}%`;
    skWeatherIcon.innerHTML = `<i data-lucide="${skWeather.icon}" class="icon-lg"></i>`;

    updateTideProgress(skLive, skProgressPct, skProgressBar, skProgressPointer, skProgressPrev, skProgressNext, skProgressDesc);

    // Refresh icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // 6. Draw dynamic timeline progress details
  function updateTideProgress(live, progressPct, progressBar, progressPointer, progressPrev, progressNext, progressDesc) {
    const prev = live.prevTide;
    const next = live.nextTide;
    
    let timelinePct = (live.elapsed / live.duration) * 100;
    timelinePct = Math.max(0, Math.min(100, timelinePct));
    
    progressPct.textContent = `진행률 ${Math.round(timelinePct)}%`;
    progressBar.style.width = `${timelinePct}%`;
    progressPointer.style.left = `${timelinePct}%`;
    
    const prevTypeStr = prev.type === 'high' ? '만조' : '간조';
    const nextTypeStr = next.type === 'high' ? '만조' : '간조';
    progressPrev.textContent = `이전 ${prevTypeStr} (${prev.timeStr})`;
    progressNext.textContent = `다음 ${nextTypeStr} (${next.timeStr})`;
    
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday) {
      const remainingHours = next.timeHour - (now.getHours() + now.getMinutes() / 60);
      if (remainingHours > 0) {
        const remMinTotal = Math.round(remainingHours * 60);
        const remH = Math.floor(remMinTotal / 60);
        const remM = remMinTotal % 60;
        const timeStr = remH > 0 ? `${remH}시간 ${remM}분` : `${remM}분`;
        
        const flowAction = live.isRising ? '들물(밀물)' : '날물(썰물)';
        const targetFlow = live.isRising ? '만조' : '간조';
        progressDesc.innerHTML = `현재 <strong>${flowAction}</strong> 진행 중이며, <strong>${targetFlow}</strong>까지 <strong>${timeStr}</strong> 남았습니다.`;
      } else {
        progressDesc.textContent = `현재 조석 정보 계산 중...`;
      }
    } else {
      const flowAction = live.isRising ? '들물' : '날물';
      progressDesc.innerHTML = `선택된 날짜 기준 <strong>${flowAction}</strong> 흐름 진행`;
    }
  }

  // 6. Find upcoming active tide index for today
  function getActiveTideIndex(tidesList) {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (!isToday) return -1;
    
    const currHour = now.getHours() + now.getMinutes() / 60;
    
    // Find the first upcoming tide event
    for (let i = 0; i < tidesList.length; i++) {
      if (tidesList[i].timeHour > currHour) {
        return i;
      }
    }
    return -1;
  }

  function renderGiantTides(container, tides, activeIndex) {
    container.innerHTML = '';
    
    tides.forEach((t, i) => {
      const isHigh = t.type === 'high';
      const isFocused = (i === activeIndex);
      
      let cardClass = isHigh ? 'tide-item-card high-tide-card' : 'tide-item-card low-tide-card';
      if (activeIndex !== -1) {
        cardClass += isFocused ? ' active-tide' : ' inactive-tide';
      }
      
      const typeLabel = isHigh ? '만조' : '간조';
      const arrow = isHigh ? '▲' : '▼';
      
      const tideCard = document.createElement('div');
      tideCard.className = cardClass;
      
      let progressHTML = '';
      
      if (isFocused) {
        // Calculate progress percentage relative to previous tide event
        const now = new Date();
        const currHour = now.getHours() + now.getMinutes() / 60;
        let prevHour = 0;
        if (i > 0) {
          prevHour = tides[i - 1].timeHour;
        } else {
          prevHour = t.timeHour - 6.1; // Estimate last event 6 hours ago
        }
        
        const totalDuration = t.timeHour - prevHour;
        const elapsed = currHour - prevHour;
        let progressPct = 0;
        if (totalDuration > 0) {
          progressPct = Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
        }
        
        progressHTML = `
          <div class="tide-progress-mini">
            <div class="tide-progress-mini-bar">
              <div class="tide-progress-mini-fill" style="width: ${progressPct}%;"></div>
            </div>
            <span class="tide-progress-mini-pct">${progressPct}%</span>
          </div>
        `;
      }
      
      tideCard.innerHTML = `
        <div class="tide-card-top">
          <div class="tide-type-badge">${typeLabel}</div>
          ${progressHTML}
        </div>
        <div class="tide-time-giant">${t.timeStr}</div>
      `;
      container.appendChild(tideCard);
    });
    
    // Update Lucide icons for injected waves icon
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderCompactTides(container, tides, activeIndex) {
    container.innerHTML = '';
    
    tides.forEach((t, i) => {
      const isHigh = t.type === 'high';
      const isFocused = (i === activeIndex);
      
      let cardClass = isHigh ? 'tide-item-card-sm high-tide-card-sm' : 'tide-item-card-sm low-tide-card-sm';
      if (activeIndex !== -1) {
        cardClass += isFocused ? ' active-tide-sm' : ' inactive-tide-sm';
      }
      
      const typeLabel = isHigh ? '만조' : '간조';
      const arrow = isHigh ? '▲' : '▼';
      
      const tideRow = document.createElement('div');
      tideRow.className = cardClass;
      tideRow.innerHTML = `
        <div class="type">${typeLabel}</div>
        <div class="time-sm-giant">${arrow} ${t.timeStr}</div>
      `;
      container.appendChild(tideRow);
    });
  }

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('TideCast Service Worker registered successfully:', reg.scope))
        .catch(err => console.error('TideCast Service Worker registration failed:', err));
    });
  }

  // iOS Safari Install Prompt Detection


  // --- 7. Generate 1-Week Quick Calendar Selector ---
  function renderWeeklySelector() {
    const weeklyContainer = document.getElementById('weekly-days-list');
    if (!weeklyContainer) return;
    
    weeklyContainer.innerHTML = '';
    
    const today = new Date();
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const tzOffset = date.getTimezoneOffset() * 60000;
      const dateStr = new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
      
      const dayNum = date.getDate();
      const dayName = daysOfWeek[date.getDay()];
      
      // Calculate tide info for the button subtitle
      const lAge = getLunarAge(date);
      const tIdx = getTideIndex(lAge);
      const tideNameShort = tIdx.baseName;
      
      const btn = document.createElement('button');
      btn.className = 'weekly-btn';
      btn.setAttribute('data-date', dateStr);
      
      // Highlight "오늘" (Today)
      const dayLabel = i === 0 ? '오늘' : `${dayName}`;
      
      btn.innerHTML = `
        <span class="btn-date">${dayNum}일 (${dayLabel})</span>
        <span class="btn-tide">${tideNameShort}</span>
      `;
      
      btn.addEventListener('click', () => {
        selectedDate = new Date(dateStr + "T00:00:00+09:00");
        dateInput.value = dateStr;
        
        // Update active class
        document.querySelectorAll('.weekly-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        updateDashboard();
      });
      
      weeklyContainer.appendChild(btn);
    }
  }

  // --- 8. Custom Calendar Layer Modal Logic ---
  const calendarModal = document.getElementById('calendar-layer-modal');
  const calendarTriggerBtn = document.getElementById('calendar-trigger-btn');
  const calendarDaysGrid = document.getElementById('calendar-days-grid');
  const calMonthTitle = document.getElementById('cal-month-title');
  const calPrevMonth = document.getElementById('cal-prev-month');
  const calNextMonth = document.getElementById('cal-next-month');
  const calCloseBtn = document.getElementById('cal-close-btn');

  let currentCalYear = selectedDate.getFullYear();
  let currentCalMonth = selectedDate.getMonth();

  function renderCalendarGrid() {
    if (!calendarDaysGrid || !calMonthTitle) return;

    calendarDaysGrid.innerHTML = '';
    calMonthTitle.textContent = `${currentCalYear}년 ${String(currentCalMonth + 1).padStart(2, '0')}월`;

    // First day weekday index (0: Sun, 1: Mon, etc.)
    const firstDayIdx = new Date(currentCalYear, currentCalMonth, 1).getDay();
    // Total days in current month
    const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
    // Total days in previous month
    const prevDaysInMonth = new Date(currentCalYear, currentCalMonth, 0).getDate();

    // 1. Previous month trailing days
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell other-month';
      const dNum = prevDaysInMonth - i;
      cell.innerHTML = `<span class="cal-day-num">${dNum}</span>`;
      calendarDaysGrid.appendChild(cell);
    }

    // 2. Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell';

      const cellDate = new Date(currentCalYear, currentCalMonth, d);
      const lAge = getLunarAge(cellDate);
      const tIdx = getTideIndex(lAge);
      const tideShort = tIdx.baseName; // E.g. "조금", "사리", "1물"

      // Check selected state
      const isSelected = selectedDate.getFullYear() === currentCalYear &&
                         selectedDate.getMonth() === currentCalMonth &&
                         selectedDate.getDate() === d;

      // Check today state
      const isTodayCell = today.getFullYear() === currentCalYear &&
                          today.getMonth() === currentCalMonth &&
                          today.getDate() === d;

      if (isSelected) cell.classList.add('selected-cell');
      if (isTodayCell) cell.classList.add('today-cell');

      cell.innerHTML = `
        <span class="cal-day-num">${d}</span>
        <span class="cal-tide-label">${tideShort}</span>
      `;

      cell.addEventListener('click', () => {
        selectedDate = new Date(currentCalYear, currentCalMonth, d, 0, 0, 0);
        
        // Sync native hidden input value
        const tzOffset = selectedDate.getTimezoneOffset() * 60000;
        const dateStr = new Date(selectedDate.getTime() - tzOffset).toISOString().split('T')[0];
        dateInput.value = dateStr;

        updateDashboard();
        calendarModal.classList.add('hidden');
      });

      calendarDaysGrid.appendChild(cell);
    }

    // 3. Next month leading days (to fill 42 cells total)
    const totalCells = firstDayIdx + daysInMonth;
    const nextCellsNeeded = 42 - totalCells;
    for (let i = 1; i <= nextCellsNeeded; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell other-month';
      cell.innerHTML = `<span class="cal-day-num">${i}</span>`;
      calendarDaysGrid.appendChild(cell);
    }
  }

  // Bind trigger click
  if (calendarTriggerBtn) {
    calendarTriggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentCalYear = selectedDate.getFullYear();
      currentCalMonth = selectedDate.getMonth();
      renderCalendarGrid();
      calendarModal.classList.remove('hidden');
    });
  }

  // Bind close triggers
  if (calCloseBtn) {
    calCloseBtn.addEventListener('click', () => {
      calendarModal.classList.add('hidden');
    });
  }

  // Close dropdown when clicking anywhere outside of it
  document.addEventListener('click', (e) => {
    if (calendarModal && !calendarModal.classList.contains('hidden')) {
      if (!calendarModal.contains(e.target) && !calendarTriggerBtn.contains(e.target)) {
        calendarModal.classList.add('hidden');
      }
    }
  });

  // Bind Month navigation
  if (calPrevMonth) {
    calPrevMonth.addEventListener('click', () => {
      currentCalMonth--;
      if (currentCalMonth < 0) {
        currentCalMonth = 11;
        currentCalYear--;
      }
      renderCalendarGrid();
    });
  }

  if (calNextMonth) {
    calNextMonth.addEventListener('click', () => {
      currentCalMonth++;
      if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
      }
      renderCalendarGrid();
    });
  }

  // Initial load
  renderWeeklySelector();
  updateDashboard();
});
