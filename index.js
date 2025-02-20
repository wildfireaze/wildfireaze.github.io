// GLOBAL VARIABLES
const placeholderImage = 'https://via.placeholder.com/200?text=Image+Not+Found'; // Placeholder for missing images
let originalImages = [];         // Stores the original image list
let currentFilteredImages = [];  // Stores the currently filtered (or full) image list
let sortDirection = 'ascending'; // Ascending or descending sort
let filterRegion = 'all';
let filterDateRange = { start: null, end: null }; // Date range filter
let filterSatellite = 'all';
let filterInstrument = 'all';
let currentModalImageData = null;
let currentPage = 1;
const pageSize = 10;            // Number of images per page

// BUTTON ELEMENTS
const loadMore = document.getElementById("loadMore");
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// MODAL ELEMENT
const modal = document.getElementById("image-modal");

/* ---------------------------------------
   LOAD MORE & SCROLL-TO-TOP FUNCTIONALITY
---------------------------------------- */
function incrementPage() {
  currentPage += 1;
  // Display the newly extended slice of filtered images
  displayImages(currentFilteredImages.slice(0, currentPage * pageSize));
  toggleLoadMoreButton();
}

// Attach the event listener to the button (only once!)
loadMore.addEventListener("click", incrementPage);

function toggleLoadMoreButton() {
  // If there are more images left to show, display the button
  if (currentFilteredImages.length > currentPage * pageSize) {
    loadMore.style.display = 'block';
  } else {
    loadMore.style.display = 'none';
  }
}

// Show or hide the "scroll to top" button when scrolling
window.onscroll = function() {
  if (document.documentElement.scrollTop > 300) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------------------------------
   MODAL FUNCTIONS
---------------------------------------- */
function openModal(imageSrc, mapSrc, details) {
  document.getElementById("modal-image").src = imageSrc;
  document.getElementById("map-frame").src = mapSrc;
  document.getElementById("modal-info").innerHTML = details;
  modal.style.display = "flex"; // Show modal
}

// Close the modal when clicking on the dark background
modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none"; // Hide modal
  }
});

function closeModal() {
  modal.style.display = 'none';
}

/* ---------------------------------------
   FORMAT DATE UTILITY
---------------------------------------- */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = (d.getMonth() + 1).toString();
  let day = d.getDate().toString();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return `${year}-${month}-${day}`;
}

/* ---------------------------------------
   FILTERS AND SORTING
---------------------------------------- */
function applyFiltersAndSorting(images) {
  let filteredImages = [...images];

  // Filter by region
  if (filterRegion !== 'all') {
    filteredImages = filteredImages.filter(
      image => image.city === filterRegion || image.district === filterRegion
    );
  }

  // Filter by date range
  if (filterDateRange.start && filterDateRange.end) {
    filteredImages = filteredImages.filter(image => {
      const imageDate = new Date(image.acq_date);
      return (
        imageDate >= new Date(filterDateRange.start) &&
        imageDate <= new Date(filterDateRange.end)
      );
    });
  }

  // Filter by satellite
  if (filterSatellite !== 'all') {
    filteredImages = filteredImages.filter(
      image => image.satellite === filterSatellite
    );
  }

  // Filter by instrument
  if (filterInstrument !== 'all') {
    filteredImages = filteredImages.filter(
      image => image.instrument === filterInstrument
    );
  }

  // Sort by acquisition date
  filteredImages.sort((a, b) => {
    const dateA = new Date(a.acq_date);
    const dateB = new Date(b.acq_date);
    return sortDirection === 'ascending' ? dateA - dateB : dateB - dateA;
  });

  // Reset pagination and update the global filtered images variable
  currentPage = 1;
  currentFilteredImages = filteredImages;

  // Display only the items for the first page
  displayImages(currentFilteredImages.slice(0, currentPage * pageSize));

  // Toggle the "Load More" button visibility based on data availability
  toggleLoadMoreButton();
}

// Add event listeners for filters and sorting
document.getElementById('sort-direction').addEventListener('change', (e) => {
  sortDirection = e.target.value;
  applyFiltersAndSorting(originalImages);
});

document.getElementById('filter-region').addEventListener('change', (e) => {
  filterRegion = e.target.value;
  applyFiltersAndSorting(originalImages);
});

document.getElementById('date-range-start').addEventListener('change', (e) => {
  filterDateRange.start = e.target.value;
  applyFiltersAndSorting(originalImages);
});

document.getElementById('date-range-end').addEventListener('change', (e) => {
  filterDateRange.end = e.target.value;
  applyFiltersAndSorting(originalImages);
});

document.getElementById('filter-satellite').addEventListener('change', (e) => {
  filterSatellite = e.target.value;
  applyFiltersAndSorting(originalImages);
});

document.getElementById('filter-instrument').addEventListener('change', (e) => {
  filterInstrument = e.target.value;
  applyFiltersAndSorting(originalImages);
});



// New: Download both image and info as a ZIP
document.getElementById("downloadBothBtn").addEventListener("click", async () => {
  // Get the region name from current image data (or use "Unknown")
  let regionName = currentModalImageData && currentModalImageData.city ? currentModalImageData.city : "Unknown";
  let imageFilename = `imageFrom${regionName}.jpg`;
  let infoFilename = `infoFrom${regionName}.txt`;

  // Get the text from the modal info section
  const modalInfo = document.getElementById("modal-info");
  const infoText = modalInfo.innerText || modalInfo.textContent;

  // Create a new zip instance
  const zip = new JSZip();

  try {
    // Fetch the image as a blob
    const response = await fetch(currentModalImageData.src);
    if (!response.ok) throw new Error("Network response was not ok");
    const imageBlob = await response.blob();
    // Add the image blob to the zip
    zip.file(imageFilename, imageBlob);
  } catch (error) {
    console.error("Error fetching image:", error);
    // Optionally add a placeholder message if image fetch fails
    zip.file(imageFilename, "Image could not be fetched.");
  }

  // Add the info text to the zip
  zip.file(infoFilename, infoText);

  // Generate the zip file and trigger its download
  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `downloadedDataFrom${regionName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });
});



document.getElementById("downloadFilteredBtn").addEventListener("click", async () => {
  const zip = new JSZip();
  const images = currentFilteredImages; // the filtered images array

  if (!images.length) {
    alert("No images available for download.");
    return;
  }

  // Process each image and its info
  const promises = images.map(async (image, index) => {
    // Use the city as region name or default to "Unknown"
    const regionName = image.city ? image.city : "Unknown";
    // Build unique file names for the image and its info
    const imageFileName = `imageFrom(${regionName})_${index + 1}.jpg`;
    const infoFileName = `infoFrom(${regionName})_${index + 1}.txt`;

    // Construct the info text using image properties
    const infoText = [
      `Description: ${image.description}\n`,
      `Coordinates: ${image.latitude}, ${image.longitude}\n`,
      `City: ${image.city}\n`,
      `District: ${image.district}\n`,
      `Brightness: ${image.brightness}\n`,
      `Scan: ${image.scan}\n`,
      `Track: ${image.track}\n`,
      `Acquisition Date: ${image.acq_date}\n`,
      `Acquisition Time: ${image.acq_time}\n`,
      `Satellite: ${image.satellite}\n`,
      `Instrument: ${image.instrument}\n`,
      `Confidence: ${image.confidence}\n`,
      `Version: ${image.version}\n`,
      `Bright T31: ${image.bright_t31}\n`,
      `FRP: ${image.frp}\n`,
      `Day/Night: ${image.daynight}\n`
    ].join("\n");

    try {
      const response = await fetch(image.src);
      if (!response.ok) {
        throw new Error("Image fetch failed");
      }
      const blob = await response.blob();
      zip.file(imageFileName, blob);
    } catch (error) {
      console.error(`Error fetching image ${image.src}:`, error);
      // Add a text file noting the failure instead of an image
      zip.file(imageFileName, "Image could not be fetched.");
    }
    zip.file(infoFileName, infoText);
  });

  // Wait for all image fetches and file additions to complete
  await Promise.all(promises);

  // Generate the zip file and trigger its download
  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "filtered_download.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });
});

/* ---------------------------------------
   POPULATE FILTER DROPDOWNS
---------------------------------------- */
function populateRegionsFromImages(images) {
  const regionSet = new Set(images.map(image => image.city).filter(Boolean));
  const regions = Array.from(regionSet).sort();
  
  const regionFilter = document.getElementById('filter-region');
  regionFilter.innerHTML = '<option value="all">All</option>';
  
  regions.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });
}

function populateSatelliteAndInstrument(images) {
  const satelliteSet = new Set(images.map(image => image.satellite).filter(Boolean));
  const instrumentSet = new Set(images.map(image => image.instrument).filter(Boolean));

  const satelliteFilter = document.getElementById('filter-satellite');
  const instrumentFilter = document.getElementById('filter-instrument');

  // Clear existing options
  satelliteFilter.innerHTML = '<option value="all">All</option>';
  instrumentFilter.innerHTML = '<option value="all">All</option>';

  satelliteSet.forEach(satellite => {
    const option = document.createElement('option');
    option.value = satellite;
    option.textContent = satellite;
    satelliteFilter.appendChild(option);
  });

  instrumentSet.forEach(instrument => {
    const option = document.createElement('option');
    option.value = instrument;
    option.textContent = instrument;
    instrumentFilter.appendChild(option);
  });
}

/* ---------------------------------------
   DISPLAY IMAGES
---------------------------------------- */
function displayImages(imageList) {
  const gallery = document.getElementById('image-gallery');
  gallery.innerHTML = '';

  if (!imageList.length) {
    gallery.innerHTML = '<p>No images available to display.</p>';
    return;
  }

  imageList.forEach(image => {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';

    const img = document.createElement('img');
    img.src = image.src || placeholderImage;
    img.alt = image.description;
    img.onerror = () => {
      img.src = placeholderImage; // Use placeholder for missing images
      console.warn(`Image failed to load: ${image.src}`);
    };
    img.onclick = () => showImageDetails(image);

    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = `${image.description} - ${image.city} (${image.district})`;

    imageItem.appendChild(img);
    imageItem.appendChild(info);
    gallery.appendChild(imageItem);
  });
}

function showImageDetails(image) {
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalInfo = document.getElementById('modal-info');
  const mapFrame = document.getElementById('map-frame');

  modal.style.display = 'block';
  modalImage.src = image.src;
  // Indicate that the image is clickable
  modalImage.style.cursor = "pointer";
  // Add click event to open the image in a new tab
  modalImage.onclick = () => window.open(image.src, '_blank');
  currentModalImageData = image;

  modalInfo.innerHTML = `
    <div style="display: flex; flex-direction: row; justify-content: space-between;">
      <div>
        <p><strong>Description:</strong> ${image.description}</p>
        <p><strong>Coordinates:</strong> ${image.latitude}, ${image.longitude}</p>
        <p><strong>City:</strong> ${image.city}</p>
        <p><strong>District:</strong> ${image.district}</p>
        <p><strong>Brightness:</strong> ${image.brightness}</p>
        <p><strong>Scan:</strong> ${image.scan}</p>
        <p><strong>Track:</strong> ${image.track}</p>
        <p><strong>Acquisition Date:</strong> ${image.acq_date}</p>
      </div>
      <div>
        <p><strong>Acquisition Time:</strong> ${image.acq_time}</p>
        <p><strong>Satellite:</strong> ${image.satellite}</p>
        <p><strong>Instrument:</strong> ${image.instrument}</p>
        <p><strong>Confidence:</strong> ${image.confidence}</p>
        <p><strong>Version:</strong> ${image.version}</p>
        <p><strong>Bright T31:</strong> ${image.bright_t31}</p>
        <p><strong>FRP:</strong> ${image.frp}</p>
        <p><strong>Day/Night:</strong> ${image.daynight}</p>
      </div>
    </div>
  `;

  const mapUrl = `https://www.google.com/maps?q=${image.latitude},${image.longitude}&t=k&z=8&output=embed`;
  mapFrame.src = mapUrl;
}

/* ---------------------------------------
   CSV LOADING AND SETUP
---------------------------------------- */
function loadRegionData(callback) {
  Papa.parse('coordinates/Azerbaijani Region Coordinates.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const regionData = results.data.map(row => ({
        District: row.District,
        City: row.City,
        Latitude: parseFloat(row.Latitude),
        Longitude: parseFloat(row.Longitude),
      }));
      callback(regionData);
    },
    error: function (error) {
      console.error("Error loading regions CSV:", error);
    },
  });
}

function updateCityDistrict(images, regionData) {
  images.forEach(image => {
    let closestRegion = null;
    let minDistance = Infinity;

    regionData.forEach(region => {
      const distance = Math.sqrt(
        Math.pow(image.latitude - region.Latitude, 2) +
        Math.pow(image.longitude - region.Longitude, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    });

    if (closestRegion) {
      image.city = closestRegion.City || "Unknown";
      image.district = closestRegion.District || "Unknown";
    } else {
      image.city = "Unknown";
      image.district = "Unknown";
    }
  });
}

// Populate region filter if needed
function populateRegions(regionData) {
  const citySet = new Set(regionData.map(region => region.City).filter(Boolean));
  const regionFilter = document.getElementById('filter-region');
  
  regionFilter.innerHTML = '<option value="all">All</option>';
  citySet.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    regionFilter.appendChild(option);
  });
}

function loadImageData(regionData) {
  Papa.parse('coordinates/wildfireDataset.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const images = results.data.map(row => ({
        latitude: parseFloat(row.LATITUDE),
        longitude: parseFloat(row.LONGITUDE),
        src: row.PHOTO_URL ? row.PHOTO_URL.trim() : placeholderImage,
        description: `Image from coordinates ${row.LATITUDE}, ${row.LONGITUDE}`,
        brightness: row.brightness,
        scan: row.scan,
        track: row.track,
        acq_date: row.acq_date, // Already in YYYY-MM-DD format
        acq_time: row.acq_time,
        satellite: row.satellite,
        instrument: row.instrument,
        confidence: row.confidence,
        version: row.version,
        bright_t31: row.bright_t31,
        frp: row.frp,
        daynight: row.daynight,
        city: null,     // Will be updated below
        district: null, // Will be updated below
      }));

      // Update city and district info for all images using the region coordinates
      updateCityDistrict(images, regionData);

      // Store full dataset in originalImages and initialize currentFilteredImages
      originalImages = images;
      currentFilteredImages = images;

      // Populate the filter dropdowns
      populateSatelliteAndInstrument(images);
      populateRegionsFromImages(images);

      // Setup date range limits
      const acqDates = images
        .map(image => image.acq_date)
        .filter(Boolean)
        .sort();
      const minDate = acqDates[0];
      const maxDate = acqDates[acqDates.length - 1];

      const dateRangeStartInput = document.getElementById('date-range-start');
      const dateRangeEndInput = document.getElementById('date-range-end');
      
      dateRangeStartInput.min = minDate;
      dateRangeStartInput.max = maxDate;
      dateRangeEndInput.min = minDate;
      dateRangeEndInput.max = maxDate;

      // Set the input values and update our filterDateRange object
      dateRangeStartInput.value = minDate;
      dateRangeEndInput.value = maxDate;
      filterDateRange.start = minDate;
      filterDateRange.end = maxDate;

      // Display the first page of images
      displayImages(images.slice(0, currentPage * pageSize));
      toggleLoadMoreButton();
    },
    error: function (error) {
      console.error("Error loading images CSV:", error);
    },
  });
}


// Finally, load region data, then load images
loadRegionData(regionData => {
  loadImageData(regionData);
});
