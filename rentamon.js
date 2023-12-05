$(".inline").pDatepicker({
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
  minDate: new persianDate().month(9).startOf("month"),
  maxDate: new persianDate().month(9).endOf("month"),

  navigator: {
    enabled: true,
    scroll: {
      enabled: false,
    },
  },

  format: "YYYY-MM-DD",

  resoinsive: true,

  template: `<div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
  <div class="month">{{ navigator.switch.text }}</div>
  <div class="datepicker-grid-view" >.
  {{#days.enabled}}
  {{#days.viewMode}}
  <div class="datepicker-day-view" >
  <div class="month-grid-box">
  <div class="header">
  <div class="title"></div>
  <div class="header-row">
  <div class="header-row-cell">شنبه</div>
  <div class="header-row-cell">یک</div>
  <div class="header-row-cell">دو</div>
  <div class="header-row-cell">سه</div>
  <div class="header-row-cell">چهار</div>
  <div class="header-row-cell">پنج</div>
  <div class="header-row-cell">جمعه</div>
  </div>
  </div>
  <table cellspacing="1" class="table-days">
  <tbody>
  {{#days.list}}
  <tr>
  {{#.}}
  {{#enabled}}
  <td data-unix="{{dataUnix}}" ><span  class="{{#otherMonth}}other-month{{/otherMonth}} {{#selected}}selected{{/selected}}">{{title}}</span><span class="reserved"></span></td>
  {{/enabled}}
  {{^enabled}}
  <td data-unix="{{dataUnix}}" class="disabled"><span class="{{#otherMonth}}other-month{{/otherMonth}}">{{title}}</span><span class="reserved {{#otherMonth}}other-month{{/otherMonth}}"></span></td>
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
  } else {
    return "not sure";
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
  } else {
    return "not sure";
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
  } else {
    return "not sure";
  }
}

function mizboonStatus(mizboon) {
  if (mizboon["booked"] === 0 && mizboon["closed"] === 1) {
    return "blocked";
  } else if (mizboon["booked"] === 1 && mizboon["closed"] === 1) {
    return "booked";
  } else if (mizboon["booked"] === 0 && mizboon["closed"] === 0) {
    return "unblocked";
  } else {
    return "not sure";
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
  $(document).off();

  document.querySelector(".block").addEventListener("click", () => {
    var selected = document.querySelectorAll(".selected");
    var selectedDate = [];
    if (selected.length > 0) {
      selected.forEach((z) => {
        z.classList.remove("selected");
        selectedDate.push(
          new persianDate(parseInt(z.getAttribute("data-unix"))).format(
            "YYYY-MM-DD"
          )
        );
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/otaghak",
        method: "GET",
        data: {
          room: 55614,
          unblockDays: null,
          blockDays: selectedDate.join(","),
        },
        success: function (response) {
          console.log("otaghak response:", response);
        },
        error: function (error) {
          console.error("otaghak error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/jabama/disable",
        method: "GET",
        data: { days: selectedDate.join(",") },
        success: function (response) {
          console.log("jabama response:", response);
        },
        error: function (error) {
          console.error("jabama error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/jajiga",
        method: "GET",
        data: {
          dates: selectedDate.join(","),
          room_id: 3142341,
          disable_count: 1,
        },
        success: function (response) {
          console.log("jajiga response:", response);
        },
        error: function (error) {
          console.error("jajiga error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/shab",
        method: "GET",
        data: { dates: selectedDate.join(","), disabled: 1 },
        success: function (response) {
          console.log("shab response:", response);
        },
        error: function (error) {
          console.error("shab error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/mizboon/close",
        method: "GET",
        data: { days: selectedDate.join(","), rental_id: 10922 },
        success: function (response) {
          console.log("mizboon response:", response);
        },
        error: function (error) {
          console.error("mizboon error:", error);
        },
      });

      alert("✅ ممنون!\nتغییرات اعمال شد.");
      window.location.reload();
    } else {
      alert("هنوز روزی انتخاب نکردی");
    }
  });

  document.querySelector(".unblock").addEventListener("click", () => {
    var selected = document.querySelectorAll(".selected");
    var selectedDate = [];
    if (selected.length > 0) {
      selected.forEach((z) => {
        z.classList.remove("selected");
        selectedDate.push(
          new persianDate(parseInt(z.getAttribute("data-unix"))).format(
            "YYYY-MM-DD"
          )
        );
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/otaghak",
        method: "GET",
        data: {
          room: 55614,
          unblockDays: selectedDate.join(","),
          blockDays: null,
        },
        success: function (response) {
          console.log("otaghak response:", response);
        },
        error: function (error) {
          console.error("otaghak error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/jabama/enable",
        method: "GET",
        data: { days: selectedDate.join(",") },
        success: function (response) {
          console.log("jabama response:", response);
        },
        error: function (error) {
          console.error("jabama error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/jajiga",
        method: "GET",
        data: {
          dates: selectedDate.join(","),
          room_id: 3142341,
          disable_count: 0,
        },
        success: function (response) {
          console.log("jajiga response:", response);
        },
        error: function (error) {
          console.error("jajiga error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/shab",
        method: "GET",
        data: { dates: selectedDate.join(","), disabled: 0 },
        success: function (response) {
          console.log("shab response:", response);
        },
        error: function (error) {
          console.error("shab error:", error);
        },
      });

      $.ajax({
        url: "https://classiccowl.chbk.run/mizboon/unclose",
        method: "GET",
        data: { days: selectedDate.join(","), rental_id: 10922 },
        success: function (response) {
          console.log("mizboon response:", response);
        },
        error: function (error) {
          console.error("mizboon error:", error);
        },
      });

      alert("✅ ممنون!\nتغییرات اعمال شد.");
      window.location.reload();
    } else {
      alert("هنوز روزی انتخاب نکردی");
    }
  });

  const tehranTimeZone = "Asia/Tehran";

  const currentDate = new Date();

  const tehranTimestamp = currentDate.toLocaleString("en-US", {
    timeZone: tehranTimeZone,
  });

  const tehran = new Date(tehranTimestamp);

  const tehranzeroo = tehran.setHours(0, 0, 0, 0);

  const todayTD = document.querySelector(
    `.datepicker-plot-area-inline-view td[data-unix="${tehranzeroo}"] span`
  );

  const todayDate = persianToInteger(todayTD.textContent);

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

  const urls = [url1, url2, url3, url4, url5];

  const fetchData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  const fetchPromises = urls.map((url) => fetchData(url));

  Promise.all(fetchPromises)
    .then((results) => {
      for (var i = 1; i < todayDate; i++) {
        results[3].unshift({ disable_count: null });
      }

      for (let i = 0; i < 30; i++) {
        var status = {
          jabamaStatus: jabamaStatus(results[0][i]),
          mizboonStatus: mizboonStatus(results[1][i]),
          otagakStatus: otagakStatus(results[2][i]),
          jajigaStatus: jajigaStatus(results[3][i]),
          shabStatus: shabStatus(results[4][i]),
        };

        console.log(i, status);

        if (i + 1 < todayDate) {
          days[i].parentElement.classList.add("disabled");
          days[i].parentElement.classList.add("passed-days");
        } else if (
          status["jabamaStatus"] === "blocked" &&
          status["mizboonStatus"] === "blocked" &&
          status["otagakStatus"] === "blocked" &&
          status["jajigaStatus"] === "blocked" &&
          status["shabStatus"] === "blocked"
        ) {
          days[i].parentElement.classList.add("blocked-days");
        } else if (
          status["jabamaStatus"] === "booked" ||
          status["mizboonStatus"] === "booked" ||
          status["otagakStatus"] === "booked" ||
          status["jajigaStatus"] === "booked" ||
          status["shabStatus"] === "booked"
        ) {
          days[i].parentElement.classList.add("booked-days");

          const website = Object.keys(status).find(
            (key) => status[key] === "booked"
          );

          days[i].nextSibling.innerHTML = website;
        }
      }

      const availableDays = document.querySelectorAll(
        ".datepicker-day-view td:not(.disabled)"
      );
      availableDays.forEach((day) => {
        day.addEventListener("click", (e) => {
          console.log(e);
          if (e.target.parentElement.tagName === "TD") {
            e.target.parentElement.classList.toggle("selected");
          } else if (e.target.tagName === "TD") {
            e.target.classList.toggle("selected");
          }
        });
      });
    })
    .catch((error) => {
      console.error(error);
    });
});
