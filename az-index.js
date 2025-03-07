// QLOBAL DƏYİŞƏNLƏR
const placeholderImage = 'https://via.placeholder.com/200?text=Şəkil+Tapılmadı'; // Tapılmayan şəkillər üçün yer tutucu
let originalImages = [];         // Əsas şəkil siyahısını saxlayır
let currentFilteredImages = [];  // Hazırda filtrələnmiş (və ya tam) şəkil siyahısını saxlayır
let sortDirection = 'ascending'; // Artan və ya azalan sıralama
let filterRegion = 'all';
let filterDateRange = { start: null, end: null }; // Tarix aralığı üzrə filtr
let filterSatellite = 'all';
let filterInstrument = 'all';
let currentModalImageData = null;
let currentPage = 1;
const pageSize = 10;            // Səhifədəki şəkil sayı

// DÜYMƏLƏR
const loadMore = document.getElementById("loadMore");
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Şəkil təfərrüatları üçün modal element
const modal = document.getElementById("image-modal");

/* ---------------------------------------
   DAHA ÇOX YÜKLƏ & YUXARIYA SKROL ET FUNKSİYALILIYI
---------------------------------------- */
function incrementPage() {
  currentPage += 1;
  displayImages(currentFilteredImages.slice(0, currentPage * pageSize));
  toggleLoadMoreButton();
}

loadMore.addEventListener("click", incrementPage);

function toggleLoadMoreButton() {
  if (currentFilteredImages.length > currentPage * pageSize) {
    loadMore.style.display = 'block';
  } else {
    loadMore.style.display = 'none';
  }
}

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
   ŞƏKİL TƏFƏRRÜATLARI ÜÇÜN MODAL FUNKSİYALAR
---------------------------------------- */
function openModal(imageSrc, mapSrc, details) {
  document.getElementById("modal-image").src = imageSrc;
  document.getElementById("map-frame").src = mapSrc;
  document.getElementById("modal-info").innerHTML = details;
  modal.style.display = "flex"; // modalu göstər
}

modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none"; // modalu gizlət
  }
});

function closeModal() {
  modal.style.display = 'none';
}

/* ---------------------------------------
   TARİXİ FORMATLAMA FUNKSİYASI
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
   FİLTRLƏR VƏ SIRALAMA
---------------------------------------- */
function applyFiltersAndSorting(images) {
  let filteredImages = [...images];

  // Bölgəyə görə filtr et
  if (filterRegion !== 'all') {
    filteredImages = filteredImages.filter(
      image => image.city === filterRegion || image.district === filterRegion
    );
  }

  // Tarix aralığına görə filtr et
  if (filterDateRange.start && filterDateRange.end) {
    filteredImages = filteredImages.filter(image => {
      const imageDate = new Date(image.acq_date);
      return (
        imageDate >= new Date(filterDateRange.start) &&
        imageDate <= new Date(filterDateRange.end)
      );
    });
  }

  // Peykə görə filtr et
  if (filterSatellite !== 'all') {
    filteredImages = filteredImages.filter(
      image => image.satellite === filterSatellite
    );
  }

  // Alətə görə filtr et
  if (filterInstrument !== 'all') {
    filteredImages = filteredImages.filter(
      image => image.instrument === filterInstrument
    );
  }

  // Alınma tarixinə görə sırala
  filteredImages.sort((a, b) => {
    const dateA = new Date(a.acq_date);
    const dateB = new Date(b.acq_date);
    return sortDirection === 'ascending' ? dateA - dateB : dateB - dateA;
  });

  // Səhifələməni sıfırla və filtrələnmiş şəkilləri yenilə
  currentPage = 1;
  currentFilteredImages = filteredImages;
  displayImages(currentFilteredImages.slice(0, currentPage * pageSize));
  toggleLoadMoreButton();
}

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
   YÜKLƏMƏ FUNKSİYALARI
---------------------------------------- */
async function handleDownloadBoth() {
  let regionName = currentModalImageData && currentModalImageData.city ? currentModalImageData.city : "Naməlum";
  let imageFilename = `imageFrom${regionName}.jpg`;
  let infoFilename = `infoFrom${regionName}.txt`;

  const modalInfo = document.getElementById("modal-info");
  const infoText = modalInfo.innerText || modalInfo.textContent;
  const zip = new JSZip();

  try {
    const response = await fetch(currentModalImageData.src);
    if (!response.ok) throw new Error("Şəbəkə cavabı düzgün deyildi");
    const imageBlob = await response.blob();
    zip.file(imageFilename, imageBlob);
  } catch (error) {
    console.error("Şəkil yüklənərkən xəta:", error);
    zip.file(imageFilename, "Şəkil gətirilə bilmədi.");
  }

  zip.file(infoFilename, infoText);

  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `downloadedDataFrom${regionName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });
}

async function handleDownloadFiltered() {
  const zip = new JSZip();
  const images = currentFilteredImages;

  if (!images.length) {
    alert("Yükləmək üçün heç bir şəkil mövcud deyil.");
    return;
  }

  const promises = images.map(async (image, index) => {
    const regionName = image.city ? image.city : "Naməlum";
    const imageFileName = `imageFrom(${regionName})_${index + 1}.jpg`;
    const infoFileName = `infoFrom(${regionName})_${index + 1}.txt`;

    const infoText = [
      `Təsvir: ${image.description}\n`,
      `Koordinatlar: ${image.latitude}, ${image.longitude}\n`,
      `Şəhər: ${image.city}\n`,
      `Rayon: ${image.district}\n`,
      `Parlaqlıq: ${image.brightness}\n`,
      `Scan: ${image.scan}\n`,
      `Track: ${image.track}\n`,
      `Alınma tarixi: ${image.acq_date}\n`,
      `Alınma vaxtı: ${image.acq_time}\n`,
      `Peyk: ${image.satellite}\n`,
      `Alət: ${image.instrument}\n`,
      `Etibar: ${image.confidence}\n`,
      `Versiya: ${image.version}\n`,
      `Bright T31: ${image.bright_t31}\n`,
      `FRP: ${image.frp}\n`,
      `Gündüz/Gecə: ${image.daynight}\n`
    ].join("\n");

    try {
      const response = await fetch(image.src);
      if (!response.ok) throw new Error("Şəkil gətirilməsi uğursuz oldu");
      const blob = await response.blob();
      zip.file(imageFileName, blob);
    } catch (error) {
      console.error(`Şəkil gətirərkən xəta ${image.src}:`, error);
      zip.file(imageFileName, "Şəkil gətirilə bilmədi.");
    }
    zip.file(infoFileName, infoText);
  });

  await Promise.all(promises);

  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "filtered_download.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });
}

/* ---------------------------------------
   YÜKLƏMƏ TƏSDİQ MODALI
---------------------------------------- */
// Bu blok, hər iki yükləmə düyməsi üçün hadisə dinləyicilərini əlavə edir ki, hər hansı yükləmə əməliyyatından əvvəl təsdiq modalı görünsün.
document.addEventListener("DOMContentLoaded", function () {
  // HTML-dəki ID-lərin uyğun gəldiyinə əmin olun
  const downloadModal = document.getElementById("modal-download-conf");
  const downloadBothBtn = document.getElementById("downloadBothBtn");
  const downloadFilteredBtn = document.getElementById("downloadFilteredBtn");
  const confirmDownloadButton = document.getElementById("confirmDownload");
  const agreeCheckbox = document.getElementById("agreeCheckbox");
  const closeModalButton = document.getElementById("closeDownloadModal");
  const termsLink = document.getElementById("termsLink");

  let currentDownloadType = ""; // "both" or "filtered"

  downloadBothBtn.addEventListener("click", function (event) {
    event.preventDefault();
    currentDownloadType = "both";
    agreeCheckbox.checked = false;
    confirmDownloadButton.disabled = true;
    downloadModal.style.display = "block";
  });

  downloadFilteredBtn.addEventListener("click", function (event) {
    event.preventDefault();
    currentDownloadType = "filtered";
    agreeCheckbox.checked = false;
    confirmDownloadButton.disabled = true;
    downloadModal.style.display = "block";
  });

  agreeCheckbox.addEventListener("change", function () {
    confirmDownloadButton.disabled = !this.checked;
  });

  confirmDownloadButton.addEventListener("click", function () {
    downloadModal.style.display = "none";
    if (currentDownloadType === "both") {
      handleDownloadBoth();
    } else if (currentDownloadType === "filtered") {
      handleDownloadFiltered();
    }
  });

  closeModalButton.addEventListener("click", function () {
    downloadModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === downloadModal) {
      downloadModal.style.display = "none";
    }
  });

  termsLink.addEventListener("click", function () {
    downloadModal.style.display = "none";
  });
});

/* ---------------------------------------
   FİLTR DÜŞƏNBƏLƏRİNİN DOLDURULMASI
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
   ŞƏKİLLƏRİN GÖSTƏRİLMƏSİ
---------------------------------------- */
function displayImages(imageList) {
  const gallery = document.getElementById('image-gallery');
  gallery.innerHTML = '';

  if (!imageList.length) {
    gallery.innerHTML = '<p>Göstəriləcək heç bir şəkil mövcud deyil.</p>';
    return;
  }

  imageList.forEach(image => {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';

    const img = document.createElement('img');
    img.src = image.src || placeholderImage;
    img.alt = image.description;
    img.onerror = () => {
      img.src = placeholderImage;
      console.warn(`Şəkil yüklənə bilmədi: ${image.src}`);
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
  modalImage.style.cursor = "pointer";
  modalImage.onclick = () => window.open(image.src, '_blank');
  currentModalImageData = image;

  modalInfo.innerHTML = `
    <div style="display: flex; flex-direction: row; justify-content: space-between;">
      <div>
        <p><strong>Təsvir:</strong> ${image.description}</p>
        <p><strong>Koordinatlar:</strong> ${image.latitude}, ${image.longitude}</p>
        <p><strong>Şəhər:</strong> ${image.city}</p>
        <p><strong>Rayon:</strong> ${image.district}</p>
        <p><strong>Parlaqlıq:</strong> ${image.brightness}</p>
        <p><strong>Scan:</strong> ${image.scan}</p>
        <p><strong>Track:</strong> ${image.track}</p>
        <p><strong>Alınma tarixi:</strong> ${image.acq_date}</p>
      </div>
      <div>
        <p><strong>Alınma vaxtı:</strong> ${image.acq_time}</p>
        <p><strong>Peyk:</strong> ${image.satellite}</p>
        <p><strong>Alət:</strong> ${image.instrument}</p>
        <p><strong>Etibar:</strong> ${image.confidence}</p>
        <p><strong>Versiya:</strong> ${image.version}</p>
        <p><strong>Bright T31:</strong> ${image.bright_t31}</p>
        <p><strong>FRP:</strong> ${image.frp}</p>
        <p><strong>Gündüz/Gecə:</strong> ${image.daynight}</p>
      </div>
    </div>
  `;

  const mapUrl = `https://www.google.com/maps?q=${image.latitude},${image.longitude}&t=k&z=8&output=embed`;
  mapFrame.src = mapUrl;
}

/* ---------------------------------------
   CSV YÜKLƏMƏ VƏ QURAŞDIRMA
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
      console.error("Regions CSV yüklənərkən xəta:", error);
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
      image.city = closestRegion.City || "Naməlum";
      image.district = closestRegion.District || "Naməlum";
    } else {
      image.city = "Naməlum";
      image.district = "Naməlum";
    }
  });
}

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
        description: `Koordinatlardan şəkil ${row.LATITUDE}, ${row.LONGITUDE}`,
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
        city: null,
        district: null,
      }));

      updateCityDistrict(images, regionData);
      originalImages = images;
      currentFilteredImages = images;
      populateSatelliteAndInstrument(images);
      populateRegionsFromImages(images);

      const acqDates = images.map(image => image.acq_date).filter(Boolean).sort();
      const minDate = acqDates[0];
      const maxDate = acqDates[acqDates.length - 1];

      const dateRangeStartInput = document.getElementById('date-range-start');
      const dateRangeEndInput = document.getElementById('date-range-end');
      
      dateRangeStartInput.min = minDate;
      dateRangeStartInput.max = maxDate;
      dateRangeEndInput.min = minDate;
      dateRangeEndInput.max = maxDate;

      dateRangeStartInput.value = minDate;
      dateRangeEndInput.value = maxDate;
      filterDateRange.start = minDate;
      filterDateRange.end = maxDate;

      displayImages(images.slice(0, currentPage * pageSize));
      toggleLoadMoreButton();
    },
    error: function (error) {
      console.error("Şəkillər CSV yüklənərkən xəta:", error);
    },
  });
}

// Nəhayət, əvvəl region məlumatlarını, sonra şəkilləri yüklə
loadRegionData(regionData => {
  loadImageData(regionData);
});
