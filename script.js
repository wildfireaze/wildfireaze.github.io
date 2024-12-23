const placeholderImage = 'https://via.placeholder.com/200?text=Image+Not+Found'; // Placeholder for missing images
let originalImages = []; // Stores the original image list
let sortDirection = 'ascending'; // Ascending or descending sort
let filterRegion = 'all';
let filterDateRange = { start: null, end: null }; // Date range filter
let filterSatellite = 'all';
let filterInstrument = 'all';
let currentPage = 1

function incrementPage(){
  currentPage += 1
  loadRegionData(regionData => {
    loadImageData(regionData);    // SCROLL DETECTOR FOR GET THE DATA
  });
}

const loadMore = document.getElementById("loadMore")

loadMore.addEventListener("click", incrementPage)

// Function to apply filters and sorting
function applyFiltersAndSorting(images) {
  let filteredImages = [...images];

  // Filter by region
  if (filterRegion !== 'all') {
    filteredImages = filteredImages.filter(image => image.city === filterRegion || image.district === filterRegion);
  }

  // Filter by date range
  if (filterDateRange.start && filterDateRange.end) {
    filteredImages = filteredImages.filter(image => {
      const imageDate = new Date(image.acq_date);
      return imageDate >= new Date(filterDateRange.start) && imageDate <= new Date(filterDateRange.end);
    });
  }

  // Filter by satellite
  if (filterSatellite !== 'all') {
    filteredImages = filteredImages.filter(image => image.satellite === filterSatellite);
  }

  // Filter by instrument
  if (filterInstrument !== 'all') {
    filteredImages = filteredImages.filter(image => image.instrument === filterInstrument);
  }

  // Sort by acquisition date
  filteredImages.sort((a, b) => {
    const dateA = new Date(a.acq_date);
    const dateB = new Date(b.acq_date);
    return sortDirection === 'ascending' ? dateA - dateB : dateB - dateA;
  });

  displayImages(filteredImages);
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

// Function to populate region filter options
function populateRegions(images) {
  const regionSet = new Set(images.map(image => image.city || image.district).filter(Boolean));
  const regionFilter = document.getElementById('filter-region');

  regionSet.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });
}

// Function to populate satellite and instrument options
function populateSatelliteAndInstrument(images) {
  const satelliteSet = new Set(images.map(image => image.satellite).filter(Boolean));
  const instrumentSet = new Set(images.map(image => image.instrument).filter(Boolean));

  const satelliteFilter = document.getElementById('filter-satellite');
  const instrumentFilter = document.getElementById('filter-instrument');

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

// Function to display images in the gallery
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

// Function to display image details in a modal
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
        <p><strong>Description:</strong> ${image.description}</p>
        <p><strong>Coordinates:</strong> (${image.latitude}, ${image.longitude})</p>
        <p><strong>City:</strong> ${image.city}</p>
        <p><strong>District:</strong> ${image.district}</p>
        <p><strong>Brightness:</strong> ${image.brightness}</p>
        <p><strong>Scan:</strong> ${image.scan}</p>
        <p><strong>Track:</strong> ${image.track}</p>
      </div>
      <div>
        <p><strong>Acquisition Date:</strong> ${image.acq_date}</p>
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

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('image-modal');
  modal.style.display = 'none';
}


// Function to load and parse the regions CSV
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

// Function to map longitude and latitude to city and district
function updateCityDistrict(images, regionData) {
  images.forEach(image => {
    let closestRegion = null;
    let minDistance = Infinity;

    // Find the closest region based on latitude and longitude
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

    // Assign the city and district if a match is found
    if (closestRegion) {
      image.city = closestRegion.City || "Unknown";
      image.district = closestRegion.District || "Unknown";
    } else {
      image.city = "Unknown";
      image.district = "Unknown";
    }
  });
}

// Update populateRegions to use cities from the regionData
function populateRegions(regionData) {
  const citySet = new Set(regionData.map(region => region.City).filter(Boolean));
  const regionFilter = document.getElementById('filter-region');
  
  regionFilter.innerHTML = '<option value="all">All</option>'; // Reset options
  citySet.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    regionFilter.appendChild(option);
  });
}

// Modified loadImageData to integrate updateCityDistrict properly
function loadImageData(regionData) {
  Papa.parse('coordinates/wildfireDataset.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const images = results.data.map(row => ({
        latitude: parseFloat(row.LATITUDE),
        longitude: parseFloat(row.LONGITUDE),
        src: row.PHOTO_URL ? row.PHOTO_URL.trim() : placeholderImage,
        description: `Image from coordinates (${row.LATITUDE}, ${row.LONGITUDE})`,
        brightness: row.brightness,
        scan: row.scan,
        track: row.track,
        acq_date: row.acq_date,
        acq_time: row.acq_time,
        satellite: row.satellite,
        instrument: row.instrument,
        confidence: row.confidence,
        version: row.version,
        bright_t31: row.bright_t31,
        frp: row.frp,
        daynight: row.daynight,
        city: null, // Placeholder for dynamic assignment
        district: null, // Placeholder for dynamic assignment
      }));

      const pageSize = 30

      const totalPages = Math.floor(images.length / pageSize)

      const visibleItems = images.slice(0,currentPage * pageSize)

      console.log(visibleItems, totalPages)

      // Update images with city and district data
      updateCityDistrict(visibleItems, regionData);

      populateSatelliteAndInstrument(visibleItems)

      // Populate city filter options from regionData
      populateRegions(regionData);

      // Store original images and display them
      originalImages = visibleItems;
      displayImages(visibleItems);
    },
    error: function (error) {
      console.error("Error loading images CSV:", error);
    },
  });
}



// Adjust loadRegionData to call the updated loadImageData
loadRegionData(regionData => {
  loadImageData(regionData);
});
