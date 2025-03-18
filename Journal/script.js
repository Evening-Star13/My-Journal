// DOM Elements
const entryTitle = document.getElementById("entryTitle");
const journalEntry = document.getElementById("journalEntry");
const saveNote = document.getElementById("saveNote");
const updateNote = document.getElementById("updateNote");
const tableOfContents = document.getElementById("tableOfContents");
const downloadDatabase = document.getElementById("downloadDatabase");
const entriesList = document.getElementById("entriesList");
const modal = document.getElementById("entryModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalEditContent = document.getElementById("modalEditContent");
const modalEditButton = document.getElementById("modalEditButton");
const modalSaveButton = document.getElementById("modalSaveButton");
const modalDeleteButton = document.getElementById("modalDeleteButton");
const closeModal = document.querySelector(".close");

// Journal database
let database = [];
let editingEntryId = null; // Track the ID of the entry being edited
let currentModalEntryId = null; // Track the ID of the entry in the modal
let fileHandle = null; // Track the file handle for saving the database

// Load entries from localStorage (if available)
function loadDatabase() {
  const savedData = localStorage.getItem("journalDatabase");
  if (savedData) {
    database = JSON.parse(savedData);
    loadEntries();
  }
}

// Save entries to localStorage
function saveDatabase() {
  localStorage.setItem("journalDatabase", JSON.stringify(database));
}

// Save Note Button
saveNote.addEventListener("click", async () => {
  const title = entryTitle.value.trim();
  const content = journalEntry.value.trim();
  if (title && content) {
    const entry = {
      id: Date.now(), // Unique ID based on timestamp
      title: title,
      content: content,
      timestamp: new Date().toISOString(),
    };
    database.push(entry);
    saveDatabase();

    // Save JSON file to user-selected location
    try {
      fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(database, null, 2));
      await writable.close();
      alert("Entry saved successfully and file saved to your chosen location!");
    } catch (err) {
      console.error("Error saving file:", err);
      alert("Entry saved locally, but file save was canceled or failed.");
    }

    entryTitle.value = "";
    journalEntry.value = "";
    loadEntries();
  } else {
    alert("Please enter a title and write something before saving.");
  }
});

// Update Note Button
updateNote.addEventListener("click", async () => {
  const title = entryTitle.value.trim();
  const content = journalEntry.value.trim();
  if (title && content && editingEntryId !== null) {
    const entryIndex = database.findIndex(
      (entry) => entry.id === editingEntryId
    );
    if (entryIndex !== -1) {
      database[entryIndex].title = title;
      database[entryIndex].content = content;
      database[entryIndex].timestamp = new Date().toISOString();
      saveDatabase();

      // Save JSON file to user-selected location
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(database, null, 2));
        await writable.close();
        alert(
          "Entry updated successfully and file saved to your chosen location!"
        );
      } else {
        // If no file handle exists, prompt the user to choose a save location
        try {
          fileHandle = await window.showSaveFilePicker({
            types: [
              {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(database, null, 2));
          await writable.close();
          alert(
            "Entry updated successfully and file saved to your chosen location!"
          );
        } catch (err) {
          console.error("Error saving file:", err);
          alert("Entry updated locally, but file save was canceled or failed.");
        }
      }

      entryTitle.value = "";
      journalEntry.value = "";
      editingEntryId = null;
      updateNote.style.display = "none";
      saveNote.style.display = "inline-block";
      loadEntries();
    }
  } else {
    alert("Please enter a title and write something before updating.");
  }
});

// Table of Contents Button
tableOfContents.addEventListener("click", () => {
  entriesList.style.display =
    entriesList.style.display === "none" ? "block" : "none";
});

// Load Entries
function loadEntries() {
  entriesList.innerHTML = "";
  database.forEach((entry) => {
    const entryItem = document.createElement("div");
    entryItem.className = "entry-item";
    entryItem.innerHTML = `
      <p><strong>${entry.title}</strong></p>
      <p><em>${new Date(entry.timestamp).toLocaleString()}</em></p>
    `;
    entryItem.addEventListener("click", () => openModal(entry));
    entriesList.appendChild(entryItem);
  });
}

// Open Modal
function openModal(entry) {
  currentModalEntryId = entry.id;
  modalTitle.textContent = entry.title;
  modalContent.textContent = entry.content;
  modalEditContent.value = entry.content;
  modal.style.display = "block";
}

// Close Modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  resetModal();
});

// Close Modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    resetModal();
  }
});

// Reset Modal to default state
function resetModal() {
  modalContent.style.display = "block";
  modalEditContent.style.display = "none";
  modalEditButton.style.display = "inline-block";
  modalSaveButton.style.display = "none";
}

// Edit Button in Modal
modalEditButton.addEventListener("click", () => {
  modalContent.style.display = "none";
  modalEditContent.style.display = "block";
  modalEditButton.style.display = "none";
  modalSaveButton.style.display = "inline-block";
});

// Save Changes Button in Modal
modalSaveButton.addEventListener("click", async () => {
  const updatedContent = modalEditContent.value.trim();
  if (updatedContent && currentModalEntryId !== null) {
    const entryIndex = database.findIndex(
      (entry) => entry.id === currentModalEntryId
    );
    if (entryIndex !== -1) {
      database[entryIndex].content = updatedContent;
      database[entryIndex].timestamp = new Date().toISOString();
      saveDatabase();

      // Save JSON file to user-selected location
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(database, null, 2));
        await writable.close();
        alert(
          "Entry updated successfully and file saved to your chosen location!"
        );
      } else {
        // If no file handle exists, prompt the user to choose a save location
        try {
          fileHandle = await window.showSaveFilePicker({
            types: [
              {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(database, null, 2));
          await writable.close();
          alert(
            "Entry updated successfully and file saved to your chosen location!"
          );
        } catch (err) {
          console.error("Error saving file:", err);
          alert("Entry updated locally, but file save was canceled or failed.");
        }
      }

      loadEntries();
      resetModal();
      modal.style.display = "none";
    }
  } else {
    alert("Please write something before saving.");
  }
});

// Delete Entry Button in Modal
modalDeleteButton.addEventListener("click", async () => {
  if (currentModalEntryId !== null) {
    const entryIndex = database.findIndex(
      (entry) => entry.id === currentModalEntryId
    );
    if (entryIndex !== -1) {
      database.splice(entryIndex, 1); // Remove the entry from the database
      saveDatabase();

      // Save JSON file to user-selected location
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(database, null, 2));
        await writable.close();
        alert(
          "Entry deleted successfully and file saved to your chosen location!"
        );
      } else {
        // If no file handle exists, prompt the user to choose a save location
        try {
          fileHandle = await window.showSaveFilePicker({
            types: [
              {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(database, null, 2));
          await writable.close();
          alert(
            "Entry deleted successfully and file saved to your chosen location!"
          );
        } catch (err) {
          console.error("Error saving file:", err);
          alert("Entry deleted locally, but file save was canceled or failed.");
        }
      }

      loadEntries();
      modal.style.display = "none";
    }
  }
});

// Download Database Button
downloadDatabase.addEventListener("click", async () => {
  try {
    fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "JSON Files",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(database, null, 2));
    await writable.close();
    alert("Database file saved to your chosen location!");
  } catch (err) {
    console.error("Error saving file:", err);
    alert("File save was canceled or failed.");
  }
});

// Load database when the app starts
loadDatabase();
