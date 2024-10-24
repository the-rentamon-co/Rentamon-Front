let apiHostMainUrl = "https://api.rentamon.com";
let lastAction = {};
let popupsToOpen = [];
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

      // Check if the day is a weekend and apply red background if true
      isShamsiWeekend(element.parentElement, element.parentElement.getAttribute("data-unix"));
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

  const response = await fetch(
    `https://api.rentamon.com/api/user_info?property_id=${propertyId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Check if the response is 404
  if (response.status === 404) {
    window.location.href = "https://app.rentamon.com/register"; // Replace with your desired redirect URL
    return;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}


function replace_user_info(user_info) {
  console.log(user_info.user_info.phone_number)
  clarity('set', 'phone_number', user_info.user_info.phone_number);
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
    if (balance != "0") {
    balance = balance.slice(0, -1)
    }
    balance = formatPersianNumber(balance)
    balance = convertToPersianNumber(balance)
    balance = balance + " تومان";
  }
  else {
    balance = ' در حال بروزرسانی '
  }
  

  const renewal_date = a.join("/");
  creditdate.innerText = "  اعتبار: " + balance;


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


        const headers = {
            "Content-Type": "application/json",
        };

        // Fetch user info and calendar data in parallel
        const [user_info, response, websiteStatusesResponse] = await Promise.all([
          get_user_info(),
          fetch(
              `https://api.rentamon.com/api/getcalendar?start_date=${range[0]}&end_date=${range[2]}&property_id=${propertyIdFromQueryParams}`,
              { method: "GET",credentials: "include" ,headers: {"Content-Type": "application/json" } }
          ),
          fetch(
              `https://api.rentamon.com/api/website_statuses/?property_id=${propertyIdFromQueryParams}`,
              {
                  method: 'GET',
                  credentials: "include",
                  headers: { 
                    "Content-Type": "application/json" 
                  }
              }
          )
      ]);

        replace_user_info(user_info);
        panelsDropdown(user_info);

        if (response.status !== 200) {
            throw new Error("Failed to fetch calendar data");
        }
        holidayTimestamps = await getAllHolidayTimestampsShamsi(range[0],range[2]);

        const result = await response.json();
        localStorage.setItem("calendar_data", JSON.stringify(result));
        const calendarData = result.calendar;
        if (websiteStatusesResponse.status === 200) {
          const websiteStatuses = await websiteStatusesResponse.json();
          const statuses = websiteStatuses.status;
          
          // Apply styles based on website statuses without blocking the page load

          Object.keys(statuses).forEach((website) => {
            const widget = websiteWidgets[website];
            if (statuses[website] === true) {
              isActiveHandler(widget.icon_selector, false); // Active style
              check_is_valid(widget.icon_selector, widget.popup_id_selector);
            } else {
              isActiveHandler(widget.icon_selector, true); // Inactive style
              check_is_valid(widget.icon_selector, widget.popup_id_selector);
              popupsToOpen.push(widget.icon_selector); // Add to the list of popups to open later
            }
          });
        } else {
            throw new Error("Failed to fetch website statuses");
        }
        const active_websites = user_info.user_info.websites
        activeWebsites = {};
        active_websites.forEach(item => {
          activeWebsites[item] = true;
        });

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
                        console.log('these are days : ', days[i].parentElement)
                        // holidayHandler(days[i].parentElement,allHolidays)
                        setAvailableHelper([days[i]]);
                        priceHandeler(days[i], status, origPrice, discountedPrice);
                        isShamsiWeekend(days[i], days[i].parentElement.getAttribute("data-unix"));

                }
            }
        }
    }

  } catch (error) {
      console.error("An error occurred:", error.message);
  }
}

function websites_status_icons(activeWebsites){
  for (let website in activeWebsites) {
    const widget = websiteWidgets[website];
    const status = activeWebsites[website];
    console.log(status, widget, "here here")
    
    if (status === "succeed") {
        isActiveHandler(widget.icon_selector, false);
    } else {
        isActiveHandler(widget.icon_selector, true);
        check_is_valid(widget.icon_selector, widget.popup_id_selector);
    }
}
}

function websites_status_iconsV2(activeWebsites) {
  for (let website in activeWebsites) {
    const widget = websiteWidgets[website];
    const statusObj = activeWebsites[website];
    const status = statusObj.final_status;
    
    console.log(status, widget, "here here");
    
    if (status === true) {
      isActiveHandler(widget.icon_selector, false);
    } else {
      isActiveHandler(widget.icon_selector, true);
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
    status_responses = Object.values(final_response.data);
    console.log(status_responses)
    if (status_responses.some(response => response.final_status === true)) {
      spans.forEach((z) => {
        setBookedkHelper([{ elem: z, website: "host" }]);
      });
    }
    setStatusStyleV2(final_response.data);
    websites_status_iconsV2(final_response.data);
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
        setStatusStyleV2(final_response.data);
        websites_status_iconsV2(final_response.data);

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
        setStatusStyleV2(final_response.data);
        websites_status_iconsV2(final_response.data);

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
  console.log("Block button clicked");

  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  let spans = [];

  if (selected.length > 0) {
    // Apply the 'blocked-days' class to each selected day immediately to provide user feedback.
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
      spans.push(z.querySelector("span"));

      // Apply the "blocked-days" class to provide immediate feedback
      z.classList.add("blocked-days");
      z.querySelector(".price").innerHTML = ""; // Clear any existing price
      z.querySelector(".reserved").innerHTML = ""; // Clear any reserved indicator
    });

    var response_status = document.querySelector(".response_status");
    if (response_status) {
      document.querySelector(".response_status_pop a").click();
      setStyleToPending();
    }

    try {
      // Perform the blocking action on the server side.
      const final_response = await performAction(
        "setBlock",
        selectedDate,
        (property_id = propertyIdFromQueryParams)
      );

      console.log("Response Data: ", final_response);
      const status_responses = Object.values(final_response.data);
      console.log("Status Response Data: ", status_responses);

      // Verify the response to see if all blocks were successful.
      if (!status_responses.every((rep) => rep.final_status === true)) {
        // In case some days failed to block, revert the "blocked-days" styling.
        selected.forEach((z) => {
          const tdElement = z; // Assuming z is the <td> element
          if (!status_responses.find((res) => res.final_status === true)) {
            tdElement.classList.remove("blocked-days");
          }
        });
      }

      setStatusStyleV2(final_response.data);
      websites_status_iconsV2(final_response.data);

      console.log("Blocking action completed", final_response);
    } catch (error) {
      console.error("An error occurred during block operation:", error.message);

      // If there's an error, revert the blocked styles
      selected.forEach((z) => {
        const tdElement = z;
        tdElement.classList.remove("blocked-days");
      });
    }
  } else {
    alert(messages.notSelectedDay);
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
    var status_selector_false = `.elementor-section.${website} .status_false`;
    var status_selector_true = `.elementor-section.${website} .status_true`;    
    setDisplay(row_selector, "block");
    setDisplay(status_selector, "block");
    setDisplay(status_selector_false, "none");
    setDisplay(status_selector_true, "none");
    
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

function setStatusStyleV2(responses) {
  const response_mapper = {
    true: ".status_true",
    false: ".status_false",
    pending: ".status_pending"
  };

  for (var website in responses) {
    var status = responses[website].final_status;
    var status_selector = `.elementor-section.${website} ${response_mapper[status]}`;
    var pending_selector = `.elementor-section.${website} ${response_mapper.pending}`;
    
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
    status_responses = Object.values(final_response.data);
    if (status_responses.some(response => response.final_status === true)) {
      spans.forEach((z) => {
        setAvailableHelper(spans, gregorianSelectedDate);
      });
    }
    setStatusStyleV2(final_response.data);
    websites_status_iconsV2(final_response.data);

    console.log("GOT HERE", final_response);
  } else {
    alert(messages.notSelectedDay);
  }
}


 

$(document).ready(function () {

  // Add a slight delay to make sure all event listeners are fully initialized
  setTimeout(() => {
    popupsToOpen.forEach((selector) => {
      document.querySelector(selector).click();
    });
  }, 100); // Adding a delay of 100ms to ensure everything is set up

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
    setTimeout(() => {
      document.querySelector(`${pop_up_id} a`).click();
    }, 100); // Add a 100ms delay to ensure the popup is fully initialized
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



// Function to perform the action
async function performAction(
  actionType,
  days,
  price = null,
  discount = null,
  property_id = 39
) {
  

  let url = "";
  let method = "POST";
  let credentials ="include";
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
      url = "https://api.rentamon.com/api/setprice";
      if (price === 0) throw new Error("Price is required for setPrice");
      data.price = price;
      break;
    case "setDiscount":
      url = "https://api.rentamon.com/api/setdiscount";
      if (discount === null)
        throw new Error("Discount is required for setDiscount");
      data.discount = discount;
      break;
    case "setBlock":
      url = "https://api.rentamon.com/api/setblock";
      data.requested_by = "user";
      data.request_for = "block";
      break;
    case "setReserve":
      url = "https://api.rentamon.com/api/setblock";
      data.requested_by = "user";
      data.request_for = "reserve";
      break;
    case "setUnblock":
      url = "https://api.rentamon.com/api/setunblock";
      break;
    case "getCalendar":
      url = "https://api.rentamon.com/api/getcalendar";
      method = "GET";
      break;
    case "activeWebsites":
      url = "https://api.rentamon.com/api/websites";
      method = "GET";
      break;
    default:
      throw new Error("Invalid action type");
  }
  lastAction = {
    actionType,
    days,
    price,
    discount,
    property_id,
  };
  try {
    data.property_id = propertyIdFromQueryParams;
    const response = await fetch(url, {
      method: method,
      credentials: "include",  
      headers: {
        "Content-Type": "application/json",
      },
      body: method !== "GET" ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const anyFinalStatusFalse = Object.values(result.data).some(service => service.final_status === false);
    if (anyFinalStatusFalse){
      let retryBtn = document.getElementById('retry-btn');
      retryBtn.style.display = 'block'; // Make the button visible
    }
      
    return result;
  } catch (error) {
    console.error("Error performing action:", error);
    throw error;
  }
}
// Ensure the 'persian-date' library is included in your project.

async function getAllHolidayTimestampsShamsi(startDateShamsi, endDateShamsi) {
  try {
    // Fetch official holidays from the API
    const response = await fetch('https://ws.alibaba.ir/api/v2/basic-info/calendar-events');
    const data = await response.json();

    // Extract the Gregorian dates of the holidays
    const officialHolidaysGregorian = data.result.events.map((event) => event.gregorianDate);

    // Convert Gregorian holiday dates to Unix timestamps (at midnight UTC)
    const officialHolidayTimestamps = officialHolidaysGregorian.map((gregorianDateStr) => {
      const [year, month, day] = gregorianDateStr.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day)); // Months are zero-based
      return date.getTime();
    });

    // Initialize the list to store holiday timestamps
    const holidayTimestamps = [];

    // Create persianDate objects for start and end dates
    let currentDate = new persianDate(startDateShamsi);
    const endDate = new persianDate(endDateShamsi);

    // Iterate through each date in the range
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const unixTimestamp = currentDate.valueOf();

      // Check if the day is a Friday (weekend in Shamsi calendar)
      const isWeekend = currentDate.format('dddd') === 'جمعه';

      // Convert current Shamsi date to Gregorian date for comparison
      const gregorianDateStr = currentDate.toLocale('en').format('YYYY-MM-DD');

      // Convert Gregorian date string to Unix timestamp at midnight UTC
      const [year, month, day] = gregorianDateStr.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      const currentDateTimestamp = date.getTime();

      // Check if the current date is an official holiday
      const isOfficialHoliday = officialHolidayTimestamps.includes(currentDateTimestamp);

      // If it's a weekend or an official holiday, add the timestamp to the list
      if (isWeekend || isOfficialHoliday) {
        holidayTimestamps.push(unixTimestamp);
      }

      // Move to the next day
      currentDate = currentDate.add('1', 'day');
    }

    return holidayTimestamps;
  } catch (error) {
    console.error('Failed to fetch official holidays:', error);
    return [];
  }
}

function applyHolidayClass(element, holidayTimestamps) {
  // Get the Unix timestamp from the element's data-unix attribute
  const unixTimestamp = parseInt(element.getAttribute("data-unix"));


  // Normalize the timestamp to midnight UTC to match holidayTimestamps
  const dateObj = new Date(unixTimestamp);
  dateObj.setUTCHours(0, 0, 0, 0);
  const normalizedTimestamp = dateObj.getTime();
  // Check if the normalized timestamp is in the list of holiday timestamps

  if (holidayTimestamps.includes(normalizedTimestamp)) {
    // Add the 'weekends-holidays' CSS class to the element
    element.classList.add("weekends-holidays");
  }
}
function isShamsiWeekend(dayElement, timestamp) {
  // Convert the timestamp to a PersianDate object
  const pd = new persianDate(parseInt(timestamp));

  // Get the day of the week (0 = Saturday, 6 = Friday)
  const dayOfWeek = pd.day();

  // Check if it's Thursday (5) or Friday (6)
  if (dayOfWeek === 6 || dayOfWeek === 7) {
    // Set the background color to red for weekends
    dayElement.style.color = '#FF4E4E';
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
  maxDate: new persianDate([1403, 9, 30]),
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