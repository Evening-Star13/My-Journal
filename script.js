// DOM Elements
const elements = {
  entryTitle: document.getElementById("entryTitle"),
  journalEntry: document.getElementById("journalEntry"),
  imageUpload: document.getElementById("imageUpload"),
  saveNote: document.getElementById("saveNote"),
  updateNote: document.getElementById("updateNote"),
  tableOfContents: document.getElementById("tableOfContents"),
  downloadDatabase: document.getElementById("downloadDatabase"),
  entriesList: document.getElementById("entriesList"),
  modal: document.getElementById("entryModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalContent: document.getElementById("modalContent"),
  modalEditContent: document.getElementById("modalEditContent"),
  modalEditButton: document.getElementById("modalEditButton"),
  modalSaveButton: document.getElementById("modalSaveButton"),
  modalDeleteButton: document.getElementById("modalDeleteButton"),
  modalImage: document.getElementById("modalImage"),
  closeModal: document.querySelector(".close"),
  cover: document.getElementById("cover"),
  journalApp: document.getElementById("journalApp"),
  openJournalButton: document.getElementById("openJournalButton"),
  closeJournalButton: document.getElementById("closeJournalButton"),
  uploadedImage: document.getElementById("uploadedImage"),
  settingsButton: document.getElementById("settingsButton"),
  settingsDropdown: document.getElementById("settingsDropdown"),
  themeOptions: document.querySelectorAll(".theme-option"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  changeBackgroundButton: document.getElementById("changeBackgroundButton"),
  removeBackgroundButton: document.getElementById("removeBackgroundButton"),
  journalTitle: document.getElementById("journalTitle"),
  journalTitleInside: document.getElementById("journalTitleInside"),
  editTitleButton: document.getElementById("editTitleButton"),
  coverImage: document.getElementById("coverImage"),
  changeCoverImage: document.getElementById("changeCoverImage"),
  coverImageUpload: document.getElementById("coverImageUpload"),
};

// App State
const state = {
  database: [],
  editingEntryId: null,
  currentModalEntryId: null,
  fileHandle: null,
  currentTheme: "theme-default",
  darkMode: false,
  backgroundImage: null,
  journalTitle: "My Digital Journal",
};

// Initialize the app
function init() {
  loadDatabase();
  loadSettings();
  setupEventListeners();

  // Initialize UI state
  elements.cover.style.display = "block";
  elements.journalApp.style.display = "none";
  elements.journalTitle.textContent = state.journalTitle;
}

// Load entries from localStorage
function loadDatabase() {
  const savedData = localStorage.getItem("journalDatabase");
  if (savedData) {
    state.database = JSON.parse(savedData);
  }
}

// Save entries to localStorage
function saveDatabase() {
  try {
    console.log("Saving database:", state.database);
    localStorage.setItem("journalDatabase", JSON.stringify(state.database));
    console.log("Database saved successfully.");
  } catch (error) {
    console.error("Error saving database:", error);
    alert("An error occurred while saving the database. Details in console.");
  }
}

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem("journalSettings");
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    state.currentTheme = settings.currentTheme || "theme-default";
    state.darkMode = settings.darkMode || false;
    state.backgroundImage = settings.backgroundImage || null;
    state.journalTitle = settings.journalTitle || "My Digital Journal";

    applySettings();
  }
}

// Save settings to localStorage
function saveSettings() {
  const settings = {
    currentTheme: state.currentTheme,
    darkMode: state.darkMode,
    backgroundImage: state.backgroundImage,
    journalTitle: state.journalTitle,
  };
  localStorage.setItem("journalSettings", JSON.stringify(settings));
}

// Apply current settings to the UI
function applySettings() {
  // Remove all theme classes first
  document.body.classList.remove(
    "theme-default",
    "theme-green",
    "theme-purple",
    "theme-red",
    "theme-magenta" // Add the new theme class here
  );

  // Apply current theme
  document.body.classList.add(state.currentTheme);

  // Apply dark mode
  if (state.darkMode) {
    document.body.classList.add("dark-mode");
    elements.darkModeToggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    elements.darkModeToggle.checked = false;
  }

  // Apply background image
  if (state.backgroundImage) {
    document.body.style.backgroundImage = `url(${state.backgroundImage})`;
    document.body.classList.add("custom-background");
  } else {
    document.body.style.backgroundImage = "";
    document.body.classList.remove("custom-background");
  }

  // Apply journal title
  elements.journalTitle.textContent = state.journalTitle;
  // Mark selected theme
  elements.themeOptions.forEach((option) => {
    option.classList.toggle(
      "selected",
      option.dataset.theme === state.currentTheme.replace("theme-", "")
    );
  });
}

// Setup all event listeners
function setupEventListeners() {
  // Navigation
  elements.openJournalButton.addEventListener("click", showJournal);
  elements.closeJournalButton.addEventListener("click", showCover);

  // Entry operations
  elements.saveNote.addEventListener("click", saveEntry);
  elements.updateNote.addEventListener("click", updateEntry);
  elements.tableOfContents.addEventListener("click", toggleEntriesList);
  elements.downloadDatabase.addEventListener("click", downloadDatabase);

  // Image handling
  elements.imageUpload.addEventListener("change", handleImageUpload);

  // Modal operations
  elements.closeModal.addEventListener("click", closeModal);
  elements.modalEditButton.addEventListener("click", enableEditMode);
  elements.modalSaveButton.addEventListener("click", saveModalChanges);
  elements.modalDeleteButton.addEventListener("click", deleteModalEntry);

  // Settings
  elements.settingsButton.addEventListener("click", toggleSettingsDropdown);
  elements.themeOptions.forEach((option) => {
    option.addEventListener("click", () =>
      changeTheme(`theme-${option.dataset.theme}`)
    );
  });
  elements.darkModeToggle.addEventListener("change", toggleDarkMode);
  elements.changeBackgroundButton.addEventListener("click", changeBackground);
  elements.removeBackgroundButton.addEventListener("click", removeBackground);

  // Cover customization
  elements.editTitleButton.addEventListener("click", editJournalTitle);
  elements.changeCoverImage.addEventListener("click", () =>
    elements.coverImageUpload.click()
  );
  elements.coverImageUpload.addEventListener("change", changeCoverImageHandler);

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
    if (
      !event.target.closest(".settings-dropdown") &&
      !event.target.closest(".settings-button")
    ) {
      elements.settingsDropdown.style.display = "none";
    }
  });
}

// UI Navigation
function showJournal() {
  elements.cover.style.display = "none";
  elements.journalApp.style.display = "block";
  renderEntries();
}

function showCover() {
  elements.journalApp.style.display = "none";
  elements.cover.style.display = "block";
  resetEntryForm();
  elements.settingsDropdown.style.display = "none";
}

function toggleEntriesList() {
  if (
    elements.entriesList.style.display === "none" ||
    elements.entriesList.style.display === ""
  ) {
    elements.entriesList.style.display = "block";
    renderEntries();
  } else {
    elements.entriesList.style.display = "none";
  }
}

// Entry Form Handling
function resetEntryForm() {
  elements.entryTitle.value = "";
  elements.journalEntry.value = "";
  elements.imageUpload.value = "";
  elements.uploadedImage.style.display = "none";
  elements.saveNote.style.display = "inline-block";
  elements.updateNote.style.display = "none";
  state.editingEntryId = null;
}

async function saveEntry() {
  const title = elements.entryTitle.value.trim();
  const content = elements.journalEntry.value.trim();
  const imageFile = elements.imageUpload.files[0];

  if (!title || !content) {
    alert("Please enter a title and write something before saving.");
    return;
  }

  try {
    const entry = {
      id: Date.now(),
      title,
      content,
      timestamp: new Date().toISOString(),
      image: imageFile ? await readFileAsDataURL(imageFile) : null,
      fileHandle: null,
    };

    console.log("Saving entry:", entry);

    // Try to save text file (but don't fail if user cancels)
    try {
      if (window.showSaveFilePicker) {
        try {
          entry.fileHandle = await window.showSaveFilePicker({
            types: [
              {
                description: "Text Files",
                accept: { "text/plain": [".txt"] },
              },
            ],
            suggestedName: `${title
              .replace(/[^a-z0-9]/gi, "_")
              .toLowerCase()}.txt`,
          });
          const writable = await entry.fileHandle.createWritable();
          await writable.write(`${title}\n\n${content}`);
          await writable.close();
        } catch (err) {
          console.log("File save canceled or not supported:", err);
          // Continue with local storage even if file save fails
        }
      }
    } catch (err) {
      console.log("File save error:", err);
      // Continue with local storage even if file save fails
    }

    state.database.push(entry);
    saveDatabase();
    resetEntryForm();
    renderEntries();
    alert("Entry saved successfully!");
  } catch (error) {
    console.error("Save error:", error);
    alert("An error occurred while saving the entry. Details in console.");
  }
}

async function updateEntry() {
  const title = elements.entryTitle.value.trim();
  const content = elements.journalEntry.value.trim();
  const imageFile = elements.imageUpload.files[0];

  if (!title || !content || state.editingEntryId === null) {
    alert("Please enter a title and write something before updating.");
    return;
  }

  try {
    const entryIndex = state.database.findIndex(
      (entry) => entry.id === state.editingEntryId
    );
    if (entryIndex === -1) return;

    const entry = state.database[entryIndex];
    entry.title = title;
    entry.content = content;
    entry.timestamp = new Date().toISOString();

    if (imageFile) {
      entry.image = await readFileAsDataURL(imageFile);
    }

    // Update text file if it exists
    try {
      if (entry.fileHandle) {
        const writable = await entry.fileHandle.createWritable();
        await writable.write(`${title}\n\n${content}`);
        await writable.close();
      }
    } catch (err) {
      console.log("File update failed:", err);
      // Continue with local storage update even if file update fails
    }

    saveDatabase();
    resetEntryForm();
    renderEntries();
    alert("Entry updated successfully!");
  } catch (error) {
    console.error("Update error:", error);
    alert("An error occurred while updating the entry. Details in console.");
  }
}

// File Operations
async function removeEntryFile(fileHandle) {
  try {
    await fileHandle.remove();
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Entries List Rendering
function renderEntries() {
  elements.entriesList.innerHTML = "";

  if (state.database.length === 0) {
    elements.entriesList.innerHTML =
      "<p>No entries yet. Start by adding one!</p>";
    return;
  }

  state.database.forEach((entry) => {
    const entryItem = document.createElement("div");
    entryItem.className = "entry-item";
    entryItem.innerHTML = `
      <p><strong>${entry.title}</strong></p>
      <p><em>${new Date(entry.timestamp).toLocaleString()}</em></p>
      <button class="delete-entry" data-id="${
        entry.id
      }" title="Delete entry">🗑️</button>
    `;

    entryItem.addEventListener("click", (event) => {
      if (event.target.classList.contains("delete-entry")) {
        deleteEntry(event.target.dataset.id);
      } else {
        openEntryModal(entry);
      }
    });

    elements.entriesList.appendChild(entryItem);
  });
}

function deleteEntry(entryId) {
  const entryIndex = state.database.findIndex(
    (entry) => entry.id === parseInt(entryId)
  );
  if (entryIndex === -1) return;

  const entry = state.database[entryIndex];
  if (confirm(`Are you sure you want to delete "${entry.title}"?`)) {
    state.database.splice(entryIndex, 1);
    saveDatabase();
    renderEntries();

    if (entry.fileHandle) {
      removeEntryFile(entry.fileHandle);
    }
  }
}

// Modal Handling
function openEntryModal(entry) {
  state.currentModalEntryId = entry.id;
  elements.modalTitle.textContent = entry.title;
  elements.modalContent.textContent = entry.content;
  elements.modalEditContent.value = entry.content;

  // Display the image if it exists
  if (entry.image) {
    elements.modalImage.src = entry.image;
    elements.modalImage.style.display = "block";
  } else {
    elements.modalImage.style.display = "none";
  }

  elements.modal.style.display = "block";
}

function closeModal() {
  elements.modal.style.display = "none";
  resetModal();
}

function resetModal() {
  elements.modalContent.style.display = "block";
  elements.modalEditContent.style.display = "none";
  elements.modalEditButton.style.display = "inline-block";
  elements.modalSaveButton.style.display = "none";
}

function enableEditMode() {
  elements.modalContent.style.display = "none";
  elements.modalEditContent.style.display = "block";
  elements.modalEditButton.style.display = "none";
  elements.modalSaveButton.style.display = "inline-block";
}

async function saveModalChanges() {
  const updatedContent = elements.modalEditContent.value.trim();

  if (!updatedContent || state.currentModalEntryId === null) {
    alert("Please write something before saving.");
    return;
  }

  try {
    const entryIndex = state.database.findIndex(
      (entry) => entry.id === state.currentModalEntryId
    );

    if (entryIndex !== -1) {
      const entry = state.database[entryIndex];
      entry.content = updatedContent;
      entry.timestamp = new Date().toISOString();
      saveDatabase();

      // Update text file if it exists
      try {
        if (entry.fileHandle) {
          const writable = await entry.fileHandle.createWritable();
          await writable.write(`${entry.title}\n\n${updatedContent}`);
          await writable.close();
        }
      } catch (err) {
        console.error("File save error:", err);
      }

      renderEntries();
      closeModal();
      alert("Entry updated successfully!");
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("An error occurred while saving changes.");
  }
}

async function deleteModalEntry() {
  if (state.currentModalEntryId === null) return;

  const entryIndex = state.database.findIndex(
    (entry) => entry.id === state.currentModalEntryId
  );

  if (entryIndex !== -1) {
    const entry = state.database[entryIndex];
    if (confirm(`Are you sure you want to delete "${entry.title}"?`)) {
      state.database.splice(entryIndex, 1);
      saveDatabase();
      renderEntries();
      closeModal();

      if (entry.fileHandle) {
        await removeEntryFile(entry.fileHandle);
      }
    }
  }
}

// Database Download
async function downloadDatabase() {
  if (state.database.length === 0) {
    alert("No entries to download.");
    return;
  }

  try {
    // Try File System Access API first
    if (window.showSaveFilePicker) {
      const fileHandle = await window.showSaveFilePicker({
        types: [
          { description: "Text Files", accept: { "text/plain": [".txt"] } },
        ],
        suggestedName: "my_journal_export.txt",
      });

      const writable = await fileHandle.createWritable();
      let fileContent = "";

      for (const entry of state.database) {
        fileContent += `=== ${entry.title} ===\n`;
        fileContent += `Date: ${new Date(
          entry.timestamp
        ).toLocaleString()}\n\n`;
        fileContent += `${entry.content}\n\n\n`;
      }

      await writable.write(fileContent);
      await writable.close();
      alert("Journal exported successfully!");
      return;
    }

    // Fallback for browsers without File System Access API
    let fileContent = "";

    for (const entry of state.database) {
      fileContent += `=== ${entry.title} ===\n`;
      fileContent += `Date: ${new Date(entry.timestamp).toLocaleString()}\n\n`;
      fileContent += `${entry.content}\n\n\n`;
    }

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_journal_export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Journal exported successfully!");
  } catch (err) {
    console.error("Export error:", err);
    if (err.name !== "AbortError") {
      alert("Export was canceled or failed.");
    }
  }
}

// Image Handling
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.uploadedImage.src = e.target.result;
      elements.uploadedImage.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

// Settings functions
function toggleSettingsDropdown() {
  if (elements.settingsDropdown.style.display === "block") {
    elements.settingsDropdown.style.display = "none";
  } else {
    elements.settingsDropdown.style.display = "block";
  }
}

function changeTheme(theme) {
  state.currentTheme = theme;
  applySettings();
  saveSettings();
}

function toggleDarkMode() {
  state.darkMode = elements.darkModeToggle.checked;
  applySettings();
  saveSettings();
}

function changeBackground() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        state.backgroundImage = event.target.result;
        document.body.style.backgroundImage = `url(${state.backgroundImage})`;
        document.body.classList.add("custom-background");
        saveSettings();
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function removeBackground() {
  state.backgroundImage = null;
  document.body.style.backgroundImage = "";
  document.body.classList.remove("custom-background");
  saveSettings();
}

// Cover customization functions
function editJournalTitle() {
  const newTitle = prompt("Enter new journal title:", state.journalTitle);
  if (newTitle && newTitle.trim() !== "") {
    state.journalTitle = newTitle.trim();
    elements.journalTitle.textContent = state.journalTitle;
    saveSettings();
  }
}

function changeCoverImageHandler(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.coverImage.src = e.target.result;
      // Save to localStorage if you want to persist the cover image
      localStorage.setItem("journalCoverImage", e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
