# Image to PDF Converter

![Project Screenshot](https://via.placeholder.com/800x500?text=Image+to+PDF+Converter+Screenshot)

A lightweight, client-side web application that converts multiple images into a single PDF document with customizable settings.

## Features

- **Drag & Drop Interface**: Easily add images by dragging and dropping or clicking to browse
- **Image Preview**: Visual grid of all selected images before conversion
- **Customizable PDF Settings**:
  - Auto-size pages to match each image's dimensions
  - Fixed-size pages using the first image's dimensions
  - Image compression to reduce PDF file size
- **Interactive Preview**:
  - Reorder images by dragging
  - Remove individual images
  - Clear all images with one click
- **Progress Tracking**: Real-time progress indicator during PDF generation
- **Responsive Design**: Works on desktop and mobile devices
- **No Server Required**: All processing happens in the browser

## How to Use

1. **Add Images**:
   - Click the drop zone to browse for images
   - Or drag and drop image files directly onto the drop zone

2. **Configure Settings** (optional):
   - Toggle between auto-size or fixed-size pages
   - Enable/disable image compression

3. **Preview & Arrange**:
   - View all selected images in the preview grid
   - Drag to reorder images
   - Click the × icon to remove individual images

4. **Convert to PDF**:
   - Click the "Convert to PDF" button
   - Wait for processing to complete
   - The PDF will automatically download to your device

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript
- **Dependencies**:
  - [jsPDF](https://parall.ax/products/jspdf) - PDF generation library
  - [SortableJS](https://sortablejs.github.io/Sortable/) - Drag and drop functionality
- **Browser Support**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Installation

No installation required! Simply open the HTML file in any modern web browser.

For local development:
1. Clone or download this repository
2. Open `index.html` in your browser

Or, Simply visit the live demo: 👉 [Here](https://ihefty.github.io/img2pdf/)

## License

MIT License - feel free to use and modify

## Support

For support or feature requests, please [open an issue](https://github.com/yourusername/image-to-pdf/issues).

---

**Note**: This is a client-side application. All image processing happens in your browser - no images are uploaded to any server.
