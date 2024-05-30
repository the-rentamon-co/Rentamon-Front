let apiHostMainUrl = "https://api-rentamon.liara.run";

// this is calendar config
let tehranTimeZone = "Asia/Tehran";
let currentDate = new Date();
let tehranTimestamp = currentDate.toLocaleString("en-US", {
  timeZone: tehranTimeZone,
});
let tehran = new Date(tehranTimestamp);
let tehranzeroo = tehran.setHours(0, 0, 0, 0);
let activeWebsites;

const websiteWidgets = {
  jabama: {
    popup_id_selector: "#webdisconnected",
    popup_link_selector: "#webdisconnected a",
    icon_selector: "#jabama_icon_connected",
  },
  jajiga: {
    popup_id_selector: "#webdisconnected_jajiga",
    popup_link_selector: "#webdisconnected_jajiga a",
    icon_selector: "#jajiga_icon_connected",
  },
  shab: {
    popup_id_selector: "#webdisconnected_shab",
    popup_link_selector: "#webdisconnected_shab a",
    icon_selector: "#shab_icon_connected",
  },
  mihmansho: {
    popup_id_selector: "#webdisconnected_mihmansho",
    popup_link_selector: "#webdisconnected_mihmansho a",
    icon_selector: "#mihmansho_icon_connected",
  },
  homsa: {
    popup_id_selector: "#webdisconnected_homsa",
    popup_link_selector: "#webdisconnected_homsa a",
    icon_selector: "#homsa_icon_connected",
  },
  otaghak: {
    popup_id_selector: "#webdisconnected_otaghak",
    popup_link_selector: "#webdisconnected_otaghak a",
    icon_selector: "#otaghak_icon_connected",
  },
  mizboon: {
    popup_id_selector: "#webdisconnected_mizboon",
    popup_link_selector: "#webdisconnected_mizboon a",
    icon_selector: "#mizboon_icon_connected",
  },
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

function reservedViewer(text) {
  switch (text) {
    case "host":
      return "رزرو";
    case "jabama":
      return "جاباما";
    case "jajiga":
      return "جاجیگا";
    case "shab":
      return "شب";
    case "homsa":
      return "هومسا";
    case "mizboon":
      return "میزبون";
    case "mihmansho":
      return "میهمان شو";
    case "otaghak":
      return "اتاقک";
  }
}

url = {
  block: apiHostMainUrl + "/setblock/",
  unblock: apiHostMainUrl + "/setunblock/",
  calendar: apiHostMainUrl + "/getcalendar",
  price: apiHostMainUrl + "/setprice/",
  discount: apiHostMainUrl + "/setdiscount/",
};

function priceHandeler(element, status, main_price, discounted_price) {
  // if (
  //   element.parentElement.classList &&
  //   !element.parentElement.classList.contains("blocked-days")
  // ) {
  const persianNumberWithCommas = (persianNum) =>
    persianNum
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/\B(?=(\d{3})+(?!\d))/g, "/")
      .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  const persianNumberToPlain = (persianNum) =>
    persianNum
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/\//g, "");

  if (status === "blocked") {
    element.parentElement.querySelector(".price").innerHTML = "";
    element.parentElement.classList.add("blocked-days");
    // ____________________________________________________________
  } else if (discounted_price) {
    element.parentElement.querySelector(".price").innerHTML =
      persianNumberWithCommas(convertToPersianNumber(String(discounted_price)));
    element.parentElement.classList.add("discounted-days");
  } else if (main_price) {
    element.parentElement.querySelector(".price").innerHTML =
      persianNumberWithCommas(convertToPersianNumber(String(main_price)));
    element.parentElement.classList.remove("discounted-days");
    // }
  }
}

function setBlockHelper(elements) {
  elements.forEach((elm) => {
    elm.parentElement.querySelector(".price").innerHTML = "";
    if (elm.parentElement.classList)
      elm.parentElement.classList.remove("discounted-days");
    elm.parentElement.classList.remove("booked-days");
    elm.parentElement.classList.add("blocked-days");
  });
}

function setAvailableHelper(elements, selectedDate = "") {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let day = "";
    if (selectedDate !== "") {
      day = selectedDate[i];
      const storedData = localStorage.getItem("calendar_data");
      const jsonData = JSON.parse(storedData);
      const filteredData = jsonData.calendar.find((item) => item.date === day);
      day = filteredData;
    }

    element.parentElement.classList.remove("blocked-days");
    element.parentElement.classList.remove("booked-days");

    if (day) {
      const persianNumberWithCommas = (persianNum) =>
        persianNum
          .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
          .replace(/\B(?=(\d{3})+(?!\d))/g, "/")
          .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
      if (day.price) {
        if (day.discount_percentage) {
          const discount_percentage = day.discount_percentage;
          const price = parseInt(day.price) / 1000 || null;
          const discountedPrice = price - (price * discount_percentage) / 100;
          element.parentElement.querySelector(".price").innerHTML =
            persianNumberWithCommas(
              convertToPersianNumber(String(discountedPrice))
            );
          element.parentElement.classList.add("discounted-days");
        } else {
          const price = parseInt(day.price) / 1000 || null;
          element.parentElement.querySelector(".price").innerHTML =
            persianNumberWithCommas(convertToPersianNumber(String(price)));
          element.parentElement.classList.remove("discounted-days");
        }
      }
    } else {
      element.parentElement.querySelector(".price").innerHTML = "";
      element.parentElement.classList.remove("discounted-days");
    }
    element.parentElement.querySelector(".reserved").innerHTML = "";
  }
}
function setBookedkHelper(elements) {
  elements.forEach((elm) => {
    elm.elem.parentElement.classList.remove("discounted-days");
    elm.elem.parentElement.classList.add("booked-days");
    elm.elem.parentElement.querySelector(".reserved").innerHTML =
      reservedViewer(elm.website);
  });
}

// this is the main function that fetches data from websites based on calendar
async function rentamoning() {
  // getting active website list
  // TODO: add null for days in the main function if needed
  // activeWebsites = await performAction("activeWebsites", null);
  document
    .querySelectorAll("form")
    .forEach((form) => form.removeEventListener("submit", rentamoning));

  // Show loading overlay
  // document.querySelector(".loading-overlay-calendar").style.display = "flex";

  // Reset action inputs
  document
    .querySelectorAll('input[name="block"]')
    .forEach((i) => (i.checked = false));
  var availableDays = [];

  // Select non-disabled days from the calendar
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

    // Fetch calendar data from the unified API
    const authToken = getCookie("auth_token");
    if (!authToken) {
      throw new Error("No auth token found");
    }
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    // Fetch calendar data from the unified API with headers
    const response = await fetch(
      `https://rentamon-api.liara.run/api/getcalendar?start_date=${range[0]}&end_date=${range[2]}`,
      {
        method: "GET",
        headers: headers,
      }
    );
    const result = await response.json();
    localStorage.setItem("calendar_data", JSON.stringify(result));
    const calendarData = result.calendar;
    activeWebsites = result.status;

    for (let website in activeWebsites) {
      if (activeWebsites[website] === "succeed") {
        isActiveHandler(websiteWidgets[website].icon_selector, false);
      } else {
        isActiveHandler(websiteWidgets[website].icon_selector, true);
        check_is_valid(
          websiteWidgets[website].icon_selector,
          websiteWidgets[website].popup_id_selector
        );
        document
          .querySelector(websiteWidgets[website].popup_link_selector)
          .click();
      }
    }

    console.log(calendarData, "Fetched calendar data");

    availableDays.forEach((day) => {
      day.removeEventListener("click", handleDayClick);
      day.addEventListener("click", handleDayClick);
    });

    if (calendarData && calendarData.length > 0) {
      for (let i = 0; i < availableDays.length; i++) {
        let dayData = calendarData[i];
        let status = dayData.status;
        let price = dayData.price;
        let discountPercentage = dayData.discount_percentage;

        let origPrice = parseInt(price) / 1000 || null;
        let discountedPrice = 0;

        // Apply discount if available
        if (discountPercentage) {
          discountedPrice = origPrice - (origPrice * discountPercentage) / 100;
        }

        switch (status) {
          case "blocked":
            setBlockHelper([days[i]]);
            // days[i].parentElement.classList.add("blocked-days");
            // days[i].parentElement.querySelector(".price").innerHTML = "";
            priceHandeler(days[i], status, origPrice, discountedPrice);
            break;

          case "reserved":
            setBookedkHelper([{ elem: days[i], website: dayData.website }]);
            // days[i].parentElement.classList.add("booked-days");
            // days[i].parentElement.querySelector(".reserved").innerHTML =
            //   reservedViewer(dayData.website);
            priceHandeler(days[i], status, origPrice, discountedPrice);
            break;

          default:
            setAvailableHelper([days[i]]);
            // days[i].parentElement.classList.remove("blocked-days");
            // days[i].parentElement.classList.remove("booked-days");
            priceHandeler(days[i], status, origPrice, discountedPrice);
        }

        // Update day UI based on the status and price information
        // if (status === "blocked") {
        // days[i].parentElement.classList.add("blocked-days");
        // days[i].parentElement.querySelector(".price").innerHTML = "";
        // days[i].parentElement.style.border = "0px solid";
        // } else {
        // days[i].parentElement.classList.remove("blocked-days");
        // days[i].parentElement.classList.remove("booked-days");
        // if (discountedPrice !== 0) {
        // days[i].parentElement.querySelector(".price").innerHTML =
        //   convertToPersianNumber(
        //     discountedPrice.toLocaleString().replace(/,/g, "/")
        //   );
        // days[i].parentElement.style.border = "2px solid #8165D6";
        // } else {
        // days[i].parentElement.querySelector(".price").innerHTML = "";
        // days[i].parentElement.style.border = "0px solid";
        // }
        // }

        // Update booking information
        // if (status === "reserved") {
        //   days[i].parentElement.classList.add("booked-days");
        //   days[i].parentElement.querySelector(".reserved").innerHTML =
        //     reservedViewer(dayData.website);
        // }
      }
    }

    document.querySelector(".loading-overlay-calendar").style.display = "none";
  } else {
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

// this is a function for when user selects a day, and that day need to get a class
function handleDayClick(e) {
  if (e.target.parentElement.tagName === "TD") {
    e.target.parentElement.classList.toggle("selected");
  } else if (e.target.tagName === "TD") {
    e.target.classList.toggle("selected");
  }
}
async function reserveOther() {
  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  let spans = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
      spans.push(z.querySelector("span"));
    });
    var response_status = document.querySelector(".response_status");
    if (response_status) {
      document.querySelector(".response_status_pop a").click();
      setStyleToPending();
    }
    final_response = await performAction(
      "setReserve",
      selectedDate,
      (property_id = 39)
    );
    status_responses = Object.values(final_response.status);
    if (status_responses.every((rep) => rep === "succeed")) {
      spans.forEach((z) => {
        setBookedkHelper([{ elem: z, website: "host" }]);
      });
    }
    setStatusStyle(final_response.status);
    console.log("GOT HERE", final_response);
  } else {
    alert(messages.notSelectedDay);
  }
}
// this function ckecks witch action btn is ckecked
function checkAction() {
  let action = document.querySelector('input[name="block"]:checked');
  if (action) {
    if (action.value === "block") {
      blockBtnClicked();
    } else if (action.value === "reserve") {
      reserveOther();
    } else if (action.value === "unblock") {
      unblockBtnClicked();
    }
  } else {
    // alert(messages.notSelectedDay);
  }
}

function priceBtnClicked() {
  let selected = document.querySelectorAll(".selected");
  if (selected.length > 0) {
    // this codes from here
    var price_div = document.createElement("div");
    price_div.style.display = "none";
    price_div.className = "price-submit2";
    document.body.appendChild(price_div);
    price_div.click();
    // to here open price popup
    document
      .querySelector("#popup_sumbit_price")
      .addEventListener("click", async () => {
        console.log("Got here!");
        const dates = document.querySelector("#form-field-dates").value;

        let price = document.querySelector("#form-field-price").value;

        document.querySelector(".response_status_pop a").click();
        setStyleToPending();
        const final_response = await performAction(
          "setPrice",
          dates.split(","),
          price
        );
        const calendar_data = localStorage.getItem("calendar_data");
        const jsonData = JSON.parse(calendar_data);
        setStatusStyle(final_response.data);
        selected.forEach((z) => {
          z.classList.remove("selected");
          const filteredData = jsonData.calendar.find(
            (item) =>
              item.date ===
              new Date(parseInt(z.getAttribute("data-unix")))
                .toISOString()
                .substring(0, 10)
          );
          let discountedPrice = 0;
          const discount_percentage = filteredData.discount_percentage;
          price = price / 1000;
          if (discount_percentage) {
            discountedPrice = price - (price * discount_percentage) / 100;
          }

          priceHandeler(z.querySelector("span"), "", price, discountedPrice);
        });

        // setTimeout(rentamoning, 2000);
      });
  } else {
    alert(messages.notSelectedDay);
  }
}

// this function is called when user select discount action
// there is a elemntor pop up which is wating for a element with class discount-submit to be clicked and then it shows a pop up
function discountBtnClicked() {
  let selected = document.querySelectorAll(".selected");
  if (selected.length > 0) {
    // this codes from here
    var dis_div = document.createElement("div");
    dis_div.style.display = "none";
    dis_div.className = "discount-submit-rebuild";
    document.body.appendChild(dis_div);
    dis_div.click();
    // to here open price popup
    var with_discount = ["jabama", "homsa", "otaghak"];
    document
      .querySelector("#popup_sumbit_discount")
      .addEventListener("click", async () => {
        const discount = document.querySelector("#form-field-name").value;
        const dates = document.querySelector("#form-field-dates").value;
        const price = document.querySelector(
          "#form-field-noDiscountPrice"
        ).value;
        document.querySelector(".response_status_pop a").click();
        if (activeWebsites) {
          setStyleToPending(
            activeWebsites.filter((item) => with_discount.includes(item))
          );
        } else {
          const activeWebsitesManual = await performAction("activeWebsites");
          setStyleToPending(
            activeWebsitesManual.filter((item) => with_discount.includes(item))
          );
        }
        const final_response = await performAction(
          "setDiscount",
          (days = dates.split(",")),
          price,
          discount
        );
        setStatusStyle(final_response.data);

        const calendar_data = localStorage.getItem("calendar_data");
        const jsonData = JSON.parse(calendar_data);

        selected.forEach((z) => {
          z.classList.remove("selected");
          z.classList.add("discounted-days");
          let discountedPrice = 0;
          const filteredData = jsonData.calendar.find(
            (item) =>
              item.date ===
              new Date(parseInt(z.getAttribute("data-unix")))
                .toISOString()
                .substring(0, 10)
          );
          let price2 = filteredData.price / 1000;
          if (price2) {
            discountedPrice = price2 - (price2 * discount) / 100;
          }
          priceHandeler(z.querySelector("span"), "", price2, discountedPrice);
        });
      });
  } else {
    alert(messages.notSelectedDay);
  }
}
// this function is called when block option is selected
// if there are selected days, it starts requesting for block to each website
async function blockBtnClicked() {
  // document.querySelector(".loading-overlay-calendar").style.display = "flex";
  console.log("got here ");
  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  let spans = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );

      spans.push(z.querySelector("span"));
    });
    var response_status = document.querySelector(".response_status");
    if (response_status) {
      document.querySelector(".response_status_pop a").click();
      setStyleToPending();
    }
    final_response = await performAction(
      "setBlock",
      selectedDate,
      (property_id = 39)
    );
    console.log("Response Data: ", final_response);
    status_responses = Object.values(final_response.status);
    console.log("status Response Data: ", status_responses);
    // console.log(spans);
    if (status_responses.every((rep) => rep === "succeed")) {
      setBlockHelper(spans);
    }
    setStatusStyle(final_response.status);
    console.log("GOT HERE", final_response);
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

// a function for changin display of an element
function setDisplay(selector, display) {
  document.querySelector(selector).style.display = display;
}

function setStyleToPending(websites = activeWebsites) {
  for (var website in websites) {
    var row_selector = `.website_row.${website}`;
    var status_selector = `.elementor-section.${website} .status_pending`;
    setDisplay(row_selector, "block");
    setDisplay(status_selector, "block");
  }
}

function setStatusStyle(responses) {
  const response_mapper = {
    succeed: ".status_true",
    failed: ".status_false",
    pending: ".status_pending",
  };

  for (var website in responses) {
    // var row_selector = `.website_row.${website}`;
    var status = responses[website];
    var status_selector = `.elementor-section.${website} ${response_mapper[status]}`;
    var pending_selector = `.elementor-section.${website} ${response_mapper.pending}`;

    // setDisplay(row_selector, "block");
    setDisplay(pending_selector, "none");
    setDisplay(status_selector, "block");
  }
}
// this function is called when unblock option is selected
// if there are selected days, it starts requesting for unblock to each website
async function unblockBtnClicked() {
  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  let gregorianSelectedDate = [];
  let spans = [];

  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
      gregorianSelectedDate.push(
        new Date(parseInt(z.getAttribute("data-unix")))
          .toISOString()
          .substring(0, 10)
      );
      spans.push(z.querySelector("span"));
    });
    var response_status = document.querySelector(".response_status");

    if (response_status) {
      document.querySelector(".response_status_pop a").click();
      setStyleToPending();
    }
    // adding api calls if user has registered in the website
    final_response = await performAction(
      "setUnblock",
      selectedDate,
      (property_id = 39)
    );
    status_responses = Object.values(final_response.status);
    if (status_responses.every((rep) => rep === "succeed")) {
      setAvailableHelper(spans, gregorianSelectedDate);
    }
    setStatusStyle(final_response.status);
    console.log("GOT HERE", final_response);
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}
async function checkAuthOnLoad() {
  const accessToken = getCookie("auth_token");
  const refreshToken = getCookie("refresh_token");

  if (!accessToken || !refreshToken) {
    return false;
  }

  const isAccessTokenValid = await verifyToken(accessToken, "access");
  if (!isAccessTokenValid) {
    const isRefreshTokenValid = await verifyToken(refreshToken, "refresh");
    if (!isRefreshTokenValid) {
      return false;
    } else {
      return false; // TODO : adding the refresh token handler
    }
  } else {
    return true;
  }
}

$(document).ready(function () {
  // price
  // this mutationobserver handels price pop up
  const priceTargetElementId = "elementor-popup-modal-16017";
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
          document.querySelector('input[name="form_fields[dates]"').value =
            selectedDate;
        }
      }
    }
  });

  priceObserver.observe(document.body, { childList: true, subtree: true });

  //

  // discount
  // this mutationobserver handels discount pop up
  const discountTargetElementId = "elementor-popup-modal-16027";
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
          document.querySelector('input[name="form_fields[dates]"').value =
            selectedDate;
          document.querySelector(
            'input[name="form_fields[noDiscountPrice]"'
          ).value = jabamaPrice[0];
        }
      }
    }
  });
  discountObserver.observe(document.body, { childList: true, subtree: true });

  //

  // pop up form submited
  // this mutationobserver handels rentamon login form
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

function check_is_valid(id, pop_up_id) {
  document.querySelector(id).addEventListener("click", function () {
    document.querySelector(`${pop_up_id} a`).click();
  });
}

// a function to make our code clean
function isActiveHandler(id, isRed) {
  if (isRed) {
    document.querySelector(`${id}`).style.display = "block";
    document.querySelector(`${id} div div div`).style.border =
      "4px #d71d1d solid";
    document.querySelector(`${id} div div div`).style.borderRadius = "5px";
    document.querySelector(`${id} div div div img`).style.filter =
      "grayscale(1)";
  } else if (isRed === false) {
    document.querySelector(`${id}`).style.display = "block";
    document.querySelector(`${id} div div div`).style.border =
      "4px #0c9d61 solid";
    document.querySelector(`${id} div div div`).style.borderRadius = "5px";
  }
}

// Function to get a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Function to perform the action
async function performAction(
  actionType,
  days,
  price = null,
  discount = null,
  property_id = 39
) {
  const authToken = getCookie("auth_token");
  if (!authToken) {
    throw new Error("No auth token found");
  }

  let url = "";
  let method = "POST";
  let corrected_days = [];
  days.forEach((day) => {
    const x = [];
    day.split("-").forEach((number_of_date) => {
      x.push(persianToInteger(number_of_date));
    });
    corrected_days.push(x.join("-"));
  });
  days = corrected_days;
  let data = { days, property_id };

  switch (actionType) {
    case "setPrice":
      url = "https://rentamon-api.liara.run/api/setprice";
      if (price === 0) throw new Error("Price is required for setPrice");
      data.price = price;
      break;
    case "setDiscount":
      url = "https://rentamon-api.liara.run/api/setdiscount";
      if (discount === null)
        throw new Error("Discount is required for setDiscount");
      data.discount = discount;
      break;
    case "setBlock":
      url = "https://rentamon-api.liara.run/api/setblock";
      data.requested_by = "user";
      data.request_for = "block";
      break;
    case "setReserve":
      url = "https://rentamon-api.liara.run/api/setblock";
      data.requested_by = "user";
      data.request_for = "reserve";
      break;
    case "setUnblock":
      url = "https://rentamon-api.liara.run/api/setunblock";
      break;
    case "getCalendar":
      url = "https://rentamon-api.liara.run/api/getcalendar";
      method = "GET";
      break;
    case "activeWebsites":
      url = "https://rentamon-api.liara.run/api/websites";
      method = "GET";
      break;
    default:
      throw new Error("Invalid action type");
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: method !== "GET" ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error performing action:", error);
    throw error;
  }
}

// for changing max date change value in maxDate: new persianDate
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
    maxDate: new persianDate([1403, 4, 31]),
    // maxDate: new persianDate().add("years", 1).month(2).endOf("month"),
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
