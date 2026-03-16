const ZONES = {
  rain: {
    name: "雨城 · Melancholy Rain City",
    desc: "霓虹被细雨切碎，倒影像记忆里的对话。",
    tasks: ["聆听雨巷中的低语", "点亮旧车站霓虹", "拾取巷口记忆碎片"],
    narration: "雨城接受每个迟到的答案。你靠近时，街灯开始按心跳闪烁。",
  },
  lava: {
    name: "熔岩庭园 · Lava Garden",
    desc: "温热气浪裹着花粉，火光在石面上跳舞。",
    tasks: ["校准熔岩流向", "触发三次火花喷泉", "取回核心碎片"],
    narration: "你每一步都留下赤色光迹，像在改写沉睡中的地壳。",
  },
  ice: {
    name: "静海冰原 · Silent Ice Field",
    desc: "风穿过冰晶塔，折射成安静的鲸歌。",
    tasks: ["追踪远方鲸鸣", "激活冰镜阵列", "收集悬冰碎片"],
    narration: "冰面没有回声，只有你的呼吸在雪光里结晶。",
  },
  spire: {
    name: "塔影之都 · Neon Spire",
    desc: "垂直城邦在夜色中生长，轨道如同神经网络。",
    tasks: ["修复空中轨道", "破解广播塔频段", "夺回天台碎片"],
    narration: "城市正在做梦，而你是唯一能听懂它电流语言的人。",
  },
  sky: {
    name: "云上神殿 · Sky Shrine",
    desc: "漂浮石阶通往光门，钟声把云层荡成涟漪。",
    tasks: ["唤醒三座风铃", "通过云桥试炼", "拿到神殿碎片"],
    narration: "当你抬头，云海向两侧分开，像在给你的选择让路。",
  },
};

const state = {
  scale: 1,
  x: 0,
  y: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
  activeZone: null,
  shards: Number(localStorage.getItem("dream-shards") || 0),
};

const map = document.getElementById("map");
const viewport = document.getElementById("viewport");
const panel = document.getElementById("panel");
const zoneName = document.getElementById("zone-name");
const zoneDesc = document.getElementById("zone-desc");
const taskList = document.getElementById("task-list");
const narration = document.getElementById("narration");
const shardCount = document.getElementById("shard-count");
const collectBtn = document.getElementById("collect-btn");
const resetBtn = document.getElementById("reset-view");

function renderMapTransform() {
  map.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
}

function renderShardCount() {
  shardCount.textContent = `${state.shards}/3`;
}

function setActiveZone(zoneKey) {
  state.activeZone = zoneKey;
  const zone = ZONES[zoneKey];
  document.querySelectorAll(".zone").forEach((el) => {
    el.classList.toggle("active", el.dataset.zone === zoneKey);
  });

  zoneName.textContent = zone.name;
  zoneDesc.textContent = zone.desc;
  narration.textContent = zone.narration;
  taskList.innerHTML = zone.tasks
    .map((task, index) => `<li class="${index === 0 ? "done" : ""}">${task}</li>`)
    .join("");
  collectBtn.disabled = state.shards >= 3;
}

function flyToZone(button) {
  const rect = map.getBoundingClientRect();
  const b = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const targetX = centerX - (b.left + b.width / 2);
  const targetY = centerY - (b.top + b.height / 2);

  state.scale = 1.35;
  state.x += targetX * 0.6;
  state.y += targetY * 0.6;
  map.style.transition = "transform 550ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  renderMapTransform();
  setTimeout(() => {
    map.style.transition = "";
  }, 620);
}

map.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".zone")) return;
  state.dragging = true;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
  map.setPointerCapture(e.pointerId);
});

map.addEventListener("pointermove", (e) => {
  if (!state.dragging) return;
  const dx = e.clientX - state.lastX;
  const dy = e.clientY - state.lastY;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
  state.x += dx;
  state.y += dy;
  renderMapTransform();
});

map.addEventListener("pointerup", () => {
  state.dragging = false;
});

map.addEventListener("wheel", (e) => {
  e.preventDefault();
  const next = state.scale + (e.deltaY < 0 ? 0.08 : -0.08);
  state.scale = Math.min(1.8, Math.max(0.8, next));
  renderMapTransform();
});

document.querySelectorAll(".zone").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveZone(button.dataset.zone);
    flyToZone(button);
  });
});

collectBtn.addEventListener("click", () => {
  if (!state.activeZone || state.shards >= 3) return;
  state.shards += 1;
  localStorage.setItem("dream-shards", String(state.shards));
  renderShardCount();
  collectBtn.disabled = state.shards >= 3;
  collectBtn.textContent = state.shards >= 3 ? "碎片已收集完成" : "收集记忆碎片";
});

function resetView() {
  state.scale = 1;
  state.x = 0;
  state.y = 0;
  map.style.transition = "transform 420ms ease";
  renderMapTransform();
  setTimeout(() => {
    map.style.transition = "";
  }, 480);
  document.querySelectorAll(".zone").forEach((el) => el.classList.remove("active"));
  state.activeZone = null;
  zoneName.textContent = "选择一个梦境区域";
  zoneDesc.textContent = "拖拽探索地图，滚轮缩放，点击任意区域进入梦境。";
  narration.textContent = "你站在意识海的边缘。每次选择，都会改变世界颜色。";
  taskList.innerHTML = "";
  collectBtn.disabled = true;
}

resetBtn.addEventListener("click", resetView);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") resetView();
});

renderShardCount();
resetView();

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.style.scrollBehavior = "auto";
}
