var daysPicked = [];

$(".inline").pDatepicker({
  onlySelectOnDate: true,
  initialValue: false,
  dayPicker: {
    enabled: true,
    titleFormat: "YYYY MMMM",
  },
  monthPicker: {
    enabled: false,
    titleFormat: "YYYY",
  },
  yearPicker: {
    enabled: false,
    titleFormat: "YYYY",
  },
  inline: true,

  navigator: {
    scroll: {
      enabled: false,
    },
  },

  format: "YYYY-MM-DD",

  resoinsive: true,

  template: `<div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
  {{#navigator.enabled}}
  <div class="navigator">
  <div class="datepicker-header">
  <div class="btn btn-next">></div>
  <div class="btn btn-switch">{{ navigator.switch.text }}</div>
  <div class="btn btn-prev"><</div>
  </div>
  </div>
  {{/navigator.enabled}}
  <div class="datepicker-grid-view" >
  {{#days.enabled}}
  {{#days.viewMode}}
  <div class="datepicker-day-view" >
  <div class="month-grid-box">
  <div class="header">
  <div class="title"></div>
  <div class="header-row">
  <div class="header-row-cell">شنبه</div>
  <div class="header-row-cell">یک شنبه</div>
  <div class="header-row-cell">دو شنبه</div>
  <div class="header-row-cell">سه شنبه</div>
  <div class="header-row-cell">چهار شنبه</div>
  <div class="header-row-cell">پنج شنبه</div>
  <div class="header-row-cell">جمعه</div>
  </div>
  </div>
  <table cellspacing="0" class="table-days">
  <tbody>
  {{#days.list}}
  <tr>
  {{#.}}
  {{#enabled}}
  <td data-unix="{{dataUnix}}" class="disabled"><span  class="{{#otherMonth}}other-month{{/otherMonth}} {{#selected}}selected{{/selected}}">{{title}}</span><span class="reserved"></span></td>
  {{/enabled}}
  {{^enabled}}
  <td data-unix="{{dataUnix}}" class="disabled"><span class="day{{#otherMonth}}other-month{{/otherMonth}}">{{title}}</span></td>
  {{/enabled}}

  {{/.}}
  </tr>
  {{/days.list}}
  </tbody>
  </table>
  </div>
  </div>
  {{/days.viewMode}}
  {{/days.enabled}}

`,
});
function persianToInteger(persianString) {
  const persianNumerals = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  const convertDigit = (digit) => persianNumerals.indexOf(digit);

  const arabicString = persianString
    .split("")
    .map((char) => (persianNumerals.includes(char) ? convertDigit(char) : char))
    .join("");

  return parseInt(arabicString, 10);
}

function jabamaStatus(jabama) {
  if (jabama["status"] === "disabledByHost") {
    return "blocked";
  } else if (jabama["status"] === "reserved") {
    return "booked";
  } else if (jabama["status"] === "available") {
    return "unblocked";
  }
}

function jajigaStatus(jajiga) {
  if (
    jajiga["books_count"] === 0 &&
    jajiga["disable_count"] === 1 &&
    jajiga["unavailable_type"] === "disabled"
  ) {
    return "blocked";
  } else if (
    jajiga["books_count"] === 1 &&
    jajiga["disable_count"] === 1 &&
    jajiga["unavailable_type"] === "booked"
  ) {
    return "booked";
  } else if (jajiga["books_count"] === 0 && jajiga["disable_count"] === 0) {
    return "unblocked";
  }
}

function shabStatus(shab) {
  if (
    shab["available_units_count"] === 1 &&
    shab["is_disabled"] === true &&
    shab["is_non_bookable"] === true &&
    shab["is_unavailable"] === false
  ) {
    return "blocked";
  } else if (
    shab["available_units_count"] === 0 &&
    shab["is_disabled"] === true &&
    shab["is_non_bookable"] === true &&
    shab["is_unavailable"] === false
  ) {
    return "booked";
  } else if (
    shab["available_units_count"] === 1 &&
    shab["is_disabled"] === false &&
    shab["is_non_bookable"] === false &&
    shab["is_unavailable"] === false
  ) {
    return "unblocked";
  }
}

function mizboonStatus(mizboon) {
  if (mizboon["booked"] === 0 && mizboon["closed"] === 1) {
    return "blocked";
  } else if (mizboon["booked"] === 1 && mizboon["closed"] === 1) {
    return "booked";
  } else if (mizboon["booked"] === 0 && mizboon["closed"] === 0) {
    return "unblocked";
  }
}

function otagakStatus(otaghak) {
  if (
    otaghak["isBlocked"] === true &&
    otaghak["blockedType"] === "BlockedManually"
  ) {
    return "blocked";
  } else if (
    otaghak["isBlocked"] === true &&
    otaghak["blockedType"] === "BlockedByBooking"
  ) {
    return "booked";
  } else if (
    otaghak["isBlocked"] === false &&
    otaghak["blockedType"] === null
  ) {
    return "unblocked";
  } else {
    return "notsure";
  }
}

$(document).ready(function () {
  // Set the timezone to Tehran
  const tehranTimeZone = "Asia/Tehran";

  // Create a new Date object
  const currentDate = new Date();

  // Get the timestamp for the current date in Tehran timezone
  const tehranTimestamp = currentDate.toLocaleString("en-US", {
    timeZone: tehranTimeZone,
  });

  const tehran = new Date(tehranTimestamp);

  const tehranzeroo = tehran.setHours(0, 0, 0, 0);

  const todayTD = document.querySelector(
    `.datepicker-plot-area-inline-view td[data-unix="${tehranzeroo}"] span`
  );

  const todayDate = persianToInteger(todayTD.textContent);

  // Sample URLs for demonstration purposes
  const days = document.querySelectorAll(
    ".datepicker-plot-area-inline-view .table-days span:not(.other-month):not(.reserved)"
  );

  const url1 =
    "https://classiccowl.chbk.run/jabama/calendar?room=109108&start_date=1402-9-1&end_date=1402-10-01";
  const url2 =
    "https://classiccowl.chbk.run/mizboon/calendar?rental_id=10922&from=1402-09-01&to=1402-09-30";
  const url3 =
    "https://classiccowl.chbk.run/otaghak/calendar?roomId=55614&startDate=1402-09-01&endDate=1402-09-30";
  const url4 = "https://classiccowl.chbk.run/jajiga/calendar?room_id=3142341";
  const url5 =
    "https://classiccowl.chbk.run/shab/calendar?room=9094&from_date=1402-09-01&to_date=1402-09-31";

  // Array of URLs
  const urls = [url1, url2, url3, url4, url5];

  // Function to perform a fetch for a single URL
  const fetchData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  // Array to store the promises returned by fetchData
  const fetchPromises = urls.map((url) => fetchData(url));

  // Use Promise.all to wait for all promises to resolve
  Promise.all(fetchPromises)
    .then((results) => {
      // Handle the results here

      // console.log(results[0][0]["status"])
      // console.log(results[1][0]["closed"])
      // console.log(results[2][0]["isBlocked"])
      // console.log(results[3][0]["disable_count"])
      // console.log(results[4][0]["status"])
      // console.log(results);
      // console.log(today);

      for (var i = 1; i < todayDate; i++) {
        results[3].unshift({ disable_count: null });
      }
      // console.log(results);

      // console.log(jabamaStatus(results[0][19]));
      // console.log(mizboonStatus(results[1][19]));
      // console.log(otagakStatus(results[2][19]));
      // console.log(jajigaStatus(results[3][19]));
      // console.log(shabStatus(results[4][19]));

      for (let i = 0; i < 30; i++) {
        var status = {
          jabamaStatus: jabamaStatus(results[0][i]),
          mizboonStatus: mizboonStatus(results[1][i]),
          otagakStatus: otagakStatus(results[2][i]),
          jajigaStatus: jajigaStatus(results[3][i]),
          shabStatus: shabStatus(results[4][i]),
        };

        if (i + 1 < todayDate) {
          days[i].classList.add("passed-days");
          days[i].nextSibling.classList.add("passed-days");
        } else if (
          status["jabamaStatus"] === "blocked" &&
          status["mizboonStatus"] === "blocked" &&
          status["otagakStatus"] === "blocked" &&
          status["jajigaStatus"] === "blocked" &&
          status["shabStatus"] === "blocked"
        ) {
          days[i].classList.add("blocked-days");
          days[i].nextSibling.classList.add("blocked-days");
        } else if (
          status["jabamaStatus"] === "booked" ||
          status["mizboonStatus"] === "booked" ||
          status["otagakStatus"] === "booked" ||
          status["jajigaStatus"] === "booked" ||
          status["shabStatus"] === "booked"
        ) {
          days[i].classList.add("booked-days");
          days[i].nextSibling.classList.add("booked-days");

          const website = Object.keys(status).find(
            (key) => status[key] === "booked"
          );

          days[i].nextSibling.innerHTML = website;
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
});
//   $(".inline").pDatepicker({
//     inline: true,
//     resoinsive: true,
//     format: "",
//     viewMode: "day",
//     initialValue: true,
//     minDate: null,
//     maxDate: null,
//     autoClose: false,
//     position: "auto",
//     altFormat: "",
//     altField: "#altfieldExample",
//     onlyTimePicker: false,
//     onlySelectOnDate: false,
//     calendarType: "persian",
//     inputDelay: "",
//     observer: false,
//     calendar: {
//       persian: {
//         locale: "fa",
//         showHint: false,
//         leapYearMode: "algorithmic",
//       },
//       gregorian: {
//         locale: "fa",
//         showHint: false,
//       },
//     },
//     navigator: {
//       enabled: true,
//       scroll: {
//         enabled: false,
//       },
//       text: {
//         btnNextText: "<",
//         btnPrevText: ">",
//       },
//     },
//     toolbox: {
//       enabled: false,
//       calendarSwitch: {
//         enabled: false,
//         format: "",
//       },
//       todayButton: {
//         enabled: false,
//         text: {
//           fa: "",
//           en: "",
//         },
//       },
//       submitButton: {
//         enabled: false,
//         text: {
//           fa: "",
//           en: "",
//         },
//       },
//       text: {
//         btnToday: "امروز",
//       },
//     },
//     timePicker: {
//       enabled: false,
//       step: "",
//       hour: {
//         enabled: false,
//         step: null,
//       },
//       minute: {
//         enabled: false,
//         step: null,
//       },
//       second: {
//         enabled: false,
//         step: null,
//       },
//       meridian: {
//         enabled: false,
//       },
//     },
//     dayPicker: {
//       enabled: true,
//       titleFormat: "YYYY MMMM",
//     },
//     monthPicker: {
//       enabled: false,
//       titleFormat: "YYYY",
//     },
//     yearPicker: {
//       enabled: false,
//       titleFormat: "YYYY",
//     },
//     responsive: true,
//   });

//   dayPicker: {
//     enabled: true,
//     titleFormat: "YYYY MMMM",
//   },
//   responsive: true,
//   // inline: true,
//   // observer: false,
//   navigator: {
//     scroll: {
//       enabled: false,
//     },
//     text: {
//       btnNextText: ">",
//       btnPrevText: "<",
//     },
//   },
//   initialValue: false,
//   format: "YYYY-MM-DD",
//   autoClose: true,

//   onSelect: function (unix) {
//     daysPicked.push($(".dayPicker").val());

//     console.log($(".dayPicker").val());
//   },
