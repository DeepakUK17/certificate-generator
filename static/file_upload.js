let templatePath = ""
const members = []

document.addEventListener("DOMContentLoaded", () => {
  const templateFile = document.getElementById("templateFile")
  const addMemberBtn = document.getElementById("addMemberBtn")
  const previewBtn = document.getElementById("previewBtn")
  const generateBtn = document.getElementById("generateBtn")
  const memberModal = document.getElementById("memberModal")
  const previewModal = document.getElementById("previewModal")
  const memberForm = document.getElementById("memberForm")
  const closeBtns = document.querySelectorAll(".close")

  templateFile.addEventListener("change", handleTemplateUpload)
  addMemberBtn.addEventListener("click", () => (memberModal.style.display = "block"))
  previewBtn.addEventListener("click", previewCertificate)
  generateBtn.addEventListener("click", generateCertificates)
  memberForm.addEventListener("submit", handleAddMember)

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.target.closest(".modal").style.display = "none"
    })
  })

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
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

function displayTemplatePreview(file) {
  const preview = document.getElementById("templatePreview")
  const img = document.createElement("img")
  img.src = URL.createObjectURL(file)
  img.style.maxWidth = "100%"
  img.style.maxHeight = "200px"
  preview.innerHTML = ""
  preview.appendChild(img)
}

function handleAddMember(event) {
  event.preventDefault()

  const name = document.getElementById("memberName").value
  const college = document.getElementById("memberCollege").value
  const department = document.getElementById("memberDepartment").value
  const teamId = document.getElementById("memberTeamId").value

  const member = {
    name: name,
    college: college,
    department: department,
    team_id: teamId,
  }

  members.push(member)
  displayMembers()

  // Reset form and close modal
  document.getElementById("memberForm").reset()
  document.getElementById("memberModal").style.display = "none"

  checkFormCompletion()
  showSuccess(`Added ${name} to the list`)
}

function displayMembers() {
  const membersList = document.getElementById("membersList")

  if (members.length === 0) {
    membersList.innerHTML = "<p>No members added yet.</p>"
    return
  }

  let html = ""
  members.forEach((member, index) => {
    html += `
            <div class="member-item">
                <div class="member-info">
                    <strong>${member.name}</strong>
                    <span>${member.college} - ${member.department} (Team: ${member.team_id})</span>
                </div>
                <button class="remove-btn" onclick="removeMember(${index})">Remove</button>
            </div>
        `
  })

  membersList.innerHTML = html
}

function removeMember(index) {
  members.splice(index, 1)
  displayMembers()
  checkFormCompletion()
  showSuccess("Member removed from list")
}

function getCoordinates() {
  return {
    name: {
      x: Number.parseInt(document.getElementById("nameX").value) || 100,
      y: Number.parseInt(document.getElementById("nameY").value) || 200,
    },
    college: {
      x: Number.parseInt(document.getElementById("collegeX").value) || 100,
      y: Number.parseInt(document.getElementById("collegeY").value) || 250,
    },
    department: {
      x: Number.parseInt(document.getElementById("departmentX").value) || 100,
      y: Number.parseInt(document.getElementById("departmentY").value) || 300,
    },
  }
}

async function previewCertificate() {
  if (!templatePath || members.length === 0) {
    showError("Please upload template and add at least one member")
    return
  }

  const coordinates = getCoordinates()

  try {
    showLoading("Generating preview...")
    const response = await fetch("/preview-certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templatePath: templatePath,
        sampleData: members[0],
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
  if (!templatePath || members.length === 0) {
    showError("Please upload template and add at least one member")
    return
  }

  const coordinates = getCoordinates()
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
        membersData: members,
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

  if (templatePath && members.length > 0) {
    previewBtn.disabled = false
    generateBtn.disabled = false
  }
}

function showLoading(message) {
  console.log("Loading:", message)
}

function hideLoading() {
  console.log("Loading complete")
}

function showSuccess(message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = "success-message"
  alertDiv.textContent = message
  document.querySelector(".manual-form").prepend(alertDiv)

  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}

function showError(message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = "error-message"
  alertDiv.textContent = message
  document.querySelector(".manual-form").prepend(alertDiv)

  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}
