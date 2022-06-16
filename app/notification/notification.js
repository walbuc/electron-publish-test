function notificationDetail({ mrn, lastname, firstname, dob } = {}) {
  const notificationDetail = {
    mrn,
    lastname,
    firstname,
    dob,
  }
  return notificationDetail
}

function notification({
  practitionerId,
  deviceId,
  type,
  patient: { mrn, lastname, firstname, dob } = {},
}) {
  const notification = {
    practitionerId,
    deviceId,
    type,
    patient: notificationDetail({ mrn, lastname, firstname, dob }),
  }
  return notification
}

function notificationMessage({ message } = {}) {
  const notification = {
    message,
  }
  return notification
}

module.exports = { notification, notificationMessage, notificationDetail }

// ALL notification have these fields?
// Cerener and epic are the same notification structure?
// patient id in xml notification as patient mrn
// what happens if I get patient open event notification before clicking the browser??

/*
             {
	            "PractitionerId":"12742069",
	            "Type":"chart-open",
	            "DeviceId": "PATRICK-DESKTOP",
	            "Patient": {
		            "mrn": "12345",
		            "firstname": "John",
		            "lastname": "Doe",
		            "dob": "1968-01-01"
	            }
            }
             */
