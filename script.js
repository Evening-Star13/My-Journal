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
};

// App State
const state = {
  database: [],
  editingEntryId: null,
  currentModalEntryId: null,
  fileHandle: null,
};

// Initialize the app
function init() {
  loadDatabase();
  setupEventListeners();
}

// Load entries from localStorage
function loadDatabase() {
  const savedData = localStorage.getItem("journalDatabase");
  if (savedData) {
    state.database = JSON.parse(savedData);
    renderEntries();
  }
}

// Save entries to localStorage
function saveDatabase() {
  localStorage.setItem("journalDatabase", JSON.stringify(state.database));
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

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });
}

// UI Navigation
function showJournal() {
  elements.cover.style.display = "none";
  elements.journalApp.style.display = "block";
}

function showCover() {
  elements.journalApp.style.display = "none";
  elements.cover.style.display = "block";
  resetEntryForm();
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

    // Save PDF file
    try {
      entry.fileHandle = await window.showSaveFilePicker({
        types: [
          { description: "PDF Files", accept: { "application/pdf": [".pdf"] } },
        ],
        suggestedName: `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`,
      });
      await writePDFToFile(entry);
      alert("Entry saved successfully!");
    } catch (err) {
      console.error("File save error:", err);
      alert("Entry saved locally, but file save was canceled or failed.");
    }

    state.database.push(entry);
    saveDatabase();
    resetEntryForm();
    renderEntries();
  } catch (error) {
    console.error("Save error:", error);
    alert("An error occurred while saving the entry.");
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

    // Update PDF file
    try {
      if (!entry.fileHandle) {
        entry.fileHandle = await window.showSaveFilePicker({
          types: [
            {
              description: "PDF Files",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
          suggestedName: `${title
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()}.pdf`,
        });
      }
      await writePDFToFile(entry);
      alert("Entry updated successfully!");
    } catch (err) {
      console.error("File save error:", err);
      alert("Entry updated locally, but file save was canceled or failed.");
    }

    saveDatabase();
    resetEntryForm();
    renderEntries();
  } catch (error) {
    console.error("Update error:", error);
    alert("An error occurred while updating the entry.");
  }
}

// File Operations
async function writePDFToFile(entry) {
  const writable = await entry.fileHandle.createWritable();
  const pdfContent = await generatePDF(entry);
  await writable.write(pdfContent);
  await writable.close();
}

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

// PDF Generation
async function generatePDF(entry) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 10;
  let yOffset = 10;

  // Add title
  doc.setFontSize(18);
  doc.text(entry.title, margin, yOffset);
  yOffset += lineHeight * 1.5;

  // Add date
  doc.setFontSize(12);
  doc.text(new Date(entry.timestamp).toLocaleString(), margin, yOffset);
  yOffset += lineHeight * 1.5;

  // Add content
  doc.setFontSize(14);
  const contentLines = doc.splitTextToSize(entry.content, maxLineWidth);
  for (const line of contentLines) {
    if (yOffset + lineHeight > pageHeight - margin) {
      doc.addPage();
      yOffset = margin;
    }
    doc.text(line, margin, yOffset);
    yOffset += lineHeight;
  }

  // Add image if exists
  if (entry.image) {
    const img = new Image();
    img.src = entry.image;
    await new Promise((resolve) => {
      img.onload = () => {
        const imgProps = doc.getImageProperties(img);
        const imgWidth = 100;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const xOffset = (pageWidth - imgWidth) / 2;

        if (yOffset + imgHeight > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }

        doc.addImage(img, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
        resolve();
      };
    });
  }

  return doc.output("arraybuffer");
}

async function generateDatabasePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let isFirstPage = true;

  for (const entry of state.database) {
    if (!isFirstPage) {
      doc.addPage();
    } else {
      isFirstPage = false;
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 10;
    let yOffset = 10;

    // Add title
    doc.setFontSize(18);
    doc.text(entry.title, margin, yOffset);
    yOffset += lineHeight * 1.5;

    // Add date
    doc.setFontSize(12);
    doc.text(new Date(entry.timestamp).toLocaleString(), margin, yOffset);
    yOffset += lineHeight * 1.5;

    // Add content
    doc.setFontSize(14);
    const contentLines = doc.splitTextToSize(entry.content, maxLineWidth);
    for (const line of contentLines) {
      if (yOffset + lineHeight > pageHeight - margin) {
        doc.addPage();
        yOffset = margin;
      }
      doc.text(line, margin, yOffset);
      yOffset += lineHeight;
    }

    // Add image if exists
    if (entry.image) {
      const img = new Image();
      img.src = entry.image;
      await new Promise((resolve) => {
        img.onload = () => {
          const imgProps = doc.getImageProperties(img);
          const imgWidth = 100;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          const xOffset = (pageWidth - imgWidth) / 2;

          if (yOffset + imgHeight > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
          }

          doc.addImage(img, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
          resolve();
        };
      });
    }
  }

  return doc.output("arraybuffer");
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
      state.database[entryIndex].content = updatedContent;
      state.database[entryIndex].timestamp = new Date().toISOString();
      saveDatabase();

      // Update PDF file
      try {
        const entry = state.database[entryIndex];
        if (entry.fileHandle) {
          await writePDFToFile(entry);
          alert("Entry updated successfully!");
        }
      } catch (err) {
        console.error("File save error:", err);
        alert("Entry updated locally, but file save failed.");
      }

      renderEntries();
      closeModal();
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
    state.fileHandle = await window.showSaveFilePicker({
      types: [
        { description: "PDF Files", accept: { "application/pdf": [".pdf"] } },
      ],
      suggestedName: "my_journal_export.pdf",
    });

    const writable = await state.fileHandle.createWritable();
    const pdfContent = await generateDatabasePDF();
    await writable.write(pdfContent);
    await writable.close();

    alert("Journal exported successfully!");
  } catch (err) {
    console.error("Export error:", err);
    alert("Export was canceled or failed.");
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

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
