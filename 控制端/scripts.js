// 全局变量
let currentCase = "";
let currentStage = "";
let currentSpeaker = "";
let focusPoints = [];

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function () {
  // 加载案件列表
  loadCaseList();

  // 绑定事件
  bindEvents();
});

// 加载案件列表
function loadCaseList() {
  // 实际应用中应该从服务器获取案件列表
  // 这里模拟一些案件
  const cases = ["李某诉何某、施工方、保险公司交通事故纠纷"];

  const caseList = document.getElementById("case-list");
  cases.forEach((caseName) => {
    const option = document.createElement("option");
    option.value = caseName;
    option.textContent = caseName;
    caseList.appendChild(option);
  });
}

// 绑定所有事件处理函数
function bindEvents() {
  // 案件选择与启动
  bindCaseStartEvent();

  // 庭审阶段控制
  bindStageControlEvents();

  // 角色发言控制
  bindSpeakingControlEvents();

  // 争议焦点管理
  bindFocusPointEvents();

  // 结束庭审
  bindEndTrialEvent();
}

// 绑定案件启动事件
function bindCaseStartEvent() {
  document.getElementById("start-case").addEventListener("click", function () {
    const selectedCase = document.getElementById("case-list").value;
    if (!selectedCase) {
      alert("请先选择案件");
      return;
    }

    currentCase = selectedCase;

    // 在实际应用中，这里应该发送API请求给后端
    console.log(`启动案件: ${selectedCase}`);

    // 更新UI状态
    document.getElementById("stage-indicator").textContent = "开庭程序";
    activateStage("opening");

    // 加载案件文件
    loadCaseFiles(selectedCase);

    // 加载角色信息
    loadRoles(selectedCase);

    // 加载争议焦点
    loadFocusPoints(selectedCase);
  });
}

// 加载案件文件
function loadCaseFiles(caseName) {
  // 实际应用中应该从服务器获取文件列表
  // 这里模拟一些文件
  const fileTree = document.getElementById("file-tree");
  fileTree.innerHTML = "";

  // 添加文件夹
  const folders = ["原告", "被告一", "被告二", "被告三", "法官"];
  folders.forEach((folder) => {
    const folderItem = document.createElement("div");
    folderItem.className = "file-tree-item file-tree-folder";
    folderItem.textContent = folder;
    fileTree.appendChild(folderItem);

    // 模拟一些文件
    if (folder === "原告") {
      addFile(fileTree, "起诉状.md");
      addFile(fileTree, "证据目录.md");
    } else if (folder.includes("被告")) {
      addFile(fileTree, "答辩状.md");
      addFile(fileTree, "质证意见.md");
    }
  });
}

// 添加文件到文件树
function addFile(parent, fileName) {
  const fileItem = document.createElement("div");
  fileItem.className = "file-tree-item file-tree-file";
  fileItem.textContent = fileName;
  fileItem.addEventListener("click", function () {
    // 在实际应用中，这里应该打开文件
    console.log(`打开文件: ${fileName}`);
  });
  parent.appendChild(fileItem);
}

// 加载角色信息
function loadRoles(caseName) {
  // 在实际应用中，应该从服务器获取角色信息
  console.log(`加载角色信息: ${caseName}`);

  // 这里我们仅模拟该功能
  // 可以根据案件名称设置特定的角色名称等
}

// 加载争议焦点
function loadFocusPoints(caseName) {
  // 清空当前争议焦点
  focusPoints = [];
  const focusList = document.getElementById("focus-list");
  focusList.innerHTML = "";

  // 在实际应用中，应该从服务器获取争议焦点
  // 这里模拟一些争议焦点
  if (caseName.includes("交通事故")) {
    addFocusPoint("事故责任认定");
    addFocusPoint("损失范围确定");
    addFocusPoint("赔偿金额计算");
  }
}

// 添加争议焦点
function addFocusPoint(title) {
  focusPoints.push(title);

  const focusList = document.getElementById("focus-list");
  const focusItem = document.createElement("div");
  focusItem.className = "focus-item";
  focusItem.innerHTML = `
        <span class="focus-title">争议焦点：${title}</span>
        <button class="debate-btn">展开辩论</button>
    `;

  focusList.appendChild(focusItem);

  // 绑定辩论按钮事件
  focusItem.querySelector(".debate-btn").addEventListener("click", function () {
    startDebateOnFocus(title);
  });
}

// 绑定庭审阶段控制事件
function bindStageControlEvents() {
  document.querySelectorAll(".stage-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const stage = this.dataset.stage;
      switchStage(stage);
    });
  });
}

// 切换庭审阶段
function switchStage(stage) {
  const stageNames = {
    opening: "开庭程序",
    investigation: "法庭调查",
    evidence: "举证质证",
    debate: "法庭辩论",
    "free-debate": "自由辩论",
    final: "最后陈述",
  };

  currentStage = stage;

  // 更新当前阶段指示器
  document.getElementById("stage-indicator").textContent = stageNames[stage];

  // 激活当前阶段按钮
  activateStage(stage);

  // 在实际应用中，这里应该通知后端阶段变化
  console.log(`切换庭审阶段: ${stageNames[stage]}`);

  // 根据不同阶段执行特定操作
  switch (stage) {
    case "opening":
      suggestSpeaker("judge");
      break;
    case "investigation":
      suggestSpeaker("plaintiff");
      break;
    case "evidence":
      suggestSpeaker("plaintiff");
      break;
    case "debate":
      // 如果有争议焦点，建议法官发言
      suggestSpeaker("judge");
      break;
    case "free-debate":
      suggestSpeaker("judge");
      break;
    case "final":
      suggestSpeaker("judge");
      break;
  }
}

// 激活指定阶段的按钮
function activateStage(stage) {
  document.querySelectorAll(".stage-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeBtn = document.querySelector(`.stage-btn[data-stage="${stage}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// 建议下一个发言人
function suggestSpeaker(role) {
  // 高亮显示建议的发言人
  document.querySelectorAll(".role-item").forEach((item) => {
    item.classList.remove("suggested");
  });

  const roleItem = document.querySelector(`.role-item.${role}`);
  if (roleItem) {
    roleItem.classList.add("suggested");
  }
}

// 绑定角色发言控制事件
function bindSpeakingControlEvents() {
  document.querySelectorAll(".speak-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const role = this.parentElement.classList[1]; // 获取角色类名
      const roleTitles = {
        judge: "法官",
        plaintiff: "原告",
        "defendant-1": "被告一",
        "defendant-2": "被告二",
        "defendant-3": "被告三",
      };

      const roleTitle = roleTitles[role] || "未知角色";

      // 设置当前发言人
      currentSpeaker = role;
      document.getElementById("current-speaker").textContent = roleTitle;

      // 突出显示当前发言角色
      document.querySelectorAll(".role-item").forEach((item) => {
        item.classList.remove("speaking");
      });
      this.parentElement.classList.add("speaking");

      // 在实际应用中，这里应该发送发言指令到后端
      console.log(`指定发言人: ${roleTitle}`);
    });
  });
}

// 绑定争议焦点事件
function bindFocusPointEvents() {
  document.getElementById("add-focus").addEventListener("click", function () {
    const focusTitle = prompt("请输入争议焦点标题");
    if (!focusTitle) return;

    addFocusPoint(focusTitle);
  });
}

// 在指定争议焦点上开始辩论
function startDebateOnFocus(focusTitle) {
  // 切换到辩论阶段
  switchStage("debate");
  document.getElementById(
    "stage-indicator"
  ).textContent = `法庭辩论: ${focusTitle}`;

  // 在实际应用中，这里应该发送争议焦点辩论指令到后端
  console.log(`开始争议焦点辩论: ${focusTitle}`);

  // 建议法官发言
  suggestSpeaker("judge");
}

// 绑定结束庭审事件
function bindEndTrialEvent() {
  document.getElementById("end-trial").addEventListener("click", function () {
    if (!currentCase) {
      alert("请先选择并启动案件");
      return;
    }

    if (!confirm("确定要结束庭审吗？这将生成庭审笔录和判决书。")) {
      return;
    }

    // 在实际应用中，这里应该发送结束庭审指令到后端
    console.log("结束庭审");

    // 更新界面状态
    document.getElementById("stage-indicator").textContent = "庭审结束";
    document.querySelectorAll(".stage-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.disabled = true;
    });

    // 显示文书生成中的提示
    showGeneratingDocuments();

    // 模拟文书生成完成
    setTimeout(() => {
      showDocumentLinks([
        { name: "庭审笔录", url: `#笔录_${formatDate(new Date())}` },
        { name: "判决书", url: `#判决书_${formatDate(new Date())}` },
      ]);
    }, 3000);
  });
}

// 显示文书生成中提示
function showGeneratingDocuments() {
  const container = document.createElement("div");
  container.className = "document-generating";
  container.innerHTML = `
        <h3>文书生成中...</h3>
        <p>系统正在生成庭审笔录和判决书，请稍候...</p>
    `;

  document.querySelector(".court-process").appendChild(container);
}

// 显示文书链接
function showDocumentLinks(documents) {
  // 移除生成中提示
  const generatingElem = document.querySelector(".document-generating");
  if (generatingElem) {
    generatingElem.remove();
  }

  // 添加文书链接
  const container = document.createElement("div");
  container.className = "document-links";
  container.innerHTML = `
        <h3>生成的文书</h3>
        <ul>
            ${documents
              .map(
                (doc) =>
                  `<li><a href="${doc.url}" target="_blank">${doc.name}</a></li>`
              )
              .join("")}
        </ul>
    `;

  document.querySelector(".court-process").appendChild(container);
}

// 格式化日期为YYYYMMDD_HHMMSS格式
function formatDate(date) {
  const pad = (num) => num.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// 调试函数：触发"结束"指令
function sendEndCommand() {
  // 在实际应用中，这个函数会向后端发送"结束"指令
  console.log("发送结束指令");
  alert('已向AI发送"结束"指令，将生成庭审笔录和判决书');
}
