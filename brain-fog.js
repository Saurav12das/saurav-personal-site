/* Brain Fog: progressive enhancements; the essay and sources work without JS. */
(function () {
  "use strict";
  const edition = document.querySelector("[data-issue]");
  if (!edition) return;
  const issueNumber = edition.dataset.issue;
  let toastTimer;
  const toast = (message) => {
    const box = document.querySelector(".toast");
    if (!box) return;
    box.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      box.textContent = "";
    }, 3500);
  };
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
  };
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  });
  if (tabs.length) selectTab(tabs[0]);

  const slider = document.getElementById("productivity");
  let mode = "output";
  const format = (n) => Number(n.toFixed(2)).toLocaleString("en-US");
  function updateLab() {
    const factor = Number(slider.value);
    const minimumHours = 8 / factor;
    const hours =
      mode === "time"
        ? minimumHours
        : mode === "both"
          ? (8 + minimumHours) / 2
          : 8;
    const output = (100 * factor * hours) / 8;
    document.getElementById("productivity-value").textContent =
      format(factor) + "×";
    document.getElementById("lab-output").textContent =
      format(output) + " units";
    document.getElementById("lab-hours").textContent = format(hours) + " hours";
    document.getElementById("output-fill").style.width =
      (output / 300) * 100 + "%";
    document.getElementById("hours-fill").style.width = (hours / 8) * 100 + "%";
    const explanation =
      mode === "output"
        ? `Keep the eight-hour day. At ${format(factor)}× productivity, output is ${format(output)} units.`
        : mode === "time"
          ? `Keep output at 100 units. The working day falls to ${format(hours)} hours, freeing ${format(8 - hours)} hours.`
          : `Take half the possible time saving: ${format(8 - hours)} hours freed, with output rising to ${format(output)} units.`;
    document.getElementById("lab-explanation").textContent = explanation;
  }
  slider.addEventListener("input", updateLab);
  document.querySelectorAll("[data-lab-mode]").forEach((button) =>
    button.addEventListener("click", () => {
      mode = button.dataset.labMode;
      document
        .querySelectorAll("[data-lab-mode]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      updateLab();
    }),
  );
  updateLab();

  const bookmark = document.getElementById("bookmark-button");
  const savedKey = `brain-fog:${issueNumber}:saved`;
  function renderBookmark(saved) {
    bookmark.textContent = saved ? "Edition saved ✓" : "Save edition";
    bookmark.setAttribute("aria-pressed", String(saved));
  }
  renderBookmark(storage.get(savedKey) === "true");
  bookmark.addEventListener("click", () => {
    const saved = bookmark.getAttribute("aria-pressed") !== "true";
    if (storage.set(savedKey, String(saved))) {
      renderBookmark(saved);
      toast(
        saved
          ? "Saved in this browser. Return to this edition anytime."
          : "Edition removed from saved.",
      );
    } else
      toast(
        "Browser storage is unavailable. You can bookmark this page instead.",
      );
  });
  document.querySelectorAll("[data-share]").forEach((button) =>
    button.addEventListener("click", async () => {
      const url = document.querySelector('link[rel="canonical"]').href;
      try {
        if (!navigator.clipboard || !window.isSecureContext)
          throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(url);
        toast("Edition link copied. Ready to share.");
      } catch {
        const dialog = document.getElementById("share-dialog");
        const field = document.getElementById("share-url");
        field.value = url;
        dialog.showModal();
        field.select();
      }
    }),
  );
  document
    .getElementById("print-button")
    .addEventListener("click", () => window.print());
  const note = document.getElementById("reader-note");
  const noteKey = `brain-fog:${issueNumber}:note`;
  const noteStatus = document.getElementById("note-status");
  note.value = storage.get(noteKey) || "";
  if (note.value)
    noteStatus.textContent = "Saved on this browser. Nothing is sent.";
  note.addEventListener("input", () => {
    const ok = storage.set(noteKey, note.value);
    noteStatus.textContent = ok
      ? "Saved on this browser. Nothing is sent."
      : "Storage unavailable. Download your note to keep it.";
  });
  document.getElementById("download-note").addEventListener("click", () => {
    if (!note.value.trim()) {
      note.focus();
      toast("Write a thought first, then download your note.");
      return;
    }
    const content =
      `BRAIN FOG — ISSUE ${issueNumber}\n${document.querySelector("h1").textContent.trim().replace(/\s+/g, " ")}\n${document.querySelector('link[rel="canonical"]').href}\n\nMY FIELD NOTE\n\n` +
      note.value +
      "\n";
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `brain-fog-${issueNumber}-my-note.txt`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Your note is ready to keep.");
  });
  const progress = document.querySelector(".reading-progress");
  let scheduled = false;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.width =
      (scrollable > 0
        ? Math.min(100, Math.max(0, (scrollY / scrollable) * 100))
        : 100) + "%";
    scheduled = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateProgress);
      }
    },
    { passive: true },
  );
  addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const hash = "#" + visible[0].target.id;
        document.querySelectorAll(".contents a").forEach((a) => {
          if (a.getAttribute("href") === hash)
            a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
    );
    document
      .querySelectorAll(".chapter")
      .forEach((section) => observer.observe(section));
  }
})();
