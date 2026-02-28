const STORY_DURATION_MS = 3000;

const ui = {
    addStory: document.querySelector("#addStory"),
    stories: document.querySelector("#stories"),

    story: document.querySelector("#story"),
    storyContain: document.querySelector("#storiesContainer"),
    activeStoryLabel: document.querySelector("#activeStoryLabel"),
    closeStory: document.querySelector("#closeStory"),

    progressBarFill: document.querySelector("#progressBar"),
    storyTimer: document.querySelector("#storyTimer"),

    imgContainer: document.querySelector("#imgContainer"),
    backwardsBtn: document.querySelector("#backwardsBtn"),
    forwardBtn: document.querySelector("#forwardBtn"),

    popUp: document.querySelector("#popUp"),
    form: document.querySelector("#form"),
    userTitle: document.querySelector("#userTitle"),
    photoUpload: document.querySelector("#photoUpload"),
    photoFeedback: document.querySelector("#photoFeedback")
};

let savedContent = [];
let currentStoryIndex = -1;
let modalOpen = false;

let progressAnimationId = null;
let autoNextTimeoutId = null;
let timerStartMs = 0;

ui.addStory.addEventListener("click", () => {
    modalOpen = !modalOpen;
    ui.photoUpload.value = "";
    ui.photoFeedback.textContent = "";

    if (modalOpen) {
        ui.popUp.classList.remove("hidden");
        ui.userTitle.focus();
    } else {
        ui.popUp.classList.add("hidden");
    }
});

ui.popUp.addEventListener("click", (e) => {
    if (e.target === ui.popUp) {
        modalOpen = false;
        ui.popUp.classList.add("hidden");
    }
});

ui.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const storyTitle = ui.userTitle.value.trim();
    const file = ui.photoUpload.files[0];

    if (!file) {
        ui.photoFeedback.textContent = "Please select a file";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        savedContent.push({ Title: storyTitle, Image: event.target.result });
        newStory();
    };

    reader.readAsDataURL(file);

    ui.userTitle.value = "";
    ui.photoUpload.value = "";

    modalOpen = false;
    ui.popUp.classList.add("hidden");
});

ui.photoUpload.addEventListener("change", () => {
    const file = ui.photoUpload.files[0];
    if (file) {
        ui.photoFeedback.textContent = "Image was successfully uploaded.";
    } else {
        ui.photoFeedback.textContent = "";
    }
});

function newStory() {
    while (ui.stories.firstChild) {
        ui.stories.removeChild(ui.stories.firstChild);
    }

    savedContent.forEach((item, index) => {
        const button = document.createElement("button");
        button.className = "story-thumb";
        button.dataset.index = index;
        button.type = "button";
        button.setAttribute("aria-label", item.Title || `Story ${index + 1}`);

        const imgBtn = document.createElement("img");
        imgBtn.className = "story-thumb__img";
        imgBtn.src = item.Image;
        imgBtn.alt = item.Title || `Story ${index + 1}`;

        button.appendChild(imgBtn);
        ui.stories.appendChild(button);

        button.addEventListener("click", (e) => {
            currentStoryIndex = Number(e.currentTarget.dataset.index);
            viewStory();
            renderCurrentStory();
        });
    });
}

function renderCurrentStory() {
    if (currentStoryIndex < 0 || currentStoryIndex >= savedContent.length) {
        return;
    }

    const storyData = savedContent[currentStoryIndex];
    const image = document.createElement("img");
    image.className = "story-image";
    image.src = storyData.Image;
    image.alt = storyData.Title || `Story ${currentStoryIndex + 1}`;

    ui.imgContainer.innerHTML = "";
    ui.imgContainer.appendChild(image);

    if (ui.activeStoryLabel) {
        ui.activeStoryLabel.textContent = storyData.Title || `Story ${currentStoryIndex + 1}`;
    }

    if (!ui.story.classList.contains("hidden")) {
        startStoryTimer();
    }
}

function viewStory() {
    ui.storyContain.classList.add("hidden");
    ui.story.classList.remove("hidden");
}

function closeStoryView() {
    stopStoryTimer();
    resetStoryTimerUI();
    ui.story.classList.add("hidden");
    ui.storyContain.classList.remove("hidden");
}

function resetStoryTimerUI() {
    if (ui.progressBarFill) {
        ui.progressBarFill.style.transform = "scaleX(0)";
    }

    if (ui.storyTimer) {
        ui.storyTimer.textContent = "3.0s";
    }
}

function stopStoryTimer() {
    if (progressAnimationId !== null) {
        cancelAnimationFrame(progressAnimationId);
        progressAnimationId = null;
    }

    if (autoNextTimeoutId !== null) {
        clearTimeout(autoNextTimeoutId);
        autoNextTimeoutId = null;
    }
}

function updateStoryTimerUI(elapsedMs) {
    const clampedElapsed = Math.min(elapsedMs, STORY_DURATION_MS);
    const progressRatio = clampedElapsed / STORY_DURATION_MS;
    const remainingMs = Math.max(0, STORY_DURATION_MS - clampedElapsed);

    if (ui.progressBarFill) {
        ui.progressBarFill.style.transform = `scaleX(${progressRatio})`;
    }

    if (ui.storyTimer) {
        ui.storyTimer.textContent = `${(remainingMs / 1000).toFixed(1)}s`;
    }
}

function startStoryTimer() {
    if (ui.story.classList.contains("hidden")) {
        return;
    }

    if (currentStoryIndex < 0 || currentStoryIndex >= savedContent.length) {
        return;
    }

    stopStoryTimer();
    timerStartMs = performance.now();
    updateStoryTimerUI(0);
    progressAnimationId = requestAnimationFrame(function tick(nowMs) {
        if (ui.story.classList.contains("hidden")) {
            progressAnimationId = null;
            return;
        }

        const elapsedMs = nowMs - timerStartMs;
        updateStoryTimerUI(elapsedMs);

        if (elapsedMs < STORY_DURATION_MS) {
            progressAnimationId = requestAnimationFrame(tick);
        } else {
            progressAnimationId = null;
        }
    });

    autoNextTimeoutId = setTimeout(() => {
        goToNextStory({ fromTimer: true });
    }, STORY_DURATION_MS);
}

function goToNextStory(options = {}) {
    if (!savedContent.length) {
        return;
    }

    const fromTimer = options.fromTimer === true;
    const isLastStory = currentStoryIndex >= savedContent.length - 1;

    if (isLastStory) {
        if (fromTimer) {
            closeStoryView();
            return;
        }

        currentStoryIndex = 0;
    } else {
        currentStoryIndex += 1;
    }

    renderCurrentStory();
}

function goToPreviousStory() {
    if (!savedContent.length) {
        return;
    }

    if (currentStoryIndex <= 0) {
        currentStoryIndex = savedContent.length - 1;
    } else {
        currentStoryIndex -= 1;
    }

    renderCurrentStory();
}

ui.forwardBtn.addEventListener("click", () => {
    goToNextStory();
});

ui.backwardsBtn.addEventListener("click", () => {
    goToPreviousStory();
});

ui.closeStory.addEventListener("click", () => {
    closeStoryView();
});

document.addEventListener("keydown", (e) => {
    if (ui.story.classList.contains("hidden")) {
        return;
    }

    if (e.key === "ArrowRight") {
        goToNextStory();
    }

    if (e.key === "ArrowLeft") {
        goToPreviousStory();
    }

    if (e.key === "Escape") {
        closeStoryView();
    }
});
