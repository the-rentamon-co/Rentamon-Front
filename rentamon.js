// this is rentamon main api url.
let apiHostMainUrl = "https://rentamon.chbk.run";

// each panel needs a user id. user id is hidden in the page
let rentamon_user_id = document
  .querySelector("#rentamon_id div")
  .lastChild.textContent.trim();
// each panel needs a rentamon room id. rentamon room id is hidden in the page
let rentamon_room_id = document
  .querySelector("#rentamon_room_id")
  .innerText.trim();

let tehranTimeZone = "Asia/Tehran";
let currentDate = new Date();
let tehranTimestamp = currentDate.toLocaleString("en-US", {
  timeZone: tehranTimeZone,
});
let tehran = new Date(tehranTimestamp);
let tehranzeroo = tehran.setHours(0, 0, 0, 0);

// rentamon api routes are defiend here
let routes = {
  otaghak: {
    block: apiHostMainUrl + "/otaghak",
    unblock: apiHostMainUrl + "/otaghak",
    calendar: apiHostMainUrl + "/otaghak/calendar",
    room: rentamon_room_id,
  },
  jabama: {
    block: apiHostMainUrl + "/jabama/disable",
    unblock: apiHostMainUrl + "/jabama/enable",
    calendar: apiHostMainUrl + "/jabama/calendar",
    room: rentamon_room_id,
  },
  jajiga: {
    block: apiHostMainUrl + "/jajiga",
    unblock: apiHostMainUrl + "/jajiga",
    calendar: apiHostMainUrl + "/jajiga/calendar",
    room: rentamon_room_id,
  },
  shab: {
    block: apiHostMainUrl + "/shab",
    unblock: apiHostMainUrl + "/shab",
    calendar: apiHostMainUrl + "/shab/calendar",
    room: rentamon_room_id,
  },
  mizboon: {
    block: apiHostMainUrl + "/mizboon/close",
    unblock: apiHostMainUrl + "/mizboon/unclose",
    calendar: apiHostMainUrl + "/mizboon/calendar",
    room: rentamon_room_id,
  },
  // other: {
  //   blockUnblock: apiHostMainUrl + "/other",
  //   calendar: apiHostMainUrl + "/other/calendar",
  //   room: rentamon_room_id,
  // },

  otherv2: {
    blockUnblock: apiHostMainUrl + "/other/v2",
    calendar: apiHostMainUrl + "/other/calendar/v2",
    room: rentamon_room_id,
  },

  mihmansho: {
    block: apiHostMainUrl + "/mihmansho/block",
    unblock: apiHostMainUrl + "/mihmansho/unblock",
    calendar: apiHostMainUrl + "/mihmansho/calendar",
    room: rentamon_room_id,
  },

  homsa: {
    block: apiHostMainUrl + "/homsa/block",
    unblock: apiHostMainUrl + "/homsa/unblock",
    calendar: apiHostMainUrl + "/homsa/calendar",
    room: rentamon_room_id,
  },
};

// messages for alerting
let messages = {
  blockDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  unblockDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  reserveDaySuccess: "✅ ممنون!\nتغییرات اعمال شد.",
  notSelectedDay: "هنوز هیچ روز یا وضعیتی رو انتخاب نکردی",
  alertCloseWarning: "تغیراتت دیگه توی این سایت ثبت نمیشه!",
};

// website names
let names = {
  jabamaStatus: { fa: "جاباما", en: "jabama" },
  mizboonStatus: { fa: "میزبون", en: "mizbon" },
  otaghakStatus: { fa: "اتاقک", en: "otaghak" },
  jajigaStatus: { fa: "جاجیگا", en: "jajiga" },
  shabStatus: { fa: "شب", en: "shab" },
  otherStatus: { fa: "رزرو", en: "other" },
  mihmanshoStatus: { fa: "مهمان شو", en: "mihmansho" },
  homsaStatus: { fa: "هومسا", en: "homsa" },
};

const fetchData = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// converting persian number into integer
function persianToInteger(persianString) {
  const persianNumerals = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const convertDigit = (digit) => persianNumerals.indexOf(digit);
  const arabicString = persianString
    .split("")
    .map((char) => (persianNumerals.includes(char) ? convertDigit(char) : char))
    .join("");
  return parseInt(arabicString, 10);
}

// convert numbers into persian number string
function convertToPersianNumber(number) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return number.replace(/\d/g, (digit) => persianDigits[digit]);
}

// this functions is for cheeking a day status response recived from homsa
function homsaStatus(homsa) {
  if (!homsa) {
    return "not sure";
  }

  switch (homsa.status) {
    case "blocked":
      return "blocked";
    case "reserved":
      return "booked";
    case "unblocked":
      return "unblocked";
    default:
      return "not sure";
  }
}
// this functions is for cheeking a day status response recived from mihmansho
function mihmanshoStatus(mihmansho) {
  if (!mihmansho) {
    return "not sure";
  }

  switch (mihmansho.status) {
    case "unavailable":
      return "blocked";
    case "reserved":
      return "booked";
    case "":
      return "unblocked";
    default:
      return "not sure";
  }
}

// this functions is for cheeking a day status response recived from jabama
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
// this functions is for cheeking a day status response recived from jajiga
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

// this functions is for cheeking a day status response recived from rentamon
function otherStatus(other) {
  if (!other) {
    return "not sure";
  }
  switch (other.status) {
    case "booked":
      return "booked";
    case "":
      return "unblocked";
    case null:
      return "unblocked";
  }
  // if (other.status === "booked") {
  //   return "booked";
  // } else {
  //   return "not sure";
  // }
}

// this functions is for cheeking a day status response recived from shab
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
    // shab["is_disabled"] === true &&
    shab["is_non_bookable"] === true
    // &&
    // shab["is_unavailable"] === false
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

// this functions is for cheeking a day status response recived from mizboon
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

// this functions is for cheeking a day status response recived from otaghak
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

// this function makes a request to rentamon api
function rentamonApiCaller(website, data, action, method = "GET") {
  return new Promise(function (resolve, reject) {
    $.ajax({
      timeout: 25000,
      url: routes[website][action],
      method: method,
      data: {
        ...data,
        ...{
          rentamon_room_id: rentamon_room_id,
          rentamon_id: rentamon_user_id,
        },
      },
      success: function (response) {
        console.log(website, response);
        var response_status = document.querySelector(".response_status");

        if (response_status && website !== "otherv2") {
          if (response.final_status === true) {
            var section = document.querySelector(`.website_row.${website}`);
            console.log(section);
            section.style.display = "block";
            console.log(section);
            var falsi = document.querySelector(
              `.elementor-section.${website} .status_false`
            );
            console.log(falsi);
            falsi.style.display = "none";
            console.log(falsi);
            var trui = document.querySelector(
              `.elementor-section.${website} .status_true`
            );
            console.log(trui);
            trui.style.display = "block";
            console.log(trui);
          } else {
            document.querySelector(`.website_row.${website}`).style.display =
              "block";
            document.querySelector(
              `.elementor-section.${website} .status_true`
            ).style.display = "none";
            document.querySelector(
              `.elementor-section.${website} .status_false`
            ).style.display = "block";
          }
        }
        resolve(response);
      },
      error: function (error) {
        console.error(website, error);
        reject(error);
      },
    });
  });
}

// this function is called when block option is selected
async function blockBtnClicked() {
  document.querySelector(".loading-overlay-calendar").style.display = "flex";

  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
    });
    const apicalls = [
      rentamonApiCaller(
        (website = "homsa"),
        (data = {
          rentamon_room_id: routes["homsa"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "block")
      ),

      rentamonApiCaller(
        (website = "mihmansho"),
        (data = {
          rentamon_room_id: routes["mihmansho"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "block")
      ),

      rentamonApiCaller(
        (website = "jabama"),
        (data = {
          rentamon_room_id: routes["jabama"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "jajiga"),
        (data = {
          dates: selectedDate.join(","),
          rentamon_room_id: routes["jajiga"]["room"],
          disable_count: 1,
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "shab"),
        (data = {
          rentamon_room_id: routes["shab"]["room"],
          dates: selectedDate.join(","),
          disabled: 1,
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "mizboon"),
        (data = {
          days: selectedDate.join(","),
          rentamon_room_id: routes["mizboon"]["room"],
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "otaghak"),
        (data = {
          rentamon_room_id: routes["otaghak"]["room"],
          unblockDays: null,
          blockDays: selectedDate.join(","),
        }),
        (action = "block")
      ),
    ];
    const resps = await Promise.all(apicalls);
    alert(messages.blockDaySuccess);
    rentamoning();
    // window.location.reload();
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

// this function is called when unblock option is selected
async function unblockBtnClicked() {
  document.querySelector(".loading-overlay-calendar").style.display = "flex";
  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
    });
    const apicalls = [
      rentamonApiCaller(
        (website = "otherv2"),
        (data = {
          action: "available",
          rentamon_room_id: routes["otherv2"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "blockUnblock")
      ),

      rentamonApiCaller(
        (website = "homsa"),
        (data = {
          rentamon_room_id: routes["homsa"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "unblock")
      ),
      rentamonApiCaller(
        (website = "mihmansho"),
        (data = {
          rentamon_room_id: routes["mihmansho"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "unblock")
      ),
      rentamonApiCaller(
        (website = "jabama"),
        (data = {
          rentamon_room_id: routes["jabama"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "unblock")
      ),
      rentamonApiCaller(
        (website = "jajiga"),
        (data = {
          dates: selectedDate.join(","),
          rentamon_room_id: routes["jajiga"]["room"],
          disable_count: 0,
        }),
        (action = "unblock")
      ),
      rentamonApiCaller(
        (website = "shab"),
        (data = {
          rentamon_room_id: routes["shab"]["room"],
          dates: selectedDate.join(","),
          disabled: 0,
        }),
        (action = "unblock")
      ),
      rentamonApiCaller(
        (website = "mizboon"),
        (data = {
          days: selectedDate.join(","),
          rentamon_room_id: routes["mizboon"]["room"],
        }),
        (action = "unblock")
      ),
      rentamonApiCaller(
        (website = "otaghak"),
        (data = {
          rentamon_room_id: routes["otaghak"]["room"],
          unblockDays: selectedDate.join(","),
          blockDays: null,
        }),
        (action = "unblock")
      ),
    ];
    const resps = await Promise.all(apicalls);
    alert(messages.unblockDaySuccess);
    // window.location.reload();
    rentamoning();
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

// this function is called when reserve option is selected
async function reserveOther() {
  document.querySelector(".loading-overlay-calendar").style.display = "flex";

  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
    });
    const apicalls = [
      rentamonApiCaller(
        (website = "otherv2"),
        (data = {
          rentamon_room_id: routes["otherv2"]["room"],
          action: "book",
          days: selectedDate.join(","),
        }),
        (action = "blockUnblock")
      ),

      rentamonApiCaller(
        (website = "homsa"),
        (data = {
          rentamon_room_id: routes["homsa"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "block")
      ),
      ,
      rentamonApiCaller(
        (website = "mihmansho"),
        (data = {
          rentamon_room_id: routes["mihmansho"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "jabama"),
        (data = {
          rentamon_room_id: routes["jabama"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "jajiga"),
        (data = {
          dates: selectedDate.join(","),
          rentamon_room_id: routes["jajiga"]["room"],
          disable_count: 1,
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "shab"),
        (data = {
          rentamon_room_id: routes["shab"]["room"],
          dates: selectedDate.join(","),
          disabled: 1,
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "mizboon"),
        (data = {
          days: selectedDate.join(","),
          rentamon_room_id: routes["mizboon"]["room"],
        }),
        (action = "block")
      ),
      rentamonApiCaller(
        (website = "otaghak"),
        (data = {
          rentamon_room_id: routes["otaghak"]["room"],
          unblockDays: null,
          blockDays: selectedDate.join(","),
        }),
        (action = "block")
      ),
    ];
    const resps = await Promise.all(apicalls);
    alert(messages.reserveDaySuccess);
    // window.location.reload();
    rentamoning();
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
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
    // alert(messages.notSelectedDay);
  }
}

let tobeDisabled = {
  homsa: (single) => {
    rentamonApiCaller(
      (website = "homsa"),
      (data = {
        rentamon_room_id: routes["homsa"]["room"],
        days: single,
      }),
      (action = "block")
    );
  },

  mihmansho: (single) => {
    rentamonApiCaller(
      (website = "mihmansho"),
      (data = {
        rentamon_room_id: routes["mihmansho"]["room"],
        days: single,
      }),
      (action = "block")
    );
  },

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
  let selected = document.querySelectorAll(".selected");
  // let selectedDate = [];
  // let jabamaPrice = [];
  if (selected.length > 0) {
    // selected.forEach((z) => {
    // z.classList.remove("selected");
    // selectedDate.push(
    // new persianDate(parseInt(z.getAttribute("data-unix"))).format(
    // "YYYY-MM-DD"
    // )
    // );
    // jabamaPrice.push(z.getAttribute("price-from-rentamon"));
    // });
    // const priceTargetElementId = "elementor-popup-modal-7242";
    // const discountObserver = new MutationObserver((mutationsList) => {
    //   for (const mutation of mutationsList) {
    //     if (mutation.type === "childList") {
    //       const addedNodes = Array.from(mutation.addedNodes);
    //       const targetElement = addedNodes.find(
    //         (node) =>
    //           node.nodeType === Node.ELEMENT_NODE &&
    //           node.id.includes(priceTargetElementId)
    //       );

    //       if (targetElement) {
    //         var f = document.querySelector("form");
    //         console.log("discount pop up opens");
    //         document.querySelector('input[name="form_fields[dates]"').value =
    //           selectedDate;
    //         document.querySelector(
    //           'input[name="form_fields[noDiscountPrice]"'
    //         ).value = jabamaPrice[0];

    //         document.querySelector('input[name="form_fields[h_f_r_i]"').value =
    //           rentamon_user_id;
    //         document.querySelector(
    //           'input[name="form_fields[h_f_r_r_i]"'
    //         ).value = rentamon_room_id;
    //         // f.addEventListener("submit", rentamoning);
    //       }
    //     }
    //   }
    // });
    // discountObserver.observe(document.body, { childList: true, subtree: true });
    var dis_div = document.createElement("div");
    dis_div.style.display = "none";
    dis_div.className = "discount-submit";
    document.body.appendChild(dis_div);
    dis_div.click();
  } else {
    alert(messages.notSelectedDay);
  }
}

function disconnectedBtnClicked() {
  const disconnectTargetElementId = "elementor-popup-modal";
  const disconnectObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addedNodes = Array.from(mutation.addedNodes);
        const targetElement = addedNodes.find(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            node.id.includes(disconnectTargetElementId)
        );
        if (targetElement) {
          let icon = mutation.addedNodes[0].querySelector(".eicon-close");
          icon.onclick = function () {
            alert(messages.alertCloseWarning);
          };

          let phone = targetElement.querySelector(
            'input[name="form_fields[userphone]"'
          );
          if (phone !== null) {
            phone.addEventListener("input", () => {
              try {
                targetElement.querySelector(
                  'input[name="form_fields[phoneNumber]"'
                ).value = phone.value;
              } catch (err) {}
            });
          }

          targetElement
            .querySelectorAll('input[name="form_fields[userid]"')
            .forEach((elm) => (elm.value = rentamon_user_id));

          // [0].value = rentamon_user_id;

          // document.querySelectorAll(
          //   'input[name="form_fields[userid]"'
          // )[1].value = rentamon_user_id;
        }
      }
    }
  });

  disconnectObserver.observe(document.body, { childList: true, subtree: true });
}
function handleDayClick(e) {
  if (e.target.parentElement.tagName === "TD") {
    e.target.parentElement.classList.toggle("selected");
  } else if (e.target.tagName === "TD") {
    e.target.classList.toggle("selected");
  }
}

function priceBtnClicked() {
  let selected = document.querySelectorAll(".selected");
  // let selectedDate = [];
  if (selected.length > 0) {
    // selected.forEach((z) => {
    //   z.classList.remove("selected");
    //   selectedDate.push(
    //     new persianDate(parseInt(z.getAttribute("data-unix"))).format(
    //       "YYYY-MM-DD"
    //     )
    //   );
    // });

    // const priceTargetElementId = "elementor-popup-modal-7426";
    // const priceObserver = new MutationObserver((mutationsList) => {
    //   for (const mutation of mutationsList) {
    //     if (mutation.type === "childList") {
    //       const addedNodes = Array.from(mutation.addedNodes);
    //       const targetElement = addedNodes.find(
    //         (node) =>
    //           node.nodeType === Node.ELEMENT_NODE &&
    //           node.id.includes(priceTargetElementId)
    //       );
    //       if (targetElement) {
    //         var f = document.querySelector("form");
    //         console.log("price pop up opens");
    //         document.querySelector('input[name="form_fields[dates]"').value =
    //           selectedDate;

    //         document.querySelector('input[name="form_fields[h_f_r_i]"').value =
    //           rentamon_user_id;
    //         document.querySelector(
    //           'input[name="form_fields[h_f_r_r_i]"'
    //         ).value = rentamon_room_id;

    //         // f.addEventListener("submit", rentamoning);
    //       }
    //     }
    //   }
    // });

    // priceObserver.observe(document.body, { childList: true, subtree: true });
    var price_div = document.createElement("div");
    price_div.style.display = "none";
    price_div.className = "price-submit";
    document.body.appendChild(price_div);
    price_div.click();
  } else {
    alert(messages.notSelectedDay);
  }
}

function rentamoning() {
  document
    .querySelectorAll("form")
    .forEach((form) => form.removeEventListener("submit", rentamoning));
  document.querySelector(".loading-overlay-calendar").style.display = "flex";
  document
    .querySelectorAll('input[name="block"]')
    .forEach((i) => (i.checked = false));
  var availableDays = [];
  var allTds = document.querySelectorAll(
    ".datepicker-day-view td:not(.disabled)"
  );
  allTds.forEach((td) => {
    if (!td.firstElementChild.classList.contains("other-month")) {
      availableDays.push(td);
    } else {
      td.classList.add("other-month");
    }
  });
  if (availableDays.length > 0) {
    var days = document.querySelectorAll(
      ".datepicker-plot-area-inline-view .table-days td:not(.disabled) span:not(.other-month):not(.reserved):not(.price)"
    );
    var range = [
      new persianDate(
        parseInt(availableDays[0].getAttribute("data-unix"))
      ).format("YYYY-MM-DD"),
      new persianDate(
        parseInt(
          availableDays[availableDays.length - 1].getAttribute("data-unix")
        )
      ).format("YYYY-MM-DD"),
      new persianDate(
        parseInt(
          availableDays[availableDays.length - 1].getAttribute("data-unix")
        )
      )
        .add("day", 1)
        .format("YYYY-MM-DD"),
    ];
    const urls2 = [
      routes.jabama.calendar +
        `?rentamon_room_id=${routes.jabama.room}&rentamon_id=${rentamon_user_id}&start_date=${range[0]}&end_date=${range[2]}`,

      routes.mizboon.calendar +
        `?rentamon_room_id=${routes.mizboon.room}&rentamon_id=${rentamon_user_id}&from=${range[0]}&to=${range[1]}`,

      routes.otaghak.calendar +
        `?rentamon_room_id=${routes.otaghak.room}&rentamon_id=${rentamon_user_id}&startDate=${range[0]}&endDate=${range[1]}`,

      routes.jajiga.calendar +
        `?rentamon_room_id=${routes.jajiga.room}&rentamon_id=${rentamon_user_id}&from=${range[0]}&to=${range[1]}`,

      routes.shab.calendar +
        `?rentamon_room_id=${routes.shab.room}&rentamon_id=${rentamon_user_id}&from_date=${range[0]}&to_date=${range[2]}`,

      routes.otherv2.calendar +
        `?rentamon_room_id=${routes.otherv2.room}&rentamon_id=${rentamon_user_id}&start=${range[0]}&end=${range[1]}`,

      routes.mihmansho.calendar +
        `?rentamon_room_id=${routes.mihmansho.room}&rentamon_id=${rentamon_user_id}&startDate=${range[0]}&endDate=${range[1]}`,

      routes.homsa.calendar +
        `?rentamon_room_id=${routes.homsa.room}&rentamon_id=${rentamon_user_id}&startDate=${range[0]}&endDate=${range[1]}`,
    ];

    console.log(urls2);
    const fetchPromises = urls2.map((url) => fetchData(url));

    availableDays.forEach((day) => {
      day.removeEventListener("click", handleDayClick);
      day.addEventListener("click", handleDayClick);
    });

    Promise.all(fetchPromises)
      .then((results) => {
        console.log(results);
        var calendars = {};

        if (results[0]["status"] === 200) {
          calendars["jabamaStatus"] = results[0]["data"];
          document.querySelector("#jabama_icon_connected").style.display =
            "block";
        }

        if (results[1]["status"] === 200) {
          calendars["mizboonStatus"] = results[1]["data"];
          document.querySelector("#mizboon_icon_connected").style.display =
            "block";
        }

        if (results[2]["status"] === 200) {
          calendars["otaghakStatus"] = results[2]["data"];
          document.querySelector("#otaghak_icon_connected").style.display =
            "block";
        }

        if (results[3]["status"] === 200) {
          calendars["jajigaStatus"] = results[3]["data"];
          document.querySelector("#jajiga_icon_connected").style.display =
            "block";
        }

        if (results[4]["status"] === 200) {
          calendars["shabStatus"] = results[4]["data"];
          document.querySelector("#shab_icon_connected").style.display =
            "block";
        }
        if (results[5]["status"] === 200) {
          calendars["otherStatus"] = results[5]["data"];
        }

        if (results[6]["status"] === 200) {
          calendars["mihmanshoStatus"] = results[6]["data"];
          document.querySelector("#mihmansho_icon_connected").style.display =
            "block";
        }

        if (results[7]["status"] === 200) {
          calendars["homsaStatus"] = results[7]["data"];
          document.querySelector("#homsa_icon_connected").style.display =
            "block";
        }

        if (JSON.stringify(calendars) !== "{}") {
          for (let i = 0; i < availableDays.length; i++) {
            var status = {};
            for (let cal in calendars) {
              status[cal] = window[cal](calendars[cal][i]);
            }

            // if ("jabamaStatus" in calendars){
            //   let origPrice = parseInt(
            //     parseInt(results[0]["data"][i]["price"])
            //   );

            //   let raw = parseInt(
            //     parseInt(results[0]["data"][i]["discountedPrice"]) /
            //       10000
            //   );
            //   let price = convertToPersianNumber(
            //     raw.toLocaleString().replace(/,/g, "/")
            //   );
            //   if (
            //     parseInt(results[0]["data"][i]["price"]) >
            //     parseInt(results[0]["data"][i]["discountedPrice"])
            //   ) {
            //     days[i].parentElement.style.border =
            //       "2px solid #8165D6";
            //   }
            //   if (raw > 0) {
            //     days[i].parentElement.querySelector(
            //       ".price"
            //     ).innerHTML = price;

            //     days[i].parentElement.setAttribute(
            //       "price-from-jabama",
            //       origPrice
            //     );
            //   }
            // }
            if ("otherStatus" in calendars) {
              let origPrice =
                parseInt(parseInt(results[5]["data"][i]["price"]) / 1000) ||
                null;
              let discountedPrice =
                parseInt(
                  parseInt(results[5]["data"][i]["discounted_price"]) / 1000
                ) || null;

              if (origPrice > discountedPrice && discountedPrice !== null) {
                days[i].parentElement.style.border = "2px solid #8165D6";
                days[i].parentElement.querySelector(".price").innerHTML =
                  convertToPersianNumber(
                    discountedPrice.toLocaleString().replace(/,/g, "/")
                  );
                days[i].parentElement.setAttribute(
                  "price-from-rentamon",
                  origPrice * 10000
                );
              } else if (origPrice === discountedPrice && origPrice !== null) {
                days[i].parentElement.style.border = "0px solid";
                days[i].parentElement.querySelector(".price").innerHTML =
                  convertToPersianNumber(
                    origPrice.toLocaleString().replace(/,/g, "/")
                  );
                days[i].parentElement.setAttribute(
                  "price-from-rentamon",
                  origPrice * 10000
                );
              }
              //   if (raw > 0) {
              //     days[i].parentElement.querySelector(
              //       ".price"
              //     ).innerHTML = raw;

              //     // days[i].parentElement.setAttribute(
              //     //   "price-from-jabama",
              //     //   origPrice
              //     // );
              //   }
            }

            console.table(status);
            const bookedStatus = Object.entries(status).find(
              ([key, value]) => value === "booked"
            );

            if (bookedStatus) {
              days[i].parentElement.classList.add("booked-days");
              const website = bookedStatus[0];

              days[i].parentElement.querySelector(".reserved").innerHTML =
                names[website]["fa"];
              for (const web in tobeDisabled) {
                if (
                  web + "Status" in status &&
                  web !== names[website]["en"] &&
                  status[`${web}Status`] !== "booked" &&
                  status[`${web}Status`] !== "blocked"
                ) {
                  tobeDisabled[web](
                    new persianDate(
                      parseInt(days[i].parentElement.getAttribute("data-unix"))
                    ).format("YYYY-MM-DD")
                  );
                }
              }
            } else if (
              Object.entries(status).every(
                ([key, value]) =>
                  (key !== "otherStatus" && value === "blocked") ||
                  (key === "otherStatus" &&
                    value === "unblocked" &&
                    !Object.entries(status).every(
                      ([x, z]) => x === "otherStatus"
                    ))
              )
            ) {
              days[i].parentElement.classList.add("blocked-days");
              days[i].parentElement.querySelector(".price").innerHTML = "";
              days[i].parentElement.style.border = "0px solid";
            } else {
              days[i].parentElement.classList = [];
              days[i].parentElement.querySelector(".reserved").innerHTML = "";
            }
          }
        }
        document.querySelector(".loading-overlay-calendar").style.display =
          "none";

        if (results[1]["status"] === 400) {
          document.querySelector("#webdisconnected_mizboon a").click();
        }
        if (results[2]["status"] === 400) {
          document.querySelector("#webdisconnected_otaghak a").click();
        }
        if (results[3]["status"] === 400) {
          document.querySelector("#webdisconnected_jajiga a").click();
        }
        if (results[4]["status"] === 400) {
          document.querySelector("#webdisconnected_shab a").click();
        }
        if (results[6]["status"] === 400) {
          document.querySelector("#webdisconnected_mihmansho a").click();
        }

        if (results[7]["status"] === 400) {
          document.querySelector("#webdisconnected_homsa a").click();
        }

        if (results[0]["status"] === 400) {
          document.querySelector("#webdisconnected a").click();
        }
      })
      .catch((error) => {
        console.error(error);
      });

    setTimeout(
      () =>
        document
          .querySelectorAll(".website_row")
          .forEach((row) => (row.style.display = "none")),
      20000
    );
  } else {
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

$(document).ready(function () {
  const webdisconnectedJabamaBtn = document.querySelector("#webdisconnected");
  const webdisconnectedOtaghakBtn = document.querySelector(
    "#webdisconnected_otaghak"
  );
  const webdisconnectedJajigaBtn = document.querySelector(
    "#webdisconnected_jajiga"
  );
  const webdisconnectedShabBtn = document.querySelector(
    "#webdisconnected_shab"
  );
  const webdisconnectedMihmanshoBtn = document.querySelector(
    "#webdisconnected_mihmansho"
  );
  const webdisconnectedHomsaBtn = document.querySelector(
    "#webdisconnected_homsa"
  );
  const webdisconnectedMizboonBtn = document.querySelector(
    "#webdisconnected_mizboon"
  );

  if (webdisconnectedMizboonBtn !== null) {
    webdisconnectedMizboonBtn.addEventListener("click", disconnectedBtnClicked);
  }
  if (webdisconnectedHomsaBtn !== null) {
    webdisconnectedHomsaBtn.addEventListener("click", disconnectedBtnClicked);
  }

  if (webdisconnectedMihmanshoBtn !== null) {
    webdisconnectedMihmanshoBtn.addEventListener(
      "click",
      disconnectedBtnClicked
    );
  }

  if (webdisconnectedJabamaBtn !== null) {
    webdisconnectedJabamaBtn.addEventListener("click", disconnectedBtnClicked);
  }

  if (webdisconnectedOtaghakBtn !== null) {
    webdisconnectedOtaghakBtn.addEventListener("click", disconnectedBtnClicked);
  }
  if (webdisconnectedJajigaBtn !== null) {
    webdisconnectedJajigaBtn.addEventListener("click", disconnectedBtnClicked);
  }
  if (webdisconnectedShabBtn !== null) {
    webdisconnectedShabBtn.addEventListener("click", disconnectedBtnClicked);
  }

  // price

  const priceTargetElementId = "elementor-popup-modal-7426";
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
          let selected = document.querySelectorAll(".selected");
          let selectedDate = [];
          selected.forEach((z) => {
            z.classList.remove("selected");
            selectedDate.push(
              new persianDate(parseInt(z.getAttribute("data-unix"))).format(
                "YYYY-MM-DD"
              )
            );
          });
          console.log("price pop up opens");
          document.querySelector('input[name="form_fields[dates]"').value =
            selectedDate;
          document.querySelector('input[name="form_fields[h_f_r_i]"').value =
            rentamon_user_id;
          document.querySelector('input[name="form_fields[h_f_r_r_i]"').value =
            rentamon_room_id;
        }
      }
    }
  });

  priceObserver.observe(document.body, { childList: true, subtree: true });

  //

  // discount
  const discountTargetElementId = "elementor-popup-modal-7242";
  const discountObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addedNodes = Array.from(mutation.addedNodes);
        const targetElement = addedNodes.find(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            node.id.includes(discountTargetElementId)
        );

        if (targetElement) {
          let selected = document.querySelectorAll(".selected");
          let selectedDate = [];
          let jabamaPrice = [];
          selected.forEach((z) => {
            z.classList.remove("selected");
            selectedDate.push(
              new persianDate(parseInt(z.getAttribute("data-unix"))).format(
                "YYYY-MM-DD"
              )
            );
            jabamaPrice.push(z.getAttribute("price-from-rentamon"));
          });
          console.log("discount pop up opens");
          document.querySelector('input[name="form_fields[dates]"').value =
            selectedDate;
          document.querySelector(
            'input[name="form_fields[noDiscountPrice]"'
          ).value = jabamaPrice[0];

          document.querySelector('input[name="form_fields[h_f_r_i]"').value =
            rentamon_user_id;
          document.querySelector('input[name="form_fields[h_f_r_r_i]"').value =
            rentamon_room_id;
        }
      }
    }
  });
  discountObserver.observe(document.body, { childList: true, subtree: true });

  //

  // pop up form submited

  let form_submited = new MutationObserver((mutaionlist) => {
    for (const mutation of mutaionlist) {
      if (mutation.type === "childList") {
        const removedNodes = Array.from(mutation.removedNodes);
        if (removedNodes.length > 0) {
          const targetElement = removedNodes.find(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              node.nodeName === "SPAN" &&
              node.className.includes("elementor-form-spinner") &&
              (mutation.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.includes(
                "7242"
              ) ||
                mutation.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.includes(
                  "7426"
                ))
          );
          if (targetElement) {
            setTimeout(rentamoning, 2000);
          }
        }
      }
    }
  });

  form_submited.observe(document.body, { childList: true, subtree: true });

  //

  document.querySelector(".submit").addEventListener("click", checkAction);
  document.querySelectorAll('input[name="block"]').forEach((elem) => {
    elem.addEventListener("change", (e) => {
      const actionBtn = document.querySelector(".btnActionCont button");
      if (e.target.className === "discount") {
        actionBtn.removeEventListener("click", checkAction);
        actionBtn.removeEventListener("click", priceBtnClicked);
        actionBtn.addEventListener("click", discountBtnClicked);
      } else if (e.target.className === "price") {
        actionBtn.removeEventListener("click", checkAction);
        actionBtn.removeEventListener("click", discountBtnClicked);
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

// debugger;

$(window).on("load", function () {
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
    maxDate: new persianDate().add("years", 1).month(1).endOf("month"),
    // maxDate: new persianDate().
    // maxDate: new persianDate()
    //   .add("month", 3)
    //   .startOf("month")
    //   .subtract("day", 1),
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
      <div class="btn btn-next pwt-btn pwt-btn-next">{{navigator.text.btnNextText}}</div>
      <div class="btn btn-switch pwt-btn pwt-btn-switch">{{ navigator.switch.text }}</div>
      <div class="btn btn-prev pwt-btn pwt-btn-prev">{{navigator.text.btnPrevText}}</div>
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
                  <td data-unix="{{dataUnix}}" class="{{#selected}}selected{{/selected}}">
                    <span
                      class="{{#otherMonth}}other-month{{/otherMonth}}"
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
  try {
    document
      .querySelectorAll(".elementor-widget-wrap.elementor-element-populated")
      .forEach((a) => {
        var aa = a.querySelector(".elementor-element");

        if (aa.getAttribute("data-widget_type") === "html.default") {
          var b = aa.querySelector(".elementor-widget-container");

          if (b.querySelector(".inline")) {
            a.style.padding = 0;
          }
        }
      });
  } catch (error) {
    console.log("padding gone");
  }
});
