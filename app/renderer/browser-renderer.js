const path = require('path')
const { ipcRenderer, shell } = require('electron')
const remote = require('@electron/remote')
const mainProcess = remote.require('./main')

const currentWindow = remote.getCurrentWindow()
const browserView = document.querySelector('#view-renderer')

const patient1Tab = document.querySelector('#patient-1-tab')
const patient1View = document.querySelector('#patient-1-renderer')

const patientsStack = []

async function getPatientContext() {
  mainProcess.notificationService.on('PatientOpen', async data => {
    const patientdata =
      await mainProcess.baseHealthService.fetchPatientContextUrl(data)
    patient1View.src = patientdata.baseUrl
    patient1Tab.classList.remove('hidden')
  })
}

// wip
function displayPatient(data) {
  const count = patientsStack.length
  if (count === 0) {
    patient1View.src = data.baseUrl
    patient1Tab.classList.remove('hidden')
  }
}

function init() {
  mainProcess.getProviderContext().then(data => {
    browserView.src = data.baseUrl
    getPatientContext()
  })
}
init()

// @code {
//     public string Url;
//     bool Loaded = false;

//     private void Hide()
//     {
//         if (PageManager.Browser is null)
//         {
//             return;
//         }

//         PageManager.Browser.Close();
//     }

//     @* protected override async Task OnInitializedAsync()
//     {
//         if (!Loaded)
//         {
//             Url = new(await JS.InvokeAsync<string>("getLocalFileUrl"));
//             Loaded = true;
//         }
//         await base.OnInitializedAsync();
//     } *@

//     protected override void OnInitialized()
//     {
//         if (!Loaded)
//         {
//             Url = ArtifactHealthService.GetUrl(null);
//             Loaded = true;
//         }
//         base.OnInitialized();
//     }

//     protected override async Task OnAfterRenderAsync(bool firstRender)
// 	{
// 		if(firstRender)
// 		{
//             if (!Loaded)
//             {
//                 Url = new(await JS.InvokeAsync<string>("getLocalFileUrl"));
//                 Loaded = true;
//             }

// 			//await JS.InvokeAsync<bool>("UtilityTest.testFunc");

//             @* var timer = new System.Timers.Timer(2000);
//             timer.Elapsed += async (s, e) =>
//             {
//                 if (pendingQueue.Count > 0)
//                 {
//                     var nextItem = pendingQueue.Dequeue();

//                     var patient = nextItem[0].Patient;
//                     if (patient != null)
//                     {
//                         var relevantData = patient.Firstname + " " + patient.Lastname;

//                         await JS.InvokeVoidAsync("alert", $"Hello {relevantData}!");

//                         await JS.InvokeVoidAsync("healthgorilla.forward", relevantData);
//                         //var success = result == "true";

//                         var result2 = await JS.InvokeAsync<string>("fuu", relevantData);
//                         var success2 = result2 == "true";
//                     }

//                 }
//             };
//             timer.Start(); *@
// 		}
// 		await base.OnAfterRenderAsync(firstRender);
// 	}
// }
