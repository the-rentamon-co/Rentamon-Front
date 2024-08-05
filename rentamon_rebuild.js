let apiHostMainUrl = "https://api-rentamon.liara.run";

// get prop_id from url for example:
// rentamon.com/panel?prop_id=1
const propertyIdFromQueryParams = new URL(
  window.location.href
).searchParams.get("prop_id");

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
    popup_id_selector: "#newwebdisconnected_jabama",
    popup_link_selector: "#newwebdisconnected_jabama a",
    icon_selector: "#newjabama_icon_connected",
  },
  jajiga: {
    popup_id_selector: "#newwebdisconnected_jajiga",
    popup_link_selector: "#newwebdisconnected_jajiga a",
    icon_selector: "#newjajiga_icon_connected",
  },
  shab: {
    popup_id_selector: "#newwebdisconnected_shab",
    popup_link_selector: "#newwebdisconnected_shab a",
    icon_selector: "#newshab_icon_connected",
  },
  mihmansho: {
    popup_id_selector: "#newwebdisconnected_mihmansho",
    popup_link_selector: "#newwebdisconnected_mihmansho a",
    icon_selector: "#newmihmansho_icon_connected",
  },
  homsa: {
    popup_id_selector: "#newwebdisconnected_homsa",
    popup_link_selector: "#newwebdisconnected_homsa a",
    icon_selector: "#newhomsa_icon_connected",
  },
  otaghak: {
    popup_id_selector: "#newwebdisconnected_otaghak",
    popup_link_selector: "#newwebdisconnected_otaghak a",
    icon_selector: "#newotaghak_icon_connected",
  },
  mizboon: {
    popup_id_selector: "#newwebdisconnected_mizboon",
    popup_link_selector: "#newwebdisconnected_mizboon a",
    icon_selector: "#newmizboon_icon_connected",
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

  // Split the date into parts
  const parts = persianString.split("-");
  // Convert each part from Persian numerals to Arabic numerals
  const convertedParts = parts.map((part) =>
    part
      .split("")
      .map((char) =>
        persianNumerals.includes(char) ? convertDigit(char) : char
      )
      .join("")
  );

  // Pad month and day parts with leading zeros if necessary
  const paddedParts = convertedParts.map((part, index) =>
    index === 0 ? part : part.padStart(2, "0")
  );

  return paddedParts.join("-");
}
// formater for credit
function formatPersianNumber(input) {
  // Check if the number is negative
  let isNegative = input.includes('-');
  
  // Remove any existing dashes or spaces
  input = input.replace(/[-\s]/g, '');

  // Insert the slashes and format the number
  let formattedNumber = input.replace(/\B(?=(\d{3})+(?!\d))/g, '/');

  // Add the dash and space at the beginning if the number was negative
  return isNegative ? `${formattedNumber} -` : formattedNumber;
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
      return "مهمانشو";
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
  const persianNumberWithCommas = (persianNum) =>
    persianNum
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/\B(?=(\d{3})+(?!\d))/g, "/")
      .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  if (status === "blocked") {
    element.parentElement.querySelector(".price").innerHTML = "";
    element.parentElement.classList.add("blocked-days");
    return;
  } else if (discounted_price) {
    if (discounted_price === main_price) {
      element.parentElement.querySelector(".price").innerHTML =
        persianNumberWithCommas(
          convertToPersianNumber(String(discounted_price))
        ).split(".")[0];
      element.parentElement.classList.remove("discounted-days");
    } else {
      element.parentElement.querySelector(".price").innerHTML =
        persianNumberWithCommas(
          convertToPersianNumber(String(discounted_price))
        ).split(".")[0];
      element.parentElement.classList.add("discounted-days");
    }
    return;
  } else if (main_price) {
    element.parentElement.querySelector(".price").innerHTML =
      persianNumberWithCommas(convertToPersianNumber(String(main_price))).split(
        "."
      )[0];
    element.parentElement.classList.remove("discounted-days");
    return;
  }
}

function setBlockHelper(elements) {
  elements.forEach((elm) => {
    let reserved = elm.parentElement.querySelector(".reserved");
    if (reserved.innerHTML === "" || reserved.innerHTML === "رزرو") {
      elm.parentElement.querySelector(".price").innerHTML = "";
      elm.parentElement.classList.remove("discounted-days");
      elm.parentElement.classList.remove("booked-days");
      elm.parentElement.classList.add("blocked-days");
      reserved.innerHTML = "";
    }
  });
}

function setAvailableHelper(elements, selectedDate = "") {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let reserved = element.parentElement.querySelector(".reserved");
    if (reserved.innerHTML === "" || reserved.innerHTML === "رزرو") {
      let day = "";
      if (selectedDate !== "") {
        day = selectedDate[i];
        const storedData = localStorage.getItem("calendar_data");
        const jsonData = JSON.parse(storedData);
        const filteredData = jsonData.calendar.find(
          (item) => item.date === day
        );
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
      reserved.innerHTML = "";
    }
  }
}

function setBookedkHelper(elements, selectedDate = true) {
  const persianNumberWithCommas = (persianNum) =>
    persianNum
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/\B(?=(\d{3})+(?!\d))/g, "/")
      .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  const handlePriceOfReservedDays = (element) => {
    let day = element.elem.parentElement.getAttribute("data-unix");
    day = new Date(parseInt(day)).toISOString().substring(0, 10);

    const storedData = localStorage.getItem("calendar_data");
    const jsonData = JSON.parse(storedData);
    const filteredData = jsonData.calendar.find((item) => item.date === day);
    day = filteredData;

    const discount_percentage = day.discount_percentage;
    const price = parseInt(day.price) / 1000 || null;
    const discountedPrice = price - (price * discount_percentage) / 100;
    if (discountedPrice)
      element.elem.parentElement.querySelector(".price").innerHTML =
        persianNumberWithCommas(
          convertToPersianNumber(String(discountedPrice))
        );
  };

  elements.forEach((elm) => {
    if (selectedDate) {
      handlePriceOfReservedDays(elm);
    }
    elm.elem.parentElement.classList.remove("discounted-days");
    elm.elem.parentElement.classList.add("booked-days");
    const persian_website = elm.website;
    elm.elem.parentElement.querySelector(".reserved").innerHTML =
      reservedViewer(elm.website);
    if (persian_website == "mihmansho")
      elm.elem.parentElement.querySelector(".reserved").style.fontSize = "14px";
  });
}

async function get_user_info() {
  const propertyId = new URL(window.location.href).searchParams.get("prop_id");

  const authToken = getCookie("auth_token");
  if (!authToken) {
    throw new Error("No auth token found");
  }
  const response = await fetch(
    `https://rentamon-api.liara.run/api/user_info?property_id=${propertyId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

function replace_user_info(user_info) {
  const image = document.querySelector("#profilepic div img");
  const username = document.querySelector("#username div h1");
  const creditdate = document.querySelector("#creditdate div h1");

  username.innerText =
  user_info.user_info.first_name + " " + user_info.user_info.last_name;
  let a = [];
  // const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  // const credit_gregorian_date = user_info.user_info.renewal_date.split("-");
  // credit_gregorian_date.forEach((number) => {
  //   a.push(number.replace(/\d/g, (digit) => persianDigits[digit]));
  // });
  if (user_info.user_info.balance_info){
    var balance = user_info.user_info.balance_info.balance;
  }
  else {
    balance = ' خطای سرور '
  }
  if (balance != "0") {
    balance = balance.slice(0, -1)
  }
  console.log(balance)
  balance = formatPersianNumber(balance)
  console.log(balance)
  balance = convertToPersianNumber(balance)
  console.log(balance)

  const renewal_date = a.join("/");
  creditdate.innerText = "  اعتبار: " + balance + " تومان";


  image.src = user_info.user_info.profile_pic_link;
  image.srcset = user_info.user_info.profile_pic_link;
}

function panelsDropdown(responseData) {
  var dropdownContent = document.getElementById("dropdown-content");
  var dropdown = document.getElementById("dropdown");
  var dropdownBtn = document.getElementById("dropdown-btn");
  var properties = responseData.properties;
  var defaultProperty = responseData.user_info.property_name;

  dropdownContent.innerHTML = "";

  if (properties.length === 1) {
    dropdownBtn.disabled = true;
    dropdownBtn.textContent = properties[0].property_name;
    dropdown.classList.remove("multiple-properties"); // Remove the class to hide the arrow
  } else {
    dropdown.classList.add("multiple-properties"); // Add the class to show the arrow
    properties.forEach(function (property) {
      var link = document.createElement("a");
      link.href = property.link;
      link.textContent = property.property_name;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = property.link;
      });
      dropdownContent.appendChild(link);

      // Set default selection
      if (property.property_name === defaultProperty) {
        dropdownBtn.textContent = property.property_name;
      }
    });
  }
}

// this is the main function that fetches data from websites based on calendar
async function rentamoning() {
  try {
    document.querySelector(".loading-overlay-calendar").style.display = "flex";
    document.querySelectorAll("form").forEach((form) =>
        form.removeEventListener("submit", rentamoning)
    );

    // Reset action inputs
    document.querySelectorAll('input[name="block"]').forEach((i) => (i.checked = false));
    let availableDays = [];

    // Select non-disabled days from the calendar
    const allTds = document.querySelectorAll(
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
        const days = document.querySelectorAll(
            ".datepicker-plot-area-inline-view .table-days td:not(.disabled) span:not(.other-month):not(.reserved):not(.price)"
        );
        const range = [
            new persianDate(parseInt(availableDays[0].getAttribute("data-unix"))).format("YYYY-MM-DD"),
            new persianDate(parseInt(availableDays[availableDays.length - 1].getAttribute("data-unix"))).format("YYYY-MM-DD"),
            new persianDate(parseInt(availableDays[availableDays.length - 1].getAttribute("data-unix"))).format("YYYY-MM-DD"),
        ];

        const authToken = getCookie("auth_token");
        if (!authToken) {
            throw new Error("No auth token found");
        }

        const headers = {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        };

        // Fetch user info and calendar data in parallel
        const [user_info, response] = await Promise.all([
            get_user_info(),
            fetch(
                `https://rentamon-api.liara.run/api/getcalendar?start_date=${range[0]}&end_date=${range[2]}&property_id=${propertyIdFromQueryParams}`,
                { method: "GET", headers: headers }
            )
        ]);

        replace_user_info(user_info);
        panelsDropdown(user_info);

        if (response.status !== 200) {
            throw new Error("Failed to fetch calendar data");
        }

        const result = await response.json();
        localStorage.setItem("calendar_data", JSON.stringify(result));
        const calendarData = result.calendar;
        const websites = user_info.websites
        websites.forEach((website)=> {
          const widget = websiteWidgets[website];
          isActiveHandler(widget.icon_selector, false);
    
        })
         

        websites_status_icons(activeWebsites);

        console.log(calendarData, "Fetched calendar data");

        availableDays.forEach((day) => {
            day.removeEventListener("click", handleDayClick);
            day.addEventListener("click", handleDayClick);
        });

        if (calendarData && calendarData.length > 0) {
            for (let i = 0; i < availableDays.length; i++) {
                const dayData = calendarData[i];
                const status = dayData.status;
                const price = dayData.price;
                const discountPercentage = dayData.discount_percentage;

                const origPrice = parseInt(price) / 1000 || null;
                let discountedPrice = 0;

                // Apply discount if available
                if (discountPercentage) {
                    discountedPrice = origPrice - (origPrice * discountPercentage) / 100;
                }

                switch (status) {
                    case "blocked":
                        setBlockHelper([days[i]]);
                        priceHandeler(days[i], status, origPrice, discountedPrice);
                        break;
                    case "reserved":
                        setBookedkHelper([{ elem: days[i], website: dayData.website }]);
                        priceHandeler(days[i], status, origPrice, discountedPrice);
                        break;
                    default:
                        setAvailableHelper([days[i]]);
                        priceHandeler(days[i], status, origPrice, discountedPrice);
                }
            }
        }
    }

    document.querySelector(".loading-overlay-calendar").style.display = "none";
  } catch (error) {
      console.error("An error occurred:", error.message);
      document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

function websites_status_icons(activeWebsites){
  for (let website in activeWebsites) {
    const widget = websiteWidgets[website];
    const status = activeWebsites[website];
    
    if (status === "succeed") {
        isActiveHandler(widget.icon_selector, false);
    } else {
        isActiveHandler(widget.icon_selector, true);
        check_is_valid(widget.icon_selector, widget.popup_id_selector);
    }
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
      (property_id = propertyIdFromQueryParams)
    );
    status_responses = Object.values(final_response.status);
    if (status_responses.includes("succeed")) {
      spans.forEach((z) => {
        setBookedkHelper([{ elem: z, website: "host" }]);
      });
    }
    setStatusStyle(final_response.status);
    websites_status_icons(final_response.status);
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
        let jsonData = JSON.parse(calendar_data);
        setStatusStyle(final_response.data);
        websites_status_icons(final_response.data);

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

          if (discount_percentage) {
            const price2 = price / 1000;
            discountedPrice = price2 - (price2 * discount_percentage) / 100;
          }
          filteredData.price = price;
          priceHandeler(
            z.querySelector("span"),
            "",
            price / 1000,
            discountedPrice
          );
        });
        jsonData = JSON.stringify(jsonData);
        localStorage.setItem("calendar_data", jsonData);
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
    var with_discount = ["jabama", "homsa", "otaghak", "shab", "jajiga"];
    document
      .querySelector("#popup_sumbit_discount")
      .addEventListener("click", async () => {
        const discount = document.querySelector("#discount_form_input").value;
        const dates = document.querySelector("#form-field-dates").value;
        const price = document.querySelector("#form-field-name").value;
        document.querySelector(".response_status_pop a").click();
        if (activeWebsites) {
          const activeWebsitesAsArray = Object.keys(activeWebsites)
            .filter((key) => with_discount.includes(key))
            .reduce((obj, key) => {
              obj[key] = activeWebsites[key];
              return obj;
            }, {});

          setStyleToPending(activeWebsitesAsArray);
        } else setStyleToPending();
        const final_response = await performAction(
          "setDiscount",
          (days = dates.split(",")),
          price,
          discount
        );
        setStatusStyle(final_response.data);
        websites_status_icons(final_response.data);

        const calendar_data = localStorage.getItem("calendar_data");
        let jsonData = JSON.parse(calendar_data);

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
          filteredData.discount_percentage = discount;
        });
        jsonData = JSON.stringify(jsonData);
        localStorage.setItem("calendar_data", jsonData);
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
      (property_id = propertyIdFromQueryParams)
    );
    console.log("Response Data: ", final_response);
    status_responses = Object.values(final_response.status);
    console.log("status Response Data: ", status_responses);
    // console.log(spans);
    if (status_responses.every((rep) => rep === "succeed")) {
      setBlockHelper(spans);
    }
    setStatusStyle(final_response.status);
    websites_status_icons(final_response.status);

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
      (property_id = propertyIdFromQueryParams)
    );
    status_responses = Object.values(final_response.status);
    if (status_responses.includes("succeed")) {
      setAvailableHelper(spans, gregorianSelectedDate);
    }
    setStatusStyle(final_response.status);
    websites_status_icons(final_response.status);

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
    document.querySelector(`${id} div div div`).style.borderRadius = "20px";
    document.querySelector(`${id} div div div img`).style.filter =
      "grayscale(1)";
  } else if (isRed === false) {
    document.querySelector(`${id}`).style.display = "block";
    document.querySelector(`${id} div div div`).style.border =
      "4px #0c9d61 solid";
    document.querySelector(`${id} div div div`).style.borderRadius = "20px";
    document.querySelector(`${id} div div div img`).style.filter =
      "grayscale(0)";
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
    data.property_id = propertyIdFromQueryParams;
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
  maxDate: new persianDate([1403, 7, 30]),
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
