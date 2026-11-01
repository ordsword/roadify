import fs from "fs";
import path from "path";
import { INITIAL_ROADMAPS } from "../src/presets/initialData";
const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
const DATA_DIR = process.env.ROADIFY_DATA_DIR || path.join(currentDir, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "roadmaps.json");
const subscribers = /* @__PURE__ */ new Set();
function subscribeToStore(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
function broadcast(event, data) {
  for (const cb of subscribers) {
    try {
      cb(event, data);
    } catch (e) {
      console.error("Error notifying store subscriber:", e);
    }
  }
}
class Store {
  roadmaps = [];
  constructor() {
    this.init();
  }
  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, "utf-8");
        this.roadmaps = JSON.parse(content);
      } else {
        this.roadmaps = [];
        this.save();
      }
    } catch (err) {
      console.warn("Failed to load roadmaps from disk, starting empty:", err);
      this.roadmaps = [];
    }
  }
  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.roadmaps, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save roadmaps to disk:", err);
    }
  }
  clearAll() {
    this.roadmaps = [];
    this.save();
    broadcast("roadmaps_cleared", {});
  }
  loadTemplate() {
    this.roadmaps = JSON.parse(JSON.stringify(INITIAL_ROADMAPS));
    this.save();
    broadcast("template_loaded", this.roadmaps);
  }
  importRoadmaps(imported) {
    const list = Array.isArray(imported) ? imported : [imported];
    for (const item of list) {
      const idx = this.roadmaps.findIndex((r) => r.id === item.id);
      if (idx !== -1) {
        this.roadmaps[idx] = item;
      } else {
        this.roadmaps.push(item);
      }
    }
    this.save();
    broadcast("roadmaps_imported", this.roadmaps);
    return this.roadmaps;
  }
  getAllRoadmaps() {
    return this.roadmaps;
  }
  getRoadmapById(id) {
    return this.roadmaps.find((r) => r.id === id);
  }
  createRoadmap(title, description = "", author = "User") {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `rm-${Date.now()}`;
    const newRoadmap = {
      id: id + "-" + Math.floor(Math.random() * 1e3),
      title,
      description,
      author,
      created: (/* @__PURE__ */ new Date()).toISOString(),
      updated: (/* @__PURE__ */ new Date()).toISOString(),
      canvasState: { panX: 100, panY: 100, zoom: 1 },
      stages: [],
      connections: []
    };
    this.roadmaps.push(newRoadmap);
    this.save();
    broadcast("roadmap_created", newRoadmap);
    return newRoadmap;
  }
  updateRoadmap(id, updates) {
    const rm = this.getRoadmapById(id);
    if (!rm) return null;
    Object.assign(rm, updates, { updated: (/* @__PURE__ */ new Date()).toISOString() });
    this.save();
    broadcast("roadmap_updated", rm);
    return rm;
  }
  deleteRoadmap(id) {
    const index = this.roadmaps.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.roadmaps.splice(index, 1);
    this.save();
    broadcast("roadmap_deleted", { id });
    return true;
  }
  addStage(roadmapId, stageData) {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return null;
    const newStage = {
      id: stageData.id || `stage-${Date.now()}`,
      roadmapId,
      title: stageData.title || "\u041D\u043E\u0432\u044B\u0439 \u044D\u0442\u0430\u043F",
      tag: stageData.tag || "\u042D\u0422\u0410\u041F",
      description: stageData.description || "",
      status: stageData.status || "planned",
      deadline: stageData.deadline || "\u0411\u0435\u0437 \u0441\u0440\u043E\u043A\u0430",
      priority: stageData.priority || "medium",
      x: stageData.x ?? 300,
      y: stageData.y ?? 200,
      width: stageData.width || 480,
      collapsed: false,
      taskGroups: stageData.taskGroups || [
        {
          id: `grp-${Date.now()}`,
          title: "\u041F\u043E\u0434\u0437\u0430\u0434\u0430\u0447\u0438",
          collapsed: false,
          tasks: []
        }
      ]
    };
    rm.stages.push(newStage);
    rm.updated = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    broadcast("stage_added", { roadmapId, stage: newStage });
    return newStage;
  }
  updateStage(stageId, updates) {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find((s) => s.id === stageId);
      if (stage) {
        Object.assign(stage, updates);
        rm.updated = (/* @__PURE__ */ new Date()).toISOString();
        this.save();
        broadcast("stage_updated", { roadmapId: rm.id, stage });
        return stage;
      }
    }
    return null;
  }
  deleteStage(stageId) {
    for (const rm of this.roadmaps) {
      const idx = rm.stages.findIndex((s) => s.id === stageId);
      if (idx !== -1) {
        rm.stages.splice(idx, 1);
        rm.connections = rm.connections.filter((c) => c.fromStageId !== stageId && c.toStageId !== stageId);
        rm.updated = (/* @__PURE__ */ new Date()).toISOString();
        this.save();
        broadcast("stage_deleted", { roadmapId: rm.id, stageId });
        return true;
      }
    }
    return false;
  }
  addTaskGroup(stageId, title) {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find((s) => s.id === stageId);
      if (stage) {
        const group = {
          id: `grp-${Date.now()}`,
          title,
          collapsed: false,
          tasks: []
        };
        stage.taskGroups.push(group);
        rm.updated = (/* @__PURE__ */ new Date()).toISOString();
        this.save();
        broadcast("stage_updated", { roadmapId: rm.id, stage });
        return group;
      }
    }
    return null;
  }
  addSubtask(stageId, groupId, taskData) {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find((s) => s.id === stageId);
      if (stage) {
        let group = stage.taskGroups.find((g) => g.id === groupId);
        if (!group) {
          if (stage.taskGroups.length === 0) {
            stage.taskGroups.push({ id: `grp-${Date.now()}`, title: "\u041F\u043E\u0434\u0437\u0430\u0434\u0430\u0447\u0438", tasks: [] });
          }
          group = stage.taskGroups[0];
        }
        const task = {
          id: taskData.id || `task-${Date.now()}`,
          title: taskData.title || "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430",
          completed: !!taskData.completed,
          priority: taskData.priority || "normal",
          badge: taskData.badge
        };
        group.tasks.push(task);
        rm.updated = (/* @__PURE__ */ new Date()).toISOString();
        this.save();
        broadcast("stage_updated", { roadmapId: rm.id, stage });
        return task;
      }
    }
    return null;
  }
  toggleSubtask(stageId, taskId) {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find((s) => s.id === stageId);
      if (stage) {
        for (const grp of stage.taskGroups) {
          const t = grp.tasks.find((x) => x.id === taskId);
          if (t) {
            t.completed = !t.completed;
            const allTasks = stage.taskGroups.flatMap((g) => g.tasks);
            if (allTasks.length > 0 && allTasks.every((task) => task.completed)) {
              stage.status = "done";
            } else if (allTasks.some((task) => task.completed) && stage.status === "planned") {
              stage.status = "in_progress";
            }
            rm.updated = (/* @__PURE__ */ new Date()).toISOString();
            this.save();
            broadcast("stage_updated", { roadmapId: rm.id, stage });
            return true;
          }
        }
      }
    }
    return false;
  }
  updateSubtask(stageId, taskId, updates) {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find((s) => s.id === stageId);
      if (stage) {
        for (const grp of stage.taskGroups) {
          const t = grp.tasks.find((x) => x.id === taskId);
          if (t) {
            Object.assign(t, updates);
            rm.updated = (/* @__PURE__ */ new Date()).toISOString();
            this.save();
            broadcast("stage_updated", { roadmapId: rm.id, stage });
            return t;
          }
        }
      }
    }
    return null;
  }
  deleteSubtask(stageId, taskId) {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find((s) => s.id === stageId);
      if (stage) {
        for (const grp of stage.taskGroups) {
          const idx = grp.tasks.findIndex((x) => x.id === taskId);
          if (idx !== -1) {
            grp.tasks.splice(idx, 1);
            rm.updated = (/* @__PURE__ */ new Date()).toISOString();
            this.save();
            broadcast("stage_updated", { roadmapId: rm.id, stage });
            return true;
          }
        }
      }
    }
    return false;
  }
  addConnection(roadmapId, connectionData) {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return null;
    if (!connectionData.fromStageId || !connectionData.toStageId) return null;
    const exists = rm.connections.some(
      (c) => c.fromStageId === connectionData.fromStageId && c.toStageId === connectionData.toStageId
    );
    if (exists) return null;
    const newConn = {
      id: connectionData.id || `link-${Date.now()}`,
      fromStageId: connectionData.fromStageId,
      toStageId: connectionData.toStageId,
      label: connectionData.label || "",
      color: connectionData.color || "#6366f1",
      style: connectionData.style || "curved"
    };
    rm.connections.push(newConn);
    rm.updated = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    broadcast("connection_added", { roadmapId, connection: newConn });
    return newConn;
  }
  deleteConnection(roadmapId, connectionId) {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return false;
    const idx = rm.connections.findIndex((c) => c.id === connectionId);
    if (idx === -1) return false;
    rm.connections.splice(idx, 1);
    rm.updated = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    broadcast("connection_deleted", { roadmapId, connectionId });
    return true;
  }
  autoLayout(roadmapId, direction = "horizontal") {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return false;
    const stages = rm.stages;
    if (stages.length === 0) return true;
    if (direction === "horizontal") {
      const SPACING_X = 580;
      const SPACING_Y = 580;
      let col = 0;
      let row = 0;
      const MAX_COLS = 4;
      stages.forEach((stage, idx) => {
        stage.x = 80 + idx % MAX_COLS * SPACING_X;
        stage.y = 80 + Math.floor(idx / MAX_COLS) * SPACING_Y;
      });
    } else {
      const SPACING_Y = 480;
      stages.forEach((stage, idx) => {
        stage.x = 100;
        stage.y = 80 + idx * SPACING_Y;
      });
    }
    rm.updated = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    broadcast("roadmap_updated", rm);
    return true;
  }
  exportMarkdown(roadmapId) {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return "# \u0414\u043E\u0440\u043E\u0436\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430";
    let md = `# \u{1F5FA}\uFE0F \u0414\u043E\u0440\u043E\u0436\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430: ${rm.title}

`;
    if (rm.description) md += `> ${rm.description}

`;
    md += `**\u0410\u0432\u0442\u043E\u0440:** ${rm.author} | **\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:** ${new Date(rm.updated).toLocaleString()}

`;
    md += `---

`;
    const totalTasks = rm.stages.reduce((acc, s) => acc + s.taskGroups.reduce((a, g) => a + g.tasks.length, 0), 0);
    const completedTasks = rm.stages.reduce((acc, s) => acc + s.taskGroups.reduce((a, g) => a + g.tasks.filter((t) => t.completed).length, 0), 0);
    const pct = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
    md += `### \u{1F4CA} \u041E\u0431\u0449\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441: ${completedTasks} / ${totalTasks} \u0437\u0430\u0434\u0430\u0447 (${pct}%)

`;
    for (const stage of rm.stages) {
      const stageTasks = stage.taskGroups.flatMap((g) => g.tasks);
      const stageDone = stageTasks.filter((t) => t.completed).length;
      const statusEmoji = stage.status === "done" ? "\u2705" : stage.status === "in_progress" ? "\u{1F504}" : "\u23F3";
      md += `## ${statusEmoji} [${stage.tag}] ${stage.title}
`;
      md += `* **\u0421\u0442\u0430\u0442\u0443\u0441:** ${stage.status} | **\u0421\u0440\u043E\u043A:** ${stage.deadline} | **\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442:** ${stage.priority}
`;
      md += `* **\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441:** ${stageDone} \u0438\u0437 ${stageTasks.length}
`;
      if (stage.description) md += `* **\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:** ${stage.description}
`;
      md += `
`;
      for (const group of stage.taskGroups) {
        if (group.title) md += `### \u{1F4C1} ${group.title}
`;
        for (const task of group.tasks) {
          const check = task.completed ? "[x]" : "[ ]";
          const p = task.priority === "critical" ? " \u{1F525}" : task.priority === "high" ? " \u26A1" : "";
          md += `- ${check} ${task.title}${p}
`;
        }
        md += `
`;
      }
      md += `---

`;
    }
    if (rm.connections.length > 0) {
      md += `### \u{1F517} \u0417\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 \u0438 \u0441\u0432\u044F\u0437\u0438
`;
      for (const conn of rm.connections) {
        const from = rm.stages.find((s) => s.id === conn.fromStageId)?.title || conn.fromStageId;
        const to = rm.stages.find((s) => s.id === conn.toStageId)?.title || conn.toStageId;
        md += `- **${from}** \u2794 **${to}** ${conn.label ? `_(${conn.label})_` : ""}
`;
      }
      md += `
`;
    }
    return md;
  }
}
const store = new Store();
export {
  broadcast,
  store,
  subscribeToStore
};
