let templatePath = ""
let membersData = []
let coordinates = {}

document.addEventListener("DOMContentLoaded", () => {
  const templateFile = document.getElementById("templateFile")
  const dataFile = document.getElementById("dataFile")
  const previewBtn = document.getElementById("previewBtn")
  const generateBtn = document.getElementById("generateBtn")
  const modal = document.getElementById("previewModal")
  const closeBtn = document.querySelector(".close")

  templateFile.addEventListener("change", handleTemplateUpload)
  dataFile.addEventListener("change", handleDataUpload)
  previewBtn.addEventListener("click", previewCertificate)
  generateBtn.addEventListener("click", generateCertificates)
  closeBtn.addEventListener("click", () => (modal.style.display = "none"))

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })
})

async function handleTemplateUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append("template", file)

  try {
    showLoading("Uploading template...")
    const response = await fetch("/upload-template", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    hideLoading()

    if (response.ok) {
      templatePath = result.templatePath
      displayTemplatePreview(file)
      showSuccess("Template uploaded successfully!")
      checkFormCompletion()
    } else {
      showError(result.error || "Failed to upload template")
    }
  } catch (error) {
    hideLoading()
    showError("Error uploading template: " + error.message)
  }
}

async function handleDataUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append("dataFile", file)

  try {
    showLoading("Processing data file...")
    const response = await fetch("/upload-data", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    hideLoading()

    if (response.ok) {
      membersData = result.data
      displayDataPreview(result.data, result.columns)
      setupCoordinateSettings(result.columns)
      showSuccess(`Data file processed! Found ${result.data.length} records.`)
      checkFormCompletion()
    } else {
      showError(result.error || "Failed to process data file")
    }
  } catch (error) {
    hideLoading()
    showError("Error processing data file: " + error.message)
  }
}

function displayTemplatePreview(file) {
  const preview = document.getElementById("templatePreview")
  const img = document.createElement("img")
  img.src = URL.createObjectURL(file)
  img.style.maxWidth = "100%"
  img.style.maxHeight = "200px"
  preview.innerHTML = ""
  preview.appendChild(img)
}

function displayDataPreview(data, columns) {
  const preview = document.getElementById("dataPreview")
  let html = "<h4>Data Preview (First 5 rows):</h4>"
  html += '<table style="width: 100%; border-collapse: collapse;">'

  // Headers
  html += "<tr>"
  columns.forEach((col) => {
    html += `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${col}</th>`
  })
  html += "</tr>"

  // Data rows (first 5)
  data.slice(0, 5).forEach((row) => {
    html += "<tr>"
    columns.forEach((col) => {
      html += `<td style="border: 1px solid #ddd; padding: 8px;">${row[col] || ""}</td>`
    })
    html += "</tr>"
  })

  html += "</table>"
  preview.innerHTML = html
}

function setupCoordinateSettings(columns) {
  const container = document.getElementById("coordinateSettings")
  let html = "<h4>Text Positioning (X, Y coordinates):</h4>"

  columns.forEach((column) => {
    html += `
            <div class="coordinate-field">
                <label>${column}:</label>
                <input type="number" id="${column}X" placeholder="X" value="100">
                <input type="number" id="${column}Y" placeholder="Y" value="200">
            </div>
        `
  })

  container.innerHTML = html

  // Add event listeners to coordinate inputs
  columns.forEach((column) => {
    const xInput = document.getElementById(`${column}X`)
    const yInput = document.getElementById(`${column}Y`)

    if (xInput && yInput) {
      xInput.addEventListener("change", updateCoordinates)
      yInput.addEventListener("change", updateCoordinates)
    }
  })
}

function updateCoordinates() {
  coordinates = {}
  const coordinateInputs = document.querySelectorAll("#coordinateSettings input")

  coordinateInputs.forEach((input) => {
    const fieldName = input.id.replace(/[XY]$/, "")
    const coordinate = input.id.endsWith("X") ? "x" : "y"

    if (!coordinates[fieldName]) {
      coordinates[fieldName] = {}
    }

    coordinates[fieldName][coordinate] = Number.parseInt(input.value) || 0
  })
}

async function previewCertificate() {
  if (!templatePath || membersData.length === 0) {
    showError("Please upload template and data file first")
    return
  }

  updateCoordinates()

  try {
    showLoading("Generating preview...")
    const response = await fetch("/preview-certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templatePath: templatePath,
        sampleData: membersData[0],
        coordinates: coordinates,
      }),
    })

    const result = await response.json()
    hideLoading()

    if (response.ok) {
      displayPreview(result.previewPath)
    } else {
      showError(result.error || "Failed to generate preview")
    }
  } catch (error) {
    hideLoading()
    showError("Error generating preview: " + error.message)
  }
}

function displayPreview(previewPath) {
  const modal = document.getElementById("previewModal")
  const previewImage = document.getElementById("previewImage")

  previewImage.innerHTML = `<img src="/get-preview/${previewPath}" style="max-width: 100%; height: auto;">`
  modal.style.display = "block"
}

async function generateCertificates() {
  if (!templatePath || membersData.length === 0) {
    showError("Please upload template and data file first")
    return
  }

  updateCoordinates()
  const outputPath = document.getElementById("outputPath").value || "generated_certificates"

  try {
    showLoading("Generating certificates...")
    const response = await fetch("/generate-certificates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templatePath: templatePath,
        outputPath: outputPath,
        membersData: membersData,
        coordinates: coordinates,
      }),
    })

    const result = await response.json()
    hideLoading()

    if (response.ok) {
      showSuccess(result.message)
    } else {
      showError(result.error || "Failed to generate certificates")
    }
  } catch (error) {
    hideLoading()
    showError("Error generating certificates: " + error.message)
  }
}

function checkFormCompletion() {
  const previewBtn = document.getElementById("previewBtn")
  const generateBtn = document.getElementById("generateBtn")

  if (templatePath && membersData.length > 0) {
    previewBtn.disabled = false
    generateBtn.disabled = false
  }
}

function showLoading(message) {
  // You can implement a loading spinner here
  console.log("Loading:", message)
}

function hideLoading() {
  // Hide loading spinner
  console.log("Loading complete")
}

function showSuccess(message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = "success-message"
  alertDiv.textContent = message
  document.querySelector(".upload-form").prepend(alertDiv)

  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}

function showError(message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = "error-message"
  alertDiv.textContent = message
  document.querySelector(".upload-form").prepend(alertDiv)

  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}
