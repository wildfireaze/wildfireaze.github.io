// GLOBAL VARIABLES
const placeholderImage = 'https://via.placeholder.com/200?text=Şəkil+tapılmadı'; // Placeholder for missing images
let originalImages = [];         // Stores the original image list
let currentFilteredImages = [];  // Stores the currently filtered (or full) image list
let sortDirection = 'ascending'; // Ascending or descending sort
let filterRegion = 'all';
let filterDateRange = { start: null, end: null }; // Date range filter
let filterSatellite = 'all';
let filterInstrument = 'all';
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

/* ---------------------------------------
   POPULATE FILTER DROPDOWNS
---------------------------------------- */
function populateRegionsFromImages(images) {
  const regionSet = new Set(images.map(image => image.city).filter(Boolean));
  const regions = Array.from(regionSet).sort();
  
  const regionFilter = document.getElementById('filter-region');
  regionFilter.innerHTML = '<option value="all">Hamısı</option>';
  
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
  satelliteFilter.innerHTML = '<option value="all">Hamısı</option>';
  instrumentFilter.innerHTML = '<option value="all">Hamısı</option>';

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
    gallery.innerHTML = '<p>Göstəriləcək şəkillər yoxdur.</p>';
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
  modalInfo.innerHTML = `
    <div style="display: flex; flex-direction: row; justify-content: space-between;">
      <div>
        <p><strong>Təsvir:</strong> ${image.description}</p>
        <p><strong>Koordinatlar:</strong> (${image.latitude}, ${image.longitude})</p>
        <p><strong>Şəhər:</strong> ${image.city}</p>
        <p><strong>Rayon:</strong> ${image.district}</p>
        <p><strong>Parlaqlıq:</strong> ${image.brightness}</p>
        <p><strong>Skan:</strong> ${image.scan}</p>
        <p><strong>İzləmə:</strong> ${image.track}</p>
        <p><strong>Alınma tarixi:</strong> ${image.acq_date}</p>
      </div>
      <div>
        <p><strong>Alınma vaxtı:</strong> ${image.acq_time}</p>
        <p><strong>Peyk:</strong> ${image.satellite}</p>
        <p><strong>Alət:</strong> ${image.instrument}</p>
        <p><strong>Etibarlılıq:</strong> ${image.confidence}</p>
        <p><strong>Versiya:</strong> ${image.version}</p>
        <p><strong>Parlaq T31:</strong> ${image.bright_t31}</p>
        <p><strong>FRP:</strong> ${image.frp}</p>
        <p><strong>Gündüz/Gecə:</strong> ${image.daynight}</p>
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
      console.error("Region CSV yüklənərkən xəta:", error);
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
  
  regionFilter.innerHTML = '<option value="all">Hamısı</option>';
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
        description: `Koordinatlardan şəkil (${row.LATITUDE}, ${row.LONGITUDE})`,
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
      console.error("Şəkillərin CSV faylını yükləyərkən xəta:", error);
    },
  });
}

// Finally, load region data, then load images
loadRegionData(regionData => {
  loadImageData(regionData);
});
