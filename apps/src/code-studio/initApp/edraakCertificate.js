function getAccountsEndpoint() {
  var domain = document.location.origin.match(/\/\/[\w-]+\.([\w-:\.]+)/)[1];
  if (domain === 'code.org:3000') {
    return 'dev';
  }
  return 'https://courses.' + domain + '/api/user/v1/accounts';
}

function reEncodeNonLatin1(data) {
  var encodedData = encodeURIComponent(data);
  encodedData = encodedData.replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1);
  });
  return decodeURIComponent(encodedData);
}

function redirectToCertificateImage(data, course_name) {
  var certificateData = btoa(reEncodeNonLatin1(JSON.stringify({
    name: data[0]['name'],
    course: course_name
  })));
  window.location.href = '/edraak_code_certificate/' + certificateData + '.jpg';
}

function certificateByCourseName(course_name) {
  var endPoint = getAccountsEndpoint();
  if (endPoint === 'dev') {
    redirectToCertificateImage([{'name': 'Dev User'}], course_name);
  } else {
    $.ajax({
      url: getAccountsEndpoint(),
      type: 'get',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      timeout: 3000
    }).done(function(data) {
      redirectToCertificateImage(data, course_name);
    }).fail(function () {
      console.log('Could not load Name from Edraak-edx profile!');
      window.setTimeout(function () {
        window.location.href = "/";
      }, 5000);
    });
  }
}

export function requestCertificate(course_name) {
  certificateByCourseName(course_name);
  return false;
}
