document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* Boot sequence: plays once per session, any key or click skips */
  const boot = $("#boot"), log = $("#boot-log");
  let skip = calm || sessionStorage.getItem("booted");
  const endBoot = () => { boot.classList.add("off"); sessionStorage.setItem("booted", 1); startTerm(); };
  if (skip) { boot.classList.add("off"); } else {
    ["> initialising secure shell…", "> loading threat-intel modules ........ [ OK ]", "> mounting SIEM dashboards .............. [ OK ]",
     "> encrypting session .................. [ OK ]", "> ACCESS GRANTED — welcome, visitor"].reduce((p, l) => p.then(async () => {
      if (skip) return; log.textContent += l + "\n"; await wait(420);
    }), Promise.resolve()).then(() => !skip && wait(500).then(endBoot));
    const bail = () => { if (!skip) { skip = true; endBoot(); } };
    addEventListener("click", bail, { once: true }); addEventListener("keydown", bail, { once: true });
  }

  /* Matrix rain */
  const cv = $("#rain"), cx = cv.getContext("2d"), ch = "01アイウエオカキクケコ<>/#$%".split("");
  let cols = [], fs = 16;
  const size = () => { cv.width = innerWidth; cv.height = innerHeight; cols = Array(Math.ceil(innerWidth / fs)).fill(0).map(() => Math.random() * -50); };
  size(); addEventListener("resize", size);
  if (!calm) setInterval(() => {
    cx.fillStyle = "rgba(3,7,11,.12)"; cx.fillRect(0, 0, cv.width, cv.height);
    cx.font = fs + "px JetBrains Mono, monospace";
    cols.forEach((y, i) => {
      cx.fillStyle = Math.random() > .96 ? "#d8f3ff" : "#00e5ff";
      cx.fillText(ch[Math.floor(Math.random() * ch.length)], i * fs, y * fs);
      cols[i] = y * fs > cv.height && Math.random() > .975 ? 0 : y + 1;
    });
  }, 60);

  /* Cursor glow + 3D tilt */
  const glow = $(".glow");
  addEventListener("pointermove", e => { glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
  if (!calm) $$(".tilt").forEach(el => {
    el.addEventListener("pointermove", e => {
      const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      el.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* Rotating role typer */
  const roles = ["Cybersecurity Student", "SOC Analyst (L1) Candidate", "Blue Team Learner", "Threat Detection Enthusiast"], roleEl = $("#role");
  (async function type(i = 0) {
    const t = roles[i % roles.length];
    if (calm) { roleEl.textContent = roles[0]; return; }
    for (let n = 1; n <= t.length; n++) { roleEl.textContent = t.slice(0, n); await wait(60); }
    await wait(1600);
    for (let n = t.length; n >= 0; n--) { roleEl.textContent = t.slice(0, n); await wait(30); }
    type(i + 1);
  })();

  /* Hero terminal + clock */
  async function startTerm() {
    const out = $("#term"), P = '<span class="p">rajdeep@portfolio:~$</span> ';
    const steps = [["whoami", "Cybersecurity & IoT Engineering Student"], ["focus --areas", "SOC · SIEM · BLUE TEAM · VAPT"], ["tools --familiar", "Wazuh · Suricata · OpenCanary\nArcSight · Wireshark · Nmap"], ["status", "Observe · Detect · Investigate · Improve"]];
    let html = "";
    for (const [cmd, res] of steps) {
      for (let n = 0; n <= cmd.length; n++) { out.innerHTML = html + P + cmd.slice(0, n) + "▌"; if (!calm) await wait(45); }
      html += P + cmd + "\n" + res.replace(/&/g, "&amp;") + "\n"; out.innerHTML = html; if (!calm) await wait(350);
    }
    out.innerHTML = html + P + "▌";
  }
  if (skip) startTerm();
  const clock = $("#clock"); setInterval(() => { clock.textContent = new Date().toLocaleTimeString("en-GB"); }, 1000);

  /* Nav, filters, copy, year, reveal */
  const burger = $(".burger"), nav = $(".nav");
  burger.addEventListener("click", () => { const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
  $$("a", nav).forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  $$(".fb").forEach(b => b.addEventListener("click", () => {
    $$(".fb").forEach(x => x.classList.remove("on")); b.classList.add("on");
    $$(".pc").forEach(c => c.classList.toggle("hide", b.dataset.f !== "all" && c.dataset.c !== b.dataset.f));
  }));
  $(".copy").addEventListener("click", async e => {
    try { await navigator.clipboard.writeText("emailrajdeepmishra@gmail.com"); e.target.textContent = "COPIED"; } catch { e.target.textContent = "SELECT EMAIL"; }
    setTimeout(() => e.target.textContent = "COPY", 1600);
  });
  $("#year").textContent = new Date().getFullYear();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); } }), { threshold: .08 });
  $$(".panel,.strip,.sh").forEach(el => { el.classList.add("rv"); io.observe(el); });

  /* Tab router: #safe shows the Am I Safe view, everything else shows the portfolio */
  let scanned = false;
  const route = () => {
    const safe = location.hash === "#safe";
    $("#v-home").hidden = safe; $("#v-safe").hidden = !safe;
    $(".safe-tab").style.background = safe ? "rgba(57,255,156,.22)" : "";
    if (safe) { scrollTo(0, 0); if (!scanned) { scanned = true; scan(); } }
    else if (location.hash.length > 1) { const t = document.getElementById(location.hash.slice(1)); t && setTimeout(() => t.scrollIntoView(), 30); }
  };
  addEventListener("hashchange", route); route();

  /* Am I Safe: looked up in the visitor's browser only when this tab is opened. Nothing is stored. */
  function add(box, label, val, cls) {
    const d = document.createElement("div"), s = document.createElement("small"), b = document.createElement("b");
    s.textContent = label; b.textContent = val || "Unknown"; if (cls) b.className = cls; d.append(s, b); box.append(d);
  }
  async function scan() {
    const grid = $("#ipgrid"), msg = $("#scan-msg"), box = $("#scanbox"), sig = $("#sig");
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    add(sig, "Connection", location.protocol === "https:" ? "Encrypted (HTTPS)" : "Not encrypted (HTTP)", location.protocol === "https:" ? "ok" : "no");
    add(sig, "Device timezone", tz); add(sig, "Language", navigator.language);
    add(sig, "Screen", `${screen.width}×${screen.height}`);
    add(sig, "Do Not Track", navigator.doNotTrack === "1" ? "On" : "Off", navigator.doNotTrack === "1" ? "ok" : "no");
    add(sig, "Cookies", navigator.cookieEnabled ? "Enabled" : "Blocked", navigator.cookieEnabled ? "no" : "ok");
    try {
      const r = await fetch("https://ipwho.is/"), d = await r.json();
      if (!d.success) throw 0;
      msg.textContent = "Scan complete. This is what websites see:";
      add(grid, "Your public IP", d.ip, "no"); add(grid, "Location", [d.city, d.region, d.country].filter(Boolean).join(", "));
      add(grid, "Network provider", d.connection && (d.connection.isp || d.connection.org)); add(grid, "IP timezone", d.timezone && d.timezone.id);
      add(grid, "Approx. coordinates", d.latitude != null ? `${(+d.latitude).toFixed(2)}, ${(+d.longitude).toFixed(2)}` : "");
      add(grid, "IP type", d.type);
      $("#verdict").hidden = false;
      const same = d.timezone && d.timezone.id === tz;
      $("#advice").textContent = same ? "Hint: your device timezone matches this IP's location, so this is probably your real address." : "Hint: your device timezone differs from this IP's location, so you may already be using a VPN or proxy.";
      $$("[data-a]").forEach(b => b.addEventListener("click", () => {
        const yes = b.dataset.a === "yes", v = $("#verdict"), a = $("#advice");
        v.className = "panel verdict " + (yes ? "bad" : "good"); a.textContent = "";
        if (yes) { const s = document.createElement("b"); s.textContent = "You're exposed. "; a.append(s, "Anyone you connect to can see this address and your approximate location. Use a trusted, audited no-log VPN (avoid free ones), keep it on for public Wi-Fi, and combine it with HTTPS, 2FA and updated software.") }
        else a.textContent = "Good. A VPN or proxy seems to be masking your real address. Keep it on, and remember it hides your IP from sites but doesn't make you anonymous.";
      }));
    } catch { msg.textContent = "Lookup blocked. An ad-blocker or offline mode stopped the request. Your IP stays private to this page, so try again with it paused."; }
    box.classList.add("done");
  }
});
