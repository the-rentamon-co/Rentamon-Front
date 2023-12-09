const mainApiUrl = "https://classiccowl.chbk.run";

const tehranTimeZone = "Asia/Tehran";

const currentDate = new Date();

const tehranTimestamp = currentDate.toLocaleString("en-US", {
  timeZone: tehranTimeZone,
});

const tehran = new Date(tehranTimestamp);

const tehranzeroo = tehran.setHours(0, 0, 0, 0);

const routes = {
  otaghak: {
    block: mainApiUrl + "/otaghak",
    unblock: mainApiUrl + "/otaghak",
    calendar:
      mainApiUrl +
      "/otaghak/calendar?roomId=55614&startDate=1402-09-01&endDate=1402-09-30",
    room: 55614
  },

  jabama: {
    block: mainApiUrl + "/jabama/disable",
    unblock: mainApiUrl + "/jabama/enable",
    calendar:
      mainApiUrl +
      "/jabama/calendar?room=109108&start_date=1402-9-1&end_date=1402-10-01",
      room: 109108
  },

  jajiga: {
    block: mainApiUrl + "/jajiga",
    unblock: mainApiUrl + "/jajiga",
    calendar: mainApiUrl + "/jajiga/calendar?room_id=3142341",
    room: 3142341
  },

  shab: {
    block: mainApiUrl + "/shab",
    unblock: mainApiUrl + "/shab",
    calendar:
      mainApiUrl +
      "/shab/calendar?room=9094&from_date=1402-09-01&to_date=1402-09-31",
      room: 9094
  },

  mizboon: {
    block: mainApiUrl + "/mizboon/close",
    unblock: mainApiUrl + "/mizboon/unclose",
    calendar:
      mainApiUrl +
      "/mizboon/calendar?rental_id=10922&from=1402-09-01&to=1402-09-30",
      room: 10922
  },

  other: {
    blockUnblock: mainApiUrl + "/other",
    calendar: mainApiUrl + "/other/calendar",
  },
};

const urls = [
  routes.jabama.calendar,
  routes.mizboon.calendar,
  routes.otaghak.calendar,
  routes.jajiga.calendar,
  routes.shab.calendar,
  routes.other.calendar,
];

const fetchData = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const messages = {
  blockDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  unblockDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  reserveDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  notSelectedDay: "هنوز روزی انتخاب نکردی",
};

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
  if (jabama) {
    if (jabama["status"] === "disabledByHost") {
      return "blocked";
    } else if (jabama["status"] === "reserved") {
      return "booked";
    } else if (jabama["status"] === "available") {
      return "unblocked";
    } else {
      return "not sure";
    }
  } else {
    return "not sure";
  }
}

function jajigaStatus(jajiga) {
  if (jajiga) {
    if (
      jajiga["books_count"] === 0 &&
      jajiga["disable_count"] === 1 &&
      jajiga["unavailable_type"] === "disabled"
    ) {
      return "blocked";
    } else if (
      jajiga["books_count"] === 1 &&
      jajiga["disable_count"] === 0 &&
      jajiga["unavailable_type"] === "booked"
    ) {
      return "booked";
    } else if (jajiga["books_count"] === 0 && jajiga["disable_count"] === 0) {
      return "unblocked";
    } else {
      return "not sure";
    }
  } else {
    return "not sure";
  }
}

function otherStatus(other) {
  if (other) {
    if (other["status"] === "booked") {
      return "booked";
    } else {
      return "not sure";
    }
  } else {
    return "not sure";
  }
}

function shabStatus(shab) {
  if (shab) {
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
  } else {
    return "not sure";
  }
}

function mizboonStatus(mizboon) {
  if (mizboon) {
    if (mizboon["booked"] === 0 && mizboon["closed"] === 1) {
      return "blocked";
    } else if (mizboon["booked"] === 1 && mizboon["closed"] === 1) {
      return "booked";
    } else if (mizboon["booked"] === 0 && mizboon["closed"] === 0) {
      return "unblocked";
    } else {
      return "not sure";
    }
  } else {
    return "not sure";
  }
}

function otagakStatus(otaghak) {
  if (otaghak) {
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
      return "not sure";
    }
  } else {
    return "not sure";
  }
}

function rentamonApiCaller(website, data, action, method = "GET") {
  $.ajax({
    url: routes[website][action],
    method: method,
    data: data,
    success: function (response) {
      console.log(website, response);
    },
    error: function (error) {
      console.error(website, error);
    },
  });
}

function blockBtnClicked() {
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

    rentamonApiCaller(
      (website = "jabama"),
      (data = { roomId: routes['jabama']['room'], days: selectedDate.join(",") }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: selectedDate.join(","),
        room_id: routes['jajiga']['room'],
        disable_count: 1,
      }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "shab"),
      (data = { roomId: routes['shab']['room'], dates: selectedDate.join(","), disabled: 1 }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "mizboon"),
      (data = { days: selectedDate.join(","), rental_id: routes['mizboon']['room'] }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        room: routes['otaghak']['room'],
        unblockDays: null,
        blockDays: selectedDate.join(","),
      }),
      (action = "block")
    );
    alert(messages.blockDaySuccess);
    window.location.reload();
  } else {
    alert(messages.notSelectedDay);
  }
}

function unblockBtnClicked() {
  var selected = document.querySelectorAll(".selected");

  console.log(selected);
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

    rentamonApiCaller(
      (website = "jabama"),
      (data = { roomId: routes['jabama']['room'], days: selectedDate.join(",") }),
      (action = "unblock")
    );

    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: selectedDate.join(","),
        room_id: routes['jajiga']['room'],
        disable_count: 0,
      }),
      (action = "unblock")
    );

    rentamonApiCaller(
      (website = "shab"),
      (data = { roomId: routes['shab']['room'], dates: selectedDate.join(","), disabled: 0 }),
      (action = "unblock")
    );

    rentamonApiCaller(
      (website = "mizboon"),
      (data = { days: selectedDate.join(","), rental_id: routes['mizboon']['room'] }),
      (action = "unblock")
    );

    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        room: routes['otaghak']['room'],
        unblockDays: selectedDate.join(","),
        blockDays: null,
      }),
      (action = "unblock")
    );
    rentamonApiCaller(
      (website = "other"),
      (data = {
        action: "available",
        days: selectedDate.join(","),
      }),
      (action = "blockUnblock")
    );

    alert(messages.unblockDaySuccess);
    window.location.reload();
  } else {
    alert(messages.notSelectedDay);
  }
}

function reserveOther() {
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

    rentamonApiCaller(
      (website = "jabama"),
      (data = { roomId: routes['jabama']['room'], days: selectedDate.join(",") }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: selectedDate.join(","),
        room_id: routes['jajiga']['room'],
        disable_count: 1,
      }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "shab"),
      (data = { roomId: routes['shab']['room'], dates: selectedDate.join(","), disabled: 1 }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "mizboon"),
      (data = { days: selectedDate.join(","), rental_id: routes['mizboon']['room'] }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        room: routes['otaghak']['room'],
        unblockDays: null,
        blockDays: selectedDate.join(","),
      }),
      (action = "block")
    );

    rentamonApiCaller(
      (website = "other"),
      (data = {
        action: "book",
        days: selectedDate.join(","),
      }),
      (action = "blockUnblock")
    );
    alert(messages.reserveDaySuccess);
    window.location.reload();
  } else {
    alert(messages.notSelectedDay);
  }
}

function checkAction() {
  let action = document.querySelector('input[name="block"]:checked');
  console.log(action);
  if (action) {
    if (action.value === "block") {
      // alert("block");
      blockBtnClicked();
    } else if (action.value === "reserve") {
      // alert("reserve");
      reserveOther();
    } else if (action.value === "unblock") {
      // alert("unblock");
      unblockBtnClicked();
    }
  } else {
    alert(messages.notSelectedDay);
  }
}

$(".inline").pDatepicker({
  initialValue: false,
  dayPicker: {
    enabled: true,
    titleFormat: "MMMM YYYY",
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

  template: `
  <div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
  <div class="month">{{ navigator.switch.text }}</div>
  <div class="datepicker-grid-view">
    {{#days.enabled}} {{#days.viewMode}}
    <div class="datepicker-day-view">
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
              {{#.}} {{#enabled}}
              <td data-unix="{{dataUnix}}">
                <span
                  class="{{#otherMonth}}other-month{{/otherMonth}} {{#selected}}selected{{/selected}}"
                  >{{title}}</span
                ><span class="reserved"></span>
              </td>
              {{/enabled}} {{^enabled}}
              <td data-unix="{{dataUnix}}" class="disabled">
                <span class="{{#otherMonth}}other-month{{/otherMonth}}"
                  >{{title}}</span
                ><span
                  class="reserved {{#otherMonth}}other-month{{/otherMonth}}"
                ></span>
              </td>
              {{/enabled}} {{/.}}
            </tr>
            {{/days.list}}
          </tbody>
        </table>
      </div>
    </div>
    {{/days.viewMode}} {{/days.enabled}}
  </div>
</div>
`,
});

$(document).ready(function () {
  $(document).off();

  document.querySelector(".submit").addEventListener("click", checkAction);
  // document.querySelector(".block").addEventListener("click", blockBtnClicked);
  // document
  //   .querySelector(".unblock")
  //   .addEventListener("click", unblockBtnClicked);

  const todayTD = document.querySelector(
    `.datepicker-plot-area-inline-view td[data-unix="${tehranzeroo}"] span`
  );

  const todayDate = persianToInteger(todayTD.textContent);

  const days = document.querySelectorAll(
    ".datepicker-plot-area-inline-view .table-days span:not(.other-month):not(.reserved)"
  );

  const fetchPromises = urls.map((url) => fetchData(url));

  Promise.all(fetchPromises)
    .then((results) => {
      console.log(results);
      for (var i = 1; i < todayDate; i++) {
        results[3].unshift({ disable_count: null });
      }

      for (let i = 0; i < 30; i++) {
        if (i + 1 < todayDate) {
          days[i].parentElement.classList.add("passed-days", "disabled");
          console.log(
            `🢆 .............. 1402/09/${
              i + 1
            } .............. 🢆 \n  .................. passed .................. `
          );

          continue;
        }

        var status = {
          jabamaStatus: jabamaStatus(results[0][i]),
          mizboonStatus: mizboonStatus(results[1][i]),
          otagakStatus: otagakStatus(results[2][i]),
          jajigaStatus: jajigaStatus(results[3][i]),
          shabStatus: shabStatus(results[4][i]),
          otherStatus: otherStatus(results[5][i]),
        };

        var names = {
          jabamaStatus: "جاباما",
          mizboonStatus: "میزبون",
          otagakStatus: "اتاقک",
          jajigaStatus: "جاجیگا",
          shabStatus: "شب",
          otherStatus: "رزرو",
        };
        console.log(`🢆 .............. 1402/09/${i + 1} .............. 🢆`);
        console.table(status);

        if (
          status["jabamaStatus"] === "booked" ||
          status["mizboonStatus"] === "booked" ||
          status["otagakStatus"] === "booked" ||
          status["jajigaStatus"] === "booked" ||
          status["shabStatus"] === "booked" ||
          status["otherStatus"] === "booked"
        ) {
          days[i].parentElement.classList.add("booked-days");
          const website = Object.keys(status).find(
            (key) => status[key] === "booked"
          );
          days[i].nextSibling.innerHTML = names[website];
        } else if (
          status["jabamaStatus"] === "blocked" &&
          status["mizboonStatus"] === "blocked" &&
          status["otagakStatus"] === "blocked" &&
          status["jajigaStatus"] === "blocked" &&
          status["shabStatus"] === "blocked"
        ) {
          days[i].parentElement.classList.add("blocked-days");
        }
      }
      const availableDays = document.querySelectorAll(
        ".datepicker-day-view td:not(.disabled)"
      );
      availableDays.forEach((day) => {
        day.addEventListener("click", (e) => {
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
