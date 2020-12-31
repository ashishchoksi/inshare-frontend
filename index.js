const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#inputfile");
const browseBtn = document.querySelector(".browsebtn");

const bgProgess = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURl = document.querySelector("#fileURL");
const sharingCotnainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copybtn");
const toast = document.querySelector(".toast");

const emailForm = document.querySelector("#emailForm");

const maxAllow = 100 * 1024 * 1024;

// const host = "https://innshare.herokuapp.com/";
const host = "https://inshare-quick.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains("dragged"))
        dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if (files.length) {
        fileInput.files = files;
        uploadFile();
    }
    console.log(files);
});

copyBtn.addEventListener("click", () => {
    fileURl.select();
    document.execCommand("copy");
    showToast("Link Copied");
});

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    uploadFile();
});

const uploadFile = () => {
    if (fileInput.files.length > 1) {
        fileInput.value = "";
        showToast("Upload only one file !");
        return;
    }
    const files = fileInput.files[0]; // because only one file allow to upload which at index 1    

    if (files.size > maxAllow) {
        showToast("Exceed max allow size!");
        resetFile();
        return;
    }

    progressContainer.style.display = "block";

    const formData = new FormData();
    formData.append("myfile", files);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };
    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        fileInput.value = "";
        showToast(`Error in upload: ${xhr.statusText}`);
    };

    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

const resetFile = () => {
    fileInput.value = "";
};

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    bgProgess.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent / 100})`;
}

const onUploadSuccess = ({ file }) => {
    console.log(file);
    fileInput.value = "";
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingCotnainer.style.display = "block";
    fileURl.value = file;
}

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = fileURl.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    };

    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(({ success }) => {
            if (success) {
                sharingCotnainer.style.display = "none";
                showToast("Email sent");
            }
        })

});

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%, 60px)";
    }, 2000);
};
