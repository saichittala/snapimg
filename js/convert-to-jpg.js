class JPGConverter extends ImageProcessor {
  constructor() {
      super();
      this.processBtn = document.getElementById('process-btn');
      this.downloadBtn = document.getElementById('download-btn');
      this.progressBar = document.querySelector('.progress');
      this.progressText = document.getElementById('progress-text');
      this.fileCounter = document.getElementById('file-counter');
      this.processedFiles = [];
      this.bindEvents();
  }

  bindEvents() {
      if (this.processBtn) {
          this.processBtn.addEventListener('click', () => this.processImages());
      }
      if (this.downloadBtn) {
          this.downloadBtn.addEventListener('click', () => this.downloadProcessedFiles());
      }
  }

  async processImages() {
      try {
          this.processBtn.disabled = true;
          this.progressBar.style.width = '0%';
          this.progressText.textContent = '0% Completed';
          
          if (!this.files || this.files.length === 0) {
              alert('No files selected. Please upload images first.');
              this.processBtn.disabled = false;
              return;
          }

          const totalFiles = this.files.length;
          let processedCount = 0;
          
          const supportedTypes = ['image/png', 'image/webp', 'image/gif', 'image/jpeg'];
          this.processedFiles = [];

          for (let file of this.files) {
              if (!supportedTypes.includes(file.type)) {
                  alert(`Unsupported file type: ${file.name}. Only PNG, WEBP, GIF, and JPEG allowed.`);
                  continue;
              }
              try {
                  const processedBlob = await this.convertImage(file);
                  this.processedFiles.push({ blob: processedBlob, name: file.name });
              } catch (error) {
                  console.error(`Error processing file ${file.name}:`, error);
              }
              processedCount++;
              const progress = Math.floor((processedCount / totalFiles) * 100);
              this.progressBar.style.width = `${progress}%`;
              this.progressText.textContent = `${progress}% Completed`;
          }

          if (this.processedFiles.length > 0) {
              this.processBtn.style.display = 'none';
              this.downloadBtn.style.display = 'block';
          } else {
              alert('No valid images were processed.');
          }
      } catch (error) {
          console.error('Conversion error:', error);
          alert('Error processing images. Please try again.');
      } finally {
          this.processBtn.disabled = false;
      }
  }

  downloadProcessedFiles() {
      if (!this.processedFiles.length) {
          alert('No processed files to download. Please process images first.');
          return;
      }
      
      if (this.processedFiles.length === 1) {
          const file = this.processedFiles[0];
          const url = URL.createObjectURL(file.blob);
          this.triggerDownload(url, this.getOutputName(file.name));
      } else {
          const zip = new JSZip();
          this.processedFiles.forEach(file => {
              zip.file(this.getOutputName(file.name), file.blob, { binary: true });
          });
          zip.generateAsync({ type: 'blob' }).then(content => {
              const url = URL.createObjectURL(content);
              this.triggerDownload(url, 'snapimg_processed-images.zip');
            }).catch(error => {
              console.error('Error creating ZIP:', error);
              alert('Failed to create ZIP file. Please try again.');
          });
      }
      
      this.resetUI();
  }

  triggerDownload(url, filename) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  async convertImage(file) {
      return new Promise((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.src = url;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(blob => {
                  if (!blob) {
                      reject(new Error('Failed to convert image.'));
                      return;
                  }
                  resolve(blob);
              }, 'image/jpeg', 0.85);
              URL.revokeObjectURL(url);
          };
          img.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error('Error loading image.'));
          };
      });
  }

  getOutputName(originalName) {
      return originalName.replace(/\.[^/.]+$/, '') + '_converted.jpg';
  }

  resetUI() {
      this.processBtn.style.display = 'block';
      this.downloadBtn.style.display = 'none';
      this.progressBar.style.width = '0%';
      this.progressText.textContent = '0% Completed';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.imageProcessor = new JPGConverter();
});
