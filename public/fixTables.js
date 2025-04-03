// Script to fix table rendering in MARP slides
document.addEventListener('DOMContentLoaded', function() {
  // Style tables
  const style = document.createElement('style');
  style.textContent = `
    table {
      border-collapse: collapse !important;
      margin: 1em auto !important;
      width: 90% !important;
      max-width: 1000px !important;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1) !important;
      overflow: hidden !important;
      border-radius: 4px !important;
      font-size: 0.9em !important;
      border: 1px solid #ddd !important;
    }
    th, td {
      border: 1px solid #ddd !important;
      padding: 12px 15px !important;
      text-align: left !important;
      font-size: 0.9em !important;
    }
    th {
      background-color: #f8f9fa !important;
      color: #333 !important;
      font-weight: bold !important;
      text-transform: uppercase !important;
      letter-spacing: 0.03em !important;
      border-bottom: 2px solid #ddd !important;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2 !important;
    }
    tr:hover {
      background-color: #f5f5f5 !important;
    }
    .checkmark {
      color: green !important;
      font-weight: bold !important;
      font-size: 1.2em !important;
    }
    .crossmark {
      color: red !important;
      font-weight: bold !important;
      font-size: 1.2em !important;
    }
  `;
  document.head.appendChild(style);

  // Process tables
  document.querySelectorAll('table').forEach(table => {
    // Add a wrapper div for better table display
    if (!table.parentNode.classList.contains('table-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      wrapper.style.margin = '1.5em auto';
      wrapper.style.width = '90%';
      wrapper.style.maxWidth = '1000px';
      wrapper.style.overflowX = 'auto';
      wrapper.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      wrapper.style.borderRadius = '4px';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }

    // Ensure table headers are properly styled
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td');
      if (cells.length > 0) {
        cells.forEach(cell => {
          // Convert first row cells to th if they're not already
          if (cell.tagName.toLowerCase() === 'td') {
            const th = document.createElement('th');
            th.innerHTML = cell.innerHTML;
            cell.parentNode.replaceChild(th, cell);
          }
        });
      }
    }

    // Process checkmarks and crossmarks
    table.querySelectorAll('td').forEach(cell => {
      if (cell.textContent.includes('✅')) {
        cell.classList.add('checkmark');
      } else if (cell.textContent.includes('❌')) {
        cell.classList.add('crossmark');
      }
    });
  });
});
