"use strict";

const FORMATS = {
    bo1: {
        label: "BO1",
        actions: ["ban", "ban", "ban", "ban", "ban", "pick"]
    },
    bo3: {
        label: "BO3",
        actions: ["ban", "ban", "pick", "pick", "ban", "ban", "decider"]
    },
    bo5: {
        label: "BO5",
        actions: ["ban", "ban", "pick", "pick", "pick", "pick", "decider"]
    }
};

const ACTION_LABELS = {
    ban: "BAN MAP",
    pick: "PICK MAP",
    decider: "DECIDER MAP"
};

const state = {
    teams: [],
    maps: [],
    selectedFormat: "bo3",
    teamA: null,
    teamB: null,
    firstTeamKey: "a",
    step: 0,
    results: [],
    pendingMap: null
};

const elements = {};

document.addEventListener("DOMContentLoaded", initialise);

async function initialise() {
    cacheElements();
    bindEvents();

    try {
        const [teamResponse, mapResponse] = await Promise.all([
            fetch("./data/teams.json"),
            fetch("./data/maps.json")
        ]);

        if (!teamResponse.ok || !mapResponse.ok) {
            throw new Error(`HTTP ${teamResponse.status || mapResponse.status}`);
        }

        const teamData = await teamResponse.json();
        const mapData = await mapResponse.json();
        state.teams = teamData.teams;
        state.maps = mapData.maps.filter((map) => map.enabled);

        validateData();
        populateTeamSelects();
        selectFormat(state.selectedFormat);
        elements.setupView.hidden = false;
        setStatus("試合形式とチームを選択してください");
    } catch (error) {
        elements.loadError.hidden = false;
        elements.loadErrorDetail.textContent = `詳細: ${error.message}`;
        setStatus("読み込みエラー");
    }
}

function cacheElements() {
    const ids = [
        "status-text", "setup-view", "draft-view", "complete-view", "load-error",
        "load-error-detail", "team-a-select", "team-b-select", "team-a-members",
        "team-b-members", "setup-error", "start-button", "reset-button", "restart-button",
        "format-label", "turn-heading", "turn-help", "progress-text", "result-list",
        "map-list", "final-results", "confirm-dialog", "confirm-action", "confirm-map",
        "confirm-image", "confirm-button", "side-dialog", "side-team-name"
    ];

    ids.forEach((id) => {
        elements[toCamelCase(id)] = document.getElementById(id);
    });
    elements.formatButtons = [...document.querySelectorAll(".format-button")];
}

function bindEvents() {
    elements.formatButtons.forEach((button) => {
        button.addEventListener("click", () => selectFormat(button.dataset.format));
    });
    elements.teamASelect.addEventListener("change", () => selectTeam("a"));
    elements.teamBSelect.addEventListener("change", () => selectTeam("b"));
    elements.startButton.addEventListener("click", startDraft);
    elements.resetButton.addEventListener("click", resetApplication);
    elements.restartButton.addEventListener("click", resetApplication);
    elements.confirmDialog.addEventListener("close", handleMapConfirmation);
    elements.sideDialog.addEventListener("close", handleSideSelection);
}

function validateData() {
    if (!Array.isArray(state.teams) || state.teams.length < 2) {
        throw new Error("teams.jsonには2チーム以上必要です");
    }
    if (state.maps.length !== 7) {
        throw new Error(`有効なマップは7件必要です（現在${state.maps.length}件）`);
    }
}

function populateTeamSelects() {
    state.teams.forEach((team) => {
        [elements.teamASelect, elements.teamBSelect].forEach((select) => {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;
            select.append(option);
        });
    });
}

function selectFormat(formatKey) {
    state.selectedFormat = formatKey;
    elements.formatButtons.forEach((button) => {
        const selected = button.dataset.format === formatKey;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
}

function selectTeam(side) {
    const select = side === "a" ? elements.teamASelect : elements.teamBSelect;
    const team = state.teams.find((item) => item.id === select.value) || null;
    state[side === "a" ? "teamA" : "teamB"] = team;
    renderMembers(side, team);
    validateSetup();
}

function renderMembers(side, team) {
    const list = side === "a" ? elements.teamAMembers : elements.teamBMembers;
    list.replaceChildren();
    if (!team) return;

    team.members.forEach((member) => {
        const item = document.createElement("li");
        item.textContent = member;
        list.append(item);
    });
}

function validateSetup() {
    let message = "";
    if (state.teamA && state.teamB && state.teamA.id === state.teamB.id) {
        message = "Team AとTeam Bには別のチームを選択してください。";
    }
    elements.setupError.textContent = message;
    elements.startButton.disabled = !state.teamA || !state.teamB || Boolean(message);
}

function startDraft() {
    if (elements.startButton.disabled) return;

    state.firstTeamKey = Math.random() < 0.5 ? "a" : "b";
    state.step = 0;
    state.results = [];
    document.body.classList.remove("draft-complete");
    elements.setupView.hidden = true;
    elements.draftView.hidden = false;
    elements.resetButton.hidden = false;
    renderDraft();
}

function renderDraft() {
    const format = FORMATS[state.selectedFormat];
    const action = format.actions[state.step];
    const actorKey = getActorKey(state.step);
    const actor = getTeam(actorKey);

    elements.formatLabel.textContent = format.label;
    elements.turnHeading.textContent = `${actor.name}：${ACTION_LABELS[action]}`;
    elements.turnHeading.className = `team-${actorKey}-text`;
    elements.turnHelp.textContent = action === "decider"
        ? "残ったマップが自動的にDECIDERになります"
        : `${actor.name}がマップを選択してください`;
    elements.progressText.textContent = `${state.step + 1} / ${format.actions.length}`;
    setStatus(`${format.label}ドラフト進行中`);
    renderResults(elements.resultList, false);
    renderAvailableMaps(action);

    if (action === "decider") {
        const remainingMap = getAvailableMaps()[0];
        window.setTimeout(() => commitMap(remainingMap), 500);
    }
}

function renderAvailableMaps(action) {
    elements.mapList.replaceChildren();
    getAvailableMaps().forEach((map) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "map-option";
        button.disabled = action === "decider";
        button.innerHTML = `<img src="${map.image}" alt=""><span>${escapeHtml(map.name)}</span>`;
        button.addEventListener("click", () => openMapConfirmation(map));
        elements.mapList.append(button);
    });
}

function openMapConfirmation(map) {
    const action = FORMATS[state.selectedFormat].actions[state.step];
    state.pendingMap = map;
    elements.confirmAction.textContent = ACTION_LABELS[action];
    elements.confirmMap.textContent = map.name;
    elements.confirmImage.src = map.image;
    elements.confirmImage.alt = map.name;
    elements.confirmButton.textContent = `${action === "ban" ? "BAN" : "PICK"}する`;
    elements.confirmDialog.showModal();
}

function handleMapConfirmation() {
    if (elements.confirmDialog.returnValue === "confirm" && state.pendingMap) {
        commitMap(state.pendingMap);
    }
    state.pendingMap = null;
}

function commitMap(map) {
    const action = FORMATS[state.selectedFormat].actions[state.step];
    const result = {
        action,
        map,
        actorKey: getActorKey(state.step),
        sideTeamKey: null,
        startingSide: null
    };
    state.results.push(result);

    if (action === "pick" || action === "decider") {
        result.sideTeamKey = action === "pick"
            ? oppositeTeamKey(result.actorKey)
            : result.actorKey;
        openSideDialog(result.sideTeamKey);
        return;
    }

    advanceDraft();
}

function openSideDialog(teamKey) {
    const result = state.results[state.results.length - 1];
    result.defenderImage = randomSideImage("defender");
    result.attackerImage = randomSideImage("attacker");
    document.querySelector('.side-button[value="Defender"] img').src = result.defenderImage;
    document.querySelector('.side-button[value="Attacker"] img').src = result.attackerImage;
    elements.sideTeamName.textContent = getTeam(teamKey).name;
    elements.sideTeamName.className = `team-${teamKey}-text`;
    elements.sideDialog.returnValue = "";
    elements.sideDialog.showModal();
}

function handleSideSelection() {
    const side = elements.sideDialog.returnValue;
    if (side !== "Defender" && side !== "Attacker") {
        window.setTimeout(() => elements.sideDialog.showModal(), 0);
        return;
    }
    state.results[state.results.length - 1].startingSide = side;
    advanceDraft();
}

function advanceDraft() {
    state.step += 1;
    if (state.step >= FORMATS[state.selectedFormat].actions.length) {
        finishDraft();
    } else {
        renderDraft();
    }
}

function finishDraft() {
    document.body.classList.add("draft-complete");
    elements.draftView.hidden = true;
    elements.completeView.hidden = false;
    renderFinalResults();
    setStatus(`${FORMATS[state.selectedFormat].label}ドラフト完了`);
}

function renderFinalResults() {
    elements.finalResults.replaceChildren();

    const layout = document.createElement("div");
    layout.className = `final-layout final-${state.selectedFormat}`;
    let leftKey = "a";
    let rightKey = "b";

    if (state.selectedFormat === "bo1") {
        const assignments = getSideAssignments(state.results.find((result) => result.action !== "ban"));
        leftKey = assignments.defenderKey;
        rightKey = assignments.attackerKey;
    }

    layout.append(
        createFinalRoster(leftKey, getTeam(leftKey)),
        createFinalMapArea(),
        createFinalRoster(rightKey, getTeam(rightKey))
    );
    elements.finalResults.append(layout);
}

function createFinalRoster(teamKey, team) {
    const section = document.createElement("section");
    section.className = `final-roster final-roster-${teamKey}`;

    const heading = document.createElement("h3");
    heading.textContent = team.name;
    const list = document.createElement("ul");

    team.members.forEach((member) => {
        const item = document.createElement("li");
        const icon = document.createElement("img");
        icon.src = "./img/V_Bug_Positive_Navy.png";
        icon.alt = "";
        const name = document.createElement("span");
        name.textContent = member;
        item.append(icon, name);
        list.append(item);
    });

    section.append(heading, list);
    return section;
}

function createFinalMapArea() {
    const playableResults = state.results.filter((result) => result.action !== "ban");
    const section = document.createElement("section");
    section.className = "final-map-area";

    const maps = document.createElement("div");
    maps.className = "final-map-list";
    playableResults.forEach((result) => maps.append(createFinalMapCard(result)));
    section.append(maps);

    if (playableResults.length === 1) {
        section.append(createSideShowcase(playableResults[0]));
    } else {
        const logo = document.createElement("img");
        logo.className = "final-champions-logo";
        logo.src = "./img/VCT_Champions_icon_allmode.png";
        logo.alt = "VALORANT Champions";
        section.append(logo);
    }
    return section;
}

function createFinalMapCard(result) {
    const card = document.createElement("article");
    card.className = "final-map-card";
    const mapNumber = state.results.filter((item) => item.action !== "ban").indexOf(result) + 1;
    const mapLabel = result.action === "decider" ? "DECIDER" : ordinal(mapNumber);
    card.innerHTML = `
        <header>
            <strong class="${result.action === "decider" ? "" : `team-${result.actorKey}-text`}">${result.action === "decider" ? "DECIDER" : escapeHtml(getTeam(result.actorKey).name)}</strong>
            <span>${mapLabel} MAP</span>
        </header>
        <img class="final-map-image" src="${result.map.image}" alt="${escapeHtml(result.map.name)}">
        <h3>${escapeHtml(result.map.name)}</h3>
        <div class="final-side-summary">
            <p><span class="team-${result.sideTeamKey}-text">${escapeHtml(getTeam(result.sideTeamKey).name)}</span><strong>${result.startingSide}</strong></p>
        </div>`;
    return card;
}

function createSideShowcase(result) {
    const assignments = getSideAssignments(result);
    const showcase = document.createElement("div");
    showcase.className = "side-showcase";
    showcase.innerHTML = `
        <article>
            <p class="team-${assignments.defenderKey}-text">${escapeHtml(getTeam(assignments.defenderKey).name)}</p>
            <strong>Defender</strong>
            <img src="${result.defenderImage}" alt="Defender">
        </article>
        <article>
            <p class="team-${assignments.attackerKey}-text">${escapeHtml(getTeam(assignments.attackerKey).name)}</p>
            <strong>Attacker</strong>
            <img src="${result.attackerImage}" alt="Attacker">
        </article>`;
    return showcase;
}

function getSideAssignments(result) {
    const otherKey = oppositeTeamKey(result.sideTeamKey);
    return result.startingSide === "Defender"
        ? { defenderKey: result.sideTeamKey, attackerKey: otherKey }
        : { defenderKey: otherKey, attackerKey: result.sideTeamKey };
}

function ordinal(number) {
    if (number === 1) return "1st";
    if (number === 2) return "2nd";
    if (number === 3) return "3rd";
    return `${number}th`;
}

function randomSideImage(side) {
    const number = Math.floor(Math.random() * 6) + 1;
    return `./img/${side}_${number}.jpg`;
}

function renderResults(container, finalView) {
    container.replaceChildren();
    state.results.forEach((result, index) => {
        const actor = getTeam(result.actorKey);
        const card = document.createElement("article");
        card.className = `result-card result-${result.action}`;
        const sideDetails = result.startingSide
            ? `<p class="side-detail"><span class="team-${result.sideTeamKey}-text">${escapeHtml(getTeam(result.sideTeamKey).name)}</span><br>${result.startingSide}</p>`
            : "";
        card.innerHTML = `
            <header>
                <span>${index + 1}. ${ACTION_LABELS[result.action]}</span>
                <strong class="team-${result.actorKey}-text">${escapeHtml(actor.name)}</strong>
            </header>
            <div class="result-image-wrap">
                <img src="${result.map.image}" alt="${escapeHtml(result.map.name)}">
                ${result.action === "ban" ? '<span class="ban-mark" aria-label="BAN"></span>' : ""}
                ${sideDetails}
            </div>
            <h3>${escapeHtml(result.map.name)}</h3>`;
        container.append(card);
    });

    if (!state.results.length && !finalView) {
        const empty = document.createElement("p");
        empty.className = "empty-results";
        empty.textContent = "選択結果がここに表示されます";
        container.append(empty);
    }
}

function resetApplication() {
    if (elements.confirmDialog.open) elements.confirmDialog.close("cancel");
    if (elements.sideDialog.open) elements.sideDialog.close("reset");
    state.step = 0;
    state.results = [];
    state.pendingMap = null;
    document.body.classList.remove("draft-complete");
    elements.draftView.hidden = true;
    elements.completeView.hidden = true;
    elements.setupView.hidden = false;
    elements.resetButton.hidden = true;
    elements.resultList.replaceChildren();
    setStatus("試合形式とチームを選択してください");
}

function getAvailableMaps() {
    const usedIds = new Set(state.results.map((result) => result.map.id));
    return state.maps.filter((map) => !usedIds.has(map.id));
}

function getActorKey(step) {
    if (step % 2 === 0) return state.firstTeamKey;
    return oppositeTeamKey(state.firstTeamKey);
}

function oppositeTeamKey(key) {
    return key === "a" ? "b" : "a";
}

function getTeam(key) {
    return key === "a" ? state.teamA : state.teamB;
}

function setStatus(message) {
    elements.statusText.textContent = message;
}

function toCamelCase(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = value;
    return node.innerHTML;
}
