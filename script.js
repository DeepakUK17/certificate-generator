if (typeof XLSX === "undefined") {
  var XLSX = window.XLSX;
}

let currentData = []
let currentTemplate = null
let previewIndex = 0
const manualMembers = []

// Show/Hide sections
function showFileUpload() {
    document.getElementById('fileUploadSection').classList.remove('hidden');
    document.getElementById('manualEntrySection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
}

function showManualEntry() {
    document.getElementById('manualEntrySection').classList.remove('hidden');
    document.getElementById('fileUploadSection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
}

function showMainOptions() {
    document.getElementById('fileUploadSection').classList.add('hidden');
    document.getElementById('manualEntrySection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
}

// File Upload Method
document.getElementById("templateFile")?.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        currentTemplate = img
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }
})

document.getElementById("manualTemplateFile")?.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        currentTemplate = img
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }
})

document.getElementById("dataFile")?.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        if (file.name.endsWith(".csv")) {
          parseCSV(event.target.result)
        } else {
          parseExcel(event.target.result)
        }
      } catch (error) {
        alert("Error reading file: " + error.message)
      }
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  }
})

function parseCSV(csvText) {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  currentData = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(",")
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || ""
      })
      currentData.push(row)
    }
  }

  console.log("Parsed CSV data:", currentData)
  alert(`Successfully loaded ${currentData.length} records from CSV file.`)
}

function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet)

  currentData = jsonData.map((row) => {
    const normalizedRow = {}
    Object.keys(row).forEach((key) => {
      normalizedRow[key.toLowerCase().trim()] = row[key]
    })
    return normalizedRow
  })

  console.log("Parsed Excel data:", currentData)
  alert(`Successfully loaded ${currentData.length} records from Excel file.`)
}

// Manual Entry Method
function showAddMemberModal() {
  document.getElementById("addMemberModal").classList.remove("hidden")
}

function hideAddMemberModal() {
  document.getElementById("addMemberModal").classList.add("hidden")
  document.getElementById("memberForm").reset()
}

document.getElementById("memberForm")?.addEventListener("submit", (e) => {
  e.preventDefault()

  const name = document.getElementById("memberName").value
  const college = document.getElementById("memberCollege").value
  const department = document.getElementById("memberDepartment").value

  const member = { name, college, department }
  manualMembers.push(member)

  updateMembersList()
  hideAddMemberModal()
})

function updateMembersList() {
  const membersList = document.getElementById("membersList")
  membersList.innerHTML = ""

  manualMembers.forEach((member, index) => {
    const memberDiv = document.createElement("div")
    memberDiv.className = "member-item"
    memberDiv.innerHTML = `
            <div class="member-info">
                <strong>${member.name}</strong>
                <span>${member.college} - ${member.department}</span>
            </div>
            <button class="remove-member" onclick="removeMember(${index})">Remove</button>
        `
    membersList.appendChild(memberDiv)
  })
}

function removeMember(index) {
  manualMembers.splice(index, 1)
  updateMembersList()
}

// Preview Functions
function previewCertificates() {
  if (!currentTemplate) {
    alert("Please select a certificate template first.")
    return
  }

  if (currentData.length === 0) {
    alert("Please upload a data file first.")
    return
  }

  previewIndex = 0
  showPreview()
}

function previewManualCertificates() {
  if (!currentTemplate) {
    alert("Please select a certificate template first.")
    return
  }

  if (manualMembers.length === 0) {
    alert("Please add team members first.")
    return
  }

  previewIndex = 0
  showManualPreview()
}

function showPreview() {
  document.getElementById("previewSection").classList.remove("hidden")

  const canvas = document.getElementById("previewCanvas")
  const ctx = canvas.getContext("2d")

  // Set canvas size to match template
  canvas.width = currentTemplate.width
  canvas.height = currentTemplate.height

  // Draw template
  ctx.drawImage(currentTemplate, 0, 0)

  // Get current data
  const data = currentData[previewIndex]

  // Get coordinates
  const nameX = Number.parseInt(document.getElementById("nameX").value)
  const nameY = Number.parseInt(document.getElementById("nameY").value)
  const collegeX = Number.parseInt(document.getElementById("collegeX").value)
  const collegeY = Number.parseInt(document.getElementById("collegeY").value)
  const departmentX = Number.parseInt(document.getElementById("departmentX").value)
  const departmentY = Number.parseInt(document.getElementById("departmentY").value)

  // Draw text
  ctx.fillStyle = "#000000"
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "center"

  ctx.fillText(data.name || "", nameX, nameY)
  ctx.fillText(data.college || "", collegeX, collegeY)
  ctx.fillText(data.department || "", departmentX, departmentY)

  // Update counter
  document.getElementById("previewCounter").textContent = `${previewIndex + 1} / ${currentData.length}`
}

function showManualPreview() {
  document.getElementById("previewSection").classList.remove("hidden")

  const canvas = document.getElementById("previewCanvas")
  const ctx = canvas.getContext("2d")

  // Set canvas size to match template
  canvas.width = currentTemplate.width
  canvas.height = currentTemplate.height

  // Draw template
  ctx.drawImage(currentTemplate, 0, 0)

  // Get current data
  const data = manualMembers[previewIndex]

  // Get coordinates
  const nameX = Number.parseInt(document.getElementById("manualNameX").value)
  const nameY = Number.parseInt(document.getElementById("manualNameY").value)
  const collegeX = Number.parseInt(document.getElementById("manualCollegeX").value)
  const collegeY = Number.parseInt(document.getElementById("manualCollegeY").value)
  const departmentX = Number.parseInt(document.getElementById("manualDepartmentX").value)
  const departmentY = Number.parseInt(document.getElementById("manualDepartmentY").value)

  // Draw text
  ctx.fillStyle = "#000000"
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "center"

  ctx.fillText(data.name || "", nameX, nameY)
  ctx.fillText(data.college || "", collegeX, collegeY)
  ctx.fillText(data.department || "", departmentX, departmentY)

  // Update counter
  document.getElementById("previewCounter").textContent = `${previewIndex + 1} / ${manualMembers.length}`
}

function prevPreview() {
  if (previewIndex > 0) {
    previewIndex--
    if (currentData.length > 0) {
      showPreview()
    } else {
      showManualPreview()
    }
  }
}

function nextPreview() {
  const dataLength = currentData.length > 0 ? currentData.length : manualMembers.length
  if (previewIndex < dataLength - 1) {
    previewIndex++
    if (currentData.length > 0) {
      showPreview()
    } else {
      showManualPreview()
    }
  }
}

// Generate Functions
async function generateCertificates() {
  if (!currentTemplate || currentData.length === 0) {
    alert("Please select template and upload data first.")
    return
  }

  // Group by team_id
  const teams = {}
  currentData.forEach((member) => {
    const teamId = member.team_id || "DEFAULT"
    if (!teams[teamId]) {
      teams[teamId] = []
    }
    teams[teamId].push(member)
  })

  // Generate certificates for each team
  for (const [teamId, members] of Object.entries(teams)) {
    for (let i = 0; i < members.length; i++) {
      const member = members[i]
      const canvas = await generateCertificate(member, "file")

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `${teamId}_${member.name || `member_${i + 1}`}.png`
      link.click()

      // Small delay between downloads to prevent browser blocking
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  alert("Certificates generated and downloaded successfully!")
}

async function generateManualCertificates() {
  if (!currentTemplate || manualMembers.length === 0) {
    alert("Please select template and add members first.")
    return
  }

  const teamId = document.getElementById("teamId").value || "DEFAULT"

  // Generate certificates for each member
  for (let i = 0; i < manualMembers.length; i++) {
    const member = manualMembers[i]
    const canvas = await generateCertificate(member, "manual")

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `${teamId}_${member.name || `member_${i + 1}`}.png`
    link.click()

    // Small delay between downloads to prevent browser blocking
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  alert("Certificates generated and downloaded successfully!")
}

async function generateCertificate(data, mode) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  // Set canvas size
  canvas.width = currentTemplate.width
  canvas.height = currentTemplate.height

  // Draw template
  ctx.drawImage(currentTemplate, 0, 0)

  // Get coordinates based on mode
  let nameX, nameY, collegeX, collegeY, departmentX, departmentY

  if (mode === "file") {
    nameX = Number.parseInt(document.getElementById("nameX").value)
    nameY = Number.parseInt(document.getElementById("nameY").value)
    collegeX = Number.parseInt(document.getElementById("collegeX").value)
    collegeY = Number.parseInt(document.getElementById("collegeY").value)
    departmentX = Number.parseInt(document.getElementById("departmentX").value)
    departmentY = Number.parseInt(document.getElementById("departmentY").value)
  } else {
    nameX = Number.parseInt(document.getElementById("manualNameX").value)
    nameY = Number.parseInt(document.getElementById("manualNameY").value)
    collegeX = Number.parseInt(document.getElementById("manualCollegeX").value)
    collegeY = Number.parseInt(document.getElementById("manualCollegeY").value)
    departmentX = Number.parseInt(document.getElementById("manualDepartmentX").value)
    departmentY = Number.parseInt(document.getElementById("manualDepartmentY").value)
  }

  // Draw text
  ctx.fillStyle = "#000000"
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "center"

  ctx.fillText(data.name || "", nameX, nameY)
  ctx.fillText(data.college || "", collegeX, collegeY)
  ctx.fillText(data.department || "", departmentX, departmentY)

  return canvas
}
