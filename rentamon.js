const mainApiUrl = "https://rentamon.chbk.run";

const rentamon_user_id = document.querySelector("#rentamon_id").innerText;
const rentamon_room_id = document.querySelector("#rentamon_room_id").innerText;

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
    calendar: mainApiUrl + "/otaghak/calendar",
    room: rentamon_room_id,
  },
  jabama: {
    block: mainApiUrl + "/jabama/disable",
    unblock: mainApiUrl + "/jabama/enable",
    calendar: mainApiUrl + "/jabama/calendar",
    room: rentamon_room_id,
  },
  jajiga: {
    block: mainApiUrl + "/jajiga",
    unblock: mainApiUrl + "/jajiga",
    calendar: mainApiUrl + "/jajiga/calendar",
    room: rentamon_room_id,
  },
  shab: {
    block: mainApiUrl + "/shab",
    unblock: mainApiUrl + "/shab",
    calendar: mainApiUrl + "/shab/calendar",
    room: rentamon_room_id,
  },
  mizboon: {
    block: mainApiUrl + "/mizboon/close",
    unblock: mainApiUrl + "/mizboon/unclose",
    calendar: mainApiUrl + "/mizboon/calendar",
    room: rentamon_room_id,
  },
  other: {
    blockUnblock: mainApiUrl + "/other",
    calendar: mainApiUrl + "/other/calendar",
  },
};

const messages = {
  blockDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  unblockDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  reserveDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  notSelectedDay: "هنوز هیچ روزی رو انتخاب نکردی",
};

const names = {
  jabamaStatus: { fa: "جاباما", en: "jabama" },
  mizboonStatus: { fa: "میزبون", en: "mizbon" },
  otaghakStatus: { fa: "اتاقک", en: "otaghak" },
  jajigaStatus: { fa: "جاجیگا", en: "jajiga" },
  shabStatus: { fa: "شب", en: "shab" },
  otherStatus: { fa: "رزرو", en: "other" },
};

const fetchData = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
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
function convertToPersianNumber(number) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return number.replace(/\d/g, (digit) => persianDigits[digit]);
}

function jabamaStatus(jabama) {
  if (!jabama) {
    return "not sure";
  }

  switch (jabama.status) {
    case "disabledByHost":
      return "blocked";
    case "reserved":
      return "booked";
    case "available":
      return "unblocked";
    default:
      return "not sure";
  }
}

function jajigaStatus(jajiga) {
  if (!jajiga) {
    return "not sure";
  }
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
}

function otherStatus(other) {
  if (!other) {
    return "not sure";
  }
  if (other.status === "booked") {
    return "booked";
  } else {
    return "not sure";
  }
}

function shabStatus(shab) {
  if (!shab) {
    return "not sure";
  }

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
  if (!mizboon) {
    return "not sure";
  }

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

function otaghakStatus(otaghak) {
  if (!otaghak) {
    return "not sure";
  }
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
}

function rentamonApiCaller(website, data, action, method = "GET") {
  $.ajax({
    url: routes[website][action],
    method: method,
    data: {
      ...data,
      ...{ rentamon_room_id: rentamon_room_id, rentamon_id: rentamon_user_id },
    },
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
      (data = {
        rentamon_room_id: routes["jabama"]["room"],
        days: selectedDate.join(","),
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: selectedDate.join(","),
        rentamon_room_id: routes["jajiga"]["room"],
        disable_count: 1,
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "shab"),
      (data = {
        rentamon_room_id: routes["shab"]["room"],
        dates: selectedDate.join(","),
        disabled: 1,
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "mizboon"),
      (data = {
        days: selectedDate.join(","),
        rentamon_room_id: routes["mizboon"]["room"],
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        rentamon_room_id: routes["otaghak"]["room"],
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
      (data = {
        rentamon_room_id: routes["jabama"]["room"],
        days: selectedDate.join(","),
      }),
      (action = "unblock")
    );
    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: selectedDate.join(","),
        rentamon_room_id: routes["jajiga"]["room"],
        disable_count: 0,
      }),
      (action = "unblock")
    );
    rentamonApiCaller(
      (website = "shab"),
      (data = {
        rentamon_room_id: routes["shab"]["room"],
        dates: selectedDate.join(","),
        disabled: 0,
      }),
      (action = "unblock")
    );
    rentamonApiCaller(
      (website = "mizboon"),
      (data = {
        days: selectedDate.join(","),
        rentamon_room_id: routes["mizboon"]["room"],
      }),
      (action = "unblock")
    );
    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        rentamon_room_id: routes["otaghak"]["room"],
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
    // window.location.reload();
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
      (data = {
        rentamon_room_id: routes["jabama"]["room"],
        days: selectedDate.join(","),
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: selectedDate.join(","),
        rentamon_room_id: routes["jajiga"]["room"],
        disable_count: 1,
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "shab"),
      (data = {
        rentamon_room_id: routes["shab"]["room"],
        dates: selectedDate.join(","),
        disabled: 1,
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "mizboon"),
      (data = {
        days: selectedDate.join(","),
        rentamon_room_id: routes["mizboon"]["room"],
      }),
      (action = "block")
    );
    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        rentamon_room_id: routes["otaghak"]["room"],
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

const tobeDisabled = {
  jabama: (single) => {
    rentamonApiCaller(
      (website = "jabama"),
      (data = {
        rentamon_room_id: routes["jabama"]["room"],
        days: single,
      }),
      (action = "block")
    );
  },
  jajiga: (single) => {
    rentamonApiCaller(
      (website = "jajiga"),
      (data = {
        dates: single,
        rentamon_room_id: routes["jajiga"]["room"],
        disable_count: 1,
      }),
      (action = "block")
    );
  },
  shab: (single) => {
    rentamonApiCaller(
      (website = "shab"),
      (data = {
        rentamon_room_id: routes["shab"]["room"],
        dates: single,
        disabled: 1,
      }),
      (action = "block")
    );
  },
  mizboon: (single) => {
    rentamonApiCaller(
      (website = "mizboon"),
      (data = {
        days: single,
        rentamon_room_id: routes["mizboon"]["room"],
      }),
      (action = "block")
    );
  },
  otaghak: (single) => {
    rentamonApiCaller(
      (website = "otaghak"),
      (data = {
        rentamon_room_id: routes["otaghak"]["room"],
        unblockDays: null,
        blockDays: single,
      }),
      (action = "block")
    );
  },
};

function discountBtnClicked() {
  var selected = document.querySelectorAll(".selected");
  var selectedDate = [];
  var jabamaPrice = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
      jabamaPrice.push(z.getAttribute("price-from-jabama"));
    });
    const priceTargetElementId = "elementor-popup-modal";
    const priceObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const addedNodes = Array.from(mutation.addedNodes);
          const targetElement = addedNodes.find(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              node.id.includes(priceTargetElementId)
          );

          if (targetElement) {
            document.querySelector('input[name="form_fields[dates]"').value =
              selectedDate;
            document.querySelector(
              'input[name="form_fields[noDiscountPrice]"'
            ).value = jabamaPrice[0];
          }
        }
      }
    });
    priceObserver.observe(document.body, { childList: true, subtree: true });
  } else {
  }
}

function priceBtnClicked() {
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

    const priceTargetElementId = "elementor-popup-modal";
    const priceObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const addedNodes = Array.from(mutation.addedNodes);
          const targetElement = addedNodes.find(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              node.id.includes(priceTargetElementId)
          );
          if (targetElement) {
            document.querySelector('input[name="form_fields[dates]"').value =
              selectedDate;
            console.log(
              'Element with ID containing "elementor-popup-modal" added:',
              targetElement
            );
          }
        }
      }
    });

    priceObserver.observe(document.body, { childList: true, subtree: true });
  } else {
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
  minDate: new persianDate().startOf("day"),
  // maxDate: new persianDate().month(10).endOf("month"),
  maxDate: new persianDate()
    .add("month", 3)
    .startOf("month")
    .subtract("day", 1),
  navigator: {
    enabled: true,
    scroll: {
      enabled: false,
    },
    text: {
      btnNextText: ">",
      btnPrevText: "<",
    },
  },
  format: "YYYY-MM-DD",
  resoinsive: true,
  template: `
  <div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
  <div class="navigator">
  <div class="datepicker-header">
  <div class="btn btn-next">{{navigator.text.btnNextText}}</div>
  <div class="btn btn-switch">{{ navigator.switch.text }}</div>
  <div class="btn btn-prev">{{navigator.text.btnPrevText}}</div>
  </div>
  </div>
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
                ><span class="reserved"></span><span class="price"></span>
              </td>
              {{/enabled}} {{^enabled}}
              <td data-unix="{{dataUnix}}" class="disabled">
                <span class="{{#otherMonth}}other-month{{/otherMonth}}"
                  >{{title}}</span
                ><span
                  class="reserved {{#otherMonth}}other-month{{/otherMonth}}"
                ></span><span class="price {{#otherMonth}}other-month{{/otherMonth}}"></span>
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
  document.querySelector(".submit").addEventListener("click", checkAction);
  document.querySelectorAll('input[name="block"]').forEach((elem) => {
    elem.addEventListener("change", (e) => {
      const actionBtn = document.querySelector(".btnActionCont button");
      if (e.target.className === "discount") {
        actionBtn.removeEventListener("click", checkAction);
        actionBtn.removeEventListener("click", priceBtnClicked);
        actionBtn.className = "discount-submit";
        actionBtn.addEventListener("click", discountBtnClicked);
      } else if (e.target.className === "price") {
        actionBtn.removeEventListener("click", checkAction);
        actionBtn.removeEventListener("click", discountBtnClicked);
        actionBtn.className = "price-submit";
        actionBtn.addEventListener("click", priceBtnClicked);
      } else {
        actionBtn.addEventListener("click", checkAction);
        document.querySelector(".btnActionCont button").className = "submit";
        actionBtn.removeEventListener("click", discountBtnClicked);
        actionBtn.removeEventListener("click", priceBtnClicked);
      }
    });
  });
});
