    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const previewContainer = document.getElementById("previewContainer");
    const convert = document.getElementById("convert");
    const clearBtn = document.getElementById("clearBtn");
    const clearAll = document.getElementById("clearAll");
    const progressModal = document.getElementById("progressModal");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const currentProgress = document.getElementById("currentProgress");
    const fileCount = document.getElementById("fileCount");
    const fileCountDisplay = document.getElementById("fileCountDisplay");
    const cancelButton = document.getElementById("cancelButton");
    const pageSizeToggle = document.getElementById("pageSizeToggle");
    const compressToggle = document.getElementById("compressToggle");

    let imageFiles = [];
    let isProcessing = false;
    let cancelRequested = false;

    // Enable click on drop zone to open file browser
    dropZone.addEventListener("click", () => fileInput.click());

    // Handle both file browser and drag/drop input
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--primary)";
      dropZone.style.background = "var(--primary-light)";
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.style.borderColor = "var(--border)";
      dropZone.style.background = "var(--background)";
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--border)";
      dropZone.style.background = "var(--background)";
      handleFiles(e.dataTransfer.files);
    });

    // Clear buttons
    clearBtn.addEventListener("click", clearFiles);
    clearAll.addEventListener("click", clearFiles);

    function clearFiles() {
      imageFiles = [];
      updatePreview();
      fileInput.value = '';
      clearBtn.disabled = true;
      clearAll.disabled = true;
      convert.disabled = true;
    }

    function handleFiles(files) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
      
      if (newFiles.length === 0) return;
      
      imageFiles.push(...newFiles);
      updatePreview();
    }

    function updatePreview() {
      if (imageFiles.length === 0) {
        preview.innerHTML = `
          <div class="empty-state">
            <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p class="empty-state-text">No images selected yet. Drag & drop or click to add files.</p>
          </div>
        `;
        return;
      }
      
      preview.innerHTML = "";
      imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (event) {
          const div = document.createElement("div");
          div.className = "preview-item";
          div.dataset.index = index;
          
          div.innerHTML = `
            <div class="preview-item-actions">
              <div class="preview-item-action" data-index="${index}" data-action="remove">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </div>
            <img src="${event.target.result}" />
            <span>${file.name}</span>
          `;
          
          preview.appendChild(div);
        };
        reader.readAsDataURL(file);
      });
      
      // Update file count display
      fileCountDisplay.textContent = `${imageFiles.length} ${imageFiles.length === 1 ? 'file' : 'files'}`;
      
      // Enable/disable buttons
      convert.disabled = imageFiles.length === 0;
      clearBtn.disabled = imageFiles.length === 0;
      clearAll.disabled = imageFiles.length === 0;
    }

    // Handle remove item
    preview.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-action='remove']");
      if (!removeBtn) return;
      
      const index = parseInt(removeBtn.dataset.index);
      imageFiles.splice(index, 1);
      updatePreview();
    });

    // Make preview items sortable
    new Sortable(preview, {
      animation: 150,
      onEnd: function() {
        // Reorder imageFiles array based on new DOM order
        const newOrder = Array.from(preview.children).map(el => 
          imageFiles[parseInt(el.dataset.index)]
        );
        imageFiles = newOrder;
        
        // Update data-index attributes
        Array.from(preview.children).forEach((el, index) => {
          el.dataset.index = index;
        });
      }
    });

    convert.addEventListener("click", async () => {
      if (isProcessing || imageFiles.length === 0) return;
      
      isProcessing = true;
      cancelRequested = false;
      convert.disabled = true;
      progressModal.classList.add("active");
      
      const { jsPDF } = window.jspdf;
      const orderedItems = Array.from(preview.children);
      const docPages = [];
      
      const totalFiles = orderedItems.length;
      let processedFiles = 0;
      
      updateProgress(0, totalFiles, "Preparing images...");
      
      // Process all images first to get dimensions
      for (let item of orderedItems) {
        if (cancelRequested) break;
        
        const name = item.querySelector("span").textContent;
        const file = imageFiles.find(f => f.name === name);
        
        updateProgress(processedFiles, totalFiles, `Processing: ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`);
        
        try {
          const imgData = await toBase64(file);
          const img = new Image();
          img.src = imgData;
          
          await new Promise(resolve => {
            img.onload = () => {
              const width = img.width;
              const height = img.height;
              docPages.push({ data: imgData, width, height, name: file.name });
              processedFiles++;
              updateProgress(processedFiles, totalFiles, `Processed: ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`);
              resolve();
            };
            img.onerror = () => {
              processedFiles++;
              updateProgress(processedFiles, totalFiles, `Error processing: ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`);
              resolve();
            };
          });
        } catch (error) {
          processedFiles++;
          updateProgress(processedFiles, totalFiles, `Error: ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`);
          console.error("Error processing file:", file.name, error);
        }
      }
      
      if (cancelRequested) {
        updateProgress(0, totalFiles, "Conversion cancelled");
        setTimeout(() => {
          progressModal.classList.remove("active");
          isProcessing = false;
          convert.disabled = false;
        }, 1500);
        return;
      }
      
      if (docPages.length === 0) {
        updateProgress(0, totalFiles, "No valid images to convert");
        setTimeout(() => {
          progressModal.classList.remove("active");
          isProcessing = false;
          convert.disabled = false;
        }, 1500);
        return;
      }
      
      updateProgress(totalFiles, totalFiles, "Generating PDF document...");
      
      try {
        const useAutoSize = pageSizeToggle.checked;
        const compressImages = compressToggle.checked;
        let baseWidth, baseHeight;
        
        if (!useAutoSize) {
          // Use first image size for all pages
          baseWidth = docPages[0].width;
          baseHeight = docPages[0].height;
        }
        
        const first = docPages[0];
        const doc = new jsPDF({
          orientation: first.width > first.height ? "l" : "p",
          unit: "pt",
          format: useAutoSize ? [first.width, first.height] : [baseWidth, baseHeight],
          compress: compressImages
        });

        // Calculate image position to center it on fixed-size pages
        if (useAutoSize) {
          doc.addImage(first.data, "JPEG", 0, 0, first.width, first.height, undefined, compressImages ? 'FAST' : 'NONE');
        } else {
          const scale = Math.min(baseWidth / first.width, baseHeight / first.height);
          const scaledWidth = first.width * scale;
          const scaledHeight = first.height * scale;
          const x = (baseWidth - scaledWidth) / 2;
          const y = (baseHeight - scaledHeight) / 2;
          doc.addImage(first.data, "JPEG", x, y, scaledWidth, scaledHeight, undefined, compressImages ? 'FAST' : 'NONE');
        }

        for (let i = 1; i < docPages.length; i++) {
          if (cancelRequested) break;
          
          const { data, width, height, name } = docPages[i];
          
          if (useAutoSize) {
            doc.addPage([width, height]);
            doc.addImage(data, "JPEG", 0, 0, width, height, undefined, compressImages ? 'FAST' : 'NONE');
          } else {
            doc.addPage([baseWidth, baseHeight]);
            const scale = Math.min(baseWidth / width, baseHeight / height);
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            const x = (baseWidth - scaledWidth) / 2;
            const y = (baseHeight - scaledHeight) / 2;
            doc.addImage(data, "JPEG", x, y, scaledWidth, scaledHeight, undefined, compressImages ? 'FAST' : 'NONE');
          }
          
          // Update progress for each page added
          updateProgress(totalFiles + i, totalFiles * 2, `Adding: ${name.substring(0, 20)}${name.length > 20 ? '...' : ''}`);
        }
        
        if (!cancelRequested) {
          updateProgress(totalFiles * 2, totalFiles * 2, "Finalizing PDF...");
          doc.save("images.pdf");
          updateProgress(totalFiles * 2, totalFiles * 2, "PDF created successfully!");
        } else {
          updateProgress(0, totalFiles * 2, "Conversion cancelled");
        }
      } catch (error) {
        updateProgress(0, totalFiles * 2, "Error generating PDF");
        console.error("PDF generation error:", error);
      }
      
      setTimeout(() => {
        progressModal.classList.remove("active");
        isProcessing = false;
        convert.disabled = imageFiles.length === 0;
      }, cancelRequested ? 1000 : 1500);
    });

    function updateProgress(current, total, message) {
      const percentage = Math.min(100, Math.round((current / total) * 100));
      progressFill.style.width = `${percentage}%`;
      currentProgress.textContent = `${percentage}%`;
      fileCount.textContent = `${current}/${total} ${total === imageFiles.length ? 'images' : 'steps'}`;
      progressText.textContent = message;
    }

    function toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
      });
    }
    
    cancelButton.addEventListener("click", () => {
      if (isProcessing) {
        cancelRequested = true;
        cancelButton.disabled = true;
        cancelButton.textContent = "Cancelling...";
      }
    });