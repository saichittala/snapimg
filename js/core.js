// Ensure ImageProcessor is only declared once
if (!window.ImageProcessor) {
    class ImageProcessor {
      constructor() {
        this.files = [];
        this.initializeDropzone();
      }
  
      initializeDropzone() {
        const dropZone = document.querySelector('.upload-section');
        const fileInput = document.getElementById('file-input');
  
        // Check if elements exist before adding event listeners
        if (!dropZone || !fileInput) {
          console.error('Drop zone or file input element not found!');
          return;
        }
  
        // Clear existing event listeners to avoid duplication
        dropZone.removeEventListener('dragover', this.handleDragOver);
        dropZone.removeEventListener('dragleave', this.handleDragLeave);
        dropZone.removeEventListener('drop', this.handleDrop);
        fileInput.removeEventListener('change', this.handleFileInputChange);
  
        // Add new event listeners
        dropZone.addEventListener('dragover', this.handleDragOver);
        dropZone.addEventListener('dragleave', this.handleDragLeave);
        dropZone.addEventListener('drop', this.handleDrop);
        fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
  
        // Trigger file input when drop zone is clicked
        dropZone.addEventListener('click', () => fileInput.click());
      }
  
      handleDragOver = (e) => {
        e.preventDefault();
        const dropZone = document.querySelector('.upload-section');
        dropZone.classList.add('dragover');
      };
  
      handleDragLeave = () => {
        const dropZone = document.querySelector('.upload-section');
        dropZone.classList.remove('dragover');
      };
  
      handleDrop = (e) => {
        e.preventDefault();
        const dropZone = document.querySelector('.upload-section');
        dropZone.classList.remove('dragover');
        this.handleFiles(e.dataTransfer.files);
      };
  
      handleFileInputChange = (e) => {
        this.handleFiles(e.target.files);
      };
  
      handleFiles(files) {
        if (!files || files.length === 0) {
          console.error('No files selected!');
          return;
        }
  
        // Clear existing files
        this.files = [];
  
        // Add new files
        this.files = [...files];
        this.displayPreviews();
  
        // Update file counter
        const fileCounter = document.getElementById('file-counter');
        if (fileCounter) {
          fileCounter.textContent = `${this.files.length} files selected`;
        }
      }
  
      displayPreviews() {
        const previewContainer = document.querySelector('.image-preview');
        if (!previewContainer) {
          console.error('Preview container not found!');
          return;
        }
  
        previewContainer.innerHTML = ''; // Clear existing previews
  
        this.files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewItem = this.createPreviewItem(e.target.result, file.name, index);
            previewContainer.appendChild(previewItem);
          };
          reader.readAsDataURL(file);
        });
      }
  
      createPreviewItem(imageSrc, fileName, index) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
          <img src="${imageSrc}" alt="${fileName}" style="width:100%" loading="lazy">
          <div class="processing-overlay" style="display:none">
            <div class="loader"></div>
          </div>
          <img src="img/Delete.svg" alt="Delete" class="delete-btn" data-index="${index}">×>
        `;
  
        // Add delete functionality
        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering parent click events
          this.deleteImage(index);
        });
  
        return item;
      }
  
      deleteImage(index) {
        this.files.splice(index, 1); // Remove the file from the array
        this.displayPreviews(); // Refresh the previews
  
        // Update file counter
        const fileCounter = document.getElementById('file-counter');
        if (fileCounter) {
          fileCounter.textContent = `${this.files.length} files selected`;
        }
      }
  
      async processImages(processFn) {
        const previewItems = document.querySelectorAll('.preview-item');
        if (previewItems.length === 0) {
          console.error('No images to process!');
          return;
        }
  
        const promises = this.files.map(async (file, index) => {
          const previewItem = previewItems[index];
          if (!previewItem) {
            console.error('Preview item not found for file:', file.name);
            return null;
          }
  
          const overlay = previewItem.querySelector('.processing-overlay');
          if (overlay) {
            overlay.style.display = 'flex';
          }
  
          try {
            const processedBlob = await processFn(file);
            if (overlay) {
              overlay.style.display = 'none';
            }
            return { blob: processedBlob, name: file.name };
          } catch (error) {
            console.error('Processing error:', error);
            return null;
          }
        });
  
        const results = await Promise.all(promises);
        return results.filter(result => result !== null);
      }
  
      downloadFiles(processedFiles) {
        if (!processedFiles || processedFiles.length === 0) {
          console.error('No files to download!');
          return;
        }
  
        if (processedFiles.length === 1) {
          this.downloadSingle(processedFiles[0]);
        } else {
          this.downloadZip(processedFiles);
        }
      }
  
      downloadSingle(file) {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getOutputName(file.name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
  
      async downloadZip(files) {
        const zip = new JSZip();
  
        files.forEach(file => {
          zip.file(this.getOutputName(file.name), file.blob);
        });
  
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed-images.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
  
      getOutputName(originalName) {
        // Default implementation, can be overridden in child classes
        return originalName;
      }
    }
  
    // Make ImageProcessor globally available
    window.ImageProcessor = ImageProcessor;
  }



    // Convert the total size dynamically into different units
    function formatSizeUnits(bytes) {
      if (bytes >= 1e12) {
        return (bytes / 1e12).toFixed(2) + ' TB';
      } else if (bytes >= 1e9) {
        return (bytes / 1e9).toFixed(2) + ' GB';
      } else if (bytes >= 1e6) {
        return (bytes / 1e6).toFixed(2) + ' MB';
      } else if (bytes >= 1e3) {
        return (bytes / 1e3).toFixed(2) + ' KB';
      } else {
        return bytes + ' B';
      }
    }
  
    // Example: Update counter dynamically
    let fileCount = 0; // Example static number
    let totalSizeBytes = 0; // 18.635 TB in bytes
  
    document.getElementById("files-count").textContent = fileCount.toLocaleString();
    document.getElementById("size-count").textContent = formatSizeUnits(totalSizeBytes);